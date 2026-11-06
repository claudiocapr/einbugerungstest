// The Modelltest start page: exam structure, pass prediction from earlier
// results, and start / resume / abandon.
import type { DrillResult, ExamPart, Lang } from '../../types.ts';
import { tr } from '../../lib/i18n.ts';
import { PART_LABEL, PART_SECTION, PASS_SHARE, predictPass, type Prediction, type PredictionLabel } from './score.ts';
import type { MockState, Phase } from './state.ts';

const L = {
  title: { de: 'Modelltest', en: 'Mock exam' },
  intro: {
    de: 'Die ganze schriftliche Prüfung mit den echten Zeiten, danach eine optionale Selbsteinschätzung für die mündliche Prüfung. Am Ende sehen Sie Ihre Punkte pro Teil und ob Sie bestanden hätten.',
    en: 'The whole written exam with the real timings, then an optional self-assessment for the oral exam. At the end you see your points per part and whether you would have passed.',
  },
  structure: { de: 'Ablauf', en: 'Structure' },
  rowLesen: { de: 'Leseverstehen + Sprachbausteine', en: 'Reading + language elements' },
  rowHoeren: { de: 'Hörverstehen', en: 'Listening' },
  rowSchreiben: { de: 'Schriftlicher Ausdruck', en: 'Writing' },
  rowSprechen: { de: 'Mündlicher Ausdruck', en: 'Speaking' },
  minLesen: { de: '90 Min. · 40 Aufgaben · 105 Punkte', en: '90 min · 40 items · 105 points' },
  minHoeren: { de: 'ca. 30 Min. · 20 Aufgaben · 75 Punkte', en: 'about 30 min · 20 items · 75 points' },
  minSchreiben: { de: '30 Min. · 1 E-Mail · 45 Punkte', en: '30 min · 1 e-mail · 45 points' },
  minSprechen: { de: 'Selbsteinschätzung, optional · 75 Punkte', en: 'self-assessed, optional · 75 points' },
  passRule: {
    de: 'Bestanden ist, wer schriftlich mindestens 135 von 225 und mündlich mindestens 45 von 75 Punkten hat (je 60 %).',
    en: 'To pass you need at least 135 of 225 written and 45 of 75 oral points (60 % each).',
  },
  prediction: { de: 'Ihre Prognose', en: 'Your forecast' },
  good: { de: 'Auf gutem Weg', en: 'On track' },
  close: { de: 'Knapp', en: 'Borderline' },
  notyet: { de: 'Noch nicht', en: 'Not yet' },
  unknown: { de: 'Noch zu wenig Daten', en: 'Not enough data yet' },
  unknownNote: {
    de: 'Üben Sie mindestens drei Teile der schriftlichen Prüfung (Lesen, Sprachbausteine, Hören, Schreiben). Dann schätzt die App aus Ihren letzten Ergebnissen, wo Sie stehen.',
    en: 'Practise at least three parts of the written exam (reading, language elements, listening, writing). The app then estimates where you stand from your latest results.',
  },
  written: { de: 'Schriftlich erwartet', en: 'Written, expected' },
  oral: { de: 'Mündlich erwartet', en: 'Oral, expected' },
  oralNone: { de: 'Mündlich: noch keine Ergebnisse', en: 'Oral: no results yet' },
  basedOn: { de: 'Grundlage: bis zu drei letzte Ergebnisse pro Teil; Teile ohne Daten werden mit dem Durchschnitt geschätzt.', en: 'Based on up to three latest results per part; parts without data are estimated from the average.' },
  drag: { de: 'Am meisten Punkte verlieren Sie in', en: 'You lose the most points in' },
  practise: { de: 'Üben', en: 'Practise' },
  part: { de: 'Teil', en: 'Part' },
  expected: { de: 'erwartet', en: 'expected' },
  start: { de: 'Modelltest starten', en: 'Start mock exam' },
  inProgress: { de: 'Ein Modelltest läuft', en: 'A mock exam is in progress' },
  resume: { de: 'Fortsetzen', en: 'Resume' },
  abandon: { de: 'Abbrechen', en: 'Abandon' },
  startedAt: { de: 'Begonnen', en: 'Started' },
  phase: { de: 'Gerade', en: 'Now' },
  missing: { de: 'Für diese Teile fehlen noch Inhalte; sie werden übersprungen:', en: 'Content is still missing for these parts; they will be skipped:' },
  lastResult: { de: 'Letztes Ergebnis ansehen', en: 'See the last result' },
};

const PHASE_TEXT: Record<Phase, { de: string; en: string }> = {
  lesen: { de: 'Lesen + Sprachbausteine', en: 'Reading + language elements' },
  hoeren: { de: 'Hören', en: 'Listening' },
  schreiben: { de: 'Schreiben', en: 'Writing' },
  bewerten: { de: 'Schreiben bewerten', en: 'Assessing the writing' },
  sprechen: { de: 'Sprechen', en: 'Speaking' },
  done: { de: 'Fertig', en: 'Done' },
};

const LABEL_TEXT: Record<PredictionLabel, { de: string; en: string }> = { good: L.good, close: L.close, notyet: L.notyet, unknown: L.unknown };

const fmt = (n: number) => (Math.round(n * 2) / 2).toLocaleString('de-DE');

