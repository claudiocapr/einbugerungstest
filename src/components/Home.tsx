import { useMemo } from 'react';
import type { Lang } from '../types.ts';
import { t } from '../lib/i18n.ts';
import { STATES, catalogueFor } from '../lib/questions.ts';
import { MAX_BOX, isWeak } from '../lib/srs.ts';
import { useStore } from '../lib/storage.ts';

interface Props {
  lang: Lang;
  onGo: (route: string) => void;
}

export function Home({ lang, onGo }: Props) {
  const [store, update] = useStore();
  const state = store.state;

  const summary = useMemo(() => {
    if (!state) return null;
    const catalogue = catalogueFor(state);
    const mastered = catalogue.filter((q) => (store.progress[q.id]?.box ?? 0) >= MAX_BOX).length;
    const weak = catalogue.filter((q) => isWeak(store.progress[q.id])).length;
    return { total: catalogue.length, mastered, weak };
  }, [state, store.progress]);

  if (!state) {
    return (
      <div className="card" style={{ marginTop: 28 }}>
        <h1 style={{ marginTop: 0 }}>{t('chooseState', lang)}</h1>
        <p className="muted small">{t('chooseStateHint', lang)}</p>
        <div className="stack" style={{ marginTop: 16 }}>
          {STATES.map((s) => (
            <button key={s} type="button" className="tile" onClick={() => update((prev) => ({ ...prev, state: s }))}>
              <span className="icon">📍</span>
              <span className="title">{s}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1>{t('tagline', lang)}</h1>
      <div className="row small muted" style={{ marginBottom: 18 }}>
        <span>📍 {state}</span>
        <button
          type="button"
          className="btn small ghost"
          onClick={() => update((prev) => ({ ...prev, state: null }))}
        >
          {t('change', lang)}
        </button>
      </div>

      {summary && (
        <div className="card" style={{ marginBottom: 18 }}>
          <div className="row small" style={{ marginBottom: 8 }}>
            <strong>
              {summary.mastered} / {summary.total} {t('masteredOf', lang)}
            </strong>
            <span className="spacer" />
            <span className="muted">{Math.round((summary.mastered / summary.total) * 100)}%</span>
          </div>
          <div className={`bar ${summary.mastered === summary.total ? 'good' : ''}`}>
            <span style={{ width: `${(summary.mastered / summary.total) * 100}%` }} />
          </div>
        </div>
      )}

      <div className="stack">
        <button type="button" className="tile" onClick={() => onGo('exam')}>
          <span className="icon">📝</span>
          <span>
            <span className="title">{t('startExam', lang)}</span>
            <span className="sub">{t('startExamHint', lang)}</span>
          </span>
        </button>

        <button type="button" className="tile" onClick={() => onGo('practice')}>
          <span className="icon">🎓</span>
          <span>
            <span className="title">{t('startPractice', lang)}</span>
            <span className="sub">{t('startPracticeHint', lang)}</span>
          </span>
        </button>

        <button
          type="button"
          className="tile"
          onClick={() => onGo('practice/weak')}
          disabled={!summary || summary.weak === 0}
        >
          <span className="icon">🔁</span>
          <span>
            <span className="title">
              {t('weakQuestions', lang)}
              {summary && summary.weak > 0 ? ` (${summary.weak})` : ''}
            </span>
            <span className="sub">{t('weakHint', lang)}</span>
          </span>
        </button>

        <button type="button" className="tile" onClick={() => onGo('browse')}>
          <span className="icon">📚</span>
          <span>
            <span className="title">{t('browse', lang)}</span>
            <span className="sub">{t('browseHint', lang)}</span>
          </span>
        </button>

        <button type="button" className="tile" onClick={() => onGo('stats')}>
          <span className="icon">📊</span>
          <span>
            <span className="title">{t('stats', lang)}</span>
            <span className="sub">{t('statsHint', lang)}</span>
          </span>
        </button>
      </div>
    </div>
  );
}
