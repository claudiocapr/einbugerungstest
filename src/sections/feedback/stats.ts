/**
 * Figures for the Feedback screen (neurofeedback test phase). Pure functions
 * over the store, so they are tested without a browser and never load content.
 */
import type { ExamPart, ItemProgress, Text2 } from '../../types.ts';
import { median, type TimedKind } from '../../lib/neuro.ts';
import { historyOf } from '../../lib/srs.ts';
import { startOfDay } from '../../lib/plan.ts';
import type { FeedbackLog } from '../../lib/neuroLog.ts';

const DAY = 24 * 60 * 60 * 1000;

/** Which pace an item id belongs to: vocabulary cards, article drill, or exam-style choices. */
export function timedKindOf(id: string): TimedKind {
  if (id.startsWith('vocab:')) return 'card';
  if (id.startsWith('vocab-art:')) return 'article';
  return 'choice';
}

export interface Tempo {
  kind: TimedKind;
  /** Median ms of correct answers in the last 7 days, or null without data. */
  recent: number | null;
  /** The same for the 7 days before. */
  before: number | null;
  nRecent: number;
  nBefore: number;
}

/** Median response time of correct answers per kind: last 7 days vs the 7 days before. */
export function tempoByKind(progress: Record<string, ItemProgress>, now = Date.now()): Tempo[] {
  const buckets: Record<TimedKind, { recent: number[]; before: number[] }> = {
    card: { recent: [], before: [] },
    article: { recent: [], before: [] },
    choice: { recent: [], before: [] },
  };
  for (const [id, p] of Object.entries(progress)) {
    const b = buckets[timedKindOf(id)];
    for (const a of historyOf(p)) {
      if (!a || !a.ok || typeof a.ms !== 'number' || !Number.isFinite(a.ms)) continue;
      const age = now - a.at;
      if (age < 0) continue;
      if (age < 7 * DAY) b.recent.push(a.ms);
      else if (age < 14 * DAY) b.before.push(a.ms);
    }
  }
  return (Object.keys(buckets) as TimedKind[]).map((kind) => {
    const { recent, before } = buckets[kind];
    return {
      kind,
      recent: recent.length ? median(recent) : null,
      before: before.length ? median(before) : null,
      nRecent: recent.length,
      nBefore: before.length,
    };
  });
}

export interface ConfidentError {
  id: string;
  /** Latest time it was answered wrongly although rated "sure". */
  at: number;
  count: number;
}

/** Items answered wrongly although rated "sure", most recent first. */
export function confidentErrorItems(progress: Record<string, ItemProgress>, limit = 10): ConfidentError[] {
  const out: ConfidentError[] = [];
  for (const [id, p] of Object.entries(progress)) {
    let at = 0;
    let count = 0;
    for (const a of historyOf(p)) {
      if (a && a.conf === 'sure' && !a.ok) {
        count++;
        at = Math.max(at, a.at);
      }
    }
    if (count > 0) out.push({ id, at, count });
  }
  return out.sort((a, b) => b.at - a.at || a.id.localeCompare(b.id)).slice(0, limit);
}

const PARTS: ExamPart[] = ['lesen1', 'lesen2', 'lesen3', 'sb1', 'sb2', 'hoeren1', 'hoeren2', 'hoeren3'];
const PART_SECTION: Record<string, string> = { lesen: 'lesen', sb: 'sprachbausteine', hoeren: 'hoeren' };

export interface ItemTarget {
  /** Vocabulary entry id for "vocab:" and "vocab-art:" items. */
  vocabId?: string;
  part?: ExamPart;
  /** Route to practise it again, without "#/". */
  route: string;
}

/** Where an item id comes from and where to practise it again. */
export function itemTarget(id: string): ItemTarget {
  const [prefix, ...rest] = id.split(':');
  if (prefix === 'vocab' || prefix === 'vocab-art') {
    const vocabId = rest.join(':');
    const topic = vocabId.replace(/-\d+$/, '');
    return { vocabId, route: topic && topic !== vocabId ? `wortschatz/thema/${topic}` : 'wortschatz' };
  }
  if ((PARTS as string[]).includes(prefix)) {
    const part = prefix as ExamPart;
    const m = /^([a-z]+)(\d)$/.exec(part)!;
    const set = rest[0];
    const base = `${PART_SECTION[m[1]]}/teil${m[2]}`;
    return { part, route: set ? `${base}/${set}` : base };
  }
  return { route: '' };
}

export interface FocusSummary {
  dip: number;
  long: number;
  /** Hints per local day, oldest first. */
  byDay: number[];
}

/** Focus hints of the last `days` days. */
export function focusSummary(log: FeedbackLog, now = Date.now(), days = 14): FocusSummary {
  const today = startOfDay(now);
  const byDay = new Array<number>(days).fill(0);
  let dip = 0;
  let long = 0;
  for (const e of log.focus) {
    const back = Math.round((today - startOfDay(e.at)) / DAY);
    if (back < 0 || back >= days) continue;
    byDay[days - 1 - back]++;
    if (e.kind === 'dip') dip++;
    else long++;
  }
  return { dip, long, byDay };
}

export interface SpeechSummary {
  /** Mean score (0–1) of the last `window` attempts, or null without data. */
  recent: number | null;
  /** Mean of the `window` attempts before those, or null. */
  before: number | null;
  n: number;
}

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

export function speechSummary(log: FeedbackLog, window = 10): SpeechSummary {
  const scores = [...log.speech].sort((a, b) => a.at - b.at).map((e) => e.score);
  return {
    recent: mean(scores.slice(-window)),
    before: mean(scores.slice(-2 * window, -window)),
    n: scores.length,
  };
}

/** A plain-language verdict for a calibration score (0–100). */
export function calibrationVerdict(score: number): Text2 {
  // A perfectly calibrated learner who often guesses still scores in the high 70s
  // (the Brier score also counts honest uncertainty), so the bands sit lower than 100.
  if (score >= 85) return { de: 'Sehr gut: Ihr Gefühl sagt zuverlässig, was Sie wissen.', en: 'Very good: your feeling reliably tells you what you know.' };
  if (score >= 70) return { de: 'Gut: Ihr Gefühl passt meistens zu Ihren Ergebnissen.', en: 'Good: your feeling mostly matches your results.' };
  if (score >= 55) return { de: 'Teils, teils: Ihr Gefühl täuscht Sie öfter.', en: 'Mixed: your feeling misleads you fairly often.' };
  return { de: 'Ihr Gefühl passt oft nicht zu den Ergebnissen – genau hier hilft das Training.', en: 'Your feeling often does not match your results – this is exactly where training helps.' };
}
