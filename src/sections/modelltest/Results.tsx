// Results of a finished mock: points per part, pass/fail per block, the
// weakest part, and a per-item review with explanations.
import type { CSSProperties } from 'react';
import type { ExamPart, Lang } from '../../types.ts';
import { tr } from '../../lib/i18n.ts';
import { CRITERIA, GRADE_LETTERS, WRITING_MAX } from '../schreiben/criteria.ts';
import { findSet, type MockContent } from './assemble.ts';
import { reviewRows } from './parts.tsx';
import {
  GRADE_TEXT, OBJ_PARTS, ORAL_PARTS, PART_LABEL, PART_SECTION, PASS_SHARE, WRITTEN_PARTS, scoreMock, weakestPart,
} from './score.ts';
import { blockOf, partScoresOf, type MockState } from './state.ts';
import { SPEAKING_CRITERIA } from './Speaking.tsx';

const L = {
  title: { de: 'Ergebnis Modelltest', en: 'Mock exam result' },
  written: { de: 'Schriftliche Prüfung', en: 'Written exam' },
  oral: { de: 'Mündliche Prüfung', en: 'Oral exam' },
  total: { de: 'Gesamt', en: 'Total' },
  passed: { de: 'bestanden', en: 'passed' },
  failed: { de: 'nicht bestanden', en: 'not passed' },
  oralOpen: { de: 'mündlich noch offen', en: 'oral still open' },
  oralOpenNote: {
    de: 'Sie haben den mündlichen Teil übersprungen. Für das Zertifikat brauchen Sie auch dort 60 % (45 von 75 Punkten).',
    en: 'You skipped the oral part. For the certificate you need 60 % there too (45 of 75 points).',
  },
  grade: { de: 'Note', en: 'Grade' },
  verdictPass: { de: 'Sie hätten bestanden.', en: 'You would have passed.' },
  verdictFail: { de: 'Sie hätten noch nicht bestanden.', en: 'You would not have passed yet.' },
  verdictWrittenOk: { de: 'Der schriftliche Teil reicht zum Bestehen.', en: 'The written part is enough to pass.' },
  incomplete: {
    de: 'Für einige Teile fehlten Inhalte. Die Bewertung bezieht sich auf die vorhandenen Teile.',
    en: 'Some parts had no content. The verdict is based on the parts that were available.',
  },
  timedOut: { de: 'Zeit abgelaufen bei:', en: 'Time ran out in:' },
  perPart: { de: 'Punkte pro Teil', en: 'Points per part' },
  weakest: { de: 'Ihr schwächster Teil', en: 'Your weakest part' },
  practise: { de: 'Jetzt üben', en: 'Practise now' },
  review: { de: 'Aufgaben im Einzelnen', en: 'Item by item' },
  yourAnswer: { de: 'Ihre Antwort', en: 'Your answer' },
  right: { de: 'Richtig', en: 'Correct' },
  correctCount: { de: 'richtig', en: 'correct' },
  notAvailable: { de: 'Dieser Teil ist nicht mehr in den Inhalten.', en: 'This part is no longer in the content.' },
  writing: { de: 'Ihr Text und die Musterlösung', en: 'Your text and the model answer' },
  yourText: { de: 'Ihr Text', en: 'Your text' },
  model: { de: 'Musterlösung', en: 'Model answer' },
  speaking: { de: 'Ihre Selbsteinschätzung im Sprechen', en: 'Your speaking self-assessment' },
  again: { de: 'Neuer Modelltest', en: 'New mock exam' },
  home: { de: 'Zur Startseite', en: 'Home' },
  none: { de: 'Noch kein Modelltest abgeschlossen.', en: 'No mock exam finished yet.' },
};

const fmt = (n: number) => (Math.round(n * 2) / 2).toLocaleString('de-DE');
const pre: CSSProperties = { whiteSpace: 'pre-wrap', margin: 0, fontSize: 14 };

