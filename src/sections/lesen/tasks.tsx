/**
 * The three Leseverstehen task layouts as controlled components: they render a
 * set, the learner's answers and, once submitted, the per-item review. The
 * Modelltest can embed them with its own state.
 */
import type { Lang } from '../../types.ts';
import type { Lesen1Set, Lesen2Set, Lesen3Set } from '../../content/types.ts';
import { tr } from '../../lib/i18n.ts';
import { assignUnique, FIRST_NUMBER, letter, lesen3X, type SetScore } from './score.ts';
import { Verdict, verdictHead, type Answers } from './drill.tsx';
import type { NfMarks } from './nf.ts';
import { GuessRow } from './NfReview.tsx';
import './drill.css';

export interface TaskProps<T> {
  set: T;
  answers: Answers;
  update: (fn: (prev: Answers) => Answers) => void;
  review: SetScore | null;
  lang: Lang;
  /** Number of the first item as printed in the exam (defaults to the exam's numbering). */
  firstNumber?: number;
  /**
   * Neurofeedback mode: the "geraten" marks. Only the sections' own exercise
   * screens pass it (while the flag is on); without it nothing changes.
   */
  nf?: NfMarks;
}

const L = {
  headlines: { de: 'Überschriften a–j', en: 'Headlines a–j' },
  ads: { de: 'Anzeigen a–l', en: 'Ads a–l' },
  text: { de: 'Text', en: 'Text' },
  chosen: { de: 'Gewählt', en: 'Chosen' },
  noAd: { de: 'x = keine passende Anzeige', en: 'x = no matching ad' },
  forText: { de: 'zu Text', en: 'for text' },
};

function chipClass(i: number, chosen: number | null, key: number, review: SetScore | null, used: boolean) {
  if (review) {
    if (i === key) return 'chip correct';
    if (i === chosen) return 'chip incorrect';
    return 'chip';
  }
  return used ? 'chip used' : 'chip';
}

/* -------------------------------------------------------------- Teil 1 */

