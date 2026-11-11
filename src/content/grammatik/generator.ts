/**
 * Generated Lückensätze from the B1 vocabulary: a noun (with its gender and
 * plural) in a fixed frame whose case is certain ("Ich bin mit ___ zufrieden."
 * is always Dativ). Only nouns whose forms follow the regular pattern are used:
 *   - no n-Deklination (Kollege → den Kollegen), no adjectival nouns (der Bekannte),
 *   - Dativ plural adds -n unless the plural already ends in -n or -s,
 *   - Genitiv singular (der/das) only for endings that take a plain -s.
 */
import type { VocabEntry } from '../types.ts';
import { vocab } from '../wortschatz.ts';
import { type Case, type Det, type Gender, POSSESSIVES, detForm } from './forms.ts';
import type { Trigger } from './rules.ts';

export interface GenNoun {
  id: string;
  de: string;
  article: 'der' | 'die' | 'das';
  g: Exclude<Gender, 'pl'>;
  plural: string | null;
  en: string;
}

const G: Record<'der' | 'die' | 'das', Exclude<Gender, 'pl'>> = { der: 'm', die: 'f', das: 'n' };

/** Nouns that decline like adjectives or irregularly, whatever their shape. */
const IRREGULAR = new Set([
  'Herz', 'Name', 'Angestellte', 'Verwandte', 'Bekannte', 'Vorgesetzte', 'Auszubildende', 'Deutsche',
  'Erwachsene', 'Jugendliche', 'Kranke', 'Beamte', 'Arbeitslose', 'Bauer', 'Nachbar', 'Herr', 'Mensch',
]);

/** Nouns that read oddly in the generic frames ("Ich brauche keine Demokratie"). */
const ODD_IN_FRAMES = new Set([
  'Demokratie', 'Hochwasser', 'Gewitter', 'Abgas', 'Sturm', 'Vorurteil', 'Gefühl', 'Laune', 'Herkunft', 'Geburt',
  'Scheidung', 'Ehe', 'Verletzung', 'Allergie', 'Erkältung', 'Nebenwirkung', 'Notfall', 'Unfall', 'Schaden', 'Konflikt',
]);

/** Plurals that exist but are unusual, so the noun is only used in the singular. */
const ODD_PLURAL = new Set(['Alltag', 'Herkunft', 'Abitur', 'Umtausch', 'Geschmack', 'Klima', 'Energie', 'Qualität', 'Diät', 'Steuer', 'Studium', 'Ehe', 'Grippe', 'Lage']);

/**
 * Whether a vocabulary noun is safe for generated exercises. Conservative on
 * purpose: excluding a regular noun costs nothing, including an irregular one
 * would teach a wrong form.
 */
export function isRegularNoun(e: VocabEntry): boolean {
  if (e.pos !== 'noun' || !e.article || !e.plural) return false;
  if (!/^[A-ZÄÖÜ][a-zäöüß]+$/.test(e.de)) return false;
  if (e.plural === '-') return false; // mass nouns sound odd with ein/kein
  if (IRREGULAR.has(e.de) || [...IRREGULAR].some((w) => w.length > 4 && e.de.endsWith(w.toLowerCase()))) return false;
  if (e.article === 'der') {
    // -e nouns are n-Deklination (Kollege) or adjectival (der Bekannte); Käse is the rare exception.
    if (e.de.endsWith('e')) return false;
    // A plural that is just the singular + n/en marks the n-Deklination (Student, Nachbar, Automat).
    if (e.plural === `${e.de}n` || e.plural === `${e.de}en`) return false;
  }
  return true;
}

export const NOUNS: GenNoun[] = vocab.filter((e) => isRegularNoun(e) && !ODD_IN_FRAMES.has(e.de)).map((e) => ({
  id: e.id,
  de: e.de,
  article: e.article!,
  g: G[e.article!],
  plural: ODD_PLURAL.has(e.de) ? null : e.plural!,
  en: e.en,
}));

