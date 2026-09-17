import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EXAM_PASS_MARK, EXAM_TOTAL, buildExam, formatClock, isPass } from '../src/lib/exam.ts';
import { STATES } from '../src/lib/questions.ts';

test('an exam is 30 general plus 3 state questions, all distinct', () => {
  for (const state of STATES) {
    const exam = buildExam(state);
    assert.equal(exam.length, EXAM_TOTAL);
    assert.equal(new Set(exam.map((q) => q.id)).size, EXAM_TOTAL, `${state} drew a duplicate`);
    assert.equal(exam.filter((q) => q.state === null).length, 30, state);
    const stateQuestions = exam.filter((q) => q.state !== null);
    assert.equal(stateQuestions.length, 3, state);
    assert.ok(stateQuestions.every((q) => q.state === state), `${state} drew another state's question`);
  }
});

test('exams are drawn at random rather than fixed', () => {
  const a = buildExam('Berlin').map((q) => q.id).join(',');
  const b = buildExam('Berlin').map((q) => q.id).join(',');
  assert.notEqual(a, b);
});

test('the pass mark is 17 of 33', () => {
  assert.equal(EXAM_PASS_MARK, 17);
  assert.equal(isPass(16), false);
  assert.equal(isPass(17), true);
  assert.equal(isPass(33), true);
});

test('the clock counts down in mm:ss and never goes negative', () => {
  assert.equal(formatClock(60 * 60 * 1000), '60:00');
  assert.equal(formatClock(61 * 1000), '01:01');
  assert.equal(formatClock(0), '00:00');
  assert.equal(formatClock(-5000), '00:00');
});
