import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ADJ_END,
  CASES,
  DEF,
  GENDERS,
  PERSONS,
  PP,
  REFL,
  REL,
  WER,
  adjForm,
  aloneForm,
  detForm,
  einForm,
} from '../src/content/grammatik/forms.ts';
import { BANK } from '../src/content/grammatik/bank.ts';
import { FALL } from '../src/content/grammatik/fall.ts';
import { ORDERS, SWAPS } from '../src/content/grammatik/pronomen.ts';
import { ADJ_ITEMS } from '../src/content/grammatik/adjektive.ts';
import { PREPS, triggerCase } from '../src/content/grammatik/rules.ts';
import {
  FRAMES,
  NOUNS,
  PERSON_NOUNS,
  PLACE_NOUNS,
  datPlural,
  genSingular,
  generate,
  generatorCells,
  nounForm,
} from '../src/content/grammatik/generator.ts';
import {
  ALL_IDS,
  EXERCISES,
  ROUND_SIZE,
  bankForms,
  buildRound,
  buildWeakRound,
  exStats,
  idsFor,
  pickIds,
  questionFor,
  weakIds,
} from '../src/content/grammatik/items.ts';
import { vocab } from '../src/content/wortschatz.ts';
import type { ItemProgress } from '../src/types.ts';

/** Deterministic random numbers, so failures can be reproduced. */
function seeded(seed = 7) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const row = (f: (c: (typeof CASES)[number], g: (typeof GENDERS)[number]) => string | null) =>
  CASES.map((c) => GENDERS.map((g) => f(c, g) ?? '–').join(' '));

/* ------------------------------------------------------------ tables */

test('bestimmter Artikel: r-e-s-e / n-e-s-e / m-r-m-n / s-r-s-r', () => {
  assert.deepEqual(row((c, g) => DEF[c][g]), ['der die das die', 'den die das die', 'dem der dem den', 'des der des der']);
});

test('ein, kein and every possessive follow the ein-pattern', () => {
  assert.deepEqual(row((c, g) => einForm('ein', c, g)), ['ein eine ein –', 'einen eine ein –', 'einem einer einem –', 'eines einer eines –']);
  assert.deepEqual(row((c, g) => einForm('kein', c, g)), [
    'kein keine kein keine',
    'keinen keine kein keine',
    'keinem keiner keinem keinen',
    'keines keiner keines keiner',
  ]);
  assert.deepEqual(row((c, g) => einForm('unser', c, g)), [
    'unser unsere unser unsere',
    'unseren unsere unser unsere',
    'unserem unserer unserem unseren',
    'unseres unserer unseres unserer',
  ]);
  assert.deepEqual(row((c, g) => einForm('euer', c, g)), [
    'euer eure euer eure',
    'euren eure euer eure',
    'eurem eurer eurem euren',
    'eures eurer eures eurer',
  ]);
  assert.equal(einForm('Ihr', 'dat', 'pl'), 'Ihren');
  assert.equal(einForm('ihr', 'gen', 'f'), 'ihrer');
  assert.equal(einForm('sein', 'akk', 'm'), 'seinen');
  assert.equal(einForm('dein', 'dat', 'n'), 'deinem');
  assert.equal(einForm('mein', 'nom', 'n'), 'mein');
  assert.equal(detForm('ein', 'nom', 'pl'), null);
});

test('spot checks the learner asked about', () => {
  assert.equal(`${DEF.dat.pl} Kinder${'n'}`, 'den Kindern');
  assert.equal(einForm('ein', 'dat', 'm'), 'einem');
  assert.equal(einForm('ein', 'dat', 'f'), 'einer');
  assert.equal(einForm('kein', 'gen', 'f'), 'keiner');
  assert.equal(einForm('kein', 'dat', 'f'), 'keiner');
  assert.equal(einForm('euer', 'dat', 'm'), 'eurem');
  assert.equal(einForm('ihr', 'nom', 'pl'), 'ihre');
  assert.equal(einForm('sein', 'dat', 'f'), 'seiner');
  assert.equal(PP.Sie.dat, 'Ihnen');
});

