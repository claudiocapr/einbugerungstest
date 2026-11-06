/**
 * Small builders that keep the vocabulary files readable. Every entry carries
 * its own explicit number, so ids stay stable when entries are added or
 * reordered (progress is keyed by id).
 *
 * All words, translations and example sentences are written for this app.
 */
import type { TopicId, VocabEntry } from '../types.ts';

type Article = 'der' | 'die' | 'das';

export function maker(topic: TopicId) {
  const id = (num: number) => `${topic}-${String(num).padStart(3, '0')}`;
  const withGov = (entry: VocabEntry, government?: string): VocabEntry =>
    government ? { ...entry, government } : entry;

  return {
    /** Noun. `plural` without article; "-" when there is none. */
    n: (num: number, article: Article, de: string, plural: string, en: string, example: string, exampleEn: string, government?: string): VocabEntry =>
      withGov({ id: id(num), topic, pos: 'noun', de, article, plural, en, example, exampleEn }, government),
    /** Verb. `forms`: 3rd person present, Präteritum, Perfekt. */
    v: (num: number, de: string, forms: string, en: string, example: string, exampleEn: string, government?: string): VocabEntry =>
      withGov({ id: id(num), topic, pos: 'verb', de, forms, en, example, exampleEn }, government),
    a: (num: number, de: string, en: string, example: string, exampleEn: string, government?: string): VocabEntry =>
      withGov({ id: id(num), topic, pos: 'adjective', de, en, example, exampleEn }, government),
    adv: (num: number, de: string, en: string, example: string, exampleEn: string): VocabEntry => ({
      id: id(num), topic, pos: 'adverb', de, en, example, exampleEn,
    }),
    /** Fixed phrase or Redemittel. */
    p: (num: number, de: string, en: string, example: string, exampleEn: string, government?: string): VocabEntry =>
      withGov({ id: id(num), topic, pos: 'phrase', de, en, example, exampleEn }, government),
  };
}
