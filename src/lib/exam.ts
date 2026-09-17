import { GENERAL, questionsForState } from './questions.ts';
import { sample, shuffle } from './random.ts';
import type { Question, State } from '../types.ts';

/** Official exam format: 33 questions, 60 minutes, 17 correct to pass. */
export const EXAM_GENERAL = 30;
export const EXAM_STATE = 3;
export const EXAM_TOTAL = EXAM_GENERAL + EXAM_STATE;
export const EXAM_PASS_MARK = 17;
export const EXAM_DURATION_MS = 60 * 60 * 1000;

/**
 * Draws an exam the way the real one is assembled: 30 of the 300 general
 * questions plus 3 of the 10 questions for the candidate's Bundesland.
 */
export function buildExam(state: State): Question[] {
  return shuffle([
    ...sample(GENERAL, EXAM_GENERAL),
    ...sample(questionsForState(state), EXAM_STATE),
  ]);
}

export const isPass = (correct: number) => correct >= EXAM_PASS_MARK;

export function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
