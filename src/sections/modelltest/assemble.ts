/**
 * Puts one mock exam together from the content arrays: one set per part, one
 * writing task, one task per speaking part. Sets the learner has not done yet
 * come first; the choice among them is deterministic for a given seed, so a
 * stored mock always resolves to the same sets. Pure and unit-tested.
 */
import type { DrillResult } from '../../types.ts';
import type {
  Hoeren1Set, Hoeren2Set, Hoeren3Set, Lesen1Set, Lesen2Set, Lesen3Set, Sb1Set, Sb2Set,
  Speaking1Card, Speaking2Task, Speaking3Task, WritingTask,
} from '../../content/types.ts';
import type { ObjPart, ObjSetByPart, SpeakPart } from './score.ts';

export interface MockContent {
  lesen1: Lesen1Set[];
  lesen2: Lesen2Set[];
  lesen3: Lesen3Set[];
  sb1: Sb1Set[];
  sb2: Sb2Set[];
  hoeren1: Hoeren1Set[];
  hoeren2: Hoeren2Set[];
  hoeren3: Hoeren3Set[];
  schreiben: WritingTask[];
  sprechen1: Speaking1Card[];
  sprechen2: Speaking2Task[];
  sprechen3: Speaking3Task[];
}

export type PlanKey = ObjPart | 'schreiben' | SpeakPart;
export type MockPlan = Record<PlanKey, string | null>;

export const PLAN_KEYS: PlanKey[] = [
  'lesen1', 'lesen2', 'lesen3', 'sb1', 'sb2', 'hoeren1', 'hoeren2', 'hoeren3',
  'schreiben', 'sprechen1', 'sprechen2', 'sprechen3',
];

/** mulberry32: a tiny seeded PRNG, good enough to pick sets. Returns [0, 1). */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Every set id the learner has a result for, from any section. */
export function doneSetIds(results: readonly DrillResult[]): Set<string> {
  const done = new Set<string>();
  for (const r of results) if (r.setId) done.add(r.setId);
  return done;
}

/** Picks one id, preferring ids not in `done`. Sorted first so content order does not matter. */
export function pickId(ids: readonly string[], done: ReadonlySet<string>, rand: () => number): string | null {
  if (ids.length === 0) return null;
  const sorted = [...ids].sort();
  const fresh = sorted.filter((id) => !done.has(id));
  const pool = fresh.length > 0 ? fresh : sorted;
  return pool[Math.floor(rand() * pool.length)] ?? pool[0];
}

export function assembleMock(content: MockContent, done: ReadonlySet<string>, seed: number): MockPlan {
  const rand = seededRandom(seed);
  const plan = {} as MockPlan;
  for (const key of PLAN_KEYS) {
    plan[key] = pickId((content[key] as { id: string }[]).map((x) => x.id), done, rand);
  }
  return plan;
}

/** Looks a set up by id; undefined when it is gone (content changed) or never existed. */
export function findSet<P extends ObjPart>(content: MockContent, part: P, id: string | null): ObjSetByPart[P] | undefined {
  if (!id) return undefined;
  return (content[part] as ObjSetByPart[P][]).find((s) => s.id === id);
}

/** Splits a gapped text ("… [1] …") into text pieces and gap numbers (1-based). */
export function splitGaps(text: string): (string | number)[] {
  const out: (string | number)[] = [];
  const re = /\[(\d{1,2})\]/g;
  let last = 0;
  for (const m of text.matchAll(re)) {
    if (m.index! > last) out.push(text.slice(last, m.index));
    out.push(Number(m[1]));
    last = m.index! + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
