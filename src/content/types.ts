/**
 * The shapes every piece of practice content takes.
 *
 * Content mirrors the format of telc Deutsch B1 / Zertifikat Deutsch as set out
 * in telc's Übungstest 1 (counts, task types, instructions), but every text is
 * written for this app. Never copy telc's texts into these files: the
 * repository and the site are public. See PLAN-TELC-B1.md.
 *
 * Explanations and translations are bilingual because the interface is; the
 * exam material itself (texts, headlines, scripts, model answers) is German.
 */
import type { Text2 } from '../types.ts';

/** Exam topics, roughly the B1 themes telc's exams and course books draw on. */
export type TopicId =
  | 'person'
  | 'familie'
  | 'wohnen'
  | 'arbeit'
  | 'ausbildung'
  | 'gesundheit'
  | 'essen'
  | 'einkaufen'
  | 'dienstleistungen'
  | 'reisen'
  | 'freizeit'
  | 'medien'
  | 'umwelt'
  | 'gesellschaft'
  /** General words without a topical home (connectors, adverbs, generic verbs). Wortschatz only. */
  | 'allgemein';

/* ------------------------------------------------------------------ Wortschatz */

export type PartOfSpeech = 'noun' | 'verb' | 'adjective' | 'adverb' | 'phrase' | 'other';

export interface VocabEntry {
  /** Stable, unique: "<topic>-<nnn>", e.g. "wohnen-014". Progress is keyed by it. */
  id: string;
  topic: TopicId;
  pos: PartOfSpeech;
  /** The headword or chunk without article: "Mietvertrag", "einen Termin vereinbaren". */
  de: string;
  /** Nouns only. */
  article?: 'der' | 'die' | 'das';
  /** Nouns only; "-" for no plural, e.g. "Mietverträge". */
  plural?: string;
  /** Verbs: the forms a learner needs, e.g. "vereinbart, vereinbarte, hat vereinbart". */
  forms?: string;
  /** Verbs/adjectives with a fixed preposition or case, e.g. "sich kümmern um + Akk". */
  government?: string;
  en: string;
  /** A natural B1 example sentence using the entry. */
  example: string;
  exampleEn: string;
}

/* ---------------------------------------------------------------------- Lesen */

/** Leseverstehen Teil 1: 5 texts, headlines a–j (10), one headline per text. */
export interface Lesen1Set {
  id: string;
  topic: TopicId;
  /** Exactly 10, labelled a–j in order. */
  headlines: string[];
  /** Exactly 5, labelled 1–5. */
  texts: { text: string; /** Index into headlines. */ answer: number; explanation: Text2 }[];
}

/** Leseverstehen Teil 2: one longer text, 5 multiple-choice items a/b/c. */
export interface Lesen2Set {
  id: string;
  topic: TopicId;
  title: string;
  /** Paragraphs. */
  text: string[];
  /** Exactly 5. */
  items: { stem: string; options: [string, string, string]; answer: 0 | 1 | 2; explanation: Text2 }[];
}

/** Leseverstehen Teil 3: 10 situations, ads a–l (12); one or two situations have no fitting ad ("x"). */
export interface Lesen3Set {
  id: string;
  topic: TopicId;
  /** Exactly 12, labelled a–l. */
  ads: { title?: string; text: string }[];
  /** Exactly 10. `answer` indexes `ads`, or null for "x" (no matching ad). Each ad used at most once. */
  situations: { text: string; answer: number | null; explanation: Text2 }[];
}

/* ------------------------------------------------------------- Sprachbausteine */

/**
 * Gapped text. Gaps are written inline as "[1]".."[10]" (numbered within the
 * set), so the UI can render the text around them.
 */
export interface Sb1Set {
  id: string;
  topic: TopicId;
  /** Usually a letter or e-mail, as in the exam. */
  text: string;
  /** Exactly 10, gap [n] is gaps[n-1]. */
  gaps: { options: [string, string, string]; answer: 0 | 1 | 2; explanation: Text2; /** Grammar point, e.g. "Konnektor: obwohl". */ point: string }[];
}

/** Sprachbausteine Teil 2: 10 gaps, words a–o (15), each word used at most once. */
export interface Sb2Set {
  id: string;
  topic: TopicId;
  text: string;
  /** Exactly 15, labelled a–o. */
  words: string[];
  /** Exactly 10, gap [n] is gaps[n-1]; `answer` indexes `words`. */
  gaps: { answer: number; explanation: Text2 }[];
}

/* ---------------------------------------------------------------------- Hören */

/** A spoken line. Voice "a"/"b" lets TTS alternate speakers in a dialogue. */
export interface Line {
  voice: 'a' | 'b' | 'n';
  text: string;
}

/** A richtig/falsch statement about what was heard. */
export interface RfItem {
  statement: string;
  answer: boolean;
  explanation: Text2;
}

/** Hörverstehen Teil 1: 5 short texts, heard ONCE, one statement each. */
export interface Hoeren1Set {
  id: string;
  topic: TopicId;
  /** Exactly 5. */
  items: { script: Line[]; item: RfItem }[];
}

/** Hörverstehen Teil 2: one conversation/interview, heard TWICE, 10 statements. */
export interface Hoeren2Set {
  id: string;
  topic: TopicId;
  title: string;
  script: Line[];
  /** Exactly 10, in the order the information comes up. */
  items: RfItem[];
}

/** Hörverstehen Teil 3: 5 short texts (announcements, messages, radio), heard TWICE. */
export interface Hoeren3Set {
  id: string;
  topic: TopicId;
  /** Exactly 5. */
  items: { script: Line[]; item: RfItem }[];
}

/* ----------------------------------------------------------------- Schreiben */

export interface WritingTask {
  id: string;
  topic: TopicId;
  register: 'informal' | 'semiformal';
  /** The e-mail the candidate answers, as in the exam. */
  incoming: { from: string; subject: string; body: string };
  /** Exactly 4 Leitpunkte. */
  points: [string, string, string, string];
  /** A model answer at solid B1, roughly 120–150 words. */
  model: string;
}

/* ------------------------------------------------------------------ Sprechen */

/** Teil 1 Einander kennenlernen: the topics on the card plus extras. */
export interface Speaking1Card {
  id: string;
  points: string[];
  extraQuestions: string[];
  model: Line[];
}

/** Teil 2 Über ein Thema sprechen: two short opinion texts, A and B. */
export interface Speaking2Task {
  id: string;
  topic: TopicId;
  theme: string;
  a: { person: string; text: string };
  b: { person: string; text: string };
  model: Line[];
}

/** Teil 3 Gemeinsam etwas planen. */
export interface Speaking3Task {
  id: string;
  topic: TopicId;
  situation: string;
  /** The planning list, e.g. ["Wann?", "Wo?", "Essen", ...]. */
  checklist: string[];
  model: Line[];
}

/* -------------------------------------------------------------------- Shared */

/** Redemittel: useful phrases, grouped by communicative purpose. */
export interface PhraseGroup {
  id: string;
  label: Text2;
  phrases: { de: string; en: string }[];
}
