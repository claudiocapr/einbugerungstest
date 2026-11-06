import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sprechen1, sprechen2, sprechen3, sprechenPhrases } from '../src/content/sprechen.ts';
import { TOPICS } from '../src/content/topics.ts';
import type { Line } from '../src/content/types.ts';
import {
  CRITERIA,
  SPRECHEN_MAX_POINTS,
  TASK_CHECKS,
  criterionPoints,
  speakingScore,
  sprechenExamPart,
  type SelfRating,
} from '../src/sections/sprechen/score.ts';

const topicIds = new Set(TOPICS.map((t) => t.id));
const words = (s: string) => s.split(/\s+/).filter(Boolean).length;

function checkModel(model: Line[], where: string, minLines = 10) {
  assert.ok(model.length >= minLines, `${where}: model too short (${model.length} lines)`);
  const voices = new Set(model.map((l) => l.voice));
  assert.ok(voices.has('a') && voices.has('b'), `${where}: both candidates speak`);
  for (const l of model) {
    assert.ok(['a', 'b', 'n'].includes(l.voice), `${where}: voice ${l.voice}`);
    assert.ok(l.text.trim().length > 0, `${where}: empty line`);
    assert.ok(!/\d/.test(l.text), `${where}: digits in a spoken line: ${l.text}`);
  }
}

test('twelve tasks per Sprechen part, unique ids', () => {
  assert.equal(sprechen1.length, 12);
  assert.equal(sprechen2.length, 12);
  assert.equal(sprechen3.length, 12);
  const ids = [...sprechen1, ...sprechen2, ...sprechen3].map((t) => t.id);
  assert.equal(new Set(ids).size, ids.length);
  sprechen1.forEach((t) => assert.match(t.id, /^sprechen1-\d\d$/));
  sprechen2.forEach((t) => assert.match(t.id, /^sprechen2-\d\d$/));
  sprechen3.forEach((t) => assert.match(t.id, /^sprechen3-\d\d$/));
});

test('Teil 1 cards have the leading points, extra questions and a model dialogue', () => {
  for (const card of sprechen1) {
    assert.ok(card.points.length >= 6, card.id);
    card.points.forEach((p) => assert.ok(p.trim(), card.id));
    assert.ok(card.extraQuestions.length >= 1, card.id);
    card.extraQuestions.forEach((q) => assert.ok(q.trim().endsWith('?') || q.trim().endsWith('.'), `${card.id}: ${q}`));
    checkModel(card.model, card.id);
  }
});

test('Teil 2 tasks have a theme, two different opinion texts of 80–120 words and a model', () => {
  for (const task of sprechen2) {
    assert.ok(topicIds.has(task.topic), task.id);
    assert.ok(task.theme.trim(), task.id);
    for (const side of [task.a, task.b]) {
      assert.ok(side.person.trim(), `${task.id}: person`);
      const w = words(side.text);
      assert.ok(w >= 80 && w <= 120, `${task.id}: ${w} words`);
    }
    assert.notEqual(task.a.text, task.b.text);
    assert.notEqual(task.a.person, task.b.person);
    checkModel(task.model, task.id);
  }
});

test('Teil 3 tasks have a situation, a checklist and a model planning dialogue', () => {
  for (const task of sprechen3) {
    assert.ok(topicIds.has(task.topic), task.id);
    assert.ok(words(task.situation) >= 15, `${task.id}: situation`);
    assert.ok(task.checklist.length >= 4, `${task.id}: checklist`);
    task.checklist.forEach((c) => assert.ok(c.trim(), task.id));
    checkModel(task.model, task.id);
  }
});

test('phrase groups cover the needed purposes, each phrase with English', () => {
  const ids = sprechenPhrases.map((g) => g.id);
  for (const needed of ['meinung', 'zustimmen', 'widersprechen', 'nachfragen', 'vorschlagen', 'annehmen', 'ablehnen', 'einigen', 'zeit', 'erfahrung', 'zusammenfassen'])
    assert.ok(ids.includes(needed), needed);
  assert.equal(new Set(ids).size, ids.length);
  for (const g of sprechenPhrases) {
    assert.ok(g.label.de.trim() && g.label.en.trim(), g.id);
    assert.ok(g.phrases.length >= 4, g.id);
    for (const p of g.phrases) assert.ok(p.de.trim() && p.en.trim(), `${g.id}: ${p.de}`);
  }
});

test('self-assessment uses the telc bands: 15 points for Teil 1, 30 for Teil 2 and 3', () => {
  const best: SelfRating = { ausdruck: 'A', aufgabe: 'A', formal: 'A', aussprache: 'A' };
  const worst: SelfRating = { ausdruck: 'D', aufgabe: 'D', formal: 'D', aussprache: 'D' };
  for (const part of [1, 2, 3] as const) {
    assert.deepEqual(speakingScore(part, best), { points: SPRECHEN_MAX_POINTS[part], maxPoints: SPRECHEN_MAX_POINTS[part], complete: true });
    assert.equal(speakingScore(part, worst).points, 0);
  }
  assert.equal(SPRECHEN_MAX_POINTS[1] + SPRECHEN_MAX_POINTS[2] + SPRECHEN_MAX_POINTS[3], 75);
  assert.equal(criterionPoints(1, 'ausdruck', 'B'), 3);
  assert.equal(criterionPoints(2, 'ausdruck', 'B'), 6);
  assert.equal(criterionPoints(3, 'aussprache', 'B'), 4);
  assert.equal(criterionPoints(1, 'formal', 'C'), 1);
  const partial = speakingScore(2, { ausdruck: 'A', aufgabe: 'B' });
  assert.equal(partial.points, 14);
  assert.equal(partial.complete, false);
  assert.equal(CRITERIA.length, 4);
  assert.equal(sprechenExamPart(3), 'sprechen3');
  for (const part of [1, 2, 3] as const) assert.ok(TASK_CHECKS[part].length >= 3);
});
