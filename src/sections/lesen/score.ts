/**
 * Pure scoring helpers for Leseverstehen (and, via re-export, Sprachbausteine).
 * No React, no storage: the Modelltest can reuse them as they are.
 *
 * A learner's answers are kept as `(number | null)[]`, one entry per item:
 * the index of the chosen option/headline/ad/word, or null when unanswered.
 * Lesen Teil 3 encodes "x" (no matching ad) as `set.ads.length` (12), so the
 * same comparison works for every part.
 */
import type { Lesen1Set, Lesen2Set, Lesen3Set } from '../../content/types.ts';
import type { DrillResult } from '../../types.ts';

export type ScoredPart = 'lesen1' | 'lesen2' | 'lesen3' | 'sb1' | 'sb2';

/** telc points per part: Leseverstehen 3 × 25, Sprachbausteine 2 × 15. */
export const MAX_POINTS: Record<ScoredPart, number> = { lesen1: 25, lesen2: 25, lesen3: 25, sb1: 15, sb2: 15 };

/** Items per part in the exam. */
export const ITEM_COUNT: Record<ScoredPart, number> = { lesen1: 5, lesen2: 5, lesen3: 10, sb1: 10, sb2: 10 };

/** Task numbers as printed in the exam: Lesen 1–20, Sprachbausteine 21–40. */
export const FIRST_NUMBER: Record<ScoredPart, number> = { lesen1: 1, lesen2: 6, lesen3: 11, sb1: 21, sb2: 31 };

/** telc's pass mark for the written exam: 60 %. */
export const PASS_RATIO = 0.6;

export interface ItemOutcome {
  /** What the learner chose, or null when the item was left open (counts as wrong). */
  chosen: number | null;
  /** The correct choice. */
  key: number;
  ok: boolean;
}

export interface SetScore {
  items: ItemOutcome[];
  correct: number;
  total: number;
  /** telc points, proportional: correct / total × maxPoints. */
  points: number;
  maxPoints: number;
  /** At least 60 % of the points. */
  passed: boolean;
  /** Items left open. */
  unanswered: number;
}

/** Scores answers against keys. Missing or null answers count as wrong. */
export function scoreItems(
  keys: readonly number[],
  chosen: readonly (number | null | undefined)[],
  maxPoints: number,
): SetScore {
  const items: ItemOutcome[] = keys.map((key, i) => {
    const c = chosen[i];
    const pick = typeof c === 'number' && Number.isFinite(c) ? c : null;
    return { chosen: pick, key, ok: pick !== null && pick === key };
  });
  const correct = items.filter((i) => i.ok).length;
  const total = keys.length;
  const points = total ? Math.round(((correct * maxPoints) / total) * 100) / 100 : 0;
  return {
    items,
    correct,
    total,
    points,
    maxPoints,
    passed: total > 0 && points >= maxPoints * PASS_RATIO - 1e-9,
    unanswered: items.filter((i) => i.chosen === null).length,
  };
}

/** The "x" choice in Lesen Teil 3: one past the last ad. */
export const lesen3X = (set: Pick<Lesen3Set, 'ads'>) => set.ads.length;

export const lesen1Keys = (set: Lesen1Set) => set.texts.map((t) => t.answer);
export const lesen2Keys = (set: Lesen2Set) => set.items.map((i) => i.answer as number);
export const lesen3Keys = (set: Lesen3Set) => set.situations.map((s) => s.answer ?? lesen3X(set));

export const scoreLesen1 = (set: Lesen1Set, chosen: readonly (number | null)[]) =>
  scoreItems(lesen1Keys(set), chosen, MAX_POINTS.lesen1);
export const scoreLesen2 = (set: Lesen2Set, chosen: readonly (number | null)[]) =>
  scoreItems(lesen2Keys(set), chosen, MAX_POINTS.lesen2);
export const scoreLesen3 = (set: Lesen3Set, chosen: readonly (number | null)[]) =>
  scoreItems(lesen3Keys(set), chosen, MAX_POINTS.lesen3);

/** "a".."o" for option/headline/ad/word indices; "x" past the end when `xAt` is given. */
export function letter(index: number, xAt?: number): string {
  if (xAt !== undefined && index === xAt) return 'x';
  return String.fromCharCode(97 + index);
}

/** 17.5 → "17,5" (de) / "17.5" (en); whole numbers without decimals. */
export function formatPoints(points: number, lang: 'de' | 'en' = 'de'): string {
  const rounded = Math.round(points * 10) / 10;
  const s = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return lang === 'de' ? s.replace('.', ',') : s;
}

export interface BestResult {
  points: number;
  maxPoints: number;
  correct: number;
  total: number;
  /** How often the set was finished. */
  count: number;
}

/** Best finished attempt per set id for one section/part, from the stored results. */
export function bestBySet(results: readonly DrillResult[], section: string, part: string): Record<string, BestResult> {
  const out: Record<string, BestResult> = {};
  for (const r of results) {
    if (!r || r.section !== section || r.part !== part || !r.setId) continue;
    const points = typeof r.points === 'number' ? r.points : r.correct;
    const maxPoints = typeof r.maxPoints === 'number' ? r.maxPoints : r.total;
    const prev = out[r.setId];
    if (!prev) {
      out[r.setId] = { points, maxPoints, correct: r.correct, total: r.total, count: 1 };
    } else {
      prev.count += 1;
      if (points / (maxPoints || 1) > prev.points / (prev.maxPoints || 1)) {
        Object.assign(prev, { points, maxPoints, correct: r.correct, total: r.total });
      }
    }
  }
  return out;
}

/**
 * Puts `choice` on item `item` where each choice may be used only once (Lesen
 * Teil 1 headlines, Teil 3 ads, Sprachbausteine Teil 2 words): if another item
 * holds it, that item is cleared. `repeatable` (Teil 3's "x") may repeat.
 * Returns a new array.
 */
export function assignUnique(
  answers: readonly (number | null)[],
  item: number,
  choice: number | null,
  repeatable?: number,
): (number | null)[] {
  const next = answers.map((a, i) => (i !== item && choice !== null && choice !== repeatable && a === choice ? null : a));
  next[item] = choice;
  return next;
}

/** The set after `id` in `ids`, or undefined at the end. */
export function nextId(ids: readonly string[], id: string): string | undefined {
  const i = ids.indexOf(id);
  return i >= 0 && i + 1 < ids.length ? ids[i + 1] : undefined;
}
