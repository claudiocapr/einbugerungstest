/**
 * Self-assessment for Mündlicher Ausdruck, following telc's four criteria and
 * their A–D bands. Teil 1 is worth 15 points, Teil 2 and 3 30 each (the same
 * bands, doubled). Pure: usable by the Modelltest and the tests.
 */
import type { ExamPart, Text2 } from '../../types.ts';

export type SprechenPart = 1 | 2 | 3;
export type Level = 'A' | 'B' | 'C' | 'D';
export const LEVELS: Level[] = ['A', 'B', 'C', 'D'];

export type CriterionId = 'ausdruck' | 'aufgabe' | 'formal' | 'aussprache';

export interface Criterion {
  id: CriterionId;
  label: Text2;
  /** What is judged. */
  hint: Text2;
  /** Teil 1 points for A, B, C, D (Teil 2/3: doubled). */
  points: [number, number, number, number];
  /** What each band means. */
  bands: [Text2, Text2, Text2, Text2];
}

export const CRITERIA: Criterion[] = [
  {
    id: 'ausdruck',
    label: { de: 'Ausdrucksfähigkeit und Wortschatz', en: 'Expression and vocabulary' },
    hint: {
      de: 'Passende Wörter und Wendungen, sagen können, was ich sagen will',
      en: 'Fitting words and phrases, being able to say what I mean',
    },
    points: [4, 3, 1, 0],
    bands: [
      { de: 'voll angemessen', en: 'fully appropriate' },
      { de: 'im Großen und Ganzen angemessen', en: 'appropriate on the whole' },
      { de: 'kaum noch akzeptabel', en: 'barely acceptable' },
      { de: 'nicht ausreichend', en: 'not sufficient' },
    ],
  },
  {
    id: 'aufgabe',
    label: { de: 'Aufgabenbewältigung', en: 'Task management' },
    hint: {
      de: 'Alle Punkte angesprochen, aktiv mitgesprochen, auf die Partnerin / den Partner reagiert, flüssig gesprochen',
      en: 'Covered all points, took part actively, reacted to my partner, spoke fluently',
    },
    points: [4, 3, 1, 0],
    bands: [
      { de: 'voll angemessen', en: 'fully appropriate' },
      { de: 'im Großen und Ganzen angemessen', en: 'appropriate on the whole' },
      { de: 'kaum noch akzeptabel', en: 'barely acceptable' },
      { de: 'nicht ausreichend', en: 'not sufficient' },
    ],
  },
  {
    id: 'formal',
    label: { de: 'Formale Richtigkeit', en: 'Grammatical accuracy' },
    hint: {
      de: 'Satzbau, Verbformen, Endungen',
      en: 'Word order, verb forms, endings',
    },
    points: [4, 3, 1, 0],
    bands: [
      { de: 'keine oder nur einzelne Fehler', en: 'no or only occasional mistakes' },
      { de: 'Fehler, die das Verstehen nicht stören', en: 'mistakes that do not affect understanding' },
      { de: 'Fehler, die das Verstehen stark stören', en: 'mistakes that seriously affect understanding' },
      { de: 'so viele Fehler, dass die Kommunikation scheitert', en: 'so many mistakes that communication fails' },
    ],
  },
  {
    id: 'aussprache',
    label: { de: 'Aussprache und Intonation', en: 'Pronunciation and intonation' },
    hint: {
      de: 'Hören Sie Ihre Aufnahme an: Versteht man Sie gut?',
      en: 'Listen to your recording: are you easy to understand?',
    },
    points: [3, 2, 1, 0],
    bands: [
      { de: 'stört das Verstehen nicht', en: 'does not affect understanding' },
      { de: 'erschwert das Verstehen manchmal', en: 'sometimes makes understanding harder' },
      { de: 'erschwert das Verstehen stark', en: 'makes understanding much harder' },
      { de: 'macht das Verstehen fast unmöglich', en: 'makes understanding almost impossible' },
    ],
  },
];

export const SPRECHEN_MAX_POINTS: Record<SprechenPart, number> = { 1: 15, 2: 30, 3: 30 };
const FACTOR: Record<SprechenPart, number> = { 1: 1, 2: 2, 3: 2 };

export const sprechenExamPart = (part: SprechenPart): ExamPart => `sprechen${part}` as ExamPart;

/** Points for one criterion at one level. */
export function criterionPoints(part: SprechenPart, id: CriterionId, level: Level): number {
  const c = CRITERIA.find((x) => x.id === id);
  if (!c) return 0;
  return c.points[LEVELS.indexOf(level)] * FACTOR[part];
}

export type SelfRating = Partial<Record<CriterionId, Level>>;

/** Total self-assessed points; `complete` is false while a criterion is unrated. */
export function speakingScore(part: SprechenPart, rating: SelfRating): { points: number; maxPoints: number; complete: boolean } {
  let points = 0;
  let complete = true;
  for (const c of CRITERIA) {
    const level = rating[c.id];
    if (level) points += criterionPoints(part, c.id, level);
    else complete = false;
  }
  return { points, maxPoints: SPRECHEN_MAX_POINTS[part], complete };
}

/** Task-specific things to tick off after practising (not scored). */
export const TASK_CHECKS: Record<SprechenPart, Text2[]> = {
  1: [
    { de: 'Ich habe über alle Punkte auf der Karte gesprochen.', en: 'I talked about all the points on the card.' },
    { de: 'Ich habe meiner Partnerin / meinem Partner auch Fragen gestellt.', en: 'I also asked my partner questions.' },
    { de: 'Ich habe auf die Antworten reagiert („Wirklich?“, „Interessant!“).', en: 'I reacted to the answers ("Really?", "Interesting!").' },
    { de: 'Ich konnte auch die Zusatzfrage beantworten.', en: 'I could also answer the extra question.' },
  ],
  2: [
    { de: 'Ich habe meinen Text kurz und mit eigenen Worten zusammengefasst.', en: 'I summarised my text briefly in my own words.' },
    { de: 'Ich habe meine Meinung gesagt und begründet.', en: 'I gave and justified my opinion.' },
    { de: 'Ich habe von eigenen Erfahrungen erzählt.', en: 'I talked about my own experience.' },
    { de: 'Ich habe nachgefragt und auf meine Partnerin / meinen Partner reagiert.', en: 'I asked questions and reacted to my partner.' },
  ],
  3: [
    { de: 'Ich habe eigene Vorschläge gemacht und begründet.', en: 'I made and justified my own suggestions.' },
    { de: 'Ich habe auf Vorschläge reagiert (zugestimmt oder höflich abgelehnt).', en: 'I responded to suggestions (agreed or politely declined).' },
    { de: 'Wir haben über alle Punkte der Liste gesprochen.', en: 'We discussed every point on the list.' },
    { de: 'Am Ende haben wir uns geeinigt, wer was macht.', en: 'In the end we agreed who does what.' },
  ],
};

/** Prep timer choices in minutes (the exam gives 20 minutes for all parts). */
export const PREP_MINUTES = [5, 10, 20] as const;
/** Roughly how long the part takes in the exam, in minutes. */
export const PART_MINUTES: Record<SprechenPart, number> = { 1: 3, 2: 6, 3: 6 };
