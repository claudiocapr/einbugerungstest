import { useCallback, useEffect, useState } from 'react';
import type { PhraseGroup, Speaking1Card, Speaking2Task, Speaking3Task } from '../../content/types.ts';
import type { Lang, Text2 } from '../../types.ts';
import { sprechenPhrases } from '../../content/sprechen.ts';
import { track } from '../../lib/analytics.ts';
import { tr } from '../../lib/i18n.ts';
import { recordResult, useSection } from '../../lib/storage.ts';
import { stop } from '../../lib/tts.ts';
import { formatClock, useCountdown } from '../../lib/useCountdown.ts';
import { Dialogue } from './Dialogue.tsx';
import { Recorder } from './Recorder.tsx';
import {
  CRITERIA,
  LEVELS,
  PART_MINUTES,
  PREP_MINUTES,
  TASK_CHECKS,
  criterionPoints,
  speakingScore,
  sprechenExamPart,
  type SelfRating,
  type SprechenPart,
} from './score.ts';

export type SprechenTask = Speaking1Card | Speaking2Task | Speaking3Task;

interface Settings {
  prepMinutes: number;
}
const DEFAULT_SETTINGS: Settings = { prepMinutes: 20 };

const S = {
  instruction1: {
    de: 'Unterhalten Sie sich mit Ihrer Partnerin / Ihrem Partner. Erzählen Sie von sich und stellen Sie Fragen zu diesen Punkten:',
    en: 'Talk with your partner. Tell them about yourself and ask about these points:',
  },
  extra: { de: 'Mögliche Zusatzfragen der Prüfenden', en: 'Possible extra questions from the examiners' },
  instruction2: {
    de: 'Sie haben in einer Zeitschrift einen kurzen Text zu diesem Thema gelesen. Berichten Sie Ihrer Partnerin / Ihrem Partner, was darin steht. Sie / Er hat eine andere Meinung gelesen und berichtet Ihnen davon. Sprechen Sie dann zusammen über das Thema: Sagen Sie Ihre Meinung und erzählen Sie von eigenen Erfahrungen.',
    en: 'You read a short magazine text on this theme. Tell your partner what it says. Your partner read a different opinion and tells you about it. Then discuss the theme together: give your opinion and talk about your own experience.',
  },
  sheet: { de: 'Aufgabenblatt', en: 'Task sheet' },
  sheetHint: {
    de: 'In der Prüfung sehen Sie nur Ihr eigenes Blatt.',
    en: 'In the exam you only see your own sheet.',
  },
  instruction3: {
    de: 'Planen Sie gemeinsam. Machen Sie Vorschläge, reagieren Sie auf die Vorschläge Ihrer Partnerin / Ihres Partners und einigen Sie sich am Ende, wer was macht. Sie haben sich schon diese Liste gemacht:',
    en: 'Plan together. Make suggestions, respond to your partner’s suggestions and agree in the end who does what. You have already made this list:',
  },
  duration: { de: 'In der Prüfung: etwa {n} Minuten', en: 'In the exam: about {n} minutes' },
  prep: { de: 'Vorbereitungszeit', en: 'Preparation time' },
  prepHint: {
    de: 'In der Prüfung haben Sie 20 Minuten für alle drei Teile. Machen Sie sich Notizen, aber lesen Sie im Gespräch nicht ab.',
    en: 'In the exam you get 20 minutes for all three parts. Take notes, but do not read them out in the conversation.',
  },
  min: { de: 'Min.', en: 'min' },
  start: { de: 'Start', en: 'Start' },
  reset: { de: 'Zurücksetzen', en: 'Reset' },
  timeUp: { de: 'Die Zeit ist um. Jetzt sprechen!', en: 'Time is up. Start speaking!' },
  phrases: { de: 'Redemittel', en: 'Useful phrases' },
  allPhrases: { de: 'Alle Redemittel', en: 'All phrases' },
  selfCheck: { de: 'Selbstbewertung', en: 'Self-assessment' },
  selfHint: {
    de: 'Hören Sie Ihre Aufnahme an und bewerten Sie sich ehrlich nach den vier telc-Kriterien. A = sehr gut … D = nicht ausreichend.',
    en: 'Listen to your recording and rate yourself honestly on the four telc criteria. A = very good … D = not sufficient.',
  },
  checks: { de: 'Habe ich alles gemacht?', en: 'Did I do everything?' },
  save: { de: 'Ergebnis speichern', en: 'Save result' },
  saved: { de: 'Gespeichert. Üben Sie die Aufgabe ruhig noch einmal!', en: 'Saved. Feel free to practise the task again!' },
  rateAll: { de: 'Bitte alle vier Kriterien bewerten.', en: 'Please rate all four criteria.' },
  points: { de: 'Punkte', en: 'points' },
} satisfies Record<string, Text2>;

