/**
 * Merktipps: the memory rules German teachers give for the article (Genus),
 * the plural and the Perfekt. Pure functions over the vocabulary, so they can
 * be tested against every entry.
 *
 * Reliability is stated honestly:
 *   "immer"      – no exceptions in everyday German,
 *   "fast immer" – a handful of well-known exceptions,
 *   "meistens"   – a strong tendency with real exceptions.
 * genderTip() also says whether a word obeys its rule, so exceptions can be
 * flagged ("Ausnahme! …") instead of being taught as if they followed it.
 */
import type { Text2 } from '../types.ts';
import type { VocabEntry } from './types.ts';
import { vocab } from './wortschatz.ts';

export type Article = 'der' | 'die' | 'das';
export type Reliability = 'immer' | 'fast immer' | 'meistens';

export const RELIABILITY: Record<Reliability, Text2> = {
  immer: { de: 'immer', en: 'always' },
  'fast immer': { de: 'fast immer', en: 'almost always' },
  meistens: { de: 'meistens', en: 'mostly' },
};

/** What a rule looks at: the word (or the last part of a compound) and what we know about it. */
interface Ctx {
  /** The word the rule is applied to, as written ("Wohnung"). */
  w: string;
  low: string;
  /** English glosses of the entry (and of the compound's last part), lower case. */
  en: string;
  plural?: string;
}

export interface GenderRule {
  id: string;
  /** The article the rule predicts. */
  article: Article;
  /** Name of the pattern: "-ung", "Wochentage …". */
  label: Text2;
  reliability: Reliability;
  /** One or two sentences with examples, as a teacher would say it. */
  tip: Text2;
  /** Well-known exceptions worth knowing, also from outside the word list. */
  exceptions?: string[];
  /** "word": a closed list of whole words; "pattern": an ending, a prefix or a meaning. */
  kind: 'word' | 'pattern';
  test: (c: Ctx) => boolean;
}

/** "Das letzte Wort entscheidet" – the article comes from the compound's last part. */
export const COMPOUND_RULE = {
  id: 'kompositum',
  label: { de: 'Zusammengesetzte Wörter', en: 'Compound nouns' },
  reliability: 'fast immer' as Reliability,
  tip: {
    de: 'Bei zusammengesetzten Wörtern entscheidet das letzte Wort: die Tür → die Haustür, der Tag → der Geburtstag, das Zimmer → das Wohnzimmer.',
    en: 'In compound nouns the last word decides: die Tür → die Haustür, der Tag → der Geburtstag, das Zimmer → das Wohnzimmer.',
  },
  exceptions: ['das Gegenteil (der Teil)', 'der Mittwoch (die Woche)'],
};

/* ------------------------------------------------------------------ helpers */

const VOWEL = /[aeiouyäöü]/;
const CONSONANT = /[bcdfghjklmnpqrstvwxzß]/;

/** The word ends in `s` and has a real syllable before it (so "Sprung" is not an -ung word). */
const ends = (c: Ctx, s: string) => c.low.endsWith(s) && VOWEL.test(c.low.slice(0, -s.length));
/** The letter just before the ending `s`. */
const before = (c: Ctx, s: string) => c.low.charAt(c.low.length - s.length - 1);
const pluralEnds = (c: Ctx, s: string) => !!c.plural && c.plural !== '-' && c.plural.toLowerCase().endsWith(s);

const deUmlaut = (s: string) => s.replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/Ä/g, 'A').replace(/Ö/g, 'O').replace(/Ü/g, 'U');

/** The first meaning of each English gloss: "tenant (male)", "man; husband" → ["tenant", "man", "husband"]. */
const glossStarts = (en: string) =>
  en
    .split(/[,;/]/)
    .map((g) => g.replace(/\([^)]*\)/g, '').trim())
    .filter(Boolean);

const MALE_EN = /^(father|son|brother|uncle|grandfather|grandpa|husband|man|boy|nephew|gentleman|grandson|boyfriend|bridegroom|groom|king|monk|father-in-law|son-in-law|brother-in-law)$/;
const FEMALE_EN = /^(mother|daughter|sister|woman|wife|aunt|grandmother|grandma|granny|niece|lady|girlfriend|bride|queen|nun|midwife|mother-in-law|daughter-in-law|sister-in-law)$/;

const set = (words: string) => new Set(words.split(/\s+/).filter(Boolean).map((w) => w.toLowerCase()));

const TIMES = set(`montag dienstag mittwoch donnerstag freitag samstag sonnabend sonntag
  januar jänner februar märz april mai juni juli august september oktober november dezember
  frühling sommer herbst winter morgen vormittag mittag nachmittag abend nacht tag monat`);
const COMPASS = set('norden süden osten westen nordosten nordwesten südosten südwesten');
const WEATHER = set('regen schnee wind nebel sturm hagel frost donner blitz tau orkan hurrikan taifun tornado föhn schauer niederschlag sonnenschein wetter unwetter');
const CARS = set('bmw audi vw volkswagen mercedes opel porsche toyota ford fiat renault peugeot tesla skoda seat');
const DRINKS = set('wein sekt schnaps whisky wodka rum gin likör champagner cocktail alkohol bier');
const NUMBERS = set('null eins zwei drei vier fünf sechs sieben acht neun zehn elf zwölf zwanzig');
const METALS = set('gold silber eisen kupfer metall blei zinn zink aluminium platin messing blech stahl bronze');
const COLOURS = set('rot blau grün gelb schwarz weiß grau braun lila rosa pink türkis beige violett');
const LANGUAGES = set(`deutsch englisch französisch spanisch italienisch türkisch arabisch russisch polnisch
  chinesisch japanisch griechisch portugiesisch niederländisch ukrainisch persisch rumänisch kroatisch serbisch`);
const PLACES = set('hotel hostel café cafe kino restaurant theater lokal bistro');
const ENGLISH_ING = set(`training shopping camping meeting marketing recycling jogging mobbing casting leasing bowling
  coaching catering doping briefing piercing styling timing ranking rating banking onlinebanking homeschooling
  carsharing sharing booking feeling fitnesstraining`);
/** People named by an adjective or participle: der/die Bekannte. */
const ADJ_PERSONS = set(`verwandte bekannte angehörige jugendliche erwachsene vorgesetzte angestellte auszubildende
  deutsche kranke arbeitslose obdachlose reisende studierende alleinerziehende selbstständige abgeordnete
  verletzte geflüchtete erkrankte lehrende`);
/** Men and male animals in -e (n-Deklination). */
const WEAK_MASC = set('kollege kunde neffe zeuge junge beamte experte franzose bote laie pate riese löwe affe hase');
/** English words with a silent -e: the -e rule is about German words. */
const ENGLISH_E = set(`single smartphone service homeoffice office update image college interface device software hardware
  website homepage hotline deadline headline airline timeline online iphone`);
/** Infinitives used as nouns that the verb list may not contain. */
const INFINITIVES = set(`essen leben wissen rauchen schwimmen aussehen verhalten vertrauen einkommen unternehmen vergnügen
  fernsehen anschreiben einschreiben schreiben zusammenleben trinken lesen kochen treffen verfahren vorhaben
  verbrechen beben erleben abendessen mittagessen wiedersehen`);
/** Masculine nouns in -en that are not infinitives, although a verb of the same spelling may exist. */
const NOT_INFINITIVE = set(`laden wagen schaden rasen braten boden garten kuchen magen rücken hafen regen segen bogen faden
  haken knochen kragen reifen husten schnupfen frieden schinken posten streifen tropfen haufen graben rahmen daumen
  samen balken brocken kasten norden süden osten westen morgen becken zeichen`);
