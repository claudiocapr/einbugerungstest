import { useSyncExternalStore } from 'react';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { getStore, replaceStore, subscribe, type Store } from '../lib/storage.ts';
import { logError } from '../lib/analytics.ts';
import { describeError, getSupabase, hasStoredSession } from './supabase.ts';
import { storeForSignIn } from './merge.ts';

/**
 * Offline-first progress sync for signed-in accounts.
 *
 * The device's localStorage is always the working copy; the `progress` row in
 * Supabase is a mirror. On start (and sign-in) the row is pulled and merged
 * with the local store (see merge.ts); afterwards every local change is pushed
 * about 3 seconds later. Before each push the row's `updated_at` is compared
 * with the one this device last saw: if another device wrote in between, its
 * data is merged in first, so nothing gets overwritten. Nothing here throws
 * or blocks the UI; failures only show up in the status.
 */

export type SyncState = 'signed-out' | 'starting' | 'syncing' | 'idle' | 'offline' | 'error';

export interface SyncStatus {
  state: SyncState;
  userId: string | null;
  email: string | null;
  /** Epoch ms of the last successful round trip. */
  lastSyncedAt: number | null;
  /** Local changes not yet on the server. */
  pending: boolean;
  /** Human-readable reason for state "error". */
  error: string | null;
}

interface Meta {
  userId: string | null;
  /** The server's updated_at as last seen by this device. */
  remoteUpdatedAt: string | null;
  /** store.updatedAt of the last version pushed (or merged) from this device. */
  pushedLocalAt: number;
  lastSyncedAt: number | null;
}

const META_KEY = 'telc-b1.sync';
const DEBOUNCE_MS = 3000;

function readMeta(): Meta {
  try {
    const raw = JSON.parse(globalThis.localStorage?.getItem(META_KEY) ?? 'null');
    if (raw && typeof raw === 'object') {
      return {
        userId: typeof raw.userId === 'string' ? raw.userId : null,
        remoteUpdatedAt: typeof raw.remoteUpdatedAt === 'string' ? raw.remoteUpdatedAt : null,
        pushedLocalAt: Number(raw.pushedLocalAt) || 0,
        lastSyncedAt: Number(raw.lastSyncedAt) || null,
      };
    }
  } catch {
    /* fall through */
  }
  return { userId: null, remoteUpdatedAt: null, pushedLocalAt: 0, lastSyncedAt: null };
}

function writeMeta(next: Meta) {
  meta = next;
  try {
    globalThis.localStorage?.setItem(META_KEY, JSON.stringify(next));
  } catch {
    /* not persisting only means a fuller merge next time */
  }
}

let meta = readMeta();

// ---------------------------------------------------------------- status

let status: SyncStatus = {
  state: hasStoredSession() ? 'starting' : 'signed-out',
  userId: null,
  email: null,
  lastSyncedAt: meta.lastSyncedAt,
  pending: false,
  error: null,
};
const statusListeners = new Set<() => void>();

function setStatus(patch: Partial<SyncStatus>) {
  status = { ...status, ...patch };
  statusListeners.forEach((l) => l());
}

export const getSyncStatus = () => status;

export function subscribeSync(listener: () => void): () => void {
  statusListeners.add(listener);
  return () => {
    statusListeners.delete(listener);
  };
}

/** The sync/auth status, re-rendering on every change. */
export function useSyncStatus(): SyncStatus {
  return useSyncExternalStore(subscribeSync, getSyncStatus, getSyncStatus);
}

// ---------------------------------------------------------------- engine

let user: { id: string; email: string | null } | null = null;
let unsubscribeStore: (() => void) | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
let running: Promise<void> | null = null;
let again = false;
let authWired = false;

const isOffline = () => typeof navigator !== 'undefined' && navigator.onLine === false;
const isNetworkError = (err: unknown) => /fetch|network|load failed|timeout/i.test(String((err as Error)?.message ?? err));
const dirty = (s: Store = getStore()) => s.updatedAt > meta.pushedLocalAt;

function onOnline() {
  if (user) void syncNow();
  else if (hasStoredSession()) void startSync();
}

function schedule() {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    void syncNow();
  }, DEBOUNCE_MS);
}

function begin(session: Session) {
  const next = { id: session.user.id, email: session.user.email ?? null };
  if (user?.id === next.id) return;
  stop();
  user = next;
  setStatus({ state: 'syncing', userId: next.id, email: next.email, error: null, pending: dirty() });
  unsubscribeStore = subscribe((s) => {
    if (!user || !dirty(s)) return;
    setStatus({ pending: true });
    schedule();
  });
  if (typeof window !== 'undefined') window.addEventListener('online', onOnline);
  void syncNow();
}

function stop() {
  user = null;
  unsubscribeStore?.();
  unsubscribeStore = null;
  if (timer) clearTimeout(timer);
  timer = null;
}

