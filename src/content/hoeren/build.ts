/**
 * Small builders that keep the listening and speaking scripts readable.
 *
 * Voices: "a" and "b" are the two speakers of a dialogue (or the one speaker
 * of a monologue), "n" is the narrator / announcer / examiner.
 *
 * Explanations quote the relevant line in German quotation marks („…“). The
 * quote is an exact excerpt of a script line, so the results screen can
 * highlight that line in the transcript (and the tests check it).
 */
import type { Line, RfItem } from '../types.ts';

export const a = (text: string): Line => ({ voice: 'a', text });
export const b = (text: string): Line => ({ voice: 'b', text });
export const n = (text: string): Line => ({ voice: 'n', text });

export const rf = (statement: string, answer: boolean, de: string, en: string): RfItem => ({
  statement,
  answer,
  explanation: { de, en },
});
