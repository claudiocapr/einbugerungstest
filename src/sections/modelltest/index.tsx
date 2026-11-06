// Modelltest: the full telc B1 exam, timed, assembled from the practice content.
//
// Routes: #/modelltest              start page (prediction, start / resume)
//         #/modelltest/<part>       the running mock; <part> picks the Teil
//                                   within the current block (lesen1 … hoeren3)
//         #/modelltest/schreiben | bewerten | sprechen
//         #/modelltest/ergebnis     result of the last finished mock
//
// Lesen + Sprachbausteine share one 90-minute clock, Hören has 30 minutes,
// Schreiben 30 minutes. Everything in progress lives in
// useSection('modelltest'), so a reload resumes where it stopped.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { SectionProps } from '../types.ts';
import type { ExamPart, Lang } from '../../types.ts';
import { lesen1, lesen2, lesen3 } from '../../content/lesen.ts';
import { sb1, sb2 } from '../../content/sprachbausteine.ts';
import { hoeren1, hoeren2, hoeren3 } from '../../content/hoeren.ts';
import { writingTasks } from '../../content/schreiben.ts';
import { sprechen1, sprechen2, sprechen3 } from '../../content/sprechen.ts';
import { Confirm } from '../../components/Confirm.tsx';
import { getStore, recordItem, recordResult, useSection, useStore } from '../../lib/storage.ts';
import { formatClock, useCountdown } from '../../lib/useCountdown.ts';
import { stop } from '../../lib/tts.ts';
import { logError, track } from '../../lib/analytics.ts';
import { tr } from '../../lib/i18n.ts';
import { WRITING_MAX, writingPoints, type Grade } from '../schreiben/criteria.ts';
import { Editor, IncomingMail, Leitpunkte } from '../schreiben/WritingDesk.tsx';
import { SelfCheck } from '../schreiben/SelfCheck.tsx';
import { useBufferedText } from '../schreiben/useBufferedText.ts';
import { PLAN_KEYS, assembleMock, doneSetIds, findSet, type MockContent } from './assemble.ts';
import {
  FIRST_NUMBER, ITEM_COUNT, OBJ_PARTS, PART_MAX, markPart, partPoints, scoreMock, speakingPoints,
  type Answer, type ObjPart,
} from './score.ts';
import {
  BLOCKS, EMPTY_SECTION, NEXT_PHASE, blockOf, newMock, partScoresOf, readSection,
  type Block, type BlockId, type MockState, type ModelltestSection, type Phase,
} from './state.ts';
import {
  Hoeren1View, Hoeren2View, Hoeren3View, INSTRUCTIONS, Lesen1View, Lesen2View, Lesen3View, MissingContent, Sb1View, Sb2View,
} from './parts.tsx';
import { StartPage } from './Start.tsx';
import { NoResult, Results } from './Results.tsx';
import { SpeakingScreen } from './Speaking.tsx';

const CONTENT: MockContent = {
  lesen1, lesen2, lesen3, sb1, sb2, hoeren1, hoeren2, hoeren3,
  schreiben: writingTasks, sprechen1, sprechen2, sprechen3,
};

