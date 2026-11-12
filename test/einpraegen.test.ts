import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CASES, DETS, GENDERS, PERSONS, PP, REFL, type Case, detForm } from '../src/content/grammatik/forms.ts';
import { AKK_VERBS, DAT_AKK_VERBS, DAT_VERBS, NOM_VERBS, PREPS, triggerCase } from '../src/content/grammatik/rules.ts';
import {
  MERK_ROUND,
  MERK_SETS,
  PREP_KIND_LABEL,
  VERB_CASE_ITEMS,
  VERB_CASE_NAME,
  VERB_TIP_GROUPS,
  VPREP_ITEMS,
  VPREP_TIP_GROUPS,
  fehlerIds,
  idsForSet,
  merkExists,
  merkId,
  merkQuestion,
  merkStats,
  pairText,
  parseGovernment,
  parseMerkId,
  pickMerkIds,
  sitzt,
} from '../src/content/grammatik/merken.ts';
import { vocab } from '../src/content/wortschatz.ts';
import { grade } from '../src/lib/srs.ts';
import type { ItemProgress } from '../src/types.ts';

function seeded(seed = 7) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/* ------------------------------------------------ form checks from the tables */

const CONTRACTED: Record<string, { prep: string; c: Case }> = {
  zum: { prep: 'zu', c: 'dat' }, zur: { prep: 'zu', c: 'dat' }, im: { prep: 'in', c: 'dat' }, am: { prep: 'an', c: 'dat' },
  beim: { prep: 'bei', c: 'dat' }, vom: { prep: 'von', c: 'dat' }, ins: { prep: 'in', c: 'akk' }, ans: { prep: 'an', c: 'akk' },
};

/** Every case a determiner or pronoun form can stand for, from the grammar tables. */
function casesOf(word: string): Set<Case> {
  const out = new Set<Case>();
  for (const d of DETS) for (const c of CASES) for (const g of GENDERS) {
    const f = detForm(d, c, g);
    if (f && (f === word || f.toLowerCase() === word.toLowerCase())) out.add(c);
  }
  for (const p of PERSONS) {
    for (const c of ['nom', 'akk', 'dat'] as const) if (PP[p][c] === word || (p !== 'Sie' && PP[p][c] === word.toLowerCase())) out.add(c);
    if (REFL[p].akk === word) out.add('akk');
    if (REFL[p].dat === word) out.add('dat');
  }
  return out;
}

test('the form helper knows the tables', () => {
  assert.deepEqual([...casesOf('dem')], ['dat']);
  assert.ok(casesOf('den').has('akk') && casesOf('den').has('dat'));
  assert.ok(casesOf('mir').has('dat') && !casesOf('mir').has('akk'));
  assert.ok(casesOf('Ihnen').has('dat'));
  assert.equal(casesOf('Haus').size, 0);
});

/* ======================================================== Verb + Fall */

test('Verb + Fall: at least 40 items, unique keys, bilingual tips', () => {
  assert.ok(VERB_CASE_ITEMS.length >= 40, `${VERB_CASE_ITEMS.length}`);
  assert.equal(new Set(VERB_CASE_ITEMS.map((v) => v.key)).size, VERB_CASE_ITEMS.length);
  for (const v of VERB_CASE_ITEMS) {
    assert.ok(v.tip.de.length > 10 && v.tip.en.length > 10, v.verb);
    assert.ok(v.example.length > 5 && v.exampleEn.length > 5, v.verb);
    assert.match(v.example, /[.!?]$/, v.example);
  }
  const by = (c: string) => VERB_CASE_ITEMS.filter((v) => v.c === c).map((v) => v.verb);
  for (const verb of ['helfen', 'danken', 'gefallen', 'gehören', 'gratulieren', 'antworten', 'passen', 'schmecken', 'fehlen', 'folgen', 'glauben', 'vertrauen', 'zuhören', 'zustimmen', 'widersprechen', 'wehtun', 'leidtun', 'gelingen', 'begegnen', 'raten', 'verzeihen'])
    assert.ok(by('dat').includes(verb), verb);
  for (const verb of ['besuchen', 'anrufen', 'fragen', 'kennen', 'brauchen', 'lieben', 'sehen', 'treffen', 'unterstützen']) assert.ok(by('akk').includes(verb), verb);
  for (const verb of ['geben', 'schenken', 'zeigen', 'erklären', 'schicken', 'bringen', 'leihen', 'empfehlen', 'erzählen', 'kaufen', 'schreiben', 'wünschen'])
    assert.ok(by('datakk').includes(verb), verb);
  assert.deepEqual(by('nom').sort(), [...NOM_VERBS].sort());
});

