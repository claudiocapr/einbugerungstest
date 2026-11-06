import { useMemo, useState } from 'react';
import type { Lang } from '../../types.ts';
import type { PartOfSpeech, TopicId } from '../../content/types.ts';
import { TOPICS } from '../../content/topics.ts';
import { useStore } from '../../lib/storage.ts';
import { historyOf, strengthLevel } from '../../lib/srs.ts';
import { tr } from '../../lib/i18n.ts';
import { AnswerDots, StrengthBadge } from '../../components/Strength.tsx';
import {
  ArticleBadge,
  BackLink,
  EntryDetails,
  POS_LABEL,
  S,
  SESSION_SIZE,
  SpeakButton,
  cardKey,
  countsFor,
  entriesOf,
  scopeLabel,
  spoken,
  useTts,
} from './shared.tsx';

type PosFilter = 'all' | 'noun' | 'verb' | 'adjective' | 'phrase';
const FILTERS: PosFilter[] = ['all', 'noun', 'verb', 'adjective', 'phrase'];

/** Adverbs and "other" are filed with adjectives, so every entry is reachable through a chip. */
const matchesPos = (pos: PartOfSpeech, f: PosFilter) =>
  f === 'all' || pos === f || (f === 'adjective' && (pos === 'adverb' || pos === 'other'));

/** Case- and umlaut-tolerant search ("aerger" finds "Ärger"). */
const fold = (s: string) =>
  s
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss');

export default function TopicView({ scope, lang, go }: { scope: TopicId | 'all'; lang: Lang; go: (r: string) => void }) {
  const [store] = useStore();
  const progress = store.progress;
  const tts = useTts();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<PosFilter>('all');

  const entries = useMemo(() => entriesOf(scope), [scope]);
  const counts = useMemo(() => countsFor(entries, progress), [entries, progress]);
  const hasNouns = entries.some((e) => e.pos === 'noun');
  const topic = TOPICS.find((t) => t.id === scope);

  const shown = useMemo(() => {
    const q = fold(query.trim());
    return entries.filter(
      (e) =>
        matchesPos(e.pos, filter) &&
        (!q || fold(`${e.article ?? ''} ${e.de}`).includes(q) || fold(e.en).includes(q)),
    );
  }, [entries, query, filter]);

  return (
    <div className="ws">
      <BackLink lang={lang} go={go} />
      <h1>
        {topic ? `${topic.icon} ` : ''}
        {scopeLabel(scope, lang)}
      </h1>

      <div className="statgrid" style={{ marginTop: 12 }}>
        <div className="stat">
          <div className="n">{counts.total}</div>
          <div className="l">{tr(S.total, lang)}</div>
        </div>
        <div className="stat">
          <div className="n">{counts.fresh}</div>
          <div className="l">{tr(S.newOnes, lang)}</div>
        </div>
        <div className="stat">
          <div className="n bad">{counts.weak}</div>
          <div className="l">{tr(S.weakOnes, lang)}</div>
        </div>
        <div className="stat">
          <div className="n good">{counts.strong}</div>
          <div className="l">{tr(S.strongOnes, lang)}</div>
        </div>
      </div>

      <div className="ws-actions">
        <button type="button" className="btn primary" onClick={() => go(`wortschatz/lernen/${scope}`)}>
          🃏 {tr(S.learn, lang)} ({Math.min(SESSION_SIZE, entries.length)})
        </button>
        {hasNouns && (
          <button type="button" className="btn" onClick={() => go(`wortschatz/artikel/${scope}`)}>
            🎨 {tr(S.articles, lang)}
          </button>
        )}
      </div>

      <div className="stack" style={{ marginTop: 20 }}>
        <input
          type="search"
          value={query}
          placeholder={tr(S.search, lang)}
          aria-label={tr(S.search, lang)}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="chips" role="group">
          {FILTERS.map((f) => (
            <button key={f} type="button" className="chip" aria-pressed={filter === f} onClick={() => setFilter(f)}>
              {f === 'all' ? tr(S.all, lang) : tr(POS_LABEL[f], lang)}
            </button>
          ))}
        </div>
      </div>

      <div className="qlist ws-list">
        {shown.length === 0 && <p className="muted">{tr(S.noMatch, lang)}</p>}
        {shown.map((e) => {
          const p = progress[cardKey(e.id)];
          return (
            <details key={e.id}>
              <summary>
                <span className="ws-row">
                  <span className="ws-row-main">
                    <ArticleBadge article={e.article} /> <strong>{e.de}</strong>
                    <span className="ws-row-en">{e.en}</span>
                  </span>
                  <StrengthBadge level={strengthLevel(p)} lang={lang} />
                </span>
              </summary>
              <div className="ws-row-body">
                <div className="row wrap small muted" style={{ gap: 8 }}>
                  <span>{tr(POS_LABEL[e.pos], lang)}</span>
                  {tts && <SpeakButton text={spoken(e)} label={S.listen} lang={lang} />}
                </div>
                <EntryDetails e={e} lang={lang} />
                <p className="ws-example">
                  {e.example}
                  {tts && <SpeakButton text={e.example} label={S.listenExample} lang={lang} />}
                </p>
                <p className="ws-example-en">{e.exampleEn}</p>
                <AnswerDots history={historyOf(p)} lang={lang} />
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
