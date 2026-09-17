import type { Attempt, Lang, StrengthLevel } from '../types.ts';
import { type Key, t } from '../lib/i18n.ts';

const META: Record<StrengthLevel, { key: Key; className: string }> = {
  new: { key: 'levelNew', className: 'lvl-new' },
  weak: { key: 'levelWeak', className: 'lvl-weak' },
  shaky: { key: 'levelShaky', className: 'lvl-shaky' },
  good: { key: 'levelGood', className: 'lvl-good' },
  strong: { key: 'levelStrong', className: 'lvl-strong' },
};

export const levelLabel = (level: StrengthLevel, lang: Lang) => t(META[level].key, lang);
export const levelClass = (level: StrengthLevel) => META[level].className;

export function StrengthBadge({ level, lang }: { level: StrengthLevel; lang: Lang }) {
  return <span className={`lvl ${META[level].className}`}>{levelLabel(level, lang)}</span>;
}

/** A row of marks for the recent answers, newest on the right. */
export function AnswerDots({ history, lang }: { history: Attempt[]; lang: Lang }) {
  if (history.length === 0) return <span className="small muted">{t('neverAnswered', lang)}</span>;
  return (
    <span className="dots" aria-label={t('yourAnswers', lang)}>
      {history
        .slice()
        .reverse()
        .map((attempt, i) => (
          <span key={`${attempt.at}-${i}`} className={`dot ${attempt.ok ? 'ok' : 'no'}`} aria-hidden="true">
            {attempt.ok ? '✓' : '✗'}
          </span>
        ))}
    </span>
  );
}

/** A thin meter for a 0..1 strength value. */
export function StrengthBar({ value, level }: { value: number; level?: StrengthLevel }) {
  return (
    <div className={`bar strength ${level ? META[level].className : ''}`}>
      <span style={{ width: `${Math.round(value * 100)}%` }} />
    </div>
  );
}
