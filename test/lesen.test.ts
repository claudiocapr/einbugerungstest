import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lesen1, lesen2, lesen3 } from '../src/content/lesen.ts';
import { TOPICS } from '../src/content/topics.ts';
import type { Text2 } from '../src/types.ts';
import type { DrillResult } from '../src/types.ts';
import {
  assignUnique,
  bestBySet,
  FIRST_NUMBER,
  formatPoints,
  lesen1Keys,
  lesen3Keys,
  lesen3X,
  letter,
  MAX_POINTS,
  nextId,
  scoreItems,
  scoreLesen1,
  scoreLesen2,
  scoreLesen3,
} from '../src/sections/lesen/score.ts';

const topicIds = new Set(TOPICS.map((t) => t.id));
const words = (s: string) => s.split(/\s+/).filter(Boolean).length;

function assertExplained(e: Text2, where: string) {
  assert.ok(e && e.de.trim().length > 10, `${where}: German explanation missing`);
  assert.ok(e.en.trim().length > 10, `${where}: English explanation missing`);
}

/* ------------------------------------------------------------ content */

test('there are at least 10 sets per Lesen part, with unique ids and known topics', () => {
  assert.ok(lesen1.length >= 10, 'lesen1');
  assert.ok(lesen2.length >= 10, 'lesen2');
  assert.ok(lesen3.length >= 10, 'lesen3');
  const ids = [...lesen1, ...lesen2, ...lesen3].map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length, 'set ids are unique');
  for (const s of [...lesen1, ...lesen2, ...lesen3]) assert.ok(topicIds.has(s.topic), `${s.id}: topic ${s.topic}`);
  for (const s of lesen1) assert.match(s.id, /^lesen1-\d\d$/);
  for (const s of lesen2) assert.match(s.id, /^lesen2-\d\d$/);
  for (const s of lesen3) assert.match(s.id, /^lesen3-\d\d$/);
});

test('the Lesen sets cover many different topics', () => {
  for (const sets of [lesen1, lesen2, lesen3]) {
    assert.ok(new Set(sets.map((s) => s.topic)).size >= 8);
  }
});

test('Teil 1: 10 headlines, 5 texts, each text has its own headline', () => {
  for (const s of lesen1) {
    assert.equal(s.headlines.length, 10, `${s.id}: headlines`);
    assert.equal(new Set(s.headlines).size, 10, `${s.id}: headlines are distinct`);
    for (const h of s.headlines) assert.ok(h.trim().length > 5, `${s.id}: empty headline`);
    assert.equal(s.texts.length, 5, `${s.id}: texts`);
    const answers = s.texts.map((t) => t.answer);
    assert.equal(new Set(answers).size, 5, `${s.id}: each headline used at most once`);
    s.texts.forEach((t, i) => {
      assert.ok(Number.isInteger(t.answer) && t.answer >= 0 && t.answer < 10, `${s.id}/${i + 1}: answer in a–j`);
      const n = words(t.text);
      assert.ok(n >= 50 && n <= 110, `${s.id}/${i + 1}: ${n} words`);
      assertExplained(t.explanation, `${s.id}/${i + 1}`);
    });
  }
});

test('Teil 2: a long text and 5 items with 3 distinct options each', () => {
  for (const s of lesen2) {
    assert.ok(s.title.trim().length > 0, `${s.id}: title`);
    const n = words(s.text.join(' '));
    assert.ok(n >= 290 && n <= 450, `${s.id}: ${n} words`);
    assert.equal(s.items.length, 5, `${s.id}: items`);
    s.items.forEach((item, i) => {
      assert.ok(item.stem.trim().length > 0, `${s.id}/${i + 1}: stem`);
      assert.equal(item.options.length, 3, `${s.id}/${i + 1}: options`);
      assert.equal(new Set(item.options).size, 3, `${s.id}/${i + 1}: options are distinct`);
      assert.ok([0, 1, 2].includes(item.answer), `${s.id}/${i + 1}: answer`);
      assertExplained(item.explanation, `${s.id}/${i + 1}`);
    });
    assert.ok(new Set(s.items.map((i) => i.answer)).size >= 2, `${s.id}: answers are not all in the same position`);
  }
});

test('Teil 3: 12 ads, 10 situations, 1–2 without an ad, no ad used twice', () => {
  for (const s of lesen3) {
    assert.equal(s.ads.length, 12, `${s.id}: ads`);
    for (const ad of s.ads) assert.ok(ad.text.trim().length > 10, `${s.id}: ad text`);
    assert.equal(s.situations.length, 10, `${s.id}: situations`);
    const nulls = s.situations.filter((x) => x.answer === null).length;
    assert.ok(nulls >= 1 && nulls <= 2, `${s.id}: ${nulls} situations without an ad`);
    const used = s.situations.map((x) => x.answer).filter((a): a is number => a !== null);
    assert.equal(new Set(used).size, used.length, `${s.id}: an ad is used twice`);
    for (const a of used) assert.ok(Number.isInteger(a) && a >= 0 && a < 12, `${s.id}: answer in a–l`);
    s.situations.forEach((x, i) => {
      assert.ok(x.text.trim().length > 10, `${s.id}/${i + 1}: situation text`);
      assertExplained(x.explanation, `${s.id}/${i + 1}`);
    });
  }
});

