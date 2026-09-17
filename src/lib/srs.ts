import type { Attempt, QuestionProgress, StrengthLevel } from '../types.ts';

/**
 * Leitner scheduling. A correct answer promotes the question one box and
 * pushes it further into the future; a wrong answer sends it back to box 1,
 * due immediately. Box 5 counts as mastered.
 */
export const MAX_BOX = 5;

const DAY = 24 * 60 * 60 * 1000;
const INTERVALS = [0, 0, 1 * DAY, 3 * DAY, 7 * DAY, 21 * DAY];

/** How many past answers are kept per question. */
export const HISTORY_LENGTH = 10;

export const intervalForBox = (box: number) => INTERVALS[Math.min(Math.max(box, 0), MAX_BOX)];

export const emptyProgress = (): QuestionProgress => ({
  box: 0,
  due: 0,
  correct: 0,
  wrong: 0,
  lastSeen: 0,
  history: [],
});

/** Older stores predate the history field, so never trust it to be there. */
export const historyOf = (p: QuestionProgress | undefined): Attempt[] =>
  Array.isArray(p?.history) ? p.history : [];

export function grade(
  prev: QuestionProgress | undefined,
  correct: boolean,
  now = Date.now(),
  chosen = -1,
): QuestionProgress {
  const p = prev ?? emptyProgress();
  const box = correct ? Math.min(p.box + 1, MAX_BOX) : 1;
  const attempt: Attempt = { at: now, chosen, ok: correct };
  return {
    box,
    due: now + INTERVALS[box],
    correct: p.correct + (correct ? 1 : 0),
    wrong: p.wrong + (correct ? 0 : 1),
    lastSeen: now,
    history: [attempt, ...historyOf(p)].slice(0, HISTORY_LENGTH),
  };
}

export const isMastered = (p: QuestionProgress | undefined) => (p?.box ?? 0) >= MAX_BOX;

export const isDue = (p: QuestionProgress | undefined, now = Date.now()) =>
  p === undefined || p.box === 0 || p.due <= now;

/**
 * How well a question is known, from 0 to 1.
 *
 * Two thirds of the score come from how the recent answers went, with the
 * newest answer weighing most, and one third from how far the question has
 * climbed the Leitner boxes. The result then decays once the question is
 * overdue, so a question you have not seen in a long time stops counting as
 * fully known even though you never got it wrong.
 */
export function strength(p: QuestionProgress | undefined, now = Date.now()): number {
  const history = historyOf(p);
  if (!p || history.length === 0) return 0;

  let weight = 1;
  let scored = 0;
  let total = 0;
  for (const attempt of history) {
    scored += attempt.ok ? weight : 0;
    total += weight;
    weight *= 0.7;
  }
  const recent = total > 0 ? scored / total : 0;
  const maturity = p.box / MAX_BOX;
  const raw = 0.65 * recent + 0.35 * maturity;

  const interval = intervalForBox(p.box);
  if (interval > 0 && now > p.due) {
    const overdue = Math.min((now - p.due) / interval, 1);
    return raw * (1 - 0.3 * overdue);
  }
  return raw;
}

const LEVEL_FLOORS: { level: StrengthLevel; min: number }[] = [
  { level: 'strong', min: 0.85 },
  { level: 'good', min: 0.6 },
  { level: 'shaky', min: 0.35 },
  { level: 'weak', min: 0 },
];

export function strengthLevel(p: QuestionProgress | undefined, now = Date.now()): StrengthLevel {
  if (historyOf(p).length === 0) return 'new';
  const s = strength(p, now);
  return LEVEL_FLOORS.find((l) => s >= l.min)!.level;
}

/** Questions that need work: answered at least once and not yet solid. */
export const isWeak = (p: QuestionProgress | undefined, now = Date.now()) => {
  const level = strengthLevel(p, now);
  return level === 'weak' || level === 'shaky';
};

/**
 * Practice order: never-seen questions first, then the weakest, then the most
 * overdue, so a session covers new ground before drilling what is scheduled.
 */
export function practiceOrder(ids: number[], progress: Record<number, QuestionProgress>, now = Date.now()): number[] {
  return ids
    .map((id) => {
      const p = progress[id];
      return {
        id,
        unseen: historyOf(p).length === 0 ? 0 : 1,
        strength: strength(p, now),
        due: p?.due ?? 0,
      };
    })
    .sort((a, b) => a.unseen - b.unseen || a.strength - b.strength || a.due - b.due || a.id - b.id)
    .map((x) => x.id);
}

/** Ids whose next repetition is due, weakest first. */
export function dueOrder(ids: number[], progress: Record<number, QuestionProgress>, now = Date.now()): number[] {
  return practiceOrder(ids.filter((id) => progress[id] && isDue(progress[id], now)), progress, now);
}
