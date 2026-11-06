import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { DrillResult } from '../src/types.ts';
import {
  FIRST_NUMBER, ITEM_COUNT, ITEM_POINTS, OBJ_PARTS, PART_MAX, PASS_ORAL, PASS_WRITTEN, TOTAL_MAX, WRITTEN_MAX, ORAL_MAX,
  answerKey, gradeFor, lesen3X, markPart, partPoints, predictPass, scoreMock, speakingPoints, weakestPart, writingPoints,
  type PartScore,
} from '../src/sections/modelltest/score.ts';
import { assembleMock, doneSetIds, findSet, pickId, seededRandom, splitGaps } from '../src/sections/modelltest/assemble.ts';
import { newMock, partScoresOf, readMock, readSection } from '../src/sections/modelltest/state.ts';
import { emptyContent, fixtureContent, hoeren1Fixture, hoeren2Fixture, lesen1Fixture, lesen3Fixture, sb2Fixture } from './fixtures/content.ts';

const full = (part: keyof typeof PART_MAX, share = 1): PartScore => ({ part, points: PART_MAX[part] * share, max: PART_MAX[part] });
const allWritten = (share: number) =>
  (['lesen1', 'lesen2', 'lesen3', 'sb1', 'sb2', 'hoeren1', 'hoeren2', 'hoeren3', 'schreiben'] as const).map((p) => full(p, share));
const allOral = (share: number) => (['sprechen1', 'sprechen2', 'sprechen3'] as const).map((p) => full(p, share));

test('the weighting adds up to telc’s 225 + 75 = 300', () => {
  for (const p of OBJ_PARTS) assert.equal(ITEM_COUNT[p] * ITEM_POINTS[p], PART_MAX[p], p);
  const written = OBJ_PARTS.reduce((s, p) => s + PART_MAX[p], 0) + PART_MAX.schreiben;
  assert.equal(written, WRITTEN_MAX);
  assert.equal(PART_MAX.sprechen1 + PART_MAX.sprechen2 + PART_MAX.sprechen3, ORAL_MAX);
  assert.equal(WRITTEN_MAX + ORAL_MAX, TOTAL_MAX);
  assert.equal(PASS_WRITTEN, 135);
  assert.equal(PASS_ORAL, 45);
  assert.equal(OBJ_PARTS.reduce((s, p) => s + ITEM_COUNT[p], 0), 60);
  assert.equal(FIRST_NUMBER.hoeren3 + ITEM_COUNT.hoeren3 - 1, 60);
});

test('part points follow the per-item weights and are capped', () => {
  assert.equal(partPoints('lesen1', 3), 15);
  assert.equal(partPoints('lesen3', 7), 17.5);
  assert.equal(partPoints('sb1', 9), 13.5);
  assert.equal(partPoints('sb2', 10), 15);
  assert.equal(partPoints('hoeren2', 5), 12.5);
  assert.equal(partPoints('hoeren1', 99), 25);
  assert.equal(partPoints('lesen2', -2), 0);
});

test('answers are marked against the key, unanswered counts as wrong', () => {
  const l1 = lesen1Fixture('l1');
  assert.deepEqual(markPart('lesen1', l1, [2, 0, 7, 4, 9]), [true, true, true, true, true]);
  assert.deepEqual(markPart('lesen1', l1, [2, null, 1, 4]), [true, false, false, true, false]);

  const l3 = lesen3Fixture('l3');
  const key = answerKey('lesen3', l3);
  assert.equal(key[3], lesen3X(l3), 'the "x" situation is encoded as ads.length');
  assert.equal(key[3], 12);
  const answers = [...key];
  answers[3] = 0;
  assert.equal(markPart('lesen3', l3, answers).filter(Boolean).length, 9);

  const h1 = hoeren1Fixture('h1');
  assert.deepEqual(answerKey('hoeren1', h1), [0, 1, 0, 0, 1]);
  const h2 = hoeren2Fixture('h2');
  assert.equal(markPart('hoeren2', h2, answerKey('hoeren2', h2)).filter(Boolean).length, 10);

  const s2 = sb2Fixture('s2');
  assert.deepEqual(answerKey('sb2', s2).slice(0, 3), [14, 13, 12]);
});

test('writing and speaking self-assessments turn into telc points', () => {
  assert.equal(writingPoints([0, 0, 0]), 45);
  assert.equal(writingPoints([1, 1, 1]), 27);
  assert.equal(writingPoints([0, 2, 3]), 18);
  assert.equal(writingPoints([null, 0, undefined]), 15);

  assert.equal(speakingPoints(1, [0, 0, 0, 0]), 15);
  assert.equal(speakingPoints(2, [0, 0, 0, 0]), 30);
  assert.equal(speakingPoints(3, [0, 0, 0, 0]), 30);
  assert.equal(speakingPoints(2, [1, 1, 1, 1]), 22);
  assert.equal(speakingPoints(1, [3, 3, 3, 3]), 0);
  assert.equal(speakingPoints(1, [2, null, 1, 1]), 1 + 3 + 2);
});

