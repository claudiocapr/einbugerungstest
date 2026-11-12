/**
 * Einprägen (memorise): which case after a verb, a preposition, or a verb /
 * adjective / noun with its fixed preposition. Every item carries the answer,
 * a short reason and a memory tip (Merktipp), in German and English.
 *
 * Progress ids: "merk:<set>:<key>". Pure functions, tested without a browser.
 */
import type { ItemProgress, Text2 } from '../../types.ts';
import type { VocabEntry } from '../types.ts';
import { historyOf, isDue, isWeak, strength } from '../../lib/srs.ts';
import { vocab } from '../wortschatz.ts';
import type { Case } from './forms.ts';
import { PREPS, PREP_KIND_NAME, type PrepInfo, type PrepKind } from './rules.ts';
import { VERB_CASE_ITEMS, type VerbCase, type VerbCaseItem } from './merken-verben.ts';

export { VERB_CASE_ITEMS, type VerbCase, type VerbCaseItem };

export type MerkSet = 'verb' | 'praep' | 'vprep';
export const MERK_SETS: MerkSet[] = ['verb', 'praep', 'vprep'];
/** The drill routes: the three sets plus the learner's own mistakes. */
export type MerkDrill = MerkSet | 'fehler';
export const MERK_DRILLS: MerkDrill[] = [...MERK_SETS, 'fehler'];
export const isMerkDrill = (s: string | undefined): s is MerkDrill => (MERK_DRILLS as string[]).includes(s ?? '');

export const MERK_PREFIX = 'merk:';
export const merkId = (set: MerkSet, key: string) => `${MERK_PREFIX}${set}:${key}`;
export function parseMerkId(id: string): { set: MerkSet; key: string } | null {
  if (!id.startsWith(MERK_PREFIX)) return null;
  const rest = id.slice(MERK_PREFIX.length);
  const i = rest.indexOf(':');
  if (i < 0) return null;
  const set = rest.slice(0, i);
  if (!(MERK_SETS as string[]).includes(set)) return null;
  return { set: set as MerkSet, key: rest.slice(i + 1) };
}

/** Items per round. */
export const MERK_ROUND = 8;
/** Correct answers in a row until an item "sitzt". */
export const MERK_TARGET = 3;

type Rnd = () => number;

