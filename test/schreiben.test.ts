import { test } from 'node:test';
import assert from 'node:assert/strict';
import { writingPhrases, writingTasks } from '../src/content/schreiben.ts';
import { TOPICS } from '../src/content/topics.ts';
import {
  addressForms, countWords, detectAnrede, detectGruss, repeatedStarts, writingHints,
} from '../src/sections/schreiben/hints.ts';
import { CRITERIA, WRITING_GRADE_POINTS, suggestGrade, writingPoints } from '../src/sections/schreiben/criteria.ts';

test('there are 20 writing tasks with unique ids, 4 points and both registers', () => {
  assert.equal(writingTasks.length, 20);
  const ids = new Set(writingTasks.map((t) => t.id));
  assert.equal(ids.size, writingTasks.length);
  const topics = new Set(TOPICS.map((t) => t.id));
  for (const t of writingTasks) {
    assert.match(t.id, /^schreiben-\d\d$/);
    assert.ok(topics.has(t.topic), `${t.id} topic`);
    assert.equal(t.points.length, 4, t.id);
    assert.ok(t.points.every((p) => p.trim().length > 3), t.id);
    assert.ok(t.incoming.from && t.incoming.subject && t.incoming.body.length > 200, t.id);
  }
  const informal = writingTasks.filter((t) => t.register === 'informal').length;
  assert.ok(informal >= 8 && informal <= 12, `informal: ${informal}`);
  assert.ok(new Set(writingTasks.map((t) => t.topic)).size >= 10, 'spread over topics');
});

test('every model answer is a clean B1 e-mail by our own hints', () => {
  for (const t of writingTasks) {
    const n = countWords(t.model);
    assert.ok(n >= 115 && n <= 155, `${t.id}: ${n} words`);
    const problems = writingHints(t.model, t.register).filter((h) => !h.ok);
    assert.deepEqual(problems.map((p) => p.id), [], `${t.id}: ${problems.map((p) => p.text.de).join(' | ')}`);
    const anrede = detectAnrede(t.model);
    assert.equal(anrede.kind, t.register, `${t.id} Anrede`);
    const forms = addressForms(t.model);
    if (t.register === 'informal') assert.ok(forms.du > 0 && forms.sie === 0, t.id);
    else assert.ok(forms.sie > 0 && forms.du === 0, t.id);
  }
});

test('the phrase bank covers the functions the task needs, each with English', () => {
  const ids = writingPhrases.map((g) => g.id);
  for (const id of ['anrede-informell', 'anrede-halbformell', 'einleitung', 'bedanken', 'entschuldigen', 'vorschlag', 'bitten', 'gruende', 'konnektoren', 'schluss', 'gruss-informell', 'gruss-halbformell']) {
    assert.ok(ids.includes(id), id);
  }
  for (const g of writingPhrases) {
    assert.ok(g.label.de && g.label.en, g.id);
    assert.ok(g.phrases.length >= 3, g.id);
    for (const p of g.phrases) assert.ok(p.de.trim() && p.en.trim(), `${g.id}: ${p.de}`);
  }
  const konnektoren = writingPhrases.find((g) => g.id === 'konnektoren')!.phrases.map((p) => p.de).join(' ');
  for (const w of ['weil', 'Deshalb', 'obwohl', 'Trotzdem']) assert.ok(konnektoren.includes(w) || writingPhrases.some((g) => g.phrases.some((p) => p.de.includes(w))), w);
});

test('words are counted on letters and digits, not punctuation', () => {
  assert.equal(countWords(''), 0);
  assert.equal(countWords('  Hallo,  wie geht’s? – Gut!  '), 4);
  assert.equal(countWords('Am 14. Juni um 10 Uhr: B1-Prüfung.'), 7);
});

test('Anrede and Gruß are found and classified', () => {
  assert.deepEqual(detectAnrede('Liebe Jana,\nwie geht es dir?').kind, 'informal');
  assert.equal(detectAnrede('Hallo Tobias,').kind, 'informal');
  assert.equal(detectAnrede('Sehr geehrte Frau Becker,').kind, 'semiformal');
  assert.equal(detectAnrede('Liebe Frau Becker,').kind, 'semiformal');
  assert.equal(detectAnrede('Guten Tag Herr Wagner,').kind, 'semiformal');
  assert.equal(detectAnrede('Ich schreibe dir, weil …').found, false);

  assert.equal(detectGruss('…\n\nMit freundlichen Grüßen\nMaria').kind, 'semiformal');
  assert.equal(detectGruss('…\n\nLiebe Grüße\nMaria').kind, 'informal');
  assert.equal(detectGruss('…\n\nViele Grüße\nMaria').kind, 'neutral');
  assert.equal(detectGruss('…\nBis bald!\nDein Kemal').kind, 'informal');
  assert.equal(detectGruss('Ich komme am Samstag.').found, false);
});

