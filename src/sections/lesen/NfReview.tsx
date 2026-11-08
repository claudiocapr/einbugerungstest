/**
 * Neurofeedback mode (test phase) for the exam drills: the "geraten" toggle per
 * item, the confidence badge after submitting, and the "Wie sicher warst du?"
 * review block. Rendered only while the "neurofeedback" flag is on; the
 * Modelltest never passes the marks, so it never shows any of this.
 */
import type { Confidence, Lang, Text2 } from '../../types.ts';
import { tr } from '../../lib/i18n.ts';
import { calibrationVerdict, nfSummary, paceText, sureWrongItems, type NfItem } from './nf.ts';
import './nf.css';

const N = {
  guess: { de: 'geraten', en: 'guessed' },
  guessHint: {
    de: 'Markiere, wenn du geraten hast – sonst zählt die Antwort als sicher.',
    en: 'Mark it if you guessed – otherwise the answer counts as sure.',
  },
  sure: { de: 'sicher', en: 'sure' },
  open: { de: 'offen', en: 'open' },
  title: { de: 'Wie sicher warst du?', en: 'How sure were you?' },
  sureRight: { de: 'Sicher & richtig', en: 'Sure & right' },
  sureWrong: { de: 'Sicher, aber falsch', en: 'Sure but wrong' },
  guessRight: { de: 'Geraten & richtig', en: 'Guessed & right' },
  guessWrong: { de: 'Geraten & falsch', en: 'Guessed & wrong' },
  twice: {
    de: 'Sicher, aber falsch – diese Erklärungen lohnen sich doppelt',
    en: 'Sure but wrong – these explanations are worth reading twice',
  },
  twiceWhy: {
    de: 'Fehler, bei denen man sich sicher war, merkt man sich nach der Korrektur besonders gut – wenn man die Erklärung bewusst liest.',
    en: 'Mistakes you were sure about stick especially well once corrected – if you read the explanation deliberately.',
  },
  solution: { de: 'Lösung', en: 'Solution' },
  legend: { de: '😎 sicher · 🎲 geraten', en: '😎 sure · 🎲 guessed' },
} satisfies Record<string, Text2>;

/** The "🎲 geraten" toggle next to an item's answer control. `compact` shows only the dice (inline gaps). */
export function GuessToggle({
  on,
  onToggle,
  lang,
  label,
  compact = false,
  disabled = false,
}: {
  on: boolean;
  onToggle: () => void;
  lang: Lang;
  /** Item number or name for screen readers, e.g. "23". */
  label: string;
  compact?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className={`chip ${compact ? 'nf-dice' : 'nf-guess'}`}
      aria-pressed={on}
      aria-label={`${tr(N.guess, lang)} – ${label}`}
      title={tr(N.guessHint, lang)}
      disabled={disabled}
      onClick={onToggle}
    >
      🎲{compact ? '' : ` ${tr(N.guess, lang)}`}
    </button>
  );
}

/** "😎 sicher" / "🎲 geraten" after submitting (nothing for an open item). */
export function ConfBadge({ conf, lang }: { conf: Confidence | undefined; lang: Lang }) {
  if (!conf) return null;
  const guess = conf === 'guess';
  return <span className={`nf-conf${guess ? ' guess' : ''}`}>{guess ? `🎲 ${tr(N.guess, lang)}` : `😎 ${tr(N.sure, lang)}`}</span>;
}

/** Toggle while answering, badge after submitting – in a row below the answer control. */
export function GuessRow({
  review,
  answered,
  guessed,
  onToggle,
  lang,
  label,
  disabled,
}: {
  review: boolean;
  answered: boolean;
  guessed: boolean;
  onToggle: () => void;
  lang: Lang;
  label: string;
  disabled?: boolean;
}) {
  if (review && !answered) return null;
  return (
    <div className="nf-guessrow">
      {review ? (
        <ConfBadge conf={answered ? (guessed ? 'guess' : 'sure') : undefined} lang={lang} />
      ) : (
        <GuessToggle on={guessed} onToggle={onToggle} lang={lang} label={label} disabled={disabled} />
      )}
    </div>
  );
}

export interface NfReviewItem extends NfItem {
  /** Number as printed in the exam. */
  num: number;
  solution: string;
  explanation: Text2;
}

/** The "Wie sicher warst du?" block on the result screen. */
export function NfReview({
  lang,
  items,
  durationMs,
  paceMinutes,
}: {
  lang: Lang;
  items: NfReviewItem[];
  /** Time the set took; with `paceMinutes`, shows the pace verdict. */
  durationMs?: number;
  paceMinutes?: number;
}) {
  const s = nfSummary(items);
  const twice = sureWrongItems(items).map((i) => items[i]);
  const mark = (it: NfReviewItem) => (it.conf === 'guess' ? '🎲' : it.conf === 'sure' ? '😎' : '·');
  return (
    <section className="card nf-review" aria-labelledby="nf-title">
      <h2 id="nf-title">{tr(N.title, lang)}</h2>
      <div className="nf-sum">
        <span>
          {tr(N.sureRight, lang)} <b>{s.sureRight}</b>
        </span>
        <span className={s.sureWrong ? 'sw' : undefined}>
          · {tr(N.sureWrong, lang)} <b>{s.sureWrong}</b>
        </span>
        <span>
          · {tr(N.guessRight, lang)} <b>{s.guessRight}</b>
        </span>
        <span>
          · {tr(N.guessWrong, lang)} <b>{s.guessWrong}</b>
        </span>
      </div>
      <p>{tr(calibrationVerdict(s), lang)}</p>
      {paceMinutes !== undefined && durationMs !== undefined && (
        <p className="small">⏱ {paceText(durationMs, paceMinutes, lang)}</p>
      )}

      {twice.length > 0 && (
        <>
          <h3>⚠️ {tr(N.twice, lang)}</h3>
          <p className="small muted">{tr(N.twiceWhy, lang)}</p>
          {twice.map((it) => (
            <div key={it.num} className="verdict bad">
              <div className="head">
                {it.num} · {tr(N.solution, lang)}: {it.solution}
              </div>
              <div className="body">{tr(it.explanation, lang)}</div>
            </div>
          ))}
        </>
      )}

      <div className="nf-items" aria-label={tr(N.legend, lang)}>
        {items.map((it) => (
          <span key={it.num} className={`chip${it.conf === 'sure' && !it.ok ? ' sw' : ''}`}>
            {it.num} {it.ok ? '✓' : '✗'} {mark(it)}
            <span className="nf-sr">{it.conf ? tr(it.conf === 'guess' ? N.guess : N.sure, lang) : tr(N.open, lang)}</span>
          </span>
        ))}
      </div>
      <p className="small muted">{tr(N.legend, lang)}</p>
    </section>
  );
}
