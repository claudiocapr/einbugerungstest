/**
 * The drill frame shared by Leseverstehen and Sprachbausteine: part cards with
 * instructions and tips, the set grid with best scores, and the exercise frame
 * (optional exam-pace timer, submit with a gap warning, scoring, recording,
 * result card, "Nochmal" / "Nächster Satz").
 */
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import './drill.css';
import type { Lang, Text2 } from '../../types.ts';
import type { TopicId } from '../../content/types.ts';
import { TOPICS } from '../../content/topics.ts';
import { recordItem, recordResult, useSection, useStore } from '../../lib/storage.ts';
import { formatClock, useCountdown } from '../../lib/useCountdown.ts';
import { logError, track } from '../../lib/analytics.ts';
import { tr } from '../../lib/i18n.ts';
import { Confirm } from '../../components/Confirm.tsx';
import { bestBySet, formatPoints, scoreItems, type ScoredPart, type SetScore } from './score.ts';
import type { PartInfo } from './parts.ts';

export type { PartInfo } from './parts.ts';

export type DrillSection = 'lesen' | 'sprachbausteine';
export type Answers = (number | null)[];

const S = {
  todo: { de: 'Was ist zu tun?', en: 'What do you do?' },
  tip: { de: 'Tipp', en: 'Tip' },
  set: { de: 'Satz', en: 'Set' },
  notDone: { de: 'noch offen', en: 'not done' },
  minutes: { de: 'Min. empfohlen', en: 'min suggested' },
  points: { de: 'Punkte', en: 'points' },
  done: { de: 'erledigt', en: 'done' },
  startNext: { de: 'Nächsten offenen Satz starten', en: 'Start the next open set' },
  allDone: { de: 'Alle Sätze erledigt – wiederholen Sie die schwächsten.', en: 'All sets done – repeat the weakest ones.' },
  pace: { de: 'Prüfungstempo', en: 'Exam pace' },
  timeUp: {
    de: 'Die empfohlene Zeit ist um. In der Prüfung müssten Sie jetzt weitermachen – geben Sie ab, wenn Sie so weit sind.',
    en: 'The suggested time is up. In the exam you would have to move on now – submit when you are ready.',
  },
  answered: { de: 'beantwortet', en: 'answered' },
  submit: { de: 'Abgeben', en: 'Submit' },
  again: { de: 'Nochmal', en: 'Try again' },
  next: { de: 'Nächster Satz', en: 'Next set' },
  overview: { de: 'Übersicht', en: 'Overview' },
  correctOf: { de: 'richtig', en: 'correct' },
  passed: { de: 'Prüfungsniveau erreicht (≥ 60 %)', en: 'Pass level reached (≥ 60 %)' },
  notPassed: { de: 'Unter 60 % – weiter üben', en: 'Below 60 % – keep practising' },
  notFound: { de: 'Diesen Satz gibt es nicht.', en: 'This set does not exist.' },
} satisfies Record<string, Text2>;

const gapsWarning = (n: number, lang: Lang) =>
  lang === 'de'
    ? `${n === 1 ? 'Eine Aufgabe ist' : `${n} Aufgaben sind`} noch offen. Offene Aufgaben zählen als falsch. Trotzdem abgeben?`
    : `${n === 1 ? 'One item is' : `${n} items are`} still open. Open items count as wrong. Submit anyway?`;

export const topicIcon = (id: TopicId) => TOPICS.find((t) => t.id === id)?.icon ?? '';
export const topicName = (id: TopicId, lang: Lang) => TOPICS.find((t) => t.id === id)?.label[lang] ?? id;

export function useBest(section: DrillSection, part: ScoredPart) {
  const [store] = useStore();
  return useMemo(() => bestBySet(store.results, section, part), [store.results, section, part]);
}

