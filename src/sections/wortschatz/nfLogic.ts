// Neurofeedback mode (test phase) for Wortschatz: pure helpers, tested without a browser.
// Nothing here is used unless the "neurofeedback" flag is on.
import type { Confidence, Lang, Text2 } from '../../types.ts';
import { type FocusSignal, median } from '../../lib/neuro.ts';

/** One answer in a neurofeedback session. */
export interface NfAnswer {
  ok: boolean;
  /** Missing when the card was flipped without a rating. */
  conf?: Confidence;
  ms: number;
  /** Correct, but held back (guessed or slow): comes back tomorrow instead of moving up. */
  hold: boolean;
}

/** "6,2 s" in German, "6.2 s" in English. */
export function formatSeconds(ms: number, lang: Lang): string {
  const s = (Math.max(0, ms) / 1000).toFixed(1);
  return `${lang === 'de' ? s.replace('.', ',') : s} s`;
}

export type FeedbackTone = 'good' | 'bad' | 'neutral';

export type FeedbackKind =
  | 'sureRight'
  | 'unsureRight'
  | 'guessRight'
  | 'slowRight'
  | 'right'
  | 'sureWrong'
  | 'unsureWrong'
  | 'guessWrong'
  | 'wrong';

/**
 * Which short feedback line fits an answer. A guess that turned out right is
 * named first (it is held back), then a slow right answer; a wrong answer the
 * learner was sure of gets the hypercorrection line.
 */
export function feedbackKind(ok: boolean, conf: Confidence | undefined, slow: boolean): FeedbackKind {
  if (ok) {
    if (conf === 'guess') return 'guessRight';
    if (slow) return 'slowRight';
    if (conf === 'sure') return 'sureRight';
    if (conf === 'unsure') return 'unsureRight';
    return 'right';
  }
  if (conf === 'sure') return 'sureWrong';
  if (conf === 'unsure') return 'unsureWrong';
  if (conf === 'guess') return 'guessWrong';
  return 'wrong';
}

const LINES: Record<FeedbackKind, { tone: FeedbackTone; text: (secs: { de: string; en: string }) => Text2 }> = {
  sureRight: { tone: 'good', text: () => ({ de: 'Sicher & richtig 👍', en: 'Sure & right 👍' }) },
  unsureRight: {
    tone: 'good',
    text: () => ({ de: 'Unsicher, aber richtig – das sitzt besser, als Sie dachten', en: 'Unsure, but right – you know it better than you thought' }),
  },
  guessRight: { tone: 'neutral', text: () => ({ de: 'Richtig geraten – kommt morgen wieder', en: 'A lucky guess – it comes back tomorrow' }) },
  slowRight: {
    tone: 'neutral',
    text: (s) => ({ de: `Richtig, aber langsam (${s.de}) – kommt morgen wieder`, en: `Right, but slow (${s.en}) – it comes back tomorrow` }),
  },
  right: { tone: 'good', text: () => ({ de: 'Richtig 👍', en: 'Right 👍' }) },
  sureWrong: {
    tone: 'bad',
    text: () => ({ de: 'Sicher, aber falsch – das merken Sie sich jetzt besonders gut', en: 'Sure, but wrong – this is the kind of mistake you remember best' }),
  },
  unsureWrong: { tone: 'bad', text: () => ({ de: 'Unsicher und falsch – kommt gleich wieder', en: 'Unsure and wrong – it comes back soon' }) },
  guessWrong: { tone: 'bad', text: () => ({ de: 'Geraten und falsch – kommt gleich wieder', en: 'Guessed and wrong – it comes back soon' }) },
  wrong: { tone: 'bad', text: () => ({ de: 'Falsch – kommt gleich wieder', en: 'Wrong – it comes back soon' }) },
};

export interface Feedback {
  kind: FeedbackKind;
  tone: FeedbackTone;
  text: Text2;
}

/** The feedback line shown right after an answer. */
export function feedbackLine(ok: boolean, conf: Confidence | undefined, slow: boolean, ms: number): Feedback {
  const kind = feedbackKind(ok, conf, slow);
  const line = LINES[kind];
  return { kind, tone: line.tone, text: line.text({ de: formatSeconds(ms, 'de'), en: formatSeconds(ms, 'en') }) };
}

/* ------------------------------------------------------------------ summary */

export interface NfSummary {
  byConf: Record<Confidence, { n: number; correct: number }>;
  /** Answers without a rating (card flipped with Space or a tap). */
  unrated: number;
  medianMs: number | null;
  held: number;
}

export function nfSummary(answers: readonly NfAnswer[]): NfSummary {
  const byConf: NfSummary['byConf'] = { sure: { n: 0, correct: 0 }, unsure: { n: 0, correct: 0 }, guess: { n: 0, correct: 0 } };
  let unrated = 0;
  for (const a of answers) {
    if (a.conf && a.conf in byConf) {
      byConf[a.conf].n++;
      if (a.ok) byConf[a.conf].correct++;
    } else unrated++;
  }
  const times = answers.map((a) => a.ms).filter((ms) => Number.isFinite(ms));
  return {
    byConf,
    unrated,
    medianMs: times.length ? median(times) : null,
    held: answers.filter((a) => a.hold).length,
  };
}

export const pct = (correct: number, n: number) => (n > 0 ? Math.round((correct / n) * 100) : 0);

/* -------------------------------------------------------------- focus hints */

/** How many answers the focus hint stays quiet after "Weiter". */
export const FOCUS_SNOOZE = 6;

export interface FocusGate {
  /** The signal the hint was last shown for (or 'ok' when none is showing). */
  last: FocusSignal;
  /** No hint before this many answers. */
  snoozeUntil: number;
}

export const FOCUS_GATE: FocusGate = { last: 'ok', snoozeUntil: 0 };

/**
 * Whether to show the focus hint after an answer: only when the signal changes
 * to "dip" or "long", and not while it is snoozed. After a snooze a signal that
 * is still there counts as new, so it can come back once.
 */
export function gateFocus(gate: FocusGate, signal: FocusSignal, answered: number): { show: boolean; gate: FocusGate } {
  if (signal === 'ok') return { show: false, gate: { ...gate, last: 'ok' } };
  if (answered < gate.snoozeUntil || signal === gate.last) return { show: false, gate };
  return { show: true, gate: { ...gate, last: signal } };
}

/** "Weiter" on the hint: quiet for the next answers. */
export const snoozeFocus = (answered: number): FocusGate => ({ last: 'ok', snoozeUntil: answered + FOCUS_SNOOZE });

/* ------------------------------------------------------------------- speech */

/** What the learner should say: the noun with its article, without gap marks ("…", "/"). */
export const speechTarget = (de: string, article?: string) =>
  `${article ? `${article} ` : ''}${de}`.replace(/[…/]|\.\.\./g, ' ').replace(/\s+/g, ' ').trim();

/**
 * The expected words as written (with capitals), each marked heard or not.
 * `speechMatch` returns them lower-cased, one per expected word in order.
 */
export function shownWords(target: string, words: readonly { word: string; heard: boolean }[]): { word: string; heard: boolean }[] {
  const cased = target
    .replace(/[„“”"'’‚‘«»().,;:!?…–—-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  if (cased.length !== words.length) return [...words];
  return words.map((w, i) => ({ word: cased[i].toLowerCase() === w.word ? cased[i] : w.word, heard: w.heard }));
}