test('Personalpronomen in Nominativ, Akkusativ and Dativ', () => {
  const table = PERSONS.map((p) => `${PP[p].nom} ${PP[p].akk} ${PP[p].dat}`);
  assert.deepEqual(table, [
    'ich mich mir',
    'du dich dir',
    'er ihn ihm',
    'sie sie ihr',
    'es es ihm',
    'wir uns uns',
    'ihr euch euch',
    'sie sie ihnen',
    'Sie Sie Ihnen',
  ]);
});

test('Reflexivpronomen: only ich and du differ between Akkusativ and Dativ', () => {
  for (const p of PERSONS) {
    if (p === 'ich' || p === 'du') assert.notEqual(REFL[p].akk, REFL[p].dat);
    else assert.equal(REFL[p].akk, REFL[p].dat);
  }
  assert.equal(REFL.ich.dat, 'mir');
  assert.equal(REFL.er.akk, 'sich');
  assert.equal(REFL.Sie.dat, 'sich');
});

test('Relativpronomen and wer/wen/wem/wessen', () => {
  assert.deepEqual(row((c, g) => REL[c][g]), ['der die das die', 'den die das die', 'dem der dem denen', 'dessen deren dessen deren']);
  assert.deepEqual(CASES.map((c) => WER[c]), ['wer', 'wen', 'wem', 'wessen']);
});

test('ein-words without a noun: einer, eins, keiner, meiner, meins', () => {
  assert.equal(aloneForm('ein', 'nom', 'm'), 'einer');
  assert.equal(aloneForm('ein', 'akk', 'm'), 'einen');
  assert.equal(aloneForm('ein', 'nom', 'n'), 'eins');
  assert.equal(aloneForm('ein', 'akk', 'n'), 'eins');
  assert.equal(aloneForm('ein', 'nom', 'f'), 'eine');
  assert.equal(aloneForm('ein', 'dat', 'm'), 'einem');
  assert.equal(aloneForm('kein', 'nom', 'm'), 'keiner');
  assert.equal(aloneForm('kein', 'akk', 'n'), 'keins');
  assert.equal(aloneForm('kein', 'nom', 'pl'), 'keine');
  assert.equal(aloneForm('kein', 'dat', 'pl'), 'keinen');
  assert.equal(aloneForm('mein', 'nom', 'm'), 'meiner');
  assert.equal(aloneForm('mein', 'nom', 'n'), 'meins');
  assert.equal(aloneForm('dein', 'dat', 'f'), 'deiner');
  assert.equal(aloneForm('ein', 'nom', 'pl'), null);
  assert.equal(aloneForm('mein', 'gen', 'm'), null);
});

test('Adjektivendungen: the three tables', () => {
  assert.deepEqual(row((c, g) => adjForm('gut', 'def', c, g)), ['gute gute gute guten', 'guten gute gute guten', 'guten guten guten guten', 'guten guten guten guten']);
  assert.deepEqual(row((c, g) => adjForm('gut', 'ein', c, g)), ['guter gute gutes guten', 'guten gute gutes guten', 'guten guten guten guten', 'guten guten guten guten']);
  assert.deepEqual(row((c, g) => adjForm('gut', 'none', c, g)), ['guter gute gutes gute', 'guten gute gutes gute', 'gutem guter gutem guten', 'guten guter guten guter']);
  assert.equal(adjForm('teuer', 'ein', 'akk', 'm'), 'teuren');
  assert.equal(adjForm('dunkel', 'none', 'akk', 'f'), 'dunkle');
  assert.equal(adjForm('hoch', 'ein', 'nom', 'm'), 'hoher');
  assert.equal(adjForm('sauer', 'def', 'nom', 'f'), 'saure');
  assert.equal(adjForm('neu', 'def', 'nom', 'm'), 'neue');
  assert.equal(Object.keys(ADJ_END).length, 3);
});