/** A part with its instructions, tip and every set with its best score. */
export function PartCard({
  lang,
  section,
  info,
  sets,
  go,
  openTip = false,
}: {
  lang: Lang;
  section: DrillSection;
  info: PartInfo;
  sets: { id: string; topic: TopicId }[];
  go: (route: string) => void;
  openTip?: boolean;
}) {
  const best = useBest(section, info.part);
  const doneCount = sets.filter((s) => best[s.id]).length;
  const nextOpen = sets.find((s) => !best[s.id]);
  return (
    <section className="card partcard" aria-labelledby={`h-${info.slug}`}>
      <div className="row wrap">
        <h2 id={`h-${info.slug}`}>{tr(info.title, lang)}</h2>
        <span className="spacer" />
        <span className="meta">
          {info.maxPoints} {tr(S.points, lang)} · ~{info.minutes} {tr(S.minutes, lang)}
        </span>
      </div>
      <p className="todo">
        <b>{tr(S.todo, lang)}</b> {tr(info.todo, lang)}
      </p>
      <details open={openTip}>
        <summary>💡 {tr(S.tip, lang)}</summary>
        <p>{tr(info.tip, lang)}</p>
      </details>
      <div className="meta">
        {doneCount}/{sets.length} {tr(S.done, lang)}
      </div>
      <div className="bar good" aria-hidden="true">
        <span style={{ width: `${sets.length ? (doneCount / sets.length) * 100 : 0}%` }} />
      </div>
      <div className="setgrid">
        {sets.map((s, i) => {
          const b = best[s.id];
          const ratio = b ? b.points / (b.maxPoints || 1) : 0;
          return (
            <button
              key={s.id}
              type="button"
              className={`setbtn${b ? (ratio >= 0.6 ? ' done' : ' low') : ''}`}
              onClick={() => go(`${section}/${info.slug}/${s.id}`)}
            >
              <span className="name">
                {tr(S.set, lang)} {i + 1} {b ? (ratio >= 0.6 ? '✓' : '') : ''}
              </span>
              <span className="topic">
                {topicIcon(s.topic)} {topicName(s.topic, lang)}
              </span>
              <span className="best">
                {b ? `${formatPoints(b.points, lang)}/${b.maxPoints}` : tr(S.notDone, lang)}
              </span>
            </button>
          );
        })}
      </div>
      {nextOpen ? (
        <button type="button" className="btn primary" onClick={() => go(`${section}/${info.slug}/${nextOpen.id}`)}>
          {tr(S.startNext, lang)}
        </button>
      ) : (
        <p className="small muted" style={{ margin: 0 }}>
          {tr(S.allDone, lang)}
        </p>
      )}
    </section>
  );
}

/** Explanation box under an item after submitting. */
export function Verdict({ ok, head, body }: { ok: boolean; head: ReactNode; body: ReactNode }) {
  return (
    <div className={`verdict ${ok ? 'good' : 'bad'}`}>
      <div className="head">{head}</div>
      <div className="body">{body}</div>
    </div>
  );
}

function Clock({ ms, onDone }: { ms: number; onDone: () => void }) {
  const [duration] = useState(ms);
  const left = useCountdown(duration, true, onDone);
  return (
    <span className={`clock${left < 120_000 ? ' urgent' : ''}`} role="timer" aria-live="off">
      {formatClock(left)}
    </span>
  );
}

export interface DrillContext {
  answers: Answers;
  /** Functional update of all answers (lets tasks enforce "each choice once"). */
  update: (fn: (prev: Answers) => Answers) => void;
  /** Set after submitting: the score with per-item outcomes. */
  review: SetScore | null;
}

interface SectionState {
  timer?: boolean;
  draft?: { id: string; answers: Answers; startedAt: number } | null;
}

/**
 * Runs one set: holds the answers (also kept as a small draft, so a reload
 * does not lose them), the timer, submit with warning, scoring and recording.
 */
