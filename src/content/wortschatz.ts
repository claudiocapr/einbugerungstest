// Owned by the Wortschatz agent. Keep the export names: other sections import them.
//
// B1 vocabulary by topic. The words follow what telc Deutsch B1 expects at this
// level; every selection, translation and example sentence is written for this
// app. The entries live in ./wortschatz/<topic>.ts.
import type { TopicId, VocabEntry } from './types.ts';
import { person } from './wortschatz/person.ts';
import { familie } from './wortschatz/familie.ts';
import { wohnen } from './wortschatz/wohnen.ts';
import { arbeit } from './wortschatz/arbeit.ts';
import { ausbildung } from './wortschatz/ausbildung.ts';
import { gesundheit } from './wortschatz/gesundheit.ts';
import { essen } from './wortschatz/essen.ts';
import { einkaufen } from './wortschatz/einkaufen.ts';
import { dienstleistungen } from './wortschatz/dienstleistungen.ts';
import { reisen } from './wortschatz/reisen.ts';
import { freizeit } from './wortschatz/freizeit.ts';
import { medien } from './wortschatz/medien.ts';
import { umwelt } from './wortschatz/umwelt.ts';
import { gesellschaft } from './wortschatz/gesellschaft.ts';

export const vocab: VocabEntry[] = [
  ...person,
  ...familie,
  ...wohnen,
  ...arbeit,
  ...ausbildung,
  ...gesundheit,
  ...essen,
  ...einkaufen,
  ...dienstleistungen,
  ...reisen,
  ...freizeit,
  ...medien,
  ...umwelt,
  ...gesellschaft,
];

/** Entries of one topic, in their stored order. */
export const vocabByTopic = (topic: TopicId): VocabEntry[] => vocab.filter((e) => e.topic === topic);
