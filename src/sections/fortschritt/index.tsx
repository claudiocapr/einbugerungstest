// Progress screen. Owned by the integrator; extended with per-part results after the sections land.
import { useRef, useState } from 'react';
import type { SectionProps } from '../types.ts';
import { Confirm } from '../../components/Confirm.tsx';
import { exportFilename, exportStore, importStore, resetProgress, useStore } from '../../lib/storage.ts';
import { tr } from '../../lib/i18n.ts';
import { isMastered } from '../../lib/srs.ts';
import type { DrillResult, ExamPart } from '../../types.ts';
import { PART_LABEL, PART_MAX, resultRatio } from '../modelltest/score.ts';
import { sectionById } from '../registry.ts';

const PARTS = Object.keys(PART_MAX) as ExamPart[];

/** Mean share of points over the last three results of a part, or null. */
function recentShare(results: DrillResult[], part: ExamPart): { share: number; n: number } | null {
  const ratios = results
    .filter((r) => r.part === part && r.section !== 'modelltest')
    .map(resultRatio)
    .filter((x): x is number => x !== null)
    .slice(0, 3);
  return ratios.length ? { share: ratios.reduce((a, b) => a + b, 0) / ratios.length, n: ratios.length } : null;
}

const fmt = (n: number, lang: 'de' | 'en') => n.toLocaleString(lang === 'de' ? 'de-DE' : 'en-GB', { maximumFractionDigits: 1 });

const L = {
  title: { de: 'Fortschritt', en: 'Progress' },
  practised: { de: 'Geübte Einheiten', en: 'Items practised' },
  results: { de: 'Abgeschlossene Übungen', en: 'Finished exercises' },
  mastered: { de: 'Sicher gelernt', en: 'Mastered' },
  byPart: { de: 'Prüfungsteile (letzte 3 Ergebnisse)', en: 'Exam parts (last 3 results)' },
  notYet: { de: 'noch nicht geübt', en: 'not practised yet' },
  latest: { de: 'Letzte Ergebnisse', en: 'Latest results' },
  self: { de: 'Selbstbewertung', en: 'self-assessed' },
  none: { de: 'Noch keine Ergebnisse.', en: 'No results yet.' },
  saveToFile: { de: 'Als Datei sichern', en: 'Save to a file' },
  loadFromFile: { de: 'Aus Datei laden', en: 'Load from a file' },
  fileNote: {
    de: 'Die Datei landet in Ihren Downloads. Sie finden sie dort wieder, können sie auf ein anderes Gerät kopieren oder einfach löschen.',
    en: 'The file lands in your downloads. You can find it there, copy it to another device, or simply delete it.',
  },
  importDone: { de: 'Fortschritt geladen.', en: 'Progress loaded.' },
  importFailed: { de: 'Datei konnte nicht gelesen werden.', en: 'That file could not be read.' },
  confirmImport: {
    de: 'Der gespeicherte Fortschritt wird durch die Datei ersetzt. Fortfahren?',
    en: 'Your saved progress will be replaced by the file. Continue?',
  },
  reset: { de: 'Fortschritt zurücksetzen', en: 'Reset progress' },
  confirmReset: { de: 'Wirklich den gesamten Lernfortschritt löschen?', en: 'Really delete all learning progress?' },
};

export default function Fortschritt({ lang }: SectionProps) {
  const [store] = useStore();
  const input = useRef<HTMLInputElement>(null);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, setPending] = useState<File | null>(null);
  const [confirmingReset, setConfirmingReset] = useState(false);

  const save = () => {
    const blob = new Blob([exportStore()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = exportFilename();
    document.body.appendChild(link);
    link.click();
    link.remove();
    // Revoking straight away can cancel the download on some mobile browsers.
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  };

  return (
    <div>
      <h1>{tr(L.title, lang)}</h1>
      <div className="statgrid">
        <div className="stat">
          <div className="n">{Object.keys(store.progress).length}</div>
          <div className="l">{tr(L.practised, lang)}</div>
        </div>
        <div className="stat">
          <div className="n">{Object.values(store.progress).filter(isMastered).length}</div>
          <div className="l">{tr(L.mastered, lang)}</div>
        </div>
        <div className="stat">
          <div className="n">{store.results.length}</div>
          <div className="l">{tr(L.results, lang)}</div>
        </div>
      </div>

      <h2 style={{ marginTop: 28 }}>{tr(L.byPart, lang)}</h2>
      <div className="stack">
        {PARTS.map((part) => {
          const r = recentShare(store.results, part);
          const pct = r ? Math.round(r.share * 100) : 0;
          return (
            <div key={part}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span className="small">{tr(PART_LABEL[part], lang)}</span>
                <span className="small muted">{r ? `${pct} %` : tr(L.notYet, lang)}</span>
              </div>
              <div className={`bar${r && r.share >= 0.6 ? ' good' : ''}`} style={{ marginTop: 4 }}>
                <span style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <h2 style={{ marginTop: 28 }}>{tr(L.latest, lang)}</h2>
      {store.results.length === 0 ? (
        <p className="muted">{tr(L.none, lang)}</p>
      ) : (
        <div className="ranklist">
          {store.results.slice(0, 15).map((r) => {
            const meta = sectionById(r.section);
            const label = r.part && PART_LABEL[r.part] ? tr(PART_LABEL[r.part], lang) : meta ? tr(meta.title, lang) : r.section;
            const score =
              typeof r.points === 'number' && typeof r.maxPoints === 'number'
                ? `${fmt(r.points, lang)} / ${fmt(r.maxPoints, lang)}`
                : `${r.correct} / ${r.total}`;
            return (
              <div key={`${r.startedAt}-${r.section}-${r.setId ?? ''}`} className="ranked">
                <div className="row" style={{ justifyContent: 'space-between', gap: 8 }}>
                  <span>
                    {meta?.icon} {label}
                    {r.selfAssessed && <span className="small muted"> · {tr(L.self, lang)}</span>}
                  </span>
                  <strong>{score}</strong>
                </div>
                <div className="small muted">
                  {new Date(r.finishedAt).toLocaleString(lang === 'de' ? 'de-DE' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: 28 }}>
        <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="btn small" onClick={save}>
            {tr(L.saveToFile, lang)}
          </button>
          <button type="button" className="btn small" onClick={() => input.current?.click()}>
            {tr(L.loadFromFile, lang)}
          </button>
        </div>
        <p className="small muted" style={{ marginTop: 8 }}>{tr(L.fileNote, lang)}</p>
        {note && <p className={`small ${note.ok ? 'good' : 'bad'}`}>{note.text}</p>}
        <input
          ref={input}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (file) setPending(file);
          }}
        />
      </div>

      <div style={{ marginTop: 20 }}>
        <button type="button" className="btn small danger" onClick={() => setConfirmingReset(true)}>
          {tr(L.reset, lang)}
        </button>
      </div>

      {pending && (
        <Confirm
          message={tr(L.confirmImport, lang)}
          lang={lang}
          onConfirm={async () => {
            const file = pending;
            setPending(null);
            const ok = importStore(await file.text());
            setNote({ ok, text: tr(ok ? L.importDone : L.importFailed, lang) });
          }}
          onCancel={() => setPending(null)}
        />
      )}
      {confirmingReset && (
        <Confirm
          message={tr(L.confirmReset, lang)}
          lang={lang}
          onConfirm={() => {
            setConfirmingReset(false);
            resetProgress();
          }}
          onCancel={() => setConfirmingReset(false)}
        />
      )}
    </div>
  );
}
