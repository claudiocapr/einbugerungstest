import { useCallback, useEffect, useState } from 'react';
import type { DrillResult, Flags, ItemProgress, Lang } from '../types.ts';
import { grade, type GradeExtra } from './srs.ts';

/**
 * Everything the app remembers about the learner, kept in localStorage on the
 * device first. The sync layer (src/sync/) mirrors it to Supabase for the
 * signed-in owner; nothing here depends on being online.
 */
const KEY = 'telc-b1.v1';

export interface Store {
  lang: Lang;
  theme: 'dark' | 'light' | 'system';
  /** Practice items per day, shown as the daily goal. */
  dailyGoal: number;
  /** Spaced-repetition state per item id ("vocab:wohnen-014", "sb1:sb1-03:4", ...). */
  progress: Record<string, ItemProgress>;
  /** Finished drill sets, mock exams and self-assessed tasks, newest first. */
  results: DrillResult[];
  /**
   * Free-form state a section keeps for itself (e.g. writing drafts), keyed by
   * section id. Read and write it with `useSection`. Synced like the rest.
   */
  sections: Record<string, unknown>;
  /** Features in a test phase, each off by default. */
  flags: Flags;
  /** Epoch ms of the last local change; the sync layer uses it. */
  updatedAt: number;
}

export const DAILY_GOAL_CHOICES = [10, 20, 30, 50];
export const MAX_RESULTS = 500;

export const EMPTY: Store = {
  lang: 'de',
  theme: 'system',
  dailyGoal: 20,
  progress: {},
  results: [],
  sections: {},
  flags: { neurofeedback: false },
  updatedAt: 0,
};

/** Defensive normalisation, so a damaged save or an older shape cannot crash the app. */
export function normaliseProgress(raw: unknown): Record<string, ItemProgress> {
  if (!raw || typeof raw !== 'object') return {};
  const out: Record<string, ItemProgress> = {};
  for (const [id, value] of Object.entries(raw as Record<string, ItemProgress>)) {
    if (!id || !value || typeof value !== 'object') continue;
    out[id] = {
      box: Number(value.box) || 0,
      due: Number(value.due) || 0,
      correct: Number(value.correct) || 0,
      wrong: Number(value.wrong) || 0,
      lastSeen: Number(value.lastSeen) || 0,
      history: Array.isArray(value.history) ? value.history : [],
    };
  }
  return out;
}

export function normaliseStore(raw: Partial<Store> | null | undefined): Store {
  if (!raw || typeof raw !== 'object') return { ...EMPTY };
  return {
    ...EMPTY,
    ...raw,
    lang: raw.lang === 'en' ? 'en' : 'de',
    theme: raw.theme === 'dark' || raw.theme === 'light' ? raw.theme : 'system',
    dailyGoal: Number(raw.dailyGoal) > 0 ? Number(raw.dailyGoal) : EMPTY.dailyGoal,
    progress: normaliseProgress(raw.progress),
    results: Array.isArray(raw.results) ? raw.results.slice(0, MAX_RESULTS) : [],
    sections: raw.sections && typeof raw.sections === 'object' ? raw.sections : {},
    flags: { neurofeedback: raw.flags?.neurofeedback === true },
    updatedAt: Number(raw.updatedAt) || 0,
  };
}

/**
 * Private windows and blocked site data make localStorage throw on access,
 * so every read and write is guarded and the app falls back to in-memory use.
 */
function read(): Store {
  try {
    const raw = globalThis.localStorage?.getItem(KEY);
    return raw ? normaliseStore(JSON.parse(raw)) : { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

function write(store: Store) {
  try {
    globalThis.localStorage?.setItem(KEY, JSON.stringify(store));
  } catch {
    /* storage unavailable - the session still works, it just will not persist */
  }
}

let current = read();
const listeners = new Set<(s: Store) => void>();

export const getStore = () => current;

/** A local change: stamps updatedAt, persists, notifies. */
export function setStore(update: (s: Store) => Store) {
  current = { ...update(current), updatedAt: Date.now() };
  write(current);
  listeners.forEach((l) => l(current));
}

/**
 * Replaces the whole store without stamping it as a local change. For the sync
 * layer, after merging what came from the server.
 */
export function replaceStore(next: Store) {
  current = normaliseStore(next);
  write(current);
  listeners.forEach((l) => l(current));
}

/** Listen to every change (local or replaced). Returns an unsubscribe function. */
export function subscribe(listener: (s: Store) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useStore(): [Store, (update: (s: Store) => Store) => void] {
  const [store, setLocal] = useState(current);
  useEffect(() => {
    listeners.add(setLocal);
    setLocal(current);
    return () => {
      listeners.delete(setLocal);
    };
  }, []);
  const update = useCallback((fn: (s: Store) => Store) => setStore(fn), []);
  return [store, update];
}

/**
 * Records one answer to a practice item and reschedules it. `extra` carries the
 * neurofeedback signals (confidence, response time, hold); it is ignored while
 * the neurofeedback flag is off, so the normal app is unchanged.
 */
export function recordItem(id: string, ok: boolean, chosen = -1, now = Date.now(), extra?: GradeExtra) {
  setStore((s) => {
    const signals = s.flags.neurofeedback ? extra : undefined;
    return { ...s, progress: { ...s.progress, [id]: grade(s.progress[id], ok, now, chosen, signals) } };
  });
}

/** Reads and sets one test-phase flag. */
export function useFlag(name: keyof Flags): [boolean, (on: boolean) => void] {
  const [store] = useStore();
  const set = useCallback((on: boolean) => setStore((s) => ({ ...s, flags: { ...s.flags, [name]: on } })), [name]);
  return [store.flags[name] === true, set];
}

export const flagOn = (name: keyof Flags) => current.flags[name] === true;

/** Records a finished drill set / exam / self-assessed task. */
export function recordResult(result: DrillResult) {
  setStore((s) => ({ ...s, results: [result, ...s.results].slice(0, MAX_RESULTS) }));
}

/** Persisted, synced state owned by one section. */
export function useSection<T>(key: string, initial: T): [T, (update: (prev: T) => T) => void] {
  const [store] = useStore();
  const value = (store.sections[key] as T | undefined) ?? initial;
  const set = useCallback(
    (fn: (prev: T) => T) =>
      setStore((s) => ({
        ...s,
        sections: { ...s.sections, [key]: fn((s.sections[key] as T | undefined) ?? initial) },
      })),
    // `initial` is a default, not a dependency worth re-binding on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );
  return [value, set];
}

export function resetProgress() {
  setStore((s) => ({ ...s, progress: {}, results: [], sections: {} }));
}

export const APP_ID = 'telc-b1';

export function exportStore(): string {
  return JSON.stringify({ app: APP_ID, version: 1, savedAt: Date.now(), store: current }, null, 2);
}

/** The name the saved file gets, so it is easy to find again and to delete. */
export function exportFilename(now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `telc-b1-fortschritt-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.json`;
}

/**
 * Reads back a file written by `exportStore`. Anything unreadable is rejected
 * without touching what is already saved, so a wrong file cannot wipe progress.
 * Files from the old Einbürgerungstest app are rejected: their progress is
 * keyed by catalogue question numbers that mean nothing here.
 */
export function importStore(text: string): boolean {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return false;
  }
  if (!parsed || typeof parsed !== 'object') return false;
  const outer = parsed as { app?: unknown; store?: unknown };
  if (outer.app !== APP_ID) return false;
  const raw = outer.store as Partial<Store> | undefined;
  if (!raw || typeof raw !== 'object' || typeof raw.progress !== 'object') return false;
  setStore(() => normaliseStore(raw));
  return true;
}