/** Devices in -er that are not derived from a verb in the list. */
const TOOLS_ER = set('computer toaster scanner router server container drucker wecker fernseher rechner lautsprecher staubsauger zähler stecker schalter');
/**
 * Words that end in another noun of the list without being built from it
 * (Nach|bar is not a bar, Aus|weis has no Eis, Schrift|steller no Teller).
 */
const NOT_COMPOUNDS = set(`nachbar auszubildende referat verband verkäufer nachweis hinweis ausweis beweis schalter moderator
  schriftsteller programm protest`);

/* ------------------------------------------------------------- vocab index */

interface Index {
  nouns: Map<string, VocabEntry>;
  verbs: Set<string>;
  /** Male forms that have a female form in -in in the list (Lehrer ← Lehrerin, Arzt ← Ärztin). */
  maleForms: Set<string>;
}

const isPluralOnly = (e: VocabEntry) => /plural only|\(plural\)\s*$/i.test(e.en);

let cached: Index | undefined;
function index(): Index {
  if (cached) return cached;
  const nouns = new Map<string, VocabEntry>();
  const verbs = new Set<string>();
  const maleForms = new Set<string>();
  for (const e of vocab) {
    if (e.pos === 'noun' && e.article && !/\s/.test(e.de) && !isPluralOnly(e)) {
      const key = e.de.toLowerCase();
      if (!nouns.has(key)) nouns.set(key, e);
      if (e.de.endsWith('in') && e.plural?.endsWith('innen')) {
        const base = e.de.slice(0, -2).toLowerCase();
        for (const b of [base, deUmlaut(base)]) {
          maleForms.add(b);
          maleForms.add(b + 'e');
        }
      }
    }
    if (e.pos === 'verb') {
      const inf = e.de.replace(/^sich /, '');
      if (!/\s/.test(inf)) verbs.add(inf.toLowerCase());
    }
  }
  cached = { nouns, verbs, maleForms };
  return cached;
}

const firstGlossMatches = (c: Ctx, re: RegExp) => glossStarts(c.en).some((g) => re.test(g));
const isMale = (c: Ctx) => /\(male\)/.test(c.en) || firstGlossMatches(c, MALE_EN) || index().maleForms.has(c.low) || WEAK_MASC.has(c.low);
const isFemale = (c: Ctx) => /\(female\)/.test(c.en) || firstGlossMatches(c, FEMALE_EN);

let verbStems: string[] | undefined;
/** "Fahrer" ← fahren, "Verkäufer" ← verkaufen, "Ordner" ← ordnen, "Arbeitgeber" ← geben. */
const fromVerb = (c: Ctx) => {
  const stem = c.low.slice(0, -2);
  const { verbs } = index();
  if (verbs.has(stem + 'en') || verbs.has(stem + 'n') || verbs.has(deUmlaut(stem) + 'en')) return true;
  verbStems ??= [...verbs].map((v) => v.replace(/e?n$/, '')).filter((v) => v.length >= 3);
  const plain = deUmlaut(stem);
  return verbStems.some((v) => stem.endsWith(v) || plain.endsWith(v));
};

/* ------------------------------------------------------------------- rules */

const r = (
  id: string,
  article: Article,
  kind: GenderRule['kind'],
  label: Text2,
  reliability: Reliability,
  tip: Text2,
  test: (c: Ctx) => boolean,
  exceptions?: string[],
): GenderRule => ({ id, article, kind, label, reliability, tip, test, ...(exceptions ? { exceptions } : {}) });

/**
 * In the order they are tried: specific before general, so "Mädchen" meets
 * -chen before "female persons", and "Kunde" meets "male persons" before -e.
 */