export function DrillFrame({
  lang,
  section,
  info,
  setId,
  setNumber,
  topic,
  keys,
  go,
  nextSetId,
  children,
  dock,
}: {
  lang: Lang;
  section: DrillSection;
  info: PartInfo;
  setId: string;
  setNumber: number;
  topic: TopicId;
  /** Correct choice per item; scoring compares answers with these. */
  keys: number[];
  go: (route: string) => void;
  nextSetId?: string;
  children: (ctx: DrillContext) => ReactNode;
  /** Extra content for the sticky bottom bar while answering (e.g. the word bank). */
  dock?: (ctx: DrillContext) => ReactNode;
}) {
  const [saved, setSaved] = useSection<SectionState>(section, {});
  const draftId = `${info.part}:${setId}`;
  const [answers, setAnswers] = useState<Answers>(() => {
    const d = saved.draft;
    return d && d.id === draftId && Array.isArray(d.answers) && d.answers.length === keys.length
      ? d.answers.map((a) => (typeof a === 'number' ? a : null))
      : keys.map(() => null);
  });
  const [startedAt, setStartedAt] = useState(() =>
    saved.draft && saved.draft.id === draftId ? Number(saved.draft.startedAt) || Date.now() : Date.now(),
  );
  const [review, setReview] = useState<SetScore | null>(null);
  const [asking, setAsking] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [timeUp, setTimeUp] = useState(false);
  const [timerFrom, setTimerFrom] = useState(startedAt);
  const timer = !!saved.timer;

  useEffect(() => {
    track(`${section}.set_started`, { part: info.part, setId });
  }, [section, info.part, setId, attempt]);

  // The latest answers, so an update can persist the draft outside a React updater.
  const latest = useRef(answers);
  latest.current = answers;
  const update = useCallback(
    (fn: (prev: Answers) => Answers) => {
      const next = fn(latest.current);
      latest.current = next;
      setAnswers(next);
      setSaved((s) => ({ ...s, draft: { id: draftId, answers: next, startedAt } }));
    },
    [draftId, startedAt, setSaved],
  );

  const open = answers.filter((a) => a === null).length;

  const finish = () => {
    setAsking(false);
    const score = scoreItems(keys, answers, info.maxPoints);
    try {
      score.items.forEach((o, i) => recordItem(`${info.part}:${setId}:${i + 1}`, o.ok, o.chosen ?? -1));
      recordResult({
        section,
        part: info.part,
        setId,
        correct: score.correct,
        total: score.total,
        points: score.points,
        maxPoints: score.maxPoints,
        startedAt,
        finishedAt: Date.now(),
      });
      setSaved((s) => ({ ...s, draft: null }));
    } catch (err) {
      logError(err, `${section}.finish`);
    }
    track(`${section}.set_finished`, { part: info.part, setId, correct: score.correct, total: score.total });
    setReview(score);
    window.scrollTo(0, 0);
  };

  const submit = () => (open > 0 ? setAsking(true) : finish());

  const retry = () => {
    const now = Date.now();
    setAnswers(keys.map(() => null));
    setReview(null);
    setStartedAt(now);
    setTimerFrom(now);
    setTimeUp(false);
    setAttempt((n) => n + 1);
    window.scrollTo(0, 0);
  };

  const toggleTimer = () => {
    if (!timer) {
      setTimerFrom(Date.now());
      setTimeUp(false);
    }
    setSaved((s) => ({ ...s, timer: !timer }));
  };
  const onTimeUp = useCallback(() => setTimeUp(true), []);

  const ctx: DrillContext = { answers, update, review };
  const back = () => go(`${section}/${info.slug}`);

  return (
    <div>
      <div className="drill-head">
        <button type="button" className="btn small ghost" onClick={back}>
          ← {tr(info.title, lang).split(' · ')[0]}
        </button>
        <span className="spacer" />
        {!review && (
          <button type="button" className="chip" aria-pressed={timer} onClick={toggleTimer}>
            ⏱ {tr(S.pace, lang)} {info.minutes}′
          </button>
        )}
        {!review && timer && (
          <Clock key={`${attempt}-${timerFrom}`} ms={info.minutes * 60_000 - (Date.now() - timerFrom)} onDone={onTimeUp} />
        )}
      </div>
      <h1 style={{ fontSize: 22, margin: '12px 0 2px' }}>
        {tr(info.title, lang)} · {tr(S.set, lang)} {setNumber}
      </h1>
      <div className="small muted">
        {topicIcon(topic)} {topicName(topic, lang)}
      </div>

      {review ? (
        <ResultCard lang={lang} score={review} onRetry={retry} onNext={nextSetId ? () => go(`${section}/${info.slug}/${nextSetId}`) : undefined} onBack={back} />
      ) : (
        <p className="drill-instr">{tr(info.todo, lang)}</p>
      )}
      {timeUp && !review && (
        <div className="verdict bad timeup" role="status">
          {tr(S.timeUp, lang)}
        </div>
      )}

      <div className="stack" style={{ marginTop: 12 }}>
        {children(ctx)}
      </div>

      {review ? (
        <div className="sticky-actions">
          <button type="button" className="btn" onClick={retry}>
            ↺ {tr(S.again, lang)}
          </button>
          <span className="spacer" />
          {nextSetId ? (
            <button type="button" className="btn primary" onClick={() => go(`${section}/${info.slug}/${nextSetId}`)}>
              {tr(S.next, lang)} →
            </button>
          ) : (
            <button type="button" className="btn primary" onClick={back}>
              {tr(S.overview, lang)}
            </button>
          )}
        </div>
      ) : (
        <div className="dock">
          {dock?.(ctx)}
          <div className="row">
            <span className="small muted">
              {keys.length - open}/{keys.length} {tr(S.answered, lang)}
            </span>
            <button type="button" className="btn primary" onClick={submit}>
              {tr(S.submit, lang)}
            </button>
          </div>
        </div>
      )}

      {asking && <Confirm lang={lang} message={gapsWarning(open, lang)} onConfirm={finish} onCancel={() => setAsking(false)} />}
    </div>
  );
}

