import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAX_BOX, grade, historyOf, isWeak, practiceOrder, strength, strengthLevel } from '../src/lib/srs.ts';
import type { QuestionProgress } from '../src/types.ts';

const NOW = 1_700_000_000_000;
const DAY = 24 * 60 * 60 * 1000;

/** Answers a question `results` in order, oldest first. */
const play = (results: boolean[], now = NOW) => {
  let p: QuestionProgress | undefined;
  results.forEach((ok, i) => {
    p = grade(p, ok, now + i * 1000, ok ? 0 : 1);
  });
  return p!;
};

test('every answer is recorded with what was picked and when', () => {
  const p = play([true, false]);
  const history = historyOf(p);
  assert.equal(history.length, 2);
  assert.equal(history[0].ok, false, 'the newest answer comes first');
  assert.equal(history[0].chosen, 1);
  assert.equal(history[1].ok, true);
  assert.equal(history[1].chosen, 0);
  assert.ok(history[0].at > history[1].at);
});

test('history is capped so the store cannot grow without bound', () => {
  const p = play(Array(40).fill(true));
  assert.equal(historyOf(p).length, 10);
  assert.equal(p.correct, 40, 'the running totals still count every answer');
});

test('an unanswered question has no strength and reads as new', () => {
  assert.equal(strength(undefined, NOW), 0);
  assert.equal(strengthLevel(undefined, NOW), 'new');
});

test('strength rises with correct answers and falls with mistakes', () => {
  const good = play([true, true, true], NOW);
  const bad = play([true, true, false], NOW);
  assert.ok(strength(good, NOW) > strength(bad, NOW));
  assert.ok(strength(bad, NOW) > 0);
});

test('the newest answer counts for more than older ones', () => {
  const recovering = play([false, false, true], NOW);
  const slipping = play([true, true, false], NOW);
  assert.ok(
    strength(recovering, NOW) > strength(slipping, NOW),
    'a recent success should outweigh old failures',
  );
});

test('a long unanswered question loses strength without being answered wrong', () => {
  const p = play(Array(6).fill(true), NOW);
  const fresh = strength(p, NOW);
  const stale = strength(p, p.due + 60 * DAY);
  assert.ok(stale < fresh, `expected decay, got ${stale} >= ${fresh}`);
  assert.ok(stale > 0);
});

test('levels run from weak to strong as answers accumulate', () => {
  assert.equal(strengthLevel(play([false]), NOW), 'weak');
  assert.equal(strengthLevel(play(Array(6).fill(true)), NOW), 'strong');
  const mixed = strengthLevel(play([false, false, true, true]), NOW);
  assert.ok(['shaky', 'good'].includes(mixed), `unexpected level ${mixed}`);
});

test('weak covers what needs work and excludes solid questions', () => {
  assert.equal(isWeak(undefined), false, 'never-seen questions are not weak, they are new');
  assert.equal(isWeak(play([false]), NOW), true);
  assert.equal(isWeak(play(Array(MAX_BOX + 1).fill(true)), NOW), false);
});

test('practice serves unseen questions first, then the weakest', () => {
  const progress: Record<number, QuestionProgress> = {
    1: play(Array(6).fill(true), NOW),
    2: play([false], NOW),
  };
  assert.deepEqual(practiceOrder([1, 2, 3], progress, NOW), [3, 2, 1]);
});

test('ordering is stable for equal questions', () => {
  const progress: Record<number, QuestionProgress> = {};
  assert.deepEqual(practiceOrder([3, 1, 2], progress, NOW), [1, 2, 3]);
});
