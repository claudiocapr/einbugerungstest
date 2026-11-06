// Renders each automatically scored exam part as it appears in the mock, and
// the per-item review rows for the results page.
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import type { Lang, Text2 } from '../../types.ts';
import type { Hoeren1Set, Hoeren2Set, Hoeren3Set, Lesen1Set, Lesen2Set, Lesen3Set, Line, Sb1Set, Sb2Set } from '../../content/types.ts';
import { speakLines, stop, ttsAvailable } from '../../lib/tts.ts';
import { logError } from '../../lib/analytics.ts';
import { tr } from '../../lib/i18n.ts';
import { splitGaps } from './assemble.ts';
import { FALSCH, FIRST_NUMBER, RICHTIG, answerKey, lesen3X, markPart, type Answer, type ObjPart, type ObjSetByPart } from './score.ts';

export const LETTERS = 'abcdefghijklmno';

const L = {
  missing: { de: 'Inhalte für diesen Teil fehlen noch.', en: 'Content for this part is still missing.' },
  missingNote: { de: 'Dieser Teil wird übersprungen und nicht gewertet.', en: 'This part is skipped and not scored.' },
  choose: { de: '– wählen –', en: '– choose –' },
  noAd: { de: 'x (keine Anzeige passt)', en: 'x (no ad fits)' },
  richtig: { de: 'Richtig', en: 'True' },
  falsch: { de: 'Falsch', en: 'False' },
  play: { de: 'Abspielen', en: 'Play' },
  playing: { de: 'Läuft …', en: 'Playing …' },
  left: { de: 'noch', en: 'left' },
  used: { de: 'Schon gehört', en: 'Already played' },
  noTts: {
    de: 'Dieses Gerät hat keine deutsche Sprachausgabe. Sie können den Text stattdessen einmal lesen.',
    en: 'This device has no German speech output. You can read the text instead.',
  },
  showText: { de: 'Text zeigen', en: 'Show text' },
  gap: { de: 'Lücke', en: 'Gap' },
  text: { de: 'Text', en: 'Text' },
  headlines: { de: 'Überschriften', en: 'Headlines' },
  ads: { de: 'Anzeigen', en: 'Ads' },
  words: { de: 'Wörter', en: 'Words' },
  conversation: { de: 'Gespräch', en: 'Conversation' },
};

export const INSTRUCTIONS: Record<ObjPart, Text2> = {
  lesen1: {
    de: 'Lesen Sie die Überschriften a–j und die Texte 1–5. Welche Überschrift passt zu welchem Text? Fünf Überschriften bleiben übrig.',
    en: 'Read headlines a–j and texts 1–5. Which headline fits which text? Five headlines are left over.',
  },
  lesen2: {
    de: 'Lesen Sie den Text und die Aufgaben 6–10. Welche Lösung – a, b oder c – ist richtig?',
    en: 'Read the text and items 6–10. Which answer – a, b or c – is right?',
  },
  lesen3: {
    de: 'Lesen Sie die Situationen 11–20 und die Anzeigen a–l. Welche Anzeige passt? Jede Anzeige passt höchstens einmal. Für eine Situation passt keine Anzeige: Dann wählen Sie x.',
    en: 'Read situations 11–20 and ads a–l. Which ad fits? Each ad fits once at most. One situation has no matching ad: choose x.',
  },
  sb1: {
    de: 'Lesen Sie den Text. Welches Wort passt in die Lücken 21–30? Wählen Sie a, b oder c.',
    en: 'Read the text. Which word fits gaps 21–30? Choose a, b or c.',
  },
  sb2: {
    de: 'Lesen Sie den Text. Welches Wort aus a–o passt in die Lücken 31–40? Jedes Wort passt nur einmal.',
    en: 'Read the text. Which word from a–o fits gaps 31–40? Each word fits only once.',
  },
  hoeren1: {
    de: 'Sie hören fünf kurze Texte. Sie hören jeden Text nur einmal. Ist die Aussage richtig oder falsch?',
    en: 'You hear five short texts, each only once. Is the statement true or false?',
  },
  hoeren2: {
    de: 'Sie hören ein Gespräch. Sie hören es zweimal. Lesen Sie zuerst die Aussagen 46–55. Richtig oder falsch?',
    en: 'You hear a conversation twice. Read statements 46–55 first. True or false?',
  },
  hoeren3: {
    de: 'Sie hören fünf kurze Texte. Sie hören jeden Text zweimal. Ist die Aussage richtig oder falsch?',
    en: 'You hear five short texts, each twice. Is the statement true or false?',
  },
};

