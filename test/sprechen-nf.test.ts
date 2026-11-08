import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sprechenPhrases } from '../src/content/sprechen.ts';
import { speechMatch } from '../src/lib/neuro.ts';
import {
  MAX_QUICK_ENDS,
  MAX_SILENCE_MS,
  PACE_MAX,
  PACE_MIN,
  SUGGEST_GROUPS,
  dialogueScore,
  fillerTip,
  joinTranscript,
  nextQuickEnds,
  onSessionEnd,
  paceBand,
  percent,
  phraseVariants,
  phrasesUsed,
  repeatTimeoutMs,
  suggestPhrases,
} from '../src/sections/sprechen/nf.ts';

test('pace band: ruhig below 90, gut 90–130, schnell above 130', () => {
  assert.equal(PACE_MIN, 90);
  assert.equal(PACE_MAX, 130);
  assert.equal(paceBand(60, 50), 'ruhig');
  assert.equal(paceBand(89, 50), 'ruhig');
  assert.equal(paceBand(90, 50), 'gut');
  assert.equal(paceBand(130, 50), 'gut');
  assert.equal(paceBand(131, 50), 'schnell');
  assert.equal(paceBand(0, 0), null);
  assert.equal(paceBand(120, 0), null);
  assert.equal(paceBand(Number.NaN, 10), null);
});

test('filler tip only when fillers are frequent', () => {
  assert.equal(fillerTip(0, 100), null);
  assert.equal(fillerTip(2, 100), null);
  assert.ok(fillerTip(5, 100));
  assert.ok(fillerTip(2, 10));
});

test('every suggestion group exists in the Redemittel', () => {
  const ids = new Set(sprechenPhrases.map((g) => g.id));
  for (const part of [1, 2, 3] as const) for (const id of SUGGEST_GROUPS[part]) assert.ok(ids.has(id), `${part}: ${id}`);
});

test('phrase variants resolve "/" alternatives and cut at "…"', () => {
  const v = phraseVariants('Kannst du / Können Sie das bitte wiederholen?');
  assert.ok(v.includes('Kannst du das bitte wiederholen?'));
  assert.ok(v.includes('Können Sie das bitte wiederholen?'));
  const w = phraseVariants('Ein Vorteil / Nachteil ist, dass …');
  assert.ok(w.includes('Ein Vorteil ist, dass'));
  assert.ok(w.includes('Ein Nachteil ist, dass'));
  assert.deepEqual(phraseVariants('Meiner Meinung nach …'), ['Meiner Meinung nach']);
  for (const g of sprechenPhrases) for (const p of g.phrases) for (const x of phraseVariants(p.de)) assert.ok(!x.includes('/'), x);
});

test('phrases used are detected in a transcript, including "/" alternatives', () => {
  const groups = sprechenPhrases.filter((g) => SUGGEST_GROUPS[2].includes(g.id));
  const transcript =
    'äh also meiner meinung nach ist das gut aber da haben sie recht ein nachteil ist dass es teuer ist ich habe schlechte erfahrungen mit dem bus gemacht';
  const used = phrasesUsed(transcript, groups);
  assert.ok(used.includes('Meiner Meinung nach …'));
  assert.ok(used.includes('Da hast du / haben Sie recht.'));
  assert.ok(used.includes('Ein Vorteil / Nachteil ist, dass …'));
  assert.ok(used.includes('Ich habe gute / schlechte Erfahrungen mit … gemacht.'));
  assert.ok(!used.includes('Das sehe ich anders.'));
  assert.equal(new Set(used).size, used.length, 'no duplicates');
  assert.deepEqual(phrasesUsed('', groups), []);
});

test('suggestions: three unused phrases, taken in turn from the groups of the Teil', () => {
  for (const part of [1, 2, 3] as const) {
    const s = suggestPhrases(part, [], sprechenPhrases);
    assert.equal(s.length, 3);
    const allowed = new Set(
      sprechenPhrases.filter((g) => SUGGEST_GROUPS[part].includes(g.id)).flatMap((g) => g.phrases.map((p) => p.de)),
    );
    for (const x of s) assert.ok(allowed.has(x.phrase), `${part}: ${x.phrase}`);
  }
  // Teil 3: one from each of vorschlagen, annehmen, ablehnen.
  const t3 = suggestPhrases(3, [], sprechenPhrases);
  assert.deepEqual(
    t3.map((x) => x.group.de),
    ['Vorschläge machen', 'Vorschläge annehmen', 'Vorschläge ablehnen'],
  );
  // Used phrases are skipped.
  const used = [t3[0].phrase];
  assert.ok(!suggestPhrases(3, used, sprechenPhrases).some((x) => x.phrase === used[0]));
  // Teil 1 has two groups: the third suggestion comes from the first group again.
  const t1 = suggestPhrases(1, [], sprechenPhrases);
  assert.equal(t1[0].group.de, t1[2].group.de);
  // Nothing left to suggest.
  const everything = sprechenPhrases.flatMap((g) => g.phrases.map((p) => p.de));
  assert.deepEqual(suggestPhrases(2, everything, sprechenPhrases), []);
});

test('transcript pieces are joined with single spaces', () => {
  assert.equal(joinTranscript('ich finde', ' dass es gut ist '), 'ich finde dass es gut ist');
  assert.equal(joinTranscript('', 'hallo'), 'hallo');
  assert.equal(joinTranscript('hallo', ''), 'hallo');
  assert.equal(joinTranscript('', ''), '');
});

test('session end: restart until Stop, pause on fatal errors, stuck loops and long silence', () => {
  const base = { wanted: true, error: null, quickEnds: 0, silentMs: 1000 };
  assert.equal(onSessionEnd(base), 'restart');
  assert.equal(onSessionEnd({ ...base, error: 'no-speech' }), 'restart');
  assert.equal(onSessionEnd({ ...base, error: 'aborted' }), 'restart');
  assert.equal(onSessionEnd({ ...base, wanted: false }), 'finish');
  assert.equal(onSessionEnd({ ...base, wanted: false, error: 'not-allowed' }), 'finish');
  assert.equal(onSessionEnd({ ...base, error: 'not-allowed' }), 'pause');
  assert.equal(onSessionEnd({ ...base, error: 'network' }), 'pause');
  assert.equal(onSessionEnd({ ...base, quickEnds: MAX_QUICK_ENDS }), 'pause');
  assert.equal(onSessionEnd({ ...base, silentMs: MAX_SILENCE_MS }), 'pause');
});

test('quick ends count up only for short sessions without text', () => {
  assert.equal(nextQuickEnds(0, 200, false), 1);
  assert.equal(nextQuickEnds(2, 200, false), 3);
  assert.equal(nextQuickEnds(2, 200, true), 0);
  assert.equal(nextQuickEnds(2, 5000, false), 0);
});

test('dialogue score is weighted by words; percent is clamped', () => {
  const a = speechMatch('Ich komme aus Spanien', 'ich komme aus spanien'); // 4/4
  const b = speechMatch('Seit zwei Jahren', 'seit jahren'); // 2/3
  assert.equal(dialogueScore([a, b, undefined]), 6 / 7);
  assert.equal(dialogueScore([]), 0);
  assert.equal(percent(6 / 7), 86);
  assert.equal(percent(1.4), 100);
  assert.equal(percent(-1), 0);
});

test('listening time grows with the length of the line', () => {
  assert.ok(repeatTimeoutMs('Ja.') < repeatTimeoutMs('Ich komme aus der Türkei, aus Izmir. Das liegt am Meer.'));
  assert.ok(repeatTimeoutMs('Ja.') >= 6000);
});