export function PredictionCard({ prediction, lang, go }: { prediction: Prediction; lang: Lang; go: (r: string) => void }) {
  const p = prediction;
  const tone = p.label === 'good' ? 'good' : p.label === 'notyet' ? 'bad' : '';
  return (
    <div className="card">
      <div className="row">
        <h2 style={{ margin: 0 }}>{tr(L.prediction, lang)}</h2>
        <span className="spacer" />
        <span className={`badge ${tone}`} style={tone ? undefined : { border: '1px solid var(--border)', background: 'var(--surface-2)' }}>
          {tr(LABEL_TEXT[p.label], lang)}
        </span>
      </div>
      {p.written.label === 'unknown' ? (
        <p className="small muted" style={{ marginBottom: 0 }}>{tr(L.unknownNote, lang)}</p>
      ) : (
        <>
          <Expected label={tr(L.written, lang)} expected={p.written.expected} max={p.written.max} />
          {p.oral.known > 0 ? (
            <Expected label={tr(L.oral, lang)} expected={p.oral.expected} max={p.oral.max} />
          ) : (
            <p className="small muted">{tr(L.oralNone, lang)}</p>
          )}
          {p.drag && p.drag.expected !== null && (
            <div className="row wrap" style={{ marginTop: 6 }}>
              <span className="small">
                {tr(L.drag, lang)} <strong>{tr(PART_LABEL[p.drag.part], lang)}</strong> (≈ {fmt(p.drag.expected)} / {p.drag.max}).
              </span>
              <button type="button" className="btn small" onClick={() => go(PART_SECTION[p.drag!.part])}>
                {tr(L.practise, lang)} →
              </button>
            </div>
          )}
          <details style={{ marginTop: 10 }}>
            <summary className="small" style={{ cursor: 'pointer' }}>{tr(L.part, lang)}</summary>
            <table className="history" style={{ marginTop: 6 }}>
              <tbody>
                {p.parts.map((e) => (
                  <tr key={e.part}>
                    <td>{tr(PART_LABEL[e.part], lang)}</td>
                    <td className={e.ratio === null ? 'muted' : e.ratio >= PASS_SHARE ? 'good' : 'bad'}>
                      {e.expected === null ? '–' : `${fmt(e.expected)} / ${e.max}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
          <p className="small muted" style={{ marginBottom: 0 }}>{tr(L.basedOn, lang)}</p>
        </>
      )}
    </div>
  );
}

function Expected({ label, expected, max }: { label: string; expected: number; max: number }) {
  const pct = Math.max(0, Math.min(100, (expected / max) * 100));
  return (
    <div style={{ marginTop: 12 }}>
      <div className="row small">
        <span>{label}</span>
        <span className="spacer" />
        <strong>≈ {fmt(expected)} / {max}</strong>
      </div>
      <div className={`bar${pct >= 60 ? ' good' : ''}`} style={{ marginTop: 5, position: 'relative' }}>
        <span style={{ width: `${pct}%` }} />
        <i aria-hidden="true" style={{ position: 'absolute', left: '60%', top: -3, bottom: -3, width: 2, background: 'var(--text)', opacity: 0.5 }} />
      </div>
    </div>
  );
}

export function StartPage({
  lang,
  go,
  results,
  current,
  hasLast,
  missing,
  onStart,
  onResume,
  onAbandon,
}: {
  lang: Lang;
  go: (route: string) => void;
  results: readonly DrillResult[];
  current: MockState | null;
  hasLast: boolean;
  missing: ExamPart[];
  onStart: () => void;
  onResume: () => void;
  onAbandon: () => void;
}) {
  const prediction = predictPass(results);
  const rows: [{ de: string; en: string }, { de: string; en: string }][] = [
    [L.rowLesen, L.minLesen],
    [L.rowHoeren, L.minHoeren],
    [L.rowSchreiben, L.minSchreiben],
    [L.rowSprechen, L.minSprechen],
  ];
  return (
    <div className="stack">
      <h1 style={{ marginBottom: 0 }}>{tr(L.title, lang)}</h1>
      <p className="muted" style={{ margin: 0 }}>{tr(L.intro, lang)}</p>

      {current ? (
        <div className="card" style={{ borderColor: 'var(--accent)' }}>
          <h2 style={{ marginTop: 0 }}>{tr(L.inProgress, lang)}</h2>
          <p className="small muted">
            {tr(L.startedAt, lang)}: {new Date(current.startedAt).toLocaleString(lang === 'de' ? 'de-DE' : 'en-GB')} · {tr(L.phase, lang)}:{' '}
            {tr(PHASE_TEXT[current.phase], lang)}
          </p>
          <div className="row">
            <button type="button" className="btn primary" style={{ flex: 1 }} onClick={onResume}>
              {tr(L.resume, lang)} →
            </button>
            <button type="button" className="btn danger" onClick={onAbandon}>
              {tr(L.abandon, lang)}
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className="btn primary block" onClick={onStart}>
          ⏱️ {tr(L.start, lang)}
        </button>
      )}

      {missing.length > 0 && (
        <p className="small muted" style={{ margin: 0 }}>
          {tr(L.missing, lang)} {missing.map((p) => tr(PART_LABEL[p], lang)).join(', ')}
        </p>
      )}

      <PredictionCard prediction={prediction} lang={lang} go={go} />

      <div className="card">
        <h2 style={{ marginTop: 0 }}>{tr(L.structure, lang)}</h2>
        <table className="history">
          <tbody>
            {rows.map(([a, b]) => (
              <tr key={a.de}>
                <td>{tr(a, lang)}</td>
                <td className="muted">{tr(b, lang)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="small" style={{ marginBottom: 0 }}>{tr(L.passRule, lang)}</p>
      </div>

      {hasLast && (
        <button type="button" className="btn" onClick={() => go('modelltest/ergebnis')}>
          {tr(L.lastResult, lang)}
        </button>
      )}
    </div>
  );
}
