import { test } from 'node:test';
import assert from 'node:assert/strict';
import { vocab } from '../src/content/wortschatz.ts';

const TOPICS: readonly string[] = ['ausbildung', 'gesundheit', 'essen', 'einkaufen'];

test('the expanded topics have about 140 entries each', () => {
  for (const t of TOPICS) {
    const count = vocab.filter((e) => e.topic === t).length;
    assert.ok(count >= 135, `${t} has only ${count}`);
  }
});

test('ids in the expanded topics are numbered without gaps', () => {
  for (const t of TOPICS) {
    const nums = vocab
      .filter((e) => e.topic === t)
      .map((e) => Number(e.id.slice(t.length + 1)))
      .sort((a, b) => a - b);
    nums.forEach((n, i) => assert.equal(n, i + 1, `${t}: expected ${i + 1}, got ${n}`));
  }
});

test('in the expanded topics only verbs of movement or change of state take "ist"', () => {
  const ist = vocab.filter((e) => TOPICS.includes(e.topic) && e.forms?.split(',')[2]?.trim().startsWith('ist '));
  assert.deepEqual(ist.map((e) => e.de).sort(), ['durchfallen', 'sitzen bleiben', 'sterben']);
});