export const GENDER_RULES: GenderRule[] = [
  r('nur-plural', 'die', 'word', { de: 'Nur-Plural-Wörter', en: 'Plural-only words' }, 'immer', {
    de: 'Wörter, die es nur im Plural gibt, stehen immer mit die: die Eltern, die Leute, die Ferien.',
    en: 'Words that only exist in the plural always take die: die Eltern, die Leute, die Ferien.',
  }, () => false),
  r('chen', 'das', 'pattern', { de: '-chen, -lein', en: '-chen, -lein' }, 'immer', {
    de: 'Verkleinerungen auf -chen und -lein sind immer das: das Mädchen, das Brötchen, das Fräulein.',
    en: 'Diminutives in -chen and -lein are always das: das Mädchen, das Brötchen, das Fräulein.',
  }, (c) => (ends(c, 'chen') && CONSONANT.test(before(c, 'chen'))) || (ends(c, 'lein') && CONSONANT.test(before(c, 'lein')))),
  r('ing', 'das', 'word', { de: 'Englisch -ing', en: 'English -ing' }, 'meistens', {
    de: 'Englische Wörter auf -ing sind meistens das: das Training, das Meeting, das Shopping.',
    en: 'English words in -ing are mostly das: das Training, das Meeting, das Shopping.',
  }, (c) => ENGLISH_ING.has(c.low), ['der Pudding']),
  r('in', 'die', 'pattern', { de: '-in (Frauen)', en: '-in (women)' }, 'immer', {
    de: 'Die weibliche Form auf -in ist immer die: die Lehrerin, die Ärztin, die Freundin.',
    en: 'The female form in -in always takes die: die Lehrerin, die Ärztin, die Freundin.',
  }, (c) => ends(c, 'in') && (pluralEnds(c, 'innen') || /\(female\)/.test(c.en))),
  r('frau', 'die', 'pattern', { de: 'Frauen', en: 'Women' }, 'fast immer', {
    de: 'Weibliche Personen sind die: die Mutter, die Tochter, die Schwester. Ausnahmen nur mit -chen/-lein: das Mädchen, das Fräulein.',
    en: 'Female persons take die: die Mutter, die Tochter, die Schwester. Exceptions only with -chen/-lein: das Mädchen, das Fräulein.',
  }, isFemale, ['das Mädchen', 'das Fräulein']),
  r('adj-person', 'der', 'word', { de: 'Personen aus Adjektiven', en: 'People named by adjectives' }, 'immer', {
    de: 'Personen aus Adjektiven: der Bekannte (ein Mann), die Bekannte (eine Frau) – genauso der/die Verwandte, Erwachsene, Angestellte.',
    en: 'People named by an adjective: der Bekannte (a man), die Bekannte (a woman) – likewise der/die Verwandte, Erwachsene, Angestellte.',
  }, (c) => ADJ_PERSONS.has(c.low)),

  // die
  r('ung', 'die', 'pattern', { de: '-ung', en: '-ung' }, 'immer', {
    de: 'Nomen auf -ung sind immer die: die Zeitung, die Wohnung, die Meinung.',
    en: 'Nouns in -ung are always die: die Zeitung, die Wohnung, die Meinung.',
  }, (c) => ends(c, 'ung')),
  r('heit', 'die', 'pattern', { de: '-heit', en: '-heit' }, 'immer', {
    de: 'Nomen auf -heit sind immer die: die Freiheit, die Gesundheit, die Gelegenheit.',
    en: 'Nouns in -heit are always die: die Freiheit, die Gesundheit, die Gelegenheit.',
  }, (c) => ends(c, 'heit')),
  r('keit', 'die', 'pattern', { de: '-keit', en: '-keit' }, 'immer', {
    de: 'Nomen auf -keit sind immer die: die Möglichkeit, die Schwierigkeit, die Geschwindigkeit.',
    en: 'Nouns in -keit are always die: die Möglichkeit, die Schwierigkeit, die Geschwindigkeit.',
  }, (c) => ends(c, 'keit')),
  r('schaft', 'die', 'pattern', { de: '-schaft', en: '-schaft' }, 'immer', {
    de: 'Nomen auf -schaft sind immer die: die Freundschaft, die Mannschaft, die Gesellschaft.',
    en: 'Nouns in -schaft are always die: die Freundschaft, die Mannschaft, die Gesellschaft.',
  }, (c) => ends(c, 'schaft')),
  r('ion', 'die', 'pattern', { de: '-ion', en: '-ion' }, 'fast immer', {
    de: 'Nomen auf -ion sind fast immer die: die Information, die Situation, die Religion. Ausnahme: das Stadion.',
    en: 'Nouns in -ion are almost always die: die Information, die Situation, die Religion. Exception: das Stadion.',
  }, (c) => ends(c, 'ion'), ['das Stadion', 'der Spion']),
  r('taet', 'die', 'pattern', { de: '-tät, -ität', en: '-tät, -ität' }, 'immer', {
    de: 'Nomen auf -tät (-ität) sind immer die: die Universität, die Qualität, die Aktivität.',
    en: 'Nouns in -tät (-ität) are always die: die Universität, die Qualität, die Aktivität.',
  }, (c) => ends(c, 'tät')),
  r('ik', 'die', 'pattern', { de: '-ik', en: '-ik' }, 'fast immer', {
    de: 'Nomen auf -ik sind fast immer die: die Musik, die Politik, die Grammatik. Ausnahme: das Plastik.',
    en: 'Nouns in -ik are almost always die: die Musik, die Politik, die Grammatik. Exception: das Plastik.',
  }, (c) => ends(c, 'ik') && !VOWEL.test(before(c, 'ik')), ['das Plastik', 'der Katholik']),
  r('ur', 'die', 'pattern', { de: '-ur', en: '-ur' }, 'fast immer', {
    de: 'Nomen auf -ur sind fast immer die: die Natur, die Kultur, die Temperatur. Ausnahme: das Abitur.',
    en: 'Nouns in -ur are almost always die: die Natur, die Kultur, die Temperatur. Exception: das Abitur.',
  }, (c) => ends(c, 'ur') && !VOWEL.test(before(c, 'ur')), ['das Abitur', 'das Futur']),
  r('ei', 'die', 'pattern', { de: '-ei', en: '-ei' }, 'fast immer', {
    de: 'Nomen auf -ei sind fast immer die: die Bäckerei, die Polizei, die Datei. Ausnahmen: das Ei, der Papagei.',
    en: 'Nouns in -ei are almost always die: die Bäckerei, die Polizei, die Datei. Exceptions: das Ei, der Papagei.',
  }, (c) => ends(c, 'ei') && !VOWEL.test(before(c, 'ei')), ['das Ei', 'der Papagei']),
  r('ie', 'die', 'pattern', { de: '-ie', en: '-ie' }, 'fast immer', {
    de: 'Nomen auf -ie sind fast immer die: die Familie, die Energie, die Therapie. Ausnahmen: das Knie, das Genie.',
    en: 'Nouns in -ie are almost always die: die Familie, die Energie, die Therapie. Exceptions: das Knie, das Genie.',
  }, (c) => ends(c, 'ie') && !VOWEL.test(before(c, 'ie')), ['das Knie', 'das Genie']),
  r('enz', 'die', 'pattern', { de: '-enz, -anz', en: '-enz, -anz' }, 'fast immer', {
    de: 'Nomen auf -enz und -anz sind die: die Konferenz, die Konkurrenz, die Distanz. Einsilbige Wörter sind anders: der Tanz.',
    en: 'Nouns in -enz and -anz are die: die Konferenz, die Konkurrenz, die Distanz. One-syllable words differ: der Tanz.',
  }, (c) => ends(c, 'enz') || ends(c, 'anz'), ['der Tanz', 'der Kranz']),
  r('zahl', 'die', 'word', { de: 'Zahlen', en: 'Numbers' }, 'immer', {
    de: 'Zahlen als Nomen sind immer die: die Eins, die Drei, die Zehn (z. B. Schulnoten oder Buslinien).',
    en: 'Numbers used as nouns are always die: die Eins, die Drei, die Zehn (e.g. school marks or bus lines).',
  }, (c) => NUMBERS.has(c.low)),

  // der
  r('zeit', 'der', 'word', { de: 'Tage, Tageszeiten, Monate, Jahreszeiten', en: 'Days, times of day, months, seasons' }, 'fast immer', {
    de: 'Wochentage, Tageszeiten, Monate und Jahreszeiten sind der: der Montag, der Abend, der Mai, der Winter. Ausnahmen: die Nacht, das Frühjahr.',
    en: 'Days, times of day, months and seasons are der: der Montag, der Abend, der Mai, der Winter. Exceptions: die Nacht, das Frühjahr.',
  }, (c) => TIMES.has(c.low), ['die Nacht', 'das Frühjahr']),
  r('himmel', 'der', 'word', { de: 'Himmelsrichtungen', en: 'Compass points' }, 'immer', {
    de: 'Himmelsrichtungen sind immer der: der Norden, der Süden, der Osten, der Westen.',
    en: 'Compass points are always der: der Norden, der Süden, der Osten, der Westen.',
  }, (c) => COMPASS.has(c.low)),
  r('wetter', 'der', 'word', { de: 'Wetterwörter', en: 'Weather words' }, 'meistens', {
    de: 'Wetterwörter sind meistens der: der Regen, der Schnee, der Wind, der Nebel. Ausnahmen: das Wetter, das Gewitter (Ge-!).',
    en: 'Weather words are mostly der: der Regen, der Schnee, der Wind, der Nebel. Exceptions: das Wetter, das Gewitter (Ge-!).',
  }, (c) => WEATHER.has(c.low), ['das Wetter', 'das Gewitter']),
  r('auto', 'der', 'word', { de: 'Automarken', en: 'Car brands' }, 'fast immer', {
    de: 'Automarken sind der (gemeint ist der Wagen): der BMW, der Audi, der Opel.',
    en: 'Car brands are der (think: der Wagen): der BMW, der Audi, der Opel.',
  }, (c) => CARS.has(c.low)),
  r('alkohol', 'der', 'word', { de: 'Alkoholische Getränke', en: 'Alcoholic drinks' }, 'meistens', {
    de: 'Alkoholische Getränke sind meistens der: der Wein, der Sekt, der Schnaps. Ausnahme: das Bier.',
    en: 'Alcoholic drinks are mostly der: der Wein, der Sekt, der Schnaps. Exception: das Bier.',
  }, (c) => DRINKS.has(c.low), ['das Bier']),
  r('ling', 'der', 'pattern', { de: '-ling', en: '-ling' }, 'immer', {
    de: 'Nomen auf -ling sind immer der: der Frühling, der Lehrling, der Flüchtling.',
    en: 'Nouns in -ling are always der: der Frühling, der Lehrling, der Flüchtling.',
  }, (c) => ends(c, 'ling')),
  r('ismus', 'der', 'pattern', { de: '-ismus', en: '-ismus' }, 'immer', {
    de: 'Nomen auf -ismus sind immer der: der Tourismus, der Rassismus, der Journalismus.',
    en: 'Nouns in -ismus are always der: der Tourismus, der Rassismus, der Journalismus.',
  }, (c) => ends(c, 'ismus')),
  r('ist', 'der', 'pattern', { de: '-ist (Personen)', en: '-ist (people)' }, 'immer', {
    de: 'Personen auf -ist sind immer der: der Tourist, der Journalist, der Polizist.',
    en: 'People in -ist are always der: der Tourist, der Journalist, der Polizist.',
  }, (c) => ends(c, 'ist') && pluralEnds(c, 'isten')),
  r('ant', 'der', 'pattern', { de: '-ant, -ent (Personen)', en: '-ant, -ent (people)' }, 'immer', {
    de: 'Personen auf -ant und -ent sind immer der: der Praktikant, der Student, der Patient.',
    en: 'People in -ant and -ent are always der: der Praktikant, der Student, der Patient.',
  }, (c) => (ends(c, 'ant') && pluralEnds(c, 'anten')) || (ends(c, 'ent') && pluralEnds(c, 'enten'))),
  r('or', 'der', 'pattern', { de: '-or', en: '-or' }, 'fast immer', {
    de: 'Nomen auf -or sind fast immer der: der Motor, der Professor, der Moderator. Ausnahmen: das Labor, das Tor.',
    en: 'Nouns in -or are almost always der: der Motor, der Professor, der Moderator. Exceptions: das Labor, das Tor.',
  }, (c) => ends(c, 'or') && !VOWEL.test(before(c, 'or')), ['das Labor', 'das Tor']),
  r('ig', 'der', 'pattern', { de: '-ig, -ich', en: '-ig, -ich' }, 'fast immer', {
    de: 'Nomen auf -ig und -ich sind fast immer der: der Honig, der König, der Teppich, der Essig.',
    en: 'Nouns in -ig and -ich are almost always der: der Honig, der König, der Teppich, der Essig.',
  }, (c) => (ends(c, 'ig') && !VOWEL.test(before(c, 'ig'))) || (ends(c, 'ich') && !VOWEL.test(before(c, 'ich')))),
  r('eur', 'der', 'pattern', { de: '-eur (Personen)', en: '-eur (people)' }, 'immer', {
    de: 'Personen auf -eur sind immer der: der Friseur, der Ingenieur, der Monteur.',
    en: 'People in -eur are always der: der Friseur, der Ingenieur, der Monteur.',
  }, (c) => ends(c, 'eur')),
  r('ner', 'der', 'pattern', { de: '-ner', en: '-ner' }, 'immer', {
    de: 'Nomen auf -ner (meist Personen) sind der: der Rentner, der Kellner, der Partner, der Rechner.',
    en: 'Nouns in -ner (mostly people) are der: der Rentner, der Kellner, der Partner, der Rechner.',
  }, (c) => ends(c, 'ner') && CONSONANT.test(before(c, 'ner')) && before(c, 'ner') !== 'n'),
  r('er', 'der', 'pattern', { de: '-er (Personen, Geräte)', en: '-er (people, devices)' }, 'meistens', {
    de: 'Nomen auf -er für Personen und Geräte (oft vom Verb: fahren → der Fahrer) sind meistens der: der Lehrer, der Fahrer, der Computer, der Drucker. Ausnahmen: die Mutter, die Tochter, das Messer.',
    en: 'Nouns in -er for people and devices (often from a verb: fahren → der Fahrer) are mostly der: der Lehrer, der Fahrer, der Computer, der Drucker. Exceptions: die Mutter, die Tochter, das Messer.',
  }, (c) => ends(c, 'er') && (isMale(c) || fromVerb(c) || TOOLS_ER.has(c.low)), ['die Mutter', 'die Tochter', 'das Messer']),
  r('mann', 'der', 'pattern', { de: 'Männer', en: 'Men' }, 'immer', {
    de: 'Männliche Personen sind der: der Vater, der Sohn, der Kollege, der Kunde.',
    en: 'Male persons take der: der Vater, der Sohn, der Kollege, der Kunde.',
  }, isMale),

  // das
  r('ment', 'das', 'pattern', { de: '-ment', en: '-ment' }, 'meistens', {
    de: 'Nomen auf -ment sind meistens das: das Dokument, das Medikament, das Argument. Ausnahme: der Moment.',
    en: 'Nouns in -ment are mostly das: das Dokument, das Medikament, das Argument. Exception: der Moment.',
  }, (c) => ends(c, 'ment'), ['der Moment', 'der Zement']),
  r('tum', 'das', 'pattern', { de: '-tum', en: '-tum' }, 'meistens', {
    de: 'Nomen auf -tum sind meistens das: das Wachstum, das Eigentum. Ausnahmen: der Reichtum, der Irrtum.',
    en: 'Nouns in -tum are mostly das: das Wachstum, das Eigentum. Exceptions: der Reichtum, der Irrtum.',
  }, (c) => ends(c, 'tum') && CONSONANT.test(before(c, 'tum')), ['der Reichtum', 'der Irrtum']),
  r('um', 'das', 'pattern', { de: '-um', en: '-um' }, 'meistens', {
    de: 'Nomen auf -um (oft aus dem Lateinischen) sind meistens das: das Museum, das Studium, das Zentrum. Ausnahme: der Konsum – und einsilbige wie der Baum, der Raum.',
    en: 'Nouns in -um (often from Latin) are mostly das: das Museum, das Studium, das Zentrum. Exception: der Konsum – and one-syllable words like der Baum, der Raum.',
  }, (c) => ends(c, 'um') && before(c, 'um') !== 'a', ['der Konsum']),
  r('ma', 'das', 'pattern', { de: '-ma', en: '-ma' }, 'meistens', {
    de: 'Nomen auf -ma (oft aus dem Griechischen) sind meistens das: das Thema, das Klima, das Drama. Ausnahme: die Firma.',
    en: 'Nouns in -ma (often from Greek) are mostly das: das Thema, das Klima, das Drama. Exception: die Firma.',
  }, (c) => ends(c, 'ma') && c.low !== 'oma' && c.low !== 'mama', ['die Firma']),
  r('nis', 'das', 'pattern', { de: '-nis', en: '-nis' }, 'meistens', {
    de: 'Nomen auf -nis sind meistens das: das Ergebnis, das Zeugnis, das Erlebnis. Ausnahmen: die Erlaubnis, die Kenntnis.',
    en: 'Nouns in -nis are mostly das: das Ergebnis, das Zeugnis, das Erlebnis. Exceptions: die Erlaubnis, die Kenntnis.',
  }, (c) => ends(c, 'nis'), ['die Erlaubnis', 'die Kenntnis', 'die Ersparnis']),
  r('o', 'das', 'pattern', { de: '-o', en: '-o' }, 'meistens', {
    de: 'Nomen auf -o sind meistens das: das Auto, das Büro, das Kino, das Radio. Ausnahmen: der Euro, der Zoo, die Disco.',
    en: 'Nouns in -o are mostly das: das Auto, das Büro, das Kino, das Radio. Exceptions: der Euro, der Zoo, die Disco.',
  }, (c) => ends(c, 'o'), ['der Euro', 'der Zoo', 'die Disco']),
  r('ge', 'das', 'pattern', { de: 'Ge-', en: 'Ge-' }, 'meistens', {
    de: 'Nomen mit Ge- sind meistens das: das Gebäude, das Gebirge, das Gemüse, das Geschenk. Ausnahmen: die Geschichte, die Gefahr, der Geschmack.',
    en: 'Nouns starting with Ge- are mostly das: das Gebäude, das Gebirge, das Gemüse, das Geschenk. Exceptions: die Geschichte, die Gefahr, der Geschmack.',
  }, (c) => c.low.startsWith('ge') && c.low.length >= 5 && CONSONANT.test(c.low.charAt(2)) && VOWEL.test(c.low.slice(3)),
  ['die Geschichte', 'die Gefahr', 'der Geschmack', 'der Gedanke']),
  r('infinitiv', 'das', 'pattern', { de: 'Verben als Nomen', en: 'Verbs as nouns' }, 'immer', {
    de: 'Verben als Nomen (der Infinitiv) sind immer das: das Essen, das Rauchen, das Leben.',
    en: 'Verbs used as nouns (the infinitive) are always das: das Essen, das Rauchen, das Leben.',
  }, (c) => {
    if (!c.low.endsWith('en') || NOT_INFINITIVE.has(c.low)) return false;
    if (index().verbs.has(c.low) || INFINITIVES.has(c.low)) return true;
    // Compounds whose last part is a known infinitive: Mittag|essen, Zusammen|leben.
    for (const inf of INFINITIVES) if (inf.length >= 5 && c.low.length - inf.length >= 3 && c.low.endsWith(inf)) return true;
    return false;
  }),
  r('metall', 'das', 'word', { de: 'Metalle', en: 'Metals' }, 'meistens', {
    de: 'Metalle sind meistens das: das Gold, das Silber, das Eisen. Ausnahmen: der Stahl, die Bronze.',
    en: 'Metals are mostly das: das Gold, das Silber, das Eisen. Exceptions: der Stahl, die Bronze.',
  }, (c) => METALS.has(c.low), ['der Stahl', 'die Bronze']),
  r('farbe', 'das', 'word', { de: 'Farben als Nomen', en: 'Colours as nouns' }, 'immer', {
    de: 'Farben als Nomen sind immer das: das Rot, das Blau, das Grün.',
    en: 'Colours used as nouns are always das: das Rot, das Blau, das Grün.',
  }, (c) => COLOURS.has(c.low)),
  r('sprache', 'das', 'word', { de: 'Sprachen', en: 'Languages' }, 'immer', {
    de: 'Sprachen sind immer das: das Deutsch, das Englisch, das Türkisch. (Aber: die deutsche Sprache – wegen die Sprache.)',
    en: 'Languages are always das: das Deutsch, das Englisch, das Türkisch. (But: die deutsche Sprache – because of die Sprache.)',
  }, (c) => LANGUAGES.has(c.low)),
  r('hotel', 'das', 'word', { de: 'Hotels, Cafés, Kinos', en: 'Hotels, cafés, cinemas' }, 'meistens', {
    de: 'Hotels, Cafés, Kinos und Restaurants – auch ihre Namen – sind das: das Hotel, das Café, das Kino, das Adlon. Ausnahmen: die Bar, die Kneipe.',
    en: 'Hotels, cafés, cinemas and restaurants – their names too – are das: das Hotel, das Café, das Kino, das Adlon. Exceptions: die Bar, die Kneipe.',
  }, (c) => PLACES.has(c.low), ['die Bar', 'die Kneipe']),

  // the broad -e rule comes last
  r('e', 'die', 'pattern', { de: '-e', en: '-e' }, 'meistens', {
    de: 'Nomen auf -e sind meistens die (etwa 90 %): die Lampe, die Reise, die Sprache. Bekannte Ausnahmen: der Name, der Käse, das Ende, das Auge, das Interesse.',
    en: 'Nouns in -e are mostly die (about 90 %): die Lampe, die Reise, die Sprache. Famous exceptions: der Name, der Käse, das Ende, das Auge, das Interesse.',
  }, (c) => ends(c, 'e') && !c.low.endsWith('ee') && !c.low.endsWith('ie') && !ENGLISH_E.has(c.low),
  ['der Name', 'der Käse', 'der Gedanke', 'der Glaube', 'das Ende', 'das Auge', 'das Interesse']),
];

