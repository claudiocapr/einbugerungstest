// Neurofeedback mode (test phase): pieces shared by the live transcript and "Nachsprechen".
import type { Lang, Text2 } from '../../types.ts';
import { tr } from '../../lib/i18n.ts';
import { SPEECH_PRIVACY } from '../../lib/speech.ts';
import { useSprechenSettings } from './settings.ts';

/**
 * Only one feature may use the microphone at a time: iOS Safari does not
 * reliably record (MediaRecorder) and recognise speech at once.
 */
export interface MicLock {
  /** Another feature has the microphone. */
  busy: boolean;
  /** Take (true) or release (false) the microphone. */
  claim: (on: boolean) => void;
}

const S = {
  privacyTitle: { de: 'Datenschutz', en: 'Privacy' },
  ok: { de: 'Verstanden', en: 'Got it' },
  memory: {
    de: 'Der erkannte Text bleibt nur auf dieser Seite und ist weg, sobald Sie sie verlassen.',
    en: 'The recognised text stays on this page only and is gone when you leave it.',
  },
  micBusy: {
    de: 'Das Mikrofon wird gerade von einer anderen Übung benutzt.',
    en: 'The microphone is being used by another exercise.',
  },
} satisfies Record<string, Text2>;

/** Whether the privacy note was closed, and a function that closes it for good. */
export function usePrivacyAck(): [boolean, () => void] {
  const [settings, setSettings] = useSprechenSettings();
  const ok = settings.speechPrivacyOk === true;
  return [ok, () => !ok && setSettings((s) => ({ ...s, speechPrivacyOk: true }))];
}

/** `SPEECH_PRIVACY` before the first start; afterwards a small fold-out. */
export function SpeechPrivacyNote({ lang, ok, onOk }: { lang: Lang; ok: boolean; onOk: () => void }) {
  if (ok) {
    return (
      <details className="small muted">
        <summary>ℹ️ {tr(S.privacyTitle, lang)}</summary>
        <p style={{ margin: '6px 0 0' }}>
          {tr(SPEECH_PRIVACY, lang)} {tr(S.memory, lang)}
        </p>
      </details>
    );
  }
  return (
    <div className="verdict">
      <div className="head">ℹ️ {tr(S.privacyTitle, lang)}</div>
      <div className="body">
        {tr(SPEECH_PRIVACY, lang)} {tr(S.memory, lang)}
      </div>
      <button type="button" className="btn small" style={{ marginTop: 8 }} onClick={onOk}>
        {tr(S.ok, lang)}
      </button>
    </div>
  );
}

export function MicBusyNote({ lang }: { lang: Lang }) {
  return <p className="muted small" style={{ margin: 0 }}>{tr(S.micBusy, lang)}</p>;
}
