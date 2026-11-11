/**
 * What decides the case: verbs, prepositions and sentence functions. Used by
 * the "Warum dieser Fall?" page and to word the feedback of every exercise.
 */
import type { Text2 } from '../../types.ts';
import type { Case } from './forms.ts';

/* ------------------------------------------------------------------ verbs */

export interface VerbInfo {
  verb: string;
  en: string;
  example: string;
}

/** Verbs with a Dativ object (and no Akkusativ object). */
export const DAT_VERBS: VerbInfo[] = [
  { verb: 'helfen', en: 'to help', example: 'Ich helfe meiner Mutter.' },
  { verb: 'danken', en: 'to thank', example: 'Wir danken Ihnen für die Einladung.' },
  { verb: 'gefallen', en: 'to please, to like', example: 'Die Wohnung gefällt mir.' },
  { verb: 'gehören', en: 'to belong to', example: 'Das Auto gehört meinem Vater.' },
  { verb: 'gratulieren', en: 'to congratulate', example: 'Ich gratuliere dir zum Geburtstag.' },
  { verb: 'antworten', en: 'to answer', example: 'Bitte antworten Sie der Kundin.' },
  { verb: 'passen', en: 'to fit, to suit', example: 'Die Hose passt mir nicht.' },
  { verb: 'schmecken', en: 'to taste good to', example: 'Schmeckt dir die Suppe?' },
  { verb: 'fehlen', en: 'to be missing; to be missed by', example: 'Du fehlst mir.' },
  { verb: 'folgen', en: 'to follow', example: 'Folgen Sie dem Schild.' },
  { verb: 'glauben', en: 'to believe (someone)', example: 'Ich glaube dir.' },
  { verb: 'vertrauen', en: 'to trust', example: 'Sie vertraut ihrer Freundin.' },
  { verb: 'zuhören', en: 'to listen to', example: 'Hör mir bitte zu!' },
  { verb: 'begegnen', en: 'to meet by chance', example: 'Ich bin meinem Lehrer begegnet.' },
  { verb: 'raten', en: 'to advise', example: 'Der Arzt rät mir, mehr zu schlafen.' },
  { verb: 'leidtun', en: 'to be sorry', example: 'Es tut mir leid.' },
  { verb: 'wehtun', en: 'to hurt', example: 'Mir tut der Kopf weh.' },
  { verb: 'zustimmen', en: 'to agree with', example: 'Ich stimme dir zu.' },
  { verb: 'schaden', en: 'to harm', example: 'Rauchen schadet der Gesundheit.' },
  { verb: 'gelingen', en: 'to succeed', example: 'Der Kuchen ist mir gelungen.' },
  { verb: 'es geht', en: 'how someone is', example: 'Wie geht es Ihnen?' },
];

/** Verbs with a person in the Dativ and a thing in the Akkusativ. */
export const DAT_AKK_VERBS: VerbInfo[] = [
  { verb: 'geben', en: 'to give', example: 'Ich gebe dem Kind den Ball.' },
  { verb: 'schenken', en: 'to give (as a present)', example: 'Ich schenke meiner Freundin einen Schal.' },
  { verb: 'zeigen', en: 'to show', example: 'Er zeigt den Gästen die Stadt.' },
  { verb: 'erklären', en: 'to explain', example: 'Die Lehrerin erklärt den Schülern die Regel.' },
  { verb: 'schicken', en: 'to send', example: 'Wir schicken unserer Oma eine Karte.' },
  { verb: 'bringen', en: 'to bring', example: 'Der Kellner bringt dem Gast die Rechnung.' },
  { verb: 'leihen', en: 'to lend', example: 'Kannst du mir dein Fahrrad leihen?' },
  { verb: 'empfehlen', en: 'to recommend', example: 'Ich empfehle der Kundin dieses Modell.' },
  { verb: 'erzählen', en: 'to tell', example: 'Er erzählt seinen Kindern eine Geschichte.' },
  { verb: 'schreiben', en: 'to write', example: 'Ich schreibe meiner Tante einen Brief.' },
  { verb: 'kaufen', en: 'to buy (for someone)', example: 'Sie kauft ihrem Sohn ein Fahrrad.' },
  { verb: 'wünschen', en: 'to wish', example: 'Wir wünschen Ihnen einen schönen Abend.' },
  { verb: 'sagen', en: 'to say, to tell', example: 'Kannst du mir die Uhrzeit sagen?' },
  { verb: 'anbieten', en: 'to offer', example: 'Darf ich Ihnen einen Kaffee anbieten?' },
];