const RULE_BY_ID = new Map(GENDER_RULES.map((x) => [x.id, x]));
export const ruleById = (id: string) => RULE_BY_ID.get(id);

/* --------------------------------------------------------------- genderTip */

export interface GenderTip {
  /** The rule that applies, or the compound rule. */
  rule: GenderRule | typeof COMPOUND_RULE;
  /** The article the rule predicts. */
  article: Article;
  reliable: Reliability;
  /** Whether the word obeys the rule (false: an exception worth flagging). */
  matches: boolean;
  /** For compounds: the last part the article comes from (die Tür for Haustür). */
  head?: VocabEntry;
}

export const isCompoundTip = (t: GenderTip) => t.rule.id === COMPOUND_RULE.id;

const lastWord = (s: string) => s.trim().split(/\s+/).pop() ?? s;

/**
 * Everyday A1 nouns that the B1 list takes for granted. They only serve as the
 * last part of compounds (das Zimmer → das Wohnzimmer); entries in the list win.
 * "die Mutter:Mütter" also gives the plural, for compound plurals.
 */
const BASIC_NOUNS = `der Tag:Tage|der Ort:Orte|die Zahl:Zahlen|der Automat|der Satz:Sätze|der Mann:Männer|die Frau:Frauen|das Kind:Kinder|das Haus:Häuser|das Zimmer|das Jahr
  |die Woche|die Zeit|die Stadt|der Platz|der Weg|die Bahn|das Buch|das Mittel|der Stand|der Lauf|das Heim|das Bad
  |das Werk|das Zeug|die Kraft|das Rad|der Hahn|das Becken|der Bau|die Straße|das Wasser|die Sprache|das Land
  |der Schein|das Gespräch|das Geschoss|der Tisch|der Kasten|der Karton|der Zettel|der Plan|das Wort|die Schrift
  |die Sicht|der Abend|der Schutz|der Dienst|der Bruch|der Spruch|der Druck|der Ruf|der Blick|die Welt|der Raum
  |die Karte|der Fall|der Teil|das Spiel|die Arbeit|der Auszug|der Schluss|der Tausch|die Nummer|der Korb|der Laden|der Name
  |die Mutter:Mütter|der Vater:Väter|der Bruder:Brüder|die Schwester:Schwestern|der Sohn:Söhne|die Tochter:Töchter|der Meister|der Sitz|der Gang|der Sack|das Mitglied
  |der Kampf|der Park|der Bus|der Pass|der Shop|der Test|das Center|der Schlag|der Wandel|das Papier|das Zeichen|der Tritt`;

