import { useEffect, useRef, useState } from 'react';

/** "mm:ss", or "h:mm:ss" from an hour up. Negative values read as 0. */
export function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

/**
 * A countdown that ticks once a second while `running`, and calls `onDone`
 * once when it reaches zero. Returns the remaining milliseconds.
 */
export function useCountdown(durationMs: number, running: boolean, onDone?: () => void): number {
  const [endsAt, setEndsAt] = useState(() => Date.now() + durationMs);
  const [now, setNow] = useState(() => Date.now());
  const fired = useRef(false);

  useEffect(() => {
    setEndsAt(Date.now() + durationMs);
    fired.current = false;
  }, [durationMs]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const remaining = endsAt - now;
  useEffect(() => {
    if (running && remaining <= 0 && !fired.current) {
      fired.current = true;
      onDone?.();
    }
  }, [running, remaining, onDone]);
  return remaining;
}
