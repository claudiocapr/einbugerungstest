// Neurofeedback mode (test phase): live transcript of free speech with pace, fillers and Redemittel.
import { useEffect, useRef, useState } from 'react';
import type { PhraseGroup } from '../../content/types.ts';
import type { Lang, Text2 } from '../../types.ts';
import { track } from '../../lib/analytics.ts';
import { tr } from '../../lib/i18n.ts';
import { speechStats } from '../../lib/neuro.ts';
import { listen, speechErrorText } from '../../lib/speech.ts';
import { stop as stopTts } from '../../lib/tts.ts';
import { formatClock } from '../../lib/useCountdown.ts';
import { MicBusyNote, SpeechPrivacyNote, usePrivacyAck, type MicLock } from './NfShared.tsx';
import {
  PACE_MAX,
  PACE_MIN,
  PACE_TEXT,
  fillerTip,
  joinTranscript,
  nextQuickEnds,
  onSessionEnd,
  paceBand,
  phrasesUsed,
  suggestPhrases,
} from './nf.ts';
import type { SprechenPart } from './score.ts';

const S = {
  title: { de: 'Live-Feedback', en: 'Live feedback' },
  intro: {
    de: 'Sprechen Sie frei zur Aufgabe, zum Beispiel Ihren Teil des Gesprächs. Die App schreibt mit, was sie versteht, und zeigt danach Tempo, Füllwörter und Redemittel.',
    en: 'Speak freely about the task, e.g. your part of the conversation. The app writes down what it understands and then shows your pace, fillers and phrases.',
  },
  start: { de: 'Live-Feedback starten', en: 'Start live feedback' },
  again: { de: 'Noch einmal', en: 'Again' },
  stop: { de: 'Stopp', en: 'Stop' },
  resume: { de: 'Weiter', en: 'Continue' },
  evaluate: { de: 'Auswerten', en: 'Evaluate' },
  paused: { de: 'Die Spracherkennung hat angehalten.', en: 'Speech recognition has paused.' },
  silent: { de: 'Längere Zeit nichts gehört.', en: 'Nothing heard for a while.' },
  waiting: { de: 'Ich höre zu … bitte sprechen.', en: 'Listening … please speak.' },
  words: { de: 'Wörter', en: 'Words' },
  wpm: { de: 'Wörter pro Minute', en: 'Words per minute' },
  target: { de: 'Ziel im Gespräch: {a}–{b}', en: 'Target in conversation: {a}–{b}' },
  fillers: { de: 'Füllwörter', en: 'Fillers' },
  fillerNote: {
    de: 'Die Erkennung schreibt nicht jedes „äh“ mit – die Zahl ist eher zu niedrig.',
    en: 'Recognition does not write down every "äh" – the number tends to be too low.',
  },
  short: {
    de: 'Für ein verlässliches Tempo mindestens eine Minute sprechen.',
    en: 'Speak for at least a minute for a reliable pace.',
  },
  phrases: { de: 'Redemittel', en: 'Phrases' },
  used: { de: 'Benutzte Redemittel', en: 'Phrases you used' },
  noneUsed: { de: 'Keine Redemittel aus der Liste erkannt.', en: 'No phrases from the list recognised.' },
  tryNext: { de: 'Probieren Sie beim nächsten Mal', en: 'Try next time' },
  nothing: { de: 'Es wurde nichts erkannt. Bitte noch einmal und etwas lauter sprechen.', en: 'Nothing was recognised. Please try again a little louder.' },
} satisfies Record<string, Text2>;

interface Result {
  words: number;
  wpm: number;
  fillers: number;
  ms: number;
  used: string[];
}

type Status = 'idle' | 'listening' | 'paused' | 'done';

