import raw from '../data/questions.json' with { type: 'json' };
import type { Question, State, Topic } from '../types.ts';

export const QUESTIONS = raw as Question[];

export const BY_ID = new Map(QUESTIONS.map((q) => [q.id, q]));

export const GENERAL = QUESTIONS.filter((q) => q.state === null);

export const STATES: State[] = [
  'Baden-Württemberg', 'Bayern', 'Berlin', 'Brandenburg', 'Bremen', 'Hamburg',
  'Hessen', 'Mecklenburg-Vorpommern', 'Niedersachsen', 'Nordrhein-Westfalen',
  'Rheinland-Pfalz', 'Saarland', 'Sachsen', 'Sachsen-Anhalt',
  'Schleswig-Holstein', 'Thüringen',
];

export const TOPICS: { id: Topic; de: string; en: string }[] = [
  { id: 'politik', de: 'Politik in der Demokratie', en: 'Politics in a democracy' },
  { id: 'geschichte', de: 'Geschichte und Verantwortung', en: 'History and responsibility' },
  { id: 'gesellschaft', de: 'Mensch und Gesellschaft', en: 'People and society' },
  { id: 'bundesland', de: 'Fragen zum Bundesland', en: 'State-specific questions' },
];

export const questionsForState = (state: State) => QUESTIONS.filter((q) => q.state === state);

/** The catalogue a candidate from `state` is actually examined on. */
export const catalogueFor = (state: State) => [...GENERAL, ...questionsForState(state)];
