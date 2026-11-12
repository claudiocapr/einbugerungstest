// Genus-Regel-Drill: the pure part (which nouns, in which order, when a noun
// "sitzt"). The screen is GenusDrill.tsx. The Artikel-Trainer's retry queue
// lives here too.
import type { ItemProgress } from '../../types.ts';
import type { VocabEntry } from '../../content/types.ts';
import { vocab } from '../../content/wortschatz.ts';
import { genderTip } from '../../content/merktipps.ts';
import { historyOf, practiceOrder } from '../../lib/srs.ts';

/** Nouns per round. */
export const ROUND_SIZE = 10;
/** Right answers in a row before a noun "sitzt". */
export const MASTERY = 3;
/** About one noun in five is an exception to its rule. */
export const EXCEPTIONS_PER_ROUND = 2;

export const genusKey = (id: string) => `genus:${id}`;

/** Artikel-Trainer: a wrong noun comes back as the third card after the current one. */
export const RETRY_GAP = 3;

/** Puts `item` `gap` cards after position `pos` (or at the end, if the queue is shorter). */
export function requeue<T>(queue: T[], pos: number, item: T, gap: number): T[] {
  const at = Math.min(pos + gap, queue.length);
  return [...queue.slice(0, at), item, ...queue.slice(at)];
}

/** Nouns a rule speaks about, split into those that obey it and the exceptions. */
export function drillPool(): { matches: VocabEntry[]; exceptions: VocabEntry[] } {
  const matches: VocabEntry[] = [];
  const exceptions: VocabEntry[] = [];
  for (const e of vocab) {
    const t = genderTip(e);
    // Plural-only words say nothing about gender.
    if (!t || t.rule.id === 'nur-plural') continue;
    (t.matches ? matches : exceptions).push(e);
  }
  return { matches, exceptions };
}

const shuffled = <T,>(items: T[], rand: () => number): T[] => {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

/** Practice order (due and weak first), with the never-seen nouns in random order. */
function ordered(entries: VocabEntry[], progress: Record<string, ItemProgress>, now: number, rand: () => number): VocabEntry[] {
  const byKey = new Map(entries.map((e) => [genusKey(e.id), e]));
  const keys = practiceOrder([...byKey.keys()], progress, now);
  const seen = keys.filter((k) => historyOf(progress[k]).length > 0);
  const unseen = shuffled(keys.filter((k) => historyOf(progress[k]).length === 0), rand);
  // What went wrong before comes first; then new nouns; then the rest.
  const weakSeen = seen.filter((k) => (progress[k]?.box ?? 0) <= 1);
  const restSeen = seen.filter((k) => (progress[k]?.box ?? 0) > 1);
  return [...weakSeen, ...unseen, ...restSeen].map((k) => byKey.get(k)!);
}

/** The ten nouns of a round: eight that follow their rule, two exceptions. */
export function pickRound(progress: Record<string, ItemProgress>, now = Date.now(), rand: () => number = Math.random): VocabEntry[] {
  const { matches, exceptions } = drillPool();
  const exc = ordered(exceptions, progress, now, rand).slice(0, EXCEPTIONS_PER_ROUND);
  const rule = ordered(matches, progress, now, rand).slice(0, ROUND_SIZE - exc.length);
  return shuffled([...rule, ...exc], rand);
}

export interface DrillState {
  /** Ids still to show; the first one is on screen. */
  queue: string[];
  /** Right answers in a row, per id. */
  streak: Record<string, number>;
  /** The first answer per id (the score). */
  first: Record<string, boolean>;
  /** The latest answer per id. */
  last: Record<string, boolean>;
  answers: number;
  wrong: number;
  /** Where the current noun goes back into the queue (cards from now), or null when it sits. */
  gap: number | null;
}

export const startDrill = (ids: string[]): DrillState => ({ queue: ids.slice(), streak: {}, first: {}, last: {}, answers: 0, wrong: 0, gap: null });

export const isMastered = (s: DrillState, id: string) => (s.streak[id] ?? 0) >= MASTERY;

/**
 * Whether an answer goes into spaced repetition. Every first answer and every
 * mistake does; a right answer right after a right answer in the same round
 * does not, so drilling a noun three times does not push it weeks ahead.
 */
export const shouldRecord = (s: DrillState, id: string, ok: boolean) => !ok || s.last[id] !== true;

/** Grades the noun on screen. A wrong answer resets its streak and brings it back 2–4 cards later. */
export function gradeDrill(s: DrillState, ok: boolean, rand: () => number = Math.random): DrillState {
  const id = s.queue[0];
  if (id === undefined) return s;
  const streak = ok ? (s.streak[id] ?? 0) + 1 : 0;
  const gap = ok ? (streak >= MASTERY ? null : 3 + Math.floor(rand() * 3)) : 2 + Math.floor(rand() * 3);
  return {
    ...s,
    streak: { ...s.streak, [id]: streak },
    first: id in s.first ? s.first : { ...s.first, [id]: ok },
    last: { ...s.last, [id]: ok },
    answers: s.answers + 1,
    wrong: s.wrong + (ok ? 0 : 1),
    gap,
  };
}

/** Moves on: the noun on screen leaves the queue, and comes back `gap` cards later unless it sits. */
export function advanceDrill(s: DrillState): DrillState {
  const [id, ...rest] = s.queue;
  if (id === undefined) return s;
  if (s.gap !== null && !isMastered(s, id)) rest.splice(Math.min(s.gap - 1, rest.length), 0, id);
  return { ...s, queue: rest, gap: null };
}
