/**
 * Turns the Grammatik content into multiple-choice questions, one builder per
 * exercise. Every question carries its progress id ("gram:<exercise>:<key>"),
 * so a question can be rebuilt from its id for the "Schwache Formen" round.
 * Pure functions with an injectable random source, tested without a browser.
 */
import type { ItemProgress, Text2 } from '../../types.ts';
import { dueOrder, historyOf, isDue, isWeak, strength } from '../../lib/srs.ts';
import {
  ADJ_END,
  type AdjType,
  CASES,
  CASE_NAME,
  type Case,
  DETS,
  type Det,
  GENDERS,
  GENDER_NAME,
  type Gender,
  PERSON_LABEL,
  PERSONS,
  PP,
  EIN_END,
  type Person,
  REFL,
  REL,
  WER,
  type AloneStem,
  adjForm,
  adjStem,
  aloneForm,
  cap,
  detForm,
  einForm,
} from './forms.ts';
import { BANK, type BankItem } from './bank.ts';
import { FALL } from './fall.ts';
import { ORDERS, ORDER_RULE, SWAPS } from './pronomen.ts';
import { ADJ_ITEMS } from './adjektive.ts';
import { PREPS, PREP_KIND_NAME, type PrepKind, triggerText } from './rules.ts';
import { generate, generatorCells } from './generator.ts';

export type ExId = 'tabelle' | 'luecke' | 'pronomen' | 'fall' | 'praep' | 'adjektiv';
export const EXERCISES: ExId[] = ['tabelle', 'luecke', 'pronomen', 'fall', 'praep', 'adjektiv'];

/** Progress id prefix per exercise. */
export const PREFIX: Record<ExId, string> = {
  tabelle: 'gram:tab:',
  luecke: 'gram:luecke:',
  pronomen: 'gram:pron:',
  fall: 'gram:fall:',
  praep: 'gram:praep:',
  adjektiv: 'gram:adj:',
};

export interface Question {
  /** Progress id, e.g. "gram:luecke:b001". */
  id: string;
  ex: ExId;
  /** What to do. */
  task: Text2;
  /** The sentence or prompt; "___" marks a gap, [brackets] an underlined phrase. */
  text: string;
  /** Shown next to the gap: the base form, e.g. "(meine)". */
  hint?: string;
  /** Small coloured tags above the text (case to produce, gender). */
  tags?: { c?: Case; g?: Gender; label?: string };
  options: string[];
  answer: number;
  /** The case of the answer, for colouring the feedback. */
  kase?: Case;
  why: Text2;
  /** The sentence with the gap filled, read aloud after answering. */
  solved?: string;
}

export type Rnd = () => number;

