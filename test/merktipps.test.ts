import { test } from 'node:test';
import assert from 'node:assert/strict';
import { vocab } from '../src/content/wortschatz.ts';
import type { VocabEntry } from '../src/content/types.ts';
import {
  COMPOUND_RULE,
  GENDER_RULES,
  PLURAL_TIPS,
  compoundHead,
  genderTip,
  genderTipText,
  merktipps,
  partizipRule,
  pluralTip,
  ruleCoverage,
  umlaut,
  verbTip,
} from '../src/content/merktipps.ts';
import {
  EXCEPTIONS_PER_ROUND,
  MASTERY,
  RETRY_GAP,
  ROUND_SIZE,
  advanceDrill,
  drillPool,
  genusKey,
  gradeDrill,
  isMastered,
  pickRound,
  requeue,
  shouldRecord,
  startDrill,
} from '../src/sections/wortschatz/genusDrill.ts';

const nouns = vocab.filter((e) => e.pos === 'noun' && e.article);
const verbs = vocab.filter((e) => e.pos === 'verb');

/** The entry from the list, so the tests run on real data. */
function word(de: string): VocabEntry {
  const e = vocab.find((x) => x.de === de);
  assert.ok(e, `${de} is not in the word list`);
  return e!;
}

/** A made-up noun for words the B1 list takes for granted. */
const noun = (article: 'der' | 'die' | 'das', de: string, plural: string, en = ''): VocabEntry => ({
  id: `test-${de}`,
  topic: 'allgemein',
  pos: 'noun',
  de,
  article,
  plural,
  en,
  example: '',
  exampleEn: '',
});

const verb = (de: string, forms: string): VocabEntry => ({ id: `test-${de}`, topic: 'allgemein', pos: 'verb', de, forms, en: '', example: '', exampleEn: '' });

/* ------------------------------------------------------------------ genus */

test('sample: the classic rules give the right article', () => {
  const cases: [VocabEntry, string, string][] = [
    [word('Zeitung'), 'ung', 'die'],
    [noun('die', 'Wohnung', 'Wohnungen', 'flat'), 'ung', 'die'],
    [word('Gesundheit'), 'heit', 'die'],
    [noun('die', 'Freiheit', 'Freiheiten', 'freedom'), 'heit', 'die'],
    [noun('das', 'Mädchen', 'Mädchen', 'girl'), 'chen', 'das'],
    [word('Brötchen'), 'chen', 'das'],
    [word('Museum'), 'um', 'das'],
    [word('Tourismus'), 'ismus', 'der'],
    [word('Lehrerin'), 'in', 'die'],
  ];
  for (const [e, rule, article] of cases) {
    const t = genderTip(e);
    assert.ok(t, `${e.de}: no tip`);
    assert.equal(t!.rule.id, rule, `${e.de}: rule`);
    assert.equal(t!.article, article, `${e.de}: article`);
    assert.equal(t!.matches, true, `${e.de}: should obey the rule`);
  }
});

test('Mädchen is das although it is a girl: -chen beats natural gender', () => {
  const t = genderTip(noun('das', 'Mädchen', 'Mädchen', 'girl'))!;
  assert.equal(t.rule.id, 'chen');
  assert.equal(t.matches, true);
});

test('exceptions are flagged, not taught as the rule: der Name, das Ende', () => {
  const name = genderTip(noun('der', 'Name', 'Namen', 'name'))!;
  assert.equal(name.rule.id, 'e');
  assert.equal(name.article, 'die');
  assert.equal(name.matches, false);
  assert.match(genderTipText(name, noun('der', 'Name', 'Namen')).de, /^Ausnahme! .*-e → meistens die – aber der Name\.$/);

  const ende = genderTip(word('Ende'))!;
  assert.equal(ende.rule.id, 'e');
  assert.equal(ende.matches, false);
  assert.match(genderTipText(ende, word('Ende')).de, /Ausnahme!.*das Ende/);
  assert.match(genderTipText(ende, word('Ende')).en, /Exception!.*das Ende/);
});