export function Results({
  mock,
  content,
  lang,
  go,
}: {
  mock: MockState;
  content: MockContent;
  lang: Lang;
  go: (route: string) => void;
}) {
  const parts = partScoresOf(mock);
  const score = scoreMock(parts);
  const weakest = weakestPart(parts);
  const writingTask = content.schreiben.find((t) => t.id === mock.plan.schreiben);
  const order: ExamPart[] = [...WRITTEN_PARTS, ...ORAL_PARTS];
  const shown = order.map((p) => parts.find((x) => x.part === p)).filter((x): x is NonNullable<typeof x> => Boolean(x));

  const verdict =
    score.passed === true ? L.verdictPass : score.passed === false ? L.verdictFail : score.writtenPassed ? L.verdictWrittenOk : L.verdictFail;

  return (
    <div className="stack">
      <h1 style={{ marginBottom: 0 }}>{tr(L.title, lang)}</h1>
      {mock.finishedAt && (
        <p className="small muted" style={{ margin: 0 }}>
          {new Date(mock.finishedAt).toLocaleString(lang === 'de' ? 'de-DE' : 'en-GB')}
        </p>
      )}

      <div className="card">
        <div className="statgrid">
          <div className="stat">
            <div className="n">{fmt(score.written)} <span className="muted small">/ {score.writtenMax}</span></div>
            <div className="l">{tr(L.written, lang)}</div>
            <span className={`badge ${score.writtenPassed ? 'good' : 'bad'}`} style={{ marginTop: 6 }}>
              {tr(score.writtenPassed ? L.passed : L.failed, lang)}
            </span>
          </div>
          <div className="stat">
            <div className="n">
              {score.oral === null ? '–' : fmt(score.oral)} <span className="muted small">/ {score.oralMax}</span>
            </div>
            <div className="l">{tr(L.oral, lang)}</div>
            {score.oralPassed === null ? (
              <span className="badge" style={{ marginTop: 6, border: '1px solid var(--border)' }}>{tr(L.oralOpen, lang)}</span>
            ) : (
              <span className={`badge ${score.oralPassed ? 'good' : 'bad'}`} style={{ marginTop: 6 }}>
                {tr(score.oralPassed ? L.passed : L.failed, lang)}
              </span>
            )}
          </div>
          {score.total !== null && (
            <div className="stat">
              <div className="n">{fmt(score.total)} <span className="muted small">/ 300</span></div>
              <div className="l">{tr(L.total, lang)}</div>
              {score.grade && (
                <span className={`badge ${score.passed ? 'good' : 'bad'}`} style={{ marginTop: 6 }}>
                  {tr(L.grade, lang)}: {tr(GRADE_TEXT[score.grade], lang)}
                </span>
              )}
            </div>
          )}
        </div>
        <div className={`verdict ${score.passed === true ? 'good' : score.passed === false ? 'bad' : ''}`}>
          <div className="head">{tr(verdict, lang)}</div>
          {score.oral === null && <div className="body">{tr(L.oralOpenNote, lang)}</div>}
          {!score.complete && <div className="body">{tr(L.incomplete, lang)}</div>}
          {mock.timedOut.length > 0 && (
            <div className="body">
              {tr(L.timedOut, lang)} {mock.timedOut.map((b) => tr(blockOf(b).title, lang)).join(', ')}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>{tr(L.perPart, lang)}</h2>
        <div className="stack" style={{ gap: 10 }}>
          {shown.map((p) => {
            const pct = p.max > 0 ? (p.points / p.max) * 100 : 0;
            return (
              <div key={p.part}>
                <div className="row small">
                  <span>{tr(PART_LABEL[p.part], lang)}</span>
                  <span className="spacer" />
                  <strong className={pct >= PASS_SHARE * 100 ? 'good' : 'bad'}>
                    {fmt(p.points)} / {p.max}
                  </strong>
                </div>
                <div className={`bar${pct >= PASS_SHARE * 100 ? ' good' : ''}`} style={{ marginTop: 4 }}>
                  <span style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        {weakest && (
          <div className="row wrap" style={{ marginTop: 16 }}>
            <span>
              {tr(L.weakest, lang)}: <strong>{tr(PART_LABEL[weakest.part], lang)}</strong> ({fmt(weakest.points)} / {weakest.max})
            </span>
            <span className="spacer" />
            <button type="button" className="btn small primary" onClick={() => go(PART_SECTION[weakest.part])}>
              {tr(L.practise, lang)} →
            </button>
          </div>
        )}
      </div>

      <h2 style={{ marginBottom: 0 }}>{tr(L.review, lang)}</h2>
      <div className="qlist" style={{ marginTop: 0 }}>
        {OBJ_PARTS.map((part) => {
          const stored = mock.scores[part];
          if (!stored) return null;
          const set = findSet(content, part, mock.plan[part]);
          return (
            <details key={part}>
              <summary>
                {tr(PART_LABEL[part], lang)} · {stored.correct}/{stored.total} {tr(L.correctCount, lang)} · {fmt(stored.points)} P.
              </summary>
              {!set ? (
                <p className="small muted">{tr(L.notAvailable, lang)}</p>
              ) : (
                <div className="stack" style={{ gap: 8, marginTop: 10 }}>
                  {reviewRows(part, set, mock.answers[part] ?? [], lang).map((row) => (
                    <div key={row.num} className={`verdict ${row.ok ? 'good' : 'bad'}`} style={{ marginTop: 0 }}>
                      <div className="head small">
                        {row.ok ? '✓' : '✗'} {row.num}. <span lang="de" style={{ fontWeight: 500 }}>{row.prompt}</span>
                      </div>
                      <div className="body">
                        {!row.ok && (
                          <div>
                            <span className="muted">{tr(L.yourAnswer, lang)}:</span> <span lang="de">{row.given}</span>
                          </div>
                        )}
                        <div>
                          <span className="muted">{tr(L.right, lang)}:</span> <strong lang="de">{row.correct}</strong>
                        </div>
                        {row.explanation && <div style={{ marginTop: 4 }}>{tr(row.explanation, lang)}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </details>
          );
        })}

        {writingTask && mock.scores.schreiben && (
          <details>
            <summary>
              {tr(PART_LABEL.schreiben, lang)} · {mock.writing.grades.map((g) => (g === null ? '–' : GRADE_LETTERS[g])).join(' ')} ·{' '}
              {fmt(mock.scores.schreiben.points)}/{WRITING_MAX} P.
            </summary>
            <p className="small muted">
              {CRITERIA.map((c, i) => `${tr(c.title, lang)}: ${mock.writing.grades[i] === null ? '–' : GRADE_LETTERS[mock.writing.grades[i]!]}`).join(' · ')}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
              <div>
                <strong className="small">{tr(L.yourText, lang)}</strong>
                <p lang="de" style={pre}>{mock.writing.text || '–'}</p>
              </div>
              <div>
                <strong className="small">{tr(L.model, lang)}</strong>
                <p lang="de" style={pre}>{writingTask.model}</p>
              </div>
            </div>
          </details>
        )}

        {!mock.speaking.skipped && mock.scores.sprechen1 && (
          <details>
            <summary>{tr(L.speaking, lang)}</summary>
            <table className="history" style={{ marginTop: 8 }}>
              <tbody>
                {mock.speaking.grades.map((row, i) => (
                  <tr key={i}>
                    <td>{tr(PART_LABEL[ORAL_PARTS[i]], lang)}</td>
                    <td className="small">
                      {SPEAKING_CRITERIA.map((c, ci) => `${tr(c.title, lang)} ${row[ci] === null ? '–' : GRADE_LETTERS[row[ci]!]}`).join(' · ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        )}
      </div>

      <div className="row" style={{ marginTop: 8 }}>
        <button type="button" className="btn primary" style={{ flex: 1 }} onClick={() => go('modelltest')}>
          {tr(L.again, lang)}
        </button>
        <button type="button" className="btn" onClick={() => go('home')}>
          {tr(L.home, lang)}
        </button>
      </div>
    </div>
  );
}

export function NoResult({ lang, go }: { lang: Lang; go: (route: string) => void }) {
  return (
    <div className="card" style={{ marginTop: 24 }}>
      <p>{tr(L.none, lang)}</p>
      <button type="button" className="btn" onClick={() => go('modelltest')}>
        ← {tr(L.again, lang)}
      </button>
    </div>
  );
}
