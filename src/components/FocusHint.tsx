import { useEffect, useRef, useState } from 'react';
import type { Lang, Text2 } from '../types.ts';
import type { FocusSignal } from '../lib/neuro.ts';
import { tr } from '../lib/i18n.ts';
import { formatClock, useCountdown } from '../lib/useCountdown.ts';
import { noteFocusHint } from '../lib/neuroLog.ts';
import { track } from '../lib/analytics.ts';

/**
 * Neurofeedback mode: an inline card suggesting a short break when the focus
 * monitor (`focusState` in lib/neuro.ts) reports a dip or a long session.
 * Renders nothing for the signal "ok". Each time a hint appears it is logged
 * with `noteFocusHint`, so the Feedback screen can count them.
 *
 * - `onContinue()`: the learner dismissed the hint and keeps going.
 * - `onBreak()`: the learner took the 2-minute break and it is over (the
 *   countdown ran out or they ended it early). A good moment to start a new
 *   focus baseline / session clock.
 */

export const BREAK_MS = 2 * 60 * 1000;

const L = {
  dip: {
    de: 'Ihre letzten Antworten waren langsamer/unsicherer – kurze Pause? (2 Minuten)',
    en: 'Your last answers were slower/less sure – a short break? (2 minutes)',
  },
  long: { de: 'Schon 25 Minuten – Zeit für eine Pause', en: 'Already 25 minutes – time for a break' },
  longSub: {
    de: 'Eine kurze Pause hilft dem Gedächtnis, das Gelernte zu festigen.',
    en: 'A short break helps your memory consolidate what you learned.',
  },
  takeBreak: { de: 'Pause (2 Min.)', en: 'Break (2 min)' },
  continue: { de: 'Weiter', en: 'Continue' },
  breakNow: { de: 'Pause – aufstehen, Wasser trinken, aus dem Fenster schauen.', en: 'Break – stand up, drink some water, look out of the window.' },
  endBreak: { de: 'Pause beenden', en: 'End break' },
  label: { de: 'Hinweis zur Konzentration', en: 'Focus hint' },
} satisfies Record<string, Text2>;

function BreakTimer({ lang, onDone }: { lang: Lang; onDone: () => void }) {
  const remaining = useCountdown(BREAK_MS, true, onDone);
  return (
    <div className="stack" style={{ gap: 10 }}>
      <div className="row" style={{ gap: 12 }}>
        <span className="clock" role="timer" aria-live="off">
          {formatClock(remaining)}
        </span>
        <span className="small">{tr(L.breakNow, lang)}</span>
      </div>
      <div>
        <button type="button" className="btn small" onClick={onDone}>
          {tr(L.endBreak, lang)}
        </button>
      </div>
    </div>
  );
}

export function FocusHint({
  lang,
  signal,
  onBreak,
  onContinue,
}: {
  lang: Lang;
  signal: FocusSignal;
  onBreak: () => void;
  onContinue: () => void;
}) {
  const [dismissed, setDismissed] = useState(false);
  const [onBreakNow, setOnBreakNow] = useState(false);
  // The signal last logged, so a re-render (or React's dev double effect) does not log twice.
  const logged = useRef<FocusSignal>('ok');

  useEffect(() => {
    if (signal === 'ok') {
      logged.current = 'ok';
      return;
    }
    if (logged.current === signal) return;
    logged.current = signal;
    setDismissed(false);
    noteFocusHint(signal);
    track('neuro.focus_hint', { kind: signal });
  }, [signal]);

  if (signal === 'ok' || dismissed) return null;

  const finishBreak = () => {
    setOnBreakNow(false);
    setDismissed(true);
    track('neuro.break', { kind: signal });
    onBreak();
  };

  return (
    <div className="verdict" role="status" aria-label={tr(L.label, lang)} style={{ marginTop: 12, marginBottom: 12 }}>
      {onBreakNow ? (
        <BreakTimer lang={lang} onDone={finishBreak} />
      ) : (
        <>
          <div className="head">
            <span aria-hidden="true">🧠 </span>
            {tr(signal === 'dip' ? L.dip : L.long, lang)}
          </div>
          {signal === 'long' && <div className="body muted">{tr(L.longSub, lang)}</div>}
          <div className="row wrap" style={{ gap: 8, marginTop: 10 }}>
            <button type="button" className="btn small primary" onClick={() => setOnBreakNow(true)}>
              {tr(L.takeBreak, lang)}
            </button>
            <button
              type="button"
              className="btn small ghost"
              onClick={() => {
                setDismissed(true);
                onContinue();
              }}
            >
              {tr(L.continue, lang)}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
