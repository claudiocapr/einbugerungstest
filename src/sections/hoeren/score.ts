/**
 * Pure helpers for Hörverstehen: scoring, the exam playback plan and finding
 * the transcript lines an explanation refers to. No React, no browser APIs,
 * so the Modelltest and the tests can use them directly.
 */
import type { Hoeren1Set, Hoeren2Set, Hoeren3Set, Line, RfItem } from '../../content/types.ts';
import type { ExamPart, Text2 } from '../../types.ts';

export type HoerenPart = 1 | 2 | 3;
export type HoerenSet = Hoeren1Set | Hoeren2Set | Hoeren3Set;

/** Every Hören part is worth 25 telc points. */
export const HOEREN_MAX_POINTS = 25;
/** Items per part: 5, 10, 5. */
export const HOEREN_ITEM_COUNT: Record<HoerenPart, number> = { 1: 5, 2: 10, 3: 5 };
/** telc points per correct item: 25 / items. */
export const HOEREN_ITEM_POINTS: Record<HoerenPart, number> = { 1: 5, 2: 2.5, 3: 5 };
/** How often the exam plays each text: Teil 1 once, Teil 2 and 3 twice. */
export const HOEREN_PLAYS: Record<HoerenPart, 1 | 2> = { 1: 1, 2: 2, 3: 2 };
/** Reading time before listening, in seconds. */
export const HOEREN_READING_SECONDS: Record<HoerenPart, number> = { 1: 30, 2: 60, 3: 30 };
/** Pause between the two plays of a text, in ms. */
export const HOEREN_REPEAT_PAUSE_MS: Record<HoerenPart, number> = { 1: 0, 2: 10_000, 3: 4_000 };

export const hoerenExamPart = (part: HoerenPart): ExamPart => `hoeren${part}` as ExamPart;

/** Progress id of one statement: "hoeren2:hoeren2-03:7". */
export const hoerenItemId = (part: HoerenPart, setId: string, index: number) => `hoeren${part}:${setId}:${index}`;

/** A statement together with the script it is about (Teil 2: the whole conversation). */
export interface HoerenEntry {
  script: Line[];
  item: RfItem;
}

/** The statements of a set in order, each with its script. */
export function hoerenEntries(part: HoerenPart, set: HoerenSet): HoerenEntry[] {
  if (part === 2) {
    const s = set as Hoeren2Set;
    return s.items.map((item) => ({ script: s.script, item }));
  }
  return (set as Hoeren1Set | Hoeren3Set).items;
}

export function hoerenItems(part: HoerenPart, set: HoerenSet): RfItem[] {
  return hoerenEntries(part, set).map((e) => e.item);
}

/** An answer: true = richtig, false = falsch, null = not answered. */
export type RfAnswer = boolean | null | undefined;

export interface RfScore {
  correct: number;
  total: number;
  /** Per item: answered correctly? */
  perItem: boolean[];
  points: number;
  maxPoints: number;
}

/** Scores richtig/falsch answers. Unanswered items count as wrong. */
export function scoreRf(items: RfItem[], answers: RfAnswer[], pointsPerItem = 1): RfScore {
  const perItem = items.map((it, i) => answers[i] === it.answer);
  const correct = perItem.filter(Boolean).length;
  return {
    correct,
    total: items.length,
    perItem,
    points: correct * pointsPerItem,
    maxPoints: items.length * pointsPerItem,
  };
}

/** Scores one Hören set in telc points (max 25). */
export function scoreHoeren(part: HoerenPart, set: HoerenSet, answers: RfAnswer[]): RfScore {
  return scoreRf(hoerenItems(part, set), answers, HOEREN_ITEM_POINTS[part]);
}

/** The index the progress store records for a choice: richtig 0, falsch 1, none -1. */
export const rfChoiceIndex = (answer: RfAnswer) => (answer === true ? 0 : answer === false ? 1 : -1);

/* ------------------------------------------------------------ transcript */

const norm = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase();

/** The passages quoted in German quotation marks („…“) in an explanation. */
export function quotes(text: string): string[] {
  const out: string[] = [];
  const re = /„([^“]+)“/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const q = m[1].trim();
    if (q) out.push(q);
  }
  return out;
}

/**
 * Indexes of the script lines an explanation quotes. A quote matches a line
 * that contains it; short quotes (single words) only count when no longer
 * quote matched, so "inzwischen" does not light up half a transcript.
 */
export function relevantLines(script: Line[], explanation: Text2 | string): number[] {
  const text = typeof explanation === 'string' ? explanation : explanation.de;
  const qs = quotes(text).map(norm);
  const hits = new Set<number>();
  const match = (q: string) => {
    let found = false;
    script.forEach((line, i) => {
      if (norm(line.text).includes(q)) {
        hits.add(i);
        found = true;
      }
    });
    return found;
  };
  const long = qs.filter((q) => q.includes(' '));
  long.forEach(match);
  if (hits.size === 0) qs.filter((q) => !q.includes(' ')).forEach(match);
  return [...hits].sort((x, y) => x - y);
}

