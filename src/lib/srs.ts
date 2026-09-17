import type { QuestionProgress } from '../types.ts';

/**
 * Leitner scheduling. A correct answer promotes the question one box and
 * pushes it further into the future; a wrong answer sends it back to box 1,
 * due immediately. Box 5 counts as mastered.
 */
export const MAX_BOX = 5;

const DAY = 24 * 60 * 60 * 1000;
const INTERVALS = [0, 0, 1 * DAY, 3 * DAY, 7 * DAY, 21 * DAY];

export const emptyProgress = (): QuestionProgress => ({
  box: 0,
  due: 0,
  correct: 0,
  wrong: 0,
  lastSeen: 0,
});

export function grade(prev: QuestionProgress | undefined, correct: boolean, now = Date.now()): QuestionProgress {
  const p = prev ?? emptyProgress();
  const box = correct ? Math.min(p.box + 1, MAX_BOX) : 1;
  return {
    box,
    due: now + INTERVALS[box],
    correct: p.correct + (correct ? 1 : 0),
    wrong: p.wrong + (correct ? 0 : 1),
    lastSeen: now,
  };
}

export const isMastered = (p: QuestionProgress | undefined) => (p?.box ?? 0) >= MAX_BOX;

export const isDue = (p: QuestionProgress | undefined, now = Date.now()) =>
  p === undefined || p.box === 0 || p.due <= now;

/** Questions answered wrong at least once and not yet back in a high box. */
export const isWeak = (p: QuestionProgress | undefined) =>
  p !== undefined && p.wrong > 0 && p.box < MAX_BOX;

/**
 * Practice order: never-seen questions first, then the most overdue, so a
 * session always covers new ground before drilling what is already scheduled.
 */
export function practiceOrder(ids: number[], progress: Record<number, QuestionProgress>, now = Date.now()): number[] {
  return ids.slice().sort((a, b) => {
    const pa = progress[a];
    const pb = progress[b];
    const boxA = pa?.box ?? 0;
    const boxB = pb?.box ?? 0;
    if (boxA !== boxB) return boxA - boxB;
    return (pa?.due ?? 0) - (pb?.due ?? 0) || (now % 2 ? a - b : b - a);
  });
}
