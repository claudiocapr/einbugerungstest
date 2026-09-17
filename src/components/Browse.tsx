import { useMemo, useState } from 'react';
import type { Lang, State, Topic } from '../types.ts';
import { countQuestions, t } from '../lib/i18n.ts';
import { TOPICS, catalogueFor } from '../lib/questions.ts';

const KEYS = ['A', 'B', 'C', 'D'];

type Filter = 'all' | Topic;

export function Browse({ state, lang, onExit }: { state: State; lang: Lang; onExit: () => void }) {
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return catalogueFor(state)
      .filter((q) => filter === 'all' || q.topic === filter)
      .filter((q) => {
        if (!needle) return true;
        if (String(q.id) === needle) return true;
        const haystack = [q.text, ...q.options, q.en.text, ...q.en.options].join(' ').toLowerCase();
        return haystack.includes(needle);
      });
  }, [state, filter, query]);

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

      <p className="small muted">{countQuestions(results.length, lang)}</p>

      {results.length === 0 && <p className="muted">{t('noResults', lang)}</p>}

      <div className="qlist">
        {results.map((q) => (
          <details key={q.id}>
            <summary>
              <span className="num">#{q.id}</span>
              {lang === 'de' ? q.text : q.en.text}
            </summary>
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