const GROUPS_FOR: Record<SprechenPart, string[]> = {
  1: ['nachfragen', 'erfahrung', 'zeit'],
  2: ['zusammenfassen', 'meinung', 'zustimmen', 'widersprechen', 'erfahrung', 'nachfragen', 'zeit'],
  3: ['vorschlagen', 'annehmen', 'ablehnen', 'einigen', 'zustimmen', 'widersprechen', 'zeit'],
};

export function Task({ lang, part, task, go }: { lang: Lang; part: SprechenPart; task: SprechenTask; go: (r: string) => void }) {
  const [startedAt] = useState(() => Date.now());
  useEffect(() => {
    track('sprechen.task_opened', { part, setId: task.id });
    return () => stop();
  }, [part, task.id]);

  return (
    <div className="sprechen stack">
      <TaskCard lang={lang} part={part} task={task} />
      <PrepTimer lang={lang} />
      <PhraseBank lang={lang} groups={GROUPS_FOR[part].flatMap((id) => sprechenPhrases.filter((g) => g.id === id))} />
      <button type="button" className="btn small ghost" style={{ justifySelf: 'start' }} onClick={() => go('sprechen/redemittel')}>
        📚 {tr(S.allPhrases, lang)} →
      </button>
      <Recorder lang={lang} part={part} setId={task.id} />
      <Dialogue lang={lang} model={task.model} />
      <SelfCheck lang={lang} part={part} setId={task.id} startedAt={startedAt} />
    </div>
  );
}