test('der Käse, das Auge, das Interesse, das Messer, der Moment are exceptions', () => {
  for (const de of ['Käse', 'Auge', 'Interesse', 'Messer', 'Moment', 'Stadion', 'Abitur', 'Firma']) {
    const t = genderTip(word(de));
    assert.ok(t, `${de}: no tip`);
    assert.equal(t!.matches, false, `${de} should be flagged as an exception of ${t!.rule.id}`);
  }
});

test('compounds: the last word decides', () => {
  const t = genderTip(noun('die', 'Haustür', 'Haustüren', 'front door'));
  // "Tür" is not in the B1 list: the rule only fires for last parts it knows.
  assert.ok(t === null || t.rule.id === COMPOUND_RULE.id);

  const frist = genderTip(word('Kündigungsfrist'))!;
  assert.equal(frist.rule.id, COMPOUND_RULE.id);
  assert.equal(frist.head?.de, 'Frist');
  assert.equal(frist.matches, true);
  assert.equal(genderTipText(frist, word('Kündigungsfrist')).de, 'Das letzte Wort entscheidet: die Frist → die Kündigungsfrist');

  const zimmer = genderTip(word('Wohnzimmer'))!;
  assert.equal(zimmer.rule.id, COMPOUND_RULE.id);
  assert.equal(zimmer.head?.de, 'Zimmer');
  assert.equal(zimmer.article, 'das');

  // A known exception to the compound rule.
  const gegenteil = genderTip(word('Gegenteil'))!;
  assert.equal(gegenteil.rule.id, COMPOUND_RULE.id);
  assert.equal(gegenteil.matches, false);
});

test('a suffix word with a known last part keeps its suffix rule (Einrichtung is an -ung word)', () => {
  assert.equal(genderTip(word('Einrichtung'))!.rule.id, 'ung');
  assert.equal(genderTip(word('Hausordnung'))!.rule.id, 'ung');
});

test('false compounds are not split (Nachbar is not a Bar, Ausweis has no Eis)', () => {
  for (const de of ['Nachbar', 'Ausweis', 'Verkäufer', 'Moderator', 'Referat', 'Programm']) {
    assert.equal(compoundHead(word(de)), undefined, de);
  }
});

test('every compound head is a different, known noun and shares the article (except listed exceptions)', () => {
  const mismatches: string[] = [];
  for (const e of nouns) {
    const h = compoundHead(e);
    if (!h) continue;
    assert.notEqual(h.id, e.id);
    assert.ok(e.de.toLowerCase().endsWith(h.de.toLowerCase()), `${e.de} does not end in ${h.de}`);
    if (h.article !== e.article) mismatches.push(e.de);
  }
  assert.deepEqual(mismatches, ['Gegenteil']);
});

test('coverage: how many nouns each rule covers, and the exceptions it finds', () => {
  const cov = ruleCoverage();
  let covered = 0;
  const lines: string[] = [];
  for (const [id, c] of cov) {
    covered += c.matches.length + c.exceptions.length;
    if (c.matches.length + c.exceptions.length > 0) {
      lines.push(`${id}: ${c.matches.length}${c.exceptions.length ? ` (Ausnahmen: ${c.exceptions.map((e) => `${e.article} ${e.de}`).join(', ')})` : ''}`);
    }
  }
  // Printed so a reviewer can see what the rules do with the list.
  console.log(`Merktipps cover ${covered} of ${nouns.length} nouns\n  ${lines.join('\n  ')}`);
  assert.ok(covered >= nouns.length * 0.6, `rules cover only ${covered} of ${nouns.length} nouns`);
  assert.ok(cov.get('ung')!.matches.length >= 100);
  assert.equal(cov.get('ung')!.exceptions.length, 0);
});

test('"immer" rules have no exceptions in the list', () => {
  const cov = ruleCoverage();
  for (const rule of GENDER_RULES.filter((r) => r.reliability === 'immer')) {
    const exc = cov.get(rule.id)!.exceptions;
    assert.equal(exc.length, 0, `${rule.id} says "immer" but: ${exc.map((e) => `${e.article} ${e.de}`).join(', ')}`);
  }
});