/** Two-letter first parts that really are prefixes: Ab|flug, An|ruf, Um|zug, Zu|fall, Un|wetter. */
const SHORT_FIRST = new Set(['ab', 'an', 'um', 'zu', 'un']);

let heads: Map<string, VocabEntry> | undefined;
function headIndex(): Map<string, VocabEntry> {
  if (heads) return heads;
  heads = new Map(index().nouns);
  for (const item of BASIC_NOUNS.split('|')) {
    const [article, rest] = item.trim().split(' ') as [Article, string];
    const [de, plural] = rest.split(':');
    const key = de.toLowerCase();
    if (!heads.has(key)) {
      heads.set(key, { id: `basis:${key}`, topic: 'allgemein', pos: 'noun', de, article, en: '', example: '', exampleEn: '', ...(plural ? { plural } : {}) });
    }
  }
  return heads;
}

/** The longest known noun the word ends in, if what is left is a real first part. */
export function compoundHead(entry: VocabEntry): VocabEntry | undefined {
  const low = lastWord(entry.de).toLowerCase();
  if (NOT_COMPOUNDS.has(low)) return undefined;
  const nouns = headIndex();
  for (let i = 2; i <= low.length - 3; i++) {
    if (i === 2 && !SHORT_FIRST.has(low.slice(0, 2))) continue;
    const h = nouns.get(low.slice(i));
    if (h && h.id !== entry.id) return h;
  }
  return undefined;
}

