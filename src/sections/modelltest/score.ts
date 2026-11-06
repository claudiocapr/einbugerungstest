/**
 * Scoring for the telc Deutsch B1 mock exam, computed from the content schemas
 * alone. Pure: no React, no storage, so it is unit-tested directly.
 *
 * Points per telc's published weighting:
 *   Leseverstehen   T1 5×5, T2 5×5, T3 10×2.5        = 75
 *   Sprachbausteine T1 10×1.5, T2 10×1.5             = 30
 *   Hörverstehen    T1 5×5, T2 10×2.5, T3 5×5        = 75
 *   Schriftlicher Ausdruck (3 criteria)              = 45
 *   Schriftliche Prüfung                             = 225
 *   Mündlicher Ausdruck T1 15, T2 30, T3 30          = 75
 *   Gesamt                                           = 300
 * Pass: at least 60 % in the written AND in the oral exam, separately.
 */
import type { DrillResult, ExamPart, Text2 } from '../../types.ts';
import type { Hoeren1Set, Hoeren2Set, Hoeren3Set, Lesen1Set, Lesen2Set, Lesen3Set, Sb1Set, Sb2Set } from '../../content/types.ts';
import { type Grade, isGrade, writingPoints } from '../schreiben/criteria.ts';

export { writingPoints };

/** The automatically scored parts. */
export type ObjPart = 'lesen1' | 'lesen2' | 'lesen3' | 'sb1' | 'sb2' | 'hoeren1' | 'hoeren2' | 'hoeren3';
export type SpeakPart = 'sprechen1' | 'sprechen2' | 'sprechen3';

export const OBJ_PARTS: ObjPart[] = ['lesen1', 'lesen2', 'lesen3', 'sb1', 'sb2', 'hoeren1', 'hoeren2', 'hoeren3'];
export const WRITTEN_PARTS: ExamPart[] = [...OBJ_PARTS, 'schreiben'];
export const ORAL_PARTS: SpeakPart[] = ['sprechen1', 'sprechen2', 'sprechen3'];

export const ITEM_COUNT: Record<ObjPart, number> = {
  lesen1: 5, lesen2: 5, lesen3: 10, sb1: 10, sb2: 10, hoeren1: 5, hoeren2: 10, hoeren3: 5,
};

export const ITEM_POINTS: Record<ObjPart, number> = {
  lesen1: 5, lesen2: 5, lesen3: 2.5, sb1: 1.5, sb2: 1.5, hoeren1: 5, hoeren2: 2.5, hoeren3: 5,
};

export const PART_MAX: Record<ExamPart, number> = {
  lesen1: 25, lesen2: 25, lesen3: 25, sb1: 15, sb2: 15, hoeren1: 25, hoeren2: 25, hoeren3: 25,
  schreiben: 45, sprechen1: 15, sprechen2: 30, sprechen3: 30,
};

export const WRITTEN_MAX = 225;
export const ORAL_MAX = 75;
export const TOTAL_MAX = 300;
export const PASS_SHARE = 0.6;
export const PASS_WRITTEN = WRITTEN_MAX * PASS_SHARE; // 135
export const PASS_ORAL = ORAL_MAX * PASS_SHARE; // 45

/** First exam item number of each part (Lesen 1–20, SB 21–40, Hören 41–60). */
export const FIRST_NUMBER: Record<ObjPart, number> = {
  lesen1: 1, lesen2: 6, lesen3: 11, sb1: 21, sb2: 31, hoeren1: 41, hoeren2: 46, hoeren3: 56,
};

export const PART_LABEL: Record<ExamPart, Text2> = {
  lesen1: { de: 'Lesen Teil 1', en: 'Reading part 1' },
  lesen2: { de: 'Lesen Teil 2', en: 'Reading part 2' },
  lesen3: { de: 'Lesen Teil 3', en: 'Reading part 3' },
  sb1: { de: 'Sprachbausteine Teil 1', en: 'Language elements part 1' },
  sb2: { de: 'Sprachbausteine Teil 2', en: 'Language elements part 2' },
  hoeren1: { de: 'Hören Teil 1', en: 'Listening part 1' },
  hoeren2: { de: 'Hören Teil 2', en: 'Listening part 2' },
  hoeren3: { de: 'Hören Teil 3', en: 'Listening part 3' },
  schreiben: { de: 'Schreiben', en: 'Writing' },
  sprechen1: { de: 'Sprechen Teil 1', en: 'Speaking part 1' },
  sprechen2: { de: 'Sprechen Teil 2', en: 'Speaking part 2' },
  sprechen3: { de: 'Sprechen Teil 3', en: 'Speaking part 3' },
};