/* ------------------------------------------------------------ generator */

test('Dativ plural takes -n unless the plural ends in -n, -s or -a', () => {
  assert.equal(datPlural('Kinder'), 'Kindern');
  assert.equal(datPlural('Mieter'), 'Mietern');
  assert.equal(datPlural('Mietverträge'), 'Mietverträgen');
  assert.equal(datPlural('Mieten'), 'Mieten');
  assert.equal(datPlural('Autos'), 'Autos');
  assert.equal(datPlural('Praktika'), 'Praktika');
});

test('Genitiv singular only where the -s is certain', () => {
  assert.equal(genSingular({ de: 'Keller', g: 'm' }), 'Kellers');
  assert.equal(genSingular({ de: 'Studium', g: 'n' }), 'Studiums');
  assert.equal(genSingular({ de: 'Miete', g: 'f' }), 'Miete');
  assert.equal(genSingular({ de: 'Arzt', g: 'm' }), null);
  assert.equal(genSingular({ de: 'Zeugnis', g: 'n' }), null);
});

test('the generator leaves out n-Deklination and adjectival nouns', () => {
  const names = new Set(NOUNS.map((n) => n.de));
  for (const bad of ['Kollege', 'Nachbar', 'Neffe', 'Verwandte', 'Bekannte', 'Vorgesetzte', 'Auszubildende', 'Geldautomat', 'Vorname', 'Familienname'])
    assert.ok(!names.has(bad), `${bad} must not be generated`);
  for (const good of ['Mietvertrag', 'Miete', 'Treppenhaus', 'Keller', 'Apotheke']) assert.ok(names.has(good), `${good} expected`);
  for (const n of NOUNS) assert.ok(n.g !== 'm' || !n.de.endsWith('e'), `${n.de}: masculine -e`);
  assert.ok(NOUNS.length >= 200, `only ${NOUNS.length} nouns`);
});

test('every person and place noun is in the vocabulary', () => {
  const names = new Set(NOUNS.map((n) => n.de));
  for (const n of [...PERSON_NOUNS, ...PLACE_NOUNS]) assert.ok(names.has(n), `${n} missing from the generator nouns`);
});

const noun = (de: string) => {
  const n = NOUNS.find((x) => x.de === de);
  assert.ok(n, de);
  return n!;
};

test('noun forms for a sample of each gender', () => {
  const keller = noun('Keller');
  assert.deepEqual(CASES.map((c) => `${DEF[c].m} ${nounForm(keller, c, false)}`), ['der Keller', 'den Keller', 'dem Keller', 'des Kellers']);
  assert.deepEqual(CASES.map((c) => `${DEF[c].pl} ${nounForm(keller, c, true)}`), ['die Keller', 'die Keller', 'den Kellern', 'der Keller']);
  const miete = noun('Miete');
  assert.deepEqual(CASES.map((c) => `${einForm('mein', c, 'f')} ${nounForm(miete, c, false)}`), ['meine Miete', 'meine Miete', 'meiner Miete', 'meiner Miete']);
  assert.equal(`${einForm('kein', 'dat', 'pl')} ${nounForm(miete, 'dat', true)}`, 'keinen Mieten');
  const haus = noun('Treppenhaus');
  assert.equal(`${einForm('ein', 'dat', 'n')} ${nounForm(haus, 'dat', false)}`, 'einem Treppenhaus');
  assert.equal(`${DEF.dat.pl} ${nounForm(haus, 'dat', true)}`, 'den Treppenhäusern');
  assert.equal(nounForm(haus, 'gen', false), null, 'des Treppenhauses/-hauses is left out');
  const vertrag = noun('Mietvertrag');
  assert.equal(`${einForm('euer', 'dat', 'm')} ${nounForm(vertrag, 'dat', false)}`, 'eurem Mietvertrag');
  assert.equal(`${einForm('unser', 'dat', 'pl')} ${nounForm(vertrag, 'dat', true)}`, 'unseren Mietverträgen');
});

