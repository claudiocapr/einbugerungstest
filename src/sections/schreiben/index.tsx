// Schriftlicher Ausdruck: answer an e-mail covering four Leitpunkte, then
// check it against a model answer and grade it on telc's three criteria.
//
// Routes: #/schreiben                  task list
//         #/schreiben/<taskId>         writing screen
//         #/schreiben/<taskId>/check   self-check and grade
//         #/schreiben/redemittel       phrase bank
import { useCallback, useMemo, useState } from 'react';
import type { SectionProps } from '../types.ts';
import type { Lang } from '../../types.ts';
import type { WritingTask } from '../../content/types.ts';
import { writingPhrases, writingTasks } from '../../content/schreiben.ts';
import { TOPICS, topicLabel } from '../../content/topics.ts';
import { Confirm } from '../../components/Confirm.tsx';
import { recordResult, useSection, useStore } from '../../lib/storage.ts';
import { formatClock, useCountdown } from '../../lib/useCountdown.ts';
import { logError, track } from '../../lib/analytics.ts';
import { tr } from '../../lib/i18n.ts';
import { MAX_TEXT_LENGTH, countWords, writingHints } from './hints.ts';
import { WRITING_MAX, isGrade, writingPoints, type Grade } from './criteria.ts';
import { Editor, IncomingMail, Leitpunkte } from './WritingDesk.tsx';
import { SelfCheck } from './SelfCheck.tsx';
import { useBufferedText } from './useBufferedText.ts';

const L = {
  title: { de: 'Schriftlicher Ausdruck', en: 'Writing' },
  intro: {
    de: 'In der Prüfung haben Sie 30 Minuten: Sie beantworten eine E-Mail und schreiben etwas zu vier Leitpunkten – informell (du) oder halbformell (Sie), etwa 100–150 Wörter. Bewertet werden Aufgabenbewältigung, kommunikative Gestaltung und formale Richtigkeit; maximal 45 Punkte.',
    en: 'In the exam you have 30 minutes: you answer an e-mail and cover four points – informal (du) or semi-formal (Sie), about 100–150 words. Graded on task completion, communicative design and accuracy; 45 points at most.',
  },
  phrases: { de: 'Redemittel ansehen', en: 'Browse useful phrases' },
  phraseTitle: { de: 'Redemittel für die E-Mail', en: 'Useful phrases for the e-mail' },
  all: { de: 'Alle', en: 'All' },
  informal: { de: 'Informell', en: 'Informal' },
  semiformal: { de: 'Halbformell', en: 'Semi-formal' },
  informalShort: { de: 'informell', en: 'informal' },
  semiformalShort: { de: 'halbformell', en: 'semi-formal' },
  draft: { de: 'Entwurf', en: 'Draft' },
  words: { de: 'Wörter', en: 'words' },
  last: { de: 'Zuletzt', en: 'Last' },
  back: { de: 'Aufgaben', en: 'Tasks' },
  backToText: { de: 'Zurück zum Text', en: 'Back to the text' },
  notFound: { de: 'Diese Aufgabe gibt es nicht.', en: 'This task does not exist.' },
  timer: { de: '30-Minuten-Timer', en: '30-minute timer' },
  startTimer: { de: 'Timer starten', en: 'Start timer' },
  stopTimer: { de: 'Timer stoppen', en: 'Stop timer' },
  timeUp: { de: 'Die 30 Minuten sind um. Kommen Sie zum Schluss.', en: 'The 30 minutes are up. Wrap up.' },
  done: { de: 'Fertig – selbst bewerten', en: 'Done – assess it' },
  discard: { de: 'Entwurf löschen', en: 'Delete draft' },
  confirmDiscard: { de: 'Den Entwurf für diese Aufgabe löschen?', en: 'Delete the draft for this task?' },
  quickHints: { de: 'Hinweise', en: 'Hints' },
  savedLocally: { de: 'Der Entwurf wird automatisch auf diesem Gerät gespeichert.', en: 'The draft is saved automatically on this device.' },
  noText: { de: 'Sie haben für diese Aufgabe noch nichts geschrieben.', en: 'You have not written anything for this task yet.' },
  write: { de: 'Jetzt schreiben', en: 'Write now' },
  save: { de: 'Ergebnis speichern', en: 'Save result' },
  gradeAll: { de: 'Wählen Sie für alle drei Kriterien A, B, C oder D.', en: 'Choose A, B, C or D for all three criteria.' },
  saved: { de: 'Gespeichert', en: 'Saved' },
  again: { de: 'Neu schreiben', en: 'Write it again' },
  next: { de: 'Nächste Aufgabe', en: 'Next task' },
  toList: { de: 'Zur Übersicht', en: 'To the overview' },
};