function shuffled<T>(xs: readonly T[], rnd: Rnd): T[] {
  const out = xs.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** The answer plus up to three distinct wrong options from the pools, in order of preference. */
export function pickOptions(answer: string, pools: (string | null | undefined)[], n = 4): string[] {
  const out = [answer];
  for (const p of pools) {
    if (out.length >= n) break;
    if (p && !out.includes(p)) out.push(p);
  }
  return out;
}

function mc(options: string[], rnd: Rnd, shuffle = true): { options: string[]; answer: number } {
  const correct = options[0];
  const shown = shuffle ? shuffled(options, rnd) : options;
  return { options: shown, answer: shown.indexOf(correct) };
}

const both = (de: string, en: string): Text2 => ({ de, en });
const join = (...parts: (Text2 | undefined)[]): Text2 => ({
  de: parts.filter(Boolean).map((p) => p!.de).join(' '),
  en: parts.filter(Boolean).map((p) => p!.en).join(' '),
});

const caseG = (g: Gender, c: Case): Text2 => ({
  de: `${GENDER_NAME[g].de} ${CASE_NAME[c].de}`,
  en: `${GENDER_NAME[g].en} ${CASE_NAME[c].en}`,
});

/* ======================================================== Artikel-Tabelle */

/** A sample noun per gender, in each case, to give the form something to stand before. */
export const SAMPLE: Record<Gender, Record<Case, string>> = {
  m: { nom: 'Vater', akk: 'Vater', dat: 'Vater', gen: 'Vaters' },
  f: { nom: 'Mutter', akk: 'Mutter', dat: 'Mutter', gen: 'Mutter' },
  n: { nom: 'Kind', akk: 'Kind', dat: 'Kind', gen: 'Kindes' },
  pl: { nom: 'Kinder', akk: 'Kinder', dat: 'Kindern', gen: 'Kinder' },
};

export function tabelleIds(): string[] {
  const out: string[] = [];
  for (const d of DETS) for (const c of CASES) for (const g of GENDERS) if (detForm(d, c, g)) out.push(`${PREFIX.tabelle}${d}-${c}-${g}`);
  return out;
}

/** Why a determiner has its form: the ein-words copy the ending of der/die/das, with three exceptions. */
export function detWhy(d: Det, c: Case, g: Gender): Text2 {
  const form = detForm(d, c, g)!;
  const lead = caseG(g, c);
  if (d === 'der') {
    const aid =
      c === 'dat'
        ? both('Dativ: dem – der – dem – den (+ n im Plural).', 'Dative: dem – der – dem – den (+ n in the plural).')
        : c === 'gen'
          ? both('Genitiv: des – der – des – der (+ s bei m/n).', 'Genitive: des – der – des – der (+ s on m/n nouns).')
          : c === 'akk'
            ? both('Nur maskulin ändert sich im Akkusativ: der → den.', 'Only the masculine changes in the accusative: der → den.')
            : both('Nominativ: der – die – das – die.', 'Nominative: der – die – das – die.');
    return join({ de: `${cap(lead.de)}: ${form}.`, en: `${cap(lead.en)}: ${form}.` }, aid);
  }
  const bare = (c === 'nom' && (g === 'm' || g === 'n')) || (c === 'akk' && g === 'n');
  const def = detForm('der', c, g)!;
  const aid = bare
    ? both('Ohne Endung – eine der drei Ausnahmen: Nom. m, Nom. n, Akk. n.', 'No ending – one of the three exceptions: nom. m, nom. n, acc. n.')
    : both(`Endung wie beim Artikel: ${def} → -${EIN_END[c][g]}.`, `Same ending as the article: ${def} → -${EIN_END[c][g]}.`);
  const euer = d === 'euer' && !bare ? both('euer verliert das e: eur-.', 'euer drops its e: eur-.') : undefined;
  return join({ de: `${cap(lead.de)}: ${form}.`, en: `${cap(lead.en)}: ${form}.` }, aid, euer);
}

function tabelleQuestion(key: string, rnd: Rnd): Question | null {
  const [d, c, g] = key.split('-') as [Det, Case, Gender];
  if (!DETS.includes(d) || !CASES.includes(c) || !GENDERS.includes(g)) return null;
  const answer = detForm(d, c, g);
  if (!answer) return null;
  const pools: (string | null)[] = [
    ...CASES.map((oc) => detForm(d, oc, g)),
    ...GENDERS.map((og) => detForm(d, c, og)),
    ...CASES.flatMap((oc) => GENDERS.map((og) => detForm(d, oc, og))),
  ];
  const { options, answer: idx } = mc(pickOptions(answer, pools), rnd);
  const base = d === 'der' ? 'der/die/das' : `${d}-`;
  return {
    id: `${PREFIX.tabelle}${key}`,
    ex: 'tabelle',
    task: both('Welche Form passt?', 'Which form fits?'),
    text: `___ ${SAMPLE[g][c]}`,
    hint: `(${base})`,
    tags: { c, g },
    options,
    answer: idx,
    kase: c,
    why: detWhy(d, c, g),
    solved: `${answer} ${SAMPLE[g][c]}`,
  };
}

/* ============================================================ Lückensätze */

const POSS_OF: Record<Person, string> = {
  ich: 'mein', du: 'dein', er: 'sein', sie: 'ihr', es: 'sein', wir: 'unser', ihr: 'euer', sie_pl: 'ihr', Sie: 'Ihr',
};

const withEnding = (stem: string, end: string) => (stem === 'euer' && end ? `eur${end}` : stem + end);

/** The correct form and wrong options for one bank item. */
export function bankForms(item: BankItem): { answer: string; pools: string[]; hint: string } | null {
  const { k, c, g } = item;
  if (k.startsWith('pp:')) {
    const p = k.slice(3) as Person;
    if (!PP[p] || c === 'gen') return null;
    const answer = PP[p][c];
    const own = [PP[p].nom, PP[p].akk, PP[p].dat].filter((f) => !(p === 'ihr' && f === 'ihr'));
    const poss = POSS_OF[p];
    return { answer, pools: [...own, withEnding(poss, 'e'), withEnding(poss, 'en'), withEnding(poss, 'em')], hint: `(${PERSON_LABEL[p].de})` };
  }
  if (k.startsWith('refl:')) {
    const p = k.slice(5) as Person;
    if (!REFL[p] || (c !== 'akk' && c !== 'dat')) return null;
    const answer = REFL[p][c];
    const other = REFL[p][c === 'akk' ? 'dat' : 'akk'];
    const nom = p === 'ihr' ? null : PP[p].nom;
    const poss = POSS_OF[p];
    return { answer, pools: [other, nom, withEnding(poss, ''), withEnding(poss, 'e'), 'sich'].filter(Boolean) as string[], hint: '(sich)' };
  }
  if (k === 'wer') {
    return { answer: WER[c], pools: CASES.map((oc) => WER[oc]), hint: '(wer?)' };
  }
  if (k === 'rel') {
    if (!g) return null;
    return {
      answer: REL[c][g],
      pools: [...CASES.map((oc) => REL[oc][g]), ...GENDERS.map((og) => REL[c][og])],
      hint: '(der/die/das …)',
    };
  }
  if (k.startsWith('alone:')) {
    const stem = k.slice(6) as AloneStem;
    if (!g) return null;
    const answer = aloneForm(stem, c, g);
    if (!answer) return null;
    const pools = [
      ...(['nom', 'akk', 'dat'] as Case[]).map((oc) => aloneForm(stem, oc, g)),
      einForm(stem, c, g),
      ...GENDERS.map((og) => aloneForm(stem, c, og)),
      stem,
      `${stem}e`,
      `${stem}es`,
    ].filter(Boolean) as string[];
    return { answer, pools, hint: `(${stem}-)` };
  }
  const d = k as Det;
  if (!DETS.includes(d) || !g) return null;
  const answer = detForm(d, c, g);
  if (!answer) return null;
  const pools = [
    ...CASES.map((oc) => detForm(d, oc, g)),
    ...GENDERS.map((og) => detForm(d, c, og)),
    ...CASES.flatMap((oc) => GENDERS.map((og) => detForm(d, oc, og))),
  ].filter(Boolean) as string[];
  const nom = detForm(d, 'nom', g)!;
  return { answer, pools, hint: g === 'pl' ? `(${nom}, Pl.)` : `(${nom})` };
}

const fill = (s: string, form: string) => (s.startsWith('___') ? s.replace('___', cap(form)) : s.replace('___', form));

function bankQuestion(item: BankItem, rnd: Rnd): Question | null {
  const f = bankForms(item);
  if (!f) return null;
  const atStart = item.s.startsWith('___');
  const opts = pickOptions(f.answer, f.pools).map((o) => (atStart ? cap(o) : o));
  const { options, answer } = mc(opts, rnd);
  const shown = atStart ? cap(f.answer) : f.answer;
  const target = item.k.startsWith('pp:') || item.k.startsWith('refl:') || item.k === 'wer' ? CASE_NAME[item.c] : caseG(item.g!, item.c);
  return {
    id: `${PREFIX.luecke}${item.id}`,
    ex: 'luecke',
    task: both('Ergänzen Sie die richtige Form.', 'Fill in the correct form.'),
    text: item.s,
    hint: f.hint,
    options,
    answer,
    kase: item.c,
    why: join(triggerText(item.t), { de: `→ ${target.de}: ${shown}.`, en: `→ ${target.en}: ${shown}.` }, item.why),
    solved: fill(item.s, f.answer),
  };
}

export const bankIds = () => BANK.map((b) => `${PREFIX.luecke}${b.id}`);
export const genIds = () => generatorCells().map((c) => `${PREFIX.luecke}g-${c}`);

function generatedQuestion(cell: string, rnd: Rnd): Question | null {
  const q = generate(cell, rnd);
  if (!q) return null;
  const [, c, g] = cell.split('-') as [string, Case, Gender];
  const { options, answer } = mc([q.answer, ...q.wrong], rnd);
  const notes: Text2[] = [];
  if (g === 'pl' && c === 'dat' && q.noun.plural && !/[nsa]$/.test(q.noun.plural))
    notes.push(both(`Dativ Plural: Nomen + n (${q.noun.plural} → ${q.noun.plural}n).`, `Dative plural: noun + n (${q.noun.plural} → ${q.noun.plural}n).`));
  if (g === 'pl' && c === 'dat' && q.noun.plural && /[nsa]$/.test(q.noun.plural))
    notes.push(both(`Dativ Plural: ${q.noun.plural} endet schon auf -${q.noun.plural.slice(-1)}, kein extra -n.`, `Dative plural: ${q.noun.plural} already ends in -${q.noun.plural.slice(-1)}, no extra -n.`));
  if (c === 'gen' && (g === 'm' || g === 'n')) notes.push(both('Genitiv maskulin/neutrum: auch das Nomen bekommt -s.', 'Masculine/neuter genitive: the noun takes -s too.'));
  return {
    id: `${PREFIX.luecke}g-${cell}`,
    ex: 'luecke',
    task: both('Ergänzen Sie die richtige Form.', 'Fill in the correct form.'),
    text: q.text,
    hint: q.hint,
    options,
    answer,
    kase: c,
    why: join(triggerText(q.frame.t), { de: `→ ${caseG(g, c).de}: ${q.answer}.`, en: `→ ${caseG(g, c).en}: ${q.answer}.` }, ...notes),
    solved: fill(q.text, q.answer),
  };
}

/* ======================================================== Pronomen-Tausch */

const THIRD: Person[] = ['er', 'sie', 'es', 'sie_pl'];
const GENDER_OF: Partial<Record<Person, Gender>> = { er: 'm', sie: 'f', es: 'n', sie_pl: 'pl' };

export const pronCellIds = () =>
  PERSONS.flatMap((p) => (['akk', 'dat'] as const).map((c) => `${PREFIX.pronomen}cell-${p}-${c}`));
export const swapIds = () => SWAPS.map((s) => `${PREFIX.pronomen}${s.id}`);
export const orderIds = () => ORDERS.map((o) => `${PREFIX.pronomen}${o.id}`);

function pronounPools(p: Person, c: 'nom' | 'akk' | 'dat'): string[] {
  const others = THIRD.includes(p) ? THIRD : PERSONS;
  return [PP[p].nom, PP[p].akk, PP[p].dat, ...others.map((o) => PP[o][c]), ...PERSONS.map((o) => PP[o][c])];
}

function pronounQuestion(key: string, rnd: Rnd): Question | null {
  if (key.startsWith('cell-')) {
    const [, p, c] = key.split('-') as [string, Person, 'akk' | 'dat'];
    if (!PP[p] || (c !== 'akk' && c !== 'dat')) return null;
    const answer = PP[p][c];
    const { options, answer: idx } = mc(pickOptions(answer, pronounPools(p, c)), rnd);
    return {
      id: `${PREFIX.pronomen}${key}`,
      ex: 'pronomen',
      task: both(`${CASE_NAME[c].de} von „${PERSON_LABEL[p].de}“?`, `${CASE_NAME[c].en} of „${PERSON_LABEL[p].en}“?`),
      text: `${PERSON_LABEL[p].de} → ___`,
      tags: { c },
      options,
      answer: idx,
      kase: c,
      why: both(
        `${PERSON_LABEL[p].de}: ${PP[p].nom} – ${PP[p].akk} – ${PP[p].dat} (Nom. – Akk. – Dat.)`,
        `${PERSON_LABEL[p].en}: ${PP[p].nom} – ${PP[p].akk} – ${PP[p].dat} (nom. – acc. – dat.)`,
      ),
      solved: answer,
    };
  }
  const swap = SWAPS.find((s) => s.id === key);
  if (swap) {
    const answer = PP[swap.p][swap.c];
    const { options, answer: idx } = mc(pickOptions(answer, pronounPools(swap.p, swap.c)), rnd);
    const gg: Gender = GENDER_OF[swap.p] ?? 'm';
    const replaced = swap.out ?? swap.s.replace(swap.np, swap.s.startsWith(swap.np) ? cap(answer) : answer);
    return {
      id: `${PREFIX.pronomen}${key}`,
      ex: 'pronomen',
      task: both('Welches Pronomen ersetzt den markierten Teil?', 'Which pronoun replaces the marked part?'),
      text: swap.s.replace(swap.np, `[${swap.np}]`),
      tags: { c: swap.c, g: gg },
      options,
      answer: idx,
      kase: swap.c,
      why: both(
        `„${swap.np}“ = ${GENDER_NAME[gg].de} ${CASE_NAME[swap.c].de} → ${answer}. ${replaced}`,
        `„${swap.np}“ = ${GENDER_NAME[gg].en} ${CASE_NAME[swap.c].en} → ${answer}. ${replaced}`,
      ),
      solved: replaced,
    };
  }
  const order = ORDERS.find((o) => o.id === key);
  if (order) {
    const { options, answer: idx } = mc(order.options, rnd);
    return {
      id: `${PREFIX.pronomen}${key}`,
      ex: 'pronomen',
      task: order.task,
      text: order.s,
      options,
      answer: idx,
      why: ORDER_RULE[order.rule],
      solved: order.options[0],
    };
  }
  return null;
}

/* ============================================================ Fall erkennen */

export const fallIds = () => FALL.map((f) => `${PREFIX.fall}${f.id}`);

function fallQuestion(key: string): Question | null {
  const item = FALL.find((f) => f.id === key);
  if (!item) return null;
  return {
    id: `${PREFIX.fall}${key}`,
    ex: 'fall',
    task: both('In welchem Fall steht der markierte Teil?', 'Which case is the marked part in?'),
    text: item.s,
    options: CASES.map((c) => CASE_NAME[c].de),
    answer: CASES.indexOf(item.c),
    kase: item.c,
    why: item.why,
    solved: item.s.replace(/[[\]]/g, ''),
  };
}

/* ====================================================== Präpositionen */

export const PREP_KINDS: PrepKind[] = ['akk', 'dat', 'wechsel', 'gen'];
export const praepIds = () => PREPS.map((p) => `${PREFIX.praep}${p.prep}`);

function praepQuestion(key: string): Question | null {
  const p = PREPS.find((x) => x.prep === key);
  if (!p) return null;
  return {
    id: `${PREFIX.praep}${key}`,
    ex: 'praep',
    task: both('Welcher Fall folgt?', 'Which case follows?'),
    text: p.prep,
    options: PREP_KINDS.map((k) => (k === 'wechsel' ? 'Wechsel' : PREP_KIND_NAME[k].de)),
    answer: PREP_KINDS.indexOf(p.kind),
    kase: p.kind === 'wechsel' ? undefined : p.kind,
    why: join(
      { de: `${p.prep} + ${PREP_KIND_NAME[p.kind].de} (${p.en}).`, en: `${p.prep} + ${PREP_KIND_NAME[p.kind].en} (${p.en}).` },
      { de: p.example, en: p.example },
      p.note,
    ),
    solved: p.example,
  };
}

/* ======================================================== Adjektivendungen */

export const adjIds = () => ADJ_ITEMS.map((a) => `${PREFIX.adjektiv}${a.id}`);

export const ADJ_TYPE_NAME: Record<AdjType, Text2> = {
  def: { de: 'nach der/die/das', en: 'after der/die/das' },
  ein: { de: 'nach ein/kein/mein …', en: 'after ein/kein/mein …' },
  none: { de: 'ohne Artikel', en: 'without an article' },
};

export const ADJ_RULE: Record<AdjType, Text2> = {
  def: {
    de: 'Der Artikel zeigt schon den Fall: -e im Nominativ Singular und im Akkusativ f/n, sonst immer -en.',
    en: 'The article already shows the case: -e in the nominative singular and accusative f/n, -en everywhere else.',
  },
  ein: {
    de: 'Wie nach der/die/das – nur wo ein/kein/mein keine Endung hat (Nom. m, Nom./Akk. n), zeigt das Adjektiv das Genus: -er / -es.',
    en: 'As after der/die/das – except where ein/kein/mein has no ending (nom. m, nom./acc. n): then the adjective shows the gender: -er / -es.',
  },
  none: {
    de: 'Ohne Artikel trägt das Adjektiv die Endung des Artikels: der → -er, die → -e, das → -es, dem → -em; nur Genitiv m/n: -en.',
    en: 'Without an article the adjective takes the article’s ending: der → -er, die → -e, das → -es, dem → -em; only genitive m/n: -en.',
  },
};

const ADJ_ENDINGS = ['e', 'en', 'er', 'es', 'em'];

function adjQuestion(key: string): Question | null {
  const item = ADJ_ITEMS.find((a) => a.id === key);
  if (!item) return null;
  const m = /\{([^}]+)\}/.exec(item.s);
  if (!m) return null;
  const adj = m[1].toLowerCase();
  const atStart = item.s.startsWith('{');
  const end = ADJ_END[item.t][item.c][item.g];
  const word = (e: string) => (atStart ? cap(adjStem(adj) + e) : adjStem(adj) + e);
  const others = ADJ_ENDINGS.filter((e) => e !== end).slice(0, 3);
  const endings = ADJ_ENDINGS.filter((e) => e === end || others.includes(e));
  const options = endings.map(word);
  const answer = adjForm(adj, item.t, item.c, item.g);
  const shown = atStart ? cap(answer) : answer;
  return {
    id: `${PREFIX.adjektiv}${key}`,
    ex: 'adjektiv',
    task: both('Welche Endung hat das Adjektiv?', 'Which ending does the adjective take?'),
    text: item.s.replace(m[0], '___'),
    hint: `(${adj})`,
    tags: { c: item.c, g: item.g, label: ADJ_TYPE_NAME[item.t].de },
    options,
    answer: endings.indexOf(end),
    kase: item.c,
    why: join(
      { de: `${cap(ADJ_TYPE_NAME[item.t].de)}, ${caseG(item.g, item.c).de} → -${end}: ${shown}.`, en: `${cap(ADJ_TYPE_NAME[item.t].en)}, ${caseG(item.g, item.c).en} → -${end}: ${shown}.` },
      ADJ_RULE[item.t],
    ),
    solved: item.s.replace(m[0], shown),
  };
}

