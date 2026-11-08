import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  allAttempts,
  calibration,
  focusState,
  isSlow,
  median,
  pastTimes,
  shouldHold,
  slowThreshold,
  speechMatch,
  speechStats,
  type FocusSample,
} from '../src/lib/neuro.ts';
import { grade } from '../src/lib/srs.ts';
import { getStore, recordItem, resetProgress, setStore } from '../src/lib/storage.ts';
import { setAnalyticsSink, track, type EventProps } from '../src/lib/analytics.ts';
import { MAX_FOCUS, noteFocusHint, noteSpeech, readFeedbackLog } from '../src/lib/neuroLog.ts';
import {
  confidentErrorItems,
  focusSummary,
  itemTarget,
  speechSummary,
  tempoByKind,
  timedKindOf,
} from '../src/sections/feedback/stats.ts';
import type { Attempt, Confidence, ItemProgress } from '../src/types.ts';

const NOW = 1_700_000_000_000;
const DAY = 24 * 60 * 60 * 1000;

const setFlag = (on: boolean) => setStore((s) => ({ ...s, flags: { ...s.flags, neurofeedback: on } }));

const item = (history: Attempt[]): ItemProgress => ({ box: 1, due: 0, correct: 0, wrong: 0, lastSeen: 0, history });

// ---------------------------------------------------------------- speed

test('slow threshold uses fixed floors until the learner has 8 timings', () => {
  assert.equal(slowThreshold('card', []), 6000);
  assert.equal(slowThreshold('article', [1000, 1000]), 3500);
  assert.equal(slowThreshold('choice', new Array(7).fill(5000)), 20000);
});

test('slow threshold follows the personal median, but not below a third of the floor', () => {
  assert.equal(slowThreshold('card', new Array(8).fill(2000)), 3600);
  assert.equal(slowThreshold('card', [1000, 1000, 1000, 1000, 3000, 3000, 3000, 3000]), 2000 * 1.8);
  // Very fast learner: 1.8 × 500 = 900 would be too strict, the floor of 6000 / 3 applies.
  assert.equal(slowThreshold('card', new Array(10).fill(500)), 2000);
  assert.equal(isSlow(3700, 'card', new Array(8).fill(2000)), true);
  assert.equal(isSlow(3500, 'card', new Array(8).fill(2000)), false);
});

test('median and past times', () => {
  assert.ok(Number.isNaN(median([])));
  assert.equal(median([3, 1, 2]), 2);
  assert.equal(median([4, 1, 2, 3]), 2.5);
  const progress = {
    'vocab:a': item([
      { at: 3, chosen: -1, ok: true, ms: 1000 },
      { at: 2, chosen: -1, ok: false, ms: 9000 },
      { at: 1, chosen: -1, ok: true },
    ]),
    'vocab-art:a': item([{ at: 4, chosen: 0, ok: true, ms: 500 }]),
    'sb1:x:1': item([{ at: 5, chosen: 0, ok: true, ms: 7000 }]),
  };
  assert.deepEqual(pastTimes(progress, 'vocab:'), [1000], 'only correct, timed answers of that prefix');
  assert.deepEqual(pastTimes(progress, ''), [7000, 500, 1000], 'newest first');
});

test('a correct answer is held when guessed or slow, never when wrong', () => {
  assert.equal(shouldHold(true, 'guess', false), true);
  assert.equal(shouldHold(true, 'sure', true), true);
  assert.equal(shouldHold(true, undefined, true), true);
  assert.equal(shouldHold(true, 'sure', false), false);
  assert.equal(shouldHold(true, 'unsure', false), false);
  assert.equal(shouldHold(false, 'guess', true), false);
});