test('Verb + Fall: every answer agrees with the grammar rules data', () => {
  const dat = new Set(DAT_VERBS.map((v) => v.verb));
  const datAkk = new Set(DAT_AKK_VERBS.map((v) => v.verb));
  const nom = new Set(NOM_VERBS);
  const akk = new Set(AKK_VERBS.filter((v) => !datAkk.has(v)));
  for (const v of VERB_CASE_ITEMS) {
    if (dat.has(v.verb)) assert.equal(v.c, 'dat', v.verb);
    if (datAkk.has(v.verb)) assert.equal(v.c, 'datakk', v.verb);
    if (nom.has(v.verb)) assert.equal(v.c, 'nom', v.verb);
    if (akk.has(v.verb)) assert.equal(v.c, 'akk', v.verb);
    if (v.c === 'akk') assert.ok(!dat.has(v.verb) && !datAkk.has(v.verb), v.verb);
  }
  // Where the vocabulary marks a verb "+ Dat", the item agrees.
  for (const e of vocab) {
    const item = VERB_CASE_ITEMS.find((v) => v.verb === e.de);
    if (!item || !e.government) continue;
    if (/^\S+ \+ Dat$/.test(e.government)) assert.equal(item.c, 'dat', e.de);
    if (/\+ Dat \+ Akk/.test(e.government)) assert.equal(item.c, 'datakk', e.de);
  }
});

test('Verb + Fall: the objects in every example have the right case form', () => {
  let checked = 0;
  for (const v of VERB_CASE_ITEMS) {
    const want: Case[] = v.c === 'datakk' ? ['dat', 'akk'] : [v.c];
    if (v.c === 'datakk') assert.equal(v.obj.length, 2, v.verb);
    v.obj.forEach((phrase, i) => {
      assert.ok(v.example.toLowerCase().includes(phrase.toLowerCase()), `${v.verb}: „${phrase}“ not in „${v.example}“`);
      const first = phrase.split(' ')[0];
      const cases = casesOf(first);
      assert.ok(cases.has(want[i]), `${v.verb}: „${first}“ is not ${want[i]} (${[...cases].join('/')})`);
      checked++;
    });
  }
  assert.ok(checked >= 70, `${checked}`);
});

/* ================================================== Präposition + Fall */

test('Präposition + Fall: every preposition, with the right group', () => {
  const ids = idsForSet('praep');
  assert.equal(ids.length, PREPS.length);
  for (const p of PREPS) {
    const q = merkQuestion(merkId('praep', p.prep), seeded())!;
    assert.ok(q, p.prep);
    assert.equal(q.options[q.answer], PREP_KIND_LABEL[p.kind]);
    const c = triggerCase(`p:${p.prep}`);
    if (p.kind !== 'wechsel') assert.equal(q.kase, c, p.prep);
    assert.ok(q.tip.de.length > 20 && q.tip.en.length > 20);
  }
});

/* ========================================== Verb / Adjektiv + Präposition */