/** Where to practise a part. */
export const PART_SECTION: Record<ExamPart, string> = {
  lesen1: 'lesen', lesen2: 'lesen', lesen3: 'lesen',
  sb1: 'sprachbausteine', sb2: 'sprachbausteine',
  hoeren1: 'hoeren', hoeren2: 'hoeren', hoeren3: 'hoeren',
  schreiben: 'schreiben',
  sprechen1: 'sprechen', sprechen2: 'sprechen', sprechen3: 'sprechen',
};

export type ObjSet = Lesen1Set | Lesen2Set | Lesen3Set | Sb1Set | Sb2Set | Hoeren1Set | Hoeren2Set | Hoeren3Set;
export interface ObjSetByPart {
  lesen1: Lesen1Set; lesen2: Lesen2Set; lesen3: Lesen3Set; sb1: Sb1Set; sb2: Sb2Set;
  hoeren1: Hoeren1Set; hoeren2: Hoeren2Set; hoeren3: Hoeren3Set;
}

/** Answers are option indexes. Hören: 0 = richtig, 1 = falsch. Lesen 3: `ads.length` stands for "x". */
export type Answer = number | null;

export const RICHTIG = 0;
export const FALSCH = 1;
export const rfIndex = (answer: boolean) => (answer ? RICHTIG : FALSCH);
/** The index that stands for "x" (no matching ad) in Lesen Teil 3. */
export const lesen3X = (set: Lesen3Set) => set.ads.length;

/** The answer key of a set, as option indexes in the same encoding as `Answer`. */
export function answerKey<P extends ObjPart>(part: P, set: ObjSetByPart[P]): number[] {
  switch (part) {
    case 'lesen1':
      return (set as Lesen1Set).texts.map((t) => t.answer);
    case 'lesen2':
      return (set as Lesen2Set).items.map((i) => i.answer);
    case 'lesen3': {
      const s = set as Lesen3Set;
      return s.situations.map((x) => (x.answer === null ? lesen3X(s) : x.answer));
    }
    case 'sb1':
      return (set as Sb1Set).gaps.map((g) => g.answer);
    case 'sb2':
      return (set as Sb2Set).gaps.map((g) => g.answer);
    case 'hoeren1':
    case 'hoeren3':
      return (set as Hoeren1Set | Hoeren3Set).items.map((i) => rfIndex(i.item.answer));
    case 'hoeren2':
      return (set as Hoeren2Set).items.map((i) => rfIndex(i.answer));
    default:
      return [];
  }
}

/** Per-item correctness; unanswered items are wrong. */
export function markPart<P extends ObjPart>(part: P, set: ObjSetByPart[P], answers: readonly Answer[]): boolean[] {
  return answerKey(part, set).map((key, i) => answers[i] !== null && answers[i] !== undefined && answers[i] === key);
}

/** telc points for a number of correct items, capped at the part's item count. */
export function partPoints(part: ObjPart, correct: number): number {
  const n = Math.max(0, Math.min(Math.floor(correct), ITEM_COUNT[part]));
  return n * ITEM_POINTS[part];
}

/* ------------------------------------------------------------------ Sprechen */

/**
 * Speaking: four criteria per part (Ausdrucksfähigkeit, Aufgabenbewältigung,
 * Formale Richtigkeit, Aussprache/Intonation). Points per A/B/C/D for Teil 1;
 * Teil 2 and 3 count double.
 */
export const SPEAKING_POINTS_T1: [number, number, number, number][] = [
  [4, 3, 1, 0],
  [4, 3, 1, 0],
  [4, 3, 1, 0],
  [3, 2, 1, 0],
];

