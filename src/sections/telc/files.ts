import { useCallback, useEffect, useRef, useState } from 'react';
import { getSupabase } from '../../sync/supabase.ts';
import { TELC_BUCKET } from '../../sync/config.ts';
import { parseKey, type AnswerKey } from './sheet.ts';

/**
 * Access to the private `telc` bucket. Storage policies let only accounts
 * listed in `telc_access` read it; everything is fetched through signed URLs
 * that expire after an hour and are renewed before that.
 */

export const SIGNED_TTL_S = 3600;
/** Renew signed URLs this long before they expire. */
const RENEW_AFTER_MS = (SIGNED_TTL_S - 10 * 60) * 1000;

export const KEY_PATH = 'uebungstest-1/key.json';

export interface TelcFile {
  path: string;
  name: string;
  folder: string;
  kind: 'pdf' | 'audio' | 'other';
  size: number | null;
}

export interface Folder {
  name: string;
  files: TelcFile[];
}

const kindOf = (name: string): TelcFile['kind'] =>
  /\.pdf$/i.test(name) ? 'pdf' : /\.(mp3|m4a|ogg|wav)$/i.test(name) ? 'audio' : 'other';

type Entry = { name: string; id: string | null; metadata: { size?: number } | null };

async function list(prefix: string): Promise<Entry[]> {
  const sb = await getSupabase();
  const { data, error } = await sb.storage
    .from(TELC_BUCKET)
    .list(prefix, { limit: 1000, sortBy: { column: 'name', order: 'asc' } });
  if (error) throw error;
  return (data ?? []) as Entry[];
}

/** Lists every top-level folder and its files (one level of subfolders is flattened in). */
export async function listLibrary(): Promise<Folder[]> {
  const root = await list('');
  const folders: Folder[] = [];
  for (const entry of root) {
    if (entry.id !== null) continue; // a file at the root
    const files: TelcFile[] = [];
    const walk = async (prefix: string, depth: number) => {
      for (const e of await list(prefix)) {
        const path = `${prefix}/${e.name}`;
        if (e.id === null) {
          if (depth < 1) await walk(path, depth + 1);
          continue;
        }
        if (e.name.startsWith('.') || e.name === 'key.json') continue;
        files.push({ path, name: e.name, folder: entry.name, kind: kindOf(e.name), size: e.metadata?.size ?? null });
      }
    };
    await walk(entry.name, 0);
    folders.push({ name: entry.name, files });
  }
  return folders;
}

export async function signUrls(paths: string[]): Promise<Record<string, string>> {
  if (paths.length === 0) return {};
  const sb = await getSupabase();
  const { data, error } = await sb.storage.from(TELC_BUCKET).createSignedUrls(paths, SIGNED_TTL_S);
  if (error) throw error;
  const out: Record<string, string> = {};
  for (const item of data ?? []) if (item.path && item.signedUrl) out[item.path] = item.signedUrl;
  return out;
}

/**
 * Signed URLs for a set of paths, renewed automatically before they expire.
 * `renew(path)` forces a fresh URL for one file (e.g. after an audio error).
 */
export function useSignedUrls(paths: string[]) {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [error, setError] = useState<unknown>(null);
  const signedAt = useRef(0);
  const joined = paths.join('\n');

  const refresh = useCallback(async () => {
    const list = joined ? joined.split('\n') : [];
    try {
      const next = await signUrls(list);
      signedAt.current = Date.now();
      setUrls(next);
      setError(null);
    } catch (err) {
      setError(err);
    }
  }, [joined]);

  useEffect(() => {
    void refresh();
    const timer = setInterval(() => {
      if (Date.now() - signedAt.current > RENEW_AFTER_MS) void refresh();
    }, 60_000);
    const onVisible = () => {
      if (document.visibilityState === 'visible' && Date.now() - signedAt.current > RENEW_AFTER_MS) void refresh();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refresh]);

  const renew = useCallback(async (path: string): Promise<string | null> => {
    try {
      const next = await signUrls([path]);
      if (next[path]) setUrls((u) => ({ ...u, [path]: next[path] }));
      return next[path] ?? null;
    } catch {
      return null;
    }
  }, []);

  return { urls, error, renew };
}

let keyCache: Promise<AnswerKey | null> | null = null;

/** The Übungstest 1 answer key from the private bucket, validated. Kept in memory only. */
export function loadKey(): Promise<AnswerKey | null> {
  if (!keyCache) {
    keyCache = (async () => {
      const sb = await getSupabase();
      const { data, error } = await sb.storage.from(TELC_BUCKET).download(KEY_PATH);
      if (error) throw error;
      return parseKey(JSON.parse(await data.text()));
    })();
    keyCache.catch(() => {
      keyCache = null;
    });
  }
  return keyCache;
}

const PRETTY: Record<string, { de: string; en: string }> = {
  'uebungstest-1': { de: 'Übungstest 1 (Zertifikat Deutsch B1)', en: 'Practice test 1 (Zertifikat Deutsch B1)' },
  pruefungstraining: { de: 'Prüfungstraining telc Deutsch B1', en: 'Exam training telc Deutsch B1' },
  'uebungstest-1.pdf': { de: 'Testheft mit Lösungen (PDF)', en: 'Test booklet with key (PDF)' },
  'uebungstest-1.mp3': { de: 'Hörverstehen (MP3)', en: 'Listening (MP3)' },
  'Hoertexte.pdf': { de: 'Hörtexte (PDF)', en: 'Transcripts (PDF)' },
  'Loesungen.pdf': { de: 'Lösungen (PDF)', en: 'Answer key (PDF)' },
};

export function prettyName(name: string, lang: 'de' | 'en'): string {
  if (PRETTY[name]) return PRETTY[name][lang];
  const track = /track[_ -]?(\d+)/i.exec(name);
  if (track) return `Track ${track[1].padStart(2, '0')}`;
  return name.replace(/\.[a-z0-9]+$/i, '').replace(/[_-]+/g, ' ');
}
