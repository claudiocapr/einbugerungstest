import { test } from 'node:test';
import assert from 'node:assert/strict';
import { vocab } from '../src/content/wortschatz.ts';
import { TOPICS } from '../src/content/topics.ts';

const ID = /^([a-z]+)-(\d{3})$/;

test('there are at least 2,400 entries (the full B1 inventory)', () => {
  assert.ok(vocab.length >= 2400, `only ${vocab.length} entries`);
});

test('ids are unique, well-formed and match the topic', () => {
  const seen = new Set<string>();
  for (const e of vocab) {
    const m = ID.exec(e.id);
    assert.ok(m, `bad id ${e.id}`);
    assert.equal(m![1], e.topic, `${e.id} is filed under ${e.topic}`);
    assert.ok(!seen.has(e.id), `duplicate id ${e.id}`);
    seen.add(e.id);
  }
});

test('every topic has at least 30 entries', () => {
  for (const t of TOPICS) {
    const count = vocab.filter((e) => e.topic === t.id).length;
    assert.ok(count >= 30, `${t.id} has only ${count}`);
  }
  const known = new Set(TOPICS.map((t) => t.id));
  for (const e of vocab) assert.ok(known.has(e.topic), `${e.id}: unknown topic ${e.topic}`);
});

test('no entry has an empty field', () => {
  for (const e of vocab) {
    for (const key of ['de', 'en', 'example', 'exampleEn'] as const) {
      assert.ok(e[key].trim().length > 0, `${e.id}: empty ${key}`);
      assert.equal(e[key], e[key].trim(), `${e.id}: ${key} has stray whitespace`);
    }
    assert.match(e.example, /[.!?“]$/, `${e.id}: example should be a full sentence`);
  }
});

test('nouns have an article and a plural; other words do not', () => {
  for (const e of vocab) {
    if (e.pos === 'noun') {
      assert.ok(e.article === 'der' || e.article === 'die' || e.article === 'das', `${e.id}: article`);
      assert.ok(e.plural && e.plural.length > 0, `${e.id}: plural missing`);
      assert.ok(e.plural === '-' || /^[A-ZÄÖÜ]/.test(e.plural), `${e.id}: plural "${e.plural}" should be "-" or a capitalised noun without article`);
      assert.match(e.de, /^[A-ZÄÖÜ]/, `${e.id}: noun should be capitalised`);
    } else {
      assert.equal(e.article, undefined, `${e.id}: only nouns take an article`);
      assert.equal(e.plural, undefined, `${e.id}: only nouns take a plural`);
    }
  }
});

test('verbs list present, Präteritum and Perfekt with the right auxiliary', () => {
  for (const e of vocab.filter((x) => x.pos === 'verb')) {
    assert.ok(e.forms, `${e.id}: forms missing`);
    const parts = e.forms!.split(',').map((s) => s.trim());
    assert.equal(parts.length, 3, `${e.id}: expected 3 forms, got "${e.forms}"`);
    assert.match(parts[2], /^(hat|ist) /, `${e.id}: Perfekt should start with hat/ist`);
    if (e.de.startsWith('sich ')) assert.match(parts[2], /^hat sich /, `${e.id}: reflexive verbs take "hat sich"`);
  }
  for (const e of vocab.filter((x) => x.pos !== 'verb')) {
    assert.equal(e.forms, undefined, `${e.id}: only verbs carry forms`);
  }
});

test('a government names a case or preposition pattern', () => {
  for (const e of vocab.filter((x) => x.government)) {
    assert.match(e.government!, /\+ (Akk|Dat|Nom)/, `${e.id}: government "${e.government}"`);
  }
});

const STOP = new Set(['dass', 'bitte', 'sich', 'haben', 'sein', 'ihnen', 'mich', 'dich']);
const stem = (word: string) => {
  const w = word.toLowerCase();
  return w.slice(0, Math.max(3, w.length - 2));
};
const words = (text: string) => text.toLowerCase().match(/[a-zäöüß]+/g) ?? [];

function exampleUsesEntry(e: (typeof vocab)[number]): boolean {
  const ex = e.example.toLowerCase();
  if (e.pos === 'phrase' || /\s/.test(e.de.replace(/^sich /, ''))) {
    const content = words(e.de).filter((w) => w.length >= 4 && !STOP.has(w));
    if (content.length === 0) return true;
    return content.some((w) => ex.includes(w.slice(0, 4)));
  }
  const candidates = [stem(e.de.replace(/^sich /, ''))];
  if (e.plural && e.plural !== '-') candidates.push(stem(e.plural));
  if (e.forms) {
    for (const token of words(e.forms)) {
      if (token === 'sich' || token === 'hat' || token === 'ist') continue;
      candidates.push(stem(token));
    }
  }
  return candidates.some((c) => ex.includes(c));
}

test('each example sentence uses its word (loose stem check)', () => {
  const misses = vocab.filter((e) => !exampleUsesEntry(e)).map((e) => `${e.id} ${e.de}: ${e.example}`);
  assert.deepEqual(misses, []);
});

test('no word appears twice with the same part of speech', () => {
  const seen = new Map<string, string>();
  for (const e of vocab) {
    const key = `${e.de.toLowerCase()}|${e.pos}`;
    assert.ok(!seen.has(key), `${e.id} duplicates ${seen.get(key)} (${e.de})`);
    seen.set(key, e.id);
  }
});

test('examples are not repeated', () => {
  const seen = new Map<string, string>();
  for (const e of vocab) {
    assert.ok(!seen.has(e.example), `${e.id} repeats the example of ${seen.get(e.example)}`);
    seen.set(e.example, e.id);
  }
});