test('du/Sie mixing is detected; sentence-initial "Sie" (she/they) is not counted', () => {
  assert.deepEqual(addressForms('Kannst du mir helfen? Ich danke dir.'), { du: 2, sie: 0 });
  assert.deepEqual(addressForms('Können Sie mir helfen? Ich danke Ihnen.'), { du: 0, sie: 2 });
  assert.deepEqual(addressForms('Meine Nachbarin hilft. Sie ist nett.'), { du: 0, sie: 0 });
  assert.deepEqual(addressForms('Dein Paul'), { du: 1, sie: 0 });
  const mixed = writingHints('Liebe Jana,\nkannst du mir helfen? Ich danke Ihnen sehr.\nViele Grüße', 'informal');
  assert.ok(mixed.some((h) => h.id === 'register' && !h.ok));
  const duToBoss = writingHints('Sehr geehrter Herr Wagner,\nkannst du morgen kommen?\nMit freundlichen Grüßen', 'semiformal');
  assert.ok(duToBoss.some((h) => h.id === 'register' && !h.ok));
});

test('missing or mismatched Anrede and Gruß give hints', () => {
  const none = writingHints('Ich komme gern. Bis dann.', 'informal');
  assert.ok(none.some((h) => h.id === 'anrede' && !h.ok));
  const tooFormal = writingHints('Sehr geehrte Frau Lang,\n…\nMit freundlichen Grüßen', 'informal');
  assert.ok(tooFormal.some((h) => h.id === 'anrede' && !h.ok));
  assert.ok(tooFormal.some((h) => h.id === 'gruss' && !h.ok));
  const casual = writingHints('Hallo Paul,\n…\nLiebe Grüße', 'semiformal');
  assert.ok(casual.some((h) => h.id === 'anrede' && !h.ok));
  assert.ok(casual.some((h) => h.id === 'gruss' && !h.ok));
  const noComma = writingHints('Liebe Jana\nwie geht es dir?\nViele Grüße', 'informal');
  assert.ok(noComma.some((h) => h.id === 'anrede-komma'));
});

test('repeated sentence starts are flagged', () => {
  const text = 'Ich komme am Samstag. Ich bringe Kuchen mit. Ich habe auch Zeit. Am Abend gehe ich.';
  assert.deepEqual(repeatedStarts(text), [{ word: 'ich', count: 3 }]);
  assert.deepEqual(repeatedStarts('Ich komme gern. Deshalb frage ich. Am Abend bin ich da. Ich freue mich.'), []);
  assert.ok(writingHints(text, 'informal').some((h) => h.id === 'starts-ich'));
});

test('length hints follow the 100–150 word target', () => {
  const len = (n: number) => writingHints(Array.from({ length: n }, () => 'Wort').join(' '), 'informal').find((h) => h.id === 'length')!;
  assert.equal(len(50).ok, false);
  assert.equal(len(95).ok, false);
  assert.equal(len(120).ok, true);
  assert.equal(len(170).ok, true);
  assert.equal(len(200).ok, false);
});

test('criterion grades map to telc points and suggestions follow the checklist', () => {
  assert.deepEqual([...WRITING_GRADE_POINTS], [15, 9, 3, 0]);
  assert.equal(writingPoints([0, 1, 2]), 27);
  const [c1, c2] = CRITERIA;
  assert.equal(suggestGrade(c1, ['I-situation', 'I-points'], 4), 0);
  assert.equal(suggestGrade(c1, ['I-situation', 'I-points'], 3), 1);
  assert.equal(suggestGrade(c1, ['I-situation'], 4), 1);
  assert.equal(suggestGrade(c1, ['I-points'], 4), 3, 'situation missed → D');
  assert.equal(suggestGrade(c2, c2.checks.map((c) => c.id), 0), 0);
  assert.equal(suggestGrade(c2, c2.checks.slice(0, 4).map((c) => c.id), 0), 1);
  assert.equal(suggestGrade(c2, [], 0), 3);
});