export function Lesen1Task({ set, answers, update, review, lang, firstNumber = FIRST_NUMBER.lesen1, nf }: TaskProps<Lesen1Set>) {
  const usedBy = (h: number) => answers.findIndex((a) => a === h);
  return (
    <>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>{tr(L.headlines, lang)}</h2>
        <ul className="reflist">
          {set.headlines.map((h, i) => {
            const keyFor = set.texts.findIndex((t) => t.answer === i);
            const cls = review ? (keyFor >= 0 ? 'key' : '') : usedBy(i) >= 0 ? 'used' : '';
            return (
              <li key={i} className={cls}>
                <span className="l">{letter(i)}</span>
                <span>
                  {h}
                  {review && keyFor >= 0 && (
                    <span className="small"> · {tr(L.forText, lang)} {firstNumber + keyFor}</span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      {set.texts.map((t, i) => {
        const chosen = answers[i] ?? null;
        const outcome = review?.items[i];
        return (
          <div key={i} className="card stack">
            <div className="row">
              <span className="num">{firstNumber + i}</span>
              <span className="small muted">{tr(L.text, lang)}</span>
            </div>
            <p className="extext">{t.text}</p>
            <div className="chips pick" role="group" aria-label={`${tr(L.headlines, lang)} – ${firstNumber + i}`}>
              {set.headlines.map((_, h) => (
                <button
                  key={h}
                  type="button"
                  className={chipClass(h, chosen, t.answer, review, usedBy(h) >= 0 && usedBy(h) !== i)}
                  aria-pressed={chosen === h}
                  disabled={!!review}
                  onClick={() => update((prev) => assignUnique(prev, i, prev[i] === h ? null : h))}
                >
                  {letter(h)}
                </button>
              ))}
            </div>
            {!review && chosen !== null && (
              <p className="picked">
                {tr(L.chosen, lang)}: <b>{letter(chosen)}</b> – {set.headlines[chosen]}
              </p>
            )}
            {nf && (
              <GuessRow review={!!review} answered={chosen !== null} guessed={!!nf.guesses[i]} onToggle={() => nf.toggle(i)}
                lang={lang} label={String(firstNumber + i)} />
            )}
            {outcome && (
              <Verdict
                ok={outcome.ok}
                head={verdictHead(outcome.ok, lang, chosen === null ? null : letter(chosen), `${letter(t.answer)} – ${set.headlines[t.answer]}`)}
                body={tr(t.explanation, lang)}
              />
            )}
          </div>
        );
      })}
    </>
  );
}

/* -------------------------------------------------------------- Teil 2 */

export function Lesen2Task({ set, answers, update, review, lang, firstNumber = FIRST_NUMBER.lesen2, nf }: TaskProps<Lesen2Set>) {
  return (
    <>
      <article className="card">
        <h2 style={{ marginTop: 0 }}>{set.title}</h2>
        {set.text.map((p, i) => (
          <p key={i} className="extext">
            {p}
          </p>
        ))}
      </article>
      {set.items.map((item, i) => {
        const chosen = answers[i] ?? null;
        const outcome = review?.items[i];
        return (
          <div key={i} className="card">
            <div className="row" style={{ alignItems: 'flex-start' }}>
              <span className="num">{firstNumber + i}</span>
              <span style={{ fontWeight: 600 }}>{item.stem}</span>
            </div>
            <div className="options">
              {item.options.map((o, k) => {
                let cls = 'option';
                if (review) {
                  if (k === item.answer) cls += ' correct';
                  else if (k === chosen) cls += ' incorrect';
                } else if (k === chosen) cls += ' selected';
                return (
                  <button
                    key={k}
                    type="button"
                    className={cls}
                    disabled={!!review}
                    aria-pressed={chosen === k}
                    onClick={() => update((prev) => prev.map((a, j) => (j === i ? (a === k ? null : k) : a)))}
                  >
                    <span className="key">{letter(k)}</span>
                    <span className="body">{o}</span>
                  </button>
                );
              })}
            </div>
            {nf && (
              <GuessRow review={!!review} answered={chosen !== null} guessed={!!nf.guesses[i]} onToggle={() => nf.toggle(i)}
                lang={lang} label={String(firstNumber + i)} />
            )}
            {outcome && (
              <Verdict
                ok={outcome.ok}
                head={verdictHead(outcome.ok, lang, chosen === null ? null : letter(chosen), letter(item.answer))}
                body={tr(item.explanation, lang)}
              />
            )}
          </div>
        );
      })}
    </>
  );
}

/* -------------------------------------------------------------- Teil 3 */

export function Lesen3Task({ set, answers, update, review, lang, firstNumber = FIRST_NUMBER.lesen3, nf }: TaskProps<Lesen3Set>) {
  const x = lesen3X(set);
  const usedBy = (a: number) => answers.findIndex((v) => v === a);
  const adLabel = (i: number) => (i === x ? 'x' : `${letter(i)}${set.ads[i]?.title ? ` – ${set.ads[i].title}` : ''}`);
  return (
    <>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>{tr(L.ads, lang)}</h2>
        <div className="adgrid">
          {set.ads.map((ad, i) => (
            <div key={i} className={`ad${!review && usedBy(i) >= 0 ? ' used' : ''}`}>
              <span className="adl">{letter(i)}</span>
              {ad.title && <span className="adt">{ad.title}</span>}
              <p>{ad.text}</p>
            </div>
          ))}
        </div>
      </div>
      {set.situations.map((s, i) => {
        const chosen = answers[i] ?? null;
        const key = s.answer ?? x;
        const outcome = review?.items[i];
        const choices = [...set.ads.map((_, k) => k), x];
        return (
          <div key={i} className="card stack">
            <div className="row" style={{ alignItems: 'flex-start' }}>
              <span className="num">{firstNumber + i}</span>
              <span style={{ fontWeight: 550 }}>{s.text}</span>
            </div>
            <div className="chips pick" role="group" aria-label={`${tr(L.ads, lang)} – ${firstNumber + i}`}>
              {choices.map((k) => (
                <button
                  key={k}
                  type="button"
                  className={chipClass(k, chosen, key, review, k !== x && usedBy(k) >= 0 && usedBy(k) !== i)}
                  aria-pressed={chosen === k}
                  disabled={!!review}
                  title={k === x ? tr(L.noAd, lang) : undefined}
                  onClick={() => update((prev) => assignUnique(prev, i, prev[i] === k ? null : k, x))}
                >
                  {letter(k, x)}
                </button>
              ))}
            </div>
            {!review && chosen !== null && (
              <div className="picked">
                {chosen === x ? (
                  tr(L.noAd, lang)
                ) : (
                  <>
                    {tr(L.chosen, lang)}: <b>{letter(chosen)}</b>
                    {set.ads[chosen]?.title ? ` – ${set.ads[chosen].title}` : ''}
                    <div className="ad" style={{ marginTop: 6 }}>
                      <p style={{ margin: 0 }}>{set.ads[chosen]?.text}</p>
                    </div>
                  </>
                )}
              </div>
            )}
            {nf && (
              <GuessRow review={!!review} answered={chosen !== null} guessed={!!nf.guesses[i]} onToggle={() => nf.toggle(i)}
                lang={lang} label={String(firstNumber + i)} />
            )}
            {outcome && (
              <Verdict
                ok={outcome.ok}
                head={verdictHead(outcome.ok, lang, chosen === null ? null : letter(chosen, x), adLabel(key))}
                body={tr(s.explanation, lang)}
              />
            )}
          </div>
        );
      })}
    </>
  );
}
