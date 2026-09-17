import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAX_BOX, grade, isDue, isMastered, isWeak, practiceOrder } from '../src/lib/srs.ts';

test('a correct answer promotes one box, a wrong one drops back to box 1', () => {
  let p = grade(undefined, true);
  assert.equal(p.box, 1);
  assert.equal(p.correct, 1);
  p = grade(p, true);
  assert.equal(p.box, 2);
  p = grade(p, false);
  assert.equal(p.box, 1);
  assert.equal(p.wrong, 1);
  assert.equal(p.correct, 2);
});

test('boxes stop at the mastered level', () => {
  let p = grade(undefined, true);
  for (let i = 0; i < 10; i++) p = grade(p, true);
  assert.equal(p.box, MAX_BOX);
  assert.ok(isMastered(p));
});

test('a wrong answer is due again immediately, a mastered one much later', () => {
  const now = 1_000_000;
  assert.ok(isDue(grade(undefined, false, now), now));
  let p = grade(undefined, true, now);
  for (let i = 0; i < 5; i++) p = grade(p, true, now);
  assert.equal(isDue(p, now), false);
  assert.ok(isDue(p, now + 22 * 24 * 60 * 60 * 1000));
});

test('unseen questions are always due', () => {
  assert.ok(isDue(undefined));
});

test('a question counts as weak once missed, until it is mastered again', () => {
  assert.equal(isWeak(undefined), false);
  let p = grade(undefined, false);
  assert.ok(isWeak(p));
  for (let i = 0; i < MAX_BOX; i++) p = grade(p, true);
  assert.equal(isWeak(p), false);
});

test('practice serves unseen questions before scheduled ones', () => {
  const progress = {
    1: grade(undefined, true),
    2: grade(grade(undefined, true), true),
  };
  const order = practiceOrder([1, 2, 3], progress);
  assert.equal(order[0], 3, 'the unseen question should come first');
  assert.equal(order[1], 1, 'the lower box should come before the higher one');
  assert.equal(order[2], 2);
});