test('"fast immer" and "meistens" rules hold for most of the words they cover', () => {
  const cov = ruleCoverage();
  for (const rule of GENDER_RULES) {
    const c = cov.get(rule.id)!;
    const n = c.matches.length + c.exceptions.length;
    if (n < 5) continue;
    const share = c.matches.length / n;
    const min = rule.reliability === 'meistens' ? 0.6 : 0.8;
    assert.ok(share >= min, `${rule.id}: only ${Math.round(share * 100)} % follow the rule`);
  }
  const comp = cov.get(COMPOUND_RULE.id)!;
  assert.ok(comp.matches.length / (comp.matches.length + comp.exceptions.length) > 0.95);
});

test('every rule has a bilingual tip with examples and a sensible label', () => {
  for (const rule of [...GENDER_RULES, COMPOUND_RULE]) {
    assert.ok(rule.tip.de.length > 20 && rule.tip.en.length > 20, rule.id);
    assert.ok(rule.label.de && rule.label.en, rule.id);
    if ('article' in rule) assert.ok(rule.tip.de.includes(`${rule.article} `), `${rule.id}: the German tip should show the article`);
  }
  assert.equal(new Set(GENDER_RULES.map((r) => r.id)).size, GENDER_RULES.length);
});

test('plural-only words are always die', () => {
  const t = genderTip(word('Eltern'))!;
  assert.equal(t.rule.id, 'nur-plural');
  assert.equal(t.matches, true);
});

test('people named by adjectives are not taught as -e exceptions', () => {
  const t = genderTip(word('Bekannte'))!;
  assert.equal(t.rule.id, 'adj-person');
  assert.match(genderTipText(t, word('Bekannte')).de, /der \(Mann\), die \(Frau\)/);
});

test('male persons in -e (der Kollege, der Kunde) are der by natural gender', () => {
  assert.equal(genderTip(word('Kollege'))!.rule.id, 'mann');
  assert.equal(genderTip(word('Kunde'))!.rule.id, 'mann');
  assert.equal(genderTip(word('Kunde'))!.matches, true);
});

test('non-nouns get no gender tip', () => {
  assert.equal(genderTip(word('besichtigen')), null);
});

/* ----------------------------------------------------------------- plural */

test('plural tips follow the stored plural', () => {
  assert.equal(pluralTip(word('Zeitung')), PLURAL_TIPS.ung);
  assert.equal(pluralTip(word('Museum')), PLURAL_TIPS.um);
  assert.equal(pluralTip(word('Brötchen')), PLURAL_TIPS.chen);
  assert.equal(pluralTip(word('Lehrerin')), PLURAL_TIPS.in);
  assert.equal(pluralTip(word('Ergebnis')), PLURAL_TIPS.nis);
  assert.equal(pluralTip(noun('das', 'Auto', 'Autos')), PLURAL_TIPS.vokalS);
  assert.equal(pluralTip(noun('das', 'Thema', 'Themen')), PLURAL_TIPS.ma);
  assert.equal(pluralTip(noun('der', 'Lehrer', 'Lehrer')), PLURAL_TIPS.erElEn);
  assert.equal(pluralTip(noun('der', 'Vater', 'Väter')), PLURAL_TIPS.erElEn);
  assert.equal(pluralTip(word('Großmutter')), PLURAL_TIPS.kompositum);
  // No plural, no tip; an irregular plural, no tip.
  assert.equal(pluralTip(word('Eltern')), null);
  assert.equal(pluralTip(word('Praktikum')), null);
});

test('every plural tip matches what is stored', () => {
  for (const e of nouns) {
    const p = pluralTip(e);
    if (!p) continue;
    const pl = e.plural!;
    const de = e.de;
    if (p === PLURAL_TIPS.ung || p === PLURAL_TIPS.heit) assert.equal(pl, de + 'en', de);
    if (p === PLURAL_TIPS.in) assert.equal(pl, de + 'nen', de);
    if (p === PLURAL_TIPS.chen) assert.equal(pl, de, de);
    if (p === PLURAL_TIPS.vokalS || p === PLURAL_TIPS.fremdS) assert.equal(pl, de + 's', de);
    if (p === PLURAL_TIPS.e) assert.equal(pl, de + 'n', de);
    if (p === PLURAL_TIPS.um) assert.ok(pl.endsWith('en') && de.endsWith('um'), de);
  }
});

