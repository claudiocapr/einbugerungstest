import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  calibrationKind,
  calibrationVerdict,
  confFor,
  formatDuration,
  itemExtra,
  nfSummary,
  paceText,
  paceVerdict,
  sureWrongItems,
  type NfItem,
} from '../src/sections/lesen/nf.ts';
import { LESEN_PARTS } from '../src/sections/lesen/parts.ts';
import { SB_PARTS } from '../src/sections/sprachbausteine/parts.ts';
import { emptyProgress, grade } from '../src/lib/srs.ts';

test('confFor: answered items are sure unless marked, open items have no rating', () => {
  assert.equal(confFor(true, false), 'sure');
  assert.equal(confFor(true, true), 'guess');
  assert.equal(confFor(false, false), undefined);
  assert.equal(confFor(false, true), undefined);
});

test('itemExtra: a correct guess is held, a sure answer is not, open items send nothing', () => {
  assert.deepEqual(itemExtra(true, 'guess'), { conf: 'guess', hold: true });
  assert.deepEqual(itemExtra(false, 'guess'), { conf: 'guess', hold: false });
  assert.deepEqual(itemExtra(true, 'sure'), { conf: 'sure', hold: false });
  assert.deepEqual(itemExtra(false, 'sure'), { conf: 'sure', hold: false });
  assert.equal(itemExtra(false, undefined), undefined);
});

test('itemExtra feeds grade(): a correct guess keeps its box, a sure correct answer moves up', () => {
  const prev = { ...emptyProgress(), box: 2 };
  assert.equal(grade(prev, true, 1000, 0, itemExtra(true, 'guess')).box, 2);
  assert.equal(grade(prev, true, 1000, 0, itemExtra(true, 'sure')).box, 3);
  assert.equal(grade(prev, true, 1000, 0, itemExtra(true, 'guess')).history[0]?.conf, 'guess');
});

const set: NfItem[] = [
  { ok: true, conf: 'sure' },
  { ok: true, conf: 'sure' },
  { ok: false, conf: 'sure' },
  { ok: true, conf: 'guess' },
  { ok: false, conf: 'guess' },
  { ok: false, conf: 'guess' },
  { ok: false }, // left open
];

test('nfSummary counts the four combinations and open items', () => {
  assert.deepEqual(nfSummary(set), { sureRight: 2, sureWrong: 1, guessRight: 1, guessWrong: 2, unrated: 1 });
  assert.deepEqual(nfSummary([]), { sureRight: 0, sureWrong: 0, guessRight: 0, guessWrong: 0, unrated: 0 });
});

test('sureWrongItems lists only wrong answers given with confidence, in order', () => {
  assert.deepEqual(sureWrongItems(set), [2]);
  assert.deepEqual(sureWrongItems([{ ok: false, conf: 'sure' }, { ok: true }, { ok: false, conf: 'sure' }]), [0, 2]);
});

test('calibrationKind', () => {
  const s = (sureRight: number, sureWrong: number, guessRight: number, guessWrong: number) =>
    ({ sureRight, sureWrong, guessRight, guessWrong, unrated: 0 });
  assert.equal(calibrationKind(s(0, 0, 0, 0)), 'none');
  assert.equal(calibrationKind(s(4, 0, 0, 1)), 'calibrated');
  assert.equal(calibrationKind(s(3, 2, 1, 0)), 'overconfident');
  assert.equal(calibrationKind(s(3, 0, 2, 0)), 'underconfident');
  assert.equal(calibrationKind(s(3, 1, 1, 0)), 'mixed');
});

test('calibrationVerdict is bilingual and names the counts', () => {
  const v = calibrationVerdict({ sureRight: 1, sureWrong: 3, guessRight: 0, guessWrong: 0, unrated: 0 });
  assert.match(v.de, /3×/);
  assert.match(v.en, /3×/);
  for (const kind of [
    { sureRight: 0, sureWrong: 0, guessRight: 0, guessWrong: 0, unrated: 3 },
    { sureRight: 2, sureWrong: 0, guessRight: 0, guessWrong: 0, unrated: 0 },
    { sureRight: 0, sureWrong: 0, guessRight: 2, guessWrong: 0, unrated: 0 },
    { sureRight: 0, sureWrong: 1, guessRight: 1, guessWrong: 0, unrated: 0 },
  ]) {
    const t = calibrationVerdict(kind);
    assert.ok(t.de.length > 10 && t.en.length > 10);
  }
});

test('paceVerdict: faster, on pace (±10 %), slower, unclear', () => {
  const min = 60_000;
  assert.equal(paceVerdict(10 * min, 15).kind, 'faster');
  assert.equal(paceVerdict(14 * min, 15).kind, 'onPace');
  assert.equal(paceVerdict(16 * min, 15).kind, 'onPace');
  assert.equal(paceVerdict(17 * min, 15).kind, 'slower');
  assert.equal(paceVerdict(20 * min, 20).ratio, 1);
  assert.equal(paceVerdict(0, 15).kind, 'unclear');
  assert.equal(paceVerdict(Number.NaN, 15).kind, 'unclear');
  assert.equal(paceVerdict(10 * min, 0).kind, 'unclear');
  // A draft left open overnight is no real time.
  assert.equal(paceVerdict(8 * 60 * min, 20).kind, 'unclear');
});

test('formatDuration and paceText', () => {
  assert.equal(formatDuration(0), '0:00');
  assert.equal(formatDuration(754_000), '12:34');
  assert.equal(formatDuration(3_754_000), '1:02:34');
  assert.equal(paceText(12 * 60_000, 15, 'de'), 'Ihre Zeit 12:00 · Prüfungstempo 15:00 – schneller als Prüfungstempo.');
  assert.equal(paceText(25 * 60_000, 20, 'de'), 'Ihre Zeit 25:00 · Prüfungstempo 20:00 – langsamer als Prüfungstempo.');
  assert.match(paceText(20 * 60_000, 20, 'en'), /on exam pace/);
  assert.match(paceText(-1, 20, 'de'), /nicht aussagekräftig/);
});

test('the telc pace per part comes from the parts files: Lesen 15/20/20, Sprachbausteine 15/15', () => {
  assert.deepEqual(LESEN_PARTS.map((p) => p.minutes), [15, 20, 20]);
  assert.deepEqual(SB_PARTS.map((p) => p.minutes), [15, 15]);
});
