import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  FOCUS_GATE,
  FOCUS_SNOOZE,
  feedbackKind,
  feedbackLine,
  formatSeconds,
  gateFocus,
  nfSummary,
  pct,
  shownWords,
  snoozeFocus,
  speechTarget,
} from '../src/sections/wortschatz/nfLogic.ts';
import { speechMatch } from '../src/lib/neuro.ts';

test('formatSeconds uses a decimal comma in German', () => {
  assert.equal(formatSeconds(6200, 'de'), '6,2 s');
  assert.equal(formatSeconds(6200, 'en'), '6.2 s');
  assert.equal(formatSeconds(-5, 'de'), '0,0 s');
});

test('feedbackKind: right answers', () => {
  assert.equal(feedbackKind(true, 'sure', false), 'sureRight');
  assert.equal(feedbackKind(true, 'unsure', false), 'unsureRight');
  assert.equal(feedbackKind(true, 'guess', false), 'guessRight');
  // A guess is named as a guess even when it was also slow.
  assert.equal(feedbackKind(true, 'guess', true), 'guessRight');
  assert.equal(feedbackKind(true, 'sure', true), 'slowRight');
  assert.equal(feedbackKind(true, undefined, true), 'slowRight');
  assert.equal(feedbackKind(true, undefined, false), 'right');
});

test('feedbackKind: wrong answers (slowness does not matter)', () => {
  assert.equal(feedbackKind(false, 'sure', false), 'sureWrong');
  assert.equal(feedbackKind(false, 'sure', true), 'sureWrong');
  assert.equal(feedbackKind(false, 'unsure', false), 'unsureWrong');
  assert.equal(feedbackKind(false, 'guess', false), 'guessWrong');
  assert.equal(feedbackKind(false, undefined, false), 'wrong');
});

test('feedbackLine texts and tones', () => {
  assert.equal(feedbackLine(true, 'sure', false, 1000).text.de, 'Sicher & richtig 👍');
  const slow = feedbackLine(true, 'unsure', true, 6200);
  assert.equal(slow.text.de, 'Richtig, aber langsam (6,2 s) – kommt morgen wieder');
  assert.equal(slow.text.en, 'Right, but slow (6.2 s) – it comes back tomorrow');
  assert.equal(slow.tone, 'neutral');
  assert.equal(feedbackLine(true, 'guess', false, 900).text.de, 'Richtig geraten – kommt morgen wieder');
  const hyper = feedbackLine(false, 'sure', false, 900);
  assert.equal(hyper.kind, 'sureWrong');
  assert.equal(hyper.tone, 'bad');
  assert.match(hyper.text.de, /^Sicher, aber falsch/);
  for (const ok of [true, false])
    for (const conf of ['sure', 'unsure', 'guess', undefined] as const)
      for (const slowFlag of [true, false]) {
        const l = feedbackLine(ok, conf, slowFlag, 2000);
        assert.ok(l.text.de.length > 0 && l.text.en.length > 0);
      }
});

test('nfSummary counts ratings, correct answers, median time and held items', () => {
  const s = nfSummary([
    { ok: true, conf: 'sure', ms: 1000, hold: false },
    { ok: false, conf: 'sure', ms: 3000, hold: false },
    { ok: true, conf: 'guess', ms: 2000, hold: true },
    { ok: true, conf: 'unsure', ms: 8000, hold: true },
    { ok: true, ms: 4000, hold: false },
  ]);
  assert.deepEqual(s.byConf, { sure: { n: 2, correct: 1 }, unsure: { n: 1, correct: 1 }, guess: { n: 1, correct: 1 } });
  assert.equal(s.unrated, 1);
  assert.equal(s.medianMs, 3000);
  assert.equal(s.held, 2);
  assert.equal(nfSummary([]).medianMs, null);
  assert.equal(pct(1, 2), 50);
  assert.equal(pct(0, 0), 0);
});

test('gateFocus shows a hint once per change to dip or long', () => {
  let g = FOCUS_GATE;
  let r = gateFocus(g, 'ok', 5);
  assert.equal(r.show, false);
  r = gateFocus(r.gate, 'dip', 12);
  assert.equal(r.show, true);
  g = r.gate;
  // Still dipping: no second hint.
  r = gateFocus(g, 'dip', 13);
  assert.equal(r.show, false);
  // Changes to long: a new hint.
  r = gateFocus(r.gate, 'long', 14);
  assert.equal(r.show, true);
  // Back to ok, then dip again: shown again.
  r = gateFocus(r.gate, 'ok', 15);
  r = gateFocus(r.gate, 'dip', 16);
  assert.equal(r.show, true);
});

test('gateFocus stays quiet for the snooze after "Weiter"', () => {
  let g = snoozeFocus(12);
  assert.equal(g.snoozeUntil, 12 + FOCUS_SNOOZE);
  for (let n = 13; n < 12 + FOCUS_SNOOZE; n++) {
    const r = gateFocus(g, 'dip', n);
    assert.equal(r.show, false, `answer ${n}`);
    g = r.gate;
  }
  // The signal is still there after the snooze: one more hint.
  const r = gateFocus(g, 'dip', 12 + FOCUS_SNOOZE);
  assert.equal(r.show, true);
});

test('speechTarget keeps the article and drops gap marks', () => {
  assert.equal(speechTarget('Bewerbung', 'die'), 'die Bewerbung');
  assert.equal(speechTarget('befristet'), 'befristet');
  assert.equal(speechTarget('Liebe … / Lieber …'), 'Liebe Lieber');
  assert.equal(speechTarget('Hast du Lust, … zu …?'), 'Hast du Lust, zu ?');
  assert.equal(speechMatch(speechTarget('Liebe … / Lieber …'), 'liebe lieber').score, 1);
  assert.equal(speechMatch(speechTarget('Bewerbung', 'die'), 'die Bewerbung').score, 1);
});

test('shownWords keeps the capitals of the expected words', () => {
  const target = speechTarget('Berufserfahrung', 'die');
  const m = speechMatch(target, 'die falsch');
  assert.deepEqual(shownWords(target, m.words), [
    { word: 'die', heard: true },
    { word: 'Berufserfahrung', heard: false },
  ]);
  const t2 = speechTarget('Könnten Sie das bitte wiederholen?');
  assert.deepEqual(
    shownWords(t2, speechMatch(t2, 'könnten sie das bitte wiederholen').words).map((w) => w.word),
    ['Könnten', 'Sie', 'das', 'bitte', 'wiederholen'],
  );
});
