import { setAnalyticsSink, type EventProps } from '../lib/analytics.ts';
import { APP_VERSION, SUPABASE_KEY, SUPABASE_URL } from './config.ts';

/**
 * Anonymous, first-party usage statistics and error logs, written straight
 * into this app's own Supabase tables `events` and `app_errors` (insert-only
 * for the public; only the owner can read them). No third-party service, no
 * cookies, no account link: the only identifier is a random install id that
 * lives in this browser's localStorage.
 *
 * Everything here is defensive: nothing throws, nothing blocks rendering, and
 * an opt-out (or the browser's Do Not Track) silences it completely.
 */

export const INSTALL_KEY = 'telc-b1.install';
export const OPT_KEY = 'telc-b1.analytics';
export const NOTICE_KEY = 'telc-b1.analytics-notice';
const SESSION_OPEN_KEY = 'telc-b1.opened';

export const MAX_PROP_KEYS = 12;
export const MAX_STRING = 100;
export const MAX_QUEUE = 200;
export const BATCH_SIZE = 20;
export const MAX_RETRIES = 5;
export const FLUSH_MS = 10_000;
export const MAX_ERRORS_PER_SESSION = 20;
/** keepalive requests may carry at most 64 KB; stay well below. */
const MAX_BODY = 48_000;

export type CleanProps = Record<string, string | number | boolean | null>;

// ---------------------------------------------------------------- pure helpers

const truncate = (s: string, n: number) => (s.length > n ? s.slice(0, n) : s);

/** Lower-case, only [a-z0-9_.-], at most 64 chars; null when nothing usable is left. */
export function sanitizeName(name: unknown): string | null {
  if (typeof name !== 'string') return null;
  const clean = truncate(name.toLowerCase().replace(/[^a-z0-9_.-]+/g, '_'), 64);
  return /^[a-z0-9_.-]+$/.test(clean) ? clean : null;
}

/**
 * Keeps only flat primitive values, truncates strings, caps the number of
 * keys, and masks anything that looks like an e-mail address.
 */
export function sanitizeProps(props: unknown): CleanProps {
  const out: CleanProps = {};
  if (!props || typeof props !== 'object' || Array.isArray(props)) return out;
  let n = 0;
  for (const [rawKey, value] of Object.entries(props as Record<string, unknown>)) {
    if (n >= MAX_PROP_KEYS) break;
    const key = truncate(rawKey.replace(/[^A-Za-z0-9_]+/g, '_'), 40);
    if (!key) continue;
    if (typeof value === 'string') out[key] = truncate(maskPii(value), MAX_STRING);
    else if (typeof value === 'number') {
      if (!Number.isFinite(value)) continue;
      out[key] = value;
    } else if (typeof value === 'boolean' || value === null) out[key] = value;
    else continue; // objects, arrays, functions, undefined, symbols, bigints
    n++;
  }
  return out;
}

