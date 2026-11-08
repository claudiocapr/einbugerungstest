/**
 * Sprachbausteine Teil 1 and 2 as controlled components (reusable by the
 * Modelltest): the gapped text with inline selectors / tap-to-fill gaps, and
 * the per-gap review after submitting.
 */
import { Fragment } from 'react';
import type { Sb1Set, Sb2Set } from '../../content/types.ts';
import { tr } from '../../lib/i18n.ts';
import { Verdict, verdictHead } from '../lesen/drill.tsx';
import type { TaskProps } from '../lesen/tasks.tsx';
import { confFor } from '../lesen/nf.ts';
import { ConfBadge, GuessToggle } from '../lesen/NfReview.tsx';
import { FIRST_NUMBER, letter, placeWord, splitGaps } from './score.ts';
import '../lesen/drill.css';

const L = {
  review: { de: 'Lösungen und Erklärungen', en: 'Answers and explanations' },
  words: { de: 'Wörter a–o', en: 'Words a–o' },
  tapGap: { de: 'Tippen Sie auf eine Lücke, dann auf ein Wort.', en: 'Tap a gap, then a word.' },
  gap: { de: 'Lücke', en: 'Gap' },
  clear: { de: 'Lücke leeren', en: 'Clear gap' },
};

/* -------------------------------------------------------------- Teil 1 */

export function Sb1Task({ set, answers, update, review, lang, firstNumber = FIRST_NUMBER.sb1, nf }: TaskProps<Sb1Set>) {
  const pieces = splitGaps(set.text);
  return (
    <>
      <div className="card">
        <p className="gaptext">
          {pieces.map((p, idx) => {
            if (p.kind === 'text') return <Fragment key={idx}>{p.text}</Fragment>;
            const i = p.n - 1;
            const gap = set.gaps[i];
            if (!gap) return <Fragment key={idx}>[{p.n}]</Fragment>;
            const chosen = answers[i] ?? null;
            const num = firstNumber + i;
            if (review) {
              const ok = chosen === gap.answer;
              return (
                <span key={idx} className={`gapfill ${ok ? 'correct' : 'incorrect'}`}>
                  <span className="gn">{num}</span>
                  {!ok && chosen !== null && (
                    <>
                      <s>{gap.options[chosen]}</s>{' '}
                    </>
                  )}
                  <b>{gap.options[gap.answer]}</b>
                </span>
              );
            }
            const select = (
              <select
                key={idx}
                className="gapsel"
                aria-label={`${tr(L.gap, lang)} ${num}`}
                value={chosen === null ? '' : String(chosen)}
                onChange={(e) => {
                  const v = e.target.value === '' ? null : Number(e.target.value);
                  update((prev) => prev.map((a, j) => (j === i ? v : a)));
                }}
              >
                <option value="">{num} …</option>
                {gap.options.map((o, k) => (
                  <option key={k} value={k}>
                    {letter(k)}) {o}
                  </option>
                ))}
              </select>
            );
            if (!nf) return select;
            return (
              <Fragment key={idx}>
                {select}
                <GuessToggle compact on={!!nf.guesses[i]} onToggle={() => nf.toggle(i)} lang={lang} label={`${tr(L.gap, lang)} ${num}`} />
              </Fragment>
            );
          })}
        </p>
      </div>
      {review && (
        <>
          <h2 style={{ margin: '8px 0 0' }}>{tr(L.review, lang)}</h2>
          {set.gaps.map((g, i) => {
            const outcome = review.items[i];
            const chosen = outcome?.chosen ?? null;
            return (
              <div key={i} className="card">
                <div className="row wrap">
                  <span className="num">{firstNumber + i}</span>
                  <span className="pointlabel">{g.point}</span>
                  {nf && (
                    <>
                      <span className="spacer" />
                      <ConfBadge conf={confFor(chosen !== null, !!nf.guesses[i])} lang={lang} />
                    </>
                  )}
                </div>
                <div className="chips pick" style={{ marginTop: 10 }}>
                  {g.options.map((o, k) => (
                    <span key={k} className={`chip${k === g.answer ? ' correct' : k === chosen ? ' incorrect' : ''}`}>
                      {letter(k)}) {o}
                    </span>
                  ))}
                </div>
                <Verdict
                  ok={!!outcome?.ok}
                  head={verdictHead(!!outcome?.ok, lang, chosen === null ? null : g.options[chosen], g.options[g.answer])}
                  body={tr(g.explanation, lang)}
                />
              </div>
            );
          })}
        </>
      )}
    </>
  );
}

/* -------------------------------------------------------------- Teil 2 */

export interface Sb2Props extends TaskProps<Sb2Set> {
  /** The gap the next tapped word goes into (0-based), or null. */
  active: number | null;
  setActive: (gap: number | null) => void;
}

