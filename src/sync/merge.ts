import type { DrillResult, ItemProgress } from '../types.ts';
import { MAX_RESULTS, normaliseStore, type Store } from '../lib/storage.ts';

/**
 * Merging the progress of two devices. Pure, so it can be tested without a
 * browser or a server. One person, several devices: nothing is ever thrown
 * away that only one side knows about, and where both sides know something,
 * the more recent knowledge wins.
 */

const attempts = (p: ItemProgress) => p.correct + p.wrong;

/** The later `lastSeen` wins; on a tie the entry with more attempts; then the local one. */
export function mergeItem(local: ItemProgress | undefined, remote: ItemProgress | undefined): ItemProgress | undefined {
  if (!local) return remote;
  if (!remote) return local;
  if (remote.lastSeen !== local.lastSeen) return remote.lastSeen > local.lastSeen ? remote : local;
  return attempts(remote) > attempts(local) ? remote : local;
}

export const resultKey = (r: DrillResult) => `${r.startedAt}|${r.section}|${r.setId ?? ''}`;

const newest = (r: DrillResult) => Number(r.finishedAt) || Number(r.startedAt) || 0;

/** Union of both lists, one entry per startedAt+section+setId, newest first, capped. */
export function mergeResults(local: DrillResult[], remote: DrillResult[]): DrillResult[] {
  const seen = new Map<string, DrillResult>();
  for (const r of [...local, ...remote]) {
    if (!r || typeof r !== 'object') continue;
    const key = resultKey(r);
    if (!seen.has(key)) seen.set(key, r);
  }
  return [...seen.values()].sort((a, b) => newest(b) - newest(a)).slice(0, MAX_RESULTS);
}

/**
 * Merges two stores. Accepts anything for `remote` (it comes from the network)
 * and normalises both sides first, so a damaged row cannot crash the app.
 */
export function mergeStores(localRaw: Partial<Store> | null | undefined, remoteRaw: unknown): Store {
  const local = normaliseStore(localRaw);
  const remote = normaliseStore(remoteRaw as Partial<Store> | null | undefined);
  const remoteNewer = remote.updatedAt > local.updatedAt;
  const newer = remoteNewer ? remote : local;
  const older = remoteNewer ? local : remote;

  const progress: Record<string, ItemProgress> = {};
  for (const id of new Set([...Object.keys(local.progress), ...Object.keys(remote.progress)])) {
    const item = mergeItem(local.progress[id], remote.progress[id]);
    if (item) progress[id] = item;
  }

  // Section state is opaque to us: per key, the side whose store changed last.
  const sections: Record<string, unknown> = { ...older.sections, ...newer.sections };

  return {
    ...older,
    ...newer,
    lang: newer.lang,
    theme: newer.theme,
    dailyGoal: newer.dailyGoal,
    progress,
    results: mergeResults(local.results, remote.results),
    sections,
    updatedAt: Math.max(local.updatedAt, remote.updatedAt),
  };
}
