import { test } from 'node:test';
import assert from 'node:assert/strict';
import { grade } from '../src/lib/srs.ts';
import {
  activeDays, answeredToday, recentActivity, recommend, streakDays, summarise, topicStrengths,
} from '../src/lib/insights.ts';
import { GENERAL, catalogueFor } from '../src/lib/questions.ts';
import type { QuestionProgress } from '../src/types.ts';

const DAY = 24 * 60 * 60 * 1000;
/** Midday, so shifting by whole days never crosses a boundary unexpectedly. */
const NOW = new Date('2026-03-15T12:00:00').getTime();

const answer = (
  progress: Record<number, QuestionProgress>,
  id: number,
  results: boolean[],
  at = NOW,
) => {
  results.forEach((ok, i) => {
    progress[id] = grade(progress[id], ok, at + i * 1000, 0);
  });
  return progress;
};

test('a summary counts every question exactly once', () => {
  const catalogue = catalogueFor('Berlin');
  const progress: Record<number, QuestionProgress> = {};
  answer(progress, catalogue[0].id, [true, true, true]);
  answer(progress, catalogue[1].id, [false]);

  const s = summarise(catalogue, progress, NOW);
  assert.equal(s.total, 310);
  const counted = Object.values(s.byLevel).reduce((a, b) => a + b, 0);
  assert.equal(counted, 310);
  assert.equal(s.seen, 2);
  assert.equal(s.byLevel.new, 308);
  assert.ok(s.overall > 0 && s.overall < 1);
  assert.equal(s.answers.correct, 3);
  assert.equal(s.answers.wrong, 1);
});

test('a wrong answer is immediately due again, a fresh correct one is not', () => {
  const catalogue = catalogueFor('Berlin');
  const progress: Record<number, QuestionProgress> = {};
  answer(progress, catalogue[0].id, [false]);
  answer(progress, catalogue[1].id, [true, true, true]);
  assert.equal(summarise(catalogue, progress, NOW).due, 1);
});

test('topic strength separates the topics that were practised', () => {
  const catalogue = catalogueFor('Berlin');
  const progress: Record<number, QuestionProgress> = {};
  for (const q of catalogue.filter((x) => x.topic === 'politik').slice(0, 6)) {
    answer(progress, q.id, [true, true, true]);
  }
  for (const q of catalogue.filter((x) => x.topic === 'geschichte').slice(0, 6)) {
    answer(progress, q.id, [false, false]);
  }
  const byTopic = new Map(topicStrengths(catalogue, progress, NOW).map((x) => [x.topic, x]));
  assert.ok(byTopic.get('politik')!.strength > byTopic.get('geschichte')!.strength);
  assert.equal(byTopic.get('geschichte')!.weak, 6);
  assert.equal(byTopic.get('gesellschaft')!.seen, 0);
  assert.equal(byTopic.get('gesellschaft')!.strength, 0);
});

test('topic strength rates what was practised, not how much of the topic is left', () => {
  const catalogue = catalogueFor('Berlin');
  const progress: Record<number, QuestionProgress> = {};
  // Same answers in both topics, but 'politik' is more than twice the size.
  for (const q of catalogue.filter((x) => x.topic === 'politik').slice(0, 6)) {
    answer(progress, q.id, [true, true, true]);
  }
  for (const q of catalogue.filter((x) => x.topic === 'geschichte').slice(0, 6)) {
    answer(progress, q.id, [true, true, true]);
  }
  const byTopic = new Map(topicStrengths(catalogue, progress, NOW).map((x) => [x.topic, x]));
  const politik = byTopic.get('politik')!;
  const geschichte = byTopic.get('geschichte')!;

  assert.ok(politik.total > geschichte.total, 'this test relies on the topics differing in size');
  assert.equal(
    Math.round(politik.strength * 1000),
    Math.round(geschichte.strength * 1000),
    'equal answers should give equal strength regardless of topic size',
  );
  assert.ok(politik.coverage < geschichte.coverage, 'coverage is what differs between them');
});

test('the weakest topic is the one answered worst, not the biggest one', () => {
  const catalogue = catalogueFor('Berlin');
  const progress: Record<number, QuestionProgress> = {};
  // The big topic is answered well; the small one badly.
  for (const q of catalogue.filter((x) => x.topic === 'politik').slice(0, 8)) {
    answer(progress, q.id, [true, true, true, true]);
  }
  for (const q of catalogue.filter((x) => x.topic === 'gesellschaft').slice(0, 8)) {
    answer(progress, q.id, [false, false]);
  }
  const topic = recommend(catalogue, progress, NOW).find((r) => r.kind === 'topic');
  assert.ok(topic, 'expected a topic recommendation');
  assert.equal(topic.topic, 'gesellschaft');
});