const ctxOf = (w: string, en: string, plural?: string): Ctx => ({ w, low: w.toLowerCase(), en: en.toLowerCase(), plural });

export function genderTip(entry: VocabEntry): GenderTip | null {
  if (entry.pos !== 'noun' || !entry.article) return null;
  const article = entry.article;
  const done = (rule: GenderRule, head?: VocabEntry): GenderTip => ({
    rule,
    article: rule.article,
    reliable: rule.reliability,
    matches: rule.article === article,
    ...(head ? { head } : {}),
  });

  if (isPluralOnly(entry)) return done(GENDER_RULES[0]);

  const word = lastWord(entry.de);
  const full = ctxOf(word, entry.en, entry.plural);
  // 1. Whole words first: "Montag" is a day before it is a compound of "Tag".
  for (const rule of GENDER_RULES) if (rule.kind === 'word' && rule.test(full)) return done(rule);

  // 2. Compounds: the rules look at the last part.
  const head = compoundHead(entry);
  if (head) {
    const c = ctxOf(head.de, `${entry.en}; ${head.en}`, head.plural);
    for (const rule of GENDER_RULES) {
      // "Einrichtung" is simply an -ung word. Otherwise the last part explains it best:
      // "die Schwester → die Krankenschwester", "das Ende → das Wochenende".
      if (rule.kind === 'pattern' && rule.article === article && rule.test(c) && rule.test(full)) return done(rule);
    }
    return {
      rule: COMPOUND_RULE,
      article: head.article!,
      reliable: COMPOUND_RULE.reliability,
      matches: head.article === article,
      head,
    };
  }

  // 3. Simple words.
  for (const rule of GENDER_RULES) if (rule.kind === 'pattern' && rule.test(full)) return done(rule);
  return null;
}

/** "-ung → immer die" */
export function ruleShort(rule: GenderTip['rule'], article?: Article): Text2 {
  if (rule.id === COMPOUND_RULE.id) return { de: 'Das letzte Wort entscheidet', en: 'The last word decides' };
  if (rule.id === 'adj-person') return { de: 'Personen aus Adjektiven → der (Mann), die (Frau)', en: 'People named by adjectives → der (man), die (woman)' };
  const g = rule as GenderRule;
  const a = article ?? g.article;
  return {
    de: `${g.label.de} → ${RELIABILITY[g.reliability].de} ${a}`,
    en: `${g.label.en} → ${RELIABILITY[g.reliability].en} ${a}`,
  };
}

/** The line shown for one word: the rule, the compound link, or "Ausnahme! …". */
export function genderTipText(tip: GenderTip, entry: VocabEntry): Text2 {
  const word = `${entry.article} ${entry.de}`;
  const link = tip.head ? `${tip.head.article} ${tip.head.de} → ${word}` : '';
  if (isCompoundTip(tip)) {
    return tip.matches
      ? { de: `Das letzte Wort entscheidet: ${link}`, en: `The last word decides: ${link}` }
      : {
          de: `Ausnahme! Meist entscheidet das letzte Wort (${tip.head!.article} ${tip.head!.de}), aber: ${word}.`,
          en: `Exception! Usually the last word decides (${tip.head!.article} ${tip.head!.de}), but: ${word}.`,
        };
  }
  const short = ruleShort(tip.rule);
  if (tip.matches) {
    return link
      ? { de: `${short.de} (${link})`, en: `${short.en} (${link})` }
      : short;
  }
  const what = link || word;
  return {
    de: `Ausnahme! Regel: ${short.de} – aber ${what}.`,
    en: `Exception! Rule: ${short.en} – but ${what}.`,
  };
}

/* ------------------------------------------------------------- pluralTip */

export interface PluralTip {
  id: string;
  text: Text2;
}

/** Puts an umlaut on the last a/o/u (au → äu): Vater → Väter, Haus → Häus. */
export function umlaut(word: string): string {
  const m = /^(.*?)(au|a|o|u)([^aou]*)$/i.exec(word);
  if (!m) return word;
  const map: Record<string, string> = { au: 'äu', a: 'ä', o: 'ö', u: 'ü', Au: 'Äu', A: 'Ä', O: 'Ö', U: 'Ü' };
  return m[1] + (map[m[2]] ?? m[2]) + m[3];
}

const P = (id: string, de: string, en: string): PluralTip => ({ id, text: { de, en } });

export const PLURAL_TIPS = {
  ung: P('ung', '-ung → Plural -ungen: die Zeitung → die Zeitungen.', '-ung → plural -ungen: die Zeitung → die Zeitungen.'),
  heit: P('heit', '-heit, -keit, -schaft → Plural -en: die Möglichkeit → die Möglichkeiten.', '-heit, -keit, -schaft → plural -en: die Möglichkeit → die Möglichkeiten.'),
  in: P('in', '-in → Plural -innen (doppeltes n!): die Lehrerin → die Lehrerinnen.', '-in → plural -innen (double n!): die Lehrerin → die Lehrerinnen.'),
  chen: P('chen', '-chen, -lein: Plural = Singular: das Brötchen → die Brötchen.', '-chen, -lein: plural = singular: das Brötchen → die Brötchen.'),
  nis: P('nis', '-nis → Plural -nisse (doppeltes s!): das Ergebnis → die Ergebnisse.', '-nis → plural -nisse (double s!): das Ergebnis → die Ergebnisse.'),
  um: P('um', '-um → Plural -en: das Museum → die Museen, das Zentrum → die Zentren.', '-um → plural -en: das Museum → die Museen, das Zentrum → die Zentren.'),
  ma: P('ma', '-ma → Plural -men: das Thema → die Themen.', '-ma → plural -men: das Thema → die Themen.'),
  feminin: P('feminin', 'die-Wörter auf -ion, -tät, -ik, -ur, -ei, -enz, -anz, -ie → Plural -(e)n: die Information → die Informationen.', 'die-words in -ion, -tät, -ik, -ur, -ei, -enz, -anz, -ie → plural -(e)n: die Information → die Informationen.'),
  e: P('e', 'Nomen auf -e → Plural -n: die Lampe → die Lampen, der Kollege → die Kollegen, das Auge → die Augen.', 'Nouns in -e → plural -n: die Lampe → die Lampen, der Kollege → die Kollegen, das Auge → die Augen.'),
  nDekl: P('n-dekl', 'Männliche Personen auf -ent, -ant, -ist, -at (n-Deklination) → Plural -en: der Student → die Studenten, der Kandidat → die Kandidaten.', 'Male persons in -ent, -ant, -ist, -at (n-declension) → plural -en: der Student → die Studenten, der Kandidat → die Kandidaten.'),
  erElEn: P('er-el-en', 'der/das auf -er, -el, -en: Plural oft ohne Endung, manchmal mit Umlaut: der Lehrer → die Lehrer, der Vater → die Väter.', 'der/das in -er, -el, -en: plural often without ending, sometimes with umlaut: der Lehrer → die Lehrer, der Vater → die Väter.'),
  vokalS: P('vokal-s', 'Wörter auf -a, -i, -o, -u, -y → Plural -s: das Auto → die Autos, das Handy → die Handys.', 'Words in -a, -i, -o, -u, -y → plural -s: das Auto → die Autos, das Handy → die Handys.'),
  fremdS: P('fremd-s', 'Viele Fremdwörter (oft aus dem Englischen) → Plural -s: das Ticket → die Tickets.', 'Many loanwords (often from English) → plural -s: das Ticket → die Tickets.'),
  dieEn: P('die-en', 'Fast alle die-Wörter haben im Plural -(e)n: die Zahl → die Zahlen, die Frau → die Frauen.', 'Almost all die-words take -(e)n in the plural: die Zahl → die Zahlen, die Frau → die Frauen.'),
  dieUmlaut: P('die-umlaut', 'Einige kurze die-Wörter → Plural -e mit Umlaut: die Hand → die Hände, die Stadt → die Städte.', 'Some short die-words → plural -e with umlaut: die Hand → die Hände, die Stadt → die Städte.'),
  derE: P('der-e', 'Viele der-Wörter → Plural -e, oft mit Umlaut: der Tag → die Tage, der Zug → die Züge.', 'Many der-words → plural -e, often with umlaut: der Tag → die Tage, der Zug → die Züge.'),
  dasE: P('das-e', 'Viele das-Wörter → Plural -e (ohne Umlaut): das Jahr → die Jahre, das Geschenk → die Geschenke.', 'Many das-words → plural -e (no umlaut): das Jahr → die Jahre, das Geschenk → die Geschenke.'),
  dasEr: P('das-er', 'Viele kurze das-Wörter → Plural -er, mit Umlaut wenn möglich: das Kind → die Kinder, das Haus → die Häuser.', 'Many short das-words → plural -er, with umlaut where possible: das Kind → die Kinder, das Haus → die Häuser.'),
  kompositum: P('kompositum', 'Plural wie beim letzten Wort: die Mutter → die Mütter, also die Großmutter → die Großmütter.', 'Plural as for the last word: die Mutter → die Mütter, so die Großmutter → die Großmütter.'),
} satisfies Record<string, PluralTip>;

