/**
 * German declension tables for the Grammatik section: articles, ein-words,
 * possessives, pronouns and adjective endings. Pure data and functions, so
 * every cell is unit-tested (test/grammatik.test.ts).
 */
import type { Text2 } from '../../types.ts';

export type Case = 'nom' | 'akk' | 'dat' | 'gen';
export type Gender = 'm' | 'f' | 'n' | 'pl';

export const CASES: Case[] = ['nom', 'akk', 'dat', 'gen'];
export const GENDERS: Gender[] = ['m', 'f', 'n', 'pl'];

export const CASE_NAME: Record<Case, Text2> = {
  nom: { de: 'Nominativ', en: 'nominative' },
  akk: { de: 'Akkusativ', en: 'accusative' },
  dat: { de: 'Dativ', en: 'dative' },
  gen: { de: 'Genitiv', en: 'genitive' },
};

export const CASE_SHORT: Record<Case, string> = { nom: 'Nom.', akk: 'Akk.', dat: 'Dat.', gen: 'Gen.' };

export const CASE_QUESTION: Record<Case, string> = {
  nom: 'Wer? / Was?',
  akk: 'Wen? / Was?',
  dat: 'Wem?',
  gen: 'Wessen?',
};

export const CASE_ROLE: Record<Case, Text2> = {
  nom: { de: 'Subjekt – wer handelt', en: 'subject – who does it' },
  akk: { de: 'direktes Objekt – was/wen betrifft es', en: 'direct object – what/whom it is done to' },
  dat: { de: 'indirektes Objekt – Empfänger', en: 'indirect object – the receiver' },
  gen: { de: 'Besitzer – wem gehört es', en: 'owner – whose it is' },
};

export const GENDER_NAME: Record<Gender, Text2> = {
  m: { de: 'maskulin', en: 'masculine' },
  f: { de: 'feminin', en: 'feminine' },
  n: { de: 'neutrum', en: 'neuter' },
  pl: { de: 'Plural', en: 'plural' },
};

export const GENDER_SHORT: Record<Gender, string> = { m: 'm', f: 'f', n: 'n', pl: 'Pl.' };

/* ------------------------------------------------------------- der-Artikel */

export const DEF: Record<Case, Record<Gender, string>> = {
  nom: { m: 'der', f: 'die', n: 'das', pl: 'die' },
  akk: { m: 'den', f: 'die', n: 'das', pl: 'die' },
  dat: { m: 'dem', f: 'der', n: 'dem', pl: 'den' },
  gen: { m: 'des', f: 'der', n: 'des', pl: 'der' },
};

/* -------------------------------------------------------------- ein-Wörter */

/** Endings of ein, kein and every possessive (the "ein-pattern"). */
export const EIN_END: Record<Case, Record<Gender, string>> = {
  nom: { m: '', f: 'e', n: '', pl: 'e' },
  akk: { m: 'en', f: 'e', n: '', pl: 'e' },
  dat: { m: 'em', f: 'er', n: 'em', pl: 'en' },
  gen: { m: 'es', f: 'er', n: 'es', pl: 'er' },
};

export const POSSESSIVES = ['mein', 'dein', 'sein', 'ihr', 'unser', 'euer', 'Ihr'] as const;
export type Possessive = (typeof POSSESSIVES)[number];
export type EinWord = 'ein' | 'kein' | Possessive;
export type Det = 'der' | EinWord;
export const DETS: Det[] = ['der', 'ein', 'kein', ...POSSESSIVES];

/** Which person each possessive belongs to. */
export const POSSESSIVE_OF: Record<Possessive, string> = {
  mein: 'ich',
  dein: 'du',
  sein: 'er / es',
  ihr: 'sie (Sg.) / sie (Pl.)',
  unser: 'wir',
  euer: 'ihr',
  Ihr: 'Sie',
};

/** Splits an ein-word into the part that never changes and its ending; euer drops its e before an ending. */
export function einParts(stem: EinWord, c: Case, g: Gender): { stem: string; end: string } | null {
  if (stem === 'ein' && g === 'pl') return null;
  const end = EIN_END[c][g];
  if (stem === 'euer' && end) return { stem: 'eur', end };
  return { stem, end };
}

export function einForm(stem: EinWord, c: Case, g: Gender): string | null {
  const p = einParts(stem, c, g);
  return p ? p.stem + p.end : null;
}

/** Any determiner: der-article or ein-word. Null where it does not exist (ein in the plural). */
export function detForm(det: Det, c: Case, g: Gender): string | null {
  return det === 'der' ? DEF[c][g] : einForm(det, c, g);
}

/* ------------------------------------------------- Pronomen ohne Nomen */

/**
 * ein-words used on their own ("Das ist meiner.", "Ich habe keins."). Only
 * Nominativ, Akkusativ and Dativ – the Genitiv is not used at B1. "ein" has no
 * plural (the plural is "welche").
 */
export function aloneForm(stem: 'ein' | 'kein' | 'mein' | 'dein' | 'sein' | 'ihr' | 'unser' | 'Ihr', c: Case, g: Gender): string | null {
  if (c === 'gen') return null;
  if (stem === 'ein' && g === 'pl') return null;
  if (g === 'm' && c === 'nom') return `${stem}er`;
  if (g === 'n' && (c === 'nom' || c === 'akk')) return stem === 'unser' ? 'unseres' : `${stem}s`;
  return einForm(stem, c, g);
}
export type AloneStem = Parameters<typeof aloneForm>[0];

