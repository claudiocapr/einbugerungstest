import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  analyticsAllowed,
  createSink,
  EventQueue,
  MAX_ERRORS_PER_SESSION,
  MAX_PROP_KEYS,
  maskPii,
  routePath,
  sanitizeName,
  sanitizeProps,
  type Row,
} from '../src/sync/analytics.ts';

test('props keep only flat primitives', () => {
  const clean = sanitizeProps({
    s: 'text',
    n: 3,
    f: 2.5,
    b: false,
    z: null,
    u: undefined,
    o: { nested: 1 },
    a: [1, 2],
    fn: () => 1,
    inf: Infinity,
    nan: NaN,
  });
  assert.deepEqual(clean, { s: 'text', n: 3, f: 2.5, b: false, z: null });
});

test('long strings are truncated to 100 characters', () => {
  const clean = sanitizeProps({ long: 'x'.repeat(500) });
  assert.equal((clean.long as string).length, 100);
});

test('the number of keys is capped and odd key names are cleaned', () => {
  const many = Object.fromEntries(Array.from({ length: 40 }, (_, i) => [`k${i}`, i]));
  assert.equal(Object.keys(sanitizeProps(many)).length, MAX_PROP_KEYS);
  assert.deepEqual(Object.keys(sanitizeProps({ 'a b-c': 1 })), ['a_b_c']);
});

test('anything that is not an object gives empty props', () => {
  for (const v of [undefined, null, 'x', 3, [1, 2]]) assert.deepEqual(sanitizeProps(v), {});
});

test('e-mail addresses are masked', () => {
  assert.equal(maskPii('login failed for jane.doe@example.org today'), 'login failed for [email] today');
  assert.deepEqual(sanitizeProps({ who: 'me@x.de' }), { who: '[email]' });
});

test('event names are lower-cased and limited to [a-z0-9_.-]', () => {
  assert.equal(sanitizeName('Lesen.Set_Finished'), 'lesen.set_finished');
  assert.equal(sanitizeName('bad name!'), 'bad_name_');
  assert.equal(sanitizeName('x'.repeat(100))!.length, 64);
  assert.equal(sanitizeName(''), null);
  assert.equal(sanitizeName(42), null);
});

test('route paths drop the hash prefix and query', () => {
  assert.equal(routePath('#/lesen/teil1?x=1'), 'lesen/teil1');
  assert.equal(routePath(''), 'home');
  assert.equal(routePath('#/' + 'a'.repeat(300)).length, 100);
});

test('opt-out: an explicit choice wins, otherwise Do Not Track means off', () => {
  assert.equal(analyticsAllowed(null, null), true);
  assert.equal(analyticsAllowed(null, '0'), true);
  assert.equal(analyticsAllowed(null, '1'), false);
  assert.equal(analyticsAllowed('off', null), false);
  assert.equal(analyticsAllowed('off', '0'), false);
  assert.equal(analyticsAllowed('on', '1'), true);
});

function fakeQueue() {
  const rows: Row[] = [];
  return { rows, queue: { push: (r: Row) => rows.push(r), full: false, flush: async () => {} } };
}

const deps = (q: ReturnType<typeof fakeQueue>['queue'], allowed = true) => ({
  queue: q,
  allowed: () => allowed,
  installId: () => 'install-1234',
  path: () => 'lesen',
  userAgent: () => 'UA',
  version: '9.9.9',
});

test('the sink sends nothing when opted out', () => {
  const { rows, queue } = fakeQueue();
  const sink = createSink(deps(queue, false));
  sink.track('screen.view', { section: 'lesen' });
  sink.error(new Error('boom'));
  assert.equal(rows.length, 0);
});

test('the sink builds sanitised event rows', () => {
  const { rows, queue } = fakeQueue();
  const sink = createSink(deps(queue));
  sink.track('Lesen.Done', { points: 20, text: 'y'.repeat(300), obj: { a: 1 } } as never);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].table, 'events');
  assert.deepEqual(rows[0].row, {
    install_id: 'install-1234',
    name: 'lesen.done',
    props: { points: 20, text: 'y'.repeat(100) },
    app_version: '9.9.9',
    path: 'lesen',
  });
});

test('errors are deduplicated and capped per session', () => {
  const { rows, queue } = fakeQueue();
  const sink = createSink(deps(queue));
  sink.error(new TypeError('same'), 'ctx');
  sink.error(new TypeError('same'), 'ctx');
  assert.equal(rows.length, 1);
  assert.equal(rows[0].row.message, 'TypeError: same');
  for (let i = 0; i < 50; i++) sink.error(`error ${i}`);
  assert.equal(rows.length, MAX_ERRORS_PER_SESSION);
  sink.error({ message: 'x'.repeat(2000) });
  assert.equal(rows.length, MAX_ERRORS_PER_SESSION);
});

test('error rows are truncated', () => {
  const { rows, queue } = fakeQueue();
  const sink = createSink(deps(queue));
  const err = new Error('m'.repeat(900));
  err.stack = 's'.repeat(9000);
  sink.error(err, 'c'.repeat(300));
  const row = rows[0].row as Record<string, string>;
  assert.equal(row.message.length, 500);
  assert.equal(row.stack.length, 4000);
  assert.equal(row.context.length, 100);
});

test('the queue drops the oldest items beyond its cap', () => {
  const q = new EventQueue<number>({ send: async () => true, maxSize: 5 });
  for (let i = 0; i < 12; i++) q.push(i);
  assert.equal(q.size, 5);
  assert.equal(q.dropped, 7);
});

test('the queue sends in batches and empties on success', async () => {
  const sent: number[][] = [];
  const q = new EventQueue<number>({ send: async (b) => (sent.push(b), true), batchSize: 4 });
  for (let i = 0; i < 10; i++) q.push(i);
  await q.flush();
  assert.deepEqual(sent, [[0, 1, 2, 3], [4, 5, 6, 7], [8, 9]]);
  assert.equal(q.size, 0);
});

test('a failing batch is retried, then dropped after maxRetries', async () => {
  let calls = 0;
  const q = new EventQueue<number>({ send: async () => (calls++, false), batchSize: 2, maxRetries: 3 });
  q.push(1);
  q.push(2);
  q.push(3);
  await q.flush();
  await q.flush();
  assert.equal(q.size, 3);
  await q.flush();
  assert.equal(calls, 3);
  assert.equal(q.size, 1);
  assert.equal(q.dropped, 2);
});

test('offline flushes count as failed attempts and never call send', async () => {
  let calls = 0;
  const q = new EventQueue<number>({ send: async () => (calls++, true), isOnline: () => false, maxRetries: 2 });
  q.push(1);
  await q.flush();
  await q.flush();
  assert.equal(calls, 0);
  assert.equal(q.size, 0);
});

test('a throwing sender never makes flush reject', async () => {
  const q = new EventQueue<number>({
    send: async () => {
      throw new Error('network');
    },
  });
  q.push(1);
  await q.flush();
  assert.equal(q.size, 1);
});

test('batches stay under the byte limit', async () => {
  const sent: string[][] = [];
  const q = new EventQueue<string>({ send: async (b) => (sent.push(b), true), batchSize: 20, maxBytes: 250 });
  for (let i = 0; i < 5; i++) q.push('x'.repeat(100));
  await q.flush();
  assert.deepEqual(
    sent.map((b) => b.length),
    [2, 2, 1],
  );
});
