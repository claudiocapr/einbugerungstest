import { test } from 'node:test';
import assert from 'node:assert/strict';
import { migrateProgress } from '../src/lib/storage.ts';
import { strengthLevel } from '../src/lib/srs.ts';

const NOW = 1_700_000_000_000;

test('progress saved before answer history was kept is still usable', () => {
  // A store written by the first version: counts, but no `history`.
  const old = {
    7: { box: 4, due: NOW + 1000, correct: 4, wrong: 0, lastSeen: NOW },
    9: { box: 1, due: NOW, correct: 2, wrong: 3, lastSeen: NOW },
  };
  const migrated = migrateProgress(old);

  assert.equal(Object.keys(migrated).length, 2);
  assert.equal(migrated[7].correct, 4, 'existing counts are preserved');
  assert.equal(migrated[7].box, 4);

  assert.equal(migrated[7].history.length, 1, 'a question with answers is not treated as unseen');
  assert.equal(migrated[7].history[0].ok, true, 'box 4 means the last answer was right');
  assert.equal(migrated[9].history[0].ok, false, 'box 1 with mistakes means the last answer was wrong');

  assert.notEqual(strengthLevel(migrated[7], NOW), 'new');
  assert.notEqual(strengthLevel(migrated[9], NOW), 'new');
});

test('a question that was never answered stays unseen after migration', () => {
  const migrated = migrateProgress({ 3: { box: 0, due: 0, correct: 0, wrong: 0, lastSeen: 0 } });
  assert.deepEqual(migrated[3].history, []);
  assert.equal(strengthLevel(migrated[3], NOW), 'new');
});

test('existing history is kept as it is', () => {
  const history = [{ at: NOW, chosen: 2, ok: true }];
  const migrated = migrateProgress({ 5: { box: 1, due: NOW, correct: 1, wrong: 0, lastSeen: NOW, history } });
  assert.deepEqual(migrated[5].history, history);
});

test('damaged or foreign entries are dropped rather than crashing the app', () => {
  const migrated = migrateProgress({
    1: null,
    2: 'nonsense',
    notANumber: { box: 1, due: 0, correct: 1, wrong: 0, lastSeen: 0 },
    4: { box: 'x', due: undefined, correct: null, wrong: NaN, lastSeen: 0, history: 'bad' },
  });
  assert.equal(migrated[1], undefined);
  assert.equal(migrated[2], undefined);
  assert.equal(Object.keys(migrated).length, 1);
  assert.deepEqual(migrated[4], { box: 0, due: 0, correct: 0, wrong: 0, lastSeen: 0, history: [] });
});

test('a missing or malformed store is not an error', () => {
  assert.deepEqual(migrateProgress(undefined), {});
  assert.deepEqual(migrateProgress(null), {});
  assert.deepEqual(migrateProgress('nope'), {});
});
