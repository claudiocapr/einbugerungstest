import { useMemo, useState } from 'react';
import type { Lang, State, Topic } from '../types.ts';
import { countQuestions, t } from '../lib/i18n.ts';
import { TOPICS, catalogueFor } from '../lib/questions.ts';
import { historyOf, strengthLevel } from '../lib/srs.ts';
import { useStore } from '../lib/storage.ts';
import { AnswerDots, StrengthBadge } from './Strength.tsx';

const KEYS = ['A', 'B', 'C', 'D'];

type Filter = 'all' | Topic;
/** Extra filters that look at how the user has answered, not at the content. */
type Status = 'any' | 'weak' | 'strong' | 'new';

export function Browse({ state, lang, onExit }: { state: State; lang: Lang; onExit: () => void }) {
  const [store] = useStore();
  const [filter, setFilter] = useState<Filter>('all');
  const [status, setStatus] = useState<Status>('any');
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return catalogueFor(state)
      .filter((q) => filter === 'all' || q.topic === filter)
      .filter((q) => {
        if (status === 'any') return true;
        const level = strengthLevel(store.progress[q.id]);
        if (status === 'new') return level === 'new';
        if (status === 'weak') return level === 'weak' || level === 'shaky';
        return level === 'good' || level === 'strong';
      })
      .filter((q) => {
        if (!needle) return true;
        if (String(q.id) === needle) return true;
        const haystack = [q.text, ...q.options, q.en.text, ...q.en.options].join(' ').toLowerCase();
        return haystack.includes(needle);
      });
  }, [state, filter, status, query, store.progress]);

  return (
    <div>
      <div className="exambar">
        <button type="button" className="btn small ghost" onClick={onExit}>
          ← {t('backHome', lang)}
        </button>
      </div>

      <input
        type="search"
        value={query}
        placeholder={`${t('search', lang)}…`}
        onChange={(e) => setQuery(e.target.value)}
        aria-label={t('search', lang)}
      />

      <div className="chips" style={{ margin: '12px 0' }}>
        <button type="button" className="chip" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>
          {t('all', lang)}
        </button>
        {TOPICS.map((topic) => (
          <button
            key={topic.id}
            type="button"
            className="chip"
            aria-pressed={filter === topic.id}
            onClick={() => setFilter(topic.id)}
          >
            {lang === 'de' ? topic.de : topic.en}
          </button>
        ))}
      </div>

      <div className="chips" style={{ marginBottom: 12 }}>
        {(['any', 'weak', 'strong', 'new'] as Status[]).map((option) => (
          <button
            key={option}
            type="button"
            className="chip"
            aria-pressed={status === option}
            onClick={() => setStatus(option)}
          >
            {option === 'any'
              ? t('all', lang)
              : option === 'weak'
                ? t('levelWeak', lang)
                : option === 'strong'
                  ? t('levelStrong', lang)
                  : t('levelNew', lang)}
          </button>
        ))}
      </div>

      <p className="small muted">{countQuestions(results.length, lang)}</p>

      {results.length === 0 && <p className="muted">{t('noResults', lang)}</p>}

      <div className="qlist">
        {results.map((q) => (
          <details key={q.id}>
            <summary>
              <span className="num">#{q.id}</span>
              {lang === 'de' ? q.text : q.en.text}
            </summary>
            <div className="foot" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
              <StrengthBadge level={strengthLevel(store.progress[q.id])} lang={lang} />
              <AnswerDots history={historyOf(store.progress[q.id])} lang={lang} />
            </div>
            {q.image && (
              <div className="qimage" style={{ maxWidth: 320 }}>
                <img src={q.image} alt="" loading="lazy" />
              </div>
            )}
            <div className="answer">
              <span className="label">{t('correctAnswer', lang)}: </span>
              <span className="value">
                {KEYS[q.answer]}
                {q.optionImages ? '' : ` — ${(lang === 'de' ? q.options : q.en.options)[q.answer]}`}
              </span>
              {q.optionImages && (
                <div className="qimage" style={{ maxWidth: 200, marginTop: 8 }}>
                  <img src={q.optionImages[q.answer]} alt="" loading="lazy" />
                </div>
              )}
            </div>
            {q.en.context && (
              <p className="small muted" style={{ marginTop: 8 }}>
                {q.en.context}
              </p>
            )}
          </details>
        ))}
      </div>
    </div>
  );
}