/* ================================================================ rounds */

export function idsFor(ex: ExId): string[] {
  switch (ex) {
    case 'tabelle':
      return tabelleIds();
    case 'luecke':
      return [...bankIds(), ...genIds()];
    case 'pronomen':
      return [...swapIds(), ...orderIds(), ...pronCellIds()];
    case 'fall':
      return fallIds();
    case 'praep':
      return praepIds();
    case 'adjektiv':
      return adjIds();
  }
}

export const ALL_IDS = () => EXERCISES.flatMap(idsFor);

export function exerciseOf(id: string): ExId | null {
  return EXERCISES.find((ex) => id.startsWith(PREFIX[ex])) ?? null;
}

/** Rebuilds the question for a progress id. Generated items get a fresh sentence for the same form. */
export function questionFor(id: string, rnd: Rnd = Math.random): Question | null {
  const ex = exerciseOf(id);
  if (!ex) return null;
  const key = id.slice(PREFIX[ex].length);
  switch (ex) {
    case 'tabelle':
      return tabelleQuestion(key, rnd);
    case 'luecke': {
      if (key.startsWith('g-')) return generatedQuestion(key.slice(2), rnd);
      const item = BANK.find((b) => b.id === key);
      return item ? bankQuestion(item, rnd) : null;
    }
    case 'pronomen':
      return pronounQuestion(key, rnd);
    case 'fall':
      return fallQuestion(key);
    case 'praep':
      return praepQuestion(key);
    case 'adjektiv':
      return adjQuestion(key);
  }
}

