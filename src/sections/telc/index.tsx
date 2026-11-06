// Private telc area: official material from the private bucket, for allow-listed accounts. Owned by the backend agent.
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { SectionProps } from '../types.ts';
import { tr } from '../../lib/i18n.ts';
import { useAccess } from '../../sync/access.ts';
import { describeError } from '../../sync/supabase.ts';
import { listLibrary, prettyName, useSignedUrls, type Folder } from './files.ts';
import { SignedAudio } from './Audio.tsx';
import AnswerSheet from './AnswerSheet.tsx';

const L = {
  title: { de: 'telc-Material', en: 'telc material' },
  intro: {
    de: 'Offizielles Übungsmaterial von telc, privat gespeichert und nur für freigeschaltete Konten. Bitte nicht weitergeben.',
    en: 'Official practice material from telc, stored privately and only for enabled accounts. Please do not share it.',
  },
  signIn: {
    de: 'Dieser Bereich ist nur für angemeldete, freigeschaltete Konten. Konten gibt es nur auf Einladung.',
    en: 'This area is only for signed-in, enabled accounts. Accounts are by invitation only.',
  },
  noAccess: {
    de: 'Ihr Konto ist für das telc-Material nicht freigeschaltet. Alle anderen Übungen der App stehen Ihnen offen.',
    en: 'Your account is not enabled for the telc material. Every other exercise in the app is open to you.',
  },
  toKonto: { de: 'Zum Konto', en: 'Go to account' },
  checking: { de: 'Zugang wird geprüft …', en: 'Checking access …' },
  loading: { de: 'Dateien werden geladen …', en: 'Loading files …' },
  empty: {
    de: 'Noch keine Dateien hochgeladen. Der Inhaber startet dafür den GitHub-Workflow „Upload telc material“ (siehe docs/BACKEND.md).',
    en: 'No files uploaded yet. The owner starts the GitHub workflow “Upload telc material” for that (see docs/BACKEND.md).',
  },
  sheet: { de: 'Antwortbogen ausfüllen und auswerten', en: 'Fill in and score the answer sheet' },
  sheetSub: { de: 'Aufgaben 1–60, telc-Punkte wie in der Prüfung', en: 'Items 1–60, telc points as in the exam' },
  documents: { de: 'Dokumente', en: 'Documents' },
  audio: { de: 'Audio', en: 'Audio' },
  open: { de: 'öffnen', en: 'open' },
  retry: { de: 'Erneut versuchen', en: 'Try again' },
  source: {
    de: 'Quelle: telc gGmbH, kostenlose Downloads auf telc.net. © telc gGmbH.',
    en: 'Source: telc gGmbH, free downloads on telc.net. © telc gGmbH.',
  },
};

export function Gate({ lang, go, children }: SectionProps & { children: ReactNode }) {
  const access = useAccess();
  if (access.loading) return <p className="muted" style={{ marginTop: 24 }}>{tr(L.checking, lang)}</p>;
  if (access.telc) return <>{children}</>;
  return (
    <div className="card stack" style={{ marginTop: 24 }}>
      <h1 style={{ margin: 0 }}>{tr(L.title, lang)}</h1>
      <p style={{ margin: 0 }}>{access.signedIn ? tr(L.noAccess, lang) : tr(L.signIn, lang)}</p>
      {!!access.error && <p className="bad small" style={{ margin: 0 }}>{describeError(access.error, lang)}</p>}
      <div className="row wrap">
        <button type="button" className="btn primary" onClick={() => go('konto')}>
          {tr(L.toKonto, lang)}
        </button>
        <button type="button" className="btn ghost" onClick={() => go('home')}>
          ← {lang === 'de' ? 'Start' : 'Home'}
        </button>
      </div>
    </div>
  );
}

