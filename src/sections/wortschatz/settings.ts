import { useSection } from '../../lib/storage.ts';

/** What the Wortschatz section keeps in `useSection('wortschatz', …)`. Small on purpose. */
export interface WsSettings {
  autoSpeak: boolean;
}

const DEFAULT_SETTINGS: WsSettings = { autoSpeak: false };

/** Older or damaged saves may hold anything under the key. */
const readSettings = (raw: unknown): WsSettings => ({
  autoSpeak: !!(raw && typeof raw === 'object' && (raw as Partial<WsSettings>).autoSpeak === true),
});

export function useWsSettings(): [WsSettings, (autoSpeak: boolean) => void] {
  const [raw, set] = useSection<WsSettings>('wortschatz', DEFAULT_SETTINGS);
  const setAutoSpeak = (autoSpeak: boolean) => set((prev) => ({ ...readSettings(prev), autoSpeak }));
  return [readSettings(raw), setAutoSpeak];
}
