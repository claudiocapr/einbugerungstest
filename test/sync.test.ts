import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mergeItem, mergeResults, mergeStores, storeForSignIn } from '../src/sync/merge.ts';
import { EMPTY, MAX_RESULTS, type Store } from '../src/lib/storage.ts';
import type { DrillResult, ItemProgress } from '../src/types.ts';

const item = (lastSeen: number, correct = 1, wrong = 0, box = 1): ItemProgress => ({
  box,
  due: lastSeen + 1000,
  correct,
  wrong,
  lastSeen,
  history: [],
});

const result = (startedAt: number, section = 'lesen', setId?: string, extra: Partial<DrillResult> = {}): DrillResult => ({
  section,
  setId,
  correct: 3,
  total: 5,
  startedAt,
  finishedAt: startedAt + 60_000,
  ...extra,
});

const store = (patch: Partial<Store>): Store => ({ ...EMPTY, ...patch });

test('per item, the entry seen later wins, whichever side it is on', () => {
  const local = store({ updatedAt: 10, progress: { a: item(100, 1), b: item(300, 2) } });
  const remote = store({ updatedAt: 20, progress: { a: item(200, 5), b: item(250, 9) } });
  const merged = mergeStores(local, remote);
  assert.equal(merged.progress.a.lastSeen, 200);
  assert.equal(merged.progress.a.correct, 5);
  assert.equal(merged.progress.b.lastSeen, 300);
  assert.equal(merged.progress.b.correct, 2);
});

test('items known to only one side are kept', () => {
  const merged = mergeStores(store({ progress: { a: item(1) } }), store({ progress: { b: item(2) } }));
  assert.deepEqual(Object.keys(merged.progress).sort(), ['a', 'b']);
});

test('a tie on lastSeen goes to the entry with more attempts, then to local', () => {
  assert.equal(mergeItem(item(5, 1, 0), item(5, 2, 1))!.correct, 2);
  assert.equal(mergeItem(item(5, 3, 1), item(5, 1, 0))!.correct, 3);
  const local = item(5, 1, 1, 2);
  const remote = item(5, 2, 0, 4);
  assert.equal(mergeItem(local, remote), local);
});

test('results are united, deduplicated by startedAt+section+setId, newest first', () => {
  const shared = result(1000, 'lesen', 'l1-01');
  const local = store({ results: [result(3000, 'hoeren', 'h1'), shared] });
  const remote = store({
    results: [result(2000, 'lesen', 'l1-02'), { ...shared }, result(1000, 'sprachbausteine', 'l1-01')],
  });
  const merged = mergeStores(local, remote);
  assert.deepEqual(
    merged.results.map((r) => `${r.startedAt}:${r.section}:${r.setId}`),
    ['3000:hoeren:h1', '2000:lesen:l1-02', '1000:lesen:l1-01', '1000:sprachbausteine:l1-01'],
  );
});

test('results without a setId still deduplicate', () => {
  const merged = mergeResults([result(1, 'modelltest')], [result(1, 'modelltest'), result(2, 'modelltest')]);
  assert.equal(merged.length, 2);
});

test('the merged result list is capped at MAX_RESULTS', () => {
  const local = Array.from({ length: MAX_RESULTS }, (_, i) => result(i * 2, 'lesen', `l${i}`));
  const remote = Array.from({ length: MAX_RESULTS }, (_, i) => result(i * 2 + 1, 'lesen', `r${i}`));
  const merged = mergeStores(store({ results: local }), store({ results: remote }));
  assert.equal(merged.results.length, MAX_RESULTS);
  // The newest survive.
  assert.equal(merged.results[0].startedAt, MAX_RESULTS * 2 - 1);
  assert.ok(merged.results.every((r, i, a) => i === 0 || a[i - 1].finishedAt >= r.finishedAt));
});

test('settings come from the store that changed last', () => {
  const local = store({ updatedAt: 100, lang: 'en', theme: 'dark', dailyGoal: 50 });
  const remote = store({ updatedAt: 200, lang: 'de', theme: 'light', dailyGoal: 10 });
  const a = mergeStores(local, remote);
  assert.deepEqual([a.lang, a.theme, a.dailyGoal, a.updatedAt], ['de', 'light', 10, 200]);
  const b = mergeStores({ ...local, updatedAt: 300 }, remote);
  assert.deepEqual([b.lang, b.theme, b.dailyGoal, b.updatedAt], ['en', 'dark', 50, 300]);
});

test('section state: per key the newer store wins, keys from one side are kept', () => {
  const local = store({ updatedAt: 100, sections: { schreiben: { draft: 'local' }, wortschatz: { topic: 'a' } } });
  const remote = store({ updatedAt: 200, sections: { schreiben: { draft: 'remote' }, telc: { x: 1 } } });
  const merged = mergeStores(local, remote);
  assert.deepEqual(merged.sections, { schreiben: { draft: 'remote' }, wortschatz: { topic: 'a' }, telc: { x: 1 } });
});

test('an empty side changes nothing; damaged remote data cannot crash the merge', () => {
  const local = store({ updatedAt: 50, lang: 'en', progress: { a: item(1) }, results: [result(1)] });
  for (const remote of [null, undefined, {}, 'garbage', 42, { progress: 'x', results: 'y', sections: 3 }]) {
    const merged = mergeStores(local, remote);
    assert.deepEqual(merged.progress, local.progress);
    assert.deepEqual(merged.results, local.results);
    assert.equal(merged.lang, 'en');
    assert.equal(merged.updatedAt, 50);
  }
  const fromEmptyLocal = mergeStores(EMPTY, local);
  assert.deepEqual(fromEmptyLocal.progress, local.progress);
  assert.equal(fromEmptyLocal.lang, 'en');
});

test('merging is idempotent', () => {
  const local = store({ updatedAt: 10, progress: { a: item(3) }, results: [result(5)] });
  const remote = store({ updatedAt: 20, progress: { b: item(4) }, results: [result(6)] });
  const once = mergeStores(local, remote);
  assert.deepEqual(mergeStores(once, remote), once);
  assert.deepEqual(mergeStores(once, once), once);
});

test('a different account on the same device never gets the previous account\'s progress', () => {
  const mine = store({ progress: { a: item(1) }, lang: 'en' });
  const theirs = store({ progress: { b: item(2) } });
  const switched = storeForSignIn(mine, theirs, 'user-me', 'user-friend');
  assert.deepEqual(Object.keys(switched.progress), ['b'], 'only the friend\'s own progress');

  const fresh = storeForSignIn(mine, null, 'user-me', 'user-friend');
  assert.deepEqual(fresh.progress, {}, 'a friend without saved progress starts empty');
  assert.deepEqual(fresh.results, []);
  assert.equal(fresh.lang, 'en', 'device settings like the language stay');
});

test('the same account, or the first sign-in on a device, keeps progress made while signed out', () => {
  const local = store({ progress: { a: item(1) } });
  const remote = store({ progress: { b: item(2) } });
  assert.deepEqual(Object.keys(storeForSignIn(local, remote, 'user-me', 'user-me').progress).sort(), ['a', 'b']);
  assert.deepEqual(Object.keys(storeForSignIn(local, remote, null, 'user-me').progress).sort(), ['a', 'b']);
  assert.deepEqual(Object.keys(storeForSignIn(local, null, null, 'user-me').progress), ['a']);
});