export function LiveFeedback({ lang, part, groups, mic }: { lang: Lang; part: SprechenPart; groups: PhraseGroup[]; mic: MicLock }) {
  const [privacyOk, ackPrivacy] = usePrivacyAck();
  const [status, setStatus] = useState<Status>('idle');
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [elapsed, setElapsed] = useState(0);

  // Session state lives in a ref: recognition callbacks outlive renders.
  const s = useRef({
    alive: true,
    wanted: false,
    finished: true,
    gen: 0,
    stopFn: null as (() => void) | null,
    committed: '',
    current: '',
    error: null as string | null,
    gotText: false,
    quickEnds: 0,
    sessionStart: 0,
    lastTextAt: 0,
    segOpen: false,
    segStart: 0,
    activeMs: 0,
    timer: 0,
  }).current;
  const props = useRef({ part, groups, mic });
  props.current = { part, groups, mic };

  const clearTimer = () => {
    window.clearTimeout(s.timer);
    s.timer = 0;
  };

  const closeSegment = () => {
    if (!s.segOpen) return;
    s.activeMs += Date.now() - s.segStart;
    s.segOpen = false;
  };

  const finish = () => {
    if (s.finished) return;
    s.finished = true;
    s.wanted = false;
    s.gen++;
    clearTimer();
    closeSegment();
    s.stopFn = null;
    const transcript = joinTranscript(s.committed, s.current);
    s.committed = transcript;
    s.current = '';
    const stats = speechStats(transcript, s.activeMs);
    const used = phrasesUsed(transcript, props.current.groups);
    setText(transcript);
    setResult({ words: stats.words, wpm: stats.wordsPerMinute, fillers: stats.fillers, ms: s.activeMs, used });
    setStatus('done');
    props.current.mic.claim(false);
    if (stats.words > 0)
      track('sprechen.nf_live', {
        teil: props.current.part,
        words: stats.words,
        wpm: stats.wordsPerMinute,
        fillers: stats.fillers,
        phrases: used.length,
      });
  };

  const sessionEnded = () => {
    s.committed = joinTranscript(s.committed, s.current);
    s.current = '';
    s.stopFn = null;
    const now = Date.now();
    s.quickEnds = nextQuickEnds(s.quickEnds, now - s.sessionStart, s.gotText);
    const next = onSessionEnd({ wanted: s.wanted, error: s.error, quickEnds: s.quickEnds, silentMs: now - s.lastTextAt });
    if (next === 'finish') return finish();
    if (next === 'restart') {
      // A short gap so the browser has fully released the previous session.
      s.timer = window.setTimeout(() => {
        if (s.alive && s.wanted && !s.finished) begin();
      }, 150);
      return;
    }
    // Pause: keep the transcript; the learner can continue or evaluate.
    closeSegment();
    s.wanted = false;
    setError(s.error && s.error !== 'no-speech' && s.error !== 'aborted' ? s.error : 'silent');
    setStatus('paused');
    props.current.mic.claim(false);
  };

  const begin = () => {
    const me = ++s.gen;
    s.sessionStart = Date.now();
    s.current = '';
    s.error = null;
    s.gotText = false;
    const stopFn = listen({
      continuous: true,
      onText: (t) => {
        if (me !== s.gen || t === s.current) return;
        s.current = t;
        s.gotText = true;
        s.lastTextAt = Date.now();
        setText(joinTranscript(s.committed, t));
      },
      onError: (code) => {
        if (me === s.gen) s.error = code;
      },
      onEnd: () => {
        if (me === s.gen && s.alive && !s.finished) sessionEnded();
      },
    });
    if (me === s.gen) s.stopFn = stopFn;
  };

  /** Must run inside the tap: browsers only open the microphone from a user gesture. */
  const start = (fresh: boolean) => {
    if (props.current.mic.busy) return;
    stopTts(); // never transcribe our own speech output
    ackPrivacy();
    clearTimer();
    if (fresh) {
      s.committed = '';
      s.current = '';
      s.activeMs = 0;
      setText('');
      setResult(null);
    }
    s.finished = false;
    s.wanted = true;
    s.quickEnds = 0;
    s.lastTextAt = Date.now();
    s.segStart = Date.now();
    s.segOpen = true;
    setElapsed(s.activeMs);
    setError(null);
    setStatus('listening');
    props.current.mic.claim(true);
    begin();
  };

  const stopPressed = () => {
    if (status === 'paused') return finish();
    s.wanted = false;
    const f = s.stopFn;
    s.stopFn = null;
    clearTimer();
    if (!f) return finish(); // between two sessions
    f(); // onEnd follows and finishes
    // Some browsers never send "end" after stop(): finish anyway.
    s.timer = window.setTimeout(() => s.alive && finish(), 1500);
  };

  // Always release the microphone when leaving the screen.
  useEffect(() => {
    s.alive = true;
    return () => {
      s.alive = false;
      s.wanted = false;
      s.gen++;
      window.clearTimeout(s.timer);
      try {
        s.stopFn?.();
      } catch {
        /* already stopped */
      }
      s.stopFn = null;
      props.current.mic.claim(false);
    };
  }, [s]);

  useEffect(() => {
    if (status !== 'listening') return;
    const id = window.setInterval(() => setElapsed(s.activeMs + (Date.now() - s.segStart)), 500);
    return () => window.clearInterval(id);
  }, [status, s]);

  const band = result ? paceBand(result.wpm, result.words) : null;
  const tip = result ? fillerTip(result.fillers, result.words) : null;
  const suggestions = result ? suggestPhrases(part, result.used, groups) : [];
  const busy = mic.busy && status !== 'listening';

  return (
    <div className="card stack">
      <h2 style={{ margin: 0 }}>🎙️ {tr(S.title, lang)}</h2>
      <p className="muted small" style={{ margin: 0 }}>
        {tr(S.intro, lang)}
      </p>
      <SpeechPrivacyNote lang={lang} ok={privacyOk} onOk={ackPrivacy} />
      {busy && <MicBusyNote lang={lang} />}

      {status === 'paused' && (
        <div className="verdict bad">
          <div className="head">{tr(S.paused, lang)}</div>
          <div className="body">{error === 'silent' ? tr(S.silent, lang) : tr(speechErrorText(error ?? ''), lang)}</div>
        </div>
      )}

      <div className="row wrap">
        {status === 'listening' ? (
          <button type="button" className="btn danger" onClick={stopPressed}>
            ■ {tr(S.stop, lang)}
          </button>
        ) : status === 'paused' ? (
          <>
            <button type="button" className="btn primary" disabled={busy} onClick={() => start(false)}>
              ▶ {tr(S.resume, lang)}
            </button>
            <button type="button" className="btn" onClick={stopPressed}>
              ■ {tr(S.evaluate, lang)}
            </button>
          </>
        ) : (
          <button type="button" className="btn primary" disabled={busy} onClick={() => start(true)}>
            🎙️ {tr(status === 'done' ? S.again : S.start, lang)}
          </button>
        )}
        {(status === 'listening' || status === 'paused') && (
          <span className={`clock ${status === 'listening' ? 'urgent' : ''}`}>
            {status === 'listening' && <span className="rec-dot" aria-hidden="true" />} {formatClock(elapsed)}
          </span>
        )}
      </div>

      {(status !== 'idle' || text) && (
        <div
          aria-live="polite"
          style={{
            padding: '10px 12px',
            borderRadius: 10,
            background: 'var(--surface-2)',
            minHeight: 48,
            lineHeight: 1.55,
            maxHeight: 220,
            overflowY: 'auto',
          }}
        >
          {text || <span className="muted small">{status === 'listening' ? tr(S.waiting, lang) : '–'}</span>}
        </div>
      )}

      {status === 'done' && result && result.words === 0 && <p className="muted" style={{ margin: 0 }}>{tr(S.nothing, lang)}</p>}

      {status === 'done' && result && result.words > 0 && (
        <>
          <div className="statgrid">
            <div className="stat">
              <div className="n">{result.words}</div>
              <div className="l">{tr(S.words, lang)}</div>
            </div>
            <div className="stat">
              <div className="n">
                {result.wpm}{' '}
                {band && <span className={`badge ${band === 'gut' ? 'good' : ''}`}>{tr(PACE_TEXT[band].label, lang)}</span>}
              </div>
              <div className="l">
                {tr(S.wpm, lang)} · {tr(S.target, lang).replace('{a}', String(PACE_MIN)).replace('{b}', String(PACE_MAX))}
              </div>
            </div>
            <div className="stat">
              <div className="n">{result.fillers}</div>
              <div className="l">{tr(S.fillers, lang)}</div>
            </div>
            <div className="stat">
              <div className="n">{result.used.length}</div>
              <div className="l">{tr(S.phrases, lang)}</div>
            </div>
          </div>
          {band && <p className="small" style={{ margin: 0 }}>{tr(PACE_TEXT[band].tip, lang)}</p>}
          {result.ms < 60_000 && <p className="muted small" style={{ margin: 0 }}>{tr(S.short, lang)}</p>}
          {tip && <p className="small" style={{ margin: 0 }}>{tr(tip, lang)}</p>}
          <p className="muted small" style={{ margin: 0 }}>
            {tr(S.fillerNote, lang)}
          </p>
          <div>
            <strong className="small">{tr(S.used, lang)}</strong>
            {result.used.length === 0 ? (
              <p className="muted small" style={{ margin: '4px 0 0' }}>
                {tr(S.noneUsed, lang)}
              </p>
            ) : (
              <ul className="ticks">
                {result.used.map((p) => (
                  <li key={p}>
                    <span className="good">✓</span> {p}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {suggestions.length > 0 && (
            <div className="phrases">
              <strong className="small">{tr(S.tryNext, lang)}:</strong>
              <ul>
                {suggestions.map((p) => (
                  <li key={p.phrase}>
                    <span className="de">{p.phrase}</span>
                    <span className="en muted small">
                      {tr(p.group, lang)} · {p.en}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