export function speakingPoints(teil: 1 | 2 | 3, grades: readonly (Grade | null | undefined)[]): number {
  const factor = teil === 1 ? 1 : 2;
  let sum = 0;
  SPEAKING_POINTS_T1.forEach((row, i) => {
    const g = grades[i];
    sum += isGrade(g) ? row[g] * factor : 0;
  });
  return sum;
}

/* --------------------------------------------------------------- Mock total */

export interface PartScore {
  part: ExamPart;
  points: number;
  max: number;
}

export type GradeLabel = 'sehr gut' | 'gut' | 'befriedigend' | 'ausreichend' | 'nicht bestanden';

/** telc's grade bands for the total out of 300, once both parts are passed. */
export function gradeFor(total: number): GradeLabel {
  if (total >= 270) return 'sehr gut';
  if (total >= 240) return 'gut';
  if (total >= 210) return 'befriedigend';
  if (total >= 180) return 'ausreichend';
  return 'nicht bestanden';
}

export const GRADE_TEXT: Record<GradeLabel, Text2> = {
  'sehr gut': { de: 'sehr gut', en: 'very good' },
  gut: { de: 'gut', en: 'good' },
  befriedigend: { de: 'befriedigend', en: 'satisfactory' },
  ausreichend: { de: 'ausreichend', en: 'sufficient' },
  'nicht bestanden': { de: 'nicht bestanden', en: 'not passed' },
};

