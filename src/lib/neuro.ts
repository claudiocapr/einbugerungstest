import type { Attempt, Confidence, ItemProgress } from '../types.ts';

/**
 * Neurofeedback mode (test phase): feedback on the learner's own state while
 * learning – how sure they are, how fast they recall, how they sound, and
 * whether their focus is dropping. Pure functions only, so they are tested
 * without a browser. Nothing here runs unless the "neurofeedback" flag is on.
 */

export const CONFIDENCES: Confidence[] = ['sure', 'unsure', 'guess'];

// ---------------------------------------------------------------- speed

/** Kinds of timed items; each has its own pace. */
export type TimedKind = 'card' | 'article' | 'choice';

/** Below this many earlier timings, fixed floors are used instead of the learner's own pace. */
const MIN_SAMPLES = 8;
/** Seconds that count as slow before the learner's own pace is known. */
const FLOOR_MS: Record<TimedKind, number> = { card: 6000, article: 3500, choice: 20000 };
/** An answer counts as slow when it takes this many times the learner's median. */
const SLOW_FACTOR = 1.8;

export const median = (xs: readonly number[]) => {
  if (xs.length === 0) return NaN;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

/** Response times of earlier correct answers whose id starts with `prefix` (e.g. "vocab:"). */
export function pastTimes(progress: Record<string, ItemProgress>, prefix: string, limit = 200): number[] {
  const out: { at: number; ms: number }[] = [];
  for (const [id, p] of Object.entries(progress)) {
    if (!id.startsWith(prefix)) continue;
    for (const a of p.history) if (a.ok && typeof a.ms === 'number') out.push({ at: a.at, ms: a.ms });
  }
  return out
    .sort((a, b) => b.at - a.at)
    .slice(0, limit)
    .map((x) => x.ms);
}

/** The time above which a correct answer is "not automatic yet" for this learner. */
export function slowThreshold(kind: TimedKind, past: readonly number[]): number {
  if (past.length < MIN_SAMPLES) return FLOOR_MS[kind];
  return Math.max(median(past) * SLOW_FACTOR, FLOOR_MS[kind] / 3);
}

export const isSlow = (ms: number, kind: TimedKind, past: readonly number[]) => ms > slowThreshold(kind, past);

/**
 * Whether a correct answer should be held back (not promoted): it was a guess,
 * or it took much longer than the learner usually needs.
 */
export const shouldHold = (ok: boolean, conf: Confidence | undefined, slow: boolean) => ok && (conf === 'guess' || slow);

// ---------------------------------------------------------------- calibration

export interface ConfidenceStats {
  n: number;
  correct: number;
}

export interface Calibration {
  byConf: Record<Confidence, ConfidenceStats>;
  /** Wrong although "sure" – the answers most worth a second look. */
  confidentErrors: number;
  /** Right although guessed – knowledge that is not secure yet. */
  luckyGuesses: number;
  /**
   * 0–100: how well confidence predicts being right. 100 = always right when
   * sure and always wrong when guessing. Null with fewer than 10 rated answers.
   */
  score: number | null;
}

/** Calibration over all attempts with a confidence rating. */
export function calibration(attempts: readonly Attempt[]): Calibration {
  const byConf: Record<Confidence, ConfidenceStats> = {
    sure: { n: 0, correct: 0 },
    unsure: { n: 0, correct: 0 },
    guess: { n: 0, correct: 0 },
  };
  let confidentErrors = 0;
  let luckyGuesses = 0;
  let rated = 0;
  let penalty = 0;
  // The probability each rating claims: sure ≈ 95 %, unsure ≈ 60 %, guess ≈ 30 %.
  const claim: Record<Confidence, number> = { sure: 0.95, unsure: 0.6, guess: 0.3 };
  for (const a of attempts) {
    // Only the three known ratings: a damaged save could hold e.g. "constructor", which `in` would accept.
    if (!a || !CONFIDENCES.includes(a.conf as Confidence)) continue;
    const conf = a.conf as Confidence;
    rated++;
    byConf[conf].n++;
    if (a.ok) byConf[conf].correct++;
    if (conf === 'sure' && !a.ok) confidentErrors++;
    if (conf === 'guess' && a.ok) luckyGuesses++;
    penalty += (claim[conf] - (a.ok ? 1 : 0)) ** 2; // Brier score
  }
  const score = rated >= 10 ? Math.round(100 * (1 - penalty / rated)) : null;
  return { byConf, confidentErrors, luckyGuesses, score: score === null ? null : Math.max(0, Math.min(100, score)) };
}

/** All attempts in the store, optionally only for ids with a prefix. */
export function allAttempts(progress: Record<string, ItemProgress>, prefix = ''): Attempt[] {
  const out: Attempt[] = [];
  for (const [id, p] of Object.entries(progress)) if (id.startsWith(prefix)) out.push(...p.history);
  return out;
}

// ---------------------------------------------------------------- focus

export interface FocusSample {
  ok: boolean;
  ms: number;
}

export type FocusSignal = 'ok' | 'dip' | 'long';

export interface FocusState {
  signal: FocusSignal;
  /** Accuracy of the first answers of the session (0–1), once known. */
  baselineAccuracy: number | null;
  recentAccuracy: number | null;
  baselineMs: number | null;
  recentMs: number | null;
}

const BASELINE = 6;
const WINDOW = 6;
const LONG_SESSION_MS = 25 * 60 * 1000;

/**
 * Watches one session. After a baseline of the first answers, a "dip" is
 * signalled when the last answers are clearly worse (accuracy down by 35
 * points or more) or clearly slower (median time 1.8× the baseline); "long"
 * after 25 minutes without a break.
 */
export function focusState(samples: readonly FocusSample[], sessionMs: number): FocusState {
  const state: FocusState = { signal: 'ok', baselineAccuracy: null, recentAccuracy: null, baselineMs: null, recentMs: null };
  if (samples.length >= BASELINE) {
    const base = samples.slice(0, BASELINE);
    state.baselineAccuracy = base.filter((s) => s.ok).length / base.length;
    state.baselineMs = median(base.map((s) => s.ms));
  }
  if (samples.length >= BASELINE + WINDOW) {
    const recent = samples.slice(-WINDOW);
    state.recentAccuracy = recent.filter((s) => s.ok).length / recent.length;
    state.recentMs = median(recent.map((s) => s.ms));
    const accDrop = (state.baselineAccuracy ?? 0) - state.recentAccuracy >= 0.35;
    const slower = state.baselineMs !== null && state.recentMs > state.baselineMs * 1.8;
    if (accDrop || slower) state.signal = 'dip';
  }
  if (state.signal === 'ok' && sessionMs >= LONG_SESSION_MS) state.signal = 'long';
  return state;
}

// ---------------------------------------------------------------- speech

/** Lower case, no punctuation, "ß" kept, umlauts kept (they matter in German). */
export const normaliseWords = (text: string) =>
  text
    // Speech recognition and typed content may encode umlauts differently (ü vs u + ¨).
    .normalize('NFC')
    .toLowerCase()
    .replace(/[„“”"'’‚‘«»().,;:!?…–—-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...new Array<number>(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[a.length][b.length];
}

/** Whether two words are close enough (allows a small slip in longer words). */
const sameWord = (a: string, b: string) => a === b || (Math.max(a.length, b.length) >= 6 && levenshtein(a, b) <= 1);

export interface SpeechMatch {
  /** Share of the expected words that were heard, 0–1. */
  score: number;
  /** Each expected word and whether it was heard. */
  words: { word: string; heard: boolean }[];
}

/** Compares what the learner should have said with what speech recognition heard. */
export function speechMatch(expected: string, heard: string): SpeechMatch {
  const want = normaliseWords(expected);
  const got = normaliseWords(heard);
  // Longest common subsequence over words, so word order matters but extra words do not hurt much.
  const dp = Array.from({ length: want.length + 1 }, () => new Array<number>(got.length + 1).fill(0));
  for (let i = want.length - 1; i >= 0; i--)
    for (let j = got.length - 1; j >= 0; j--)
      dp[i][j] = sameWord(want[i], got[j]) ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const words: SpeechMatch['words'] = [];
  let i = 0;
  let j = 0;
  while (i < want.length) {
    if (j < got.length && sameWord(want[i], got[j])) {
      words.push({ word: want[i], heard: true });
      i++;
      j++;
    } else if (j < got.length && dp[i][j + 1] >= dp[i + 1][j]) {
      j++;
    } else {
      words.push({ word: want[i], heard: false });
      i++;
    }
  }
  const hits = words.filter((w) => w.heard).length;
  return { score: want.length ? hits / want.length : 0, words };
}

/** German filler words and hesitations speech recognition often writes out. */
const FILLERS = new Set(['äh', 'ähm', 'öh', 'öhm', 'hm', 'hmm', 'ehm', 'em', 'also', 'halt', 'sozusagen', 'quasi']);

export interface SpeechStats {
  words: number;
  wordsPerMinute: number;
  fillers: number;
  /** Phrases from the given list that appear in the transcript. */
  phrasesUsed: string[];
}

/** Simple fluency figures for free speech. */
export function speechStats(transcript: string, durationMs: number, phrases: readonly string[] = []): SpeechStats {
  const words = normaliseWords(transcript);
  const joined = ` ${words.join(' ')} `;
  const phrasesUsed = phrases.filter((p) => {
    const w = normaliseWords(p.replace(/\.\.\.|…/g, ' '));
    // Match the first few words of a phrase ("Meiner Meinung nach ..." → "meiner meinung nach").
    const head = w.slice(0, Math.min(3, w.length)).join(' ');
    return head.length > 0 && joined.includes(` ${head} `);
  });
  const minutes = durationMs / 60000;
  return {
    words: words.length,
    wordsPerMinute: minutes > 0 ? Math.round(words.length / minutes) : 0,
    fillers: words.filter((w) => FILLERS.has(w)).length,
    phrasesUsed,
  };
}