test('umlaut puts the umlaut on the last a/o/u', () => {
  assert.equal(umlaut('Vater'), 'Väter');
  assert.equal(umlaut('Haus'), 'Häus');
  assert.equal(umlaut('Mietvertrag'), 'Mietverträg');
  assert.equal(umlaut('Boden'), 'Böden');
});

/* ------------------------------------------------------------------ verbs */

test('aufstehen: Perfekt with sein, separable ge-', () => {
  const v = verbTip(word('aufstehen'))!;
  assert.equal(v.aux, 'sein');
  assert.equal(v.partizip, 'aufgestanden');
  assert.equal(v.perfekt.kind, 'sein');
  assert.equal(v.ge?.kind, 'trennbar');
});

test('bestellen: haben, no ge- (inseparable be-)', () => {
  const v = verbTip(word('bestellen'))!;
  assert.equal(v.aux, 'haben');
  assert.equal(v.partizip, 'bestellt');
  assert.equal(v.ge?.kind, 'untrennbar');
  assert.match(v.ge!.text.de, /ohne ge-/);
});

test('-ieren verbs have no ge-; reflexive verbs take haben', () => {
  assert.equal(verbTip(word('studieren'))!.ge?.kind, 'ieren');
  const r = verbTip(word('sich freuen'))!;
  assert.equal(r.aux, 'haben');
  assert.equal(r.perfekt.kind, 'haben-reflexiv');
  assert.equal(verbTip(word('passieren'))!.perfekt.kind, 'sein-extra');
});

test('partizipRule tells prefixes apart', () => {
  assert.equal(partizipRule('verstehen', 'verstanden'), 'untrennbar');
  assert.equal(partizipRule('vergessen', 'vergessen'), 'untrennbar');
  assert.equal(partizipRule('gehören', 'gehört'), 'untrennbar');
  assert.equal(partizipRule('gehen', 'gegangen'), null);
  assert.equal(partizipRule('beten', 'gebetet'), null);
  assert.equal(partizipRule('beibringen', 'beigebracht'), 'trennbar');
  assert.equal(partizipRule('ausgeben', 'ausgegeben'), 'trennbar');
  assert.equal(partizipRule('kennenlernen', 'kennengelernt'), 'trennbar');
  assert.equal(partizipRule('umziehen', 'umgezogen'), 'trennbar');
  assert.equal(partizipRule('übersetzen', 'übersetzt'), 'untrennbar-2');
  assert.equal(partizipRule('übergeben', 'übergeben'), 'untrennbar-2');
  assert.equal(partizipRule('vorbereiten', 'vorbereitet'), 'trennbar-untrennbar');
  assert.equal(partizipRule('anprobieren', 'anprobiert'), 'ieren');
  assert.equal(partizipRule('machen', 'gemacht'), null);
});

test('every verb gets a Perfekt tip that agrees with its stored auxiliary', () => {
  for (const e of verbs) {
    const v = verbTip(e);
    assert.ok(v, `${e.de}: no tip from "${e.forms}"`);
    const stored = /, (hat|ist) /.exec(e.forms!)![1];
    assert.equal(v!.aux, stored === 'ist' ? 'sein' : 'haben', e.de);
    // A "no ge-" tip never fires on a Partizip that starts with an added ge-.
    if (v!.ge && ['untrennbar', 'untrennbar-2', 'ieren', 'trennbar-untrennbar'].includes(v!.ge.kind)) {
      const inf = e.de.replace(/^sich /, '').split(' ').pop()!;
      assert.ok(!v!.partizip.startsWith('ge') || inf.startsWith('ge'), `${e.de} → ${v!.partizip}`);
    }
    if (v!.ge?.kind === 'trennbar') assert.match(v!.partizip, /.ge/, `${e.de} → ${v!.partizip}`);
  }
});

test('merktipps() gathers the tips for a card', () => {
  const tips = merktipps(noun('die', 'Wohnung', 'Wohnungen', 'flat'));
  assert.deepEqual(tips.map((t) => t.kind), ['genus', 'plural']);
  const ende = merktipps(word('Ende'));
  assert.equal(ende[0].exception, true);
  const auf = merktipps(word('aufstehen'));
  assert.deepEqual(auf.map((t) => t.kind), ['perfekt', 'partizip']);
});

/* ------------------------------------------------------- drill and retries */

