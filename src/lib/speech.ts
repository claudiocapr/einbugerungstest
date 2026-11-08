/**
 * German speech recognition through the browser (free). Available in Chrome
 * (desktop and Android) and Safari (iOS 14.5+, macOS). In Chrome the audio is
 * sent to Google's speech service; Safari processes it on Apple's side or on
 * the device. Screens using this must show `SPEECH_PRIVACY` before starting.
 */
import type { Text2 } from '../types.ts';

export const SPEECH_PRIVACY: Text2 = {
  de: 'Die Spracherkennung des Browsers wandelt Ihre Stimme in Text um. In Chrome wird die Aufnahme dafür an Google gesendet, in Safari an Apple. Die App selbst speichert und sendet keine Aufnahmen.',
  en: "The browser's speech recognition turns your voice into text. In Chrome the audio is sent to Google for this, in Safari to Apple. The app itself stores and sends no recordings.",
};

interface RecognitionResult {
  isFinal: boolean;
  0: { transcript: string };
}
interface RecognitionEvent {
  resultIndex: number;
  results: ArrayLike<RecognitionResult>;
}
interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: RecognitionEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

const ctor = (): (new () => Recognition) | undefined => {
  if (typeof window === 'undefined') return undefined;
  const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
};

export const speechRecognitionAvailable = () => ctor() !== undefined;

export interface ListenOptions {
  /** Keep listening across pauses (free speech). Default false: stops after one utterance. */
  continuous?: boolean;
  /** Called with the full transcript so far; `final` once the browser is sure of it. */
  onText: (text: string, final: boolean) => void;
  onEnd?: () => void;
  /** e.g. "not-allowed" (microphone blocked), "no-speech", "network". */
  onError?: (code: string) => void;
}

/**
 * Starts listening in German. Must be called from a tap (browsers require a
 * user gesture for the microphone). Returns a function that stops listening.
 */
export function listen({ continuous = false, onText, onEnd, onError }: ListenOptions): () => void {
  const C = ctor();
  if (!C) {
    onError?.('unsupported');
    onEnd?.();
    return () => {};
  }
  const rec = new C();
  rec.lang = 'de-DE';
  rec.continuous = continuous;
  rec.interimResults = true;
  let finalText = '';
  rec.onresult = (e) => {
    let interim = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i];
      if (r.isFinal) finalText += `${r[0].transcript} `;
      else interim += r[0].transcript;
    }
    const text = `${finalText}${interim}`.trim();
    onText(text, interim === '');
  };
  rec.onerror = (e) => onError?.(e.error);
  rec.onend = () => onEnd?.();
  try {
    rec.start();
  } catch {
    onError?.('start-failed');
    onEnd?.();
  }
  return () => {
    try {
      rec.stop();
    } catch {
      /* already stopped */
    }
  };
}

/** Human-readable message for an error code from `listen`. */
export function speechErrorText(code: string): Text2 {
  switch (code) {
    case 'not-allowed':
    case 'service-not-allowed':
      return {
        de: 'Mikrofon oder Spracherkennung nicht erlaubt. iPhone: Einstellungen → Ihr Browser (Safari oder Chrome) → „Mikrofon“ und „Spracherkennung“ einschalten, dann die Seite neu laden. Andere Geräte: in den Browser-Einstellungen das Mikrofon für diese Seite erlauben.',
        en: 'Microphone or speech recognition not allowed. iPhone: Settings → your browser (Safari or Chrome) → turn on “Microphone” and “Speech Recognition”, then reload the page. Other devices: allow the microphone for this site in the browser settings.',
      };
    case 'no-speech':
      return { de: 'Nichts gehört. Bitte noch einmal und etwas lauter.', en: 'Nothing heard. Please try again a little louder.' };
    case 'network':
      return { de: 'Die Spracherkennung braucht eine Internetverbindung.', en: 'Speech recognition needs an internet connection.' };
    case 'unsupported':
      return { de: 'Dieser Browser hat keine Spracherkennung. Chrome oder Safari verwenden.', en: 'This browser has no speech recognition. Use Chrome or Safari.' };
    default:
      return { de: 'Die Spracherkennung hat nicht funktioniert.', en: 'Speech recognition did not work.' };
  }
}