/** Dativ plural: + n, unless the plural already ends in -n, -s or a foreign -a (den Kindern, den Autos, den Praktika). */
export const datPlural = (plural: string) => (/[nsa]$/.test(plural) ? plural : `${plural}n`);

/**
 * Genitiv singular. Feminine nouns never change. For der/das nouns only the
 * endings that always take a plain -s are returned (des Computers, des
 * Zimmers, des Museums, des Autos); others (des Arztes / des Arzts) are null.
 */
export function genSingular(n: Pick<GenNoun, 'de' | 'g'>): string | null {
  if (n.g === 'f') return n.de;
  if (/(er|el|en|chen|lein|um|o|a|i)$/.test(n.de)) return `${n.de}s`;
  return null;
}

/** The noun as it appears in a case and number. */
export function nounForm(n: GenNoun, c: Case, plural: boolean): string | null {
  if (plural) {
    if (!n.plural) return null;
    return c === 'dat' ? datPlural(n.plural) : n.plural;
  }
  if (c === 'gen') return genSingular(n);
  return n.de;
}

/* ------------------------------------------------------------------ frames */

export type Sem = 'any' | 'person' | 'place';
export type GenDet = 'der' | 'ein' | 'kein' | 'poss';

export interface Frame {
  id: string;
  /** Sentence with ___ for the noun phrase; `pl` when the plural needs another verb form. */
  sg: string;
  pl?: string;
  c: Case;
  t: Trigger;
  sem: Sem;
  dets: GenDet[];
  /** Definite article only for feminine and plural (in dem → im would be expected). */
  defOnlyFPl?: boolean;
  /** Frame takes plural nouns. */
  plural: boolean;
}

const fr = (f: Frame) => f;

export const FRAMES: Frame[] = [
  // Nominativ
  fr({ id: 'wo-ist', sg: 'Wo ist ___?', pl: 'Wo sind ___?', c: 'nom', t: 'subj', sem: 'any', dets: ['der', 'poss'], plural: true }),
  fr({ id: 'das-ist', sg: 'Das ist ___.', pl: 'Das sind ___.', c: 'nom', t: 'sein', sem: 'any', dets: ['ein', 'kein', 'poss'], plural: true }),
  // Akkusativ
  fr({ id: 'brauche', sg: 'Ich brauche ___.', c: 'akk', t: 'va:brauchen', sem: 'any', dets: ['ein', 'kein', 'poss'], plural: true }),
  fr({ id: 'ueber', sg: 'Wir sprechen über ___.', c: 'akk', t: 'pa:sprechen über', sem: 'any', dets: ['der', 'poss'], plural: true }),
  fr({ id: 'ohne', sg: 'Ohne ___ geht es nicht.', c: 'akk', t: 'p:ohne', sem: 'any', dets: ['der', 'poss'], plural: true }),
  fr({ id: 'fuer', sg: 'Ich interessiere mich für ___.', c: 'akk', t: 'p:für', sem: 'any', dets: ['der', 'poss'], plural: true }),
  fr({ id: 'kenne', sg: 'Kennst du ___?', c: 'akk', t: 'va:kennen', sem: 'person', dets: ['der', 'poss'], plural: true }),
  fr({ id: 'frage', sg: 'Ich frage ___.', c: 'akk', t: 'va:fragen', sem: 'person', dets: ['der', 'poss'], plural: true }),
  fr({ id: 'wohin-in', sg: 'Wohin gehst du? – In ___.', c: 'akk', t: 'wohin:in', sem: 'place', dets: ['der', 'ein', 'poss'], defOnlyFPl: true, plural: false }),
  // Dativ
  fr({ id: 'zufrieden', sg: 'Ich bin mit ___ zufrieden.', c: 'dat', t: 'p:mit', sem: 'any', dets: ['der', 'poss'], plural: true }),
  fr({ id: 'problem', sg: 'Ich habe ein Problem mit ___.', c: 'dat', t: 'p:mit', sem: 'any', dets: ['der', 'poss'], plural: true }),
  fr({ id: 'halten', sg: 'Was hältst du von ___?', c: 'dat', t: 'p:von', sem: 'any', dets: ['ein', 'poss'], plural: true }),
  fr({ id: 'danke', sg: 'Ich danke ___.', c: 'dat', t: 'v:danken', sem: 'person', dets: ['der', 'poss'], plural: true }),
  fr({ id: 'helfe', sg: 'Ich helfe ___.', c: 'dat', t: 'v:helfen', sem: 'person', dets: ['der', 'poss'], plural: true }),
  fr({ id: 'gehoert', sg: 'Das Paket gehört ___.', c: 'dat', t: 'v:gehören', sem: 'person', dets: ['der', 'poss'], plural: true }),
  fr({ id: 'wo-in', sg: 'Wo bist du? – In ___.', c: 'dat', t: 'wo:in', sem: 'place', dets: ['der', 'ein', 'poss'], defOnlyFPl: true, plural: false }),
  // Genitiv
  fr({ id: 'wegen', sg: 'Ich rufe wegen ___ an.', c: 'gen', t: 'p:wegen', sem: 'any', dets: ['der', 'poss'], plural: true }),
  fr({ id: 'nummer', sg: 'Ich habe die Telefonnummer ___.', c: 'gen', t: 'genattr', sem: 'person', dets: ['der', 'poss'], plural: false }),
];