test('parseGovernment on real vocabulary entries', () => {
  const real = (g: string) => {
    assert.ok(vocab.some((e) => e.government === g), `not in the vocabulary: ${g}`);
    return parseGovernment(g);
  };
  assert.deepEqual(real('warten auf + Akk'), { frame: 'warten', pairs: [{ prep: 'auf', c: 'akk', alt: [] }] });
  assert.deepEqual(real('sich freuen auf + Akk (Zukunft) / über + Akk (Gegenwart)'), {
    frame: 'sich freuen',
    pairs: [{ prep: 'auf', c: 'akk', alt: [] }, { prep: 'über', c: 'akk', alt: [] }],
  });
  assert.deepEqual(real('sich bewerben um + Akk / bei + Dat / als + Nom'), {
    frame: 'sich bewerben',
    pairs: [{ prep: 'um', c: 'akk', alt: [] }, { prep: 'bei', c: 'dat', alt: [] }],
  });
  assert.deepEqual(real('gratulieren + Dat zu + Dat'), { frame: 'gratulieren', pairs: [{ prep: 'zu', c: 'dat', alt: [] }] });
  assert.deepEqual(real('bitten + Akk um + Akk'), { frame: 'bitten', pairs: [{ prep: 'um', c: 'akk', alt: [] }] });
  assert.deepEqual(real('durchfallen in/bei + Dat'), { frame: 'durchfallen', pairs: [{ prep: 'in', c: 'dat', alt: ['bei'] }] });
  assert.deepEqual(real('sich beschweren bei + Dat über + Akk'), {
    frame: 'sich beschweren',
    pairs: [{ prep: 'bei', c: 'dat', alt: [] }, { prep: 'über', c: 'akk', alt: [] }],
  });
  assert.equal(real('sich (gut) verstehen mit + Dat')?.frame, 'sich verstehen');
  assert.equal(real('der Nachweis über + Akk')?.frame, 'der Nachweis');
  assert.equal(real('bestehen aus + Dat (= to consist of)')?.pairs[0].prep, 'aus');
  assert.deepEqual(real('tätig sein als + Nom / bei + Dat'), { frame: 'tätig sein', pairs: [{ prep: 'bei', c: 'dat', alt: [] }] });
  assert.deepEqual(real('passen + Dat; passen zu + Dat'), { frame: 'passen', pairs: [{ prep: 'zu', c: 'dat', alt: [] }] });
  assert.equal(real('leiden an + Dat (an illness) / unter + Dat')?.pairs.map(pairText).join(' '), 'an + Dat unter + Dat');
  // No preposition with Akk/Dat → nothing to ask.
  for (const g of ['vertrauen + Dat', 'jemandem sympathisch sein: + Dat', 'gegenüber + Dat', 'erklären + Dat + Akk', 'gelten als + Nom', 'sich (Dat) merken + Akk', 'schwindlig sein/werden + Dat (mir ist schwindlig)'])
    assert.equal(real(g), null, g);
  assert.equal(parseGovernment(''), null);
  assert.equal(parseGovernment('Unsinn'), null);
});

test('every vocabulary government either parses or has no preposition', () => {
  const preps = PREPS.map((p) => p.prep).join('|');
  const prepCase = new RegExp(`(^|\\s|/)(${preps})(/\\S+)?\\s*\\+\\s*(Akk|Dat)\\b`);
  for (const e of vocab) {
    if (!e.government) continue;
    const parsed = parseGovernment(e.government);
    // A preposition as the headword ("gegenüber + Dat") has nothing before it to ask about.
    if (new RegExp(`^(${preps})\\s*\\+`).test(e.government)) {
      assert.equal(parsed, null, e.government);
      continue;
    }
    if (prepCase.test(e.government.replace(/\([^)]*\)/g, ' '))) assert.ok(parsed, `${e.id}: ${e.government}`);
  }
});

