import { useEffect, useRef, useState } from 'react';
import type { Lang, Text2 } from '../../types.ts';
import { logError, track } from '../../lib/analytics.ts';
import { tr } from '../../lib/i18n.ts';
import { formatClock } from '../../lib/useCountdown.ts';

const S = {
  title: { de: 'Aufnehmen und anhören', en: 'Record and listen' },
  privacy: {
    de: 'Die Aufnahme bleibt nur in diesem Browserfenster. Sie wird nicht gespeichert und nicht hochgeladen; beim Verlassen der Seite ist sie weg.',
    en: 'The recording stays in this browser tab only. It is not saved or uploaded; it is gone when you leave the page.',
  },
  record: { de: 'Aufnahme starten', en: 'Start recording' },
  stop: { de: 'Aufnahme beenden', en: 'Stop recording' },
  take: { de: 'Aufnahme', en: 'Take' },
  remove: { de: 'Löschen', en: 'Delete' },
  denied: {
    de: 'Kein Zugriff auf das Mikrofon. Erlauben Sie den Zugriff in den Browser-Einstellungen und versuchen Sie es noch einmal. Sie können auch ohne Aufnahme üben.',
    en: 'No access to the microphone. Allow it in your browser settings and try again. You can also practise without recording.',
  },
  unsupported: {
    de: 'Dieser Browser kann keine Aufnahmen machen. Sie können trotzdem laut üben, zum Beispiel mit der Sprachmemo-App Ihres Handys.',
    en: 'This browser cannot record. You can still practise aloud, e.g. with your phone’s voice memo app.',
  },
  failed: { de: 'Die Aufnahme hat nicht funktioniert.', en: 'Recording did not work.' },
} satisfies Record<string, Text2>;

/** Longest single take, so a forgotten recording does not fill the memory. */
const MAX_MS = 10 * 60 * 1000;

interface Take {
  url: string;
  ms: number;
}

const supported = () =>
  typeof window !== 'undefined' &&
  typeof window.MediaRecorder !== 'undefined' &&
  !!navigator.mediaDevices?.getUserMedia;

/**
 * Microphone recorder. Takes live only in memory (object URLs), are revoked on
 * unmount and never leave the device.
 */
export function Recorder({ lang, part, setId }: { lang: Lang; part: number; setId: string }) {
  const [state, setState] = useState<'idle' | 'starting' | 'recording'>('idle');
  const [error, setError] = useState<'denied' | 'unsupported' | 'failed' | null>(supported() ? null : 'unsupported');
  const [takes, setTakes] = useState<Take[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const startedAt = useRef(0);
  const urls = useRef<string[]>([]);
  const alive = useRef(true);

  const releaseStream = () => {
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
  };

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      try {
        if (recorder.current && recorder.current.state !== 'inactive') recorder.current.stop();
      } catch {
        /* already stopped */
      }
      releaseStream();
      urls.current.forEach((u) => URL.revokeObjectURL(u));
      urls.current = [];
    };
  }, []);

  useEffect(() => {
    if (state !== 'recording') return;
    const id = window.setInterval(() => {
      const ms = Date.now() - startedAt.current;
      setElapsed(ms);
      if (ms >= MAX_MS) recorder.current?.stop();
    }, 250);
    return () => window.clearInterval(id);
  }, [state]);

  const start = async () => {
    setError(null);
    setState('starting');
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!alive.current) {
        s.getTracks().forEach((t) => t.stop());
        return;
      }
      stream.current = s;
      const rec = new MediaRecorder(s);
      const chunks: Blob[] = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      rec.onstop = () => {
        releaseStream();
        if (!alive.current) return;
        const ms = Date.now() - startedAt.current;
        if (chunks.length > 0) {
          const url = URL.createObjectURL(new Blob(chunks, { type: rec.mimeType || 'audio/webm' }));
          urls.current.push(url);
          setTakes((prev) => [...prev, { url, ms }]);
          track('sprechen.recorded', { part, setId, seconds: Math.round(ms / 1000) });
        }
        setState('idle');
      };
      rec.onerror = (e) => {
        logError((e as Event & { error?: unknown }).error ?? e, 'sprechen.recorder');
        releaseStream();
        if (alive.current) {
          setError('failed');
          setState('idle');
        }
      };
      recorder.current = rec;
      startedAt.current = Date.now();
      setElapsed(0);
      rec.start();
      setState('recording');
    } catch (e) {
      releaseStream();
      const name = (e as { name?: string })?.name;
      const denied = name === 'NotAllowedError' || name === 'SecurityError' || name === 'PermissionDeniedError';
      if (!denied) logError(e, 'sprechen.getUserMedia');
      if (alive.current) {
        setError(denied ? 'denied' : name === 'NotFoundError' ? 'unsupported' : 'failed');
        setState('idle');
      }
    }
  };

  const stopRecording = () => {
    try {
      recorder.current?.stop();
    } catch (e) {
      logError(e, 'sprechen.recorder.stop');
      releaseStream();
      setState('idle');
    }
  };

  const remove = (url: string) => {
    URL.revokeObjectURL(url);
    urls.current = urls.current.filter((u) => u !== url);
    setTakes((prev) => prev.filter((t) => t.url !== url));
  };

  return (
    <div className="card stack">
      <h2 style={{ margin: 0 }}>🎙️ {tr(S.title, lang)}</h2>
      <p className="muted small" style={{ margin: 0 }}>
        {tr(S.privacy, lang)}
      </p>
      {error && error !== 'unsupported' && (
        <div className="verdict bad">
          <div className="body">{tr(error === 'denied' ? S.denied : S.failed, lang)}</div>
        </div>
      )}
      {error === 'unsupported' ? (
        <p className="muted">{tr(S.unsupported, lang)}</p>
      ) : (
        <div className="row wrap">
          {state === 'recording' ? (
            <button type="button" className="btn danger" onClick={stopRecording}>
              ■ {tr(S.stop, lang)}
            </button>
          ) : (
            <button type="button" className="btn primary" onClick={start} disabled={state === 'starting'}>
              ● {tr(S.record, lang)}
            </button>
          )}
          {state === 'recording' && (
            <span className="clock urgent">
              <span className="rec-dot" aria-hidden="true" /> {formatClock(elapsed)}
            </span>
          )}
        </div>
      )}
      {takes.length > 0 && (
        <ol className="takes">
          {takes.map((t, i) => (
            <li key={t.url}>
              <span className="small muted">
                {tr(S.take, lang)} {i + 1} · {formatClock(t.ms)}
              </span>
              <audio controls src={t.url} preload="metadata" />
              <button type="button" className="btn small ghost" onClick={() => remove(t.url)}>
                {tr(S.remove, lang)}
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