function ResultCard({
  lang,
  score,
  onRetry,
  onNext,
  onBack,
}: {
  lang: Lang;
  score: SetScore;
  onRetry: () => void;
  onNext?: () => void;
  onBack: () => void;
}) {
  return (
    <div className="card stack" style={{ marginTop: 12 }} role="status">
      <div className="row wrap" style={{ alignItems: 'baseline' }}>
        <span className="score">
          {formatPoints(score.points, lang)}
          <span className="muted" style={{ fontSize: 22 }}>
            {' '}
            / {score.maxPoints} {tr(S.points, lang)}
          </span>
        </span>
      </div>
      <div className="row wrap">
        <span>
          {score.correct}/{score.total} {tr(S.correctOf, lang)}
        </span>
        <span className={`badge ${score.passed ? 'good' : 'bad'}`}>{tr(score.passed ? S.passed : S.notPassed, lang)}</span>
      </div>
      <div className="row wrap">
        <button type="button" className="btn" onClick={onRetry}>
          ↺ {tr(S.again, lang)}
        </button>
        {onNext && (
          <button type="button" className="btn primary" onClick={onNext}>
            {tr(S.next, lang)} →
          </button>
        )}
        <button type="button" className="btn ghost" onClick={onBack}>
          {tr(S.overview, lang)}
        </button>
      </div>
    </div>
  );
}

export function NotFound({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  return (
    <div className="card" style={{ marginTop: 24 }}>
      <p>{tr(S.notFound, lang)}</p>
      <button type="button" className="btn" onClick={onBack}>
        ← {tr(S.overview, lang)}
      </button>
    </div>
  );
}

/** "Richtig" / "Falsch – Ihre Antwort: …" head line for a verdict. */
export function verdictHead(ok: boolean, lang: Lang, chosen: string | null, correct: string): string {
  if (ok) return lang === 'de' ? `✓ Richtig: ${correct}` : `✓ Correct: ${correct}`;
  if (chosen === null) return lang === 'de' ? `✗ Nicht beantwortet. Richtig: ${correct}` : `✗ Not answered. Correct: ${correct}`;
  return lang === 'de' ? `✗ Ihre Antwort: ${chosen} – richtig: ${correct}` : `✗ Your answer: ${chosen} – correct: ${correct}`;
}