/* -------------------------------------------------------------- playback */

const NUMBER_WORDS = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn'];
export const numberWord = (k: number) => NUMBER_WORDS[k] ?? String(k);

export type Segment =
  | { kind: 'speak'; lines: Line[]; label: Text2; item?: number; pass: 1 | 2 }
  | { kind: 'pause'; ms: number; label: Text2 };

/**
 * What the exam plays, in order: Teil 1 every text once; Teil 3 every text
 * twice in a row; Teil 2 the whole conversation, a pause, and again.
 * `item` is the 0-based statement the segment belongs to (Teil 1 and 3).
 */
export function examPlan(part: HoerenPart, set: HoerenSet): Segment[] {
  const plan: Segment[] = [];
  if (part === 2) {
    const s = set as Hoeren2Set;
    plan.push({ kind: 'speak', lines: s.script, label: { de: 'Erstes Hören', en: 'First listening' }, pass: 1 });
    plan.push({ kind: 'pause', ms: HOEREN_REPEAT_PAUSE_MS[2], label: { de: 'Pause', en: 'Pause' } });
    plan.push({
      kind: 'speak',
      lines: [{ voice: 'n', text: 'Sie hören das Gespräch jetzt noch einmal.' }, ...s.script],
      label: { de: 'Zweites Hören', en: 'Second listening' },
      pass: 2,
    });
    return plan;
  }
  const items = (set as Hoeren1Set | Hoeren3Set).items;
  items.forEach((entry, i) => {
    const k = i + 1;
    const label = { de: `Text ${k}`, en: `Text ${k}` };
    plan.push({
      kind: 'speak',
      lines: [{ voice: 'n', text: `Nummer ${numberWord(k)}.` }, ...entry.script],
      label,
      item: i,
      pass: 1,
    });
    if (HOEREN_PLAYS[part] === 2) {
      plan.push({ kind: 'pause', ms: HOEREN_REPEAT_PAUSE_MS[part], label });
      plan.push({ kind: 'speak', lines: entry.script, label, item: i, pass: 2 });
    }
    if (i < items.length - 1) plan.push({ kind: 'pause', ms: 2_000, label });
  });
  return plan;
}

/** The exam instruction for a part, as telc words it in spirit (rewritten). */
export function instruction(part: HoerenPart): Text2 {
  const read = HOEREN_READING_SECONDS[part];
  if (part === 1)
    return {
      de: `Sie hören fünf kurze Texte. Sie hören jeden Text nur einmal. Entscheiden Sie beim Hören, ob die Aussagen richtig oder falsch sind. Lesen Sie zuerst die Aussagen. Sie haben dazu ${read} Sekunden Zeit.`,
      en: `You will hear five short texts, each only once. While listening, decide whether the statements are true or false. First read the statements – you have ${read} seconds.`,
    };
  if (part === 2)
    return {
      de: 'Sie hören ein Gespräch. Sie hören das Gespräch zweimal. Entscheiden Sie beim Hören, ob die Aussagen richtig oder falsch sind. Lesen Sie zuerst die Aussagen. Sie haben dazu eine Minute Zeit.',
      en: 'You will hear a conversation twice. While listening, decide whether the statements are true or false. First read the statements – you have one minute.',
    };
  return {
    de: `Sie hören fünf kurze Texte. Sie hören jeden Text zweimal. Entscheiden Sie beim Hören, ob die Aussagen richtig oder falsch sind. Lesen Sie zuerst die Aussagen. Sie haben dazu ${read} Sekunden Zeit.`,
    en: `You will hear five short texts, each twice. While listening, decide whether the statements are true or false. First read the statements – you have ${read} seconds.`,
  };
}

/** What the narrator says before the reading time (spoken; numbers as words). */
export function spokenInstruction(part: HoerenPart): string {
  if (part === 1)
    return 'Sie hören nun fünf kurze Texte. Sie hören diese Texte nur einmal. Lesen Sie jetzt die Aufgaben. Sie haben dazu dreißig Sekunden Zeit.';
  if (part === 2)
    return 'Sie hören nun ein Gespräch. Sie hören das Gespräch zweimal. Lesen Sie jetzt die Aufgaben. Sie haben dazu eine Minute Zeit.';
  return 'Sie hören nun fünf kurze Texte. Sie hören jeden Text zweimal. Lesen Sie jetzt die Aufgaben. Sie haben dazu dreißig Sekunden Zeit.';
}