/** A plural tip when the stored plural follows a learnable pattern. */
export function pluralTip(entry: VocabEntry): PluralTip | null {
  const { plural, article } = entry;
  if (entry.pos !== 'noun' || !article || !plural || plural === '-' || isPluralOnly(entry)) return null;
  const de = lastWord(entry.de);
  const pl = lastWord(plural);
  const low = de.toLowerCase();
  const c = ctxOf(de, entry.en, plural);

  if (low.endsWith('ung') && pl === de + 'en') return PLURAL_TIPS.ung;
  if (/(heit|keit|schaft)$/.test(low) && pl === de + 'en') return PLURAL_TIPS.heit;
  if (low.endsWith('in') && pl === de + 'nen') return PLURAL_TIPS.in;
  if (((ends(c, 'chen') && CONSONANT.test(before(c, 'chen'))) || ends(c, 'lein')) && pl === de) return PLURAL_TIPS.chen;
  if (low.endsWith('nis') && pl === de + 'se') return PLURAL_TIPS.nis;
  if (low.endsWith('um') && pl === de.slice(0, -2) + 'en') return PLURAL_TIPS.um;
  if (low.endsWith('ma') && pl === de.slice(0, -1) + 'en') return PLURAL_TIPS.ma;
  if (article === 'die' && /(ion|tät|ik|ur|ei|enz|anz)$/.test(low) && pl === de + 'en') return PLURAL_TIPS.feminin;
  if (article === 'die' && low.endsWith('ie') && pl === de + 'n') return PLURAL_TIPS.feminin;
  if (low.endsWith('e') && !low.endsWith('ee') && pl === de + 'n') return PLURAL_TIPS.e;
  if (article === 'der' && /(ent|ant|ist|at)$/.test(low) && pl === de + 'en' && isMale(c)) return PLURAL_TIPS.nDekl;
  if (article !== 'die' && /(er|el|en)$/.test(low) && (pl === de || pl === umlaut(de))) return PLURAL_TIPS.erElEn;
  if (pl === de + 's') return /[aiouy]$/.test(low) ? PLURAL_TIPS.vokalS : PLURAL_TIPS.fremdS;
  if (article === 'die' && (pl === de + 'en' || pl === de + 'n')) return PLURAL_TIPS.dieEn;
  if (article === 'die' && pl === umlaut(de) + 'e' && pl !== de + 'e') return PLURAL_TIPS.dieUmlaut;
  if (article === 'der' && (pl === de + 'e' || pl === umlaut(de) + 'e')) return PLURAL_TIPS.derE;
  if (article === 'das' && pl === de + 'e') return PLURAL_TIPS.dasE;
  if (article === 'das' && (pl === de + 'er' || pl === umlaut(de) + 'er')) return PLURAL_TIPS.dasEr;
  // Compounds take the plural of their last word: Großmutter → Großmütter.
  const head = compoundHead(entry);
  if (head?.plural && head.plural !== '-' && de.length > head.de.length) {
    const first = de.slice(0, de.length - head.de.length);
    if (pl === first + head.plural.toLowerCase() || pl === first + head.plural) return PLURAL_TIPS.kompositum;
  }
  return null;
}

/* --------------------------------------------------------------- verbTip */

export type VerbTipKind = 'sein' | 'sein-extra' | 'haben' | 'haben-reflexiv' | 'untrennbar' | 'untrennbar-2' | 'ieren' | 'trennbar' | 'trennbar-untrennbar';

export interface VerbTip {
  aux: 'haben' | 'sein';
  /** The Partizip II as stored ("aufgestanden"). */
  partizip: string;
  /** Perfekt with haben or sein. */
  perfekt: { kind: VerbTipKind; text: Text2 };
  /** How the Partizip is built, when a rule explains it. */
  ge?: { kind: VerbTipKind; text: Text2 };
}

export const VERB_TIPS: Record<VerbTipKind, Text2> = {
  sein: {
    de: 'Perfekt mit sein: Bewegung von A nach B (fahren, fliegen, umziehen) oder Zustandsänderung (aufstehen, einschlafen, werden) – außerdem sein, bleiben, passieren.',
    en: 'Perfekt with sein: movement from A to B (fahren, fliegen, umziehen) or a change of state (aufstehen, einschlafen, werden) – plus sein, bleiben, passieren.',
  },
  'sein-extra': {
    de: 'Perfekt mit sein, obwohl keine Bewegung: sein, bleiben, passieren – genauso geschehen, gelingen, begegnen, vorkommen.',
    en: 'Perfekt with sein although there is no movement: sein, bleiben, passieren – likewise geschehen, gelingen, begegnen, vorkommen.',
  },
  haben: {
    de: 'Perfekt mit haben – wie bei den meisten Verben (alle ohne Bewegung von A nach B oder Zustandsänderung).',
    en: 'Perfekt with haben – like most verbs (all without movement from A to B or a change of state).',
  },
  'haben-reflexiv': {
    de: 'Reflexive Verben bilden das Perfekt immer mit haben: sich freuen → hat sich gefreut.',
    en: 'Reflexive verbs always form the Perfekt with haben: sich freuen → hat sich gefreut.',
  },
  untrennbar: {
    de: 'be-, ge-, er-, ver-, zer-, ent-, emp-, miss- sind untrennbar: Partizip ohne ge- (bestellen → bestellt, verstehen → verstanden).',
    en: 'be-, ge-, er-, ver-, zer-, ent-, emp-, miss- are inseparable: no ge- in the Partizip (bestellen → bestellt, verstehen → verstanden).',
  },
  'untrennbar-2': {
    de: 'über-, unter-, wieder-, durch-, um- sind hier untrennbar (betont wird der Stamm): Partizip ohne ge- (übersetzen → übersetzt).',
    en: 'über-, unter-, wieder-, durch-, um- are inseparable here (the stem is stressed): no ge- in the Partizip (übersetzen → übersetzt).',
  },
  ieren: {
    de: 'Verben auf -ieren: Partizip ohne ge- (studieren → studiert, telefonieren → telefoniert).',
    en: 'Verbs in -ieren: no ge- in the Partizip (studieren → studiert, telefonieren → telefoniert).',
  },
  trennbar: {
    de: 'Trennbares Verb: ge- steht zwischen Präfix und Stamm (aufstehen → aufgestanden, einkaufen → eingekauft).',
    en: 'Separable verb: ge- goes between prefix and stem (aufstehen → aufgestanden, einkaufen → eingekauft).',
  },
  'trennbar-untrennbar': {
    de: 'Trennbares Präfix + untrennbares Präfix: kein ge- (vorbereiten → vorbereitet, anerkennen → anerkannt).',
    en: 'Separable prefix + inseparable prefix: no ge- (vorbereiten → vorbereitet, anerkennen → anerkannt).',
  },
};