function shuffled<T>(xs: readonly T[], rnd: Rnd): T[] {
  const out = xs.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const t = (de: string, en: string): Text2 => ({ de, en });

/* ===================================================== 1 · Verb + Fall */

export const VERB_CASE_OPTIONS: VerbCase[] = ['nom', 'akk', 'dat', 'datakk'];
export const VERB_CASE_NAME: Record<VerbCase, Text2> = {
  nom: t('Nominativ', 'nominative'),
  akk: t('Akkusativ', 'accusative'),
  dat: t('Dativ', 'dative'),
  datakk: t('Dativ + Akkusativ', 'dative + accusative'),
};

export function verbReason(item: VerbCaseItem): Text2 {
  switch (item.c) {
    case 'dat':
      return t(`${item.verb} + Dativ (wem?): ${item.example}`, `„${item.verb}“ takes the dative (wem? – to whom?): ${item.example}`);
    case 'akk':
      return t(`${item.verb} + Akkusativ (wen? / was?): ${item.example}`, `„${item.verb}“ takes the accusative (wen? / was?): ${item.example}`);
    case 'datakk':
      return t(
        `${item.verb} + Dativ der Person (wem?) + Akkusativ der Sache (was?): ${item.example}`,
        `„${item.verb}“: the person (wem?) is dative, the thing (was?) accusative: ${item.example}`,
      );
    case 'nom':
      return t(`${item.verb} + Nominativ – beide Seiten sind Nominativ: ${item.example}`, `„${item.verb}“ links two nominatives: ${item.example}`);
  }
}

/* ============================================== 2 · Präposition + Fall */

export const PREP_KIND_OPTIONS: PrepKind[] = ['akk', 'dat', 'wechsel', 'gen'];
export const PREP_KIND_LABEL: Record<PrepKind, string> = { akk: 'Akkusativ', dat: 'Dativ', wechsel: 'Wechsel', gen: 'Genitiv' };

/** The Eselsbrücke for each group of prepositions. */
export const PREP_GROUP_TIP: Record<PrepKind, Text2 & { chant: string }> = {
  akk: {
    de: 'DOGFUB: durch – ohne – gegen – für – um – bis (+ entlang) → immer Akkusativ.',
    en: 'DOGFUB: durch – ohne – gegen – für – um – bis (+ entlang) → always accusative.',
    chant: 'durch, ohne, gegen, für, um, bis. Immer Akkusativ.',
  },
  dat: {
    de: 'aus – bei – mit – nach – seit – von – zu (+ gegenüber, ab, außer) → immer Dativ. Im Rhythmus sprechen!',
    en: 'aus – bei – mit – nach – seit – von – zu (+ gegenüber, ab, außer) → always dative. Say it rhythmically!',
    chant: 'aus, bei, mit, nach, seit, von, zu. Immer Dativ!',
  },
  wechsel: {
    de: 'an, auf, hinter, in, neben, über, unter, vor, zwischen: Wo? → Dativ · Wohin? → Akkusativ.',
    en: 'an, auf, hinter, in, neben, über, unter, vor, zwischen: Wo? (where) → dative · Wohin? (where to) → accusative.',
    chant: 'an, auf, hinter, in, neben, über, unter, vor, zwischen. Wo? Dativ. Wohin? Akkusativ.',
  },
  gen: {
    de: 'wegen, trotz, während, statt (+ innerhalb, außerhalb) → Genitiv: wegen des Wetters.',
    en: 'wegen, trotz, während, statt (+ innerhalb, außerhalb) → genitive: wegen des Wetters.',
    chant: 'wegen, trotz, während, statt. Genitiv. Wegen des Wetters.',
  },
};

/** Extra, preposition-specific tips (added to the group tip). */
const PREP_TIP: Record<string, Text2> = {
  bis: t('Meist ohne Artikel (bis Montag) oder mit zweiter Präposition: bis zum Bahnhof – dann bestimmt zu den Fall (Dativ).', 'Usually without an article (bis Montag) or with a second preposition: bis zum Bahnhof – then zu decides (dative).'),
  entlang: t('Meist nachgestellt mit Akkusativ: den Fluss entlang.', 'Usually after the noun, with the accusative: den Fluss entlang.'),
  um: t('Auch für die Uhrzeit: um acht Uhr. Ort: um den Tisch herum.', 'Also for clock times: um acht Uhr. Place: um den Tisch herum.'),
  für: t('für dich, für meinen Vater – nie für dir.', 'für dich, für meinen Vater – never für dir.'),
  zu: t('Auch mit Bewegung bleibt zu Dativ: Ich gehe zum Arzt (zu dem).', 'zu stays dative even with movement: Ich gehe zum Arzt (zu dem).'),
  nach: t('nach Hause, nach Berlin, nach dem Essen – immer Dativ.', 'nach Hause, nach Berlin, nach dem Essen – always dative.'),
  seit: t('seit + Dativ auch für Zeit: seit einem Jahr (nicht: seit ein Jahr).', 'seit + dative for time too: seit einem Jahr (not: seit ein Jahr).'),
  bei: t('bei = Ort einer Person oder Firma: bei meinen Eltern, beim Arzt.', 'bei = at a person’s or company’s place: bei meinen Eltern, beim Arzt.'),
  gegenüber: t('Bei Pronomen oft nachgestellt: mir gegenüber.', 'Often after a pronoun: mir gegenüber.'),
  ab: t('ab dem 1. Mai, ab nächster Woche – ab + Dativ.', 'ab dem 1. Mai, ab nächster Woche – ab + dative.'),
  außer: t('außer mir, außer meiner Kollegin – außer + Dativ.', 'außer mir, außer meiner Kollegin – außer + dative.'),
  in: t('Wo? in der Stadt (Dativ) – Wohin? in die Stadt (Akkusativ). im = in dem, ins = in das.', 'Wo? in der Stadt (dative) – Wohin? in die Stadt (accusative). im = in dem, ins = in das.'),
  an: t('Wo? an der Wand (Dativ) – Wohin? an die Wand (Akkusativ). am = an dem, ans = an das.', 'Wo? an der Wand (dative) – Wohin? an die Wand (accusative). am = an dem, ans = an das.'),
  auf: t('Wo? auf dem Tisch (Dativ) – Wohin? auf den Tisch (Akkusativ).', 'Wo? auf dem Tisch (dative) – Wohin? auf den Tisch (accusative).'),
  über: t('Ort: über dem Tisch (Wo?) / über den Tisch (Wohin?). Als „about“ nach Verben immer Akkusativ: sprechen über + Akk.', 'Place: über dem Tisch (where?) / über den Tisch (where to?). As “about” after verbs always accusative: sprechen über + acc.'),
  vor: t('Zeit („ago“) ist Dativ: vor einem Jahr. Ort: Wo? vor dem Haus / Wohin? vor das Haus.', 'Time (“ago”) is dative: vor einem Jahr. Place: where? vor dem Haus / where to? vor das Haus.'),
  wegen: t('Gesprochen oft mit Dativ (wegen dem Wetter) – in der Prüfung Genitiv: wegen des Wetters.', 'Often dative in speech (wegen dem Wetter) – in the exam the genitive: wegen des Wetters.'),
};

export const prepTip = (p: PrepInfo): Text2 => {
  const g = PREP_GROUP_TIP[p.kind];
  const extra = PREP_TIP[p.prep];
  return extra ? t(`${g.de} ${extra.de}`, `${g.en} ${extra.en}`) : t(g.de, g.en);
};

export function prepReason(p: PrepInfo): Text2 {
  const k = PREP_KIND_NAME[p.kind];
  return t(`${p.prep} + ${k.de} (${p.en}): ${p.example}`, `${p.prep} + ${k.en} (${p.en}): ${p.example}`);
}

/* ================================== 3 · Verb / Adjektiv / Nomen + Präposition */

export type PrepCase = 'akk' | 'dat';

export interface GovPair {
  prep: string;
  c: PrepCase;
  /** Other prepositions written with a slash: "in/bei + Dat" → ['bei']. */
  alt: string[];
}

export interface GovParse {
  /** The words before the first preposition: "sich freuen", "Angst haben", "der Nachweis". */
  frame: string;
  /** Every preposition + case found, in order; the first is the question. */
  pairs: GovPair[];
}

const PREP_SET = new Set(PREPS.map((p) => p.prep));
const CASE_OF: Record<string, PrepCase | undefined> = { Akk: 'akk', Dat: 'dat' };

/**
 * Reads a vocabulary `government` field such as "warten auf + Akk",
 * "sich freuen auf + Akk (Zukunft) / über + Akk (Gegenwart)",
 * "gratulieren + Dat zu + Dat" or "durchfallen in/bei + Dat".
 * Returns null when there is no preposition with Akk or Dat.
 */
export function parseGovernment(gov: string): GovParse | null {
  const clean = gov
    .replace(/\([^)]*\)/g, ' ')
    .replace(/:/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const segments = clean.split(/\s*(?:\s\/\s|;)\s*/).filter(Boolean);
  const pairs: GovPair[] = [];
  let frame = '';
  segments.forEach((seg, si) => {
    const re = /(\S+)\s*\+\s*(Akk|Dat|Nom|Gen)\b/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(seg))) {
      const preps = m[1].split('/');
      const c = CASE_OF[m[2]];
      if (!c || !preps.every((p) => PREP_SET.has(p))) continue;
      if (pairs.length === 0) {
        frame = seg.slice(0, m.index).replace(/\s*\+\s*(Akk|Dat|Nom|Gen)\b/g, '').trim();
        if (!frame && si > 0) {
          // A continuation ("… / bei + Dat"): the frame is in the first segment.
          const first = /(\S+)\s*\+/.exec(segments[0]);
          frame = first ? segments[0].slice(0, first.index).trim() : '';
        }
      }
      if (!pairs.some((p) => p.prep === preps[0] && p.c === c)) pairs.push({ prep: preps[0], c, alt: preps.slice(1) });
    }
  });
  frame = frame.replace(/\s+/g, ' ').trim();
  if (!frame || pairs.length === 0) return null;
  return { frame, pairs };
}

/** "auf + Akk" */
export const pairText = (p: { prep: string; c: PrepCase }) => `${p.prep} + ${p.c === 'akk' ? 'Akk' : 'Dat'}`;
/** All pairs of a government, for the feedback: "auf + Akk / über + Akk". */
export const pairsText = (pairs: GovPair[]) => pairs.map((p) => (p.alt.length ? `${[p.prep, ...p.alt].join('/')} + ${p.c === 'akk' ? 'Akk' : 'Dat'}` : pairText(p))).join(' · ');

export interface VPrepItem {
  key: string;
  /** Shown before the gap: "warten", "stolz sein", "die Angst". */
  frame: string;
  pos: VocabEntry['pos'];
  en: string;
  /** The first preposition + case: the answer. */
  pair: GovPair;
  pairs: GovPair[];
  /** The full government as written, for the feedback. */
  government: string;
  example: string;
  exampleEn: string;
  /** Prepositions that are also possible with this word (never offered as wrong options). */
  alsoOk: string[];
}

