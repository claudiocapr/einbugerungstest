import { setStore, type Store } from './storage.ts';

/**
 * A small, synced log of neurofeedback events that are not answers to items
 * (those live in `progress`): focus hints shown and speech-match scores. It is
 * kept in `sections.feedback` and read by the Feedback screen with
 * `useSection(FEEDBACK_KEY, EMPTY_FEEDBACK_LOG)`.
 */
export const FEEDBACK_KEY = 'feedback';

export type FocusHintKind = 'dip' | 'long';

export interface FeedbackLog {
  /** Focus hints shown, oldest first, capped at MAX_FOCUS. */
  focus: { at: number; kind: FocusHintKind }[];
  /** Speech-match scores (0–1), oldest first, capped at MAX_SPEECH. */
  speech: { at: number; score: number }[];
}

export const MAX_FOCUS = 100;
export const MAX_SPEECH = 200;

export const EMPTY_FEEDBACK_LOG: FeedbackLog = { focus: [], speech: [] };

/** Reads the log defensively: synced state may be missing or damaged. */
export function readFeedbackLog(raw: unknown): FeedbackLog {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<FeedbackLog>;
  const focus = Array.isArray(r.focus)
    ? r.focus.filter((e) => e && Number.isFinite(e.at) && (e.kind === 'dip' || e.kind === 'long'))
    : [];
  const speech = Array.isArray(r.speech)
    ? r.speech.filter((e) => e && Number.isFinite(e.at) && Number.isFinite(e.score))
    : [];
  return { focus, speech };
}

function append(update: (log: FeedbackLog) => FeedbackLog) {
  try {
    setStore((s: Store) => ({
      ...s,
      sections: { ...s.sections, [FEEDBACK_KEY]: update(readFeedbackLog(s.sections[FEEDBACK_KEY])) },
    }));
  } catch {
    /* a log entry must never break the exercise that writes it */
  }
}

/** Remembers that a focus hint was shown. */
export function noteFocusHint(kind: 'dip' | 'long', now = Date.now()) {
  if (kind !== 'dip' && kind !== 'long') return;
  append((log) => ({ ...log, focus: [...log.focus, { at: now, kind }].slice(-MAX_FOCUS) }));
}

/**
 * Remembers one speech-match score, as `speechMatch(...).score` gives it (0–1).
 * A percentage (1 < score ≤ 100) is accepted too and stored as 0–1.
 */
export function noteSpeech(score: number, now = Date.now()) {
  if (!Number.isFinite(score)) return;
  const share = score > 1 && score <= 100 ? score / 100 : score;
  const clamped = Math.max(0, Math.min(1, share));
  append((log) => ({ ...log, speech: [...log.speech, { at: now, score: clamped }].slice(-MAX_SPEECH) }));
}