/* ------------------------------------------------------------ scoring */

test('scoreItems counts open answers as wrong and scales points', () => {
  const r = scoreItems([1, 2, 3, 4], [1, null, 0, 4], 20);
  assert.equal(r.correct, 2);
  assert.equal(r.total, 4);
  assert.equal(r.points, 10);
  assert.equal(r.unanswered, 1);
  assert.deepEqual(
    r.items.map((i) => i.ok),
    [true, false, false, true],
  );
  assert.equal(r.items[1].chosen, null);
  assert.equal(r.passed, false);
});

test('scoreItems: missing, undefined and NaN answers are treated as open', () => {
  const r = scoreItems([0, 1, 2], [undefined, Number.NaN], 3);
  assert.equal(r.correct, 0);
  assert.equal(r.unanswered, 3);
});

test('pass mark is 60 % of the points', () => {
  assert.equal(scoreItems([0, 0, 0, 0, 0], [0, 0, 0, 1, 1], 25).passed, true); // 15/25
  assert.equal(scoreItems([0, 0, 0, 0, 0], [0, 0, 1, 1, 1], 25).passed, false); // 10/25
  assert.equal(scoreItems([], [], 25).passed, false);
});

test('telc weighting: Teil 1 and 2 give 5 points per item, Teil 3 gives 2.5', () => {
  const s1 = lesen1[0];
  const all1 = scoreLesen1(s1, lesen1Keys(s1));
  assert.equal(all1.points, MAX_POINTS.lesen1);
  assert.equal(all1.maxPoints, 25);
  const oneWrong = lesen1Keys(s1).map((k, i) => (i === 0 ? (k + 1) % 10 : k));
  assert.equal(scoreLesen1(s1, oneWrong).points, 20);

  const s2 = lesen2[0];
  assert.equal(scoreLesen2(s2, [null, null, null, null, null]).points, 0);
  assert.equal(scoreLesen2(s2, s2.items.map((i) => i.answer)).points, 25);

  const s3 = lesen3[0];
  const keys = lesen3Keys(s3);
  const sevenRight = keys.map((k, i) => (i < 7 ? k : null));
  assert.equal(scoreLesen3(s3, sevenRight).points, 17.5);
});

test('Teil 3 encodes "x" as one past the last ad', () => {
  const s3 = lesen3[0];
  assert.equal(lesen3X(s3), 12);
  const keys = lesen3Keys(s3);
  s3.situations.forEach((x, i) => assert.equal(keys[i], x.answer ?? 12));
  // Choosing x where no ad fits scores; leaving it open does not.
  const xIndex = s3.situations.findIndex((x) => x.answer === null);
  const withX = keys.map((k, i) => (i === xIndex ? 12 : k));
  const withoutX = keys.map((k, i) => (i === xIndex ? null : k));
  assert.equal(scoreLesen3(s3, withX).correct, 10);
  assert.equal(scoreLesen3(s3, withoutX).correct, 9);
});

test('assignUnique moves a choice that is already used, except the repeatable one', () => {
  assert.deepEqual(assignUnique([3, null, null], 1, 3), [null, 3, null]);
  assert.deepEqual(assignUnique([3, 5, null], 0, null), [null, 5, null]);
  assert.deepEqual(assignUnique([12, null], 1, 12, 12), [12, 12]);
  const before = [1, 2];
  assignUnique(before, 0, 2);
  assert.deepEqual(before, [1, 2], 'input is not mutated');
});

test('bestBySet keeps the best ratio and counts attempts per set', () => {
  const base = { section: 'lesen', part: 'lesen1' as const, total: 5, startedAt: 0, finishedAt: 1, maxPoints: 25 };
  const results: DrillResult[] = [
    { ...base, setId: 'lesen1-01', correct: 2, points: 10 },
    { ...base, setId: 'lesen1-01', correct: 4, points: 20 },
    { ...base, setId: 'lesen1-02', correct: 1, points: 5 },
    { ...base, setId: 'lesen1-01', correct: 3, points: 15 },
    { ...base, section: 'sprachbausteine', setId: 'lesen1-01', correct: 5, points: 25 },
    { ...base, part: 'lesen2', setId: 'lesen1-01', correct: 5, points: 25 },
  ];
  const best = bestBySet(results, 'lesen', 'lesen1');
  assert.equal(best['lesen1-01'].points, 20);
  assert.equal(best['lesen1-01'].count, 3);
  assert.equal(best['lesen1-02'].points, 5);
  assert.equal(best['lesen1-03'], undefined);
});

test('small helpers: letters, points, numbering, next set', () => {
  assert.equal(letter(0), 'a');
  assert.equal(letter(9), 'j');
  assert.equal(letter(12, 12), 'x');
  assert.equal(formatPoints(17.5, 'de'), '17,5');
  assert.equal(formatPoints(17.5, 'en'), '17.5');
  assert.equal(formatPoints(20), '20');
  assert.deepEqual(FIRST_NUMBER, { lesen1: 1, lesen2: 6, lesen3: 11, sb1: 21, sb2: 31 });
  assert.equal(nextId(['a', 'b', 'c'], 'b'), 'c');
  assert.equal(nextId(['a', 'b', 'c'], 'c'), undefined);
  assert.equal(nextId(['a'], 'z'), undefined);
});
