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

/** Leitner box 0 (unseen) to 5 (mastered). */
export interface QuestionProgress {
  box: number;
  /** Epoch ms when the question is due again. */
  due: number;
  correct: number;
  wrong: number;
  lastSeen: number;
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
