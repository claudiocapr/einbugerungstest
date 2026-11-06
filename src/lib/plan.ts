import type { DrillResult, ExamPart, ItemProgress } from '../types.ts';
import { isDue } from './srs.ts';

/**
 * Daily activity and the "today" plan on the home screen. Pure functions over
 * the store, so they are cheap to test and never load exam content.
 */

const DAY = 24 * 60 * 60 * 1000;

export const startOfDay = (t: number) => {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

/** Answers per local day for the last `days` days, oldest first. */
export function activityByDay(progress: Record<string, ItemProgress>, now = Date.now(), days = 14): number[] {
  const today = startOfDay(now);
  const counts = new Array<number>(days).fill(0);
  for (const p of Object.values(progress)) {
    for (const a of p.history) {
      const back = Math.round((today - startOfDay(a.at)) / DAY);
      if (back >= 0 && back < days) counts[days - 1 - back]++;
    }
  }
  return counts;
}

/** Answers given today. History keeps the last 10 answers per item, which is plenty for a daily count. */
export const answeredToday = (progress: Record<string, ItemProgress>, now = Date.now()) =>
  activityByDay(progress, now, 1)[0];

/**
 * Consecutive days with at least one answer or finished task, ending today
 * (or yesterday, so the streak does not look broken before today's practice).
 */
export function streak(progress: Record<string, ItemProgress>, results: DrillResult[], now = Date.now()): number {
  const days = new Set<number>();
  for (const p of Object.values(progress)) for (const a of p.history) days.add(startOfDay(a.at));
  for (const r of results) days.add(startOfDay(r.finishedAt));
  let day = startOfDay(now);
  if (!days.has(day)) day = startOfDay(day - DAY / 2);
  let n = 0;
  while (days.has(day)) {
    n++;
    day = startOfDay(day - DAY / 2);
  }
  return n;
}

/** Vocabulary cards seen before and due again now (new cards are not "due"). */
export const dueVocab = (progress: Record<string, ItemProgress>, now = Date.now()) =>
  Object.entries(progress).filter(([id, p]) => id.startsWith('vocab:') && p.box > 0 && isDue(p, now)).length;

/** The auto-marked exam parts, in exam order, with their route. */
export const DRILL_PARTS: { part: ExamPart; route: string }[] = [
  { part: 'lesen1', route: 'lesen/teil1' },
  { part: 'lesen2', route: 'lesen/teil2' },
  { part: 'lesen3', route: 'lesen/teil3' },
  { part: 'sb1', route: 'sprachbausteine/teil1' },
  { part: 'sb2', route: 'sprachbausteine/teil2' },
  { part: 'hoeren1', route: 'hoeren/teil1' },
  { part: 'hoeren2', route: 'hoeren/teil2' },
  { part: 'hoeren3', route: 'hoeren/teil3' },
];

const ratioOf = (r: DrillResult) =>
  typeof r.points === 'number' && r.maxPoints ? r.points / r.maxPoints : r.total > 0 ? r.correct / r.total : 0;

/**
 * The exam part to drill today: a part never tried comes first (in exam
 * order); otherwise the part with the weakest recent average (last 3 results).
 */
export function partOfTheDay(results: DrillResult[]): { part: ExamPart; route: string; ratio: number | null } {
  const recent = new Map<ExamPart, number[]>();
  for (const r of results) {
    if (!r.part) continue;
    const list = recent.get(r.part) ?? [];
    if (list.length < 3) list.push(ratioOf(r));
    recent.set(r.part, list);
  }
  const untried = DRILL_PARTS.find((p) => !recent.has(p.part));
  if (untried) return { ...untried, ratio: null };
  let best = { ...DRILL_PARTS[0], ratio: 2 };
  for (const p of DRILL_PARTS) {
    const list = recent.get(p.part)!;
    const avg = list.reduce((a, b) => a + b, 0) / list.length;
    if (avg < best.ratio) best = { ...p, ratio: avg };
  }
  return best;
}

/** Writing and speaking alternate by day, so both get practised every week. */
export const productiveOfTheDay = (now = Date.now()): 'schreiben' | 'sprechen' =>
  Math.floor(startOfDay(now) / DAY) % 2 === 0 ? 'schreiben' : 'sprechen';