function TaskCard({ lang, part, task }: { lang: Lang; part: SprechenPart; task: SprechenTask }) {
  const [sheet, setSheet] = useState<'a' | 'b'>('a');
  const duration = tr(S.duration, lang).replace('{n}', String(PART_MINUTES[part]));

  if (part === 1) {
    const card = task as Speaking1Card;
    return (
      <div className="card task-card">
        <p style={{ marginTop: 0 }}>{tr(S.instruction1, lang)}</p>
        <ul className="points">
          {card.points.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
        <p className="muted small" style={{ marginBottom: 4 }}>
          {tr(S.extra, lang)}:
        </p>
        <ul className="points small">
          {card.extraQuestions.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ul>
        <p className="muted small" style={{ marginBottom: 0 }}>
          {duration}
        </p>
      </div>
    );
  }

  if (part === 2) {
    const t = task as Speaking2Task;
    const side = sheet === 'a' ? t.a : t.b;
    return (
      <div className="card task-card">
        <h2 style={{ marginTop: 0 }}>„{t.theme}“</h2>
        <p>{tr(S.instruction2, lang)}</p>
        <div className="chips" role="tablist">
          {(['a', 'b'] as const).map((s) => (
            <button key={s} type="button" className="chip" role="tab" aria-selected={sheet === s} aria-pressed={sheet === s} onClick={() => setSheet(s)}>
              {tr(S.sheet, lang)} {s.toUpperCase()}
            </button>
          ))}
        </div>
        <blockquote className="opinion">
          <p>„{side.text}“</p>
          <footer>{side.person}</footer>
        </blockquote>
        <p className="muted small" style={{ marginBottom: 0 }}>
          {tr(S.sheetHint, lang)} {duration}
        </p>
      </div>
    );
  }

  const t = task as Speaking3Task;
  return (
    <div className="card task-card">
      <p style={{ marginTop: 0 }}>{t.situation}</p>
      <p>{tr(S.instruction3, lang)}</p>
      <ul className="checklist">
        {t.checklist.map((c) => (
          <li key={c}>{c}</li>
        ))}
        <li className="muted">…</li>
      </ul>
      <p className="muted small" style={{ marginBottom: 0 }}>
        {duration}
      </p>
    </div>
  );
}

function Clock({ ms, onDone }: { ms: number; onDone: () => void }) {
  const left = useCountdown(ms, true, onDone);
  return <span className={`clock ${left <= 60_000 ? 'urgent' : ''}`}>{formatClock(left)}</span>;
}

function PrepTimer({ lang }: { lang: Lang }) {
  const [settings, setSettings] = useSection<Settings>('sprechen', DEFAULT_SETTINGS);
  const minutes = (PREP_MINUTES as readonly number[]).includes(settings.prepMinutes) ? settings.prepMinutes : 20;
  const [run, setRun] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const onDone = useCallback(() => setDone(true), []);

  return (
    <div className="card stack">
      <h2 style={{ margin: 0 }}>⏳ {tr(S.prep, lang)}</h2>
      <p className="muted small" style={{ margin: 0 }}>
        {tr(S.prepHint, lang)}
      </p>
      <div className="row wrap">
        <div className="chips">
          {PREP_MINUTES.map((m) => (
            <button
              key={m}
              type="button"
              className="chip"
              aria-pressed={minutes === m}
              disabled={run !== null}
              onClick={() => setSettings((s) => ({ ...s, prepMinutes: m }))}
            >
              {m} {tr(S.min, lang)}
            </button>
          ))}
        </div>
        <span className="spacer" />
        {run !== null ? <Clock key={run} ms={minutes * 60_000} onDone={onDone} /> : <span className="clock">{formatClock(minutes * 60_000)}</span>}
        {run === null ? (
          <button
            type="button"
            className="btn small primary"
            onClick={() => {
              setDone(false);
              setRun(Date.now());
            }}
          >
            ▶ {tr(S.start, lang)}
          </button>
        ) : (
          <button
            type="button"
            className="btn small"
            onClick={() => {
              setRun(null);
              setDone(false);
            }}
          >
            ↺ {tr(S.reset, lang)}
          </button>
        )}
      </div>
      {done && <p className="good" style={{ margin: 0 }}>{tr(S.timeUp, lang)}</p>}
    </div>
  );
}

export function PhraseBank({ lang, groups, open = false }: { lang: Lang; groups: PhraseGroup[]; open?: boolean }) {
  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>💡 {tr(S.phrases, lang)}</h2>
      <div className="qlist phrases">
        {groups.map((g) => (
          <details key={g.id} open={open}>
            <summary>{tr(g.label, lang)}</summary>
            <ul>
              {g.phrases.map((p) => (
                <li key={p.de}>
                  <span className="de">{p.de}</span>
                  <span className="en muted small">{p.en}</span>
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </div>
  );
}

function SelfCheck({ lang, part, setId, startedAt }: { lang: Lang; part: SprechenPart; setId: string; startedAt: number }) {
  const checks = TASK_CHECKS[part];
  const [ticked, setTicked] = useState<boolean[]>(() => checks.map(() => false));
  const [rating, setRating] = useState<SelfRating>({});
  const [saved, setSaved] = useState(false);
  const score = speakingScore(part, rating);

  const save = () => {
    if (!score.complete) return;
    recordResult({
      section: 'sprechen',
      part: sprechenExamPart(part),
      setId,
      correct: score.points,
      total: score.maxPoints,
      points: score.points,
      maxPoints: score.maxPoints,
      selfAssessed: true,
      startedAt,
      finishedAt: Date.now(),
    });
    track('sprechen.self_assessed', { part, setId, points: score.points, maxPoints: score.maxPoints });
    setSaved(true);
  };

  return (
    <div className="card stack">
      <h2 style={{ margin: 0 }}>✅ {tr(S.selfCheck, lang)}</h2>
      <p className="muted small" style={{ margin: 0 }}>
        {tr(S.selfHint, lang)}
      </p>
      <div>
        <strong className="small">{tr(S.checks, lang)}</strong>
        <ul className="ticks">
          {checks.map((c, i) => (
            <li key={i}>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={ticked[i]}
                  onChange={(e) => {
                    const on = e.target.checked;
                    setTicked((prev) => prev.map((v, k) => (k === i ? on : v)));
                  }}
                />{' '}
                {tr(c, lang)}
              </label>
            </li>
          ))}
        </ul>
      </div>
      {CRITERIA.map((c) => (
        <div key={c.id} className="criterion">
          <div className="row">
            <strong>{tr(c.label, lang)}</strong>
            <span className="spacer" />
            {rating[c.id] && (
              <span className="badge">
                {criterionPoints(part, c.id, rating[c.id]!)} {tr(S.points, lang)}
              </span>
            )}
          </div>
          <div className="muted small">{tr(c.hint, lang)}</div>
          <div className="levels">
            {LEVELS.map((level, i) => (
              <button
                key={level}
                type="button"
                className={`option ${rating[c.id] === level ? 'selected' : ''}`}
                aria-pressed={rating[c.id] === level}
                onClick={() => {
                  setSaved(false);
                  setRating((r) => ({ ...r, [c.id]: level }));
                }}
              >
                <span className="key">{level}</span>
                <span className="body small">{tr(c.bands[i], lang)}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
      <div className="row wrap">
        <span className="score-small">
          {score.points} / {score.maxPoints} {tr(S.points, lang)}
        </span>
        <span className="spacer" />
        <button type="button" className="btn primary" disabled={!score.complete || saved} onClick={save}>
          {tr(S.save, lang)}
        </button>
      </div>
      {!score.complete && <p className="muted small" style={{ margin: 0 }}>{tr(S.rateAll, lang)}</p>}
      {saved && <p className="good" style={{ margin: 0 }}>{tr(S.saved, lang)}</p>}
    </div>
  );
}