/** A few frequent Akkusativ verbs (most verbs are). */
export const AKK_VERBS = ['haben', 'brauchen', 'sehen', 'kennen', 'besuchen', 'fragen', 'anrufen', 'suchen', 'finden', 'kaufen', 'nehmen', 'treffen', 'bezahlen', 'vergessen', 'lieben', 'es gibt'];

/** Verbs that link two Nominatives. */
export const NOM_VERBS = ['sein', 'werden', 'bleiben', 'heißen'];

/* ----------------------------------------------------------- prepositions */

export type PrepKind = 'akk' | 'dat' | 'wechsel' | 'gen';

export interface PrepInfo {
  prep: string;
  kind: PrepKind;
  en: string;
  example: string;
  note?: Text2;
}

export const PREPS: PrepInfo[] = [
  { prep: 'durch', kind: 'akk', en: 'through', example: 'Wir gehen durch den Park.' },
  { prep: 'ohne', kind: 'akk', en: 'without', example: 'Ohne meine Brille sehe ich nichts.' },
  { prep: 'gegen', kind: 'akk', en: 'against; around (time)', example: 'Wir sind gegen den Plan.' },
  { prep: 'für', kind: 'akk', en: 'for', example: 'Das Geschenk ist für meinen Vater.' },
  { prep: 'um', kind: 'akk', en: 'around; at (time)', example: 'Wir sitzen um den Tisch herum.' },
  { prep: 'bis', kind: 'akk', en: 'until, as far as', example: 'Bis nächsten Montag!', note: { de: 'Meist ohne Artikel oder mit zweiter Präposition: bis zum Bahnhof.', en: 'Usually without an article or with a second preposition: bis zum Bahnhof.' } },
  { prep: 'entlang', kind: 'akk', en: 'along', example: 'Wir gehen den Fluss entlang.', note: { de: 'Steht meist nach dem Nomen: den Fluss entlang.', en: 'Usually comes after the noun: den Fluss entlang.' } },
  { prep: 'aus', kind: 'dat', en: 'out of, from (origin)', example: 'Sie kommt aus der Türkei.' },
  { prep: 'bei', kind: 'dat', en: 'at (someone’s place), near', example: 'Ich wohne bei meinen Eltern.' },
  { prep: 'mit', kind: 'dat', en: 'with, by (transport)', example: 'Ich fahre mit dem Bus.' },
  { prep: 'nach', kind: 'dat', en: 'after; to (cities, countries)', example: 'Nach dem Essen trinken wir Kaffee.' },
  { prep: 'seit', kind: 'dat', en: 'since, for (time)', example: 'Seit einem Jahr lerne ich Deutsch.' },
  { prep: 'von', kind: 'dat', en: 'from, of', example: 'Das Paket ist von meinem Bruder.' },
  { prep: 'zu', kind: 'dat', en: 'to (people, places)', example: 'Ich gehe zu meiner Ärztin.' },
  { prep: 'gegenüber', kind: 'dat', en: 'opposite', example: 'Die Apotheke ist gegenüber dem Bahnhof.' },
  { prep: 'ab', kind: 'dat', en: 'from (time, place)', example: 'Ab dem 1. Mai gilt der neue Fahrplan.' },
  { prep: 'außer', kind: 'dat', en: 'except', example: 'Außer meiner Kollegin waren alle da.' },
  { prep: 'an', kind: 'wechsel', en: 'at, on (vertical)', example: 'Das Bild hängt an der Wand. · Ich hänge das Bild an die Wand.' },
  { prep: 'auf', kind: 'wechsel', en: 'on (horizontal)', example: 'Das Buch liegt auf dem Tisch. · Ich lege das Buch auf den Tisch.' },
  { prep: 'hinter', kind: 'wechsel', en: 'behind', example: 'Der Schlüssel liegt hinter der Tür.' },
  { prep: 'in', kind: 'wechsel', en: 'in, into', example: 'Sie ist in der Küche. · Sie geht in die Küche.' },
  { prep: 'neben', kind: 'wechsel', en: 'next to', example: 'Ich sitze neben meiner Freundin. · Ich setze mich neben meine Freundin.' },
  { prep: 'über', kind: 'wechsel', en: 'above, over; about', example: 'Die Lampe hängt über dem Tisch.' },
  { prep: 'unter', kind: 'wechsel', en: 'under', example: 'Die Katze schläft unter dem Bett.' },
  { prep: 'vor', kind: 'wechsel', en: 'in front of; ago', example: 'Das Auto steht vor dem Haus.' },
  { prep: 'zwischen', kind: 'wechsel', en: 'between', example: 'Zwischen den Fenstern steht ein Regal.' },
  { prep: 'wegen', kind: 'gen', en: 'because of', example: 'Wegen des Wetters bleiben wir zu Hause.', note: { de: 'Gesprochen oft mit Dativ (wegen dem Wetter) – in der Prüfung Genitiv.', en: 'Often used with the dative in speech – use the genitive in the exam.' } },
  { prep: 'trotz', kind: 'gen', en: 'despite', example: 'Trotz des Regens gehen wir spazieren.' },
  { prep: 'während', kind: 'gen', en: 'during', example: 'Während der Prüfung ist das Handy aus.' },
  { prep: 'statt', kind: 'gen', en: 'instead of', example: 'Statt eines Kuchens kaufe ich Obst.' },
  { prep: 'innerhalb', kind: 'gen', en: 'within', example: 'Innerhalb einer Woche bekommen Sie eine Antwort.' },
  { prep: 'außerhalb', kind: 'gen', en: 'outside (of)', example: 'Außerhalb der Öffnungszeiten ist das Büro geschlossen.' },
];