test('generated questions: right form, four distinct options, no wrong option is also right', () => {
  const rnd = seeded(11);
  const cells = generatorCells();
  assert.ok(cells.length >= 40, `only ${cells.length} cells`);
  for (const cell of cells) {
    for (let i = 0; i < 25; i++) {
      const q = generate(cell, rnd);
      assert.ok(q, `no question for ${cell}`);
      const [, c, g] = cell.split('-') as [string, (typeof CASES)[number], (typeof GENDERS)[number]];
      const expected = `${detForm(q!.det, c, g)} ${nounForm(q!.noun, c, g === 'pl')}`;
      assert.equal(q!.answer, expected, `${cell}: ${q!.text}`);
      assert.equal(q!.frame.c, c);
      assert.equal(new Set([q!.answer, ...q!.wrong]).size, 4, `${cell}: ${[q!.answer, ...q!.wrong].join(' / ')}`);
      const sg = `${detForm(q!.det, c, q!.noun.g)} ${nounForm(q!.noun, c, false)}`;
      const pl = detForm(q!.det, c, 'pl') && q!.noun.plural ? `${detForm(q!.det, c, 'pl')} ${nounForm(q!.noun, c, true)}` : null;
      for (const w of q!.wrong) assert.ok(w !== sg && w !== pl, `${cell}: "${w}" is correct too (${q!.text})`);
      if (q!.frame.defOnlyFPl) assert.ok(!(q!.det === 'der' && (g === 'm' || g === 'n')), 'in dem → im');
    }
  }
});

test('frames agree with their trigger', () => {
  for (const f of FRAMES) assert.equal(triggerCase(f.t), f.c, f.id);
});

/* ------------------------------------------------------------ content */

test('the sentence bank has at least 150 well-formed items', () => {
  assert.ok(BANK.length >= 150, `only ${BANK.length}`);
  const ids = new Set<string>();
  for (const b of BANK) {
    assert.ok(!ids.has(b.id), `duplicate ${b.id}`);
    ids.add(b.id);
    assert.equal(b.s.split('___').length, 2, `${b.id}: exactly one gap`);
    assert.match(b.s, /[.!?]$/, `${b.id}: full sentence`);
    const f = bankForms(b);
    assert.ok(f, `${b.id}: no form`);
    const known = triggerCase(b.t);
    if (known) assert.equal(known, b.c, `${b.id}: trigger ${b.t} says ${known}, item says ${b.c}`);
  }
  const byCase = (c: string) => BANK.filter((b) => b.c === c).length;
  for (const c of CASES) assert.ok(byCase(c) >= 10, `${c}: ${byCase(c)}`);
});

test('selected bank answers', () => {
  const answer = (id: string) => bankForms(BANK.find((b) => b.id === id)!)!.answer;
  assert.equal(answer('b001'), 'meiner'); // Ich helfe meiner Mutter.
  assert.equal(answer('b021'), 'Ihnen'); // Ich danke Ihnen …
  assert.equal(answer('b047'), 'eure'); // Habt ihr eure Hausaufgaben …
  assert.equal(answer('b098'), 'meinen'); // bei meinen Eltern
  assert.equal(answer('b121'), 'dem'); // liegt auf dem Tisch
  assert.equal(answer('b122'), 'den'); // lege … auf den Tisch
  assert.equal(answer('b161'), 'meines'); // das Auto meines Vaters
  assert.equal(answer('b192'), 'denen');
  assert.equal(answer('b199'), 'mir'); // Ich wasche mir die Hände.
  assert.equal(answer('b209'), 'meiner'); // Das ist meiner.
  assert.equal(answer('b210'), 'meins');
  assert.equal(answer('b214'), 'keiner');
});