const L = {
  start: { de: 'Jetzt starten', en: 'Start now' },
  minutes: { de: 'Minuten', en: 'minutes' },
  blockIntro: {
    de: 'Die Zeit läuft ab dem Start. Sie können zwischen den Teilen dieses Blocks frei wechseln. Wenn die Zeit um ist, wird der Block automatisch abgegeben.',
    en: 'The clock runs from the start. You can move freely between the parts of this block. When time is up, the block is handed in automatically.',
  },
  hoerenIntro: {
    de: 'Die Texte werden von der Sprachausgabe Ihres Geräts gelesen. Teil 1 hören Sie einmal, Teil 2 und 3 zweimal. Schalten Sie den Ton ein.',
    en: 'The texts are read by your device’s speech output. Part 1 is heard once, parts 2 and 3 twice. Turn the sound on.',
  },
  schreibenIntro: {
    de: 'Sie beantworten eine E-Mail zu vier Leitpunkten, etwa 100–150 Wörter. Danach bewerten Sie Ihren Text selbst mit der Musterlösung.',
    en: 'You answer an e-mail covering four points, about 100–150 words. Afterwards you assess your text against a model answer.',
  },
  missingAll: { de: 'Für diesen Block gibt es noch keine Inhalte.', en: 'There is no content for this block yet.' },
  skipBlock: { de: 'Block überspringen', en: 'Skip this block' },
  available: { de: 'bereit', en: 'ready' },
  missing: { de: 'fehlt noch', en: 'missing' },
  submit: { de: 'Abgeben', en: 'Hand in' },
  confirmSubmit: { de: 'Diesen Block abgeben? Danach können Sie die Antworten nicht mehr ändern.', en: 'Hand in this block? You cannot change the answers afterwards.' },
  open: { de: 'Noch offen', en: 'Still open' },
  prev: { de: 'Voriger Teil', en: 'Previous part' },
  nextPart: { de: 'Nächster Teil', en: 'Next part' },
  overview: { de: 'Übersicht', en: 'Overview' },
  assessTitle: { de: 'Schreiben selbst bewerten', en: 'Assess your writing' },
  assessNote: {
    de: 'In der Prüfung bewerten geschulte Prüfende. Hier vergleichen Sie selbst mit der Musterlösung – seien Sie streng.',
    en: 'In the exam, trained examiners grade. Here you compare with the model answer yourself – be strict.',
  },
  toSpeaking: { de: 'Weiter zum Sprechen', en: 'On to speaking' },
  gradeAll: { de: 'Wählen Sie für alle drei Kriterien A–D.', en: 'Choose A–D for all three criteria.' },
  abandonConfirm: {
    de: 'Den laufenden Modelltest abbrechen? Bereits abgegebene Teile bleiben in Ihrer Statistik.',
    en: 'Abandon the mock exam in progress? Parts already handed in stay in your statistics.',
  },
};

const SHORT: Record<ObjPart, string> = {
  lesen1: 'Lesen 1', lesen2: 'Lesen 2', lesen3: 'Lesen 3', sb1: 'SB 1', sb2: 'SB 2', hoeren1: 'Hören 1', hoeren2: 'Hören 2', hoeren3: 'Hören 3',
};

/** The route that shows a phase. */
const routeOf = (phase: Phase): string => {
  const block = BLOCKS.find((b) => b.id === phase);
  if (block) return block.parts[0] ?? block.id;
  return phase === 'done' ? 'ergebnis' : phase;
};

const missingParts = (): ExamPart[] =>
  PLAN_KEYS.filter((p) => (CONTENT[p] as unknown[]).length === 0);

const latestSection = () => readSection(getStore().sections.modelltest);

