import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hoeren1, hoeren2, hoeren3 } from '../src/content/hoeren.ts';
import { TOPICS } from '../src/content/topics.ts';
import type { Line, RfItem } from '../src/content/types.ts';
import {
  HOEREN_ITEM_COUNT,
  examPlan,
  hoerenEntries,
  hoerenItemId,
  quotes,
  relevantLines,
  rfChoiceIndex,
  scoreHoeren,
  scoreRf,
  type HoerenPart,
  type HoerenSet,
} from '../src/sections/hoeren/score.ts';

const PARTS: [HoerenPart, HoerenSet[]][] = [
  [1, hoeren1],
  [2, hoeren2],
  [3, hoeren3],
];
const topicIds = new Set(TOPICS.map((t) => t.id));
const VOICES = new Set(['a', 'b', 'n']);

const words = (lines: Line[]) => lines.map((l) => l.text).join(' ').split(/\s+/).filter(Boolean).length;

function checkScript(script: Line[], where: string) {
  assert.ok(script.length > 0, `${where}: empty script`);
  for (const line of script) {
    assert.ok(VOICES.has(line.voice), `${where}: bad voice ${line.voice}`);
    assert.ok(line.text.trim().length > 0, `${where}: empty line`);
    assert.ok(!/\d/.test(line.text), `${where}: digits in a spoken line (write numbers as words): ${line.text}`);
  }
}

function checkItem(item: RfItem, script: Line[], where: string) {
  assert.ok(item.statement.trim().length > 0, `${where}: empty statement`);
  assert.equal(typeof item.answer, 'boolean', `${where}: answer`);
  assert.ok(item.explanation.de.trim().length > 0, `${where}: explanation.de`);
  assert.ok(item.explanation.en.trim().length > 0, `${where}: explanation.en`);
  // The explanation quotes the script, so the results can highlight the line.
  assert.ok(quotes(item.explanation.de).length > 0, `${where}: explanation quotes nothing`);
  assert.ok(relevantLines(script, item.explanation).length > 0, `${where}: quote not found in script: ${item.explanation.de}`);
  // A statement paraphrases; it does not repeat a whole line word for word.
  const statement = item.statement.toLowerCase().replace(/[.!?]$/, '');
  for (const line of script) assert.ok(!line.text.toLowerCase().includes(statement), `${where}: statement copies the script`);
}

test('there are eight sets per Hören part with the exam counts', () => {
  for (const [part, sets] of PARTS) {
    assert.equal(sets.length, 8, `Teil ${part}`);
    for (const set of sets) {
      assert.ok(topicIds.has(set.topic), `${set.id}: topic ${set.topic}`);
      assert.equal(hoerenEntries(part, set).length, HOEREN_ITEM_COUNT[part], `${set.id}: item count`);
      assert.ok(set.id.startsWith(`hoeren${part}-`), `${set.id}: id prefix`);
    }
  }
});

test('set ids are unique', () => {
  const ids = PARTS.flatMap(([, sets]) => sets.map((s) => s.id));
  assert.equal(new Set(ids).size, ids.length);
});

test('every script is non-empty, uses valid voices and has no digits', () => {
  for (const [part, sets] of PARTS)
    for (const set of sets) hoerenEntries(part, set).forEach((e, i) => checkScript(e.script, `${set.id}#${i + 1}`));
});

test('script lengths match the exam format', () => {
  for (const set of hoeren2) {
    const w = words(set.script);
    assert.ok(w >= 380 && w <= 650, `${set.id}: ${w} words`);
    assert.ok(new Set(set.script.map((l) => l.voice)).size >= 2, `${set.id}: needs two speakers`);
    assert.ok(set.title.trim().length > 0);
  }
  for (const [part, sets] of [[1, hoeren1], [3, hoeren3]] as const)
    for (const set of sets)
      for (const [i, e] of set.items.entries()) {
        const w = words(e.script.filter((l) => l.voice !== 'n'));
        assert.ok(w >= 25 && w <= 95, `Teil ${part} ${set.id}#${i + 1}: ${w} words`);
      }
});

