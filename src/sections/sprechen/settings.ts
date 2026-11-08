import { useSection } from '../../lib/storage.ts';

/** Small, synced settings of the Sprechen section (`useSection('sprechen', …)`). */
export interface Settings {
  prepMinutes: number;
  /** Neurofeedback mode: the speech-recognition privacy note was read and closed. */
  speechPrivacyOk?: boolean;
}
export const DEFAULT_SETTINGS: Settings = { prepMinutes: 20 };

export const useSprechenSettings = () => useSection<Settings>('sprechen', DEFAULT_SETTINGS);
