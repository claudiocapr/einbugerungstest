/**
 * Neurofeedback mode for the exam drills (Lesen, Sprachbausteine, Hören):
 * pure helpers for the "geraten" marker, the confidence summary of a set, the
 * calibration verdict and the pace verdict. No React, no storage, so they are
 * tested directly. Only used while the "neurofeedback" flag is on.
 */
import type { Confidence, Lang, Text2 } from '../../types.ts';
import type { GradeExtra } from '../../lib/srs.ts';
import { calibration, shouldHold } from '../../lib/neuro.ts';

/** Per-item "geraten" marks of a set, kept next to the answers. */
export interface NfMarks {
  guesses: boolean[];
  toggle: (item: number) => void;
}

/**
 * The confidence of one item: an answered item counts as "sure" unless it was
 * marked as a guess. An open item has no rating (there is no answer to rate).
 */
export const confFor = (answered: boolean, guessed: boolean): Confidence | undefined =>
  answered ? (guessed ? 'guess' : 'sure') : undefined;

/** The signals passed to `recordItem` for one item, or undefined when it has no rating. */
export function itemExtra(ok: boolean, conf: Confidence | undefined): GradeExtra | undefined {
  return conf ? { conf, hold: shouldHold(ok, conf, false) } : undefined;
}

export interface NfItem {
  ok: boolean;
  conf?: Confidence;
}

export interface NfSummary {
  sureRight: number;
  /** Wrong although sure – worth reading twice (hypercorrection). */
  sureWrong: number;
  /** Right although guessed – not secure yet, so the item is held back. */
  guessRight: number;
  guessWrong: number;
  /** Items without a rating (left open). */
  unrated: number;
}

/** Counts the four confidence × outcome combinations of a set. */
export function nfSummary(items: readonly NfItem[]): NfSummary {
  const c = calibration(items.map((it) => ({ at: 0, chosen: -1, ok: it.ok, conf: it.conf })));
  const sure = c.byConf.sure;
  const guess = c.byConf.guess;
  return {
    sureRight: sure.correct,
    sureWrong: c.confidentErrors,
    guessRight: c.luckyGuesses,
    guessWrong: guess.n - guess.correct,
    unrated: items.filter((it) => !it.conf).length,
  };
}

/** Indexes of the items that were wrong although the learner was sure. */
export const sureWrongItems = (items: readonly NfItem[]) =>
  items.flatMap((it, i) => (it.conf === 'sure' && !it.ok ? [i] : []));

export type CalibrationKind = 'none' | 'calibrated' | 'overconfident' | 'underconfident' | 'mixed';

/**
 * How well the learner's confidence matched the outcome in this set:
 * calibrated (no surprises), overconfident (more "sure but wrong" than
 * "guessed but right"), underconfident (the other way round) or mixed.
 */
export function calibrationKind(s: NfSummary): CalibrationKind {
  const rated = s.sureRight + s.sureWrong + s.guessRight + s.guessWrong;
  if (rated === 0) return 'none';
  if (s.sureWrong === 0 && s.guessRight === 0) return 'calibrated';
  if (s.sureWrong > s.guessRight) return 'overconfident';
  if (s.guessRight > s.sureWrong) return 'underconfident';
  return 'mixed';
}

/** The one-line calibration verdict for a set. */
export function calibrationVerdict(s: NfSummary): Text2 {
  switch (calibrationKind(s)) {
    case 'none':
      return { de: 'Keine beantworteten Aufgaben – keine Einschätzung möglich.', en: 'No answered items – nothing to assess.' };
    case 'calibrated':
      return {
        de: 'Gut eingeschätzt: Wo Sie sicher waren, lagen Sie richtig – und Ihr Zweifel war berechtigt.',
        en: 'Well calibrated: where you were sure you were right – and your doubts were justified.',
      };
    case 'overconfident':
      return {
        de: `Zu sicher: ${s.sureWrong}× sicher, aber falsch. Lesen Sie diese Erklärungen besonders genau.`,
        en: `Overconfident: ${s.sureWrong}× sure but wrong. Read those explanations especially carefully.`,
      };
    case 'underconfident':
      return {
        de: `Sie wissen mehr, als Sie denken: ${s.guessRight}× geraten und trotzdem richtig. Diese Aufgaben kommen bald wieder, bis Sie sicher sind.`,
        en: `You know more than you think: ${s.guessRight}× guessed and still right. These items come back soon until you are sure.`,
      };
    default:
      return {
        de: 'Gemischt: Ihre Sicherheit sagt noch wenig darüber, ob Sie richtig liegen.',
        en: 'Mixed: your confidence does not yet say much about whether you are right.',
      };
  }
}

/* ------------------------------------------------------------------ pace */

export type PaceKind = 'faster' | 'onPace' | 'slower' | 'unclear';

/** Within ±10 % of the exam pace counts as "im Prüfungstempo". */
const PACE_TOLERANCE = 0.1;
/** Longer than this many times the pace: probably interrupted, not a real time. */
const PACE_UNCLEAR_FACTOR = 4;

export interface PaceVerdict {
  kind: PaceKind;
  /** Time taken / exam pace (1 = exactly on pace); NaN when unclear. */
  ratio: number;
}

/** Compares the time a set took with the exam pace for that part (in minutes). */
export function paceVerdict(ms: number, minutes: number): PaceVerdict {
  const pace = minutes * 60_000;
  if (!Number.isFinite(ms) || ms <= 0 || !(pace > 0)) return { kind: 'unclear', ratio: NaN };
  const ratio = ms / pace;
  if (ratio > PACE_UNCLEAR_FACTOR) return { kind: 'unclear', ratio: NaN };
  if (ratio < 1 - PACE_TOLERANCE) return { kind: 'faster', ratio };
  if (ratio > 1 + PACE_TOLERANCE) return { kind: 'slower', ratio };
  return { kind: 'onPace', ratio };
}

/** 754_000 → "12:34"; an hour or more → "1:02:34". */
export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
}

/** "Ihre Zeit 12:34 · Prüfungstempo 15:00 – schneller als Prüfungstempo." */
export function paceText(ms: number, minutes: number, lang: Lang): string {
  const v = paceVerdict(ms, minutes);
  const pace = formatDuration(minutes * 60_000);
  if (v.kind === 'unclear') {
    return lang === 'de'
      ? `Prüfungstempo ${pace} – Ihre Zeit ist nicht aussagekräftig (Pause gemacht?).`
      : `Exam pace ${pace} – your time is not meaningful (did you take a break?).`;
  }
  const verdict: Record<Exclude<PaceKind, 'unclear'>, Text2> = {
    faster: { de: 'schneller als Prüfungstempo', en: 'faster than exam pace' },
    onPace: { de: 'im Prüfungstempo', en: 'on exam pace' },
    slower: { de: 'langsamer als Prüfungstempo', en: 'slower than exam pace' },
  };
  const time = formatDuration(ms);
  return lang === 'de'
    ? `Ihre Zeit ${time} · Prüfungstempo ${pace} – ${verdict[v.kind].de}.`
    : `Your time ${time} · exam pace ${pace} – ${verdict[v.kind].en}.`;
}