test('Artikel-Trainer: a wrong noun comes back three cards later, or at the end', () => {
  const q = ['a', 'b', 'c', 'd', 'e', 'f'];
  // Answered "b" (position 1) wrong: it is the third card after it.
  assert.deepEqual(requeue(q, 1, 'b', RETRY_GAP), ['a', 'b', 'c', 'd', 'b', 'e', 'f']);
  assert.deepEqual(requeue(q, 4, 'e', RETRY_GAP), ['a', 'b', 'c', 'd', 'e', 'f', 'e']);
  assert.deepEqual(requeue(['a'], 0, 'a', RETRY_GAP), ['a', 'a']);
});

test('Genus drill: a round has 10 nouns, about 20 % exceptions, all with a rule', () => {
  let seed = 7;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const round = pickRound({}, Date.now(), rand);
  assert.equal(round.length, ROUND_SIZE);
  assert.equal(new Set(round.map((e) => e.id)).size, ROUND_SIZE);
  const exc = round.filter((e) => !genderTip(e)!.matches);
  assert.equal(exc.length, EXCEPTIONS_PER_ROUND);
  for (const e of round) assert.notEqual(genderTip(e)!.rule.id, 'nur-plural');
  const { matches, exceptions } = drillPool();
  assert.ok(matches.length > 500 && exceptions.length >= 10, `${matches.length} / ${exceptions.length}`);
});

test('Genus drill: mistakes from earlier days come first', () => {
  const { matches } = drillPool();
  const missed = matches[40];
  const progress = { [genusKey(missed.id)]: { box: 1, due: 0, correct: 0, wrong: 1, lastSeen: 1, history: [{ at: 1, chosen: 0, ok: false }] } };
  const round = pickRound(progress, Date.now(), () => 0.5);
  assert.ok(round.some((e) => e.id === missed.id));
});

test('Genus drill: three right in a row, a mistake resets and comes back 2–4 cards later', () => {
  const ids = ['a', 'b', 'c', 'd', 'e', 'f'];
  let s = startDrill(ids);
  // "a" wrong: streak 0, back as the 2nd to 4th card from now.
  s = gradeDrill(s, false, () => 0);
  assert.equal(s.streak.a, 0);
  assert.equal(s.first.a, false);
  s = advanceDrill(s);
  assert.deepEqual(s.queue, ['b', 'a', 'c', 'd', 'e', 'f']);
  s = advanceDrill(gradeDrill(startDrill(ids), false, () => 0.99));
  assert.equal(s.queue.indexOf('a'), 3);

  // Right three times in a row: it sits and leaves the queue.
  s = startDrill(['a']);
  for (let i = 0; i < MASTERY; i++) {
    assert.equal(s.queue[0], 'a');
    s = advanceDrill(gradeDrill(s, true, () => 0));
  }
  assert.equal(s.queue.length, 0);
  assert.equal(s.answers, MASTERY);

  // A mistake in between resets the streak.
  s = startDrill(['a']);
  s = advanceDrill(gradeDrill(s, true));
  s = advanceDrill(gradeDrill(s, false));
  assert.equal(s.streak.a, 0);
  assert.equal(s.queue.length, 1);
  assert.equal(s.first.a, true);
});

test('Genus drill: only first answers and mistakes go into spaced repetition', () => {
  let s = startDrill(['a']);
  assert.equal(shouldRecord(s, 'a', true), true);
  s = advanceDrill(gradeDrill(s, true));
  assert.equal(shouldRecord(s, 'a', true), false);
  assert.equal(shouldRecord(s, 'a', false), true);
  s = advanceDrill(gradeDrill(s, false));
  assert.equal(shouldRecord(s, 'a', true), true);
});

test('a whole drill round ends with every noun mastered', () => {
  const round = pickRound({}, Date.now(), () => 0.3);
  let s = startDrill(round.map((e) => e.id));
  let steps = 0;
  while (s.queue.length > 0 && steps < 500) {
    // Every fourth answer is wrong.
    s = advanceDrill(gradeDrill(s, steps % 4 !== 3, () => 0.5));
    steps++;
  }
  assert.equal(s.queue.length, 0);
  for (const e of round) assert.ok(isMastered(s, e.id), e.de);
});