export const ROUND_SIZE: Record<ExId, number> = { tabelle: 15, luecke: 12, pronomen: 12, fall: 12, praep: 15, adjektiv: 12 };

const seen = (p: ItemProgress | undefined) => historyOf(p).length > 0;

/**
 * Picks the ids of one round: what is due or weak first (spaced repetition),
 * then new items in random order, then the weakest of the rest.
 */
export function pickIds(ids: string[], progress: Record<string, ItemProgress>, n: number, rnd: Rnd = Math.random, now = Date.now()): string[] {
  const due = dueOrder(ids.filter((id) => seen(progress[id])), progress, now).slice(0, Math.ceil(n / 2));
  const chosen = new Set(due);
  const fresh = shuffled(ids.filter((id) => !seen(progress[id]) && !chosen.has(id)), rnd);
  const rest = ids
    .filter((id) => seen(progress[id]) && !chosen.has(id))
    .map((id) => ({ id, s: strength(progress[id], now) + rnd() * 0.15 }))
    .sort((a, b) => a.s - b.s)
    .map((x) => x.id);
  return [...due, ...fresh, ...rest].slice(0, n);
}

export function buildRound(ex: ExId, progress: Record<string, ItemProgress>, rnd: Rnd = Math.random, now = Date.now()): Question[] {
  const n = ROUND_SIZE[ex];
  let ids: string[];
  if (ex === 'luecke') {
    const gen = Math.round(n / 3);
    ids = [...pickIds(bankIds(), progress, n - gen, rnd, now), ...pickIds(genIds(), progress, gen, rnd, now)];
  } else ids = pickIds(idsFor(ex), progress, n, rnd, now);
  return shuffled(ids, rnd)
    .map((id) => questionFor(id, rnd))
    .filter((q): q is Question => q !== null);
}