test('a fresh learner is pointed at new questions, not at repetitions', () => {
  const recs = recommend(catalogueFor('Berlin'), {}, NOW);
  assert.ok(recs.length > 0);
  assert.equal(recs[0].kind, 'new');
  assert.equal(recs[0].route, 'practice/all');
  assert.ok(!recs.some((r) => r.kind === 'due'));
});

test('due repetitions outrank everything else', () => {
  const catalogue = catalogueFor('Berlin');
  const progress: Record<number, QuestionProgress> = {};
  answer(progress, catalogue[0].id, [false]);
  const recs = recommend(catalogue, progress, NOW);
  assert.equal(recs[0].kind, 'due');
  assert.equal(recs[0].count, 1);
  assert.equal(recs[0].route, 'practice/due');
});

test('the weakest topic is named once enough of it has been answered', () => {
  const catalogue = catalogueFor('Berlin');
  const progress: Record<number, QuestionProgress> = {};
  for (const q of catalogue.filter((x) => x.topic === 'geschichte').slice(0, 8)) {
    answer(progress, q.id, [false, false], NOW - 30 * DAY);
  }
  for (const q of catalogue.filter((x) => x.topic === 'politik').slice(0, 8)) {
    answer(progress, q.id, Array(6).fill(true), NOW - 30 * DAY);
  }
  const topic = recommend(catalogue, progress, NOW).find((r) => r.kind === 'topic');
  assert.ok(topic, 'expected a topic recommendation');
  assert.equal(topic.topic, 'geschichte');
  assert.equal(topic.route, 'practice/geschichte');
});

test('a fully learned catalogue is sent to the exam instead', () => {
  const progress: Record<number, QuestionProgress> = {};
  for (const q of GENERAL) answer(progress, q.id, Array(6).fill(true));
  const recs = recommend(GENERAL, progress, NOW);
  assert.equal(recs.length, 1);
  assert.equal(recs[0].kind, 'exam');
  assert.equal(recs[0].route, 'exam');
});

test('at most three suggestions are offered', () => {
  const catalogue = catalogueFor('Berlin');
  const progress: Record<number, QuestionProgress> = {};
  for (const q of catalogue.slice(0, 40)) answer(progress, q.id, [false, false], NOW - 10 * DAY);
  assert.ok(recommend(catalogue, progress, NOW).length <= 3);
});

test('a streak counts consecutive days and survives a day not yet practised', () => {
  const progress: Record<number, QuestionProgress> = {};
  answer(progress, 1, [true], NOW - 2 * DAY);
  answer(progress, 2, [true], NOW - 1 * DAY);
  assert.equal(activeDays(progress).size, 2);
  assert.equal(streakDays(progress, NOW), 2, 'yesterday still counts before today is used');
  answer(progress, 3, [true], NOW);
  assert.equal(streakDays(progress, NOW), 3);
});

test('a missed day breaks the streak', () => {
  const progress: Record<number, QuestionProgress> = {};
  answer(progress, 1, [true], NOW - 5 * DAY);
  answer(progress, 2, [true], NOW - 4 * DAY);
  assert.equal(streakDays(progress, NOW), 0);
});

test('no practice at all is a streak of zero', () => {
  assert.equal(streakDays({}, NOW), 0);
});

test("today's answers are counted for the daily goal", () => {
  const progress: Record<number, QuestionProgress> = {};
  answer(progress, 1, [true, false], NOW);
  answer(progress, 2, [true], NOW - 3 * DAY);
  assert.equal(answeredToday(progress, NOW), 2);
});

test('activity covers a fixed window ending today', () => {
  const progress: Record<number, QuestionProgress> = {};
  answer(progress, 1, [true], NOW);
  answer(progress, 2, [true, true], NOW - 3 * DAY);
  answer(progress, 3, [true], NOW - 90 * DAY);

  const activity = recentActivity(progress, 14, NOW);
  assert.equal(activity.length, 14);
  assert.equal(activity.at(-1)!.count, 1, 'today is the last bucket');
  assert.equal(activity.at(-4)!.count, 2);
  assert.equal(activity.reduce((a, b) => a + b.count, 0), 3, 'old answers fall outside the window');
  for (let i = 1; i < activity.length; i++) {
    assert.ok(activity[i].day > activity[i - 1].day, 'buckets run oldest to newest');
  }
});
