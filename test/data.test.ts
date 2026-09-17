import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { QUESTIONS, GENERAL, STATES, catalogueFor, questionsForState } from '../src/lib/questions.ts';

test('catalogue holds all 460 official questions with unique ids', () => {
  assert.equal(QUESTIONS.length, 460);
  assert.equal(new Set(QUESTIONS.map((q) => q.id)).size, 460);
  assert.equal(GENERAL.length, 300);
});

test('every federal state has exactly 10 questions', () => {
  assert.equal(STATES.length, 16);
  for (const state of STATES) {
    assert.equal(questionsForState(state).length, 10, `${state} should have 10 questions`);
  }
});

test('each question has four answers and exactly one correct index', () => {
  for (const q of QUESTIONS) {
    assert.equal(q.options.length, 4, `question ${q.id}`);
    assert.ok(q.options.every((o) => typeof o === 'string' && o.length > 0), `question ${q.id}`);
    assert.ok(q.answer >= 0 && q.answer <= 3, `question ${q.id} answer index`);
    assert.equal(q.en.options.length, 4, `question ${q.id} translation`);
    assert.ok(q.text.length > 0 && q.en.text.length > 0, `question ${q.id} text`);
  }
});

test('question text never leaks the catalogue numbering', () => {
  for (const q of QUESTIONS) {
    assert.doesNotMatch(q.text, /^\s*\d+\.\s/, `question ${q.id}`);
    assert.doesNotMatch(q.en.text, /^\s*\d+\.\s/, `question ${q.id}`);
  }
});

test('picture questions reference files that exist in public/', () => {
  for (const q of QUESTIONS) {
    const refs = [...(q.image ? [q.image] : []), ...(q.optionImages ?? [])];
    for (const ref of refs) {
      assert.ok(existsSync(new URL(`../public/${ref}`, import.meta.url)), `missing ${ref} for question ${q.id}`);
    }
    if (q.optionImages) assert.equal(q.optionImages.length, 4, `question ${q.id}`);
  }
});

test('a candidate is examined on 310 questions', () => {
  for (const state of STATES) {
    assert.equal(catalogueFor(state).length, 310, state);
  }
});

test('known answers match the official catalogue', () => {
  const expect = (id: number, needle: string) => {
    const q = QUESTIONS.find((x) => x.id === id)!;
    assert.ok(
      q.options[q.answer].includes(needle),
      `question ${id}: expected the correct answer to contain "${needle}", got "${q.options[q.answer]}"`,
    );
  };
  expect(1, 'Meinungsfreiheit');
  expect(3, 'Alle Einwohnerinnen/Einwohner und der Staat');
  expect(45, 'Sozialversicherung');
  expect(200, 'Mecklenburg-Vorpommern');
  expect(300, 'Italien');
  expect(427, 'Dresden');
  expect(437, 'Magdeburg');
});
