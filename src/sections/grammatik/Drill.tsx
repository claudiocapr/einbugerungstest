import { useCallback, useEffect, useRef, useState } from 'react';
import type { Confidence, Lang } from '../../types.ts';
import { getStore, recordItem, recordResult, useFlag } from '../../lib/storage.ts';
import { isSlow, pastTimes, shouldHold } from '../../lib/neuro.ts';
import { logError, track } from '../../lib/analytics.ts';
import { useKeys } from '../../lib/useKeys.ts';
import { tr } from '../../lib/i18n.ts';
import { Confirm } from '../../components/Confirm.tsx';
import { type ExId, type Question, buildRound, buildWeakRound } from '../../content/grammatik/items.ts';
import { BackLink, CaseTag, EX_META, GenderTag, S, Sentence, SpeakButton, pct, useTts } from './shared.tsx';

export type DrillId = ExId | 'schwach';

interface Answer {
  q: Question;
  chosen: number;
  ok: boolean;
}

function build(ex: DrillId): Question[] {
  try {
    const progress = getStore().progress;
    return ex === 'schwach' ? buildWeakRound(progress) : buildRound(ex, progress);
  } catch (err) {
    logError(err, `grammatik.build.${ex}`);
    return [];
  }
}

export default function Drill({ ex, lang, go, onRestart }: { ex: DrillId; lang: Lang; go: (r: string) => void; onRestart: () => void }) {
  const [questions] = useState<Question[]>(() => build(ex));
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [finished, setFinished] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const startedAt = useRef(Date.now());
  const shownAt = useRef(Date.now());
  const tts = useTts();

  // Neurofeedback mode (test phase): an optional "I'm guessing" toggle and the answer time.
  const [nf] = useFlag('neurofeedback');
  const [guessing, setGuessing] = useState(false);
  const [held, setHeld] = useState(false);

  const q = questions[index] as Question | undefined;
  const meta = EX_META[ex];

  useEffect(() => {
    if (questions.length > 0) track('grammatik.round_started', { exercise: ex, correct: 0, total: questions.length });
  }, [ex, questions.length]);

  const finish = useCallback(
    (all: Answer[]) => {
      setFinished(true);
      setConfirmLeave(false);
      if (all.length === 0) return;
      const correct = all.filter((a) => a.ok).length;
      try {
        recordResult({ section: 'grammatik', setId: ex, correct, total: all.length, startedAt: startedAt.current, finishedAt: Date.now() });
      } catch (err) {
        logError(err, 'grammatik.result');
      }
      track('grammatik.round_finished', { exercise: ex, correct, total: all.length });
    },
    [ex],
  );

  const choose = useCallback(
    (i: number) => {
      if (!q || chosen !== null || i < 0 || i >= q.options.length) return;
      const ok = i === q.answer;
      setChosen(i);
      setAnswers((a) => [...a, { q, chosen: i, ok }]);
      try {
        if (nf) {
          const now = Date.now();
          const ms = now - shownAt.current;
          const conf: Confidence = guessing ? 'guess' : 'sure';
          const slow = isSlow(ms, 'choice', pastTimes(getStore().progress, 'gram:'));
          const hold = shouldHold(ok, conf, slow);
          setHeld(hold);
          recordItem(q.id, ok, i, now, { conf, ms, hold });
        } else recordItem(q.id, ok, i);
      } catch (err) {
        logError(err, 'grammatik.record');
      }
    },
    [q, chosen, nf, guessing],
  );

  const next = useCallback(() => {
    if (chosen === null) return;
    if (index + 1 >= questions.length) finish(answers);
    else {
      setIndex(index + 1);
      setChosen(null);
      setGuessing(false);
      setHeld(false);
      shownAt.current = Date.now();
    }
  }, [chosen, index, questions.length, answers, finish]);

  useKeys({ onOption: finished || confirmLeave ? undefined : choose, onNext: finished || confirmLeave ? undefined : next });

  if (questions.length === 0) {
    return (
      <div className="gr">
        <BackLink lang={lang} go={go} />
        <div className="card" style={{ marginTop: 16 }}>
          <p style={{ marginTop: 0 }}>{tr(ex === 'schwach' ? S.weakNone : S.empty, lang)}</p>
          <button type="button" className="btn primary" onClick={() => go('grammatik')}>
            ← {tr(S.overview, lang)}
          </button>
        </div>
      </div>
    );
  }

  if (finished || !q) {
    const correct = answers.filter((a) => a.ok).length;
    const missed = answers.filter((a) => !a.ok);
    const p = pct(correct, answers.length);
    return (
      <div className="gr">
        <div className="card center" style={{ marginTop: 16 }}>
          <h1 style={{ marginTop: 0 }}>{tr(S.done, lang)}</h1>
          <div className="score">
            {correct} / {answers.length}
          </div>
          <p>
            <span className={`badge ${p >= 60 ? 'good' : 'bad'}`}>{p} %</span>
          </p>
          {missed.length > 0 ? (
            <div style={{ textAlign: 'left', marginTop: 12 }}>
              <h2 style={{ marginTop: 0 }}>{tr(S.missed, lang)}</h2>
              <ul className="gr-missed">
                {missed.map((a) => (
                  <li key={a.q.id}>
                    <strong>{a.q.solved ?? a.q.options[a.q.answer]}</strong>
                    <div className="small muted">{tr(a.q.why, lang)}</div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            answers.length > 0 && <p className="good">{tr(S.allRight, lang)}</p>
          )}
          <div className="row wrap" style={{ justifyContent: 'center', marginTop: 18 }}>
            <button type="button" className="btn primary" onClick={onRestart} autoFocus>
              {tr(S.again, lang)}
            </button>
            <button type="button" className="btn" onClick={() => go('grammatik')}>
              ← {tr(S.overview, lang)}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const answered = chosen !== null;
  const right = answered && chosen === q.answer;
  const long = q.options.some((o) => o.length > 16);
  const big = q.ex === 'praep';

  return (
    <div className="gr">
      <div className="exambar">
        <BackLink lang={lang} go={go} label={S.overview} />
        <span className="small muted gr-scope">
          {meta.icon} {tr(meta.title, lang)}
        </span>
        <button type="button" className="btn small ghost" onClick={() => (answers.length ? setConfirmLeave(true) : go('grammatik'))}>
          {tr(S.finish, lang)}
        </button>
      </div>
      <div className="row small muted" style={{ marginBottom: 8 }}>
        <span>
          {index + 1} / {questions.length}
        </span>
        <span style={{ flex: 1 }}>
          <div className="bar">
            <span style={{ width: `${Math.round((index / questions.length) * 100)}%` }} />
          </div>
        </span>
      </div>

      <div className="card">
        <div className="gr-tags">
          {q.tags?.c && <CaseTag c={q.tags.c} lang={lang} />}
          {q.tags?.g && <GenderTag g={q.tags.g} lang={lang} />}
          {q.tags?.label && <span className="gr-tag plain">{q.tags.label}</span>}
          {ex === 'schwach' && <span className="gr-tag plain">{tr(EX_META[q.ex].title, lang)}</span>}
        </div>
        <div className="gr-task" style={{ marginTop: q.tags || ex === 'schwach' ? 8 : 0 }}>
          {tr(q.task, lang)}
        </div>
        <p className={`gr-q ${big ? 'big' : ''}`}>
          <Sentence text={q.text} fill={answered ? q.options[q.answer] : undefined} c={answered ? q.kase : undefined} hint={q.hint} />
        </p>
      </div>

      {nf && !answered && (
        <div className="row wrap gr-nf-guess">
          <button type="button" className="chip" aria-pressed={guessing} onClick={() => setGuessing((g) => !g)}>
            🎲 {tr(S.guess, lang)}
          </button>
          <span className="small muted">{tr(S.guessHint, lang)}</span>
        </div>
      )}

      <div className={`options gr-options ${long ? '' : 'gr-options-grid'}`}>
        {q.options.map((o, i) => {
          let cls = 'option';
          if (answered && i === q.answer) cls += ' correct';
          else if (answered && i === chosen) cls += ' incorrect';
          return (
            <button key={`${q.id}-${i}`} type="button" className={cls} disabled={answered} onClick={() => choose(i)}>
              <span className="key">{i + 1}</span>
              <span className="body">{o}</span>
            </button>
          );
        })}
      </div>

      {answered && (
        <div className={`verdict ${right ? 'good' : 'bad'}`} role="status">
          <div className="head">
            {right ? tr(S.correct, lang) : `${tr(S.wrong, lang)} ${tr(S.answer, lang)}: ${q.options[q.answer]}`}{' '}
            {q.kase && <CaseTag c={q.kase} lang={lang} />}
          </div>
          <div className="body gr-why">{tr(q.why, lang)}</div>
          {q.solved && q.ex !== 'praep' && q.ex !== 'tabelle' && (
            <div className="body gr-solved row" style={{ gap: 6 }}>
              <span style={{ flex: 1, minWidth: 0 }}>{q.solved}</span>
              {tts && <SpeakButton text={q.solved} lang={lang} />}
            </div>
          )}
          {nf && held && <div className="body small gr-nf-line">{tr(S.held, lang)}</div>}
        </div>
      )}

      <div className="sticky-actions">
        <button type="button" className="btn primary block" disabled={!answered} onClick={next} autoFocus={answered}>
          {tr(S.next, lang)} →
        </button>
      </div>
      <p className="small muted center">{tr(S.keys, lang)}</p>

      {confirmLeave && (
        <Confirm message={tr(S.leaveTitle, lang)} lang={lang} onConfirm={() => finish(answers)} onCancel={() => setConfirmLeave(false)} />
      )}
    </div>
  );
}