test('grade bands match telc’s table', () => {
  assert.equal(gradeFor(300), 'sehr gut');
  assert.equal(gradeFor(270), 'sehr gut');
  assert.equal(gradeFor(269.5), 'gut');
  assert.equal(gradeFor(240), 'gut');
  assert.equal(gradeFor(239.5), 'befriedigend');
  assert.equal(gradeFor(210), 'befriedigend');
  assert.equal(gradeFor(209.5), 'ausreichend');
  assert.equal(gradeFor(180), 'ausreichend');
  assert.equal(gradeFor(179.5), 'nicht bestanden');
});

test('passing needs 60 % in the written AND in the oral exam, separately', () => {
  const both = scoreMock([...allWritten(0.6), ...allOral(0.6)]);
  assert.equal(both.written, 135);
  assert.equal(both.oral, 45);
  assert.equal(both.total, 180);
  assert.equal(both.passed, true);
  assert.equal(both.grade, 'ausreichend');
  assert.equal(both.complete, true);

  // A strong written result cannot make up for a weak oral one.
  const weakOral = scoreMock([...allWritten(1), ...allOral(0.5)]);
  assert.equal(weakOral.total, 262.5);
  assert.equal(weakOral.writtenPassed, true);
  assert.equal(weakOral.oralPassed, false);
  assert.equal(weakOral.passed, false);
  assert.equal(weakOral.grade, 'nicht bestanden');

  const justUnder = allWritten(0.6);
  justUnder[0] = { ...justUnder[0], points: justUnder[0].points - 2.5 };
  const under = scoreMock([...justUnder, ...allOral(1)]);
  assert.equal(under.written, 132.5);
  assert.equal(under.writtenPassed, false);
  assert.equal(under.passed, false);

  const top = scoreMock([...allWritten(1), ...allOral(1)]);
  assert.equal(top.total, 300);
  assert.equal(top.grade, 'sehr gut');
});

test('a skipped oral part leaves the result open instead of failing it', () => {
  const s = scoreMock(allWritten(0.8));
  assert.equal(s.written, 180);
  assert.equal(s.writtenPassed, true);
  assert.equal(s.oral, null);
  assert.equal(s.total, null);
  assert.equal(s.passed, null);
  assert.equal(s.grade, null);

  const failed = scoreMock(allWritten(0.4));
  assert.equal(failed.passed, false);
});

test('parts without content are left out of the maximum', () => {
  const s = scoreMock([full('schreiben', 0.6), full('lesen1', 0.6)]);
  assert.equal(s.writtenMax, 70);
  assert.equal(s.written, 42);
  assert.equal(s.writtenPassed, true);
  assert.equal(s.complete, false);
});

test('the weakest part is the one with the lowest share', () => {
  const w = weakestPart([full('lesen1', 0.8), full('sb1', 0.4), full('schreiben', 0.4)]);
  assert.equal(w?.part, 'schreiben', 'a tie goes to the part worth more');
  assert.equal(weakestPart([]), null);
});

const result = (part: DrillResult['part'], points: number, maxPoints: number, extra: Partial<DrillResult> = {}): DrillResult => ({
  section: 'x', part, correct: 0, total: 0, points, maxPoints, startedAt: 0, finishedAt: 0, ...extra,
});

test('the pass prediction needs data and names the part that drags it down', () => {
  assert.equal(predictPass([]).label, 'unknown');
  assert.equal(predictPass([result('lesen1', 25, 25)]).label, 'unknown');

  const good = predictPass([
    result('lesen1', 25, 25),
    result('lesen2', 20, 25),
    result('sb1', 13.5, 15),
    result('schreiben', 36, 45, { selfAssessed: true }),
  ]);
  assert.equal(good.written.known, 4);
  assert.equal(good.label, 'good');
  assert.ok(Math.abs(good.written.expected - 0.86 * 225) < 1);

  const drag = predictPass([
    result('lesen1', 25, 25),
    result('hoeren2', 5, 25),
    result('sb2', 15, 15),
    result('schreiben', 27, 45),
  ]);
  assert.equal(drag.drag?.part, 'hoeren2');

  // correct/total is used when points are missing; only the latest three per part count.
  const recent = predictPass([
    result('lesen3', NaN, 0, { points: undefined, maxPoints: undefined, correct: 5, total: 10 }),
    result('lesen3', 25, 25),
    result('lesen3', 25, 25),
    result('lesen3', 0, 25),
  ]);
  const l3 = recent.parts.find((p) => p.part === 'lesen3')!;
  assert.equal(l3.samples, 3);
  assert.ok(Math.abs((l3.ratio ?? 0) - (0.5 + 1 + 1) / 3) < 1e-9);

  const notyet = predictPass([result('lesen1', 5, 25), result('lesen2', 10, 25), result('schreiben', 15, 45)]);
  assert.equal(notyet.label, 'notyet');

  const oralWeak = predictPass([...['lesen1', 'lesen2', 'lesen3'].map((p) => result(p as 'lesen1', 25, 25)), result('sprechen2', 10, 30)]);
  assert.equal(oralWeak.written.label, 'good');
  assert.equal(oralWeak.oral.label, 'notyet');
  assert.equal(oralWeak.label, 'notyet');
});