test('case detective, pronoun and adjective items are well-formed', () => {
  assert.ok(FALL.length >= 40);
  for (const f of FALL) assert.equal((f.s.match(/\[/g) ?? []).length, 1, f.id);
  for (const s of SWAPS) assert.ok(s.s.includes(s.np), s.id);
  assert.equal(SWAPS.find((s) => s.id === 's02')!.out, 'Ich gebe es dem Kollegen.');
  for (const o of ORDERS) assert.equal(new Set(o.options).size, o.options.length, o.id);
  for (const a of ADJ_ITEMS) assert.equal((a.s.match(/\{/g) ?? []).length, 1, a.id);
  const adj = (id: string) => questionFor(`gram:adj:${id}`)!;
  const pick = (id: string) => adj(id).options[adj(id).answer];
  assert.equal(pick('a01'), 'heißen');
  assert.equal(pick('a22'), 'schlechtem');
  assert.equal(pick('a27'), 'teuren');
  assert.equal(pick('a28'), 'hoher');
  assert.equal(pick('a32'), 'Deutsches');
  assert.equal(PREPS.filter((p) => p.kind === 'wechsel').length, 9);
});

/* ------------------------------------------------------------ questions */

test('every item id builds a question with distinct options', () => {
  const ids = ALL_IDS();
  assert.equal(new Set(ids).size, ids.length, 'ids are unique');
  const rnd = seeded(3);
  for (const id of ids) {
    assert.ok(id.startsWith('gram:'), id);
    const q = questionFor(id, rnd);
    assert.ok(q, `no question for ${id}`);
    assert.equal(q!.id, id);
    assert.ok(q!.options.length >= 2, id);
    assert.equal(new Set(q!.options).size, q!.options.length, `${id}: ${q!.options.join(' / ')}`);
    assert.ok(q!.answer >= 0 && q!.answer < q!.options.length, id);
    assert.ok(q!.options.length <= 4, `${id}: keys 1–4 only`);
    assert.ok(q!.why.de && q!.why.en, id);
  }
  const euer = questionFor('gram:tab:euer-dat-m', rnd)!;
  assert.equal(euer.options[euer.answer], 'eurem');
  const kein = questionFor('gram:tab:kein-gen-f', rnd)!;
  assert.equal(kein.options[kein.answer], 'keiner');
});

test('rounds, weak forms and stats', () => {
  const rnd = seeded(5);
  for (const ex of EXERCISES) {
    const round = buildRound(ex, {}, rnd);
    assert.equal(round.length, Math.min(ROUND_SIZE[ex], idsFor(ex).length), ex);
    assert.equal(new Set(round.map((q) => q.id)).size, round.length, `${ex}: no repeats`);
  }
  const now = 1_700_000_000_000;
  const wrong: ItemProgress = { box: 1, due: now - 1000, correct: 0, wrong: 1, lastSeen: now - 1000, history: [{ at: now - 1000, chosen: 0, ok: false }] };
  const progress: Record<string, ItemProgress> = { 'gram:luecke:b001': wrong, 'gram:tab:der-dat-pl': wrong, 'vocab:x': wrong };
  assert.deepEqual(weakIds(progress, now).sort(), ['gram:luecke:b001', 'gram:tab:der-dat-pl']);
  const weak = buildWeakRound(progress, rnd, now);
  assert.equal(weak.length, 2);
  assert.equal(pickIds(idsFor('tabelle'), progress, 10, rnd, now)[0], 'gram:tab:der-dat-pl', 'due items come first');
  const stats = exStats('tabelle', progress, now);
  assert.equal(stats.practised, 1);
  assert.equal(stats.weak, 1);
  assert.equal(stats.total, idsFor('tabelle').length);
});

test('generated noun data match the vocabulary', () => {
  for (const n of NOUNS) {
    const e = vocab.find((v) => v.id === n.id)!;
    assert.equal(e.de, n.de);
    assert.equal(e.article, n.article);
  }
});
