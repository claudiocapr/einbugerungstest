import { useMemo } from 'react';
import type { Lang, Recommendation } from '../types.ts';
import { type Key, t } from '../lib/i18n.ts';
import { STATES, TOPICS, catalogueFor } from '../lib/questions.ts';
import { answeredToday, recommend, streakDays, summarise } from '../lib/insights.ts';
import { useStore } from '../lib/storage.ts';

interface Props {
  lang: Lang;
  onGo: (route: string) => void;
}

const REC_META: Record<Recommendation['kind'], { icon: string; title: Key; why: Key }> = {
  due: { icon: '⏰', title: 'recDue', why: 'recDueWhy' },
  weak: { icon: '🎯', title: 'recWeak', why: 'recWeakWhy' },
  topic: { icon: '📉', title: 'recTopic', why: 'recTopicWhy' },
  new: { icon: '✨', title: 'recNew', why: 'recNewWhy' },
  exam: { icon: '📝', title: 'recExam', why: 'recExamWhy' },
};

export function Home({ lang, onGo }: Props) {
  const [store, update] = useStore();
  const state = store.state;

  const view = useMemo(() => {
    if (!state) return null;
    const catalogue = catalogueFor(state);
    return {
      summary: summarise(catalogue, store.progress),
      recommendations: recommend(catalogue, store.progress),
      streak: streakDays(store.progress),
      today: answeredToday(store.progress),
    };
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

  const { summary, recommendations, streak, today } = view!;
  const goal = store.dailyGoal;
  const goalPct = Math.min(100, Math.round((today / goal) * 100));

  return (
    <div>
      <h1>{t('tagline', lang)}</h1>
      <div className="row small muted" style={{ marginBottom: 18 }}>
        <span>📍 {state}</span>
        <button type="button" className="btn small ghost" onClick={() => update((prev) => ({ ...prev, state: null }))}>
          {t('change', lang)}
        </button>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="goalrow">
          <span className="streak" title={t('streak', lang)}>
            🔥 <span className="n">{streak}</span>
          </span>
          <span style={{ flex: 1 }}>
            <span className="row small" style={{ marginBottom: 5 }}>
              <span>{t('dailyGoal', lang)}</span>
              <span className="spacer" />
              <span className="muted">
                {today}/{goal}
              </span>
            </span>
            <div className={`bar ${today >= goal ? 'good' : ''}`}>
              <span style={{ width: `${goalPct}%` }} />
            </div>
          </span>
        </div>
        <div className="row small muted" style={{ marginTop: 12 }}>
          <span>
            {t('strength', lang)}{' '}
            {summary.overall > 0 && summary.overall < 0.01 ? '<1' : Math.round(summary.overall * 100)}%
          </span>
          <span className="spacer" />
          <span>
            {summary.byLevel.strong} {t('levelStrong', lang).toLowerCase()} ·{' '}
            {summary.byLevel.weak + summary.byLevel.shaky} {t('levelWeak', lang).toLowerCase()} ·{' '}
            {summary.byLevel.new} {t('levelNew', lang).toLowerCase()}
          </span>
        </div>
        <div className="bar" style={{ marginTop: 6 }}>
          <span style={{ width: `${summary.overall * 100}%` }} />
        </div>
      </div>

      {recommendations.length > 0 && (
        <>
          <h2 style={{ marginTop: 0 }}>{t('recommended', lang)}</h2>
          <div className="stack" style={{ marginBottom: 20 }}>
            {recommendations.map((rec, i) => (
              <button
                key={rec.kind}
                type="button"
                className={`rec ${i === 0 ? 'lead' : ''}`}
                onClick={() => onGo(rec.route)}
              >
                <span className="icon" aria-hidden="true">{REC_META[rec.kind].icon}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span className="title">
                    {t(REC_META[rec.kind].title, lang)}
                    {rec.topic && `: ${topicName(rec.topic, lang)}`}
                  </span>
                  <span className="why">{t(REC_META[rec.kind].why, lang)}</span>
                </span>
                {rec.kind !== 'exam' && <span className="count">{rec.count}</span>}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="stack">
        <Tile icon="📝" title={t('startExam', lang)} sub={t('startExamHint', lang)} onClick={() => onGo('exam')} />
        <Tile icon="🎲" title={t('randomMode', lang)} sub={t('randomHint', lang)} onClick={() => onGo('practice/random')} />
        <Tile icon="🎓" title={t('startPractice', lang)} sub={t('startPracticeHint', lang)} onClick={() => onGo('practice/all')} />
        <Tile
          icon="🎯"
          title={`${t('weakQuestions', lang)}${summary.byLevel.weak + summary.byLevel.shaky > 0 ? ` (${summary.byLevel.weak + summary.byLevel.shaky})` : ''}`}
          sub={t('weakHint', lang)}
          onClick={() => onGo('practice/weak')}
          disabled={summary.byLevel.weak + summary.byLevel.shaky === 0}
        />
        <Tile icon="📚" title={t('browse', lang)} sub={t('browseHint', lang)} onClick={() => onGo('browse')} />
        <Tile icon="📊" title={t('stats', lang)} sub={t('statsHint', lang)} onClick={() => onGo('stats')} />
      </div>
    </div>
  );
}

const topicName = (topic: string, lang: Lang) => {
  const found = TOPICS.find((x) => x.id === topic);
  return found ? (lang === 'de' ? found.de : found.en) : topic;
};

function Tile({
  icon, title, sub, onClick, disabled,
}: { icon: string; title: string; sub: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" className="tile" onClick={onClick} disabled={disabled}>
      <span className="icon" aria-hidden="true">{icon}</span>
      <span>
        <span className="title">{title}</span>
        <span className="sub">{sub}</span>
      </span>
    </button>
  );
}