test('the seeded generator is deterministic', () => {
  const a = seededRandom(42);
  const b = seededRandom(42);
  const xs = Array.from({ length: 5 }, () => a());
  assert.deepEqual(xs, Array.from({ length: 5 }, () => b()));
  assert.ok(xs.every((x) => x >= 0 && x < 1));
  assert.notDeepEqual(xs, Array.from({ length: 5 }, seededRandom(43)));
});

test('a mock takes one set per part, same seed same mock, unseen sets first', () => {
  const content = fixtureContent();
  const plan = assembleMock(content, new Set(), 7);
  assert.deepEqual(plan, assembleMock(content, new Set(), 7));
  for (const [key, id] of Object.entries(plan)) assert.ok(id?.startsWith(key), `${key}: ${id}`);

  const done = new Set(['lesen1-01', 'lesen1-02', 'hoeren2-01', 'hoeren2-03', 'schreiben-02', 'schreiben-03']);
  for (let seed = 0; seed < 30; seed++) {
    const p = assembleMock(content, done, seed);
    assert.equal(p.lesen1, 'lesen1-03');
    assert.equal(p.hoeren2, 'hoeren2-02');
    assert.equal(p.schreiben, 'schreiben-01');
  }

  // With everything done, any set may come back.
  const all = new Set(content.lesen2.map((s) => s.id));
  assert.ok(content.lesen2.some((s) => s.id === assembleMock(content, all, 3).lesen2));

  const seen = new Set(Array.from({ length: 40 }, (_, seed) => assembleMock(content, new Set(), seed).lesen3));
  assert.ok(seen.size > 1, 'different seeds pick different sets');
});

test('empty content gives an empty plan rather than an error', () => {
  const plan = assembleMock(emptyContent(), new Set(), 1);
  assert.ok(Object.values(plan).every((v) => v === null));
  assert.equal(pickId([], new Set(), Math.random), null);
  assert.equal(findSet(emptyContent(), 'lesen1', 'nope'), undefined);
  assert.equal(findSet(fixtureContent(), 'lesen1', 'lesen1-02')?.id, 'lesen1-02');
});

test('done set ids come from results of any section', () => {
  const done = doneSetIds([result('lesen1', 1, 1, { setId: 'lesen1-01' }), result(undefined, 0, 0), result('sb1', 1, 1, { setId: 'sb1-04' })]);
  assert.deepEqual([...done].sort(), ['lesen1-01', 'sb1-04']);
});

test('a stored mock survives a damaged or older save', () => {
  const plan = assembleMock(fixtureContent(), new Set(), 5);
  const mock = newMock(plan, 5, 1000);
  assert.deepEqual(readMock(JSON.parse(JSON.stringify(mock))), mock);
  assert.equal(readMock(null), null);
  assert.equal(readMock({ id: 3 }), null);
  const damaged = readMock({
    id: 'm', plan: { lesen1: 'x', sb1: 7 }, phase: 'nonsense', answers: { lesen1: [1, 'a', null] },
    writing: { text: 42, grades: [0, 9] }, scores: { lesen1: { points: 10, max: 25 }, bogus: { points: 1, max: 1 } },
  })!;
  assert.equal(damaged.phase, 'lesen');
  assert.equal(damaged.plan.lesen1, 'x');
  assert.equal(damaged.plan.sb1, null);
  assert.deepEqual(damaged.answers.lesen1, [1, null, null]);
  assert.equal(damaged.writing.text, '');
  assert.deepEqual(damaged.writing.grades, [0, null, null]);
  assert.deepEqual(partScoresOf(damaged), [{ part: 'lesen1', points: 10, max: 25 }]);
  assert.deepEqual(readSection('junk'), { current: null, last: null });
});

test('gapped texts split into text and gap numbers', () => {
  assert.deepEqual(splitGaps('Ich [1] gern, [2].'), ['Ich ', 1, ' gern, ', 2, '.']);
  assert.deepEqual(splitGaps('[10] Ende'), [10, ' Ende']);
  assert.deepEqual(splitGaps('keine Lücke'), ['keine Lücke']);
});