/** People (Dativ verbs such as danken make sense with them). Checked against the vocabulary in the tests. */
export const PERSON_NOUNS = [
  'Ehemann', 'Ehefrau', 'Partner', 'Enkel', 'Enkelin', 'Nichte', 'Schwiegermutter', 'Mieter', 'Vermieter',
  'Hausmeister', 'Handwerker', 'Mitbewohner', 'Arbeitgeber', 'Arbeitnehmer', 'Bewerber', 'Teilnehmer',
  'Lehrkraft', 'Zahnarzt', 'Sachbearbeiter', 'Empfänger', 'Absender', 'Verbraucher', 'Zuschauer', 'Bürger',
];

/** Places you can be in and go into. */
export const PLACE_NOUNS = [
  'Keller', 'Treppenhaus', 'Wartezimmer', 'Kaufhaus', 'Kantine', 'Kneipe', 'Apotheke', 'Praxis', 'Fitnessstudio',
  'Biergarten', 'Grundschule', 'Volkshochschule', 'Jugendherberge', 'Reisebüro', 'Filiale', 'Umkleidekabine',
  'Notaufnahme', 'Wald', 'Kita',
];

const PERSONS_SET = new Set(PERSON_NOUNS);
const PLACES_SET = new Set(PLACE_NOUNS);

export function nounsFor(sem: Sem): GenNoun[] {
  if (sem === 'person') return NOUNS.filter((n) => PERSONS_SET.has(n.de));
  if (sem === 'place') return NOUNS.filter((n) => PLACES_SET.has(n.de));
  return NOUNS;
}

/* ------------------------------------------------------------- questions */

export interface GenQuestion {
  /** Cell key: "<det>-<case>-<gender>", e.g. "poss-dat-pl". Progress is kept per cell. */
  cell: string;
  frame: Frame;
  noun: GenNoun;
  det: Det;
  g: Gender;
  /** The sentence with ___. */
  text: string;
  /** The noun and its article, e.g. "der Mietvertrag" or "die Mieter (Pl.)". */
  hint: string;
  answer: string;
  /** Wrong options (3). */
  wrong: string[];
}

export const cellKey = (d: GenDet, c: Case, g: Gender) => `${d}-${c}-${g}`;

/** A noun phrase in one case, or null when one part does not exist. */
function phrase(det: Det, c: Case, g: Gender, noun: GenNoun): string | null {
  const d = detForm(det, c, g);
  const n = nounForm(noun, c, g === 'pl');
  return d && n ? `${d} ${n}` : null;
}