test('grade: a held correct answer keeps its box and comes back tomorrow', () => {
  const prev: ItemProgress = { box: 3, due: NOW, correct: 3, wrong: 0, lastSeen: NOW - DAY, history: [] };
  const held = grade(prev, true, NOW, -1, { hold: true, conf: 'guess', ms: 1234.4 });
  assert.equal(held.box, 3);
  assert.equal(held.due, NOW + DAY);
  assert.equal(held.correct, 4);
  assert.deepEqual(held.history[0], { at: NOW, chosen: -1, ok: true, conf: 'guess', ms: 1234 });
  const promoted = grade(prev, true, NOW);
  assert.equal(promoted.box, 4);
  assert.equal(promoted.due, NOW + 7 * DAY);
  assert.equal(grade(undefined, true, NOW, -1, { hold: true }).box, 1, 'an unseen item held still enters box 1');
});

// ---------------------------------------------------------------- calibration

const rated = (conf: Confidence, ok: boolean, n: number): Attempt[] =>
  Array.from({ length: n }, (_, i) => ({ at: i, chosen: 0, ok, conf }));

test('calibration needs 10 rated answers', () => {
  const c = calibration([...rated('sure', true, 9), { at: 0, chosen: 0, ok: true }]);
  assert.equal(c.score, null);
  assert.equal(c.byConf.sure.n, 9);
  assert.equal(calibration([]).score, null);
});

test('calibration counts per rating, confident errors and lucky guesses', () => {
  const c = calibration([...rated('sure', true, 6), ...rated('sure', false, 2), ...rated('unsure', true, 1), ...rated('guess', true, 3), ...rated('guess', false, 1)]);
  assert.deepEqual(c.byConf, { sure: { n: 8, correct: 6 }, unsure: { n: 1, correct: 1 }, guess: { n: 4, correct: 3 } });
  assert.equal(c.confidentErrors, 2);
  assert.equal(c.luckyGuesses, 3);
  assert.ok(c.score !== null && c.score > 0 && c.score < 100);
});

test('calibration score (Brier) stays within 0–100 and rewards matching confidence', () => {
  const perfect = calibration(rated('sure', true, 20)).score!;
  const worst = calibration(rated('sure', false, 20)).score!;
  assert.equal(perfect, 100);
  assert.equal(worst, 10); // 1 − 0.95² ≈ 0.0975
  const honest = calibration([...rated('sure', true, 10), ...rated('guess', false, 10)]).score!;
  const overconfident = calibration([...rated('sure', true, 10), ...rated('sure', false, 10)]).score!;
  assert.ok(honest > overconfident);
  // Random mixes never leave the bounds.
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let run = 0; run < 50; run++) {
    const attempts: Attempt[] = Array.from({ length: 10 + Math.floor(rnd() * 40) }, (_, i) => ({
      at: i,
      chosen: 0,
      ok: rnd() < 0.5,
      conf: (['sure', 'unsure', 'guess'] as const)[Math.floor(rnd() * 3)],
    }));
    const s = calibration(attempts).score!;
    assert.ok(s >= 0 && s <= 100 && Number.isInteger(s), `score ${s}`);
  }
});

test('calibration ignores unknown ratings from a damaged save', () => {
  const damaged = [...rated('sure', true, 10), { at: 0, chosen: 0, ok: false, conf: 'constructor' as Confidence }];
  const c = calibration(damaged);
  assert.equal(c.score, 100);
  assert.equal(c.byConf.sure.n, 10);
});

test('allAttempts collects histories, optionally by prefix', () => {
  const progress = { 'vocab:a': item(rated('sure', true, 2)), 'sb1:x:1': item(rated('guess', false, 3)) };
  assert.equal(allAttempts(progress).length, 5);
  assert.equal(allAttempts(progress, 'sb1:').length, 3);
});

// ---------------------------------------------------------------- focus

const samples = (spec: [boolean, number][]): FocusSample[] => spec.map(([ok, ms]) => ({ ok, ms }));
const steady = (n: number, ms = 2000): [boolean, number][] => Array.from({ length: n }, () => [true, ms]);

