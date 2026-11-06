/**
 * German text-to-speech through the browser's built-in voices (free, offline
 * on most phones). Quality depends on the device; iOS and recent Android ship
 * decent German voices. Everything degrades to "no audio" rather than throwing.
 */
import type { Line } from '../content/types.ts';

const synth = (): SpeechSynthesis | undefined =>
  typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : undefined;

export const ttsAvailable = () => synth() !== undefined;

/** German voices on this device, best guesses first. Voices load asynchronously on some browsers. */
export function germanVoices(): SpeechSynthesisVoice[] {
  const s = synth();
  if (!s) return [];
  return s
    .getVoices()
    .filter((v) => v.lang.toLowerCase().startsWith('de'))
    .sort((a, b) => Number(b.localService) - Number(a.localService));
}

/** Resolves once voices are listed (or after a short wait if the browser never says). */
export function voicesReady(timeoutMs = 1500): Promise<SpeechSynthesisVoice[]> {
  const s = synth();
  if (!s) return Promise.resolve([]);
  if (s.getVoices().length > 0) return Promise.resolve(germanVoices());
  return new Promise((resolve) => {
    const done = () => resolve(germanVoices());
    s.addEventListener('voiceschanged', done, { once: true });
    setTimeout(done, timeoutMs);
  });
}

export interface SpeakOptions {
  /** 0.5–1.5; exam-like pace is about 0.95. */
  rate?: number;
  voice?: SpeechSynthesisVoice;
}

/** Speaks one text. Resolves when it ends, is cancelled, or fails. */
export function speak(text: string, { rate = 0.95, voice }: SpeakOptions = {}): Promise<void> {
  const s = synth();
  if (!s || !text.trim()) return Promise.resolve();
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'de-DE';
    u.rate = rate;
    const v = voice ?? germanVoices()[0];
    if (v) u.voice = v;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    s.speak(u);
  });
}

let sequence = 0;

/**
 * Speaks a script line by line, alternating voices for speakers "a" and "b"
 * when the device has more than one German voice. Calling `stop()` or starting
 * another sequence ends this one.
 *
 * iOS only allows speech that starts inside the tap that asked for it, so the
 * first line is spoken synchronously when the voices are already listed; when
 * they are not, a silent utterance unlocks speech before waiting for them.
 */
export function speakLines(lines: Line[], { rate = 0.95 }: SpeakOptions = {}): Promise<void> {
  stop();
  const mine = ++sequence;
  const s = synth();
  if (!s) return Promise.resolve();
  const listed = s.getVoices().length > 0;
  if (!listed) {
    try {
      s.speak(new SpeechSynthesisUtterance(''));
    } catch {
      /* unlocking is best effort */
    }
  }
  return (async () => {
    // No await before the first speak() when the voices are listed.
    const voices = listed ? germanVoices() : await voicesReady();
    const pick = (voice: Line['voice']) =>
      voice === 'b' ? (voices[1] ?? voices[0]) : voice === 'n' ? (voices[2] ?? voices[0]) : voices[0];
    for (const line of lines) {
      if (mine !== sequence) return;
      await speak(line.text, { rate, voice: pick(line.voice) });
      if (mine !== sequence) return;
      await new Promise((r) => setTimeout(r, 250));
    }
  })();
}

export function stop() {
  sequence++;
  synth()?.cancel();
}