/** How often each recording may be played, as in the exam. */
export const MAX_PLAYS: Record<'hoeren1' | 'hoeren2' | 'hoeren3', number> = { hoeren1: 1, hoeren2: 2, hoeren3: 2 };

const pre: CSSProperties = { whiteSpace: 'pre-wrap', margin: 0 };
const inlineSelect: CSSProperties = { width: 'auto', display: 'inline-block', padding: '2px 6px', margin: '0 2px', fontSize: 15, maxWidth: '100%' };

export function MissingContent({ lang }: { lang: Lang }) {
  return (
    <div className="card">
      <p style={{ marginTop: 0 }}>{tr(L.missing, lang)}</p>
      <p className="small muted" style={{ marginBottom: 0 }}>{tr(L.missingNote, lang)}</p>
    </div>
  );
}

const Num = ({ n }: { n: number }) => (
  <span className="badge" style={{ padding: '1px 8px', fontSize: 12, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
    {n}
  </span>
);

function Choice({
  value,
  options,
  onChange,
  lang,
  style,
  label,
}: {
  value: Answer;
  options: { value: number; label: string }[];
  onChange: (v: Answer) => void;
  lang: Lang;
  style?: CSSProperties;
  label: string;
}) {
  return (
    <select
      aria-label={label}
      value={value === null ? '' : String(value)}
      onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
      style={style}
    >
      <option value="">{tr(L.choose, lang)}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Options({ value, options, onChange }: { value: Answer; options: ReactNode[]; onChange: (v: number) => void }) {
  return (
    <div className="options">
      {options.map((o, i) => (
        <button key={i} type="button" className={`option${value === i ? ' selected' : ''}`} aria-pressed={value === i} onClick={() => onChange(i)}>
          <span className="key">{LETTERS[i]}</span>
          <span className="body" lang="de">{o}</span>
        </button>
      ))}
    </div>
  );
}

function RichtigFalsch({ value, onChange, lang }: { value: Answer; onChange: (v: number) => void; lang: Lang }) {
  return (
    <div className="row" style={{ marginTop: 10 }}>
      {[RICHTIG, FALSCH].map((v) => (
        <button
          key={v}
          type="button"
          className={`option${value === v ? ' selected' : ''}`}
          style={{ flex: 1, justifyContent: 'center', padding: '9px 12px' }}
          aria-pressed={value === v}
          onClick={() => onChange(v)}
        >
          {tr(v === RICHTIG ? L.richtig : L.falsch, lang)}
        </button>
      ))}
    </div>
  );
}

/* --------------------------------------------------------------------- Lesen */

type ViewProps<S> = { set: S; answers: readonly Answer[]; onAnswer: (index: number, value: Answer) => void; lang: Lang };

export function Lesen1View({ set, answers, onAnswer, lang }: ViewProps<Lesen1Set>) {
  const options = set.headlines.map((h, i) => ({ value: i, label: `${LETTERS[i]}  ${h}` }));
  return (
    <div className="stack">
      <div className="card">
        <h2 style={{ marginTop: 0 }}>{tr(L.headlines, lang)}</h2>
        <ol type="a" style={{ margin: 0, paddingLeft: 22 }} lang="de">
          {set.headlines.map((h, i) => (
            <li key={i} style={{ marginBottom: 3 }}>{h}</li>
          ))}
        </ol>
      </div>
      {set.texts.map((t, i) => {
        const n = FIRST_NUMBER.lesen1 + i;
        return (
          <div key={i} className="card" id={`q${n}`}>
            <div className="qmeta"><Num n={n} /> {tr(L.text, lang)} {i + 1}</div>
            <p lang="de" style={{ ...pre, margin: '10px 0' }}>{t.text}</p>
            <Choice label={`${n}`} value={answers[i] ?? null} options={options} onChange={(v) => onAnswer(i, v)} lang={lang} />
          </div>
        );
      })}
    </div>
  );
}

export function Lesen2View({ set, answers, onAnswer }: ViewProps<Lesen2Set>) {
  return (
    <div className="stack">
      <div className="card" lang="de">
        <h2 style={{ marginTop: 0 }}>{set.title}</h2>
        {set.text.map((p, i) => (
          <p key={i} style={{ marginBottom: 0 }}>{p}</p>
        ))}
      </div>
      {set.items.map((item, i) => {
        const n = FIRST_NUMBER.lesen2 + i;
        return (
          <div key={i} className="card" id={`q${n}`}>
            <div className="qmeta"><Num n={n} /></div>
            <p className="qtext" lang="de" style={{ fontSize: 17 }}>{item.stem}</p>
            <Options value={answers[i] ?? null} options={item.options} onChange={(v) => onAnswer(i, v)} />
          </div>
        );
      })}
    </div>
  );
}

export function Lesen3View({ set, answers, onAnswer, lang }: ViewProps<Lesen3Set>) {
  const options = [
    ...set.ads.map((a, i) => ({ value: i, label: `${LETTERS[i]}${a.title ? `  ${a.title}` : ''}` })),
    { value: lesen3X(set), label: tr(L.noAd, lang) },
  ];
  return (
    <div className="stack">
      {set.situations.map((s, i) => {
        const n = FIRST_NUMBER.lesen3 + i;
        return (
          <div key={i} className="card" id={`q${n}`} style={{ padding: 14 }}>
            <div className="row" style={{ alignItems: 'flex-start' }}>
              <Num n={n} />
              <span lang="de" style={{ flex: 1 }}>{s.text}</span>
            </div>
            <div style={{ marginTop: 8 }}>
              <Choice label={`${n}`} value={answers[i] ?? null} options={options} onChange={(v) => onAnswer(i, v)} lang={lang} />
            </div>
          </div>
        );
      })}
      <h2>{tr(L.ads, lang)}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        {set.ads.map((a, i) => (
          <div key={i} className="card" style={{ padding: 14 }} lang="de">
            <strong>{LETTERS[i]}</strong> {a.title && <strong>{a.title}</strong>}
            <p style={{ ...pre, marginTop: 6, fontSize: 14 }}>{a.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- Sprachbausteine */

export function Sb1View({ set, answers, onAnswer, lang }: ViewProps<Sb1Set>) {
  return (
    <div className="card" lang="de" style={{ lineHeight: 2.1 }}>
      <p style={pre}>
        {splitGaps(set.text).map((piece, k) => {
          if (typeof piece === 'string') return <span key={k}>{piece}</span>;
          const i = piece - 1;
          const gap = set.gaps[i];
          if (!gap) return <span key={k}>[{piece}]</span>;
          const n = FIRST_NUMBER.sb1 + i;
          return (
            <span key={k} id={`q${n}`}>
              <sup className="muted small">{n}</sup>
              <Choice
                label={`${tr(L.gap, lang)} ${n}`}
                value={answers[i] ?? null}
                options={gap.options.map((o, j) => ({ value: j, label: `${LETTERS[j]}  ${o}` }))}
                onChange={(v) => onAnswer(i, v)}
                lang={lang}
                style={inlineSelect}
              />
            </span>
          );
        })}
      </p>
    </div>
  );
}

export function Sb2View({ set, answers, onAnswer, lang }: ViewProps<Sb2Set>) {
  const used = new Set(answers.filter((a): a is number => a !== null && a !== undefined));
  const options = set.words.map((w, j) => ({ value: j, label: `${LETTERS[j]}  ${w}` }));
  return (
    <div className="stack">
      <div className="card">
        <h2 style={{ marginTop: 0 }}>{tr(L.words, lang)}</h2>
        <div className="chips" lang="de">
          {set.words.map((w, j) => (
            <span key={j} className="chip" style={{ cursor: 'default', opacity: used.has(j) ? 0.4 : 1 }}>
              {LETTERS[j]} {w}
            </span>
          ))}
        </div>
      </div>
      <div className="card" lang="de" style={{ lineHeight: 2.1 }}>
        <p style={pre}>
          {splitGaps(set.text).map((piece, k) => {
            if (typeof piece === 'string') return <span key={k}>{piece}</span>;
            const i = piece - 1;
            if (!set.gaps[i]) return <span key={k}>[{piece}]</span>;
            const n = FIRST_NUMBER.sb2 + i;
            return (
              <span key={k} id={`q${n}`}>
                <sup className="muted small">{n}</sup>
                <Choice
                  label={`${tr(L.gap, lang)} ${n}`}
                  value={answers[i] ?? null}
                  options={options}
                  onChange={(v) => onAnswer(i, v)}
                  lang={lang}
                  style={inlineSelect}
                />
              </span>
            );
          })}
        </p>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------- Hören */

function PlayButton({
  lines,
  max,
  used,
  onUse,
  lang,
}: {
  lines: Line[];
  max: number;
  used: number;
  onUse: () => void;
  lang: Lang;
}) {
  const [playing, setPlaying] = useState(false);
  const [reveal, setReveal] = useState(false);
  const left = Math.max(0, max - used);
  const tts = ttsAvailable();

  const play = () => {
    if (left <= 0 || playing) return;
    onUse();
    setPlaying(true);
    speakLines(lines)
      .catch((err) => logError(err, 'modelltest.tts'))
      .finally(() => setPlaying(false));
  };

  if (!tts) {
    return (
      <div className="small">
        <p className="muted" style={{ margin: '4px 0' }}>{tr(L.noTts, lang)}</p>
        {reveal ? (
          <div className="verdict" lang="de" style={{ marginTop: 6 }}>
            {lines.map((l, i) => (
              <p key={i} style={{ margin: '0 0 4px' }}>{l.text}</p>
            ))}
          </div>
        ) : (
          <button type="button" className="btn small" onClick={() => setReveal(true)}>
            {tr(L.showText, lang)}
          </button>
        )}
      </div>
    );
  }
  return (
    <button type="button" className="btn small" disabled={left <= 0 || playing} onClick={play}>
      {playing ? `🔊 ${tr(L.playing, lang)}` : left > 0 ? `▶ ${tr(L.play, lang)} (${tr(L.left, lang)} ${left}×)` : `✓ ${tr(L.used, lang)}`}
    </button>
  );
}

type HoerenProps<S> = ViewProps<S> & { plays: Record<string, number>; onPlay: (key: string) => void };

/** Stops speech when the listening screen goes away. */
function useStopOnUnmount() {
  useEffect(() => () => stop(), []);
}

function ShortTexts({
  part,
  set,
  answers,
  onAnswer,
  lang,
  plays,
  onPlay,
}: HoerenProps<Hoeren1Set | Hoeren3Set> & { part: 'hoeren1' | 'hoeren3' }) {
  useStopOnUnmount();
  return (
    <div className="stack">
      {set.items.map((it, i) => {
        const n = FIRST_NUMBER[part] + i;
        const key = `${part}:${i}`;
        return (
          <div key={i} className="card" id={`q${n}`}>
            <div className="row">
              <Num n={n} />
              <span className="spacer" />
              <PlayButton lines={it.script} max={MAX_PLAYS[part]} used={plays[key] ?? 0} onUse={() => onPlay(key)} lang={lang} />
            </div>
            <p className="qtext" lang="de" style={{ fontSize: 17 }}>{it.item.statement}</p>
            <RichtigFalsch value={answers[i] ?? null} onChange={(v) => onAnswer(i, v)} lang={lang} />
          </div>
        );
      })}
    </div>
  );
}

export const Hoeren1View = (p: HoerenProps<Hoeren1Set>) => <ShortTexts part="hoeren1" {...p} />;
export const Hoeren3View = (p: HoerenProps<Hoeren3Set>) => <ShortTexts part="hoeren3" {...p} />;

export function Hoeren2View({ set, answers, onAnswer, lang, plays, onPlay }: HoerenProps<Hoeren2Set>) {
  useStopOnUnmount();
  return (
    <div className="stack">
      <div className="card">
        <div className="row">
          <strong lang="de">{set.title || tr(L.conversation, lang)}</strong>
          <span className="spacer" />
          <PlayButton lines={set.script} max={MAX_PLAYS.hoeren2} used={plays.hoeren2 ?? 0} onUse={() => onPlay('hoeren2')} lang={lang} />
        </div>
      </div>
      {set.items.map((item, i) => {
        const n = FIRST_NUMBER.hoeren2 + i;
        return (
          <div key={i} className="card" id={`q${n}`} style={{ padding: 14 }}>
            <div className="row" style={{ alignItems: 'flex-start' }}>
              <Num n={n} />
              <span lang="de" style={{ flex: 1, fontWeight: 550 }}>{item.statement}</span>
            </div>
            <RichtigFalsch value={answers[i] ?? null} onChange={(v) => onAnswer(i, v)} lang={lang} />
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------- review */

export interface ReviewRow {
  num: number;
  prompt: string;
  given: string;
  correct: string;
  ok: boolean;
  explanation?: Text2;
}

const short = (s: string, n = 90) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

/** One row per item: what was asked, what was picked, what was right, why. */
export function reviewRows<P extends ObjPart>(part: P, set: ObjSetByPart[P], answers: readonly Answer[], lang: Lang): ReviewRow[] {
  const key = answerKey(part, set);
  const marks = markPart(part, set, answers);
  const none = lang === 'de' ? '(keine Antwort)' : '(no answer)';
  const rf = (v: number) => tr(v === RICHTIG ? L.richtig : L.falsch, lang);
  const label = (i: number, v: Answer): string => {
    if (v === null || v === undefined) return none;
    switch (part) {
      case 'lesen1':
        return `${LETTERS[v]}) ${(set as Lesen1Set).headlines[v] ?? ''}`;
      case 'lesen2':
        return `${LETTERS[v]}) ${(set as Lesen2Set).items[i]?.options[v] ?? ''}`;
      case 'lesen3': {
        const s = set as Lesen3Set;
        return v === lesen3X(s) ? 'x' : `${LETTERS[v]}${s.ads[v]?.title ? `) ${s.ads[v].title}` : ''}`;
      }
      case 'sb1':
        return `${LETTERS[v]}) ${(set as Sb1Set).gaps[i]?.options[v] ?? ''}`;
      case 'sb2':
        return `${LETTERS[v]}) ${(set as Sb2Set).words[v] ?? ''}`;
      default:
        return rf(v);
    }
  };
  return key.map((k, i) => {
    let prompt = '';
    let explanation: Text2 | undefined;
    switch (part) {
      case 'lesen1': {
        const t = (set as Lesen1Set).texts[i];
        prompt = `${tr(L.text, lang)} ${i + 1}: ${short(t.text)}`;
        explanation = t.explanation;
        break;
      }
      case 'lesen2': {
        const it = (set as Lesen2Set).items[i];
        prompt = it.stem;
        explanation = it.explanation;
        break;
      }
      case 'lesen3': {
        const s = (set as Lesen3Set).situations[i];
        prompt = s.text;
        explanation = s.explanation;
        break;
      }
      case 'sb1': {
        const g = (set as Sb1Set).gaps[i];
        prompt = `${tr(L.gap, lang)} ${FIRST_NUMBER.sb1 + i} · ${g.point}`;
        explanation = g.explanation;
        break;
      }
      case 'sb2':
        prompt = `${tr(L.gap, lang)} ${FIRST_NUMBER.sb2 + i}`;
        explanation = (set as Sb2Set).gaps[i].explanation;
        break;
      case 'hoeren2': {
        const it = (set as Hoeren2Set).items[i];
        prompt = it.statement;
        explanation = it.explanation;
        break;
      }
      default: {
        const it = (set as Hoeren1Set | Hoeren3Set).items[i].item;
        prompt = it.statement;
        explanation = it.explanation;
      }
    }
    return { num: FIRST_NUMBER[part] + i, prompt, given: label(i, answers[i] ?? null), correct: label(i, k), ok: marks[i], explanation };
  });
}