test('focus: no signal before baseline and window are complete', () => {
  assert.equal(focusState([], 0).signal, 'ok');
  const s = focusState(samples([...steady(6), [false, 9000], [false, 9000]]), 60_000);
  assert.equal(s.signal, 'ok');
  assert.equal(s.baselineAccuracy, 1);
  assert.equal(s.baselineMs, 2000);
  assert.equal(s.recentAccuracy, null);
});

test('focus: a dip by accuracy', () => {
  const s = focusState(samples([...steady(6), [true, 2000], [false, 2000], [false, 2000], [true, 2000], [false, 2000], [false, 2000]]), 5 * 60_000);
  assert.equal(s.signal, 'dip');
  assert.equal(s.recentAccuracy, 2 / 6);
  // A small drop (one wrong of six) is no dip.
  const small = focusState(samples([...steady(6), ...steady(5), [false, 2000]]), 5 * 60_000);
  assert.equal(small.signal, 'ok');
});

test('focus: a dip by slowness', () => {
  assert.equal(focusState(samples([...steady(6, 2000), ...steady(6, 4000)]), 60_000).signal, 'dip');
  assert.equal(focusState(samples([...steady(6, 2000), ...steady(6, 3500)]), 60_000).signal, 'ok');
});

test('focus: a long session after 25 minutes, a dip takes precedence', () => {
  assert.equal(focusState(samples(steady(20)), 25 * 60_000).signal, 'long');
  assert.equal(focusState(samples(steady(3)), 24 * 60_000).signal, 'ok');
  assert.equal(focusState([], 30 * 60_000).signal, 'long');
  assert.equal(focusState(samples([...steady(6, 2000), ...steady(6, 5000)]), 30 * 60_000).signal, 'dip');
});

// ---------------------------------------------------------------- speech

test('speechMatch: exact, ignoring case and punctuation', () => {
  const m = speechMatch('Ich möchte einen Termin vereinbaren.', 'ich möchte einen termin vereinbaren');
  assert.equal(m.score, 1);
  assert.ok(m.words.every((w) => w.heard));
  assert.equal(speechMatch('', 'egal').score, 0);
});

test('speechMatch: partial and extra words', () => {
  const m = speechMatch('Ich möchte einen Termin vereinbaren', 'äh ich möchte bitte Termin');
  assert.equal(m.score, 3 / 5);
  assert.deepEqual(
    m.words.map((w) => w.heard),
    [true, true, false, true, false],
  );
  assert.equal(speechMatch('Guten Tag', '').score, 0);
});

test('speechMatch: word order matters', () => {
  const inOrder = speechMatch('heute gehe ich ins Kino', 'heute gehe ich ins kino').score;
  const reversed = speechMatch('heute gehe ich ins Kino', 'kino ins ich gehe heute').score;
  assert.equal(inOrder, 1);
  assert.equal(reversed, 1 / 5);
});

test('speechMatch: umlauts count, in either Unicode form', () => {
  assert.equal(speechMatch('schön', 'schon').score, 0, 'schön ≠ schon');
  assert.equal(speechMatch('Brötchen', 'Brotchen').score, 1, 'one slip in a long word is tolerated');
  const decomposed = 'Grüße'.normalize('NFD');
  assert.equal(speechMatch('Grüße', decomposed).score, 1);
  assert.equal(speechMatch('Öffnungszeiten', 'öffnungszeiten').score, 1);
});

test('speechMatch: small slips only in longer words', () => {
  assert.equal(speechMatch('vereinbaren', 'vereinbahren').score, 1);
  assert.equal(speechMatch('der', 'die').score, 0);
  assert.equal(speechMatch('Wohnung', 'Wohnungen').score, 0, 'two letters off is a different word');
});

