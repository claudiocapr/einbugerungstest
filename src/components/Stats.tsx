import { useMemo } from 'react';
import type { Lang, State } from '../types.ts';
import { t } from '../lib/i18n.ts';
import { TOPICS, catalogueFor } from '../lib/questions.ts';
import { MAX_BOX } from '../lib/srs.ts';
import { resetProgress, useStore } from '../lib/storage.ts';
import { isPass } from '../lib/exam.ts';

export function Stats({ state, lang, onExit }: { state: State; lang: Lang; onExit: () => void }) {
  const [store] = useStore();
  const catalogue = useMemo(() => catalogueFor(state), [state]);

  const seen = catalogue.filter((q) => store.progress[q.id]);
  const mastered = catalogue.filter((q) => (store.progress[q.id]?.box ?? 0) >= MAX_BOX);
  const totals = Object.values(store.progress).reduce(
    (acc, p) => ({ correct: acc.correct + p.correct, wrong: acc.wrong + p.wrong }),
    { correct: 0, wrong: 0 },
  );
  const attempts = totals.correct + totals.wrong;
  const accuracy = attempts ? Math.round((totals.correct / attempts) * 100) : 0;

  const perTopic = TOPICS.map((topic) => {
    const qs = catalogue.filter((q) => q.topic === topic.id);
    const done = qs.filter((q) => (store.progress[q.id]?.box ?? 0) >= MAX_BOX).length;
    return { topic, total: qs.length, done };
  });

  return (
    <div>
      <div className="exambar">
        <button type="button" className="btn small ghost" onClick={onExit}>
          ← {t('backHome', lang)}
        </button>
      </div>

      <div className="statgrid">
        <div className="stat">
          <div className="n">{mastered.length}</div>
          <div className="l">{t('mastered', lang)}</div>
        </div>
        <div className="stat">
          <div className="n">{seen.length - mastered.length}</div>
          <div className="l">{t('learning', lang)}</div>
        </div>
        <div className="stat">
          <div className="n">{catalogue.length - seen.length}</div>
          <div className="l">{t('unseen', lang)}</div>
        </div>
        <div className="stat">
          <div className="n">{accuracy}%</div>
          <div className="l">{t('accuracy', lang)}</div>
        </div>
      </div>

      <h2>{t('stats', lang)}</h2>
      <div className="stack">
        {perTopic.map(({ topic, total, done }) => (
          <div key={topic.id}>
            <div className="row small" style={{ marginBottom: 5 }}>
              <span>{lang === 'de' ? topic.de : topic.en}</span>
              <span className="spacer" />
              <span className="muted">
                {done}/{total}
              </span>
            </div>
            <div className={`bar ${done === total ? 'good' : ''}`}>
              <span style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
            </div>
          </div>
        ))}
      </div>

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
