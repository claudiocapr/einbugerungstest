export type Lang = 'de' | 'en';

/** A UI string in both interface languages. */
export type Text2 = { de: string; en: string };

/** One recorded answer to a practice item. */
export interface Attempt {
  /** Epoch ms. */
  at: number;
  /** Index of the option picked, or -1 when the item has no options (e.g. a flashcard). */
  chosen: number;
  ok: boolean;
}

/**
 * Spaced-repetition state of one practice item, keyed in the store by a string
 * id with a section prefix ("vocab:arbeit-012", "sb1:s03:4", "lesen2:s01:2").
 * Leitner box 0 (unseen) to 5 (mastered).
 */
export interface ItemProgress {
  box: number;
  /** Epoch ms when the item is due again. */
  due: number;
  correct: number;
  wrong: number;
  lastSeen: number;
  /** Recent answers, newest first, capped at HISTORY_LENGTH. */
  history: Attempt[];
}

/** How well an item is known right now, coarse enough to show as a label. */
export type StrengthLevel = 'new' | 'weak' | 'shaky' | 'good' | 'strong';

/** Every exam part the app trains, as telc names them. */
export type ExamPart =
  | 'lesen1' | 'lesen2' | 'lesen3'
  | 'sb1' | 'sb2'
  | 'hoeren1' | 'hoeren2' | 'hoeren3'
  | 'schreiben'
  | 'sprechen1' | 'sprechen2' | 'sprechen3';

/**
 * The outcome of one finished drill set, mock exam or self-assessed task.
 * Points are telc points where the drill mirrors a scored exam part, so
 * results can be compared with the 60% pass marks.
 */
export interface DrillResult {
  /** Which section produced it, e.g. "lesen", "modelltest", "telc". */
  section: string;
  /** The exam part, when the result is for a single part. */
  part?: ExamPart;
  /** Content set id, e.g. "lesen1-03". */
  setId?: string;
  /** Items answered correctly / items in the set. */
  correct: number;
  total: number;
  /** telc points scored and available, when known. */
  points?: number;
  maxPoints?: number;
  /** True when the user scored it themselves (writing, speaking). */
  selfAssessed?: boolean;
  startedAt: number;
  finishedAt: number;
}
