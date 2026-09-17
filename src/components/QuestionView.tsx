import { useEffect, useState } from 'react';
import type { Lang, Question } from '../types.ts';
import { t } from '../lib/i18n.ts';

const KEYS = ['A', 'B', 'C', 'D'];

interface Props {
  question: Question;
  lang: Lang;
  /** Chosen option index, or null when nothing is picked yet. */
  chosen: number | null;
  /** Reveals which option is right; disables further input. */
  revealed: boolean;
  onChoose: (index: number) => void;
  /** Shown above the question, e.g. "Frage 3 von 33". */
  counter?: string;
}

export function QuestionView({ question, lang, chosen, revealed, onChoose, counter }: Props) {
  const [showOther, setShowOther] = useState(false);

  // Collapse the translation again whenever a different question comes in.
  useEffect(() => setShowOther(false), [question.id]);

  const text = lang === 'de' ? question.text : question.en.text;
  const options = lang === 'de' ? question.options : question.en.options;
  const other = lang === 'de' ? question.en.text : question.text;
  const otherOptions = lang === 'de' ? question.en.options : question.options;

  const optionClass = (i: number) => {
    if (!revealed) return chosen === i ? 'option selected' : 'option';
    if (i === question.answer) return 'option correct';
    if (i === chosen) return 'option incorrect';
    return 'option';
  };

  return (
    <div>
      <div className="qmeta">
        {counter && <span>{counter}</span>}
        <span className="spacer" />
        <span>
          #{question.id}
          {question.state ? ` · ${question.state}` : ''}
        </span>
      </div>

      <p className="qtext">{text}</p>
      {showOther && <p className="qtrans">{other}</p>}

      {question.image && (
        <figure className="qimage" style={{ margin: '12px 0' }}>
          <img src={question.image} alt={t('imageQuestion', lang)} loading="lazy" />
        </figure>
      )}

      <div className="options">
        {options.map((label, i) => (
          <button
            key={i}
            type="button"
            className={optionClass(i)}
            onClick={() => !revealed && onChoose(i)}
            disabled={revealed}
            aria-pressed={chosen === i}
          >
            <span className="key" aria-hidden="true">{KEYS[i]}</span>
            <span className="body">
              {question.optionImages ? (
                <img
                  className="optimg"
                  src={question.optionImages[i]}
                  alt={`${t('imageQuestion', lang)} ${i + 1}`}
                  loading="lazy"
                />
              ) : (
                <>
                  <span>{label}</span>
                  {showOther && <span className="qtrans" style={{ display: 'block', margin: '4px 0 0' }}>{otherOptions[i]}</span>}
                </>
              )}
            </span>
          </button>
        ))}
      </div>

      {question.imageCredit && <p className="small muted" style={{ marginTop: 8 }}>{question.imageCredit}</p>}

      <div className="row" style={{ marginTop: 12 }}>
        <button type="button" className="btn small ghost" onClick={() => setShowOther((v) => !v)}>
          {showOther ? '×' : '🌐'} {t('showTranslation', lang)}
        </button>
      </div>
    </div>
  );
}

export function Verdict({ question, chosen, lang }: { question: Question; chosen: number | null; lang: Lang }) {
  const unanswered = chosen === null;
  const right = chosen === question.answer;
  return (
    <div className={`verdict ${unanswered ? '' : right ? 'good' : 'bad'}`}>
      <div className="head">
        {unanswered ? t('unanswered', lang) : right ? `✓ ${t('correct', lang)}` : `✗ ${t('wrong', lang)}`}
        {!right && (
          <span style={{ fontWeight: 400 }}>
            {' — '}
            {t('correctAnswer', lang)}: {KEYS[question.answer]}
          </span>
        )}
      </div>
      {question.en.context && (
        <div className="body">
          {lang === 'de' && <strong>{t('explanation', lang)} (EN): </strong>}
          {question.en.context}
        </div>
      )}
    </div>
  );
}
