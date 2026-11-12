/**
 * Mastery rounds ("Einprägen"): every item is asked until it has been
 * answered correctly several times in a row.
 *
 *   - A wrong answer resets the item's streak and brings it back soon:
 *     2–4 questions later (never straight away, unless it is the only one left).
 *   - A correct answer that does not reach the target yet sends the item
 *     further back (5–8 questions later), so it is asked again in the round.
 *   - An item that reaches the target "sitzt" and leaves the queue.
 *   - The round ends when every item sits.
 *
 * Pure and immutable: `answer` returns a new session. The random source is
 * injectable, so tests are deterministic.
 */

export type Rnd = () => number;

export interface MasteryOptions {
  /** Correct answers in a row an item needs to count as memorised. Default 3. */
  target?: number;
  /** After a wrong answer the item is asked again this many questions later (inclusive range). Default [2, 4]. */
  wrongGap?: [number, number];
  /** After a correct answer below the target (inclusive range). Default [5, 8]. */
  rightGap?: [number, number];
  rnd?: Rnd;
}

export interface MasteryItem {
  id: string;
  /** Correct answers in a row. */
  streak: number;
  /** Every answer given to the item. */
  attempts: number;
  /** Wrong answers. */
  wrong: number;
  mastered: boolean;
}

export interface MasterySession {
  /** Item ids still to ask; the first one is the current question. */
  queue: string[];
  items: Record<string, MasteryItem>;
  /** Ids in their original order (for stable listings). */
  order: string[];
  target: number;
  wrongGap: [number, number];
  rightGap: [number, number];
  rnd: Rnd;
  answers: number;
  /** The id that was answered last, to keep it from coming straight back. */
  last: string | null;
}

export interface MasteryProgress {
  items: MasteryItem[];
  /** Items that reached the target. */
  mastered: number;
  total: number;
  /** Answers given in the round. */
  answers: number;
  /** Wrong answers in the round (each one means a retry). */
  retries: number;
  done: boolean;
}

const DEFAULTS = { target: 3, wrongGap: [2, 4] as [number, number], rightGap: [5, 8] as [number, number] };

function checkGap(gap: [number, number], name: string): [number, number] {
  const [lo, hi] = gap;
  if (!Number.isInteger(lo) || !Number.isInteger(hi) || lo < 1 || hi < lo) throw new Error(`mastery: bad ${name} ${lo}-${hi}`);
  return [lo, hi];
}

export function createSession(itemIds: readonly string[], opts: MasteryOptions = {}): MasterySession {
  const order = [...new Set(itemIds)];
  const target = Math.max(1, Math.floor(opts.target ?? DEFAULTS.target));
  const items: Record<string, MasteryItem> = {};
  for (const id of order) items[id] = { id, streak: 0, attempts: 0, wrong: 0, mastered: false };
  return {
    queue: order.slice(),
    items,
    order,
    target,
    wrongGap: checkGap(opts.wrongGap ?? DEFAULTS.wrongGap, 'wrongGap'),
    rightGap: checkGap(opts.rightGap ?? DEFAULTS.rightGap, 'rightGap'),
    rnd: opts.rnd ?? Math.random,
    answers: 0,
    last: null,
  };
}

/** The id to ask now, or null when the round is over. */
export const current = (s: MasterySession): string | null => s.queue[0] ?? null;

export const isDone = (s: MasterySession) => s.queue.length === 0;

const between = ([lo, hi]: [number, number], rnd: Rnd) => lo + Math.min(hi - lo, Math.floor(rnd() * (hi - lo + 1)));

/**
 * Records the answer to the current item. `gap` = n means the item becomes
 * the n-th next question (n = 1 would be "immediately"); when fewer items are
 * waiting it goes to the end of the queue.
 */
export function answer(s: MasterySession, ok: boolean): MasterySession {
  const id = current(s);
  if (id === null) return s;
  const prev = s.items[id];
  const streak = ok ? prev.streak + 1 : 0;
  const mastered = ok && streak >= s.target;
  const item: MasteryItem = { id, streak, attempts: prev.attempts + 1, wrong: prev.wrong + (ok ? 0 : 1), mastered };
  const rest = s.queue.slice(1);
  if (!mastered) {
    const gap = between(ok ? s.rightGap : s.wrongGap, s.rnd);
    // gap - 1 items come before it; at least one when anything else is waiting.
    const at = Math.min(Math.max(gap - 1, rest.length > 0 ? 1 : 0), rest.length);
    rest.splice(at, 0, id);
  }
  return { ...s, queue: rest, items: { ...s.items, [id]: item }, answers: s.answers + 1, last: id };
}

export function progress(s: MasterySession): MasteryProgress {
  const items = s.order.map((id) => s.items[id]);
  return {
    items,
    mastered: items.filter((i) => i.mastered).length,
    total: items.length,
    answers: s.answers,
    retries: items.reduce((n, i) => n + i.wrong, 0),
    done: isDone(s),
  };
}
