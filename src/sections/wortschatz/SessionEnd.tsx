import type { ReactNode } from 'react';
import type { Lang } from '../../types.ts';
import type { VocabEntry } from '../../content/types.ts';
import { tr } from '../../lib/i18n.ts';
import { merktipps } from '../../content/merktipps.ts';
import { ArticleBadge, S } from './shared.tsx';

const SE = {
  retry: { de: 'Wiederholung', en: 'retry' },
  retries: { de: 'Wiederholungen', en: 'retries' },
  allRight: { de: 'Am Ende hatten Sie jedes Wort richtig.', en: 'In the end you got every word right.' },
};

export default function SessionEnd({
  lang,
  correct,
  total,
  missed,
  onAgain,
  onBack,
  backLabel,
  extra,
  retries,
  complete = false,
}: {
  lang: Lang;
  correct: number;
  total: number;
  missed: VocabEntry[];
  onAgain: () => void;
  onBack: () => void;
  backLabel: string;
  /** Extra lines below the word list (neurofeedback mode only). */
  extra?: ReactNode;
  /** Retry rounds (Artikel-Trainer): how many wrong answers were asked again. */
  retries?: number;
  /** Every word of the round was answered correctly in the end. */
  complete?: boolean;
}) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  return (
    <div className="card center ws-end">
      <h1 style={{ marginTop: 0 }}>{tr(S.done, lang)}</h1>
      <div className="score">
        {correct} / {total}
      </div>
      <p>
        <span className={`badge ${pct >= 60 ? 'good' : 'bad'}`}>{pct} %</span>
        {retries !== undefined && (
          <span className="badge" style={{ marginLeft: 8 }}>
            🔁 {retries} {tr(retries === 1 ? SE.retry : SE.retries, lang)}
          </span>
        )}
      </p>
      {complete && retries !== undefined && retries > 0 && <p className="good">{tr(SE.allRight, lang)}</p>}
      {missed.length > 0 ? (
        <div style={{ textAlign: 'left', marginTop: 16 }}>
          <h2 style={{ marginTop: 0 }}>{tr(S.missed, lang)}</h2>
          <ul className="ws-missed">
            {missed.map((e) => {
              const tip = merktipps(e)[0];
              return (
                <li key={e.id}>
                  <ArticleBadge article={e.article} /> <strong>{e.de}</strong> <span className="muted">– {e.en}</span>
                  {tip && <span className={`ws-missed-tip ${tip.exception ? 'ws-tip-exc' : ''}`}>💡 {tr(tip.text, lang)}</span>}
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        total > 0 && <p className="good">{tr(S.allKnown, lang)}</p>
      )}
      {extra}
      <div className="row wrap" style={{ justifyContent: 'center', marginTop: 18 }}>
        <button type="button" className="btn primary" onClick={onAgain} autoFocus>
          {tr(S.again, lang)}
        </button>
        <button type="button" className="btn" onClick={onBack}>
          ← {backLabel}
        </button>
      </div>
    </div>
  );
}
