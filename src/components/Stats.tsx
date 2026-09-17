import { useMemo } from 'react';
import type { Lang, State, StrengthLevel } from '../types.ts';
import { t } from '../lib/i18n.ts';
import { TOPICS, catalogueFor } from '../lib/questions.ts';
import { historyOf, strength, strengthLevel } from '../lib/srs.ts';
import {
  LEVELS, answeredToday, ranked, recentActivity, streakDays, summarise, topicStrengths,
} from '../lib/insights.ts';
import { DAILY_GOAL_CHOICES, resetProgress, useStore } from '../lib/storage.ts';
import { isPass } from '../lib/exam.ts';
import { AnswerDots, StrengthBadge, StrengthBar, levelClass, levelLabel } from './Strength.tsx';

const LIST_SIZE = 8;

export function Stats({ state, lang, onExit }: { state: State; lang: Lang; onExit: () => void }) {
  const [store, update] = useStore();

  const view = useMemo(() => {
    const catalogue = catalogueFor(state);
    const { strongest, weakest } = ranked(catalogue, store.progress);
    const weakestShown = weakest.slice(0, LIST_SIZE);
    const alreadyShown = new Set(weakestShown.map((x) => x.question.id));
    return {
      catalogue,
      summary: summarise(catalogue, store.progress),
      topics: topicStrengths(catalogue, store.progress),
      // With only a handful of questions answered both ends of the ranking are
      // the same questions, so the strongest list shows only what is left over.
      strongest: strongest.filter((x) => !alreadyShown.has(x.question.id)).slice(0, LIST_SIZE),
      weakest: weakestShown,
      streak: streakDays(store.progress),
      today: answeredToday(store.progress),
      activity: recentActivity(store.progress),
    };
  }, [state, store.progress]);

  const { summary, topics, strongest, weakest, streak, today, activity } = view;
  const attempts = summary.answers.correct + summary.answers.wrong;
  const accuracy = attempts ? Math.round((summary.answers.correct / attempts) * 100) : 0;
  const peak = Math.max(1, ...activity.map((d) => d.count));
  // Rounding a real but tiny score to "0%" reads as "nothing learned".
  const overallPct = summary.overall > 0 && summary.overall < 0.01 ? '<1' : Math.round(summary.overall * 100);

  return (
    <div>
      <div className="exambar">
        <button type="button" className="btn small ghost" onClick={onExit}>
          ← {t('backHome', lang)}
        </button>
      </div>

      <div className="statgrid">
        <div className="stat">
          <div className="n">{overallPct}%</div>
          <div className="l">{t('strength', lang)}</div>
        </div>
        <div className="stat">
          <div className="n">{accuracy}%</div>
          <div className="l">{t('accuracy', lang)}</div>
        </div>
        <div className="stat">
          <div className="n">🔥 {streak}</div>
          <div className="l">{t('streak', lang)}</div>
        </div>
        <div className="stat">
          <div className="n">{summary.due}</div>
          <div className="l">{t('dueNow', lang)}</div>
        </div>
      </div>

      <h2>{t('distribution', lang)}</h2>
      <div className="stack">
        {LEVELS.map((level) => (
          <LevelRow
            key={level}
            level={level}
            lang={lang}
            count={summary.byLevel[level]}
            total={summary.total}
          />
        ))}
      </div>

      <h2>{t('strengthByTopic', lang)}</h2>
      <div className="stack">
        {topics.map((topic) => {
          const meta = TOPICS.find((x) => x.id === topic.topic);
          const level: StrengthLevel =
            topic.seen === 0 ? 'new' : topic.strength >= 0.85 ? 'strong' : topic.strength >= 0.6 ? 'good' : topic.strength >= 0.35 ? 'shaky' : 'weak';
          return (
            <div key={topic.topic}>
              <div className="row small" style={{ marginBottom: 5 }}>
                <span>{meta ? (lang === 'de' ? meta.de : meta.en) : topic.topic}</span>
                <span className="spacer" />
                <span className="muted">
                  {topic.seen === 0 ? t('levelNew', lang) : `${Math.round(topic.strength * 100)}%`}
                </span>
              </div>
              <StrengthBar value={topic.strength} level={level} />
              <p className="small muted" style={{ margin: '4px 0 0' }}>
                {t('practised', lang)}: {topic.seen}/{topic.total}
              </p>
            </div>
          );
        })}
      </div>

      <h2>{t('activity', lang)}</h2>
      <div className="activity" aria-label={t('activity', lang)}>
        {activity.map((day) => (
          <div
            key={day.day}
            className={`col ${day.count === 0 ? 'empty' : ''}`}
            title={`${new Date(day.day).toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-GB')}: ${day.count}`}
          >
            <span style={{ height: `${Math.max(4, (day.count / peak) * 100)}%` }} />
          </div>
        ))}
      </div>
      <p className="small muted" style={{ marginTop: 6 }}>
        {t('today', lang)}: {today}
      </p>

      <h2>{t('dailyGoal', lang)}</h2>
      <div className="chips">
        {DAILY_GOAL_CHOICES.map((choice) => (
          <button
            key={choice}
            type="button"
            className="chip"
            aria-pressed={store.dailyGoal === choice}
            onClick={() => update((s) => ({ ...s, dailyGoal: choice }))}
          >
            {choice}
          </button>
        ))}
      </div>

      {weakest.length > 0 && (
        <>
          <h2>{t('weakest', lang)}</h2>
          <div className="ranklist">
            {weakest.map(({ question }) => (
              <RankedQuestion key={question.id} id={question.id} text={lang === 'de' ? question.text : question.en.text} lang={lang} />
            ))}
          </div>
        </>
      )}

      {strongest.length > 0 && (
        <>
          <h2>{t('strongest', lang)}</h2>
          <div className="ranklist">
            {strongest.map(({ question }) => (
              <RankedQuestion key={question.id} id={question.id} text={lang === 'de' ? question.text : question.en.text} lang={lang} />
            ))}
          </div>
        </>
      )}

      <h2>{t('examHistory', lang)}</h2>
      {store.exams.length === 0 ? (
        <p className="muted small">{t('noExams', lang)}</p>
      ) : (
        <table className="history">
          <thead>
            <tr>
              <th>{lang === 'de' ? 'Datum' : 'Date'}</th>
              <th>{lang === 'de' ? 'Ergebnis' : 'Score'}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {store.exams.map((exam) => (
              <tr key={exam.finishedAt}>
                <td>{new Date(exam.finishedAt).toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-GB')}</td>
                <td>
                  {exam.correct}/{exam.total}
                </td>
                <td>
                  <span className={`badge ${isPass(exam.correct) ? 'good' : 'bad'}`} style={{ fontSize: 12 }}>
                    {isPass(exam.correct) ? t('passed', lang) : t('failed', lang)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: 28 }}>
        <button
          type="button"
          className="btn small danger"
          onClick={() => {
            if (window.confirm(t('confirmReset', lang))) resetProgress();
          }}
        >
          {t('resetProgress', lang)}
        </button>
      </div>
    </div>
  );
}

function LevelRow({ level, lang, count, total }: { level: StrengthLevel; lang: Lang; count: number; total: number }) {
  return (
    <div>
      <div className="row small" style={{ marginBottom: 5 }}>
        <span>{levelLabel(level, lang)}</span>
        <span className="spacer" />
        <span className="muted">{count}</span>
      </div>
      <div className={`bar strength ${levelClass(level)}`}>
        <span style={{ width: `${total ? (count / total) * 100 : 0}%` }} />
      </div>
    </div>
  );
}

function RankedQuestion({ id, text, lang }: { id: number; text: string; lang: Lang }) {
  const [store] = useStore();
  const p = store.progress[id];
  const history = historyOf(p);
  return (
    <div className="ranked">
      <div className="head">
        <span className="num">#{id}</span>
        <span className="text">{text}</span>
      </div>
      <div className="foot">
        <StrengthBadge level={strengthLevel(p)} lang={lang} />
        <span className="small muted">{Math.round(strength(p) * 100)}%</span>
        <AnswerDots history={history} lang={lang} />
      </div>
    </div>
  );
}