test('Verb/Adjektiv + Präposition: at least 120 items, deduped, with nouns and adjectives', () => {
  assert.ok(VPREP_ITEMS.length >= 120, `${VPREP_ITEMS.length}`);
  assert.equal(new Set(VPREP_ITEMS.map((v) => v.key)).size, VPREP_ITEMS.length);
  assert.equal(new Set(VPREP_ITEMS.map((v) => v.frame)).size, VPREP_ITEMS.length);
  const find = (frame: string) => VPREP_ITEMS.find((v) => v.frame === frame);
  assert.equal(pairText(find('warten')!.pair), 'auf + Akk');
  assert.equal(pairText(find('stolz')!.pair), 'auf + Akk');
  assert.equal(pairText(find('zufrieden')!.pair), 'mit + Dat');
  assert.equal(pairText(find('interessiert')!.pair), 'an + Dat');
  assert.equal(pairText(find('die Angst')!.pair), 'vor + Dat');
  assert.equal(pairText(find('sich bewerben')!.pair), 'um + Akk');
  assert.ok(VPREP_ITEMS.filter((v) => v.pos === 'adjective').length >= 25);
  assert.ok(VPREP_ITEMS.filter((v) => v.pos === 'noun').length >= 15);
  // Prepositions as headwords ("je nach") are not asked.
  assert.ok(!VPREP_ITEMS.some((v) => v.frame === 'je'));
  for (const v of VPREP_ITEMS) assert.ok(v.example.length > 5 && v.en.length > 1, v.key);
});

test('Verb/Adjektiv + Präposition: fixed-case prepositions keep their case, examples use the right form', () => {
  const kind = new Map(PREPS.map((p) => [p.prep, p.kind]));
  let checked = 0;
  for (const v of VPREP_ITEMS) {
    for (const p of v.pairs) {
      const k = kind.get(p.prep);
      if (k === 'akk' || k === 'dat') assert.equal(p.c, k, `${v.frame} ${pairText(p)}`);
    }
    // The word after the preposition in the example, where it is an article or pronoun. The
    // preposition can also appear in another role (Im Urlaub …), so one matching use is enough.
    const words = v.example.replace(/[.,!?;:„“]/g, ' ').split(/\s+/).filter(Boolean);
    const uses: { phrase: string; cases: Set<Case> }[] = [];
    for (let i = 0; i < words.length - 1; i++) {
      const w = words[i].toLowerCase();
      const contracted = CONTRACTED[w];
      if (w !== v.pair.prep && contracted?.prep !== v.pair.prep) continue;
      const cases = contracted ? new Set([contracted.c]) : casesOf(words[i + 1]);
      if (cases.size > 0) uses.push({ phrase: `${words[i]} ${words[i + 1]}`, cases });
    }
    if (uses.length === 0) continue;
    assert.ok(uses.some((u) => u.cases.has(v.pair.c)), `${v.frame} ${pairText(v.pair)}: ${uses.map((u) => `„${u.phrase}“`).join(', ')} in „${v.example}“`);
    checked++;
  }
  assert.ok(checked >= 100, `only ${checked} examples checked`);
});

test('Verb/Adjektiv + Präposition: options hold one right answer and three wrong ones', () => {
  const rnd = seeded(3);
  for (const v of VPREP_ITEMS) {
    for (let k = 0; k < 3; k++) {
      const q = merkQuestion(merkId('vprep', v.key), rnd)!;
      assert.equal(q.options.length, 4, v.key);
      assert.equal(new Set(q.options).size, 4, v.key);
      assert.equal(q.options[q.answer], pairText(v.pair));
      const right = new Set(v.pairs.map(pairText));
      for (const o of q.options) {
        if (o === pairText(v.pair)) continue;
        assert.ok(!right.has(o), `${v.key}: ${o} is also right`);
        const prep = o.split(' ')[0];
        // Only the same preposition (with the other case) may come from the list of possible ones.
        if (prep !== v.pair.prep) assert.ok(!v.alsoOk.includes(prep), `${v.key}: ${o}`);
      }
      assert.ok(q.options.includes(`${v.pair.prep} + ${v.pair.c === 'akk' ? 'Dat' : 'Akk'}`), v.key);
    }
  }
});

/* ============================================================ questions */