export const PREP_KIND_NAME: Record<PrepKind, Text2> = {
  akk: { de: 'Akkusativ', en: 'accusative' },
  dat: { de: 'Dativ', en: 'dative' },
  wechsel: { de: 'Wechsel (Wo? Dat · Wohin? Akk)', en: 'two-way (where? dat · where to? acc)' },
  gen: { de: 'Genitiv', en: 'genitive' },
};

export const CONTRACTIONS: [string, string][] = [
  ['in dem', 'im'],
  ['in das', 'ins'],
  ['an dem', 'am'],
  ['an das', 'ans'],
  ['zu dem', 'zum'],
  ['zu der', 'zur'],
  ['bei dem', 'beim'],
  ['von dem', 'vom'],
];

/* ------------------------------------------------------------- triggers */

/**
 * The reason for a case, written as a short key in the content files:
 *   v:helfen        verb with Dativ           → "helfen + Dativ"
 *   vp:geben        Dat+Akk verb, the person  → "geben: Person (wem?) → Dativ"
 *   vt:geben        Dat+Akk verb, the thing   → "geben: Sache (was?) → Akkusativ"
 *   va:besuchen     Akkusativ verb            → "besuchen + Akkusativ (wen/was?)"
 *   p:mit           preposition with a fixed case
 *   pa:sprechen über  verb + Wechselpräposition that always takes the Akkusativ
 *   wo:auf / wohin:auf   Wechselpräposition
 *   subj, sein, werden, esgibt, genattr, refl-akk, refl-dat, alone, wer, zeit
 */
