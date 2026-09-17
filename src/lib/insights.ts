import type { Question, QuestionProgress, Recommendation, StrengthLevel, Topic } from '../types.ts';
import { historyOf, isDue, strength, strengthLevel } from './srs.ts';

export type Progress = Record<number, QuestionProgress>;

export const LEVELS: StrengthLevel[] = ['new', 'weak', 'shaky', 'good', 'strong'];

export interface Summary {
  total: number;
  /** How many questions sit at each strength level. */
  byLevel: Record<StrengthLevel, number>;
  /** Answered at least once. */
  seen: number;
  /** Scheduled for repetition right now (excludes never-seen questions). */
  due: number;
  /** Mean strength across the whole set, 0 to 1. */
  overall: number;
  answers: { correct: number; wrong: number };
}

export function summarise(questions: Question[], progress: Progress, now = Date.now()): Summary {
  const byLevel: Record<StrengthLevel, number> = { new: 0, weak: 0, shaky: 0, good: 0, strong: 0 };
  let sum = 0;
  let seen = 0;
  let due = 0;
  let correct = 0;
  let wrong = 0;

  for (const q of questions) {
    const p = progress[q.id];
    byLevel[strengthLevel(p, now)] += 1;
    sum += strength(p, now);
    if (historyOf(p).length > 0) {
      seen += 1;
      if (isDue(p, now)) due += 1;
      correct += p!.correct;
      wrong += p!.wrong;
    }
  }

  return {
    total: questions.length,
    byLevel,
    seen,
    due,
    overall: questions.length ? sum / questions.length : 0,
    answers: { correct, wrong },
  };
}

export interface TopicStrength {
  topic: Topic;
  total: number;
  seen: number;
  /**
   * How well the questions already practised in this topic are known, 0 to 1.
   * Averaged over the practised questions only, so a big topic does not look
   * weak merely because most of it is still untouched - that is `coverage`.
   */
  strength: number;
  /** Share of the topic that has been answered at least once, 0 to 1. */
  coverage: number;
  weak: number;
}

export function topicStrengths(questions: Question[], progress: Progress, now = Date.now()): TopicStrength[] {
  const groups = new Map<Topic, Question[]>();
  for (const q of questions) {
    const list = groups.get(q.topic);
    if (list) list.push(q);
    else groups.set(q.topic, [q]);
  }
  return [...groups.entries()].map(([topic, qs]) => {
    const s = summarise(qs, progress, now);
    const seenQuestions = qs.filter((q) => historyOf(progress[q.id]).length > 0);
    const skill = seenQuestions.length
      ? seenQuestions.reduce((sum, q) => sum + strength(progress[q.id], now), 0) / seenQuestions.length
      : 0;
    return {
      topic,
      total: qs.length,
      seen: s.seen,
      strength: skill,
      coverage: qs.length ? s.seen / qs.length : 0,
      weak: s.byLevel.weak + s.byLevel.shaky,
    };
  });
}

/** Start of the local day containing `ts`. */
const dayStart = (ts: number) => {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

const DAY = 24 * 60 * 60 * 1000;

/** Every distinct local day on which at least one question was answered. */
export function activeDays(progress: Progress): Set<number> {
  const days = new Set<number>();
  for (const p of Object.values(progress)) {
    for (const attempt of historyOf(p)) days.add(dayStart(attempt.at));
  }
  return days;
}

/**
 * Consecutive days of practice ending today, or yesterday when nothing has
 * been answered yet today - so the streak is not shown as broken until the
 * day is actually missed.
 */
export function streakDays(progress: Progress, now = Date.now()): number {
  const days = activeDays(progress);
  if (days.size === 0) return 0;
  const today = dayStart(now);
  let cursor = days.has(today) ? today : today - DAY;
  if (!days.has(cursor)) return 0;
  let count = 0;
  while (days.has(cursor)) {
    count += 1;
    cursor -= DAY;
  }
  return count;
}

export function answeredToday(progress: Progress, now = Date.now()): number {
  const today = dayStart(now);
  let n = 0;
  for (const p of Object.values(progress)) {
    for (const attempt of historyOf(p)) if (dayStart(attempt.at) >= today) n += 1;
  }
  return n;
}

/** Answers per day over the last `days` days, oldest first. */
export function recentActivity(progress: Progress, days = 14, now = Date.now()): { day: number; count: number }[] {
  const buckets = new Map<number, number>();
  const first = dayStart(now) - (days - 1) * DAY;
  for (const p of Object.values(progress)) {
    for (const attempt of historyOf(p)) {
      const day = dayStart(attempt.at);
      if (day >= first) buckets.set(day, (buckets.get(day) ?? 0) + 1);
    }
  }
  return Array.from({ length: days }, (_, i) => {
    const day = first + i * DAY;
    return { day, count: buckets.get(day) ?? 0 };
  });
}

/** Enough answers on a topic before its strength is worth comparing. */
const TOPIC_MIN_SEEN = 5;

/**
 * What to practise next, most useful first.
 *
 * Repetitions that have come due rank above everything else, because letting
 * them slip is what undoes earlier work. Then the questions that are actually
 * shaky, then the weakest topic, then new ground. Once the whole catalogue is
 * strong the suggestion becomes a full exam instead.
 */
export function recommend(questions: Question[], progress: Progress, now = Date.now()): Recommendation[] {
  const summary = summarise(questions, progress, now);
  const out: Recommendation[] = [];

  if (summary.due > 0) {
    out.push({ kind: 'due', count: summary.due, route: 'practice/due' });
  }

  const weak = summary.byLevel.weak + summary.byLevel.shaky;
  if (weak > 0) {
    out.push({ kind: 'weak', count: weak, route: 'practice/weak' });
  }

  const comparable = topicStrengths(questions, progress, now).filter((t) => t.seen >= TOPIC_MIN_SEEN);
  const weakest = comparable.sort((a, b) => a.strength - b.strength)[0];
  if (weakest && weakest.strength < 0.7) {
    out.push({ kind: 'topic', count: weakest.weak, topic: weakest.topic, route: `practice/${weakest.topic}` });
  }

  if (summary.byLevel.new > 0) {
    out.push({ kind: 'new', count: summary.byLevel.new, route: 'practice/all' });
  }

  if (summary.byLevel.new === 0 && weak === 0) {
    out.push({ kind: 'exam', count: summary.total, route: 'exam' });
  }

  return out.slice(0, 3);
}

/** Strongest and weakest answered questions, for the progress screen. */
export function ranked(questions: Question[], progress: Progress, now = Date.now()) {
  const scored = questions
    .filter((q) => historyOf(progress[q.id]).length > 0)
    .map((q) => ({ question: q, strength: strength(progress[q.id], now) }));
  const byStrength = scored.slice().sort((a, b) => b.strength - a.strength);
  return { strongest: byStrength, weakest: byStrength.slice().reverse() };
}
