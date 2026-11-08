import { useSection } from '../../lib/storage.ts';

/** What the Wortschatz section keeps in `useSection('wortschatz', …)`. Small on purpose. */
export interface WsSettings {
  autoSpeak: boolean;
  /** Neurofeedback mode: the speech-recognition privacy note was read and closed. */
  speechNoteSeen?: boolean;
}

const DEFAULT_SETTINGS: WsSettings = { autoSpeak: false };

/** Older or damaged saves may hold anything under the key. */
const readSettings = (raw: unknown): WsSettings => {
  const r = raw && typeof raw === 'object' ? (raw as Partial<WsSettings>) : {};
  const out: WsSettings = { autoSpeak: r.autoSpeak === true };
  if (r.speechNoteSeen === true) out.speechNoteSeen = true;
  return out;
};

export function useWsSettings(): [WsSettings, (autoSpeak: boolean) => void, () => void] {
  const [raw, set] = useSection<WsSettings>('wortschatz', DEFAULT_SETTINGS);
  const setAutoSpeak = (autoSpeak: boolean) => set((prev) => ({ ...readSettings(prev), autoSpeak }));
  const markSpeechNoteSeen = () => set((prev) => ({ ...readSettings(prev), speechNoteSeen: true }));
  return [readSettings(raw), setAutoSpeak, markSpeechNoteSeen];
}
