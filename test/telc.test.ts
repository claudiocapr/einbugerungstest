import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ITEM_COUNT, PARTS, parseKey, scoreSheet, type AnswerKey } from '../src/sections/telc/sheet.ts';
// Plain JavaScript module shared with the upload workflow (scripts/telc/upload.mjs).
import { describeKey, pairsOnPage, parseAnswerKey } from '../scripts/telc/key-parser.mjs';

/** A made-up key in the right format (not telc's): the first allowed option everywhere. */
function fakeKey(): AnswerKey {
  const key: AnswerKey = {};
  for (const part of PARTS) for (let n = part.from; n <= part.to; n++) key[String(n)] = part.options[n % part.options.length];
  return key;
}

test('the sheet has 60 items with the right controls and telc weighting', () => {
  const sizes = PARTS.map((p) => [p.id, p.to - p.from + 1, p.options.length, p.points]);
  assert.deepEqual(sizes, [
    ['lesen1', 5, 10, 5],
    ['lesen2', 5, 3, 5],
    ['lesen3', 10, 13, 2.5],
    ['sb1', 10, 3, 1.5],
    ['sb2', 10, 15, 1.5],
    ['hoeren1', 5, 2, 5],
    ['hoeren2', 10, 2, 2.5],
    ['hoeren3', 5, 2, 5],
  ]);
  assert.ok(PARTS.find((p) => p.id === 'lesen3')!.options.includes('x'));
  const max = scoreSheet({}, fakeKey());
  assert.equal(max.total, ITEM_COUNT);
  assert.equal(max.maxPoints, 180);
  assert.deepEqual(max.subtests, {
    lesen: { points: 0, maxPoints: 75 },
    sprachbausteine: { points: 0, maxPoints: 30 },
    hoeren: { points: 0, maxPoints: 75 },
  });
});

test('a perfect sheet scores 180 points', () => {
  const key = fakeKey();
  const s = scoreSheet({ ...key }, key);
  assert.equal(s.correct, 60);
  assert.equal(s.points, 180);
  assert.equal(s.answered, 60);
});

test('points follow the per-part weighting', () => {
  const key = fakeKey();
  const wrong = (n: number) => (key[n] === 'a' ? 'b' : 'a');
  const answers = { ...key };
  answers['1'] = wrong(1); // Lesen 1: -5
  answers['11'] = wrong(11); // Lesen 3: -2.5
  answers['21'] = wrong(21); // SB 1: -1.5
  answers['35'] = wrong(35); // SB 2: -1.5
  answers['41'] = key['41'] === '+' ? '-' : '+'; // Hören 1: -5
  delete answers['50']; // Hören 2 unanswered: -2.5
  const s = scoreSheet(answers, key);
  assert.equal(s.points, 180 - 5 - 2.5 - 1.5 - 1.5 - 5 - 2.5);
  assert.equal(s.correct, 54);
  assert.equal(s.answered, 59);
  assert.deepEqual(s.items['50'], { given: null, expected: key['50'], ok: false });
  assert.equal(s.parts.find((p) => p.id === 'sb2')!.points, 13.5);
});

test('richtig/falsch marks are accepted in several spellings', () => {
  const key = fakeKey();
  const s = scoreSheet({ '41': key['41'] === '+' ? 'richtig' : 'falsch', '42': key['42'] === '+' ? 'R' : '–' }, key);
  assert.equal(s.items['41'].ok, true);
  assert.equal(s.items['42'].ok, true);
});

test('a key is only accepted when all 60 items carry a valid mark', () => {
  const key = fakeKey();
  assert.deepEqual(parseKey(key), key);
  assert.equal(parseKey({ ...key, '60': 'c' }), null);
  assert.equal(parseKey({ ...key, '3': 'z' }), null);
  const missing = { ...key } as Record<string, string>;
  delete missing['17'];
  assert.equal(parseKey(missing), null);
  assert.equal(parseKey(null), null);
  assert.equal(parseKey([1, 2]), null);
  // "–" (en dash) and "richtig" are normalised.
  assert.equal(parseKey({ ...key, '41': '–', '42': 'richtig' })!['41'], '-');
});

// ---------------------------------------------------------------- key parser (synthetic text, not telc's)

function syntheticPages(): string[] {
  const lines: string[] = ['41', 'Musterprüfung', 'Teil A'];
  const answer = (n: number) =>
    n <= 5 ? 'abcdefghij'[n] : n <= 10 ? 'abc'[n % 3] : n <= 20 ? (n % 4 === 0 ? 'x' : 'abcdefghijkl'[n % 12]) : n <= 30 ? 'abc'[n % 3] : n <= 40 ? 'abcdefghijklmno'[n % 15] : n % 2 ? '+' : '–';
  for (let n = 1; n <= 60; n++) {
    if (n === 1 || n === 21 || n === 41) lines.push(`Abschnitt ${n}`);
    lines.push(`${n} ${answer(n)}`);
  }
  lines.push('L ö s u n g s s c h l ü s s e l');
  return [
    'Inhalt\nLösungsschlüssel ______________ 41\n1 a\n2 b',
    'Ein Übungstext mit 3 b und 10 a Fallen\n12 x\n13 a',
    lines.join('\n'),
    'Hörtexte\n41\nTranskript …\n42\nnoch einer',
  ];
}

test('the key parser reads all 60 items from the key page', () => {
  const result = parseAnswerKey(syntheticPages());
  assert.equal(result.found, 60);
  assert.equal(result.page, 3);
  assert.deepEqual(result.missing, []);
  assert.deepEqual(result.invalid, []);
  assert.equal(result.key['4'], 'e');
  assert.equal(result.key['12'], 'x');
  assert.equal(result.key['41'], '+');
  assert.equal(result.key['42'], '-');
  // The parsed key is exactly what the app accepts.
  assert.ok(parseKey(result.key));
  assert.match(describeKey(result), /^60\/60 items/);
  assert.doesNotMatch(describeKey(result), /"\d+":/);
});

test('the key parser also takes one text with page markers', () => {
  const text = syntheticPages()
    .map((p, i) => `==== PAGE ${i + 1} ====\n${p}`)
    .join('\n');
  assert.equal(parseAnswerKey(text).found, 60);
});

test('the key parser reports missing and invalid items', () => {
  const pages = syntheticPages();
  pages[2] = pages[2].replace(/^7 .*$/m, '7 z').replace(/^59 .*$/m, '');
  const result = parseAnswerKey(pages);
  assert.equal(result.found, 58);
  assert.deepEqual(result.missing, [7, 59]);
  assert.match(describeKey(result), /missing 7,59/);
});

test('several pairs on one line are read; prose is ignored', () => {
  assert.deepEqual(pairsOnPage('1 a 2 b 3 –\nIm Jahr 2000 a war\n44 +'), [
    [1, 'a'],
    [2, 'b'],
    [3, '-'],
    [44, '+'],
  ]);
});

test('no key page gives an empty result', () => {
  const result = parseAnswerKey(['nothing here', 'still nothing']);
  assert.equal(result.found, 0);
  assert.equal(result.missing.length, 60);
});
