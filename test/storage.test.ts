import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  exportFilename,
  exportStore,
  getStore,
  importStore,
  normaliseProgress,
  normaliseStore,
  recordItem,
  recordResult,
  resetProgress,
  setStore,
} from '../src/lib/storage.ts';

const NOW = 1_700_000_000_000;

test('damaged or foreign progress entries are dropped rather than crashing the app', () => {
  const progress = normaliseProgress({
    'vocab:a': null,
    'vocab:b': 'nonsense',
    'vocab:c': { box: 'x', due: undefined, correct: null, wrong: NaN, lastSeen: 0, history: 'bad' },
  });
  assert.deepEqual(Object.keys(progress), ['vocab:c']);
  assert.deepEqual(progress['vocab:c'], { box: 0, due: 0, correct: 0, wrong: 0, lastSeen: 0, history: [] });
  assert.deepEqual(normaliseProgress(undefined), {});
  assert.deepEqual(normaliseProgress('nope'), {});
});

test('a missing or malformed store falls back to defaults', () => {
  const s = normaliseStore({ lang: 'fr' as never, theme: 'neon' as never, dailyGoal: -3, results: 'x' as never });
  assert.equal(s.lang, 'de');
  assert.equal(s.theme, 'system');
  assert.equal(s.dailyGoal, 20);
  assert.deepEqual(s.results, []);
  assert.deepEqual(normaliseStore(null).progress, {});
});

test('answers and finished drills are recorded', () => {
  resetProgress();
  recordItem('sb1:set-01:3', false, 2, NOW);
  recordItem('sb1:set-01:3', true, 0, NOW + 1000);
  const p = getStore().progress['sb1:set-01:3'];
  assert.equal(p.correct, 1);
  assert.equal(p.wrong, 1);
  assert.equal(p.history[0].chosen, 0);

  recordResult({ section: 'lesen', part: 'lesen1', correct: 4, total: 5, startedAt: NOW, finishedAt: NOW + 60_000 });
  assert.equal(getStore().results.length, 1);
  assert.ok(getStore().updatedAt > 0, 'local changes are stamped for sync');
});

test('progress saved to a file can be read back', () => {
  resetProgress();
  recordItem('vocab:wohnen-001', true, -1, NOW);
  const file = exportStore();
  assert.equal(JSON.parse(file).app, 'telc-b1');

  resetProgress();
  assert.deepEqual(getStore().progress, {});
  assert.equal(importStore(file), true);
  assert.equal(getStore().progress['vocab:wohnen-001'].correct, 1);
});

test('a wrong file is rejected and leaves saved progress alone', () => {
  resetProgress();
  recordItem('vocab:x', true, -1, NOW);
  assert.equal(importStore('not json'), false);
  assert.equal(importStore(JSON.stringify({ hello: 1 })), false);
  // A file from the old Einbürgerungstest app.
  assert.equal(importStore(JSON.stringify({ app: 'einbuergerungstest', version: 2, progress: { 1: {} } })), false);
  assert.equal(getStore().progress['vocab:x'].correct, 1);
});

test('import keeps the language and theme from the file', () => {
  setStore((s) => ({ ...s, lang: 'en', theme: 'dark' }));
  const file = exportStore();
  setStore((s) => ({ ...s, lang: 'de', theme: 'light' }));
  importStore(file);
  assert.equal(getStore().lang, 'en');
  assert.equal(getStore().theme, 'dark');
});

test('the saved file has a recognisable, dated name', () => {
  assert.equal(exportFilename(new Date(2026, 8, 17)), 'telc-b1-fortschritt-2026-09-17.json');
});
