/**
 * Builders for Sprachbausteine sets: answers are written as the correct word
 * itself and turned into indices here, so a key cannot drift from its options.
 */
import type { Sb1Set, Sb2Set, TopicId } from '../types.ts';
import { ex, pick } from '../lesen/helpers.ts';

type Sb1Gap = Sb1Set['gaps'][number];

/** One Teil-1 gap: three options, the right one, the grammar point, explanations. */
export function g(options: [string, string, string], answer: string, point: string, de: string, en: string): Sb1Gap {
  return { options, answer: pick(options, answer, `gap "${point}"`) as 0 | 1 | 2, point, explanation: ex(de, en) };
}

export const sb1Set = (id: string, topic: TopicId, text: string, gaps: Sb1Gap[]): Sb1Set => ({ id, topic, text, gaps });

/** One Teil-2 gap, given as the word that belongs there. */
export type Sb2GapSpec = [word: string, de: string, en: string];

export function sb2Set(id: string, topic: TopicId, text: string, words: string[], gaps: Sb2GapSpec[]): Sb2Set {
  return {
    id,
    topic,
    text,
    words,
    gaps: gaps.map(([word, de, en], i) => ({ answer: pick(words, word, `${id} gap ${i + 1}`), explanation: ex(de, en) })),
  };
}
