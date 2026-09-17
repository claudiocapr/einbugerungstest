export type Topic = 'politik' | 'geschichte' | 'gesellschaft' | 'bundesland';

export type State =
  | 'Baden-Württemberg' | 'Bayern' | 'Berlin' | 'Brandenburg' | 'Bremen'
  | 'Hamburg' | 'Hessen' | 'Mecklenburg-Vorpommern' | 'Niedersachsen'
  | 'Nordrhein-Westfalen' | 'Rheinland-Pfalz' | 'Saarland' | 'Sachsen'
  | 'Sachsen-Anhalt' | 'Schleswig-Holstein' | 'Thüringen';

export interface Question {
  id: number;
  /** Set for the 160 state questions, null for the 300 general ones. */
  state: State | null;
  topic: Topic;
  text: string;
  options: string[];
  /** Index into `options`. */
  answer: number;
  en: { text: string; options: string[]; context: string | null };
  /** Illustrates the question itself. */
  image?: string;
  /** One image per answer option, in option order. */
  optionImages?: string[];
  imageCredit?: string;
}

export type Lang = 'de' | 'en';

/** One recorded answer to a question. */
export interface Attempt {
  /** Epoch ms. */
  at: number;
  /** Index of the option the user picked. */
  chosen: number;
  ok: boolean;
}

/** Leitner box 0 (unseen) to 5 (mastered). */
export interface QuestionProgress {
  box: number;
  /** Epoch ms when the question is due again. */
  due: number;
  correct: number;
  wrong: number;
  lastSeen: number;
  /** Recent answers, newest first, capped at HISTORY_LENGTH. */
  history: Attempt[];
}

/** How well a question is known right now, coarse enough to show as a label. */
export type StrengthLevel = 'new' | 'weak' | 'shaky' | 'good' | 'strong';

export type RecommendationKind = 'due' | 'weak' | 'new' | 'topic' | 'exam';

/** A suggested next practice session, produced from the user's progress. */
export interface Recommendation {
  kind: RecommendationKind;
  /** How many questions the suggestion concerns. */
  count: number;
  topic?: Topic;
  /** Hash route that starts the suggested session. */
  route: string;
}

export interface ExamRecord {
  startedAt: number;
  finishedAt: number;
  state: State;
  correct: number;
  total: number;
  passed: number;
  /** Question id -> chosen option index, or null when left blank. */
  answers: Record<number, number | null>;
  order: number[];
}
