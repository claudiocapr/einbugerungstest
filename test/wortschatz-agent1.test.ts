import { test } from 'node:test';
import assert from 'node:assert/strict';
import { vocab } from '../src/content/wortschatz.ts';

const TOPICS = ['person', 'familie', 'wohnen', 'arbeit'] as const;

test('person, familie, wohnen and arbeit each have at least 140 entries', () => {
  for (const t of TOPICS) {
    const count = vocab.filter((e) => e.topic === t).length;
    assert.ok(count >= 140, `${t} has only ${count}`);
  }
});

test('ids in these topics are numbered without gaps', () => {
  for (const t of TOPICS) {
    const nums = vocab
      .filter((e) => e.topic === t)
      .map((e) => Number(e.id.slice(t.length + 1)))
      .sort((x, y) => x - y);
    nums.forEach((num, i) => assert.equal(num, i + 1, `${t}: expected ${t}-${String(i + 1).padStart(3, '0')}`));
  }
});

test('plural-only nouns say so in the translation', () => {
  for (const de of ['Eltern', 'Großeltern', 'Schwiegereltern', 'Nebenkosten']) {
    const e = vocab.find((x) => x.de === de && x.pos === 'noun');
    assert.ok(e, `${de} missing`);
    assert.equal(e!.plural, '-');
    assert.match(e!.en, /plural/);
  }
});
