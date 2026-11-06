// Minimal, made-up content in the real schemas, for tests only (not shipped).
import type {
  Hoeren1Set, Hoeren2Set, Hoeren3Set, Lesen1Set, Lesen2Set, Lesen3Set, Sb1Set, Sb2Set,
  Speaking1Card, Speaking2Task, Speaking3Task, WritingTask,
} from '../../src/content/types.ts';
import type { MockContent } from '../../src/sections/modelltest/assemble.ts';

const ex = { de: 'Test', en: 'Test' };
const range = (n: number) => Array.from({ length: n }, (_, i) => i);

export const lesen1Fixture = (id: string): Lesen1Set => ({
  id,
  topic: 'freizeit',
  headlines: range(10).map((i) => `Überschrift ${i}`),
  // Texts 1–5 match headlines 2, 0, 7, 4, 9.
  texts: [2, 0, 7, 4, 9].map((answer, i) => ({ text: `Text ${i + 1}`, answer, explanation: ex })),
});

export const lesen2Fixture = (id: string): Lesen2Set => ({
  id,
  topic: 'arbeit',
  title: 'Titel',
  text: ['Absatz eins.', 'Absatz zwei.'],
  items: ([0, 1, 2, 1, 0] as const).map((answer, i) => ({
    stem: `Frage ${i + 1}`,
    options: ['a', 'b', 'c'],
    answer,
    explanation: ex,
  })),
});

export const lesen3Fixture = (id: string): Lesen3Set => ({
  id,
  topic: 'wohnen',
  ads: range(12).map((i) => ({ title: `Anzeige ${i}`, text: `Text ${i}` })),
  // Situation 4 has no matching ad ("x").
  situations: [0, 3, 5, null, 1, 11, 7, 2, 9, 10].map((answer, i) => ({ text: `Situation ${i + 1}`, answer, explanation: ex })),
});

export const sb1Fixture = (id: string): Sb1Set => ({
  id,
  topic: 'person',
  text: range(10).map((i) => `Satz [${i + 1}] hier.`).join(' '),
  gaps: range(10).map((i) => ({ options: ['x', 'y', 'z'], answer: (i % 3) as 0 | 1 | 2, explanation: ex, point: 'Test' })),
});

export const sb2Fixture = (id: string): Sb2Set => ({
  id,
  topic: 'person',
  text: range(10).map((i) => `Wort [${i + 1}].`).join(' '),
  words: range(15).map((i) => `w${i}`),
  gaps: range(10).map((i) => ({ answer: 14 - i, explanation: ex })),
});

const rf = (answer: boolean, i: number) => ({ statement: `Aussage ${i + 1}`, answer, explanation: ex });

export const hoeren1Fixture = (id: string): Hoeren1Set => ({
  id,
  topic: 'reisen',
  items: [true, false, true, true, false].map((a, i) => ({ script: [{ voice: 'n', text: `Ansage ${i}` }], item: rf(a, i) })),
});

export const hoeren2Fixture = (id: string): Hoeren2Set => ({
  id,
  topic: 'medien',
  title: 'Interview',
  script: [{ voice: 'a', text: 'Hallo.' }, { voice: 'b', text: 'Guten Tag.' }],
  items: [true, false, false, true, true, false, true, false, true, true].map(rf),
});

export const hoeren3Fixture = (id: string): Hoeren3Set => ({
  id,
  topic: 'reisen',
  items: [false, false, true, false, true].map((a, i) => ({ script: [{ voice: 'n', text: `Text ${i}` }], item: rf(a, i) })),
});

export const writingFixture = (id: string): WritingTask => ({
  id,
  topic: 'familie',
  register: 'informal',
  incoming: { from: 'Test', subject: 'Test', body: 'Hallo!' },
  points: ['a', 'b', 'c', 'd'],
  model: 'Liebe Test,\n\nvielen Dank.\n\nViele Grüße',
});

export const speaking1Fixture = (id: string): Speaking1Card => ({ id, points: ['Name'], extraQuestions: [], model: [] });
export const speaking2Fixture = (id: string): Speaking2Task => ({
  id, topic: 'medien', theme: 'Thema', a: { person: 'A', text: 'a' }, b: { person: 'B', text: 'b' }, model: [],
});
export const speaking3Fixture = (id: string): Speaking3Task => ({ id, topic: 'freizeit', situation: 'S', checklist: ['Wann?'], model: [] });

/** Three sets per part, so the "prefer unseen" rule has something to choose from. */
export function fixtureContent(): MockContent {
  const ids = (p: string) => [1, 2, 3].map((n) => `${p}-0${n}`);
  return {
    lesen1: ids('lesen1').map(lesen1Fixture),
    lesen2: ids('lesen2').map(lesen2Fixture),
    lesen3: ids('lesen3').map(lesen3Fixture),
    sb1: ids('sb1').map(sb1Fixture),
    sb2: ids('sb2').map(sb2Fixture),
    hoeren1: ids('hoeren1').map(hoeren1Fixture),
    hoeren2: ids('hoeren2').map(hoeren2Fixture),
    hoeren3: ids('hoeren3').map(hoeren3Fixture),
    schreiben: ids('schreiben').map(writingFixture),
    sprechen1: ids('sprechen1').map(speaking1Fixture),
    sprechen2: ids('sprechen2').map(speaking2Fixture),
    sprechen3: ids('sprechen3').map(speaking3Fixture),
  };
}

export const emptyContent = (): MockContent => ({
  lesen1: [], lesen2: [], lesen3: [], sb1: [], sb2: [], hoeren1: [], hoeren2: [], hoeren3: [],
  schreiben: [], sprechen1: [], sprechen2: [], sprechen3: [],
});
