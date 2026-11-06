import { useMemo } from 'react';
import type { Lang } from '../../types.ts';
import { TOPICS } from '../../content/topics.ts';
import { vocab } from '../../content/wortschatz.ts';
import { useStore } from '../../lib/storage.ts';
import { dueOrder, isWeak } from '../../lib/srs.ts';
import { tr } from '../../lib/i18n.ts';
import { S, ShareBar, cardKey, countsFor, entriesOf, useTts } from './shared.tsx';
import { useWsSettings } from './settings.ts';

export default function Overview({ lang, go }: { lang: Lang; go: (r: string) => void }) {
  const [store] = useStore();
  const progress = store.progress;
  const tts = useTts();
  const [settings, setAutoSpeak] = useWsSettings();

  const { due, weak } = useMemo(() => {
    const now = Date.now();
    const keys = vocab.map((e) => cardKey(e.id));
    return {
      due: dueOrder(keys, progress, now).length,
      weak: keys.filter((k) => isWeak(progress[k], now)).length,
    };
  }, [progress]);

  const perTopic = useMemo(() => {
    const now = Date.now();
    return TOPICS.map((t) => ({ topic: t, counts: countsFor(entriesOf(t.id), progress, now) }));
  }, [progress]);

  return (
    <div className="ws">
      <h1>{tr(S.title, lang)}</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        {tr(S.intro, lang)} <span className="small">({vocab.length} {tr(S.words, lang)})</span>
      </p>

      <div className="stack" style={{ marginTop: 16 }}>
        <button type="button" className={`rec ${due > 0 ? 'lead' : ''}`} onClick={() => go('wortschatz/lernen/due')} disabled={due === 0}>
          <span className="icon">⏰</span>
          <span style={{ flex: 1 }}>
            <span className="title">{tr(S.due, lang)}</span>
            <span className="why">{due > 0 ? tr(S.dueSub, lang) : tr(S.dueNone, lang)}</span>
          </span>
          <span className="count">{due}</span>
        </button>
        <button type="button" className="rec" onClick={() => go('wortschatz/lernen/weak')} disabled={weak === 0}>
          <span className="icon">🎯</span>
          <span style={{ flex: 1 }}>
            <span className="title">{tr(S.weak, lang)}</span>
            <span className="why">{weak > 0 ? tr(S.weakSub, lang) : tr(S.weakNone, lang)}</span>
          </span>
          <span className="count">{weak}</span>
        </button>
        <div className="ws-quick">
          <button type="button" className="tile" onClick={() => go('wortschatz/lernen/all')}>
            <span className="icon">🃏</span>
            <span>
              <span className="title">{tr(S.mixed, lang)}</span>
              <span className="sub">{tr(S.mixedSub, lang)}</span>
            </span>
          </button>
          <button type="button" className="tile" onClick={() => go('wortschatz/artikel/all')}>
            <span className="icon">🎨</span>
            <span>
              <span className="title">{tr(S.articles, lang)}</span>
              <span className="sub">{tr(S.articlesSub, lang)}</span>
            </span>
          </button>
          <button type="button" className="tile" onClick={() => go('wortschatz/thema/all')}>
            <span className="icon">🔎</span>
            <span>
              <span className="title">{tr(S.browseAll, lang)}</span>
              <span className="sub">{tr(S.browseAllSub, lang)}</span>
            </span>
          </button>
        </div>
        {tts && (
          <label className="ws-toggle">
            <input
              type="checkbox"
              checked={settings.autoSpeak}
              onChange={(e) => setAutoSpeak(e.target.checked)}
            />
            <span>🔊 {tr(S.autoSpeak, lang)}</span>
          </label>
        )}
      </div>

      <h2>{tr(S.topics, lang)}</h2>
      <div className="ws-topics">
        {perTopic.map(({ topic, counts }) => (
          <button key={topic.id} type="button" className="tile ws-topic" onClick={() => go(`wortschatz/thema/${topic.id}`)}>
            <span className="icon">{topic.icon}</span>
            <span className="ws-topic-body">
              <span className="title">{topic.label[lang]}</span>
              <span className="sub">
                {counts.total} {tr(S.words, lang)} · {counts.strong} {tr(S.strongShort, lang)}
              </span>
              <ShareBar value={counts.total ? counts.strong / counts.total : 0} good />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
