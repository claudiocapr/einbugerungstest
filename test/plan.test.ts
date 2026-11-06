import { test } from 'node:test';
import assert from 'node:assert/strict';
import { activityByDay, answeredToday, dueVocab, partOfTheDay, productiveOfTheDay, streak } from '../src/lib/plan.ts';
import { grade } from '../src/lib/srs.ts';
import type { DrillResult } from '../src/types.ts';

const NOW = new Date(2026, 10, 6, 15, 0).getTime();
const DAY = 24 * 60 * 60 * 1000;

const result = (part: DrillResult['part'], correct: number, total = 5, at = NOW): DrillResult => ({
  section: 'x',
  part,
  correct,
  total,
  startedAt: at - 1000,
  finishedAt: at,
});

test('activity is counted per local day, oldest first', () => {
  const progress = {
    'vocab:a': grade(grade(undefined, true, NOW - 2 * DAY), false, NOW),
    'vocab:b': grade(undefined, true, NOW - 1000),
  };
  assert.deepEqual(activityByDay(progress, NOW, 3), [1, 0, 2]);
  assert.equal(answeredToday(progress, NOW), 2);
});

test('the streak counts consecutive days and survives until today is practised', () => {
  const progress = { 'vocab:a': grade(grade(undefined, true, NOW - 2 * DAY), true, NOW - DAY) };
  assert.equal(streak(progress, [], NOW), 2, 'yesterday and the day before');
  assert.equal(streak(progress, [result('lesen1', 3)], NOW), 3, 'a finished set today extends it');
  assert.equal(streak({}, [], NOW), 0);
});

test('only vocabulary seen before counts as due', () => {
  const progress = {
    'vocab:a': grade(undefined, false, NOW),
    'vocab:b': grade(undefined, true, NOW),
    'lesen1:x:1': grade(undefined, false, NOW),
  };
  assert.equal(dueVocab(progress, NOW), 1);
});

test('untried exam parts come first, then the weakest', () => {
  assert.equal(partOfTheDay([]).part, 'lesen1');
  assert.equal(partOfTheDay([result('lesen1', 5)]).part, 'lesen2');
  const all = (['lesen1', 'lesen2', 'lesen3', 'sb1', 'sb2', 'hoeren1', 'hoeren2', 'hoeren3'] as const).map((p) =>
    result(p, p === 'sb2' ? 1 : 4),
  );
  const pick = partOfTheDay(all);
  assert.equal(pick.part, 'sb2');
  assert.equal(pick.route, 'sprachbausteine/teil2');
});

test('writing and speaking alternate day by day', () => {
  assert.notEqual(productiveOfTheDay(NOW), productiveOfTheDay(NOW + DAY));
});