/* ----------------------------------------------------------------- state */

interface Draft {
  text: string;
  ticked: boolean[];
  checks: string[];
  grades: (Grade | null)[];
  timerEndsAt: number | null;
  startedAt: number;
  savedAt: number;
  /** When the current text's grade was recorded; reset when the text changes. */
  resultAt: number | null;
}

interface SchreibenState {
  drafts: Record<string, Draft>;
}

const MAX_DRAFTS = 25;
const TIMER_MS = 30 * 60 * 1000;

const emptyDraft = (now = Date.now()): Draft => ({
  text: '', ticked: [false, false, false, false], checks: [], grades: [null, null, null],
  timerEndsAt: null, startedAt: now, savedAt: now, resultAt: null,
});

/** Synced data may come from an older or damaged save; never trust its shape. */
function readDraft(raw: unknown): Draft | null {
  if (!raw || typeof raw !== 'object') return null;
  const d = raw as Partial<Draft>;
  return {
    text: typeof d.text === 'string' ? d.text.slice(0, MAX_TEXT_LENGTH) : '',
    ticked: [0, 1, 2, 3].map((i) => Boolean(Array.isArray(d.ticked) && d.ticked[i])),
    checks: Array.isArray(d.checks) ? d.checks.filter((c): c is string => typeof c === 'string') : [],
    grades: [0, 1, 2].map((i) => (Array.isArray(d.grades) && isGrade(d.grades[i]) ? d.grades[i] : null)),
    timerEndsAt: typeof d.timerEndsAt === 'number' ? d.timerEndsAt : null,
    startedAt: Number(d.startedAt) || Date.now(),
    savedAt: Number(d.savedAt) || 0,
    resultAt: typeof d.resultAt === 'number' ? d.resultAt : null,
  };
}

function useDrafts() {
  const [state, setState] = useSection<SchreibenState>('schreiben', { drafts: {} });
  const drafts = state && typeof state === 'object' && state.drafts && typeof state.drafts === 'object' ? state.drafts : {};
  const get = useCallback((id: string) => readDraft(drafts[id]), [drafts]);
  const update = useCallback(
    (id: string, fn: (d: Draft) => Draft | null) =>
      setState((prev) => {
        const all = { ...(prev?.drafts ?? {}) };
        const existing = readDraft(all[id]);
        const base = existing ?? emptyDraft();
        const next = fn(base);
        // Unchanged (or nothing to create): leave the store alone.
        if (next === base) return prev;
        if (next) all[id] = { ...next, savedAt: Date.now() };
        else delete all[id];
        // Keep only the newest drafts so the synced store stays small.
        const kept = Object.entries(all)
          .sort((a, b) => (readDraft(b[1])?.savedAt ?? 0) - (readDraft(a[1])?.savedAt ?? 0))
          .slice(0, MAX_DRAFTS);
        return { drafts: Object.fromEntries(kept) };
      }),
    [setState],
  );
  return { drafts, get, update };
}

/* ------------------------------------------------------------------ screens */

export default function Schreiben({ lang, path, go }: SectionProps) {
  const [head, sub] = path;
  if (!head) return <TaskList lang={lang} go={go} />;
  if (head === 'redemittel') return <PhraseList lang={lang} go={go} />;
  const task = writingTasks.find((t) => t.id === head);
  if (!task) {
    return (
      <div className="card" style={{ marginTop: 24 }}>
        <p>{tr(L.notFound, lang)}</p>
        <button type="button" className="btn" onClick={() => go('schreiben')}>
          ← {tr(L.back, lang)}
        </button>
      </div>
    );
  }
  if (sub === 'check') return <CheckScreen key={task.id} task={task} lang={lang} go={go} />;
  return <WriteScreen key={task.id} task={task} lang={lang} go={go} />;
}

type ScreenProps = { lang: Lang; go: (route: string) => void };

