/**
 * The persisted shape of a mock exam in progress (and of the last finished
 * one), kept in `useSection('modelltest', …)` so a reload resumes it.
 */
import type { ExamPart, Text2 } from '../../types.ts';
import { type Grade, isGrade } from '../schreiben/criteria.ts';
import { MAX_TEXT_LENGTH } from '../schreiben/hints.ts';
import { PLAN_KEYS, type MockPlan } from './assemble.ts';
import { OBJ_PARTS, PART_MAX, type Answer, type ObjPart, type PartScore } from './score.ts';

export type BlockId = 'lesen' | 'hoeren' | 'schreiben';
export type Phase = BlockId | 'bewerten' | 'sprechen' | 'done';

export interface Block {
  id: BlockId;
  parts: ObjPart[];
  minutes: number;
  title: Text2;
}

export const BLOCKS: Block[] = [
  { id: 'lesen', parts: ['lesen1', 'lesen2', 'lesen3', 'sb1', 'sb2'], minutes: 90, title: { de: 'Leseverstehen und Sprachbausteine', en: 'Reading and language elements' } },
  { id: 'hoeren', parts: ['hoeren1', 'hoeren2', 'hoeren3'], minutes: 30, title: { de: 'Hörverstehen', en: 'Listening' } },
  { id: 'schreiben', parts: [], minutes: 30, title: { de: 'Schriftlicher Ausdruck', en: 'Writing' } },
];

export const blockOf = (id: BlockId) => BLOCKS.find((b) => b.id === id)!;

export const NEXT_PHASE: Record<Phase, Phase> = {
  lesen: 'hoeren',
  hoeren: 'schreiben',
  schreiben: 'bewerten',
  bewerten: 'sprechen',
  sprechen: 'done',
  done: 'done',
};

export interface StoredScore {
  points: number;
  max: number;
  correct: number;
  total: number;
}

export interface MockState {
  id: string;
  seed: number;
  startedAt: number;
  plan: MockPlan;
  phase: Phase;
  /** Epoch ms when the running block's clock ends; null before the block starts. */
  blockEndsAt: number | null;
  answers: Partial<Record<ObjPart, Answer[]>>;
  /** How often each recording was played ("hoeren1:0", "hoeren2", …). */
  plays: Record<string, number>;
  writing: { text: string; ticked: boolean[]; checks: string[]; grades: (Grade | null)[] };
  speaking: { skipped: boolean; grades: (Grade | null)[][] };
  /** Points per part, stored when the part is scored, so results survive content changes. */
  scores: Partial<Record<ExamPart, StoredScore>>;
  timedOut: BlockId[];
  finishedAt: number | null;
}

export interface ModelltestSection {
  current: MockState | null;
  last: MockState | null;
}

export const EMPTY_SECTION: ModelltestSection = { current: null, last: null };

export function newMock(plan: MockPlan, seed: number, now = Date.now()): MockState {
  return {
    id: `mock-${now}`,
    seed,
    startedAt: now,
    plan,
    phase: 'lesen',
    blockEndsAt: null,
    answers: {},
    plays: {},
    writing: { text: '', ticked: [false, false, false, false], checks: [], grades: [null, null, null] },
    speaking: { skipped: false, grades: [0, 1, 2].map(() => [null, null, null, null]) },
    scores: {},
    timedOut: [],
    finishedAt: null,
  };
}

const PHASES: Phase[] = ['lesen', 'hoeren', 'schreiben', 'bewerten', 'sprechen', 'done'];
const isObj = (x: unknown): x is Record<string, unknown> => Boolean(x) && typeof x === 'object' && !Array.isArray(x);
const grades = (raw: unknown, n: number): (Grade | null)[] =>
  Array.from({ length: n }, (_, i) => (Array.isArray(raw) && isGrade(raw[i]) ? (raw[i] as Grade) : null));

/** Defensive read of a stored mock: synced data may be old or damaged. */
export function readMock(raw: unknown): MockState | null {
  if (!isObj(raw) || typeof raw.id !== 'string' || !isObj(raw.plan)) return null;
  const plan = {} as MockPlan;
  for (const key of PLAN_KEYS) {
    const v = (raw.plan as Record<string, unknown>)[key];
    plan[key] = typeof v === 'string' ? v : null;
  }
  const answers: MockState['answers'] = {};
  if (isObj(raw.answers)) {
    for (const part of OBJ_PARTS) {
      const list = raw.answers[part];
      if (Array.isArray(list)) answers[part] = list.slice(0, 20).map((a) => (typeof a === 'number' && Number.isFinite(a) ? a : null));
    }
  }
  const plays: Record<string, number> = {};
  if (isObj(raw.plays)) for (const [k, v] of Object.entries(raw.plays)) if (typeof v === 'number') plays[k] = v;
  const w = isObj(raw.writing) ? raw.writing : {};
  const s = isObj(raw.speaking) ? raw.speaking : {};
  const scores: MockState['scores'] = {};
  if (isObj(raw.scores)) {
    for (const [part, v] of Object.entries(raw.scores)) {
      if (part in PART_MAX && isObj(v) && typeof v.points === 'number' && typeof v.max === 'number') {
        scores[part as ExamPart] = { points: v.points, max: v.max, correct: Number(v.correct) || 0, total: Number(v.total) || 0 };
      }
    }
  }
  return {
    id: raw.id,
    seed: Number(raw.seed) || 0,
    startedAt: Number(raw.startedAt) || Date.now(),
    plan,
    phase: PHASES.includes(raw.phase as Phase) ? (raw.phase as Phase) : 'lesen',
    blockEndsAt: typeof raw.blockEndsAt === 'number' ? raw.blockEndsAt : null,
    answers,
    plays,
    writing: {
      text: typeof w.text === 'string' ? w.text.slice(0, MAX_TEXT_LENGTH) : '',
      ticked: [0, 1, 2, 3].map((i) => Boolean(Array.isArray(w.ticked) && w.ticked[i])),
      checks: Array.isArray(w.checks) ? w.checks.filter((c): c is string => typeof c === 'string') : [],
      grades: grades(w.grades, 3),
    },
    speaking: {
      skipped: Boolean(s.skipped),
      grades: [0, 1, 2].map((i) => grades(Array.isArray(s.grades) ? s.grades[i] : null, 4)),
    },
    scores,
    timedOut: Array.isArray(raw.timedOut) ? (raw.timedOut.filter((b) => b === 'lesen' || b === 'hoeren' || b === 'schreiben') as BlockId[]) : [],
    finishedAt: typeof raw.finishedAt === 'number' ? raw.finishedAt : null,
  };
}

export function readSection(raw: unknown): ModelltestSection {
  if (!isObj(raw)) return EMPTY_SECTION;
  return { current: readMock(raw.current), last: readMock(raw.last) };
}

/** The stored part scores in the shape `scoreMock` takes. */
export const partScoresOf = (mock: MockState): PartScore[] =>
  (Object.entries(mock.scores) as [ExamPart, StoredScore][]).map(([part, s]) => ({ part, points: s.points, max: s.max }));
