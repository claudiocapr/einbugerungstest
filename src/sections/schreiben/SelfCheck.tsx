// The self-check after writing, shared with the Modelltest: automatic hints,
// own text next to the model answer, and a guided A–D grade per telc criterion.
import type { CSSProperties } from 'react';
import type { Lang } from '../../types.ts';
import type { WritingTask } from '../../content/types.ts';
import { tr } from '../../lib/i18n.ts';
import { writingHints } from './hints.ts';
import { CRITERIA, GRADE_LETTERS, WRITING_GRADE_POINTS, WRITING_MAX, suggestGrade, writingPoints, type Grade } from './criteria.ts';

const L = {
  hints: { de: 'Automatische Hinweise', en: 'Automatic hints' },
  hintsNote: {
    de: 'Einfache Regeln, keine Korrektur: Ihr Text bleibt auf diesem Gerät.',
    en: 'Simple rules, not a correction: your text stays on this device.',
  },
  yours: { de: 'Ihr Text', en: 'Your text' },
  model: { de: 'Musterlösung', en: 'Model answer' },
  empty: { de: '(leer)', en: '(empty)' },
  assess: { de: 'Selbst bewerten', en: 'Assess yourself' },
  assessNote: {
    de: 'Beantworten Sie die Fragen ehrlich und wählen Sie dann A–D. Der Vorschlag richtet sich nach Ihren Haken.',
    en: 'Answer the questions honestly, then choose A–D. The suggestion follows your ticks.',
  },
  covered: { de: 'Leitpunkte abgehakt', en: 'Points ticked' },
  suggestion: { de: 'Vorschlag', en: 'Suggestion' },
  points: { de: 'Punkte', en: 'points' },
  total: { de: 'Ihre Selbsteinschätzung', en: 'Your self-assessment' },
  pass: { de: '60 % wären 27 Punkte.', en: '60 % would be 27 points.' },
};

const preStyle: CSSProperties = { whiteSpace: 'pre-wrap', margin: 0, fontSize: 15 };

export function SelfCheck({
  task,
  lang,
  text,
  pointsCovered,
  checks,
  grades,
  onChecks,
  onGrades,
  disabled = false,
}: {
  task: WritingTask;
  lang: Lang;
  text: string;
  pointsCovered: number;
  checks: readonly string[];
  grades: readonly (Grade | null)[];
  onChecks: (next: string[]) => void;
  onGrades: (next: (Grade | null)[]) => void;
  disabled?: boolean;
}) {
  const hints = writingHints(text, task.register);
  const toggle = (id: string) => onChecks(checks.includes(id) ? checks.filter((c) => c !== id) : [...checks, id]);
  const setGrade = (i: number, g: Grade) => {
    const next = [0, 1, 2].map((k) => grades[k] ?? null);
    next[i] = g;
    onGrades(next);
  };
  const allGraded = [0, 1, 2].every((i) => grades[i] !== null && grades[i] !== undefined);
  const points = writingPoints(grades);

  return (
    <div className="stack">
      <div className="card">
        <h2 style={{ marginTop: 0 }}>{tr(L.hints, lang)}</h2>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {hints.map((h) => (
            <li key={h.id} className={h.ok ? 'good' : 'bad'} style={{ marginBottom: 4 }}>
              <span style={{ color: 'var(--text)' }}>{tr(h.text, lang)}</span>
            </li>
          ))}
        </ul>
        <p className="small muted" style={{ marginBottom: 0 }}>{tr(L.hintsNote, lang)}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>{tr(L.yours, lang)}</h2>
          <p lang="de" style={preStyle}>
            {text.trim() || tr(L.empty, lang)}
          </p>
        </div>
        <div className="card" style={{ borderColor: 'var(--good)' }}>
          <h2 style={{ marginTop: 0 }}>{tr(L.model, lang)}</h2>
          <p lang="de" style={preStyle}>
            {task.model}
          </p>
        </div>
      </div>

      <h2 style={{ marginBottom: 0 }}>{tr(L.assess, lang)}</h2>
      <p className="small muted" style={{ marginTop: 0 }}>{tr(L.assessNote, lang)}</p>

      {CRITERIA.map((c, ci) => {
        const suggested = suggestGrade(c, checks, pointsCovered);
        return (
          <div key={c.id} className="card">
            <h2 style={{ marginTop: 0 }}>{tr(c.title, lang)}</h2>
            {c.id === 'I' && (
              <p className="small muted" style={{ marginTop: 0 }}>
                {tr(L.covered, lang)}: {pointsCovered} / 4
              </p>
            )}
            <div className="stack" style={{ gap: 8 }}>
              {c.checks.map((check) => (
                <label key={check.id} className="row" style={{ alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={checks.includes(check.id)}
                    disabled={disabled}
                    onChange={() => toggle(check.id)}
                    style={{ width: 20, height: 20, marginTop: 2, flex: 'none', accentColor: 'var(--good)' }}
                  />
                  <span>{tr(check.text, lang)}</span>
                </label>
              ))}
            </div>
            <p className="small" style={{ marginBottom: 6 }}>
              {tr(L.suggestion, lang)}: <strong>{GRADE_LETTERS[suggested]}</strong>
            </p>
            <div className="options" style={{ marginTop: 6 }}>
              {c.levels.map((level, g) => (
                <button
                  key={g}
                  type="button"
                  disabled={disabled}
                  className={`option${grades[ci] === g ? ' selected' : ''}`}
                  aria-pressed={grades[ci] === g}
                  onClick={() => setGrade(ci, g as Grade)}
                >
                  <span className="key">{GRADE_LETTERS[g]}</span>
                  <span className="body">
                    {tr(level, lang)}{' '}
                    <span className="small muted">
                      ({WRITING_GRADE_POINTS[g]} {tr(L.points, lang)})
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        );
      })}

      <div className="card center">
        <div className="small muted">{tr(L.total, lang)}</div>
        <div className="score">
          {allGraded ? points : '–'} <span className="muted" style={{ fontSize: 22 }}>/ {WRITING_MAX}</span>
        </div>
        <div className="small muted">{tr(L.pass, lang)}</div>
      </div>
    </div>
  );
}