/** Replaces e-mail addresses so they cannot end up in the logs by accident. */
export function maskPii(text: string): string {
  return text.replace(/[^\s@<>()"']+@[^\s@<>()"']+\.[A-Za-z]{2,}/g, '[email]');
}

/**
 * Whether analytics may send. An explicit choice in the app wins; without one,
 * the browser's Do Not Track setting counts as an opt-out.
 */
export function analyticsAllowed(stored: string | null | undefined, doNotTrack: string | null | undefined): boolean {
  if (stored === 'off') return false;
  if (stored === 'on') return true;
  return doNotTrack !== '1';
}

/** "#/lesen/teil1?x" -> "lesen/teil1" */
export function routePath(hash: string): string {
  return truncate(hash.replace(/^#\/?/, '').split('?')[0] || 'home', 100);
}

// ---------------------------------------------------------------- queue

export type Row = { table: 'events' | 'app_errors'; row: Record<string, unknown> };

export interface QueueOptions<T> {
  send: (batch: T[]) => Promise<boolean>;
  isOnline?: () => boolean;
  maxSize?: number;
  batchSize?: number;
  maxRetries?: number;
  /** Size of one item when serialised, to keep a request under the keepalive limit. */
  sizeOf?: (item: T) => number;
  maxBytes?: number;
}

/**
 * A small FIFO that sends in batches. Overflow drops the oldest items; a batch
 * that fails `maxRetries` times in a row (including attempts skipped because the
 * device was offline) is dropped, so the queue can never grow without bound.
 */
export class EventQueue<T> {
  private items: T[] = [];
  private failures = 0;
  private sending = false;
  dropped = 0;
  private readonly o: Required<QueueOptions<T>>;

  constructor(options: QueueOptions<T>) {
    this.o = {
      isOnline: () => true,
      maxSize: MAX_QUEUE,
      batchSize: BATCH_SIZE,
      maxRetries: MAX_RETRIES,
      sizeOf: (item) => JSON.stringify(item).length,
      maxBytes: MAX_BODY,
      ...options,
    };
  }

  get size() {
    return this.items.length;
  }

  push(item: T) {
    this.items.push(item);
    if (this.items.length > this.o.maxSize) {
      const excess = this.items.length - this.o.maxSize;
      this.items.splice(0, excess);
      this.dropped += excess;
    }
  }

  clear() {
    this.items = [];
    this.failures = 0;
  }

  /** True when a full batch is waiting. */
  get full() {
    return this.items.length >= this.o.batchSize;
  }

  private nextBatch(): T[] {
    const batch: T[] = [];
    let bytes = 0;
    for (const item of this.items) {
      if (batch.length >= this.o.batchSize) break;
      const size = this.o.sizeOf(item);
      if (batch.length > 0 && bytes + size > this.o.maxBytes) break;
      batch.push(item);
      bytes += size;
    }
    return batch;
  }

  private fail(batchLength: number) {
    this.failures++;
    if (this.failures >= this.o.maxRetries) {
      this.items.splice(0, batchLength);
      this.dropped += batchLength;
      this.failures = 0;
    }
  }

  /** Sends everything waiting, batch by batch. Never rejects. */
  async flush(): Promise<void> {
    if (this.sending) return;
    this.sending = true;
    try {
      while (this.items.length > 0) {
        const batch = this.nextBatch();
        if (!this.o.isOnline()) {
          this.fail(batch.length);
          return;
        }
        let ok = false;
        try {
          ok = await this.o.send(batch);
        } catch {
          ok = false;
        }
        if (!ok) {
          this.fail(batch.length);
          return;
        }
        this.failures = 0;
        // Remove exactly what was sent; pushes during the request stay queued.
        this.items.splice(0, batch.length);
      }
    } finally {
      this.sending = false;
    }
  }
}

// ---------------------------------------------------------------- the sink

export interface SinkDeps {
  queue: { push: (item: Row) => void; full: boolean; flush: () => Promise<void> };
  allowed: () => boolean;
  installId: () => string;
  path: () => string;
  userAgent: () => string;
  version?: string;
}

/** Turns track/error calls into rows; separate from the browser wiring so it can be tested. */
export function createSink(deps: SinkDeps) {
  const seenErrors = new Set<string>();
  let errorCount = 0;

  return {
    track(name: string, props?: EventProps) {
      if (!deps.allowed()) return;
      const clean = sanitizeName(name);
      if (!clean) return;
      deps.queue.push({
        table: 'events',
        row: {
          install_id: deps.installId(),
          name: clean,
          props: sanitizeProps(props),
          app_version: deps.version ?? APP_VERSION,
          path: deps.path(),
        },
      });
      if (deps.queue.full) void deps.queue.flush();
    },
    error(err: unknown, context?: string) {
      if (!deps.allowed()) return;
      const { message, stack } = describe(err);
      const ctx = truncate(maskPii(String(context ?? '')), 100);
      const key = `${message}|${ctx}`;
      if (seenErrors.has(key) || errorCount >= MAX_ERRORS_PER_SESSION) return;
      seenErrors.add(key);
      errorCount++;
      deps.queue.push({
        table: 'app_errors',
        row: {
          install_id: deps.installId(),
          message,
          stack,
          context: ctx || null,
          path: deps.path(),
          user_agent: truncate(deps.userAgent(), 300),
          app_version: deps.version ?? APP_VERSION,
        },
      });
    },
  };
}

function describe(err: unknown): { message: string; stack: string | null } {
  let message: string;
  let stack: string | null = null;
  if (err instanceof Error) {
    message = `${err.name}: ${err.message}`;
    stack = err.stack ?? null;
  } else if (err && typeof err === 'object' && 'message' in err) {
    message = String((err as { message: unknown }).message);
  } else {
    try {
      message = typeof err === 'string' ? err : JSON.stringify(err) ?? String(err);
    } catch {
      message = String(err);
    }
  }
  return {
    message: truncate(maskPii(message || 'Unknown error'), 500),
    stack: stack ? truncate(maskPii(stack), 4000) : null,
  };
}

// ---------------------------------------------------------------- browser wiring

function storageGet(store: 'local' | 'session', key: string): string | null {
  try {
    return (store === 'local' ? globalThis.localStorage : globalThis.sessionStorage)?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function storageSet(store: 'local' | 'session', key: string, value: string | null) {
  try {
    const s = store === 'local' ? globalThis.localStorage : globalThis.sessionStorage;
    if (value === null) s?.removeItem(key);
    else s?.setItem(key, value);
  } catch {
    /* ignore */
  }
}

const dnt = () =>
  typeof navigator !== 'undefined'
    ? (navigator as Navigator & { doNotTrack?: string | null }).doNotTrack ??
      (globalThis as { doNotTrack?: string }).doNotTrack ??
      null
    : null;

/** Whether this browser currently sends statistics. */
export function isAnalyticsEnabled(): boolean {
  return analyticsAllowed(storageGet('local', OPT_KEY), dnt());
}

export const doNotTrackSet = () => dnt() === '1';

const optListeners = new Set<() => void>();
export function subscribeAnalyticsSetting(l: () => void) {
  optListeners.add(l);
  return () => {
    optListeners.delete(l);
  };
}

let queue: EventQueue<Row> | null = null;

/** Turns statistics on or off for this browser; turning off discards anything queued. */
export function setAnalyticsEnabled(on: boolean) {
  storageSet('local', OPT_KEY, on ? 'on' : 'off');
  storageSet('local', NOTICE_KEY, '1');
  if (!on) queue?.clear();
  optListeners.forEach((l) => l());
}

let memoryId: string | null = null;
export function getInstallId(): string {
  let id = storageGet('local', INSTALL_KEY);
  if (id && /^[A-Za-z0-9-]{8,64}$/.test(id)) return id;
  id = memoryId ?? randomId();
  memoryId = id;
  storageSet('local', INSTALL_KEY, id);
  return id;
}

function randomId(): string {
  try {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  } catch {
    /* insecure context */
  }
  return `x${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
}

/** Posts rows to the REST API; each table gets its own request. */
async function sendRows(batch: Row[]): Promise<boolean> {
  const byTable = new Map<string, Record<string, unknown>[]>();
  for (const { table, row } of batch) {
    const list = byTable.get(table) ?? [];
    list.push(row);
    byTable.set(table, list);
  }
  for (const [table, rows] of byTable) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      keepalive: true,
      headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify(rows),
    });
    // 4xx other than rate limiting will never succeed: report success to drop it.
    if (!res.ok && (res.status >= 500 || res.status === 429)) return false;
  }
  return true;
}

let installed = false;

/**
 * Installs the sink, the global error handlers, the flush timer, and records
 * `app.open` once per browser session. Safe to call more than once.
 */
export function installAnalytics() {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  try {
    const q = new EventQueue<Row>({ send: sendRows, isOnline: () => navigator.onLine !== false });
    queue = q;
    const sink = createSink({
      queue: q,
      allowed: isAnalyticsEnabled,
      installId: getInstallId,
      path: () => routePath(window.location.hash),
      userAgent: () => navigator.userAgent || '',
    });
    setAnalyticsSink(sink);

    window.addEventListener('error', (e) => {
      sink.error(e.error ?? e.message, `window.onerror${e.filename ? ` ${e.filename.split('/').pop()}:${e.lineno}` : ''}`);
    });
    window.addEventListener('unhandledrejection', (e) => sink.error(e.reason, 'unhandledrejection'));

    setInterval(() => void q.flush(), FLUSH_MS);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') void q.flush();
    });
    window.addEventListener('online', () => void q.flush());

    if (!storageGet('session', SESSION_OPEN_KEY)) {
      storageSet('session', SESSION_OPEN_KEY, '1');
      const standalone =
        window.matchMedia?.('(display-mode: standalone)').matches ||
        (navigator as Navigator & { standalone?: boolean }).standalone === true;
      sink.track('app.open', { version: APP_VERSION, display: standalone ? 'standalone' : 'browser' });
    }
  } catch {
    /* analytics is optional */
  }
}