export default function Modelltest({ lang, path, go }: SectionProps) {
  const [store] = useStore();
  const [raw, setRaw] = useSection<ModelltestSection>('modelltest', EMPTY_SECTION);
  const { current, last } = useMemo(() => readSection(raw), [raw]);
  const [abandoning, setAbandoning] = useState(false);
  const finished = useRef(new Set<string>());

  const setCurrent = useCallback(
    (fn: (m: MockState) => MockState) =>
      setRaw((prev) => {
        const s = readSection(prev);
        return s.current ? { ...s, current: fn(s.current) } : s;
      }),
    [setRaw],
  );

  const start = () => {
    try {
      const seed = (Date.now() ^ Math.floor(Math.random() * 0x7fffffff)) >>> 0;
      const plan = assembleMock(CONTENT, doneSetIds(getStore().results), seed);
      setRaw((prev) => ({ ...readSection(prev), current: newMock(plan, seed) }));
      track('modelltest.started', { parts: OBJ_PARTS.filter((p) => plan[p]).length });
      go(`modelltest/${routeOf('lesen')}`);
    } catch (err) {
      logError(err, 'modelltest.start');
    }
  };

  /** Scores and records a timed block, then moves on. Safe to call twice (button + timer). */
  const finishBlock = useCallback(
    (block: BlockId, auto: boolean) => {
      const mock = latestSection().current;
      if (!mock || mock.phase !== block) return;
      const key = `${mock.id}:${block}`;
      if (finished.current.has(key)) return;
      finished.current.add(key);
      try {
        stop();
        const now = Date.now();
        const scores = { ...mock.scores };
        for (const part of blockOf(block).parts) {
          const set = findSet(CONTENT, part, mock.plan[part]);
          if (!set) continue;
          const answers = mock.answers[part] ?? [];
          const marks = markPart(part, set, answers);
          marks.forEach((ok, i) => recordItem(`${part}:${set.id}:${i + 1}`, ok, answers[i] ?? -1, now));
          const correct = marks.filter(Boolean).length;
          const points = partPoints(part, correct);
          scores[part] = { points, max: PART_MAX[part], correct, total: marks.length };
          recordResult({
            section: 'modelltest', part, setId: set.id, correct, total: marks.length,
            points, maxPoints: PART_MAX[part], startedAt: mock.startedAt, finishedAt: now,
          });
        }
        let next = NEXT_PHASE[block];
        if (next === 'bewerten' && !mock.plan.schreiben) next = 'sprechen';
        setCurrent((m) => ({ ...m, phase: next, blockEndsAt: null, scores, timedOut: auto ? [...m.timedOut, block] : m.timedOut }));
        track('modelltest.block_finished', { block, auto });
        go(`modelltest/${routeOf(next)}`);
      } catch (err) {
        logError(err, 'modelltest.finishBlock');
      }
    },
    [go, setCurrent],
  );

  const finishWriting = () => {
    const mock = latestSection().current;
    if (!mock || mock.phase !== 'bewerten') return;
    try {
      const points = writingPoints(mock.writing.grades);
      const covered = mock.writing.ticked.filter(Boolean).length;
      recordResult({
        section: 'modelltest', part: 'schreiben', setId: mock.plan.schreiben ?? undefined, correct: covered, total: 4,
        points, maxPoints: WRITING_MAX, selfAssessed: true, startedAt: mock.startedAt, finishedAt: Date.now(),
      });
      setCurrent((m) => ({
        ...m,
        phase: 'sprechen',
        scores: { ...m.scores, schreiben: { points, max: WRITING_MAX, correct: covered, total: 4 } },
      }));
      go('modelltest/sprechen');
    } catch (err) {
      logError(err, 'modelltest.finishWriting');
    }
  };

  const finishMock = (skipSpeaking: boolean) => {
    const mock = latestSection().current;
    if (!mock || mock.phase !== 'sprechen') return;
    try {
      const now = Date.now();
      const scores = { ...mock.scores };
      if (!skipSpeaking) {
        ([1, 2, 3] as const).forEach((teil) => {
          const part = `sprechen${teil}` as const;
          const grades = mock.speaking.grades[teil - 1];
          const points = speakingPoints(teil, grades);
          const good = grades.filter((g) => g === 0 || g === 1).length;
          scores[part] = { points, max: PART_MAX[part], correct: good, total: 4 };
          recordResult({
            section: 'modelltest', part, setId: mock.plan[part] ?? undefined, correct: good, total: 4,
            points, maxPoints: PART_MAX[part], selfAssessed: true, startedAt: mock.startedAt, finishedAt: now,
          });
        });
      }
      const done: MockState = { ...mock, scores, phase: 'done', finishedAt: now, blockEndsAt: null, speaking: { ...mock.speaking, skipped: skipSpeaking } };
      const score = scoreMock(partScoresOf(done));
      const objective = OBJ_PARTS.map((p) => scores[p]).filter((s) => s !== undefined);
      const points = score.written + (score.oral ?? 0);
      recordResult({
        section: 'modelltest',
        correct: objective.reduce((s, x) => s + x!.correct, 0),
        total: objective.reduce((s, x) => s + x!.total, 0),
        points,
        maxPoints: score.writtenMax + (score.oral === null ? 0 : score.oralMax),
        startedAt: mock.startedAt,
        finishedAt: now,
      });
      track('modelltest.finished', { points, passed: score.passed, oral: !skipSpeaking });
      setRaw(() => ({ current: null, last: done }));
      go('modelltest/ergebnis');
    } catch (err) {
      logError(err, 'modelltest.finishMock');
    }
  };

  const abandon = () => {
    stop();
    setAbandoning(false);
    setRaw((prev) => ({ ...readSection(prev), current: null }));
    track('modelltest.abandoned', {});
    go('modelltest');
  };

  const [head] = path;

  if (head === 'ergebnis') {
    return last ? <Results mock={last} content={CONTENT} lang={lang} go={go} /> : <NoResult lang={lang} go={go} />;
  }

  if (!head || !current) {
    return (
      <>
        <StartPage
          lang={lang}
          go={go}
          results={store.results}
          current={current}
          hasLast={Boolean(last)}
          missing={missingParts()}
          onStart={start}
          onResume={() => current && go(`modelltest/${routeOf(current.phase)}`)}
          onAbandon={() => setAbandoning(true)}
        />
        {abandoning && <Confirm lang={lang} message={tr(L.abandonConfirm, lang)} onCancel={() => setAbandoning(false)} onConfirm={abandon} />}
      </>
    );
  }

  const phase = current.phase;
  if (phase === 'lesen' || phase === 'hoeren' || phase === 'schreiben') {
    const block = blockOf(phase);
    const part = (block.parts as string[]).includes(head) ? (head as ObjPart) : block.parts[0];
    return (
      <BlockScreen
        key={`${current.id}:${phase}`}
        block={block}
        part={part}
        mock={current}
        lang={lang}
        go={go}
        setCurrent={setCurrent}
        onFinish={finishBlock}
      />
    );
  }

  if (phase === 'bewerten') {
    const task = writingTasks.find((t) => t.id === current.plan.schreiben);
    if (!task) {
      // The task vanished from the content; nothing to assess.
      setTimeout(() => setCurrent((m) => ({ ...m, phase: 'sprechen' })), 0);
      return null;
    }
    const graded = current.writing.grades.every((g) => g !== null);
    return (
      <div className="stack" style={{ marginTop: 14 }}>
        <h1 style={{ margin: 0 }}>{tr(L.assessTitle, lang)}</h1>
        <p className="muted" style={{ margin: 0 }}>{tr(L.assessNote, lang)}</p>
        <Leitpunkte
          task={task}
          lang={lang}
          ticked={current.writing.ticked}
          onToggle={(i) => setCurrent((m) => ({ ...m, writing: { ...m.writing, ticked: m.writing.ticked.map((v, k) => (k === i ? !v : v)) } }))}
        />
        <SelfCheck
          task={task}
          lang={lang}
          text={current.writing.text}
          pointsCovered={current.writing.ticked.filter(Boolean).length}
          checks={current.writing.checks}
          grades={current.writing.grades}
          onChecks={(checks) => setCurrent((m) => ({ ...m, writing: { ...m.writing, checks } }))}
          onGrades={(grades) => setCurrent((m) => ({ ...m, writing: { ...m.writing, grades } }))}
        />
        <div className="sticky-actions" style={{ flexDirection: 'column' }}>
          {!graded && <span className="small muted">{tr(L.gradeAll, lang)}</span>}
          <button type="button" className="btn primary block" disabled={!graded} onClick={finishWriting}>
            {tr(L.toSpeaking, lang)} →
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'sprechen') {
    return (
      <SpeakingScreen
        lang={lang}
        tasks={[
          sprechen1.find((t) => t.id === current.plan.sprechen1),
          sprechen2.find((t) => t.id === current.plan.sprechen2),
          sprechen3.find((t) => t.id === current.plan.sprechen3),
        ]}
        grades={current.speaking.grades}
        onGrade={(teil, criterion, grade: Grade) =>
          setCurrent((m) => ({
            ...m,
            speaking: {
              ...m.speaking,
              grades: m.speaking.grades.map((row, i) => (i === teil ? row.map((g, k) => (k === criterion ? grade : g)) : row)),
            },
          }))
        }
        onFinish={finishMock}
      />
    );
  }

  return <NoResult lang={lang} go={go} />;
}

/* ------------------------------------------------------------- timed block */

function BlockClock({ endsAt, onDone }: { endsAt: number; onDone: () => void }) {
  const [duration] = useState(() => Math.max(0, endsAt - Date.now()));
  const remaining = useCountdown(duration, true, onDone);
  return (
    <span className={`clock${remaining < 5 * 60 * 1000 ? ' urgent' : ''}`} role="timer">
      {formatClock(remaining)}
    </span>
  );
}

function BlockScreen({
  block,
  part,
  mock,
  lang,
  go,
  setCurrent,
  onFinish,
}: {
  block: Block;
  part: ObjPart | undefined;
  mock: MockState;
  lang: Lang;
  go: (route: string) => void;
  setCurrent: (fn: (m: MockState) => MockState) => void;
  onFinish: (block: BlockId, auto: boolean) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const available = block.parts.filter((p) => mock.plan[p]);
  const writingTask = block.id === 'schreiben' ? writingTasks.find((t) => t.id === mock.plan.schreiben) : undefined;
  const hasContent = block.id === 'schreiben' ? Boolean(writingTask) : available.length > 0;
  const onDone = useCallback(() => onFinish(block.id, true), [onFinish, block.id]);

  const setAnswer = (p: ObjPart, index: number, value: Answer) =>
    setCurrent((m) => {
      const list = Array.from({ length: ITEM_COUNT[p] }, (_, i) => m.answers[p]?.[i] ?? null);
      list[index] = value;
      return { ...m, answers: { ...m.answers, [p]: list } };
    });

  // Scroll to an item after switching parts from the overview grid.
  const [target, setTarget] = useState<number | null>(null);
  useEffect(() => {
    if (target === null) return;
    const id = window.setTimeout(() => {
      document.getElementById(`q${target}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      setTarget(null);
    }, 80);
    return () => window.clearTimeout(id);
  }, [target, part]);

  if (mock.blockEndsAt === null) {
    return (
      <div className="stack" style={{ marginTop: 14 }}>
        <h1 style={{ margin: 0 }}>{tr(block.title, lang)}</h1>
        <div className="card">
          <p className="score" style={{ fontSize: 34, margin: 0 }}>
            {block.minutes} {tr(L.minutes, lang)}
          </p>
          <p>{tr(L.blockIntro, lang)}</p>
          {block.id === 'hoeren' && <p>{tr(L.hoerenIntro, lang)}</p>}
          {block.id === 'schreiben' && <p>{tr(L.schreibenIntro, lang)}</p>}
          {block.parts.length > 0 && (
            <ul style={{ paddingLeft: 20 }}>
              {block.parts.map((p) => (
                <li key={p}>
                  {SHORT[p]} · {ITEM_COUNT[p]} × · {PART_MAX[p]} P. —{' '}
                  <span className={mock.plan[p] ? 'good' : 'bad'}>{tr(mock.plan[p] ? L.available : L.missing, lang)}</span>
                </li>
              ))}
            </ul>
          )}
          {hasContent ? (
            <button
              type="button"
              className="btn primary block"
              onClick={() => setCurrent((m) => ({ ...m, blockEndsAt: Date.now() + block.minutes * 60 * 1000 }))}
            >
              {tr(L.start, lang)} →
            </button>
          ) : (
            <>
              <p className="muted">{tr(L.missingAll, lang)}</p>
              <button type="button" className="btn block" onClick={() => onFinish(block.id, false)}>
                {tr(L.skipBlock, lang)} →
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  const unanswered = block.parts.reduce((n, p) => {
    if (!mock.plan[p]) return n;
    const list = mock.answers[p] ?? [];
    return n + Array.from({ length: ITEM_COUNT[p] }, (_, i) => list[i]).filter((a) => a === null || a === undefined).length;
  }, 0);

  const index = part ? block.parts.indexOf(part) : -1;
  const prev = index > 0 ? block.parts[index - 1] : undefined;
  const next = index >= 0 && index < block.parts.length - 1 ? block.parts[index + 1] : undefined;

  return (
    <div>
      <div className="exambar" style={{ position: 'sticky', top: 49, zIndex: 10, background: 'var(--bg)' }}>
        <strong className="small" style={{ flex: 1, minWidth: 0 }}>{tr(block.title, lang)}</strong>
        <BlockClock endsAt={mock.blockEndsAt} onDone={onDone} />
        <button type="button" className="btn small primary" onClick={() => setConfirming(true)}>
          {tr(L.submit, lang)}
        </button>
      </div>

      {block.parts.length > 1 && (
        <div className="chips" style={{ marginBottom: 12 }}>
          {block.parts.map((p) => (
            <button key={p} type="button" className="chip" aria-pressed={p === part} onClick={() => go(`modelltest/${p}`)}>
              {SHORT[p]}
            </button>
          ))}
        </div>
      )}

      {block.id === 'schreiben' && writingTask ? (
        <WritingBlock mock={mock} lang={lang} setCurrent={setCurrent} />
      ) : part ? (
        <>
          <p className="small muted" style={{ marginTop: 0 }}>{tr(INSTRUCTIONS[part], lang)}</p>
          <PartView part={part} mock={mock} lang={lang} onAnswer={(i, v) => setAnswer(part, i, v)} setCurrent={setCurrent} />
        </>
      ) : null}

      {block.parts.length > 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="small muted">
            {tr(L.overview, lang)} · {tr(L.open, lang)}: {unanswered}
          </div>
          <div className="grid-nav">
            {block.parts.flatMap((p) =>
              Array.from({ length: ITEM_COUNT[p] }, (_, i) => {
                const n = FIRST_NUMBER[p] + i;
                const answered = mock.answers[p]?.[i] !== null && mock.answers[p]?.[i] !== undefined;
                return (
                  <button
                    key={n}
                    type="button"
                    className={answered ? 'answered' : ''}
                    aria-current={p === part}
                    disabled={!mock.plan[p]}
                    onClick={() => {
                      if (p !== part) go(`modelltest/${p}`);
                      setTarget(n);
                    }}
                  >
                    {n}
                  </button>
                );
              }),
            )}
          </div>
        </div>
      )}

      {block.parts.length > 1 && (
        <div className="row" style={{ marginTop: 14 }}>
          {prev && (
            <button type="button" className="btn" onClick={() => go(`modelltest/${prev}`)}>
              ← {tr(L.prev, lang)}
            </button>
          )}
          <span className="spacer" />
          {next && (
            <button type="button" className="btn" onClick={() => go(`modelltest/${next}`)}>
              {tr(L.nextPart, lang)} →
            </button>
          )}
        </div>
      )}

      {confirming && (
        <Confirm
          lang={lang}
          message={`${tr(L.confirmSubmit, lang)}${unanswered > 0 ? ` (${tr(L.open, lang)}: ${unanswered})` : ''}`}
          onCancel={() => setConfirming(false)}
          onConfirm={() => {
            setConfirming(false);
            onFinish(block.id, false);
          }}
        />
      )}
    </div>
  );
}

function PartView({
  part,
  mock,
  lang,
  onAnswer,
  setCurrent,
}: {
  part: ObjPart;
  mock: MockState;
  lang: Lang;
  onAnswer: (index: number, value: Answer) => void;
  setCurrent: (fn: (m: MockState) => MockState) => void;
}) {
  const answers = mock.answers[part] ?? [];
  const onPlay = (key: string) => setCurrent((m) => ({ ...m, plays: { ...m.plays, [key]: (m.plays[key] ?? 0) + 1 } }));
  const common = { answers, onAnswer, lang };
  switch (part) {
    case 'lesen1': {
      const set = findSet(CONTENT, part, mock.plan[part]);
      return set ? <Lesen1View set={set} {...common} /> : <MissingContent lang={lang} />;
    }
    case 'lesen2': {
      const set = findSet(CONTENT, part, mock.plan[part]);
      return set ? <Lesen2View set={set} {...common} /> : <MissingContent lang={lang} />;
    }
    case 'lesen3': {
      const set = findSet(CONTENT, part, mock.plan[part]);
      return set ? <Lesen3View set={set} {...common} /> : <MissingContent lang={lang} />;
    }
    case 'sb1': {
      const set = findSet(CONTENT, part, mock.plan[part]);
      return set ? <Sb1View set={set} {...common} /> : <MissingContent lang={lang} />;
    }
    case 'sb2': {
      const set = findSet(CONTENT, part, mock.plan[part]);
      return set ? <Sb2View set={set} {...common} /> : <MissingContent lang={lang} />;
    }
    case 'hoeren1': {
      const set = findSet(CONTENT, part, mock.plan[part]);
      return set ? <Hoeren1View set={set} {...common} plays={mock.plays} onPlay={onPlay} /> : <MissingContent lang={lang} />;
    }
    case 'hoeren2': {
      const set = findSet(CONTENT, part, mock.plan[part]);
      return set ? <Hoeren2View set={set} {...common} plays={mock.plays} onPlay={onPlay} /> : <MissingContent lang={lang} />;
    }
    case 'hoeren3': {
      const set = findSet(CONTENT, part, mock.plan[part]);
      return set ? <Hoeren3View set={set} {...common} plays={mock.plays} onPlay={onPlay} /> : <MissingContent lang={lang} />;
    }
    default:
      return null;
  }
}

function WritingBlock({
  mock,
  lang,
  setCurrent,
}: {
  mock: MockState;
  lang: Lang;
  setCurrent: (fn: (m: MockState) => MockState) => void;
}) {
  const task = writingTasks.find((t) => t.id === mock.plan.schreiben)!;
  const [text, setText] = useBufferedText(mock.writing.text, (value) =>
    setCurrent((m) => (m.writing.text === value ? m : { ...m, writing: { ...m.writing, text: value } })),
  );
  return (
    <div className="stack">
      <IncomingMail task={task} lang={lang} />
      <Leitpunkte
        task={task}
        lang={lang}
        ticked={mock.writing.ticked}
        onToggle={(i) => setCurrent((m) => ({ ...m, writing: { ...m.writing, ticked: m.writing.ticked.map((v, k) => (k === i ? !v : v)) } }))}
      />
      <Editor task={task} lang={lang} text={text} onText={setText} />
    </div>
  );
}