export interface MockScore {
  parts: PartScore[];
  written: number;
  /** Written points available in this mock (225 unless content was missing). */
  writtenMax: number;
  writtenPassed: boolean;
  /** Null when the oral part was skipped. */
  oral: number | null;
  oralMax: number;
  oralPassed: boolean | null;
  /** Written + oral, scaled to 300 if some content was missing; null without the oral part. */
  total: number | null;
  /** Both parts passed. Null while the oral part is open. */
  passed: boolean | null;
  /** Only when both parts were taken. */
  grade: GradeLabel | null;
  /** False when a part had no content and its points could not be earned. */
  complete: boolean;
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

/**
 * Totals a mock. `parts` holds what was taken; written parts missing from it
 * (no content yet) are left out of the maximum, and the 60 % mark is applied
 * to what was available. With all content present this is exactly telc's rule
 * (135 of 225, 45 of 75). Oral parts absent from `parts` mean "not taken".
 */
export function scoreMock(parts: PartScore[]): MockScore {
  const written = parts.filter((p) => WRITTEN_PARTS.includes(p.part));
  const oral = parts.filter((p) => (ORAL_PARTS as ExamPart[]).includes(p.part));
  const writtenPoints = sum(written.map((p) => p.points));
  const writtenMax = sum(written.map((p) => p.max));
  const writtenPassed = writtenMax > 0 && writtenPoints >= writtenMax * PASS_SHARE;
  const complete = writtenMax === WRITTEN_MAX;

  if (oral.length === 0) {
    return {
      parts, written: writtenPoints, writtenMax, writtenPassed,
      oral: null, oralMax: ORAL_MAX, oralPassed: null,
      total: null, passed: writtenPassed ? null : false, grade: null, complete,
    };
  }

  const oralPoints = sum(oral.map((p) => p.points));
  const oralMax = sum(oral.map((p) => p.max));
  const oralPassed = oralMax > 0 && oralPoints >= oralMax * PASS_SHARE;
  const raw = writtenPoints + oralPoints;
  const max = writtenMax + oralMax;
  const total = max === TOTAL_MAX ? raw : max > 0 ? Math.round((raw / max) * TOTAL_MAX * 2) / 2 : 0;
  const passed = writtenPassed && oralPassed;
  return {
    parts, written: writtenPoints, writtenMax, writtenPassed,
    oral: oralPoints, oralMax, oralPassed,
    total, passed, grade: passed ? gradeFor(total) : 'nicht bestanden',
    complete: complete && oralMax === ORAL_MAX,
  };
}

/** The part that cost the most points, relative to what it is worth. Ties go to the bigger part. */
export function weakestPart(parts: PartScore[]): PartScore | null {
  const scored = parts.filter((p) => p.max > 0);
  if (scored.length === 0) return null;
  return scored.reduce((worst, p) => {
    const a = p.points / p.max;
    const b = worst.points / worst.max;
    return a < b || (a === b && p.max > worst.max) ? p : worst;
  });
}

/* --------------------------------------------------------- Pass prediction */

export interface PartEstimate {
  part: ExamPart;
  max: number;
  /** Mean share of points over the recent results, or null without data. */
  ratio: number | null;
  expected: number | null;
  samples: number;
}

export type PredictionLabel = 'good' | 'close' | 'notyet' | 'unknown';

export interface Prediction {
  parts: PartEstimate[];
  written: { expected: number; max: number; known: number; ratio: number | null; label: PredictionLabel };
  oral: { expected: number; max: number; known: number; ratio: number | null; label: PredictionLabel };
  /** Worst of the two, ignoring an oral part without data. */
  label: PredictionLabel;
  /** The known part that loses the most points. */
  drag: PartEstimate | null;
}

/** Share of points of one result, or null when it carries nothing usable. */
export function resultRatio(r: DrillResult): number | null {
  if (typeof r.points === 'number' && typeof r.maxPoints === 'number' && r.maxPoints > 0) {
    return Math.max(0, Math.min(1, r.points / r.maxPoints));
  }
  if (r.total > 0) return Math.max(0, Math.min(1, r.correct / r.total));
  return null;
}

const labelFor = (ratio: number | null, known: number, needed: number): PredictionLabel => {
  if (ratio === null || known < needed) return 'unknown';
  if (ratio >= 0.7) return 'good';
  if (ratio >= PASS_SHARE) return 'close';
  return 'notyet';
};

/**
 * Estimates the mock result from the latest results per part (any section,
 * results newest first). Parts without data take the average of the known
 * parts of the same block, so the total stays on the 225 / 75 scale.
 * At least three written parts must have data before a label is given.
 */
export function predictPass(results: readonly DrillResult[], perPart = 3): Prediction {
  const byPart = new Map<ExamPart, number[]>();
  for (const r of results) {
    if (!r.part || !(r.part in PART_MAX)) continue;
    const ratio = resultRatio(r);
    if (ratio === null) continue;
    const list = byPart.get(r.part) ?? [];
    if (list.length < perPart) list.push(ratio);
    byPart.set(r.part, list);
  }

  const estimate = (part: ExamPart): PartEstimate => {
    const list = byPart.get(part) ?? [];
    const ratio = list.length ? sum(list) / list.length : null;
    return { part, max: PART_MAX[part], ratio, expected: ratio === null ? null : ratio * PART_MAX[part], samples: list.length };
  };

  const block = (parts: ExamPart[], needed: number) => {
    const est = parts.map(estimate);
    const known = est.filter((e) => e.ratio !== null);
    const max = sum(est.map((e) => e.max));
    if (known.length === 0) return { est, summary: { expected: 0, max, known: 0, ratio: null, label: 'unknown' as PredictionLabel } };
    const knownMax = sum(known.map((e) => e.max));
    const knownPoints = sum(known.map((e) => e.expected ?? 0));
    const avg = knownPoints / knownMax;
    const expected = knownPoints + (max - knownMax) * avg;
    const ratio = expected / max;
    return { est, summary: { expected, max, known: known.length, ratio, label: labelFor(ratio, known.length, needed) } };
  };

  const w = block(WRITTEN_PARTS, 3);
  const o = block(ORAL_PARTS, 1);
  const order: PredictionLabel[] = ['notyet', 'close', 'good'];
  let label: PredictionLabel = w.summary.label;
  if (label !== 'unknown' && o.summary.label !== 'unknown') {
    label = order[Math.min(order.indexOf(label), order.indexOf(o.summary.label))];
  }
  const parts = [...w.est, ...o.est];
  const known = parts.filter((p) => p.expected !== null);
  const drag = known.length
    ? known.reduce((a, b) => (b.max - (b.expected ?? 0) > a.max - (a.expected ?? 0) ? b : a))
    : null;
  return { parts, written: w.summary, oral: o.summary, label, drag };
}
