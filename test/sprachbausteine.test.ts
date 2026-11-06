import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sb1, sb2 } from '../src/content/sprachbausteine.ts';
import { TOPICS } from '../src/content/topics.ts';
import type { Text2 } from '../src/types.ts';
import { MAX_POINTS, placeWord, sb1Keys, sb2Keys, scoreSb1, scoreSb2, splitGaps } from '../src/sections/sprachbausteine/score.ts';

const topicIds = new Set(TOPICS.map((t) => t.id));

function assertExplained(e: Text2, where: string) {
  assert.ok(e && e.de.trim().length > 5, `${where}: German explanation missing`);
  assert.ok(e.en.trim().length > 5, `${where}: English explanation missing`);
}

/** Every [n] marker in the text, in order. */
const markers = (text: string) => [...text.matchAll(/\[(\d+)\]/g)].map((m) => Number(m[1]));

function assertMarkers(text: string, id: string) {
  const found = markers(text);
  assert.deepEqual(found, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], `${id}: gaps [1]–[10] each once, in order`);
}

/* ------------------------------------------------------------ content */

test('there are at least 20 sets per Sprachbausteine part, with unique ids and known topics', () => {
  assert.ok(sb1.length >= 20, 'sb1');
  assert.ok(sb2.length >= 20, 'sb2');
  const ids = [...sb1, ...sb2].map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length, 'set ids are unique');
  for (const s of [...sb1, ...sb2]) assert.ok(topicIds.has(s.topic), `${s.id}: topic ${s.topic}`);
  for (const s of sb1) assert.match(s.id, /^sb1-\d\d$/);
  for (const s of sb2) assert.match(s.id, /^sb2-\d\d$/);
  assert.equal(new Set(sb1.map((s) => s.topic)).size, TOPICS.length, 'Teil 1 covers every topic');
  assert.equal(new Set(sb2.map((s) => s.topic)).size, TOPICS.length, 'Teil 2 covers every topic');
});

test('Teil 1: 10 gaps with 3 distinct options, a grammar point and explanations', () => {
  for (const s of sb1) {
    assertMarkers(s.text, s.id);
    assert.equal(s.gaps.length, 10, `${s.id}: gaps`);
    s.gaps.forEach((g, i) => {
      const where = `${s.id}/${i + 1}`;
      assert.equal(g.options.length, 3, `${where}: options`);
      assert.equal(new Set(g.options).size, 3, `${where}: options are distinct`);
      for (const o of g.options) assert.ok(o.trim().length > 0, `${where}: empty option`);
      assert.ok([0, 1, 2].includes(g.answer), `${where}: answer`);
      assert.ok(g.point.trim().length > 3, `${where}: grammar point`);
      assertExplained(g.explanation, where);
    });
    assert.ok(new Set(s.gaps.map((g) => g.answer)).size >= 2, `${s.id}: answers are spread over a/b/c`);
  }
});

test('Teil 2: 15 distinct words, 10 gaps with distinct answers, 5 distractors left', () => {
  for (const s of sb2) {
    assertMarkers(s.text, s.id);
    assert.equal(s.words.length, 15, `${s.id}: words`);
    assert.equal(new Set(s.words).size, 15, `${s.id}: words are distinct`);
    for (const w of s.words) assert.ok(w.trim().length > 0, `${s.id}: empty word`);
    assert.equal(s.gaps.length, 10, `${s.id}: gaps`);
    const answers = s.gaps.map((g) => g.answer);
    assert.equal(new Set(answers).size, 10, `${s.id}: each word used at most once`);
    for (const a of answers) assert.ok(Number.isInteger(a) && a >= 0 && a < 15, `${s.id}: answer in a–o`);
    s.gaps.forEach((g, i) => assertExplained(g.explanation, `${s.id}/${i + 1}`));
  }
});

/* ------------------------------------------------------------ scoring */

test('Sprachbausteine give 1.5 points per gap (15 per part)', () => {
  const s1 = sb1[0];
  assert.equal(scoreSb1(s1, sb1Keys(s1)).points, MAX_POINTS.sb1);
  const sevenRight = sb1Keys(s1).map((k, i) => (i < 7 ? k : null));
  const r1 = scoreSb1(s1, sevenRight);
  assert.equal(r1.points, 10.5);
  assert.equal(r1.unanswered, 3);
  assert.equal(r1.passed, true);

  const s2 = sb2[0];
  assert.equal(scoreSb2(s2, sb2Keys(s2)).points, 15);
  const fiveRight = sb2Keys(s2).map((k, i) => (i < 5 ? k : (k + 1) % 15));
  const r2 = scoreSb2(s2, fiveRight);
  assert.equal(r2.points, 7.5);
  assert.equal(r2.passed, false);
});

test('splitGaps returns text pieces and gap numbers in order', () => {
  assert.deepEqual(splitGaps('Hallo [1] Welt [2].'), [
    { kind: 'text', text: 'Hallo ' },
    { kind: 'gap', n: 1 },
    { kind: 'text', text: ' Welt ' },
    { kind: 'gap', n: 2 },
    { kind: 'text', text: '.' },
  ]);
  assert.deepEqual(splitGaps('[10]'), [{ kind: 'gap', n: 10 }]);
  assert.deepEqual(splitGaps('kein Marker [a]'), [{ kind: 'text', text: 'kein Marker [a]' }]);
  for (const s of [...sb1, ...sb2]) {
    const gaps = splitGaps(s.text).filter((p) => p.kind === 'gap');
    assert.equal(gaps.length, 10, s.id);
  }
});

test('placeWord moves a word that is already in another gap', () => {
  assert.deepEqual(placeWord([4, null, null], 2, 4), [null, null, 4]);
  assert.deepEqual(placeWord([4, 7, null], 1, null), [4, null, null]);
  assert.deepEqual(placeWord([null, null], 0, 3), [3, null]);
});
