import { useCallback, useEffect, useState } from 'react';
import type { ExamRecord, Lang, QuestionProgress, State } from '../types.ts';

const KEY = 'einbuergerungstest.v1';

export interface Store {
  state: State | null;
  lang: Lang;
  theme: 'dark' | 'light' | 'system';
  /** Questions to answer per day, shown as the daily goal. */
  dailyGoal: number;
  progress: Record<number, QuestionProgress>;
  exams: ExamRecord[];
}

export const DAILY_GOAL_CHOICES = [10, 20, 30, 50];

const EMPTY: Store = { state: null, lang: 'de', theme: 'system', dailyGoal: 20, progress: {}, exams: [] };

/**
 * Progress saved before answer history existed has no `history` array. Those
 * entries are filled in from the counts that were kept, so an older store
 * still produces a sensible strength instead of reading as never answered.
 */
export function migrateProgress(raw: unknown): Record<number, QuestionProgress> {
  if (!raw || typeof raw !== 'object') return {};
  const out: Record<number, QuestionProgress> = {};
  for (const [key, value] of Object.entries(raw as Record<string, QuestionProgress>)) {
    const id = Number(key);
    if (!Number.isFinite(id) || !value || typeof value !== 'object') continue;
    const p: QuestionProgress = {
      box: Number(value.box) || 0,
      due: Number(value.due) || 0,
      correct: Number(value.correct) || 0,
      wrong: Number(value.wrong) || 0,
      lastSeen: Number(value.lastSeen) || 0,
      history: Array.isArray(value.history) ? value.history : [],
    };
    if (p.history.length === 0 && (p.correct > 0 || p.wrong > 0)) {
      // Reconstruct a plausible history: the box says the last answer was
      // right unless the question was knocked back to box 1 by a mistake.
      const lastOk = p.box > 1 || (p.box === 1 && p.wrong === 0);
      p.history = [{ at: p.lastSeen, chosen: -1, ok: lastOk }];
    }
    out[id] = p;
  }
  return out;
}

/**
 * Private windows and blocked site data make localStorage throw on access,
 * so every read and write is guarded and the app falls back to in-memory use.
 */
function read(): Store {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<Store>;
    return {
      ...EMPTY,
      ...parsed,
      dailyGoal: Number(parsed.dailyGoal) > 0 ? Number(parsed.dailyGoal) : EMPTY.dailyGoal,
      progress: migrateProgress(parsed.progress),
      exams: Array.isArray(parsed.exams) ? parsed.exams : [],
    };
  } catch {
    return EMPTY;
  }
}

function write(store: Store) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    /* storage unavailable - the session still works, it just will not persist */
  }
}

let current = read();
const listeners = new Set<(s: Store) => void>();

export function setStore(update: (s: Store) => Store) {
  current = update(current);
  write(current);
  listeners.forEach((l) => l(current));
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

export function resetProgress() {
  setStore((s) => ({ ...s, progress: {}, exams: [] }));
}

export function exportStore(): string {
  return JSON.stringify({ app: 'einbuergerungstest', version: 1, savedAt: Date.now(), store: current }, null, 2);
}

/** The name the saved file gets, so it is easy to find again and to delete. */
export function exportFilename(now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `einbuergerungstest-fortschritt-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.json`;
}

/**
 * Reads back a file written by `exportStore`. Anything unreadable is rejected
 * without touching what is already saved, so a wrong file cannot wipe progress.
 * Files written before the wrapper existed are accepted as a bare store too.
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
  const raw = (outer.app === 'einbuergerungstest' ? outer.store : parsed) as Partial<Store> | undefined;
  if (!raw || typeof raw !== 'object') return false;
  if (typeof raw.progress !== 'object' && !Array.isArray(raw.exams)) return false;

  setStore(() => ({
    ...EMPTY,
    ...raw,
    dailyGoal: Number(raw.dailyGoal) > 0 ? Number(raw.dailyGoal) : EMPTY.dailyGoal,
    progress: migrateProgress(raw.progress),
    exams: Array.isArray(raw.exams) ? raw.exams : [],
  }));
  return true;
}
