/**
 * Neurofeedback mode for Mündlicher Ausdruck (test phase): pure helpers for
 * the live transcript (pace, Redemittel, restarting the recognition) and the
 * "Nachsprechen" score. No browser APIs here, so everything is tested in Node.
 */
import type { PhraseGroup } from '../../content/types.ts';
import type { Text2 } from '../../types.ts';
import { speechStats, type SpeechMatch } from '../../lib/neuro.ts';
import type { SprechenPart } from './score.ts';

// ---------------------------------------------------------------- pace

/** Comfortable pace for a B1 conversation, in words per minute. */
export const PACE_MIN = 90;
export const PACE_MAX = 130;

export type PaceBand = 'ruhig' | 'gut' | 'schnell';

/** "ruhig" below the band, "gut" inside it, "schnell" above it; null with no words. */
export function paceBand(wpm: number, words: number): PaceBand | null {
  if (words <= 0 || !Number.isFinite(wpm) || wpm <= 0) return null;
  if (wpm < PACE_MIN) return 'ruhig';
  if (wpm > PACE_MAX) return 'schnell';
  return 'gut';
}

export const PACE_TEXT: Record<PaceBand, { label: Text2; tip: Text2 }> = {
  ruhig: {
    label: { de: 'ruhig', en: 'calm' },
    tip: {
      de: 'Etwas langsamer als üblich – das ist in Ordnung. Versuchen Sie, längere Pausen mit Redemitteln zu füllen („Lass mich kurz überlegen …“).',
      en: 'A little slower than usual – that is fine. Try to fill longer pauses with phrases ("Lass mich kurz überlegen …").',
    },
  },
  gut: {
    label: { de: 'gut', en: 'good' },
    tip: { de: 'Ein gutes Tempo für ein Gespräch auf B1-Niveau.', en: 'A good pace for a B1 conversation.' },
  },
  schnell: {
    label: { de: 'schnell', en: 'fast' },
    tip: {
      de: 'Ziemlich schnell. Sprechen Sie ruhig etwas langsamer und deutlicher – das wirkt sicherer und Fehler werden seltener.',
      en: 'Quite fast. Feel free to speak a little slower and more clearly – it sounds more confident and you make fewer mistakes.',
    },
  },
};

/** A tip about filler words, or null when there were hardly any. */
export function fillerTip(fillers: number, words: number): Text2 | null {
  if (fillers === 0) return null;
  const share = words > 0 ? fillers / words : 1;
  if (fillers <= 2 && share < 0.05) return null;
  return {
    de: 'Viele Füllwörter („äh“, „ähm“, „also“ …). Eine kurze Pause ist besser – oder ein Redemittel zum Zeitgewinnen wie „Das ist eine gute Frage.“',
    en: 'Many fillers ("äh", "ähm", "also" …). A short pause is better – or a phrase that buys time, such as "Das ist eine gute Frage."',
  };
}

// ---------------------------------------------------------------- Redemittel

/** The Redemittel groups that fit each Teil (there is no separate "sich vorstellen" group). */
export const SUGGEST_GROUPS: Record<SprechenPart, string[]> = {
  1: ['nachfragen', 'erfahrung'],
  2: ['meinung', 'zustimmen', 'widersprechen', 'erfahrung'],
  3: ['vorschlagen', 'annehmen', 'ablehnen', 'einigen'],
};

/**
 * Spoken forms of a written phrase: "…" ends it, and every "x / y" becomes one
 * of its sides (one- and two-word alternatives, e.g. "Kannst du / Können Sie").
 * Wrong combinations do no harm: nobody says them, so they never match.
 */
export function phraseVariants(phrase: string): string[] {
  const cut = phrase.split(/\.\.\.|…/)[0];
  const tokens = cut.split(/\s+/).filter(Boolean);
  const out = new Set<string>();
  const expand = (ts: string[], depth: number) => {
    const i = ts.indexOf('/');
    if (i < 0 || depth > 4) {
      const text = ts.filter((t) => t !== '/').join(' ').trim();
      if (text) out.add(text);
      return;
    }
    for (const unit of [1, 2]) {
      expand([...ts.slice(0, i), ...ts.slice(i + 1 + unit)], depth + 1); // keep the left side
      expand([...ts.slice(0, Math.max(0, i - unit)), ...ts.slice(i + 1)], depth + 1); // keep the right side
    }
  };
  expand(tokens, 0);
  return [...out];
}