function TaskList({ lang, go }: ScreenProps) {
  const [store] = useStore();
  const { drafts } = useDrafts();
  const [filter, setFilter] = useState<'all' | WritingTask['register']>('all');
  const lastPoints = useMemo(() => {
    const out: Record<string, number> = {};
    for (const r of store.results) {
      if (r.section === 'schreiben' && r.setId && out[r.setId] === undefined && typeof r.points === 'number') out[r.setId] = r.points;
    }
    return out;
  }, [store.results]);
  const shown = writingTasks.filter((t) => filter === 'all' || t.register === filter);

  return (
    <div>
      <h1>{tr(L.title, lang)}</h1>
      <p className="muted" style={{ marginTop: 0 }}>{tr(L.intro, lang)}</p>
      <div className="row wrap" style={{ marginBottom: 14 }}>
        <div className="chips">
          {(['all', 'informal', 'semiformal'] as const).map((f) => (
            <button key={f} type="button" className="chip" aria-pressed={filter === f} onClick={() => setFilter(f)}>
              {tr(f === 'all' ? L.all : f === 'informal' ? L.informal : L.semiformal, lang)}
            </button>
          ))}
        </div>
        <span className="spacer" />
        <button type="button" className="btn small ghost" onClick={() => go('schreiben/redemittel')}>
          💬 {tr(L.phrases, lang)}
        </button>
      </div>
      <div className="stack">
        {shown.map((t) => {
          const draft = readDraft(drafts[t.id]);
          const words = draft ? countWords(draft.text) : 0;
          const points = lastPoints[t.id];
          return (
            <button key={t.id} type="button" className="tile" onClick={() => go(`schreiben/${t.id}`)}>
              <span className="icon">{TOPICS.find((x) => x.id === t.topic)?.icon ?? '✉️'}</span>
              <span style={{ flex: 1 }}>
                <span className="title" lang="de">{t.incoming.subject}</span>
                <span className="sub">
                  {t.incoming.from} · {tr(t.register === 'informal' ? L.informalShort : L.semiformalShort, lang)} · {topicLabel(t.topic, lang)}
                </span>
              </span>
              {points !== undefined ? (
                <span className={`badge ${points >= WRITING_MAX * 0.6 ? 'good' : 'bad'}`} title={tr(L.last, lang)}>
                  {points}/{WRITING_MAX}
                </span>
              ) : words > 0 ? (
                <span className="small muted">
                  {tr(L.draft, lang)} · {words} {tr(L.words, lang)}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Timer({ endsAt, lang }: { endsAt: number; lang: Lang }) {
  const [duration] = useState(() => Math.max(0, endsAt - Date.now()));
  const remaining = useCountdown(duration, true);
  const over = remaining <= 0;
  return (
    <>
      <span className={`clock${remaining < 5 * 60 * 1000 ? ' urgent' : ''}`} role="timer">
        {formatClock(remaining)}
      </span>
      {over && <span className="small bad">{tr(L.timeUp, lang)}</span>}
    </>
  );
}

function WriteScreen({ task, lang, go }: ScreenProps & { task: WritingTask }) {
  const { get, update } = useDrafts();
  const draft = get(task.id) ?? emptyDraft();
  const [confirming, setConfirming] = useState(false);
  const [text, setText] = useBufferedText(draft.text, (value) =>
    update(task.id, (d) => (d.text === value ? d : { ...d, text: value, resultAt: null })),
  );
  const hints = text.trim() ? writingHints(text, task.register).filter((h) => !h.ok) : [];

  return (
    <div className="stack" style={{ marginTop: 14 }}>
      <div className="row">
        <button type="button" className="btn small ghost" onClick={() => go('schreiben')}>
          ← {tr(L.back, lang)}
        </button>
        <span className="spacer" />
        {draft.timerEndsAt ? (
          <>
            <Timer key={draft.timerEndsAt} endsAt={draft.timerEndsAt} lang={lang} />
            <button type="button" className="btn small ghost" onClick={() => update(task.id, (d) => ({ ...d, timerEndsAt: null }))}>
              {tr(L.stopTimer, lang)}
            </button>
          </>
        ) : (
          <button
            type="button"
            className="btn small"
            onClick={() => {
              update(task.id, (d) => ({ ...d, timerEndsAt: Date.now() + TIMER_MS }));
              track('schreiben.timer_started', { taskId: task.id });
            }}
          >
            ⏱️ {tr(L.startTimer, lang)}
          </button>
        )}
      </div>

      <IncomingMail task={task} lang={lang} />
      <Leitpunkte
        task={task}
        lang={lang}
        ticked={draft.ticked}
        onToggle={(i) => update(task.id, (d) => ({ ...d, ticked: d.ticked.map((v, k) => (k === i ? !v : v)) }))}
      />
      <Editor task={task} lang={lang} text={text} onText={setText} />

      {hints.length > 0 && countWords(text) >= 30 && (
        <details className="card">
          <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
            {tr(L.quickHints, lang)} ({hints.length})
          </summary>
          <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
            {hints.map((h) => (
              <li key={h.id}>{tr(h.text, lang)}</li>
            ))}
          </ul>
        </details>
      )}

      <p className="small muted" style={{ margin: 0 }}>{tr(L.savedLocally, lang)}</p>
      <div className="sticky-actions">
        <button type="button" className="btn primary" style={{ flex: 1 }} onClick={() => go(`schreiben/${task.id}/check`)}>
          {tr(L.done, lang)} →
        </button>
        <button type="button" className="btn danger" disabled={!text && !get(task.id)} onClick={() => setConfirming(true)}>
          {tr(L.discard, lang)}
        </button>
      </div>

      {confirming && (
        <Confirm
          lang={lang}
          message={tr(L.confirmDiscard, lang)}
          onCancel={() => setConfirming(false)}
          onConfirm={() => {
            setConfirming(false);
            setText('');
            update(task.id, () => null);
          }}
        />
      )}
    </div>
  );
}

function CheckScreen({ task, lang, go }: ScreenProps & { task: WritingTask }) {
  const { get, update } = useDrafts();
  const draft = get(task.id);

  if (!draft || !draft.text.trim()) {
    return (
      <div className="card" style={{ marginTop: 24 }}>
        <p>{tr(L.noText, lang)}</p>
        <button type="button" className="btn primary" onClick={() => go(`schreiben/${task.id}`)}>
          {tr(L.write, lang)}
        </button>
      </div>
    );
  }

  const covered = draft.ticked.filter(Boolean).length;
  const allGraded = draft.grades.every((g) => g !== null);
  const points = writingPoints(draft.grades);
  const index = writingTasks.findIndex((t) => t.id === task.id);
  const nextTask = writingTasks[(index + 1) % writingTasks.length];

  const save = () => {
    try {
      const now = Date.now();
      recordResult({
        section: 'schreiben',
        part: 'schreiben',
        setId: task.id,
        // Leitpunkte covered out of four; the telc points are in points/maxPoints.
        correct: covered,
        total: 4,
        points,
        maxPoints: WRITING_MAX,
        selfAssessed: true,
        startedAt: draft.startedAt,
        finishedAt: now,
      });
      update(task.id, (d) => ({ ...d, resultAt: now, timerEndsAt: null }));
      track('schreiben.task_finished', { taskId: task.id, points });
    } catch (err) {
      logError(err, 'schreiben.save');
    }
  };

  return (
    <div className="stack" style={{ marginTop: 14 }}>
      <div className="row">
        <button type="button" className="btn small ghost" onClick={() => go(`schreiben/${task.id}`)}>
          ← {tr(L.backToText, lang)}
        </button>
      </div>
      <h1 style={{ margin: 0 }} lang="de">{task.incoming.subject}</h1>
      <Leitpunkte task={task} lang={lang} ticked={draft.ticked} />
      <SelfCheck
        task={task}
        lang={lang}
        text={draft.text}
        pointsCovered={covered}
        checks={draft.checks}
        grades={draft.grades}
        disabled={draft.resultAt !== null}
        onChecks={(checks) => update(task.id, (d) => ({ ...d, checks }))}
        onGrades={(grades) => update(task.id, (d) => ({ ...d, grades }))}
      />

      {draft.resultAt === null ? (
        <div className="sticky-actions" style={{ flexDirection: 'column' }}>
          {!allGraded && <span className="small muted">{tr(L.gradeAll, lang)}</span>}
          <button type="button" className="btn primary block" disabled={!allGraded} onClick={save}>
            {tr(L.save, lang)} {allGraded ? `(${points}/${WRITING_MAX})` : ''}
          </button>
        </div>
      ) : (
        <div className="card">
          <div className={`verdict ${points >= WRITING_MAX * 0.6 ? 'good' : 'bad'}`} style={{ marginTop: 0 }}>
            <div className="head">
              ✓ {tr(L.saved, lang)}: {points}/{WRITING_MAX}
            </div>
          </div>
          <div className="row wrap" style={{ marginTop: 12 }}>
            <button
              type="button"
              className="btn"
              onClick={() => {
                update(task.id, () => null);
                go(`schreiben/${task.id}`);
              }}
            >
              {tr(L.again, lang)}
            </button>
            <button type="button" className="btn primary" onClick={() => go(`schreiben/${nextTask.id}`)}>
              {tr(L.next, lang)} →
            </button>
            <button type="button" className="btn ghost" onClick={() => go('schreiben')}>
              {tr(L.toList, lang)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PhraseList({ lang, go }: ScreenProps) {
  return (
    <div>
      <div className="row" style={{ marginTop: 14 }}>
        <button type="button" className="btn small ghost" onClick={() => go('schreiben')}>
          ← {tr(L.back, lang)}
        </button>
      </div>
      <h1>{tr(L.phraseTitle, lang)}</h1>
      <div className="qlist">
        {writingPhrases.map((g) => (
          <details key={g.id}>
            <summary>{tr(g.label, lang)}</summary>
            <ul style={{ margin: '10px 0 0', paddingLeft: 20 }}>
              {g.phrases.map((p) => (
                <li key={p.de} style={{ marginBottom: 4 }}>
                  <span lang="de" style={{ fontWeight: 600 }}>{p.de}</span> <span className="small muted">– {p.en}</span>
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </div>
  );
}