/* ---------------------------------------------------------- Personalpronomen */

export type Person = 'ich' | 'du' | 'er' | 'sie' | 'es' | 'wir' | 'ihr' | 'sie_pl' | 'Sie';
export const PERSONS: Person[] = ['ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'sie_pl', 'Sie'];

/** How a person is shown: "sie" for she and they are told apart. */
export const PERSON_LABEL: Record<Person, Text2> = {
  ich: { de: 'ich', en: 'ich (I)' },
  du: { de: 'du', en: 'du (you)' },
  er: { de: 'er', en: 'er (he/it)' },
  sie: { de: 'sie (Sg.)', en: 'sie (she/it)' },
  es: { de: 'es', en: 'es (it)' },
  wir: { de: 'wir', en: 'wir (we)' },
  ihr: { de: 'ihr', en: 'ihr (you, pl.)' },
  sie_pl: { de: 'sie (Pl.)', en: 'sie (they)' },
  Sie: { de: 'Sie', en: 'Sie (you, formal)' },
};

export const PP: Record<Person, { nom: string; akk: string; dat: string }> = {
  ich: { nom: 'ich', akk: 'mich', dat: 'mir' },
  du: { nom: 'du', akk: 'dich', dat: 'dir' },
  er: { nom: 'er', akk: 'ihn', dat: 'ihm' },
  sie: { nom: 'sie', akk: 'sie', dat: 'ihr' },
  es: { nom: 'es', akk: 'es', dat: 'ihm' },
  wir: { nom: 'wir', akk: 'uns', dat: 'uns' },
  ihr: { nom: 'ihr', akk: 'euch', dat: 'euch' },
  sie_pl: { nom: 'sie', akk: 'sie', dat: 'ihnen' },
  Sie: { nom: 'Sie', akk: 'Sie', dat: 'Ihnen' },
};

export const REFL: Record<Person, { akk: string; dat: string }> = {
  ich: { akk: 'mich', dat: 'mir' },
  du: { akk: 'dich', dat: 'dir' },
  er: { akk: 'sich', dat: 'sich' },
  sie: { akk: 'sich', dat: 'sich' },
  es: { akk: 'sich', dat: 'sich' },
  wir: { akk: 'uns', dat: 'uns' },
  ihr: { akk: 'euch', dat: 'euch' },
  sie_pl: { akk: 'sich', dat: 'sich' },
  Sie: { akk: 'sich', dat: 'sich' },
};

/** The third-person pronoun that replaces a noun of this gender. */
export const PRONOUN_FOR: Record<Gender, Person> = { m: 'er', f: 'sie', n: 'es', pl: 'sie_pl' };

/* ------------------------------------------------- Fragewörter, Relativpronomen */

export const WER: Record<Case, string> = { nom: 'wer', akk: 'wen', dat: 'wem', gen: 'wessen' };

export const REL: Record<Case, Record<Gender, string>> = {
  nom: { m: 'der', f: 'die', n: 'das', pl: 'die' },
  akk: { m: 'den', f: 'die', n: 'das', pl: 'die' },
  dat: { m: 'dem', f: 'der', n: 'dem', pl: 'denen' },
  gen: { m: 'dessen', f: 'deren', n: 'dessen', pl: 'deren' },
};

/* ---------------------------------------------------------- Adjektivendungen */

/** def = after der/die/das (and dieser …), ein = after ein/kein/mein …, none = no article. */
export type AdjType = 'def' | 'ein' | 'none';

export const ADJ_END: Record<AdjType, Record<Case, Record<Gender, string>>> = {
  def: {
    nom: { m: 'e', f: 'e', n: 'e', pl: 'en' },
    akk: { m: 'en', f: 'e', n: 'e', pl: 'en' },
    dat: { m: 'en', f: 'en', n: 'en', pl: 'en' },
    gen: { m: 'en', f: 'en', n: 'en', pl: 'en' },
  },
  ein: {
    nom: { m: 'er', f: 'e', n: 'es', pl: 'en' },
    akk: { m: 'en', f: 'e', n: 'es', pl: 'en' },
    dat: { m: 'en', f: 'en', n: 'en', pl: 'en' },
    gen: { m: 'en', f: 'en', n: 'en', pl: 'en' },
  },
  none: {
    nom: { m: 'er', f: 'e', n: 'es', pl: 'e' },
    akk: { m: 'en', f: 'e', n: 'es', pl: 'e' },
    dat: { m: 'em', f: 'er', n: 'em', pl: 'en' },
    gen: { m: 'en', f: 'er', n: 'en', pl: 'er' },
  },
};

/** The stem an ending is added to: hoch → hoh-, dunkel → dunkl-, teuer → teur-. */
export function adjStem(adj: string): string {
  if (adj === 'hoch') return 'hoh';
  if (/[^aeiouäöü]el$/.test(adj)) return adj.slice(0, -2) + 'l';
  if (/(eu|au)er$/.test(adj)) return adj.slice(0, -2) + 'r';
  return adj;
}

export const adjEnding = (t: AdjType, c: Case, g: Gender) => ADJ_END[t][c][g];
export const adjForm = (adj: string, t: AdjType, c: Case, g: Gender) => adjStem(adj) + ADJ_END[t][c][g];

/* --------------------------------------------------------------- helpers */

export const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);