const INSEPARABLE = ['miss', 'emp', 'ent', 'zer', 'ver', 'be', 'ge', 'er'];
/** Prefixes that are separable in some verbs (umziehen → umgezogen) and inseparable in others (umarmen → umarmt). */
const TWO_WAY = ['wieder', 'unter', 'durch', 'über', 'um'];
const SEPARABLE = `zusammen zurecht zurück herunter weiter kennen schwarz statt fest fort teil fern wohl krank groß hoch nach
  dar hin her los mit vor weg auf aus bei ein weh ab an zu`.split(/\s+/).filter(Boolean);
const SEIN_EXTRA = new Set(['sein', 'bleiben', 'passieren', 'geschehen', 'gelingen', 'misslingen', 'begegnen', 'vorkommen', 'einfallen', 'auffallen', 'folgen']);

/**
 * Whether the Partizip puts ge- after the first `k` letters (auf|ge|standen).
 * When the stem itself starts with ge- (aus|geben → aus|ge|geben, but ver|gessen → vergessen),
 * a second g must follow.
 */
const geAfter = (inf: string, part: string, k: number) =>
  part.slice(0, k) === inf.slice(0, k) &&
  part.slice(k).startsWith('ge') &&
  (!inf.slice(k).startsWith('ge') || part.slice(k + 2).startsWith('g'));

/** How the Partizip II of an infinitive is built, if a rule explains it. */
export function partizipRule(infinitive: string, partizip: string): VerbTipKind | null {
  const inf = infinitive.toLowerCase();
  const part = partizip.toLowerCase();
  if (inf.endsWith('ieren') && part.endsWith('iert') && !part.startsWith('ge')) return 'ieren';
  // Separable: bei|bringen → bei|ge|bracht, um|ziehen → um|ge|zogen.
  for (const p of [...SEPARABLE, ...TWO_WAY]) if (inf.startsWith(p) && geAfter(inf, part, p.length)) return 'trennbar';
  // A separable prefix in front of an inseparable one: vor|be|reiten → vorbereitet, wieder|ver|wenden.
  // (Not ge-: über|geben is über + geben.)
  for (const s of [...SEPARABLE, ...TWO_WAY]) {
    if (inf.startsWith(s) && part.startsWith(s) && INSEPARABLE.some((p) => p !== 'ge' && inf.slice(s.length).startsWith(p) && part.slice(s.length).startsWith(p))) {
      return 'trennbar-untrennbar';
    }
  }
  for (const p of INSEPARABLE) {
    if (inf.startsWith(p) && part.startsWith(p) && VOWEL.test(inf.slice(p.length, -2)) && !geAfter(inf, part, 0)) return 'untrennbar';
  }
  for (const p of TWO_WAY) if (inf.startsWith(p) && part.startsWith(p)) return 'untrennbar-2';
  // Any other separable first part (kennen|lernen → kennen|ge|lernt).
  for (let k = 2; k < inf.length - 3; k++) {
    if (!INSEPARABLE.includes(inf.slice(0, k)) && geAfter(inf, part, k) && !part.startsWith('ge')) return 'trennbar';
  }
  return null;
}

/** Perfekt and Partizip tips for a verb, from its stored forms ("…, ist aufgestanden"). */
export function verbTip(entry: VocabEntry): VerbTip | null {
  if (entry.pos !== 'verb' || !entry.forms) return null;
  const parts = entry.forms.split(',').map((s) => s.trim());
  const perfekt = parts[parts.length - 1];
  const m = /^(hat|ist)\s+(.+)$/.exec(perfekt);
  if (!m) return null;
  const aux = m[1] === 'ist' ? 'sein' : 'haben';
  const partizip = lastWord(m[2]);
  const reflexive = entry.de.startsWith('sich ');
  const inf = lastWord(entry.de);
  const kind: VerbTipKind = aux === 'sein' ? (SEIN_EXTRA.has(inf) ? 'sein-extra' : 'sein') : reflexive ? 'haben-reflexiv' : 'haben';
  const tip: VerbTip = { aux, partizip, perfekt: { kind, text: VERB_TIPS[kind] } };
  const ge = partizipRule(inf, partizip);
  if (ge) tip.ge = { kind: ge, text: VERB_TIPS[ge] };
  return tip;
}

/* ------------------------------------------------------------ everything */

export interface Merktipp {
  kind: 'genus' | 'plural' | 'perfekt' | 'partizip';
  text: Text2;
  /** An exception to a rule: show it louder. */
  exception?: boolean;
}

/** All tips for one entry, in the order they are worth reading. */
export function merktipps(entry: VocabEntry): Merktipp[] {
  const out: Merktipp[] = [];
  const g = genderTip(entry);
  if (g) out.push({ kind: 'genus', text: genderTipText(g, entry), ...(g.matches ? {} : { exception: true }) });
  const p = pluralTip(entry);
  if (p) out.push({ kind: 'plural', text: p.text });
  const v = verbTip(entry);
  if (v) {
    out.push({ kind: 'perfekt', text: v.perfekt.text });
    if (v.ge) out.push({ kind: 'partizip', text: v.ge.text });
  }
  return out;
}

/* ---------------------------------------------------------------- coverage */

export interface RuleCoverage {
  id: string;
  /** Nouns from the list that obey the rule. */
  matches: VocabEntry[];
  /** Nouns from the list the rule is about but that break it. */
  exceptions: VocabEntry[];
}

let coverageCache: Map<string, RuleCoverage> | undefined;

/** Per rule (and the compound rule): which nouns of the list it covers and which break it. */
export function ruleCoverage(): Map<string, RuleCoverage> {
  if (coverageCache) return coverageCache;
  const out = new Map<string, RuleCoverage>();
  for (const rule of [...GENDER_RULES, COMPOUND_RULE]) out.set(rule.id, { id: rule.id, matches: [], exceptions: [] });
  for (const e of vocab) {
    const t = genderTip(e);
    if (!t) continue;
    const cov = out.get(t.rule.id)!;
    (t.matches ? cov.matches : cov.exceptions).push(e);
  }
  coverageCache = out;
  return out;
}
