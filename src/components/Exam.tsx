import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ExamRecord, Lang, Question, State } from '../types.ts';
import { QuestionView } from './QuestionView.tsx';
import { Confirm } from './Confirm.tsx';
import { t } from '../lib/i18n.ts';
import { EXAM_DURATION_MS, EXAM_PASS_MARK, EXAM_TOTAL, buildExam, formatClock, isPass } from '../lib/exam.ts';
import { grade } from '../lib/srs.ts';
import { setStore } from '../lib/storage.ts';
import { useKeys } from '../lib/useKeys.ts';

type Phase = 'running' | 'done';

interface Props {
  state: State;
  lang: Lang;
  onExit: () => void;
}

export function Exam({ state, lang, onExit }: Props) {
  const [seed, setSeed] = useState(0);
  const questions = useMemo<Question[]>(() => buildExam(state), [state, seed]);
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('running');
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const [confirmingSubmit, setConfirmingSubmit] = useState(false);
  const recorded = useRef(false);

  const remaining = startedAt + EXAM_DURATION_MS - now;
  const current = questions[index];

  const correctCount = useMemo(
    () => questions.filter((q) => answers[q.id] === q.answer).length,
    [questions, answers],
  );

  const finish = useCallback(() => {
    if (recorded.current) return;
    recorded.current = true;
    const finishedAt = Date.now();
    const correct = questions.filter((q) => answers[q.id] === q.answer).length;
    const record: ExamRecord = {
      startedAt,
      finishedAt,
      state,
      correct,
      total: questions.length,
      passed: EXAM_PASS_MARK,
      answers: Object.fromEntries(questions.map((q) => [q.id, answers[q.id] ?? null])),
      order: questions.map((q) => q.id),
    };
    setStore((s) => {
      const progress = { ...s.progress };
      // An exam answer is a real recall test, so it feeds the same schedule as practice.
      for (const q of questions) {
        const given = answers[q.id];
        if (given === undefined || given === null) continue;
        progress[q.id] = grade(progress[q.id], given === q.answer, finishedAt, given);
      }
      return { ...s, progress, exams: [record, ...s.exams].slice(0, 50) };
    });
    setPhase('done');
  }, [answers, questions, startedAt, state]);

  // Tick the clock once a second and hand in automatically when time runs out.
  useEffect(() => {
    if (phase !== 'running') return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase === 'running' && remaining <= 0) finish();
  }, [phase, remaining, finish]);

  const choose = (optionIndex: number) => {
    setAnswers((a) => ({ ...a, [current.id]: optionIndex }));
  };

  const restart = () => {
    recorded.current = false;
    setSeed((s) => s + 1);
    setAnswers({});
    setIndex(0);
    setStartedAt(Date.now());
    setNow(Date.now());
    setPhase('running');
  };

  useKeys({
    onOption: (i) => (phase === 'running' && current ? choose(i) : undefined),
    onNext: () => setIndex((i) => Math.min(questions.length - 1, i + 1)),
    onPrev: () => setIndex((i) => Math.max(0, i - 1)),
  });

  const answeredCount = questions.filter((q) => answers[q.id] !== undefined && answers[q.id] !== null).length;

  if (phase === 'done') {
    return (
      <Result
        questions={questions}
        answers={answers}
        correct={correctCount}
        lang={lang}
        onRestart={restart}
        onExit={onExit}
        timedOut={remaining <= 0}
      />
    );
  }

  return (
    <div>
      <div className="exambar">
        <button type="button" className="btn small ghost" onClick={onExit}>
          ← {t('cancel', lang)}
        </button>
        <span className="spacer" />
        <span className="small muted">
          {answeredCount}/{EXAM_TOTAL}
        </span>
        <span className={`clock ${remaining < 5 * 60 * 1000 ? 'urgent' : ''}`} aria-label={t('timeLeft', lang)}>
          {formatClock(remaining)}
        </span>
      </div>

      <div className="card">
        <QuestionView
          question={current}
          lang={lang}
          chosen={answers[current.id] ?? null}
          revealed={false}
          onChoose={choose}
          counter={`${t('question', lang)} ${index + 1} ${t('of', lang)} ${questions.length}`}
        />
      </div>

      <div className="sticky-actions">
        <button type="button" className="btn" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}>
          ← {t('back', lang)}
        </button>
        {index < questions.length - 1 ? (
          <button type="button" className="btn primary spacer" onClick={() => setIndex((i) => i + 1)}>
            {t('next', lang)} →
          </button>
        ) : (
          <button type="button" className="btn primary spacer" onClick={() => setConfirmingSubmit(true)}>
            {t('finish', lang)}
          </button>
        )}
      </div>

      <div className="grid-nav" role="navigation">
        {questions.map((q, i) => (
          <button
            key={q.id}
            type="button"
            className={answers[q.id] !== undefined && answers[q.id] !== null ? 'answered' : ''}
            aria-current={i === index}
            onClick={() => setIndex(i)}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div className="row" style={{ marginTop: 16 }}>
        <button type="button" className="btn small ghost" onClick={() => setConfirmingSubmit(true)}>
          {t('finishNow', lang)}
        </button>
      </div>

      {confirmingSubmit && (
        <Confirm
          message={t('confirmSubmit', lang)}
          lang={lang}
          onConfirm={() => {
            setConfirmingSubmit(false);
            finish();
          }}
          onCancel={() => setConfirmingSubmit(false)}
        />
      )}
    </div>
  );
}

function Result({
  questions,
  answers,
  correct,
  lang,
  onRestart,
  onExit,
  timedOut,
}: {
  questions: Question[];
  answers: Record<number, number | null>;
  correct: number;
  lang: Lang;
  onRestart: () => void;
  onExit: () => void;
  timedOut: boolean;
}) {
  const [review, setReview] = useState(false);
  const passed = isPass(correct);

  if (review) {
    return (
      <div>
        <div className="exambar">
          <button type="button" className="btn small ghost" onClick={() => setReview(false)}>
            ← {t('back', lang)}
          </button>
        </div>
        <div className="stack">
          {questions.map((q, i) => {
            const given = answers[q.id] ?? null;
            return (
              <div className="card" key={q.id}>
                <QuestionView
                  question={q}
                  lang={lang}
                  chosen={given}
                  revealed
                  onChoose={() => {}}
                  counter={`${t('question', lang)} ${i + 1}`}
                />
                {given === null && <p className="small muted" style={{ marginTop: 10 }}>{t('unanswered', lang)}</p>}
                {q.en.context && (
                  <p className="small muted" style={{ marginTop: 10 }}>
                    <strong>{t('explanation', lang)} (EN):</strong> {q.en.context}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="card center" style={{ marginTop: 24 }}>
      {timedOut && <p className="small muted">{t('timeUp', lang)}</p>}
      <div className={`badge ${passed ? 'good' : 'bad'}`}>{passed ? t('passed', lang) : t('failed', lang)}</div>
      <p className="score" style={{ margin: '14px 0 2px' }}>
        {correct}/{questions.length}
      </p>
      <p className="muted small">
        {t('resultLine', lang)} · {t('passed', lang)} ab {EXAM_PASS_MARK}
      </p>
      <div className="bar" style={{ margin: '18px 0' }}>
        <span style={{ width: `${(correct / questions.length) * 100}%` }} />
      </div>
      <div className="stack">
        <button type="button" className="btn block" onClick={() => setReview(true)}>
          {t('reviewAnswers', lang)}
        </button>
        <button type="button" className="btn primary block" onClick={onRestart}>
          {t('againExam', lang)}
        </button>
        <button type="button" className="btn ghost block" onClick={onExit}>
          {t('backHome', lang)}
        </button>
      </div>
    </div>
  );
}
