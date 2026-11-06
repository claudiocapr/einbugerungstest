/**
 * Pure scoring helpers for Sprachbausteine Teil 1 and 2. Dependency-free (the
 * generic parts live in ../lesen/score.ts), so the Modelltest can reuse them.
 */
import type { Sb1Set, Sb2Set } from '../../content/types.ts';
import { MAX_POINTS, assignUnique, scoreItems } from '../lesen/score.ts';

export { MAX_POINTS, scoreItems, formatPoints, letter, bestBySet, nextId, FIRST_NUMBER } from '../lesen/score.ts';
export type { SetScore, ItemOutcome, BestResult } from '../lesen/score.ts';

export const sb1Keys = (set: Sb1Set) => set.gaps.map((g) => g.answer as number);
export const sb2Keys = (set: Sb2Set) => set.gaps.map((g) => g.answer);

export const scoreSb1 = (set: Sb1Set, chosen: readonly (number | null)[]) => scoreItems(sb1Keys(set), chosen, MAX_POINTS.sb1);
export const scoreSb2 = (set: Sb2Set, chosen: readonly (number | null)[]) => scoreItems(sb2Keys(set), chosen, MAX_POINTS.sb2);

/** A gapped text split into literal pieces and gap numbers (1-based), in order. */
export type GapPiece = { kind: 'text'; text: string } | { kind: 'gap'; n: number };

/** Splits "… [1] … [2] …" into pieces; anything that is not a gap marker stays text. */
export function splitGaps(text: string): GapPiece[] {
  const out: GapPiece[] = [];
  const re = /\[(\d{1,2})\]/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push({ kind: 'text', text: text.slice(last, m.index) });
    out.push({ kind: 'gap', n: Number(m[1]) });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ kind: 'text', text: text.slice(last) });
  return out;
}

/** Teil 2: each word fits only once, so placing it elsewhere moves it. */
export const placeWord = (answers: readonly (number | null)[], gap: number, word: number | null) =>
  assignUnique(answers, gap, word);