/** Phrases (as written) of the given groups that appear in the transcript. */
export function phrasesUsed(transcript: string, groups: readonly PhraseGroup[]): string[] {
  const variants: { phrase: string; variant: string }[] = [];
  for (const g of groups) for (const p of g.phrases) for (const v of phraseVariants(p.de)) variants.push({ phrase: p.de, variant: v });
  const hit = new Set(speechStats(transcript, 0, variants.map((v) => v.variant)).phrasesUsed);
  const used: string[] = [];
  for (const v of variants) if (hit.has(v.variant) && !used.includes(v.phrase)) used.push(v.phrase);
  return used;
}

/**
 * Up to `n` phrases from the groups that fit the Teil which were not used yet,
 * taken in turn from each group so the suggestions cover different purposes.
 */
export function suggestPhrases(
  part: SprechenPart,
  used: readonly string[],
  groups: readonly PhraseGroup[],
  n = 3,
): { phrase: string; en: string; group: Text2 }[] {
  const queues = SUGGEST_GROUPS[part]
    .map((id) => groups.find((g) => g.id === id))
    .filter((g): g is PhraseGroup => !!g)
    .map((g) => ({ g, rest: g.phrases.filter((p) => !used.includes(p.de)) }));
  const out: { phrase: string; en: string; group: Text2 }[] = [];
  let round = 0;
  while (out.length < n && queues.some((q) => q.rest.length > round)) {
    for (const q of queues) {
      if (out.length >= n) break;
      const p = q.rest[round];
      if (p) out.push({ phrase: p.de, en: p.en, group: q.g.label });
    }
    round++;
  }
  return out;
}

// ---------------------------------------------------------------- live transcript

/** Joins the text of finished recognition sessions with the running one. */
export const joinTranscript = (...parts: string[]) => parts.map((p) => p.trim()).filter(Boolean).join(' ');

/** Errors after which restarting the recognition would not help. */
export const FATAL_SPEECH_ERRORS = new Set([
  'not-allowed',
  'service-not-allowed',
  'audio-capture',
  'network',
  'unsupported',
  'start-failed',
  'language-not-supported',
]);

/** A session this short counts as "ended at once" (a sign the restart loop is stuck). */
export const QUICK_END_MS = 1000;
/** After this many quick ends in a row, stop restarting. */
export const MAX_QUICK_ENDS = 3;
/** After this long without any new words, stop restarting (the learner has walked away). */
export const MAX_SILENCE_MS = 45_000;

export interface SessionEnd {
  /** The learner has not pressed Stop. */
  wanted: boolean;
  /** Error reported by this session, if any. */
  error: string | null;
  /** Quick ends in a row, including this one. */
  quickEnds: number;
  /** Time since the last new words (or since Start). */
  silentMs: number;
}

/**
 * What to do when a recognition session ends: Safari (and Chrome after about
 * a minute) ends continuous sessions on its own, so they are restarted until
 * the learner presses Stop – unless the microphone is blocked, the restarts
 * keep failing at once, or nobody has spoken for a long time.
 */
export function onSessionEnd(s: SessionEnd): 'finish' | 'restart' | 'pause' {
  if (!s.wanted) return 'finish';
  if (s.error && FATAL_SPEECH_ERRORS.has(s.error)) return 'pause';
  if (s.quickEnds >= MAX_QUICK_ENDS) return 'pause';
  if (s.silentMs >= MAX_SILENCE_MS) return 'pause';
  return 'restart';
}

export const nextQuickEnds = (prev: number, sessionMs: number, gotText: boolean) =>
  sessionMs < QUICK_END_MS && !gotText ? prev + 1 : 0;

// ---------------------------------------------------------------- Nachsprechen

/** Score over several lines, weighted by words: share of all expected words heard (0–1). */
export function dialogueScore(results: readonly (SpeechMatch | undefined)[]): number {
  let words = 0;
  let heard = 0;
  for (const r of results) {
    if (!r) continue;
    words += r.words.length;
    heard += r.words.filter((w) => w.heard).length;
  }
  return words ? heard / words : 0;
}

/** How long to listen for one line before stopping on its own: generous for long lines. */
export const repeatTimeoutMs = (text: string) => 6000 + 700 * text.split(/\s+/).filter(Boolean).length;

export const percent = (x: number) => Math.round(Math.max(0, Math.min(1, x)) * 100);