/** Ids that need work: due again, or answered and still weak. */
export function weakIds(progress: Record<string, ItemProgress>, now = Date.now()): string[] {
  const all = new Set(ALL_IDS());
  const ids = Object.keys(progress).filter((id) => all.has(id) && seen(progress[id]) && (isDue(progress[id], now) || isWeak(progress[id], now)));
  return ids
    .map((id) => ({ id, s: strength(progress[id], now) }))
    .sort((a, b) => a.s - b.s)
    .map((x) => x.id);
}

export function buildWeakRound(progress: Record<string, ItemProgress>, rnd: Rnd = Math.random, now = Date.now(), n = 15): Question[] {
  return weakIds(progress, now)
    .slice(0, n)
    .map((id) => questionFor(id, rnd))
    .filter((q): q is Question => q !== null);
}

export interface ExStats {
  total: number;
  practised: number;
  strong: number;
  weak: number;
  /** Mean strength over all items, unseen ones counting 0. */
  strength: number;
}

export function exStats(ex: ExId, progress: Record<string, ItemProgress>, now = Date.now()): ExStats {
  const ids = idsFor(ex);
  let practised = 0;
  let strong = 0;
  let weak = 0;
  let sum = 0;
  for (const id of ids) {
    const p = progress[id];
    if (!seen(p)) continue;
    practised++;
    const s = strength(p, now);
    sum += s;
    if (s >= 0.85) strong++;
    if (isWeak(p, now)) weak++;
  }
  return { total: ids.length, practised, strong, weak, strength: ids.length ? sum / ids.length : 0 };
}
