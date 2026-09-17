import { useMemo, useState } from 'react';
import type { Lang, Question, State, Topic } from '../types.ts';
import { QuestionView, Verdict } from './QuestionView.tsx';
import { countQuestions, t } from '../lib/i18n.ts';
import { TOPICS, catalogueFor } from '../lib/questions.ts';
import { grade, isWeak, practiceOrder } from '../lib/srs.ts';
import { useStore } from '../lib/storage.ts';
import { useKeys } from '../lib/useKeys.ts';

export type PracticeScope = 'all' | 'weak' | Topic;

interface Props {
  state: State;
  lang: Lang;
  scope: PracticeScope;
  onScope: (s: PracticeScope) => void;
  onExit: () => void;
}

const SESSION_SIZE = 20;

export function Practice({ state, lang, scope, onScope, onExit }: Props) {
  const [store, update] = useStore();
  const [cursor, setCursor] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [round, setRound] = useState(0);

  const pool = useMemo<Question[]>(() => {
    const all = catalogueFor(state);
    if (scope === 'weak') return all.filter((q) => isWeak(store.progress[q.id]));
    if (scope === 'all') return all;
    return all.filter((q) => q.topic === scope);
    // `round` re-draws the session once the previous one is finished.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, scope, round]);

  const session = useMemo(() => {
    const ordered = practiceOrder(pool.map((q) => q.id), store.progress);
    return ordered.slice(0, SESSION_SIZE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, round]);

  const byId = useMemo(() => new Map(pool.map((q) => [q.id, q])), [pool]);
  const current = byId.get(session[cursor]);

  const restart = (nextScope?: PracticeScope) => {
    if (nextScope) onScope(nextScope);
    setCursor(0);
    setChosen(null);
    setRound((r) => r + 1);
  };

  const choose = (i: number) => {
    if (chosen !== null || !current) return;
    setChosen(i);
    update((s) => ({
      ...s,
      progress: { ...s.progress, [current.id]: grade(s.progress[current.id], i === current.answer) },
    }));
  };

  const advance = () => {
    setChosen(null);
    setCursor((c) => c + 1);
  };

  useKeys({
    onOption: (i) => (chosen === null ? choose(i) : undefined),
    onNext: () => (chosen === null ? undefined : advance()),
  });

  const scopeChips = (
    <div className="chips" style={{ margin: '14px 0' }}>
      <button type="button" className="chip" aria-pressed={scope === 'all'} onClick={() => restart('all')}>
        {t('all', lang)}
      </button>
      {TOPICS.map((topic) => (
        <button
          key={topic.id}
          type="button"
          className="chip"
          aria-pressed={scope === topic.id}
          onClick={() => restart(topic.id)}
        >
          {lang === 'de' ? topic.de : topic.en}
        </button>
      ))}
      <button type="button" className="chip" aria-pressed={scope === 'weak'} onClick={() => restart('weak')}>
        {t('weakQuestions', lang)}
      </button>
    </div>
  );

  if (session.length === 0) {
    return (
      <div>
        <Header lang={lang} onExit={onExit} />
        {scopeChips}
        <div className="card center">
          <p>{scope === 'weak' ? t('noWeak', lang) : t('noResults', lang)}</p>
          <button type="button" className="btn primary" onClick={() => restart('all')}>
            {t('startPractice', lang)}
          </button>
        </div>
      </div>
    );
  }

  if (!current) {
    const answered = session.length;
    return (
      <div>
        <Header lang={lang} onExit={onExit} />
        <div className="card center" style={{ marginTop: 20 }}>
          <p className="score">✓</p>
          <h2 style={{ marginTop: 0 }}>{t('sessionDone', lang)}</h2>
          <p className="muted small">{countQuestions(answered, lang)}</p>
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

  return (
    <div>
      <Header lang={lang} onExit={onExit} />
      {scopeChips}
      <div className="bar" style={{ marginBottom: 14 }}>
        <span style={{ width: `${(cursor / session.length) * 100}%` }} />
      </div>
      <div className="card">
        <QuestionView
          question={current}
          lang={lang}
          chosen={chosen}
          revealed={chosen !== null}
          onChoose={choose}
          counter={`${t('question', lang)} ${cursor + 1} ${t('of', lang)} ${session.length}`}
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

function Header({ lang, onExit }: { lang: Lang; onExit: () => void }) {
  return (
    <div className="exambar">
      <button type="button" className="btn small ghost" onClick={onExit}>
        ← {t('backHome', lang)}
      </button>
    </div>
  );
}