test('every id of every set builds a question with a tip and a reason', () => {
  for (const set of MERK_SETS) {
    for (const id of idsForSet(set)) {
      assert.deepEqual(parseMerkId(id)?.set, set);
      assert.ok(merkExists(id), id);
      const q = merkQuestion(id, seeded())!;
      assert.ok(q, id);
      assert.ok(q.answer >= 0 && q.answer < q.options.length, id);
      assert.ok(q.tip.de && q.tip.en && q.reason.de && q.reason.en, id);
      assert.ok(!/undefined|null/.test(q.reason.de + q.reason.en + q.tip.de + q.tip.en), id);
    }
  }
  const q = merkQuestion(merkId('verb', 'helfen'))!;
  assert.equal(q.options[q.answer], VERB_CASE_NAME.dat.de);
  assert.equal(merkQuestion('merk:verb:gibtsnicht'), null);
  assert.equal(merkQuestion('gram:fall:f01'), null);
  assert.equal(parseMerkId('merk:xyz:a'), null);
});

test('tip groups for the Merktipps page are complete and name real items', () => {
  const verbs = new Set(VERB_CASE_ITEMS.map((v) => v.verb));
  for (const g of VERB_TIP_GROUPS) {
    assert.ok(g.title.de && g.title.en && g.text.de && g.text.en);
    for (const w of g.words) assert.ok(verbs.has(w), w);
    for (const w of g.words) {
      const item = VERB_CASE_ITEMS.find((v) => v.verb === w)!;
      if (g.c === 'dat' || g.c === 'akk' || g.c === 'nom') assert.equal(item.c, g.c, `${w} in ${g.title.de}`);
    }
  }
  assert.ok(VPREP_TIP_GROUPS.length >= 6);
});

/* =============================================================== rounds */

const answerAll = (ids: string[], ok: (id: string) => boolean, now: number) => {
  const progress: Record<string, ItemProgress> = {};
  for (const id of ids) progress[id] = grade(progress[id], ok(id), now);
  return progress;
};

test('sitzt: the last three answers were right', () => {
  let p: ItemProgress | undefined;
  assert.equal(sitzt(p), false);
  p = grade(p, true, 1);
  p = grade(p, true, 2);
  assert.equal(sitzt(p), false);
  p = grade(p, true, 3);
  assert.equal(sitzt(p), true);
  p = grade(p, false, 4);
  assert.equal(sitzt(p), false);
});

test('a round has 8 different items of its set; wrong ones come back first', () => {
  for (const set of MERK_SETS) {
    const ids = pickMerkIds(set, {}, seeded(1));
    assert.equal(ids.length, MERK_ROUND);
    assert.equal(new Set(ids).size, MERK_ROUND);
    for (const id of ids) assert.equal(parseMerkId(id)?.set, set);
  }
  const now = 1_000_000_000;
  const wrong = idsForSet('verb').slice(0, 3);
  const progress = answerAll(idsForSet('verb').slice(0, 20), (id) => !wrong.includes(id), now);
  const round = pickMerkIds('verb', progress, seeded(2), now + 1000);
  for (const id of wrong) assert.ok(round.includes(id), id);
});

test('Meine Fehler: everything answered wrong, weakest first; stats count what sits', () => {
  const now = 1_000_000_000;
  const a = merkId('verb', 'helfen');
  const b = merkId('praep', 'mit');
  const c = merkId('vprep', 'warten');
  let progress: Record<string, ItemProgress> = {
    [a]: grade(undefined, false, now),
    [b]: grade(grade(undefined, false, now), true, now + 1),
    [c]: grade(undefined, true, now),
    'merk:verb:gibtsnicht': grade(undefined, false, now),
    'gram:fall:f01': grade(undefined, false, now),
  };
  const ids = fehlerIds(progress, now + 10);
  assert.deepEqual(ids, [a, b]);
  assert.deepEqual(pickMerkIds('fehler', progress, seeded(), now + 10), [a, b]);
  assert.deepEqual(merkStats('fehler', progress, now + 10), { total: 2, practised: 2, sitzen: 0 });
  progress = { ...progress, [b]: grade(grade(progress[b], true, now + 2), true, now + 3) };
  assert.equal(merkStats('fehler', progress, now + 10).sitzen, 1);
  // An item that sits again goes to the back of the list.
  assert.deepEqual(fehlerIds(progress, now + 10), [a, b]);
  const verb = merkStats('verb', progress, now + 10);
  assert.equal(verb.total, VERB_CASE_ITEMS.length);
  assert.equal(verb.practised, 1);
});
