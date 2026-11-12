import { test } from 'node:test';
import assert from 'node:assert/strict';
import { answer, createSession, current, isDone, progress, type MasterySession } from '../src/lib/mastery.ts';

function seeded(seed = 11) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const ids = (n: number) => Array.from({ length: n }, (_, i) => `i${i}`);

/** Plays a round; `ok` decides each answer. Returns the order of questions asked. */
function play(s: MasterySession, ok: (id: string, step: number) => boolean, limit = 10_000) {
  const asked: string[] = [];
  let session = s;
  while (!isDone(session) && asked.length < limit) {
    const id = current(session)!;
    asked.push(id);
    session = answer(session, ok(id, asked.length - 1));
  }
  return { asked, session };
}

test('createSession: one queue entry per unique id, nothing mastered', () => {
  const s = createSession(['a', 'b', 'a', 'c']);
  assert.deepEqual(s.queue, ['a', 'b', 'c']);
  assert.equal(current(s), 'a');
  const p = progress(s);
  assert.equal(p.total, 3);
  assert.equal(p.mastered, 0);
  assert.equal(p.answers, 0);
  assert.equal(p.done, false);
});

test('an empty session is done at once', () => {
  const s = createSession([]);
  assert.equal(current(s), null);
  assert.equal(isDone(s), true);
  assert.equal(answer(s, true), s);
});

test('a wrong answer resets the streak and the item returns 2–4 questions later', () => {
  for (let seed = 1; seed < 200; seed++) {
    let s = createSession(ids(8), { rnd: seeded(seed) });
    s = answer(s, true);
    s = answer(s, true);
    // Make i2 build a streak first so we can see the reset.
    const target = current(s)!;
    s = answer(s, true);
    // Play until target comes back, answering others correctly, then answer it wrong.
    while (current(s) !== target) s = answer(s, true);
    assert.equal(s.items[target].streak, 1);
    s = answer(s, false);
    assert.equal(s.items[target].streak, 0);
    assert.equal(s.items[target].wrong, 1);
    const pos = s.queue.indexOf(target) + 1; // 1 = next question
    assert.ok(pos >= 2 && pos <= 4, `seed ${seed}: came back after ${pos}`);
  }
});

test('a single correct answer does not finish an item; three in a row do', () => {
  let s = createSession(['a', 'b', 'c'], { rnd: seeded(3) });
  s = answer(s, true);
  assert.equal(s.items.a.streak, 1);
  assert.equal(s.items.a.mastered, false);
  assert.ok(s.queue.includes('a'));
  const { session } = play(s, () => true);
  assert.equal(session.items.a.mastered, true);
  assert.equal(session.items.a.attempts, 3);
  assert.equal(progress(session).mastered, 3);
  assert.equal(progress(session).answers, 9);
  assert.equal(progress(session).retries, 0);
});

test('a correct answer below the target sends the item 5–8 questions back (or to the end)', () => {
  for (let seed = 1; seed < 100; seed++) {
    let s = createSession(ids(12), { rnd: seeded(seed) });
    s = answer(s, true);
    const pos = s.queue.indexOf('i0') + 1;
    assert.ok(pos >= 5 && pos <= 8, `seed ${seed}: ${pos}`);
  }
  let small = createSession(['a', 'b'], { rnd: seeded(1) });
  small = answer(small, true);
  assert.deepEqual(small.queue, ['b', 'a']);
});

test('the round always terminates and every item ends up mastered', () => {
  for (let seed = 1; seed < 60; seed++) {
    const rnd = seeded(seed);
    const answers = seeded(seed + 1000);
    const n = 1 + (seed % 9);
    const { asked, session } = play(createSession(ids(n), { rnd }), () => answers() < 0.6);
    assert.ok(isDone(session), `seed ${seed} did not finish after ${asked.length}`);
    const p = progress(session);
    assert.equal(p.mastered, n);
    assert.equal(p.answers, asked.length);
    assert.equal(p.retries, p.items.reduce((a, i) => a + i.wrong, 0));
    for (const item of p.items) assert.ok(item.attempts >= 3 && item.streak >= 3);
  }
});

test('no item is asked twice in a row unless it is the only one left', () => {
  for (let seed = 1; seed < 80; seed++) {
    const answers = seeded(seed * 7);
    let s = createSession(ids(8), { rnd: seeded(seed) });
    let prev: string | null = null;
    while (!isDone(s)) {
      const id = current(s)!;
      if (id === prev) assert.equal(s.queue.length, 1, `seed ${seed}: ${id} twice with ${s.queue.length} waiting`);
      prev = id;
      s = answer(s, answers() < 0.5);
    }
  }
});

test('the last item left is asked until it sits', () => {
  let s = createSession(['solo']);
  s = answer(s, false);
  assert.deepEqual(s.queue, ['solo']);
  s = answer(s, true);
  s = answer(s, true);
  s = answer(s, true);
  assert.equal(isDone(s), true);
  assert.equal(s.items.solo.attempts, 4);
  assert.equal(progress(s).retries, 1);
});

test('answer is pure: the old session is unchanged', () => {
  const s = createSession(['a', 'b', 'c'], { rnd: seeded(5) });
  const before = JSON.stringify({ q: s.queue, i: s.items });
  answer(s, false);
  assert.equal(JSON.stringify({ q: s.queue, i: s.items }), before);
});

test('deterministic with the same random source', () => {
  const run = () => play(createSession(ids(6), { rnd: seeded(42) }), (_id, step) => step % 3 !== 1).asked.join(',');
  assert.equal(run(), run());
});

test('custom target and bad gaps', () => {
  const { session } = play(createSession(['a', 'b'], { target: 1 }), () => true);
  assert.equal(session.answers, 2);
  assert.throws(() => createSession(['a'], { wrongGap: [0, 2] }));
  assert.throws(() => createSession(['a'], { rightGap: [5, 3] }));
});