/** The text with tappable gaps (and, after submitting, the review). */
export function Sb2Task({ set, answers, review, lang, active, setActive, firstNumber = FIRST_NUMBER.sb2, nf }: Sb2Props) {
  const pieces = splitGaps(set.text);
  return (
    <>
      <div className="card">
        <p className="gaptext">
          {pieces.map((p, idx) => {
            if (p.kind === 'text') return <Fragment key={idx}>{p.text}</Fragment>;
            const i = p.n - 1;
            const gap = set.gaps[i];
            if (!gap) return <Fragment key={idx}>[{p.n}]</Fragment>;
            const chosen = answers[i] ?? null;
            const num = firstNumber + i;
            if (review) {
              const ok = chosen === gap.answer;
              return (
                <span key={idx} className={`gapfill ${ok ? 'correct' : 'incorrect'}`}>
                  <span className="gn">{num}</span>
                  {!ok && chosen !== null && (
                    <>
                      <s>{set.words[chosen]}</s>{' '}
                    </>
                  )}
                  <b>{set.words[gap.answer]}</b>
                </span>
              );
            }
            const gapButton = (
              <button
                key={idx}
                type="button"
                className={`gapbtn${active === i ? ' active' : ''}${chosen === null ? ' empty' : ''}`}
                aria-label={`${tr(L.gap, lang)} ${num}`}
                aria-pressed={active === i}
                onClick={() => setActive(active === i ? null : i)}
              >
                <span className="gn">{num}</span>
                {chosen === null ? '……' : set.words[chosen]}
              </button>
            );
            if (!nf) return gapButton;
            return (
              <Fragment key={idx}>
                {gapButton}
                <GuessToggle compact on={!!nf.guesses[i]} onToggle={() => nf.toggle(i)} lang={lang} label={`${tr(L.gap, lang)} ${num}`} />
              </Fragment>
            );
          })}
        </p>
      </div>
      {review && (
        <>
          <h2 style={{ margin: '8px 0 0' }}>{tr(L.review, lang)}</h2>
          {set.gaps.map((g, i) => {
            const outcome = review.items[i];
            const chosen = outcome?.chosen ?? null;
            return (
              <div key={i} className="card">
                <div className="row">
                  <span className="num">{firstNumber + i}</span>
                  {nf && (
                    <>
                      <span className="spacer" />
                      <ConfBadge conf={confFor(chosen !== null, !!nf.guesses[i])} lang={lang} />
                    </>
                  )}
                </div>
                <Verdict
                  ok={!!outcome?.ok}
                  head={verdictHead(
                    !!outcome?.ok,
                    lang,
                    chosen === null ? null : `${letter(chosen)}) ${set.words[chosen]}`,
                    `${letter(g.answer)}) ${set.words[g.answer]}`,
                  )}
                  body={tr(g.explanation, lang)}
                />
              </div>
            );
          })}
        </>
      )}
    </>
  );
}

/** The word bank a–o for the sticky bottom bar. Used words are greyed out (tapping one moves it). */
export function Sb2WordBank({ set, answers, update, lang, active, setActive, firstNumber = FIRST_NUMBER.sb2 }: Sb2Props) {
  const fill = (word: number) => {
    const target = active ?? answers.findIndex((a) => a === null);
    if (target < 0) return;
    const next = placeWord(answers, target, answers[target] === word ? null : word);
    update(() => next);
    // Move on to the next open gap, so the text can be filled in one go.
    const after = next.findIndex((a, j) => j > target && a === null);
    const first = next.findIndex((a) => a === null);
    setActive(after >= 0 ? after : first >= 0 ? first : null);
  };
  const activeNum = active === null ? null : firstNumber + active;
  return (
    <div className="wordbank">
      <div className="row">
        <span className="hint">
          {activeNum === null ? tr(L.tapGap, lang) : `${tr(L.gap, lang)} ${activeNum} →`}
        </span>
        <span className="spacer" />
        {active !== null && answers[active] !== null && (
          <button type="button" className="btn small ghost" onClick={() => update((prev) => placeWord(prev, active, null))}>
            {tr(L.clear, lang)}
          </button>
        )}
      </div>
      <div className="chips" role="group" aria-label={tr(L.words, lang)}>
        {set.words.map((w, k) => {
          const used = answers.includes(k);
          return (
            <button
              key={k}
              type="button"
              className={`chip${used ? ' used' : ''}`}
              aria-pressed={active !== null && answers[active] === k}
              onClick={() => fill(k)}
            >
              <b>{letter(k)}</b> {w}
            </button>
          );
        })}
      </div>
    </div>
  );
}
