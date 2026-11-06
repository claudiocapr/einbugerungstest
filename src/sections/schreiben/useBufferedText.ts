import { useCallback, useEffect, useRef, useState } from 'react';
import { MAX_TEXT_LENGTH } from './hints.ts';

/**
 * Local text state that is written to persistent storage shortly after the
 * user stops typing (and when the screen closes or the page is hidden), so
 * every keystroke does not rewrite and resync the whole store.
 */
export function useBufferedText(saved: string, save: (text: string) => void, delay = 700): [string, (text: string) => void] {
  const [text, setText] = useState(saved);
  const latest = useRef({ text: saved, dirty: false, save });
  latest.current.save = save;

  const flush = useCallback(() => {
    if (!latest.current.dirty) return;
    latest.current.dirty = false;
    latest.current.save(latest.current.text);
  }, []);

  useEffect(() => {
    if (!latest.current.dirty) return;
    const id = window.setTimeout(flush, delay);
    return () => window.clearTimeout(id);
  }, [text, delay, flush]);

  useEffect(() => {
    window.addEventListener('pagehide', flush);
    return () => {
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, [flush]);

  const update = useCallback((next: string) => {
    const value = next.slice(0, MAX_TEXT_LENGTH);
    latest.current.text = value;
    latest.current.dirty = true;
    setText(value);
  }, []);

  return [text, update];
}