function frameAllows(f: Frame, d: GenDet, g: Gender): boolean {
  if (!f.dets.includes(d)) return false;
  if (g === 'pl' && (!f.plural || d === 'ein')) return false;
  if (f.defOnlyFPl && d === 'der' && (g === 'm' || g === 'n')) return false;
  return true;
}

/** All cells the generator can produce. */
export function generatorCells(): string[] {
  const out = new Set<string>();
  for (const f of FRAMES)
    for (const d of f.dets)
      for (const g of ['m', 'f', 'n', 'pl'] as Gender[]) {
        if (!frameAllows(f, d, g)) continue;
        const pool = nounsFor(f.sem).filter((n) => (g === 'pl' ? n.plural : n.g === g) && nounForm(n, f.c, g === 'pl'));
        if (pool.length > 0) out.add(cellKey(d, f.c, g));
      }
  return [...out].sort();
}

const pick = <T>(xs: readonly T[], rnd: () => number): T => xs[Math.floor(rnd() * xs.length)];

/**
 * A question for one cell ("poss-dat-pl"), or a random one. Wrong options are
 * the same noun in the other cases, then common slips (missing Dativ -n, the
 * article of another gender), so each is wrong in this frame.
 */
export function generate(cell?: string, rnd: () => number = Math.random): GenQuestion | null {
  const cells = cell ? [cell] : generatorCells();
  for (let attempt = 0; attempt < 20; attempt++) {
    const key = pick(cells, rnd);
    const [d, c, g] = key.split('-') as [GenDet, Case, Gender];
    const frames = FRAMES.filter((f) => f.c === c && frameAllows(f, d, g));
    if (frames.length === 0) return null;
    const frame = pick(frames, rnd);
    const pool = nounsFor(frame.sem).filter((n) => (g === 'pl' ? n.plural : n.g === g) && nounForm(n, c, g === 'pl'));
    if (pool.length === 0) continue;
    const noun = pick(pool, rnd);
    const det: Det = d === 'poss' ? pick(POSSESSIVES, rnd) : d;
    const answer = phrase(det, c, g, noun);
    if (!answer) continue;

    // Anything that would be a correct phrase here (the singular and the plural can look alike: der/die Mieter).
    const valid = new Set([phrase(det, c, noun.g, noun), phrase(det, c, 'pl', noun), answer]);
    const wrong: string[] = [];
    const add = (s: string | null) => {
      if (s && !valid.has(s) && !wrong.includes(s) && wrong.length < 3) wrong.push(s);
    };
    // Same noun, other cases.
    for (const other of ['nom', 'akk', 'dat', 'gen'] as Case[]) if (other !== c) add(phrase(det, other, g, noun));
    // Slips: Dativ plural without -n; the article of another gender with the right noun form.
    const n = nounForm(noun, c, g === 'pl')!;
    if (g === 'pl' && c === 'dat' && noun.plural) add(`${detForm(det, 'dat', 'pl')} ${noun.plural}`);
    for (const og of ['m', 'f', 'n', 'pl'] as Gender[]) if (og !== g && detForm(det, c, og)) add(`${detForm(det, c, og)} ${n}`);
    for (const other of ['nom', 'akk', 'dat', 'gen'] as Case[])
      for (const og of ['m', 'f', 'n'] as Gender[]) add(detForm(det, other, og) ? `${detForm(det, other, og)} ${n}` : null);
    if (wrong.length < 3) continue;

    const plural = g === 'pl';
    const text = plural ? (frame.pl ?? frame.sg) : frame.sg;
    const base = plural ? `die ${noun.plural} (Pl.)` : `${noun.article} ${noun.de}`;
    const hint = det === 'der' ? base : `${det} + ${base}`;
    return { cell: key, frame, noun, det, g, text, hint, answer, wrong };
  }
  return null;
}
