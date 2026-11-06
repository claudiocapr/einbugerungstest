// Progress screen. Owned by the integrator; extended with per-part results after the sections land.
import { useRef, useState } from 'react';
import type { SectionProps } from '../types.ts';
import { Confirm } from '../../components/Confirm.tsx';
import { exportFilename, exportStore, importStore, resetProgress, useStore } from '../../lib/storage.ts';
import { tr } from '../../lib/i18n.ts';

const L = {
  title: { de: 'Fortschritt', en: 'Progress' },
  practised: { de: 'Geübte Einheiten', en: 'Items practised' },
  results: { de: 'Abgeschlossene Übungen', en: 'Finished exercises' },
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
          <div className="n">{store.results.length}</div>
          <div className="l">{tr(L.results, lang)}</div>
        </div>
      </div>

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
