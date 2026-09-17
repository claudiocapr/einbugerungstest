import { useMemo, useState } from 'react';
import type { Lang, Question, State, Topic } from '../types.ts';
import { QuestionView, Verdict } from './QuestionView.tsx';
import { countQuestions, t } from '../lib/i18n.ts';
import { TOPICS, catalogueFor } from '../lib/questions.ts';
import { dueOrder, grade, isWeak, practiceOrder } from '../lib/srs.ts';
import { shuffle } from '../lib/random.ts';
import { useStore } from '../lib/storage.ts';
import { useKeys } from '../lib/useKeys.ts';

export type PracticeScope = 'all' | 'weak' | 'due' | 'random' | Topic;

interface Props {
  state: State;
  lang: Lang;
  scope: PracticeScope;
  onScope: (s: PracticeScope) => void;
  onExit: () => void;
}

const SESSION_SIZE = 20;

/** Random mode keeps going until the user leaves, everything else is a round. */
const isEndless = (scope: PracticeScope) => scope === 'random';

export function Practice({ state, lang, scope, onScope, onExit }: Props) {
  const [store, update] = useStore();
  const [cursor, setCursor] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const [tally, setTally] = useState({ correct: 0, answered: 0 });

  const catalogue = useMemo(() => catalogueFor(state), [state]);

  const pool = useMemo<Question[]>(() => {
    if (scope === 'weak') return catalogue.filter((q) => isWeak(store.progress[q.id]));
    if (scope === 'due') {
      const ids = new Set(dueOrder(catalogue.map((q) => q.id), store.progress));
      return catalogue.filter((q) => ids.has(q.id));
    }
    if (scope === 'all' || scope === 'random') return catalogue;
    return catalogue.filter((q) => q.topic === scope);
    // The pool is drawn once per round so answering does not reshuffle it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalogue, scope, round]);

  const session = useMemo(() => {
    if (scope === 'random') return shuffle(pool.map((q) => q.id));
    const ordered = scope === 'due'
      ? dueOrder(pool.map((q) => q.id), store.progress)
      : practiceOrder(pool.map((q) => q.id), store.progress);
    return ordered.slice(0, SESSION_SIZE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, scope, round]);

  const byId = useMemo(() => new Map(pool.map((q) => [q.id, q])), [pool]);
  const current = byId.get(session[cursor]);

  const restart = (nextScope?: PracticeScope) => {
    if (nextScope && nextScope !== scope) onScope(nextScope);
    setCursor(0);
    setChosen(null);
    setTally({ correct: 0, answered: 0 });
    setRound((r) => r + 1);
  };

  const choose = (i: number) => {
    if (chosen !== null || !current) return;
    const ok = i === current.answer;
    setChosen(i);
    setTally((prev) => ({ correct: prev.correct + (ok ? 1 : 0), answered: prev.answered + 1 }));
    update((s) => ({
      ...s,
      progress: { ...s.progress, [current.id]: grade(s.progress[current.id], ok, Date.now(), i) },
    }));
  };

  const advance = () => {
    setChosen(null);
    // Random mode wraps around with a fresh shuffle instead of ending.
    if (isEndless(scope) && cursor + 1 >= session.length) {
      setRound((r) => r + 1);
      setCursor(0);
      return;
    }
    setCursor((c) => c + 1);
  };

  useKeys({
    onOption: (i) => (chosen === null ? choose(i) : undefined),
    onNext: () => (chosen === null ? undefined : advance()),
  });

  const scopeChips = (
    <div className="chips" style={{ margin: '14px 0' }}>
      <Chip active={scope === 'random'} onClick={() => restart('random')}>
        🎲 {t('randomMode', lang)}
      </Chip>
      <Chip active={scope === 'due'} onClick={() => restart('due')}>
        {t('dueMode', lang)}
      </Chip>
      <Chip active={scope === 'weak'} onClick={() => restart('weak')}>
        {t('weakQuestions', lang)}
      </Chip>
      <Chip active={scope === 'all'} onClick={() => restart('all')}>
        {t('all', lang)}
      </Chip>
      {TOPICS.map((topic) => (
        <Chip key={topic.id} active={scope === topic.id} onClick={() => restart(topic.id)}>
          {lang === 'de' ? topic.de : topic.en}
        </Chip>
      ))}
    </div>
  );

  const header = (
    <div className="exambar">
      <button type="button" className="btn small ghost" onClick={onExit}>
        ← {t('backHome', lang)}
      </button>
      {tally.answered > 0 && (
        <>
          <span className="spacer" />
          <span className="small muted">
            {tally.correct}/{tally.answered} {t('correct', lang).toLowerCase()}
          </span>
        </>
      )}
    </div>
  );

  if (session.length === 0) {
    return (
      <div>
        {header}
        {scopeChips}
        <div className="card center">
          <p>{scope === 'weak' ? t('noWeak', lang) : scope === 'due' ? t('noDue', lang) : t('noResults', lang)}</p>
          <button type="button" className="btn primary" onClick={() => restart('random')}>
            🎲 {t('randomMode', lang)}
          </button>
        </div>
      </div>
    );
  }

  if (!current) {
    return (
      <div>
        {header}
        <div className="card center" style={{ marginTop: 20 }}>
          <p className="score">{tally.correct}/{tally.answered}</p>
          <h2 style={{ marginTop: 0 }}>{t('sessionDone', lang)}</h2>
          <p className="muted small">{countQuestions(tally.answered, lang)}</p>
          <div className="stack" style={{ marginTop: 14 }}>
            <button type="button" className="btn primary block" onClick={() => restart()}>
              {t('keepGoing', lang)}
            </button>
            <button type="button" className="btn ghost block" onClick={onExit}>
              {t('backHome', lang)}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const counter = isEndless(scope)
    ? `🎲 ${t('question', lang)} ${tally.answered + (chosen === null ? 1 : 0)}`
    : `${t('question', lang)} ${cursor + 1} ${t('of', lang)} ${session.length}`;

  return (
    <div>
      {header}
      {scopeChips}
      {!isEndless(scope) && (
        <div className="bar" style={{ marginBottom: 14 }}>
          <span style={{ width: `${(cursor / session.length) * 100}%` }} />
        </div>
      )}
      <div className="card">
        <QuestionView
          question={current}
          lang={lang}
          chosen={chosen}
          revealed={chosen !== null}
          onChoose={choose}
          counter={counter}
        />
        {chosen !== null && <Verdict question={current} chosen={chosen} lang={lang} />}
      </div>
      {chosen !== null && (
        <div className="sticky-actions">
          <button type="button" className="btn primary block" onClick={advance}>
            {t('next', lang)} →
          </button>
        </div>
      )}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" className="chip" aria-pressed={active} onClick={onClick}>
      {children}
    </button>
  );
}