test('statements are complete, bilingual and point at a line of the script', () => {
  for (const [part, sets] of PARTS)
    for (const set of sets) hoerenEntries(part, set).forEach((e, i) => checkItem(e.item, e.script, `${set.id}#${i + 1}`));
});

test('richtig and falsch are balanced in every part (30–70 %)', () => {
  for (const [part, sets] of PARTS) {
    const items = sets.flatMap((s) => hoerenEntries(part, s).map((e) => e.item));
    const share = items.filter((i) => i.answer).length / items.length;
    assert.ok(share >= 0.3 && share <= 0.7, `Teil ${part}: ${Math.round(share * 100)} % richtig`);
    for (const set of sets) {
      const n = hoerenEntries(part, set).filter((e) => e.item.answer).length;
      assert.ok(n > 0 && n < HOEREN_ITEM_COUNT[part], `${set.id}: all answers the same`);
    }
  }
});

test('scoreRf counts correct answers and treats blanks as wrong', () => {
  const items: RfItem[] = [true, false, true, false].map((answer) => ({
    statement: 's',
    answer,
    explanation: { de: 'x', en: 'x' },
  }));
  const s = scoreRf(items, [true, true, null, false], 2.5);
  assert.deepEqual(s.perItem, [true, false, false, true]);
  assert.equal(s.correct, 2);
  assert.equal(s.total, 4);
  assert.equal(s.points, 5);
  assert.equal(s.maxPoints, 10);
  assert.equal(scoreRf(items, []).correct, 0);
});

test('scoreHoeren gives 25 telc points for a perfect set in every part', () => {
  for (const [part, sets] of PARTS) {
    const set = sets[0];
    const perfect = hoerenEntries(part, set).map((e) => e.item.answer);
    const s = scoreHoeren(part, set, perfect);
    assert.equal(s.points, 25);
    assert.equal(s.maxPoints, 25);
    const allWrong = perfect.map((a) => !a);
    assert.equal(scoreHoeren(part, set, allWrong).points, 0);
  }
});

test('item ids and choice indexes', () => {
  assert.equal(hoerenItemId(2, 'hoeren2-03', 7), 'hoeren2:hoeren2-03:7');
  assert.equal(rfChoiceIndex(true), 0);
  assert.equal(rfChoiceIndex(false), 1);
  assert.equal(rfChoiceIndex(null), -1);
});

test('relevantLines prefers full quotes over single words', () => {
  const script: Line[] = [
    { voice: 'a', text: 'Ich esse inzwischen weniger Fleisch.' },
    { voice: 'b', text: 'Inzwischen ist alles anders.' },
  ];
  assert.deepEqual(relevantLines(script, '„Ich esse inzwischen weniger“ – „inzwischen“ heißt …'), [0]);
  assert.deepEqual(relevantLines(script, '„inzwischen“'), [0, 1]);
  assert.deepEqual(relevantLines(script, 'kein Zitat'), []);
});

test('the exam plan plays Teil 1 once, Teil 2 and 3 twice', () => {
  const speaks = (part: HoerenPart, set: HoerenSet) => examPlan(part, set).filter((s) => s.kind === 'speak');
  assert.equal(speaks(1, hoeren1[0]).length, 5);
  assert.equal(speaks(2, hoeren2[0]).length, 2);
  assert.equal(speaks(3, hoeren3[0]).length, 10);
  const t3 = speaks(3, hoeren3[0]);
  assert.deepEqual(
    t3.map((s) => (s.kind === 'speak' ? `${s.item}/${s.pass}` : '')),
    ['0/1', '0/2', '1/1', '1/2', '2/1', '2/2', '3/1', '3/2', '4/1', '4/2'],
  );
});