async function roundTrip(sb: SupabaseClient, uid: string) {
  const sameUser = meta.userId === uid;
  // Another account used this device before: switch to this account's progress, never mix them.
  const switched = meta.userId !== null && !sameUser;
  const head = await sb.from('progress').select('updated_at').eq('user_id', uid).maybeSingle();
  if (head.error) throw head.error;

  let merged = false;
  if (switched && !head.data) {
    replaceStore(storeForSignIn(getStore(), null, meta.userId, uid));
    merged = true;
  } else if (head.data && (!sameUser || head.data.updated_at !== meta.remoteUpdatedAt)) {
    // Another device wrote since we last looked (or this is a new sign-in here): take it in.
    const full = await sb.from('progress').select('data, updated_at').eq('user_id', uid).maybeSingle();
    if (full.error) throw full.error;
    if (full.data) {
      const local = getStore();
      const next = storeForSignIn(local, full.data.data, meta.userId, uid);
      if (JSON.stringify(next) !== JSON.stringify(local)) replaceStore(next);
      merged = true;
    }
  }

  const store = getStore();
  if (!head.data || merged || !sameUser || dirty(store)) {
    const res = await sb
      .from('progress')
      .upsert({ user_id: uid, data: store }, { onConflict: 'user_id' })
      .select('updated_at')
      .single();
    if (res.error) throw res.error;
    writeMeta({ userId: uid, remoteUpdatedAt: res.data.updated_at, pushedLocalAt: store.updatedAt, lastSyncedAt: Date.now() });
  } else {
    writeMeta({ ...meta, userId: uid, lastSyncedAt: Date.now() });
  }
}

/** Pulls, merges and pushes now. Resolves when done; never rejects. */
export function syncNow(): Promise<void> {
  if (running) {
    again = true;
    return running;
  }
  running = (async () => {
    do {
      again = false;
      const current = user;
      if (!current) return;
      if (isOffline()) {
        setStatus({ state: 'offline', pending: dirty() });
        return;
      }
      setStatus({ state: 'syncing', error: null });
      try {
        const sb = await getSupabase();
        await roundTrip(sb, current.id);
        if (user?.id !== current.id) return;
        setStatus({ state: 'idle', lastSyncedAt: meta.lastSyncedAt, pending: dirty(), error: null });
      } catch (err) {
        if (!isNetworkError(err)) logError(err, 'sync');
        setStatus({ state: isOffline() ? 'offline' : 'error', error: describeError(err, getStore().lang), pending: dirty() });
        return;
      }
    } while (again);
  })().finally(() => {
    running = null;
  });
  return running;
}

/**
 * Restores a stored session and starts syncing. Called at app start (only when
 * a session is stored, so supabase-js is not loaded otherwise) and after sign-in.
 */
export async function startSync(): Promise<void> {
  try {
    const sb = await getSupabase();
    if (!authWired) {
      authWired = true;
      sb.auth.onAuthStateChange((event, session) => {
        // Never await Supabase calls inside this callback (supabase-js can deadlock).
        setTimeout(() => {
          if (event === 'SIGNED_OUT' || !session) {
            stop();
            setStatus({ state: 'signed-out', userId: null, email: null, pending: false, error: null });
          } else {
            begin(session);
          }
        }, 0);
      });
      if (typeof window !== 'undefined') window.addEventListener('online', onOnline);
    }
    const { data, error } = await sb.auth.getSession();
    if (error) throw error;
    if (data.session) begin(data.session);
    else if (!user) setStatus({ state: 'signed-out', userId: null, email: null, pending: false });
  } catch (err) {
    setStatus({ state: isOffline() ? 'offline' : 'error', error: describeError(err, getStore().lang) });
  }
}

/** Signs in with e-mail and password. Returns an error message, or null on success. */
export async function signIn(email: string, password: string): Promise<string | null> {
  const lang = getStore().lang;
  try {
    const sb = await getSupabase();
    const { data, error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return describeError(error, lang);
    if (!authWired) await startSync();
    if (data.session) begin(data.session);
    return null;
  } catch (err) {
    return describeError(err, lang);
  }
}

/** Signs out on this device only. Local progress stays on the device. */
export async function signOut(): Promise<void> {
  if (dirty() && user && !isOffline()) await syncNow();
  stop();
  setStatus({ state: 'signed-out', userId: null, email: null, pending: false, error: null });
  try {
    const sb = await getSupabase();
    await sb.auth.signOut({ scope: 'local' });
  } catch {
    /* the local session is gone either way */
  }
}

/** The current session's user, or null. Loads supabase-js. */
export async function currentUser(): Promise<{ id: string; email: string | null } | null> {
  if (user) return user;
  if (!hasStoredSession()) return null;
  try {
    const sb = await getSupabase();
    const { data } = await sb.auth.getSession();
    return data.session ? { id: data.session.user.id, email: data.session.user.email ?? null } : null;
  } catch {
    return null;
  }
}
