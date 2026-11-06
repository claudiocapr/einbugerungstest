/**
 * The digital answer sheet (Antwortbogen S30) for telc's Übungstest 1, and its
 * scoring. Pure data and functions, so the scoring is unit-tested. The answer
 * key itself is never part of this repository: it is loaded at run time from
 * the private bucket (`uebungstest-1/key.json`), shaped like
 * `{ "1": "c", …, "41": "+", … }` with "+" = richtig and "-" = falsch.
 */

export type Answer = string;
export type AnswerKey = Record<string, Answer>;
export type Answers = Record<string, Answer>;

export interface Part {
  id: string;
  subtest: 'lesen' | 'sprachbausteine' | 'hoeren';
  label: { de: string; en: string };
  from: number;
  to: number;
  /** The marks a candidate can choose for every item of this part. */
  options: string[];
  /** telc points per correct item (the same weighting as the real exam). */
  points: number;
}

const letters = (last: string) => {
  const out: string[] = [];
  for (let c = 'a'.charCodeAt(0); c <= last.charCodeAt(0); c++) out.push(String.fromCharCode(c));
  return out;
};

export const PARTS: Part[] = [
  { id: 'lesen1', subtest: 'lesen', label: { de: 'Leseverstehen, Teil 1', en: 'Reading, part 1' }, from: 1, to: 5, options: letters('j'), points: 5 },
  { id: 'lesen2', subtest: 'lesen', label: { de: 'Leseverstehen, Teil 2', en: 'Reading, part 2' }, from: 6, to: 10, options: letters('c'), points: 5 },
  { id: 'lesen3', subtest: 'lesen', label: { de: 'Leseverstehen, Teil 3', en: 'Reading, part 3' }, from: 11, to: 20, options: [...letters('l'), 'x'], points: 2.5 },
  { id: 'sb1', subtest: 'sprachbausteine', label: { de: 'Sprachbausteine, Teil 1', en: 'Language elements, part 1' }, from: 21, to: 30, options: letters('c'), points: 1.5 },
  { id: 'sb2', subtest: 'sprachbausteine', label: { de: 'Sprachbausteine, Teil 2', en: 'Language elements, part 2' }, from: 31, to: 40, options: letters('o'), points: 1.5 },
  { id: 'hoeren1', subtest: 'hoeren', label: { de: 'Hörverstehen, Teil 1', en: 'Listening, part 1' }, from: 41, to: 45, options: ['+', '-'], points: 5 },
  { id: 'hoeren2', subtest: 'hoeren', label: { de: 'Hörverstehen, Teil 2', en: 'Listening, part 2' }, from: 46, to: 55, options: ['+', '-'], points: 2.5 },
  { id: 'hoeren3', subtest: 'hoeren', label: { de: 'Hörverstehen, Teil 3', en: 'Listening, part 3' }, from: 56, to: 60, options: ['+', '-'], points: 5 },
];

export const ITEM_COUNT = 60;

export const partOf = (item: number): Part | undefined => PARTS.find((p) => item >= p.from && item <= p.to);

/** How an option is shown: "+"/"-" as richtig/falsch, letters as they are. */
export function optionLabel(option: string, lang: 'de' | 'en'): string {
  if (option === '+') return lang === 'de' ? 'richtig' : 'true';
  if (option === '-') return lang === 'de' ? 'falsch' : 'false';
  return option;
}

/**
 * Lower-cases a mark; for richtig/falsch items also accepts "r"/"richtig"/"true"
 * and "f"/"falsch"/"false"/"–" (only there: "f" is a letter option elsewhere).
 */
function normaliseMark(raw: unknown, part: Part): string | null {
  if (typeof raw !== 'string') return null;
  const v = raw.trim().toLowerCase();
  if (!v) return null;
  if (!part.options.includes('+')) return v;
  if (v === '+' || v === 'r' || v === 'richtig' || v === 'true') return '+';
  if (v === '-' || v === '–' || v === '−' || v === 'f' || v === 'falsch' || v === 'false') return '-';
  return v;
}

/**
 * Validates a downloaded key: every item 1–60 must be present with a mark the
 * item's part allows. Returns the cleaned key, or null if it is unusable.
 */
export function parseKey(raw: unknown): AnswerKey | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const out: AnswerKey = {};
  for (let n = 1; n <= ITEM_COUNT; n++) {
    const part = partOf(n)!;
    const mark = normaliseMark((raw as Record<string, unknown>)[String(n)], part);
    if (!mark || !part.options.includes(mark)) return null;
    out[String(n)] = mark;
  }
  return out;
}

export interface PartScore {
  id: string;
  subtest: Part['subtest'];
  correct: number;
  total: number;
  points: number;
  maxPoints: number;
}

export interface SheetScore {
  correct: number;
  answered: number;
  total: number;
  points: number;
  maxPoints: number;
  parts: PartScore[];
  /** Per subtest (Lesen 75, Sprachbausteine 30, Hören 75). */
  subtests: Record<Part['subtest'], { points: number; maxPoints: number }>;
  items: Record<string, { given: string | null; expected: string; ok: boolean }>;
}

export function scoreSheet(answers: Answers, key: AnswerKey): SheetScore {
  const parts: PartScore[] = [];
  const items: SheetScore['items'] = {};
  const subtests: SheetScore['subtests'] = {
    lesen: { points: 0, maxPoints: 0 },
    sprachbausteine: { points: 0, maxPoints: 0 },
    hoeren: { points: 0, maxPoints: 0 },
  };
  let answered = 0;
  for (const part of PARTS) {
    const ps: PartScore = { id: part.id, subtest: part.subtest, correct: 0, total: 0, points: 0, maxPoints: 0 };
    for (let n = part.from; n <= part.to; n++) {
      const expected = key[String(n)];
      const given = normaliseMark(answers[String(n)], part);
      const ok = !!given && given === expected;
      if (given) answered++;
      items[String(n)] = { given: given ?? null, expected, ok };
      ps.total++;
      ps.maxPoints += part.points;
      if (ok) {
        ps.correct++;
        ps.points += part.points;
      }
    }
    subtests[part.subtest].points += ps.points;
    subtests[part.subtest].maxPoints += ps.maxPoints;
    parts.push(ps);
  }
  const sum = (f: (p: PartScore) => number) => parts.reduce((a, p) => a + f(p), 0);
  return {
    correct: sum((p) => p.correct),
    answered,
    total: sum((p) => p.total),
    points: sum((p) => p.points),
    maxPoints: sum((p) => p.maxPoints),
    parts,
    subtests,
    items,
  };
}

/** Formats telc points the German way: 2.5 -> "2,5". */
export const formatPoints = (n: number, lang: 'de' | 'en') =>
  lang === 'de' ? String(Math.round(n * 10) / 10).replace('.', ',') : String(Math.round(n * 10) / 10);