test('speechStats: words per minute, fillers and phrases used', () => {
  const s = speechStats('Äh, meiner Meinung nach ist das, ähm, also eine gute Idee. Ich finde, dass wir hm gehen sollten.', 30_000, [
    'Meiner Meinung nach ...',
    'Ich finde, dass …',
    'Ich bin dagegen, weil ...',
  ]);
  assert.equal(s.fillers, 4);
  assert.deepEqual(s.phrasesUsed, ['Meiner Meinung nach ...', 'Ich finde, dass …']);
  assert.equal(s.words, 18);
  assert.equal(s.wordsPerMinute, 36);
  assert.equal(speechStats('', 0).wordsPerMinute, 0);
  assert.deepEqual(speechStats('ich meine nichts', 1000, ['Meiner Meinung nach']).phrasesUsed, []);
});

// ---------------------------------------------------------------- storage

test('recordItem ignores the neurofeedback signals while the flag is off', () => {
  resetProgress();
  setFlag(false);
  recordItem('vocab:x', true, -1, NOW, { conf: 'guess', ms: 4000, hold: true });
  const p = getStore().progress['vocab:x'];
  assert.equal(p.box, 1);
  assert.equal(p.due, NOW + DAY);
  assert.deepEqual(p.history[0], { at: NOW, chosen: -1, ok: true });
  recordItem('vocab:x', true, -1, NOW + DAY, { hold: true });
  assert.equal(getStore().progress['vocab:x'].box, 2, 'hold ignored: promoted');
});

test('recordItem honours conf, ms and hold while the flag is on', () => {
  resetProgress();
  setFlag(true);
  recordItem('vocab:y', true, -1, NOW, { conf: 'sure', ms: 1500 });
  recordItem('vocab:y', true, -1, NOW + DAY, { conf: 'guess', ms: 2500, hold: true });
  const p = getStore().progress['vocab:y'];
  assert.equal(p.box, 1, 'held in box 1');
  assert.equal(p.due, NOW + 2 * DAY);
  assert.equal(p.history[0].conf, 'guess');
  assert.equal(p.history[0].ms, 2500);
  assert.equal(p.history[1].conf, 'sure');
  setFlag(false);
});

test('analytics tags events with nf only while the flag is on', () => {
  const seen: (EventProps | undefined)[] = [];
  setAnalyticsSink({ track: (_n, props) => seen.push(props), error: () => {} });
  setFlag(false);
  track('x.y', { a: 1 });
  track('x.z');
  setFlag(true);
  track('x.y', { a: 1 });
  track('x.z');
  setFlag(false);
  setAnalyticsSink(null);
  assert.deepEqual(seen, [{ a: 1 }, undefined, { a: 1, nf: true }, { nf: true }]);
});

// ---------------------------------------------------------------- neuroLog

test('neuroLog appends focus hints and speech scores, capped', () => {
  resetProgress();
  for (let i = 0; i < MAX_FOCUS + 5; i++) noteFocusHint(i % 2 ? 'dip' : 'long', NOW + i);
  noteSpeech(0.8, NOW);
  noteSpeech(65, NOW + 1);
  noteSpeech(Number.NaN, NOW + 2);
  const log = readFeedbackLog(getStore().sections.feedback);
  assert.equal(log.focus.length, MAX_FOCUS);
  assert.equal(log.focus[0].at, NOW + 5, 'oldest dropped');
  assert.deepEqual(log.speech, [{ at: NOW, score: 0.8 }, { at: NOW + 1, score: 0.65 }]);
  assert.deepEqual(readFeedbackLog('junk'), { focus: [], speech: [] });
  assert.deepEqual(readFeedbackLog({ focus: [{ at: 1, kind: 'nope' }, null], speech: 'x' }), { focus: [], speech: [] });
});

// ---------------------------------------------------------------- feedback screen figures

