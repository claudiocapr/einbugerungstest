// The writing screen's parts, shared with the Modelltest: the incoming e-mail,
// the Leitpunkte checklist, the textarea with a live word count, and the
// Redemittel drawer that inserts a phrase at the cursor.
import { useRef, useState, type CSSProperties } from 'react';
import type { Lang } from '../../types.ts';
import type { WritingTask } from '../../content/types.ts';
import { writingPhrases } from '../../content/schreiben.ts';
import { topicLabel } from '../../content/topics.ts';
import { tr } from '../../lib/i18n.ts';
import { MAX_TEXT_LENGTH, WORD_TARGET, countWords } from './hints.ts';

const L = {
  received: { de: 'Sie haben diese E-Mail bekommen:', en: 'You received this e-mail:' },
  from: { de: 'Von', en: 'From' },
  subject: { de: 'Betreff', en: 'Subject' },
  informal: { de: 'informell (du)', en: 'informal (du)' },
  semiformal: { de: 'halbformell (Sie)', en: 'semi-formal (Sie)' },
  task: {
    de: 'Antworten Sie auf die E-Mail und schreiben Sie etwas zu allen vier Punkten. Denken Sie an Anrede, Einleitung, Schluss und Gruß.',
    en: 'Reply to the e-mail and write something about all four points. Remember greeting, opening, closing and sign-off.',
  },
  tickHint: { de: 'Haken Sie ab, was Sie schon geschrieben haben.', en: 'Tick off what you have already covered.' },
  yourText: { de: 'Ihre Antwort', en: 'Your reply' },
  placeholder: { de: 'Liebe …, / Sehr geehrte …,', en: 'Liebe …, / Sehr geehrte …,' },
  words: { de: 'Wörter', en: 'words' },
  target: { de: 'Ziel', en: 'target' },
  phrases: { de: 'Redemittel', en: 'Useful phrases' },
  close: { de: 'Schließen', en: 'Close' },
  insertHint: { de: 'Antippen fügt die Wendung an der Cursorposition ein.', en: 'Tap to insert the phrase at the cursor.' },
};

export const textareaStyle: CSSProperties = {
  font: 'inherit',
  fontSize: 16,
  lineHeight: 1.55,
  width: '100%',
  minHeight: 300,
  resize: 'vertical',
  color: 'var(--text)',
  background: 'var(--surface-2)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  padding: '12px 13px',
};

const preStyle: CSSProperties = { whiteSpace: 'pre-wrap', margin: 0 };

export function IncomingMail({ task, lang }: { task: WritingTask; lang: Lang }) {
  return (
    <div className="card">
      <div className="qmeta">
        <span>{tr(L.received, lang)}</span>
        <span className="spacer" />
        <span className="chip" style={{ cursor: 'default' }}>
          {tr(task.register === 'informal' ? L.informal : L.semiformal, lang)}
        </span>
      </div>
      <div className="small" style={{ marginTop: 10 }}>
        <div>
          <span className="muted">{tr(L.from, lang)}:</span> {task.incoming.from}
        </div>
        <div>
          <span className="muted">{tr(L.subject, lang)}:</span> <strong>{task.incoming.subject}</strong>
        </div>
      </div>
      <hr style={{ border: 0, borderTop: '1px solid var(--border)', margin: '12px 0' }} />
      <p lang="de" style={preStyle}>
        {task.incoming.body}
      </p>
      <p className="small muted" style={{ marginBottom: 0 }}>
        {topicLabel(task.topic, lang)}
      </p>
    </div>
  );
}

export function Leitpunkte({
  task,
  lang,
  ticked,
  onToggle,
}: {
  task: WritingTask;
  lang: Lang;
  ticked: readonly boolean[];
  onToggle?: (index: number) => void;
}) {
  return (
    <div className="card">
      <p style={{ marginTop: 0 }}>{tr(L.task, lang)}</p>
      <div className="stack" style={{ gap: 8 }}>
        {task.points.map((point, i) => (
          <label key={i} className="row" style={{ alignItems: 'flex-start', gap: 10, cursor: onToggle ? 'pointer' : 'default' }}>
            <input
              type="checkbox"
              checked={Boolean(ticked[i])}
              disabled={!onToggle}
              onChange={() => onToggle?.(i)}
              style={{ width: 20, height: 20, marginTop: 2, flex: 'none', accentColor: 'var(--good)' }}
            />
            <span lang="de" style={{ textDecoration: ticked[i] ? 'line-through' : undefined, opacity: ticked[i] ? 0.7 : 1 }}>
              {point}
            </span>
          </label>
        ))}
      </div>
      {onToggle && <p className="small muted" style={{ marginBottom: 0 }}>{tr(L.tickHint, lang)}</p>}
    </div>
  );
}