export type Trigger = string;

const PREP_BY_NAME = new Map(PREPS.map((p) => [p.prep, p]));

export function triggerCase(t: Trigger): Case | null {
  const [kind, word] = t.split(':');
  switch (kind) {
    case 'v':
    case 'vp':
      return 'dat';
    case 'vt':
    case 'va':
    case 'pa':
      return 'akk';
    case 'p': {
      const k = PREP_BY_NAME.get(word)?.kind;
      return k === 'akk' || k === 'dat' || k === 'gen' ? k : null;
    }
    case 'wo':
      return 'dat';
    case 'wohin':
      return 'akk';
    case 'subj':
    case 'sein':
    case 'werden':
      return 'nom';
    case 'esgibt':
    case 'zeit':
    case 'refl-akk':
      return 'akk';
    case 'refl-dat':
      return 'dat';
    case 'genattr':
      return 'gen';
    default:
      return null;
  }
}

/** A short, bilingual reason: "helfen + Dativ (wem?)". */
export function triggerText(t: Trigger): Text2 {
  const [kind, word] = t.split(':');
  switch (kind) {
    case 'v':
      return { de: `${word} + Dativ (wem?)`, en: `„${word}“ takes the dative (wem?)` };
    case 'vp':
      return { de: `${word} + Dativ der Person (wem?) + Akkusativ der Sache`, en: `„${word}“: the person (wem?) is dative, the thing accusative` };
    case 'vt':
      return { de: `${word}: die Sache (was?) steht im Akkusativ, die Person im Dativ`, en: `„${word}“: the thing (was?) is accusative, the person dative` };
    case 'va':
      return { de: `${word} + Akkusativ (wen? / was?)`, en: `„${word}“ takes an accusative object (wen? / was?)` };
    case 'p': {
      const k = PREP_BY_NAME.get(word)?.kind ?? 'dat';
      const name = PREP_KIND_NAME[k];
      return { de: `${word} + ${name.de}`, en: `„${word}“ always takes the ${name.en}` };
    }
    case 'pa':
      return { de: `${word} + Akkusativ (feste Verbindung)`, en: `„${word}“ always takes the accusative (fixed phrase)` };
    case 'wo':
      return { de: `${word} + Wo? (Ort, keine Bewegung zum Ziel) → Dativ`, en: `„${word}“ + where? (position) → dative` };
    case 'wohin':
      return { de: `${word} + Wohin? (Richtung, Ziel) → Akkusativ`, en: `„${word}“ + where to? (direction) → accusative` };
    case 'subj':
      return { de: 'Subjekt (wer? / was? tut etwas) → Nominativ', en: 'the subject (who/what does it) → nominative' };
    case 'sein':
      return { de: 'sein + Nominativ (Das ist …)', en: '„sein“ links two nominatives (Das ist …)' };
    case 'werden':
      return { de: 'werden + Nominativ', en: '„werden“ links two nominatives' };
    case 'esgibt':
      return { de: 'es gibt + Akkusativ', en: '„es gibt“ takes the accusative' };
    case 'zeit':
      return { de: 'Zeitangabe ohne Präposition → Akkusativ (jeden Tag)', en: 'a time phrase without a preposition → accusative (jeden Tag)' };
    case 'genattr':
      return { de: 'Besitz: wessen? → Genitiv', en: 'possession: whose? → genitive' };
    case 'refl-akk':
      return { de: 'Reflexivpronomen ohne weiteres Objekt → Akkusativ', en: 'reflexive pronoun with no other object → accusative' };
    case 'refl-dat':
      return { de: 'Es gibt schon ein Akkusativ-Objekt → Reflexivpronomen im Dativ', en: 'there is already an accusative object → the reflexive pronoun is dative' };
    default:
      return { de: word ?? kind, en: word ?? kind };
  }
}