test('feedback: kinds, targets and confident errors', () => {
  assert.equal(timedKindOf('vocab:wohnen-001'), 'card');
  assert.equal(timedKindOf('vocab-art:wohnen-001'), 'article');
  assert.equal(timedKindOf('lesen1:lesen1-02:3'), 'choice');
  assert.deepEqual(itemTarget('vocab:wohnen-014'), { vocabId: 'wohnen-014', route: 'wortschatz/thema/wohnen' });
  assert.deepEqual(itemTarget('vocab-art:arbeit-002'), { vocabId: 'arbeit-002', route: 'wortschatz/thema/arbeit' });
  assert.deepEqual(itemTarget('sb2:sb2-03:4'), { part: 'sb2', route: 'sprachbausteine/teil2/sb2-03' });
  assert.deepEqual(itemTarget('hoeren3:h3-01:2'), { part: 'hoeren3', route: 'hoeren/teil3/h3-01' });
  assert.deepEqual(itemTarget('lesen1:l1-01:1'), { part: 'lesen1', route: 'lesen/teil1/l1-01' });
  assert.deepEqual(itemTarget('weird'), { route: '' });

  const progress = {
    'vocab:a-001': item([{ at: 5, chosen: -1, ok: false, conf: 'sure' }, { at: 2, chosen: -1, ok: false, conf: 'sure' }]),
    'sb1:s:1': item([{ at: 9, chosen: 0, ok: false, conf: 'sure' }]),
    'sb1:s:2': item([{ at: 9, chosen: 0, ok: false, conf: 'unsure' }, { at: 8, chosen: 0, ok: true, conf: 'sure' }]),
  };
  assert.deepEqual(confidentErrorItems(progress), [
    { id: 'sb1:s:1', at: 9, count: 1 },
    { id: 'vocab:a-001', at: 5, count: 2 },
  ]);
  assert.equal(confidentErrorItems(progress, 1).length, 1);
});

test('feedback: tempo per kind, last 7 days vs the 7 before', () => {
  const progress = {
    'vocab:a': item([
      { at: NOW - DAY, chosen: -1, ok: true, ms: 2000 },
      { at: NOW - 2 * DAY, chosen: -1, ok: true, ms: 3000 },
      { at: NOW - 2 * DAY, chosen: -1, ok: false, ms: 9000 },
      { at: NOW - 8 * DAY, chosen: -1, ok: true, ms: 4000 },
      { at: NOW - 20 * DAY, chosen: -1, ok: true, ms: 9999 },
    ]),
    'vocab-art:a': item([{ at: NOW - 3 * DAY, chosen: 0, ok: true }]),
  };
  const [card, article, choice] = tempoByKind(progress, NOW);
  assert.deepEqual(card, { kind: 'card', recent: 2500, before: 4000, nRecent: 2, nBefore: 1 });
  assert.deepEqual(article, { kind: 'article', recent: null, before: null, nRecent: 0, nBefore: 0 });
  assert.equal(choice.kind, 'choice');
});

test('feedback: focus hints per day and speech trend', () => {
  const log = {
    focus: [
      { at: NOW, kind: 'dip' as const },
      { at: NOW - DAY, kind: 'long' as const },
      { at: NOW - DAY, kind: 'dip' as const },
      { at: NOW - 30 * DAY, kind: 'dip' as const },
    ],
    speech: [
      ...Array.from({ length: 10 }, (_, i) => ({ at: NOW - 100 + i, score: 0.5 })),
      ...Array.from({ length: 10 }, (_, i) => ({ at: NOW + i, score: 0.8 })),
    ],
  };
  const f = focusSummary(log, NOW, 14);
  assert.equal(f.dip, 2);
  assert.equal(f.long, 1);
  assert.equal(f.byDay.length, 14);
  assert.equal(f.byDay[13], 1);
  assert.equal(f.byDay[12], 2);
  const s = speechSummary(log, 10);
  assert.ok(Math.abs(s.recent! - 0.8) < 1e-9);
  assert.ok(Math.abs(s.before! - 0.5) < 1e-9);
  assert.equal(s.n, 20);
  assert.deepEqual(speechSummary({ focus: [], speech: [] }), { recent: null, before: null, n: 0 });
});