export function WordCount({ text, lang }: { text: string; lang: Lang }) {
  const n = countWords(text);
  const ok = n >= WORD_TARGET.min && n <= WORD_TARGET.max + 30;
  return (
    <span className={`small ${n === 0 ? 'muted' : ok ? 'good' : 'bad'}`} aria-live="polite">
      {n} {tr(L.words, lang)} · {tr(L.target, lang)} {WORD_TARGET.min}–{WORD_TARGET.max}
    </span>
  );
}

/** Inserts `phrase` into `text` at [start, end), adding a space where words would touch. */
export function insertAt(text: string, start: number, end: number, phrase: string): { text: string; cursor: number } {
  const before = text.slice(0, start);
  const after = text.slice(end);
  const lead = before && !/\s$/u.test(before) ? ' ' : '';
  const trail = after && !/^[\s.,!?]/u.test(after) ? ' ' : '';
  const inserted = lead + phrase + trail;
  return { text: before + inserted + after, cursor: before.length + lead.length + phrase.length };
}

export function Editor({
  task,
  lang,
  text,
  onText,
}: {
  task: WritingTask;
  lang: Lang;
  text: string;
  onText: (text: string) => void;
}) {
  const area = useRef<HTMLTextAreaElement>(null);
  const [drawer, setDrawer] = useState(false);
  const preferred = task.register === 'informal' ? 'anrede-informell' : 'anrede-halbformell';
  const [group, setGroup] = useState(preferred);
  const current = writingPhrases.find((g) => g.id === group) ?? writingPhrases[0];

  const insert = (phrase: string) => {
    const el = area.current;
    const start = el ? el.selectionStart : text.length;
    const end = el ? el.selectionEnd : text.length;
    const next = insertAt(text, start, end, phrase);
    if (next.text.length > MAX_TEXT_LENGTH) return;
    onText(next.text);
    requestAnimationFrame(() => {
      try {
        area.current?.setSelectionRange(next.cursor, next.cursor);
      } catch {
        /* some browsers refuse selection changes on hidden fields */
      }
    });
  };

  // Groups that belong to the other register go last.
  const other = task.register === 'informal' ? 'halbformell' : 'informell';
  const groups = [...writingPhrases].sort((a, b) => Number(a.id.endsWith(other)) - Number(b.id.endsWith(other)));

  return (
    <div className="card">
      <div className="row" style={{ marginBottom: 8 }}>
        <label htmlFor={`text-${task.id}`} style={{ fontWeight: 600 }}>
          {tr(L.yourText, lang)}
        </label>
        <span className="spacer" />
        <WordCount text={text} lang={lang} />
      </div>
      <textarea
        id={`text-${task.id}`}
        ref={area}
        lang="de"
        spellCheck={false}
        autoCapitalize="sentences"
        value={text}
        maxLength={MAX_TEXT_LENGTH}
        placeholder={tr(L.placeholder, lang)}
        onChange={(e) => onText(e.target.value)}
        style={textareaStyle}
      />
      <div className="row" style={{ marginTop: 10 }}>
        <button type="button" className="btn small" onClick={() => setDrawer((d) => !d)} aria-expanded={drawer}>
          💬 {tr(L.phrases, lang)}
        </button>
      </div>

      {drawer && (
        <div
          role="dialog"
          aria-label={tr(L.phrases, lang)}
          style={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 40,
            maxHeight: '52vh',
            overflowY: 'auto',
            background: 'var(--surface)',
            borderTop: '1px solid var(--border)',
            boxShadow: '0 -8px 24px rgb(0 0 0 / 0.25)',
          }}
        >
          <div style={{ maxWidth: 760, margin: '0 auto', padding: '12px 16px 18px' }}>
            <div className="row" style={{ marginBottom: 10 }}>
              <strong>{tr(L.phrases, lang)}</strong>
              <span className="spacer" />
              <button type="button" className="btn small ghost" onClick={() => setDrawer(false)}>
                ✕ {tr(L.close, lang)}
              </button>
            </div>
            <div className="chips" style={{ marginBottom: 12 }}>
              {groups.map((g) => (
                <button key={g.id} type="button" className="chip" aria-pressed={g.id === group} onClick={() => setGroup(g.id)}>
                  {tr(g.label, lang)}
                </button>
              ))}
            </div>
            <div className="stack" style={{ gap: 7 }}>
              {current.phrases.map((p) => (
                <button
                  key={p.de}
                  type="button"
                  className="option"
                  style={{ padding: '9px 12px' }}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => insert(p.de)}
                >
                  <span className="body">
                    <span lang="de" style={{ fontWeight: 600 }}>
                      {p.de}
                    </span>
                    <span className="small muted" style={{ display: 'block' }}>
                      {p.en}
                    </span>
                  </span>
                </button>
              ))}
            </div>
            <p className="small muted" style={{ marginBottom: 0 }}>{tr(L.insertHint, lang)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