export const vprepKey = (frame: string) =>
  frame
    .toLowerCase()
    .replace(/^(der|die|das)\s+/, '')
    .replace(/[^a-zäöüß\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

/**
 * Prepositions that are also correct with a word, though not the pattern
 * being taught (warten mit dem Essen, Angst haben um jemanden …). They are
 * never offered as wrong options.
 */
const ALSO_OK: Record<string, string[]> = {
  warten: ['mit'], denken: ['über', 'von'], erzählen: ['über'], berichten: ['über', 'von'], lachen: ['mit'], diskutieren: ['mit'],
  'sich-streiten': ['um'], schimpfen: ['auf'], 'sich-informieren': ['bei'], 'sich-erkundigen': ['bei'], 'sich-melden': ['zu', 'für'],
  'sich-vorbereiten': ['für'], 'sich-anmelden': ['bei', 'an'], 'sich-entscheiden': ['gegen'], 'sich-einsetzen': ['gegen'],
  protestieren: ['für'], aussteigen: ['an'], stammen: ['von'], einziehen: ['bei'], passen: ['in', 'auf'], sterben: ['vor'],
  verschieben: ['um', 'von'], riechen: ['an'], handeln: ['von', 'um'], 'sich-verabreden': ['zu'], 'sich-treffen': ['zu'],
  schützen: ['gegen'], fliehen: ['aus', 'nach'], erfahren: ['über'], zählen: ['auf'], 'sich-einigen': ['über', 'mit'],
  wütend: ['über'], begeistert: ['über'], enttäuscht: ['über'], interesse: ['für'], 'lust-haben': ['zu'],
  einladen: ['in', 'auf', 'für'], 'tätig-sein': ['in'], bestehen: ['auf', 'in'], bekannt: ['bei'], 'angst-haben': ['um'],
  sprechen: ['über', 'mit', 'von', 'gegen', 'zu'], reden: ['über', 'mit', 'von'], fragen: ['um', 'bei'], freude: ['an'],
  gespräch: ['mit'], böse: ['mit', 'über'], 'kontakt-haben': ['mit'], 'sich-ärgern': ['auf'], 'sich-freuen': ['für'],
  'sich-bewerben': ['als', 'auf', 'für'], schreiben: ['über', 'mit'], arbeiten: ['bei', 'mit', 'für'], glücklich: ['mit'],
  froh: ['um'], liebe: ['für'], 'sich-verabschieden': ['bei'], vermieten: ['zu', 'für'], befördern: ['in'], ausbilden: ['an'],
  nachweis: ['für'], versichern: ['bei'], 'anzeige-erstatten': ['bei'], mitmachen: ['in'], halten: ['an'], reagieren: ['mit'],
  sorgen: ['um'], anfangen: ['bei'], führen: ['nach'], bereit: ['für'], besorgt: ['über'], angst: ['um'], grund: ['zu'],
  sorge: ['über'], beschwerde: ['gegen'], information: ['von', 'zu'], diskussion: ['mit'], bewerbung: ['als', 'bei', 'auf', 'für'],
};

/** Words whose preposition is really a place or time phrase (ankommen in, abholen von): too many prepositions fit. */
const SKIP = new Set(['ankommen', 'abholen']);

/**
 * Hand-written patterns that the vocabulary does not list but every B1
 * learner needs, especially the nouns (die Angst vor + Dat).
 */
const EXTRA: { pos: VocabEntry['pos']; government: string; en: string; example: string; exampleEn: string }[] = [
  { pos: 'verb', government: 'sprechen über + Akk / mit + Dat', en: 'to talk about', example: 'Wir sprechen über das Wetter.', exampleEn: 'We are talking about the weather.' },
  { pos: 'verb', government: 'reden über + Akk / mit + Dat', en: 'to talk about', example: 'Lass uns morgen über das Problem reden.', exampleEn: 'Let’s talk about the problem tomorrow.' },
  { pos: 'verb', government: 'fragen nach + Dat', en: 'to ask about', example: 'Ein Tourist fragt nach dem Weg.', exampleEn: 'A tourist is asking for directions.' },
  { pos: 'verb', government: 'suchen nach + Dat', en: 'to search for', example: 'Die Polizei sucht nach dem Täter.', exampleEn: 'The police are searching for the culprit.' },
  { pos: 'verb', government: 'sich sehnen nach + Dat', en: 'to long for', example: 'Im Winter sehne ich mich nach der Sonne.', exampleEn: 'In winter I long for the sun.' },
  { pos: 'verb', government: 'sich beteiligen an + Dat', en: 'to take part in', example: 'Viele Nachbarn beteiligen sich an dem Fest.', exampleEn: 'Many neighbours take part in the party.' },
  { pos: 'verb', government: 'arbeiten an + Dat', en: 'to work on', example: 'Ich arbeite gerade an einem Projekt.', exampleEn: 'I am working on a project at the moment.' },
  { pos: 'verb', government: 'schreiben an + Akk', en: 'to write to', example: 'Ich schreibe eine E-Mail an die Hausverwaltung.', exampleEn: 'I am writing an email to the property management.' },
  { pos: 'verb', government: 'sich vorstellen bei + Dat', en: 'to have an interview with', example: 'Morgen stelle ich mich bei einer Firma vor.', exampleEn: 'Tomorrow I have an interview with a company.' },
  { pos: 'verb', government: 'danken für + Akk', en: 'to thank for', example: 'Ich danke Ihnen für Ihre Hilfe.', exampleEn: 'Thank you for your help.' },
  { pos: 'verb', government: 'erinnern an + Akk', en: 'to remind of', example: 'Erinnere mich bitte an den Termin!', exampleEn: 'Please remind me of the appointment!' },
  { pos: 'verb', government: 'sich unterscheiden von + Dat', en: 'to differ from', example: 'Das neue Modell unterscheidet sich kaum von dem alten.', exampleEn: 'The new model hardly differs from the old one.' },
  { pos: 'verb', government: 'sich beklagen über + Akk', en: 'to complain about', example: 'Die Mieter beklagen sich über die hohen Nebenkosten.', exampleEn: 'The tenants complain about the high service charges.' },
  { pos: 'verb', government: 'bestehen auf + Dat', en: 'to insist on', example: 'Der Vermieter besteht auf der Kaution.', exampleEn: 'The landlord insists on the deposit.' },
  { pos: 'verb', government: 'sich schämen für + Akk', en: 'to be ashamed of', example: 'Du musst dich nicht für deinen Akzent schämen.', exampleEn: 'You don’t need to be ashamed of your accent.' },
  { pos: 'verb', government: 'sich amüsieren über + Akk', en: 'to be amused by', example: 'Die Kinder amüsieren sich über den Clown.', exampleEn: 'The children are amused by the clown.' },
  { pos: 'adjective', government: 'froh über + Akk', en: 'glad about', example: 'Ich bin froh über die gute Nachricht.', exampleEn: 'I am glad about the good news.' },
  { pos: 'adjective', government: 'traurig über + Akk', en: 'sad about', example: 'Sie ist traurig über den Abschied.', exampleEn: 'She is sad about the farewell.' },
  { pos: 'adjective', government: 'glücklich über + Akk', en: 'happy about', example: 'Wir sind glücklich über unsere neue Wohnung.', exampleEn: 'We are happy about our new flat.' },
  { pos: 'adjective', government: 'böse auf + Akk', en: 'angry with', example: 'Bist du noch böse auf mich?', exampleEn: 'Are you still angry with me?' },
  { pos: 'adjective', government: 'sauer auf + Akk', en: 'cross with', example: 'Mein Chef ist sauer auf mich.', exampleEn: 'My boss is cross with me.' },
  { pos: 'adjective', government: 'neidisch auf + Akk', en: 'jealous of, envious of', example: 'Er ist neidisch auf das neue Auto seines Nachbarn.', exampleEn: 'He is envious of his neighbour’s new car.' },
  { pos: 'adjective', government: 'neugierig auf + Akk', en: 'curious about', example: 'Ich bin neugierig auf deine Fotos.', exampleEn: 'I am curious about your photos.' },
  { pos: 'adjective', government: 'angewiesen auf + Akk', en: 'dependent on', example: 'Meine Oma ist auf Hilfe angewiesen.', exampleEn: 'My grandma depends on help.' },
  { pos: 'adjective', government: 'fertig mit + Dat', en: 'finished with', example: 'Bist du schon fertig mit den Hausaufgaben?', exampleEn: 'Have you finished your homework yet?' },
  { pos: 'adjective', government: 'einverstanden mit + Dat', en: 'in agreement with', example: 'Ich bin mit dem Vorschlag einverstanden.', exampleEn: 'I agree with the proposal.' },
  { pos: 'adjective', government: 'befreundet mit + Dat', en: 'friends with', example: 'Ich bin seit Jahren mit ihr befreundet.', exampleEn: 'I have been friends with her for years.' },
  { pos: 'adjective', government: 'freundlich zu + Dat', en: 'friendly to', example: 'Die Verkäuferin war sehr freundlich zu mir.', exampleEn: 'The shop assistant was very friendly to me.' },
  { pos: 'adjective', government: 'bereit zu + Dat', en: 'ready for', example: 'Ich bin bereit zu einem Gespräch.', exampleEn: 'I am ready for a talk.' },
  { pos: 'adjective', government: 'überzeugt von + Dat', en: 'convinced of', example: 'Ich bin von der Idee überzeugt.', exampleEn: 'I am convinced of the idea.' },
  { pos: 'adjective', government: 'besorgt um + Akk', en: 'worried about', example: 'Die Eltern sind besorgt um ihren Sohn.', exampleEn: 'The parents are worried about their son.' },
  { pos: 'adjective', government: 'erstaunt über + Akk', en: 'astonished at', example: 'Ich war erstaunt über den niedrigen Preis.', exampleEn: 'I was astonished at the low price.' },
  { pos: 'adjective', government: 'gut in + Dat', en: 'good at (a subject)', example: 'Meine Tochter ist gut in Mathe.', exampleEn: 'My daughter is good at maths.' },
  { pos: 'adjective', government: 'beschäftigt mit + Dat', en: 'busy with', example: 'Ich bin gerade mit dem Umzug beschäftigt.', exampleEn: 'I am busy with the move at the moment.' },
  { pos: 'noun', government: 'die Angst vor + Dat', en: 'fear of', example: 'Viele haben Angst vor der Prüfung.', exampleEn: 'Many people are afraid of the exam.' },
  { pos: 'noun', government: 'die Freude über + Akk', en: 'joy about', example: 'Die Freude über das Geschenk war groß.', exampleEn: 'The joy about the present was great.' },
  { pos: 'noun', government: 'die Frage nach + Dat', en: 'the question about', example: 'Die Frage nach dem Preis kam sofort.', exampleEn: 'The question about the price came at once.' },
  { pos: 'noun', government: 'die Antwort auf + Akk', en: 'the answer to', example: 'Ich warte noch auf eine Antwort auf meine E-Mail.', exampleEn: 'I am still waiting for an answer to my email.' },
  { pos: 'noun', government: 'der Grund für + Akk', en: 'the reason for', example: 'Was ist der Grund für die Verspätung?', exampleEn: 'What is the reason for the delay?' },
  { pos: 'noun', government: 'die Bitte um + Akk', en: 'the request for', example: 'Wir haben Ihre Bitte um einen Termin erhalten.', exampleEn: 'We have received your request for an appointment.' },
  { pos: 'noun', government: 'der Wunsch nach + Dat', en: 'the wish for', example: 'Der Wunsch nach mehr Freizeit ist groß.', exampleEn: 'The wish for more free time is strong.' },
  { pos: 'noun', government: 'die Hoffnung auf + Akk', en: 'the hope for', example: 'Die Hoffnung auf besseres Wetter bleibt.', exampleEn: 'The hope for better weather remains.' },
  { pos: 'noun', government: 'die Sorge um + Akk', en: 'the worry about', example: 'Die Sorge um ihre Mutter lässt sie nicht schlafen.', exampleEn: 'Her worry about her mother keeps her awake.' },
  { pos: 'noun', government: 'das Gespräch über + Akk', en: 'the conversation about', example: 'Das Gespräch über die Gehaltserhöhung war kurz.', exampleEn: 'The conversation about the pay rise was short.' },
  { pos: 'noun', government: 'die Einladung zu + Dat', en: 'the invitation to', example: 'Danke für die Einladung zu deiner Party!', exampleEn: 'Thanks for the invitation to your party!' },
  { pos: 'noun', government: 'der Glückwunsch zu + Dat', en: 'congratulations on', example: 'Herzlichen Glückwunsch zum Geburtstag!', exampleEn: 'Happy birthday!' },
  { pos: 'noun', government: 'die Teilnahme an + Dat', en: 'participation in', example: 'Die Teilnahme an dem Kurs ist kostenlos.', exampleEn: 'Taking part in the course is free.' },
  { pos: 'noun', government: 'die Beschwerde über + Akk', en: 'the complaint about', example: 'Wir haben eine Beschwerde über den Lärm bekommen.', exampleEn: 'We have received a complaint about the noise.' },
  { pos: 'noun', government: 'die Information über + Akk', en: 'information about', example: 'Hier finden Sie Informationen über die Kurse.', exampleEn: 'Here you can find information about the courses.' },
  { pos: 'noun', government: 'die Diskussion über + Akk', en: 'the discussion about', example: 'Die Diskussion über das neue Gesetz dauert an.', exampleEn: 'The discussion about the new law goes on.' },
  { pos: 'noun', government: 'die Liebe zu + Dat', en: 'love of, love for', example: 'Seine Liebe zu der Musik begann früh.', exampleEn: 'His love of music started early.' },
  { pos: 'noun', government: 'der Respekt vor + Dat', en: 'respect for', example: 'Wir haben großen Respekt vor seiner Leistung.', exampleEn: 'We have great respect for his achievement.' },
  { pos: 'noun', government: 'die Kritik an + Dat', en: 'criticism of', example: 'Die Kritik an dem Plan war deutlich.', exampleEn: 'The criticism of the plan was clear.' },
  { pos: 'noun', government: 'die Suche nach + Dat', en: 'the search for', example: 'Die Suche nach einer Wohnung ist schwierig.', exampleEn: 'The search for a flat is difficult.' },
  { pos: 'noun', government: 'die Bewerbung um + Akk', en: 'the application for', example: 'Vielen Dank für Ihre Bewerbung um die Stelle.', exampleEn: 'Thank you for your application for the position.' },
];

/** The phrase a vocabulary entry is headed by, ready to show before the gap. */
function displayFrame(e: Pick<VocabEntry, 'pos' | 'article' | 'de'>, frame: string): string {
  if (e.pos === 'noun' && e.article && !/^(der|die|das)\s/.test(frame) && frame === e.de) return `${e.article} ${frame}`;
  return frame;
}

/** Whether a vocabulary entry is a preposition itself ("je nach + Dat"), not a word that governs one. */
const isPrepositionEntry = (de: string, pos: VocabEntry['pos'], pair: GovPair) => {
  const words = de.replace(/[.…!?]/g, '').trim().split(/\s+/);
  return pos === 'phrase' && words.length <= 2 && words[words.length - 1] === pair.prep;
};

function buildVPrep(): VPrepItem[] {
  const out: VPrepItem[] = [];
  const seen = new Set<string>();
  const add = (pos: VocabEntry['pos'], de: string, article: VocabEntry['article'], government: string, en: string, example: string, exampleEn: string) => {
    const parsed = parseGovernment(government);
    if (!parsed) return;
    const [pair] = parsed.pairs;
    if (isPrepositionEntry(de, pos, pair)) return;
    const frame = displayFrame({ pos, article, de }, parsed.frame);
    const key = vprepKey(frame);
    if (!key || seen.has(key) || SKIP.has(key)) return;
    seen.add(key);
    const alsoOk = [...new Set([...parsed.pairs.flatMap((p) => [p.prep, ...p.alt]), ...(ALSO_OK[key] ?? [])])];
    out.push({ key, frame, pos, en, pair, pairs: parsed.pairs, government, example, exampleEn, alsoOk });
  };
  for (const e of vocab) if (e.government) add(e.pos, e.de, e.article, e.government, e.en, e.example, e.exampleEn);
  for (const x of EXTRA) add(x.pos, '', undefined, x.government, x.en, x.example, x.exampleEn);
  return out;
}

export const VPREP_ITEMS: VPrepItem[] = buildVPrep();

/** Prepositions that come up after verbs, adjectives and nouns; used for wrong options. */
const VPREP_POOL = ['auf', 'an', 'über', 'für', 'mit', 'von', 'zu', 'um', 'vor', 'nach', 'in', 'bei', 'aus', 'gegen'];
const FIXED: Record<string, PrepCase> = Object.fromEntries(
  PREPS.filter((p) => p.kind === 'akk' || p.kind === 'dat').map((p) => [p.prep, p.kind as PrepCase]),
);

/** The answer plus three wrong options: the same preposition with the other case, and two other prepositions. */
export function vprepOptions(item: VPrepItem, rnd: Rnd): string[] {
  const right = pairText(item.pair);
  const other = pairText({ prep: item.pair.prep, c: item.pair.c === 'akk' ? 'dat' : 'akk' });
  const pool = shuffled(VPREP_POOL.filter((p) => !item.alsoOk.includes(p) && p !== item.pair.prep), rnd);
  const out = [right, other];
  for (const p of pool) {
    if (out.length >= 4) break;
    const c: PrepCase = FIXED[p] ?? (rnd() < 0.5 ? 'akk' : 'dat');
    const o = pairText({ prep: p, c });
    if (!out.includes(o)) out.push(o);
  }
  return out;
}

/** A memory tip for a preposition + case after a verb, adjective or noun. */
export function vprepTip(item: VPrepItem): Text2 {
  const { prep, c } = item.pair;
  if (FIXED[prep] === 'dat')
    return t(`mit/von/zu/bei/nach/aus/seit → immer Dativ – auch nach Verben: ${item.frame} ${prep} + Dat.`, `mit/von/zu/bei/nach/aus/seit → always dative – after verbs too: ${item.frame} ${prep} + dat.`);
  if (FIXED[prep] === 'akk')
    return t(`für/um/gegen/durch/ohne → immer Akkusativ – auch nach Verben: ${item.frame} ${prep} + Akk.`, `für/um/gegen/durch/ohne → always accusative – after verbs too: ${item.frame} ${prep} + acc.`);
  switch (`${prep}:${c}`) {
    case 'über:akk':
      return t('über + Akk = „about“: sprechen, sich ärgern, sich freuen, nachdenken über + Akk. Nach Verben fast immer Akkusativ.', 'über + acc = “about”: sprechen, sich ärgern, sich freuen, nachdenken über + acc. After verbs almost always accusative.');
    case 'auf:akk':
      return t('auf + Akk bei Verben des Wartens/Freuens auf Zukünftiges: warten, hoffen, sich freuen, sich vorbereiten auf + Akk. Nach Verben und Adjektiven ist auf fast immer Akkusativ (stolz auf, achten auf).', 'auf + acc with verbs of waiting/looking forward to something to come: warten, hoffen, sich freuen, sich vorbereiten auf + acc. After verbs and adjectives auf is almost always accusative (stolz auf, achten auf).');
    case 'auf:dat':
      return t('Ausnahme! Nach Verben ist auf fast immer Akkusativ – nur bestehen auf + Dativ und wenige andere.', 'Exception! After verbs auf is almost always accusative – only bestehen auf + dative and a few others.');
    case 'an:akk':
      return t('an + Akk bei Kopf-Verben: denken, sich erinnern, glauben, sich gewöhnen an + Akk – der Gedanke geht an etwas hin.', 'an + acc with “head” verbs: denken, sich erinnern, glauben, sich gewöhnen an + acc – the thought goes towards something.');
    case 'an:dat':
      return t('an + Dat bei Teilnahme, Krankheit, Zweifel, Interesse: teilnehmen, leiden, sterben, zweifeln an + Dat · Interesse an + Dat.', 'an + dat for taking part, illness, doubt, interest: teilnehmen, leiden, sterben, zweifeln an + dat · Interesse an + dat.');
    case 'vor:dat':
      return t('vor + Dat bei Angst und Schutz: Angst haben, sich fürchten, warnen, schützen, fliehen vor + Dat.', 'vor + dat for fear and protection: Angst haben, sich fürchten, warnen, schützen, fliehen vor + dat.');
    case 'in:akk':
      return t('in + Akk bei Bewegung hinein oder Gefühl: sich verlieben, einziehen, einsteigen, sich einarbeiten in + Akk.', 'in + acc for moving into something or feelings: sich verlieben, einziehen, einsteigen, sich einarbeiten in + acc.');
    case 'in:dat':
      return t('in + Dat für einen Ort oder Bereich (Wo?): ankommen in, gut in, sich auskennen in + Dat.', 'in + dat for a place or field (where?): ankommen in, gut in, sich auskennen in + dat.');
    case 'unter:dat':
      return t('leiden unter + Dativ – wie „unter einer Last“: Wo? → Dativ.', 'leiden unter + dative – like “under a burden”: where? → dative.');
    default:
      return t(`Als Paket lernen: ${item.frame} ${pairText(item.pair)}.`, `Learn it as one chunk: ${item.frame} ${pairText(item.pair)}.`);
  }
}

export function vprepReason(item: VPrepItem): Text2 {
  const others = pairsText(item.pairs.slice(1));
  const more = others ? t(` Auch: ${item.frame} ${others}.`, ` Also: ${item.frame} ${others}.`) : t('', '');
  return t(
    `${item.frame} ${pairText(item.pair)}: ${item.example}${more.de}`,
    `${item.frame} ${pairText(item.pair)} (${item.en}): ${item.example}${more.en}`,
  );
}

/* ========================================================== questions */

export interface MerkQuestion {
  id: string;
  set: MerkSet;
  /** What is asked: "helfen", "mit", "warten ___". */
  prompt: string;
  /** Small hint under the prompt: "(+ Person)". */
  cue?: Text2;
  /** English meaning. */
  gloss: string;
  task: Text2;
  options: string[];
  answer: number;
  /** The case of the answer, for colouring. */
  kase?: Case;
  reason: Text2;
  tip: Text2;
  /** Read aloud after answering. */
  example: string;
  /** What the end screen lists: "helfen", "mit", "warten auf + Akk". */
  label: string;
  /** Read aloud: the rule and the example ("helfen – Dativ. Ich helfe …"). */
  chant: string;
}

export const VERB_BY_KEY = new Map(VERB_CASE_ITEMS.map((v) => [v.key, v]));
export const PREP_BY_KEY = new Map(PREPS.map((p) => [p.prep, p]));
export const VPREP_BY_KEY = new Map(VPREP_ITEMS.map((v) => [v.key, v]));

export function idsForSet(set: MerkSet): string[] {
  switch (set) {
    case 'verb':
      return VERB_CASE_ITEMS.map((v) => merkId('verb', v.key));
    case 'praep':
      return PREPS.map((p) => merkId('praep', p.prep));
    case 'vprep':
      return VPREP_ITEMS.map((v) => merkId('vprep', v.key));
  }
}

const verbCaseKase: Record<VerbCase, Case | undefined> = { nom: 'nom', akk: 'akk', dat: 'dat', datakk: undefined };

export function merkQuestion(id: string, rnd: Rnd = Math.random): MerkQuestion | null {
  const parsed = parseMerkId(id);
  if (!parsed) return null;
  const { set, key } = parsed;
  if (set === 'verb') {
    const v = VERB_BY_KEY.get(key);
    if (!v) return null;
    return {
      id,
      set,
      prompt: v.verb,
      cue: v.cue,
      gloss: v.en,
      task: t('Welcher Fall folgt?', 'Which case follows?'),
      options: VERB_CASE_OPTIONS.map((c) => VERB_CASE_NAME[c].de),
      answer: VERB_CASE_OPTIONS.indexOf(v.c),
      kase: verbCaseKase[v.c],
      reason: verbReason(v),
      tip: v.tip,
      example: v.example,
      label: v.verb,
      chant: `${v.verb}: ${VERB_CASE_NAME[v.c].de.replace('+', 'und')}. ${v.example}`,
    };
  }
  if (set === 'praep') {
    const p = PREP_BY_KEY.get(key);
    if (!p) return null;
    return {
      id,
      set,
      prompt: p.prep,
      gloss: p.en,
      task: t('Welcher Fall folgt?', 'Which case follows?'),
      options: PREP_KIND_OPTIONS.map((k) => PREP_KIND_LABEL[k]),
      answer: PREP_KIND_OPTIONS.indexOf(p.kind),
      kase: p.kind === 'wechsel' ? undefined : p.kind,
      reason: prepReason(p),
      tip: prepTip(p),
      example: p.example,
      label: p.prep,
      chant: `${p.prep}: ${p.kind === 'wechsel' ? 'Wo? Dativ. Wohin? Akkusativ' : PREP_KIND_NAME[p.kind].de}. ${p.example}`,
    };
  }
  const item = VPREP_BY_KEY.get(key);
  if (!item) return null;
  const opts = vprepOptions(item, rnd);
  const shown = shuffled(opts, rnd);
  return {
    id,
    set,
    prompt: `${item.frame} ___`,
    gloss: item.en,
    task: t('Welche Präposition gehört fest dazu – und welcher Fall?', 'Which preposition goes with it – and which case?'),
    options: shown,
    answer: shown.indexOf(opts[0]),
    kase: item.pair.c,
    reason: vprepReason(item),
    tip: vprepTip(item),
    example: item.example,
    label: `${item.frame} ${pairText(item.pair)}`,
    chant: `${item.frame} ${item.pair.prep}, ${item.pair.c === 'akk' ? 'Akkusativ' : 'Dativ'}. ${item.example}`,
  };
}

/* ============================================================= rounds */

/** Whether a progress id still names an item (content can change between versions). */
export function merkExists(id: string): boolean {
  const p = parseMerkId(id);
  if (!p) return false;
  return p.set === 'verb' ? VERB_BY_KEY.has(p.key) : p.set === 'praep' ? PREP_BY_KEY.has(p.key) : VPREP_BY_KEY.has(p.key);
}

/** An item "sitzt" when its last three answers were right. */
export function sitzt(p: ItemProgress | undefined): boolean {
  const h = historyOf(p).slice(0, MERK_TARGET);
  return h.length === MERK_TARGET && h.every((a) => a.ok);
}

/** Everything ever answered wrong in an Einprägen drill, weakest and most recently wrong first. */
export function fehlerIds(progress: Record<string, ItemProgress>, now = Date.now()): string[] {
  return Object.keys(progress)
    .filter((id) => merkExists(id) && ((progress[id].wrong ?? 0) > 0 || historyOf(progress[id]).some((a) => !a.ok)))
    .map((id) => ({ id, sits: sitzt(progress[id]) ? 1 : 0, s: strength(progress[id], now), at: progress[id].lastSeen ?? 0 }))
    .sort((a, b) => a.sits - b.sits || a.s - b.s || b.at - a.at)
    .map((x) => x.id);
}

/**
 * The items of one round: never practised and not sitting yet come after
 * what is due or weak; items that already sit come last.
 */
export function pickMerkIds(drill: MerkDrill, progress: Record<string, ItemProgress>, rnd: Rnd = Math.random, now = Date.now(), n = MERK_ROUND): string[] {
  if (drill === 'fehler') return fehlerIds(progress, now).slice(0, n);
  const ids = idsForSet(drill);
  const seenIds = ids.filter((id) => historyOf(progress[id]).length > 0);
  const weak = shuffled(seenIds.filter((id) => !sitzt(progress[id]) || isWeak(progress[id], now)), rnd).sort(
    (a, b) => strength(progress[a], now) - strength(progress[b], now),
  );
  const due = shuffled(seenIds.filter((id) => !weak.includes(id) && isDue(progress[id], now)), rnd);
  const fresh = shuffled(ids.filter((id) => historyOf(progress[id]).length === 0), rnd);
  const rest = shuffled(seenIds.filter((id) => !weak.includes(id) && !due.includes(id)), rnd);
  // Half of the round at most for old weak items, so new ground is covered too.
  const firstWeak = weak.slice(0, Math.ceil(n / 2));
  const picked = [...firstWeak, ...due, ...fresh, ...weak.slice(firstWeak.length), ...rest];
  return shuffled([...new Set(picked)].slice(0, n), rnd);
}

export interface MerkStats {
  total: number;
  practised: number;
  sitzen: number;
}

export function merkStats(drill: MerkDrill, progress: Record<string, ItemProgress>, now = Date.now()): MerkStats {
  const ids = drill === 'fehler' ? fehlerIds(progress, now) : idsForSet(drill);
  let practised = 0;
  let sitzen = 0;
  for (const id of ids) {
    if (historyOf(progress[id]).length > 0) practised++;
    if (sitzt(progress[id])) sitzen++;
  }
  return { total: ids.length, practised, sitzen };
}

/* ======================================================== Merktipps page */

export interface TipGroup {
  title: Text2;
  text: Text2;
  /** Words that follow the rule. */
  words: string[];
  chant?: string;
  c?: Case | 'wechsel';
}

/** The case tips for verbs, collected for the Merktipps page. */
export const VERB_TIP_GROUPS: TipGroup[] = [
  {
    c: 'dat',
    title: t('Dativ-Verben: Die Person bekommt etwas', 'Dative verbs: the person receives something'),
    text: t('Dativ-Verben haben fast immer eine Person als Empfänger: Wem hilfst du? Hilfe, Dank, eine Antwort, einen Rat – die Person bekommt es.', 'Dative verbs almost always have a person who receives something: Wem hilfst du? Help, thanks, an answer, advice – the person gets it.'),
    words: ['helfen', 'danken', 'gratulieren', 'antworten', 'glauben', 'vertrauen', 'raten', 'verzeihen', 'folgen', 'begegnen', 'schaden', 'nützen', 'Bescheid sagen'],
    chant: 'helfen, danken, gratulieren, antworten, glauben, vertrauen. Wem? Dativ.',
  },
  {
    c: 'dat',
    title: t('Die Sache ist Subjekt', 'The thing is the subject'),
    text: t('Gefallen: Das Buch gefällt mir – das Ding ist Subjekt! Genauso: Die Suppe schmeckt mir. Die Hose passt mir. Das Auto gehört mir. Der Kopf tut mir weh.', 'gefallen: Das Buch gefällt mir – the thing is the subject! The same: Die Suppe schmeckt mir. Die Hose passt mir. Das Auto gehört mir. Der Kopf tut mir weh.'),
    words: ['gefallen', 'schmecken', 'passen', 'stehen', 'gehören', 'fehlen', 'wehtun', 'leidtun', 'gelingen', 'einfallen', 'auffallen', 'es geht'],
    chant: 'Das Buch gefällt mir. Die Suppe schmeckt mir. Es tut mir leid.',
  },
  {
    c: 'dat',
    title: t('zu- → Dativ', 'zu- → dative'),
    text: t('Verben mit zu- nehmen den Dativ wie die Präposition zu: Hör mir zu! Ich stimme dir zu. Das Gegenteil widersprechen auch.', 'Verbs with zu- take the dative like the preposition zu: Hör mir zu! Ich stimme dir zu. The opposite, widersprechen, too.'),
    words: ['zuhören', 'zustimmen', 'widersprechen'],
    chant: 'Hör mir zu! Ich stimme dir zu.',
  },
  {
    c: 'akk',
    title: t('Fallen: Diese Verben sind Akkusativ', 'Traps: these verbs take the accusative'),
    text: t('anrufen/fragen sind Akkusativ – ich rufe dich an, ich frage dich. Die meisten Verben sind Akkusativ; Dativ ist die Ausnahme.', 'anrufen/fragen take the accusative – ich rufe dich an, ich frage dich. Most verbs take the accusative; the dative is the exception.'),
    words: ['anrufen', 'fragen', 'besuchen', 'treffen', 'unterstützen', 'beraten', 'vermissen', 'kennen', 'lieben', 'stören', 'heiraten', 'einladen'],
    chant: 'Ich rufe dich an. Ich frage dich. Ich besuche dich.',
  },
  {
    c: 'akk',
    title: t('Paare, die man verwechselt', 'Pairs people mix up'),
    text: t('helfen + Dat ↔ unterstützen + Akk · raten + Dat ↔ beraten + Akk · begegnen + Dat ↔ treffen + Akk · fehlen + Dat ↔ vermissen + Akk.', 'helfen + dat ↔ unterstützen + acc · raten + dat ↔ beraten + acc · begegnen + dat ↔ treffen + acc · fehlen + dat ↔ vermissen + acc.'),
    words: [],
    chant: 'Ich helfe dir. Ich unterstütze dich. Du fehlst mir. Ich vermisse dich.',
  },
  {
    title: t('Dativ + Akkusativ: Wem? und Was?', 'Dative + accusative: to whom? and what?'),
    text: t('Geben-Verben: Die Person (wem?) steht im Dativ, die Sache (was?) im Akkusativ. Ich gebe dem Kind den Ball.', 'Giving verbs: the person (to whom?) is dative, the thing (what?) accusative. Ich gebe dem Kind den Ball.'),
    words: ['geben', 'schenken', 'zeigen', 'erklären', 'schicken', 'bringen', 'leihen', 'empfehlen', 'erzählen', 'kaufen', 'schreiben', 'wünschen', 'sagen', 'anbieten', 'erlauben', 'verbieten', 'versprechen'],
    chant: 'Ich gebe dem Kind den Ball. Ich gebe ihn ihm.',
  },
  {
    c: 'nom',
    title: t('sein, werden, bleiben, heißen = Gleichheitszeichen', 'sein, werden, bleiben, heißen = an equals sign'),
    text: t('Beide Seiten stehen im Nominativ: Er ist ein guter Freund. Sie wird eine gute Ärztin.', 'Both sides are nominative: Er ist ein guter Freund. Sie wird eine gute Ärztin.'),
    words: ['sein', 'werden', 'bleiben', 'heißen'],
    chant: 'Er ist ein guter Freund. Sie wird eine gute Ärztin.',
  },
];

/** Patterns for verb / adjective / noun + preposition. */
export const VPREP_TIP_GROUPS: TipGroup[] = [
  {
    c: 'dat',
    title: t('mit/von/zu/bei/nach/aus/seit → immer Dativ', 'mit/von/zu/bei/nach/aus/seit → always dative'),
    text: t('Auch nach Verben und Adjektiven ändert sich nichts.', 'Nothing changes after verbs and adjectives either.'),
    words: ['sich beschäftigen mit', 'zufrieden mit', 'träumen von', 'abhängig von', 'einladen zu', 'sich bewerben bei', 'fragen nach', 'bestehen aus'],
    chant: 'sich beschäftigen mit dem Thema. träumen von dem Urlaub. einladen zu der Party.',
  },
  {
    c: 'akk',
    title: t('für/um/gegen → immer Akkusativ', 'für/um/gegen → always accusative'),
    text: t('DOGFUB gilt auch nach Verben.', 'DOGFUB applies after verbs too.'),
    words: ['sich interessieren für', 'sich kümmern um', 'sich bewerben um', 'protestieren gegen', 'allergisch gegen', 'verantwortlich für'],
    chant: 'Ich interessiere mich für den Kurs. Ich kümmere mich um den Hund.',
  },
  {
    c: 'akk',
    title: t('über + Akk = „about“', 'über + acc = “about”'),
    text: t('Wenn über „about“ bedeutet, steht immer der Akkusativ.', 'When über means “about”, it always takes the accusative.'),
    words: ['sprechen über', 'sich ärgern über', 'sich freuen über', 'nachdenken über', 'sich informieren über', 'diskutieren über', 'sich beschweren über'],
    chant: 'Wir sprechen über den Film. Ich ärgere mich über den Lärm.',
  },
  {
    c: 'akk',
    title: t('auf + Akk: Warten und Freuen auf Zukünftiges', 'auf + acc: waiting for and looking forward to something'),
    text: t('auf + Akk bei Verben des Wartens/Freuens auf Zukünftiges – und fast immer nach Verben und Adjektiven. Ausnahme: bestehen auf + Dat.', 'auf + acc with verbs of waiting/looking forward to the future – and almost always after verbs and adjectives. Exception: bestehen auf + dat.'),
    words: ['warten auf', 'sich freuen auf', 'hoffen auf', 'sich vorbereiten auf', 'achten auf', 'sich verlassen auf', 'stolz auf', 'gespannt auf'],
    chant: 'Ich warte auf den Bus. Ich freue mich auf das Wochenende.',
  },
  {
    c: 'akk',
    title: t('an + Akk: Kopf-Verben', 'an + acc: “head” verbs'),
    text: t('Denken und Erinnern: Der Gedanke geht an etwas hin → Akkusativ.', 'Thinking and remembering: the thought goes towards something → accusative.'),
    words: ['denken an', 'sich erinnern an', 'glauben an', 'sich gewöhnen an', 'sich wenden an'],
    chant: 'Ich denke an dich. Ich erinnere mich an den Urlaub.',
  },
  {
    c: 'dat',
    title: t('an + Dat: Teilnahme, Krankheit, Zweifel', 'an + dat: taking part, illness, doubt'),
    text: t('Hier ist man „an einem Ort“ dabei → Dativ.', 'Here you are “at” something → dative.'),
    words: ['teilnehmen an', 'leiden an', 'sterben an', 'zweifeln an', 'interessiert an', 'das Interesse an', 'schuld an'],
    chant: 'Ich nehme an dem Kurs teil. Ich zweifle an der Idee.',
  },
  {
    c: 'dat',
    title: t('vor + Dat: Angst und Schutz', 'vor + dat: fear and protection'),
    text: t('Wovor? Immer Dativ.', 'Afraid of what? Always dative.'),
    words: ['Angst haben vor', 'die Angst vor', 'sich fürchten vor', 'warnen vor', 'schützen vor', 'fliehen vor'],
    chant: 'Ich habe Angst vor dem Hund.',
  },
  {
    title: t('Die Frage verrät die Präposition', 'The question gives the preposition away'),
    text: t('Worauf wartest du? Woran denkst du? Wovon träumst du? Mit Personen: Auf wen wartest du? – Immer als Paket lernen: Verb + Präposition + Fall + Beispielsatz.', 'Worauf wartest du? Woran denkst du? Wovon träumst du? With people: Auf wen wartest du? – Always learn it as one chunk: verb + preposition + case + example.'),
    words: [],
    chant: 'Worauf wartest du? Auf den Bus. Woran denkst du? An dich.',
  },
];
