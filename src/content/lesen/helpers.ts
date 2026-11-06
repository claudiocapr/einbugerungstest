/**
 * Small builders that keep the content files readable: answers are written as
 * the letters printed in the exam ("c", "x") or as the word itself, and turned
 * into indices here. A typo throws at load time, which the content tests catch.
 */
import type { Text2 } from '../../types.ts';

export const ex = (de: string, en: string): Text2 => ({ de, en });

/** "a" → 0 … "o" → 14. */
export function idx(letter: string): number {
  const i = letter.charCodeAt(0) - 97;
  if (letter.length !== 1 || i < 0 || i > 14) throw new Error(`Bad answer letter: ${letter}`);
  return i;
}

/** Index of `answer` in `options`; throws when it is not one of them. */
export function pick<T extends string>(options: readonly T[], answer: string, where: string): number {
  const i = options.indexOf(answer as T);
  if (i < 0) throw new Error(`${where}: "${answer}" is not one of ${options.join(' / ')}`);
  return i;
}