function Library({ lang, go }: SectionProps) {
  const [folders, setFolders] = useState<Folder[] | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [attempt, setAttempt] = useState(0);
  const [playing, setPlaying] = useState<Record<string, string>>({});

  useEffect(() => {
    let live = true;
    setError(null);
    listLibrary().then(
      (f) => live && setFolders(f),
      (e) => live && setError(e),
    );
    return () => {
      live = false;
    };
  }, [attempt]);

  const paths = useMemo(() => (folders ?? []).flatMap((f) => f.files.map((x) => x.path)), [folders]);
  const { urls, renew, error: signError } = useSignedUrls(paths);

  if (error) {
    return (
      <div className="card stack">
        <p className="bad" style={{ margin: 0 }}>{describeError(error, lang)}</p>
        <button type="button" className="btn" onClick={() => setAttempt((n) => n + 1)}>
          {tr(L.retry, lang)}
        </button>
      </div>
    );
  }
  if (!folders) return <p className="muted">{tr(L.loading, lang)}</p>;
  if (folders.every((f) => f.files.length === 0)) return <p className="muted">{tr(L.empty, lang)}</p>;

  return (
    <div className="stack">
      {!!signError && <p className="bad small">{describeError(signError, lang)}</p>}
      {folders.map((folder) => {
        const docs = folder.files.filter((f) => f.kind !== 'audio');
        const tracks = folder.files.filter((f) => f.kind === 'audio');
        const current = playing[folder.name] ?? tracks[0]?.path;
        return (
          <section key={folder.name} className="card stack">
            <h2 style={{ margin: 0 }}>{prettyName(folder.name, lang)}</h2>
            {folder.name === 'uebungstest-1' && (
              <button type="button" className="tile" onClick={() => go('telc/antwortbogen')}>
                <span className="icon">📝</span>
                <span>
                  <span className="title">{tr(L.sheet, lang)}</span>
                  <span className="sub">{tr(L.sheetSub, lang)}</span>
                </span>
              </button>
            )}
            {docs.length > 0 && (
              <div className="stack" style={{ gap: 8 }}>
                <span className="muted small">{tr(L.documents, lang)}</span>
                {docs.map((f) => (
                  <a
                    key={f.path}
                    className="tile"
                    style={{ textDecoration: 'none', pointerEvents: urls[f.path] ? undefined : 'none', opacity: urls[f.path] ? 1 : 0.6 }}
                    href={urls[f.path] ?? '#/telc'}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="icon">📄</span>
                    <span>
                      <span className="title">{prettyName(f.name, lang)}</span>
                      <span className="sub">
                        {tr(L.open, lang)}
                        {f.size ? ` · ${(f.size / 1024 / 1024).toFixed(1)} MB` : ''}
                      </span>
                    </span>
                  </a>
                ))}
              </div>
            )}
            {tracks.length > 0 && current && (
              <div className="stack" style={{ gap: 8 }}>
                <span className="muted small">{tr(L.audio, lang)}</span>
                <SignedAudio
                  key={current}
                  path={current}
                  url={urls[current]}
                  renew={renew}
                  label={prettyName(current.split('/').pop() ?? current, lang)}
                />
                {tracks.length > 1 && (
                  <div className="chips">
                    {tracks.map((t) => (
                      <button
                        key={t.path}
                        type="button"
                        className="chip"
                        aria-pressed={t.path === current}
                        onClick={() => setPlaying((p) => ({ ...p, [folder.name]: t.path }))}
                      >
                        {prettyName(t.name, lang)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        );
      })}
      <p className="muted small">{tr(L.source, lang)}</p>
    </div>
  );
}

export default function Telc(props: SectionProps) {
  const { lang, path } = props;
  return (
    <Gate {...props}>
      {path[0] === 'antwortbogen' ? (
        <AnswerSheet {...props} />
      ) : (
        <div className="stack">
          <h1>{tr(L.title, lang)}</h1>
          <p className="muted" style={{ marginTop: 0 }}>
            {tr(L.intro, lang)}
          </p>
          <Library {...props} />
        </div>
      )}
    </Gate>
  );
}
