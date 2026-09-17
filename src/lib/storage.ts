import { useCallback, useEffect, useState } from 'react';
import type { ExamRecord, Lang, QuestionProgress, State } from '../types.ts';

const KEY = 'einbuergerungstest.v1';

export interface Store {
  state: State | null;
  lang: Lang;
  theme: 'dark' | 'light' | 'system';
  progress: Record<number, QuestionProgress>;
  exams: ExamRecord[];
}

const EMPTY: Store = { state: null, lang: 'de', theme: 'system', progress: {}, exams: [] };

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
      progress: parsed.progress ?? {},
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
  return JSON.stringify(current, null, 2);
}
