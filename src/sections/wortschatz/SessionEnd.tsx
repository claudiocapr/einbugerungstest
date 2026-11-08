import type { ReactNode } from 'react';
import type { Lang } from '../../types.ts';
import type { VocabEntry } from '../../content/types.ts';
import { tr } from '../../lib/i18n.ts';
import { ArticleBadge, S } from './shared.tsx';

export default function SessionEnd({
  lang,
  correct,
  total,
  missed,
  onAgain,
  onBack,
  backLabel,
  extra,
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
      </p>
      {missed.length > 0 ? (
        <div style={{ textAlign: 'left', marginTop: 16 }}>
          <h2 style={{ marginTop: 0 }}>{tr(S.missed, lang)}</h2>
          <ul className="ws-missed">
            {missed.map((e) => (
              <li key={e.id}>
                <ArticleBadge article={e.article} /> <strong>{e.de}</strong> <span className="muted">– {e.en}</span>
              </li>
            ))}
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
