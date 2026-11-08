// Neurofeedback mode (test phase): "Nachsprechen" – listen to a model line, say it, see which words were understood.
import { useEffect, useRef, useState } from 'react';
import type { Line } from '../../content/types.ts';
import type { Lang, Text2 } from '../../types.ts';
import { logError, track } from '../../lib/analytics.ts';
import { tr } from '../../lib/i18n.ts';
import { speechMatch, type SpeechMatch } from '../../lib/neuro.ts';
import { noteSpeech } from '../../lib/neuroLog.ts';
import { listen, speechErrorText } from '../../lib/speech.ts';
import { speakLines, stop as stopTts } from '../../lib/tts.ts';
import { MicBusyNote, SpeechPrivacyNote, usePrivacyAck, type MicLock } from './NfShared.tsx';
import { dialogueScore, percent, repeatTimeoutMs } from './nf.ts';
import type { SprechenPart } from './score.ts';

const S = {
  intro: {
    de: 'Wählen Sie eine Rolle. Hören Sie jede Zeile an (▶︎) und sprechen Sie sie dann nach (🎙️). Grün = verstanden, rot = nicht verstanden.',
    en: 'Choose a role. Listen to each line (▶︎), then say it after the model (🎙️). Green = understood, red = not understood.',
  },
  iAm: { de: 'Ich bin', en: 'I am' },
  listen: { de: 'Anhören', en: 'Listen' },
  say: { de: 'Nachsprechen', en: 'Say it' },
  again: { de: 'Noch einmal', en: 'Again' },
  done: { de: 'Fertig', en: 'Done' },
  speakNow: { de: 'Jetzt sprechen …', en: 'Speak now …' },
  progress: { de: '{n} von {m} Zeilen', en: '{n} of {m} lines' },
  total: { de: 'Gesamtergebnis', en: 'Total score' },
  totalHint: {
    de: 'Anteil der Wörter, die die Spracherkennung verstanden hat. Rote Wörter noch einmal langsam und deutlich üben.',
    en: 'Share of the words speech recognition understood. Practise the red words again slowly and clearly.',
  },
  restart: { de: 'Von vorn', en: 'Start over' },
} satisfies Record<string, Text2>;

type Active = { i: number; phase: 'speaking' | 'listening' } | null;

export function RepeatMode({
  lang,
  model,
  audio,
  part,
  mic,
  roleLabels,
}: {
  lang: Lang;
  model: Line[];
  audio: boolean;
  part: SprechenPart;
  mic: MicLock;
  roleLabels: Record<Line['voice'], Text2>;
}) {
  const [privacyOk, ackPrivacy] = usePrivacyAck();
  const [role, setRole] = useState<'a' | 'b'>('a');
  const [results, setResults] = useState<Record<number, SpeechMatch>>({});
  const [active, setActive] = useState<Active>(null);
  const [heard, setHeard] = useState('');
  const [error, setError] = useState<{ i: number; code: string } | null>(null);

  const r = useRef({
    alive: true,
    gen: 0,
    stopFn: null as (() => void) | null,
    end: null as (() => void) | null,
    heard: '',
    timers: [] as number[],
    tracked: false,
  }).current;
  const micRef = useRef(mic);
  micRef.current = mic;

  const clearTimers = () => {
    r.timers.forEach((t) => window.clearTimeout(t));
    r.timers = [];
  };
  const later = (fn: () => void, ms: number) => r.timers.push(window.setTimeout(fn, ms));

  /** Ends whatever runs (speech output or recognition) without scoring it. */
  const halt = () => {
    r.gen++;
    clearTimers();
    stopTts();
    const f = r.stopFn;
    r.stopFn = null;
    r.end = null;
    if (f) {
      try {
        f();
      } catch {
        /* already stopped */
      }
      micRef.current.claim(false);
    }
    setActive(null);
  };

  useEffect(() => {
    r.alive = true;
    return () => {
      r.alive = false;
      r.gen++;
      clearTimers();
      stopTts();
      try {
        r.stopFn?.();
      } catch {
        /* already stopped */
      }
      r.stopFn = null;
      micRef.current.claim(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [r]);

  const play = (i: number) => {
    halt();
    const me = r.gen;
    setActive({ i, phase: 'speaking' });
    speakLines([model[i]])
      .catch((e) => logError(e, 'sprechen.nf_repeat.play'))
      .finally(() => {
        if (r.alive && me === r.gen) setActive(null);
      });
  };

  /** Stops listening; the "end" event (or a fallback) then scores the line. */
  const finishListening = () => {
    const f = r.stopFn;
    r.stopFn = null;
    try {
      f?.();
    } catch {
      /* already stopped */
    }
    const end = r.end;
    later(() => end?.(), 1500);
  };

  /** Must run inside the tap: browsers only open the microphone from a user gesture. */
  const say = (i: number) => {
    if (micRef.current.busy) return;
    halt(); // speech output must not overlap recognition
    ackPrivacy();
    const me = r.gen;
    const line = model[i];
    r.heard = '';
    setHeard('');
    setError(null);
    setActive({ i, phase: 'listening' });
    micRef.current.claim(true);
    let code: string | null = null;
    let ended = false;
    const end = () => {
      if (ended || me !== r.gen || !r.alive) return;
      ended = true;
      clearTimers();
      r.stopFn = null;
      r.end = null;
      micRef.current.claim(false);
      setActive(null);
      if (!r.heard.trim()) {
        setError({ i, code: code ?? 'no-speech' });
        return;
      }
      const m = speechMatch(line.text, r.heard);
      setResults((prev) => ({ ...prev, [i]: m }));
      noteSpeech(m.score);
    };
    r.end = end;
    let silence = 0;
    r.stopFn = listen({
      continuous: true,
      onText: (t) => {
        if (me !== r.gen) return;
        r.heard = t;
        setHeard(t);
        // Stop after a pause, sooner once every word was heard.
        window.clearTimeout(silence);
        const complete = speechMatch(line.text, t).score === 1;
        silence = window.setTimeout(() => me === r.gen && finishListening(), complete ? 700 : 2200);
        r.timers.push(silence);
      },
      onError: (c) => {
        code = c;
      },
      onEnd: end,
    });
    later(() => me === r.gen && finishListening(), repeatTimeoutMs(line.text));
  };

  const mine = model.map((l, i) => (l.voice === role ? i : -1)).filter((i) => i >= 0);
  const doneCount = mine.filter((i) => results[i]).length;
  const complete = mine.length > 0 && doneCount === mine.length;
  const total = dialogueScore(mine.map((i) => results[i]));

  useEffect(() => {
    if (!complete || r.tracked) return;
    r.tracked = true;
    track('sprechen.nf_repeat', { teil: part, score: percent(total) });
  }, [complete, total, part, r]);

  const reset = () => {
    halt();
    setResults({});
    setError(null);
    r.tracked = false;
  };

  const busy = mic.busy && active?.phase !== 'listening';

  return (
    <div className="stack">
      <p className="muted small" style={{ margin: 0 }}>
        {tr(S.intro, lang)}
      </p>
      <SpeechPrivacyNote lang={lang} ok={privacyOk} onOk={ackPrivacy} />
      {busy && <MicBusyNote lang={lang} />}
      <div className="row wrap">
        <span className="small">{tr(S.iAm, lang)}:</span>
        {(['a', 'b'] as const).map((x) => (
          <button
            key={x}
            type="button"
            className="chip"
            aria-pressed={role === x}
            onClick={() => {
              reset();
              setRole(x);
            }}
          >
            {tr(roleLabels[x], lang)}
          </button>
        ))}
        <span className="spacer" />
        <span className="badge">{tr(S.progress, lang).replace('{n}', String(doneCount)).replace('{m}', String(mine.length))}</span>
      </div>
      <ol className="dialogue">
        {model.map((line, i) => {
          const isMine = line.voice === role;
          const res = results[i];
          const here = active?.i === i ? active.phase : null;
          return (
            <li key={i} className={`voice-${line.voice} ${isMine ? 'mine' : ''} ${here ? 'current' : ''}`}>
              <span className="who">{tr(roleLabels[line.voice], lang)}</span>
              <span className={`text ${isMine ? '' : 'muted'}`}>
                {line.text}
                {isMine && (
                  <span className="stack" style={{ display: 'grid', gap: 6, marginTop: 6 }}>
                    <span className="row wrap" style={{ gap: 6 }}>
                      {audio && (
                        <button type="button" className="btn small" disabled={here === 'listening'} onClick={() => play(i)}>
                          ▶︎ {tr(S.listen, lang)}
                        </button>
                      )}
                      {here === 'listening' ? (
                        <button type="button" className="btn small danger" onClick={finishListening}>
                          ■ {tr(S.done, lang)}
                        </button>
                      ) : (
                        <button type="button" className="btn small primary" disabled={busy} onClick={() => say(i)}>
                          🎙️ {tr(res ? S.again : S.say, lang)}
                        </button>
                      )}
                      {res && <span className={`badge ${res.score >= 0.8 ? 'good' : res.score < 0.5 ? 'bad' : ''}`}>{percent(res.score)} %</span>}
                    </span>
                    {here === 'listening' && <span className="small muted">{heard || tr(S.speakNow, lang)}</span>}
                    {res && here !== 'listening' && (
                      <span className="small">
                        {res.words.map((w, k) => (
                          <span key={k} className={w.heard ? 'good' : 'bad'} style={w.heard ? undefined : { textDecoration: 'underline' }}>
                            {w.word}{' '}
                          </span>
                        ))}
                      </span>
                    )}
                    {error?.i === i && here !== 'listening' && <span className="small bad">{tr(speechErrorText(error.code), lang)}</span>}
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ol>
      {complete && (
        <div className={`verdict ${total >= 0.7 ? 'good' : 'bad'}`}>
          <div className="head">
            {tr(S.total, lang)}: {percent(total)} %
          </div>
          <div className="body">{tr(S.totalHint, lang)}</div>
        </div>
      )}
      {doneCount > 0 && (
        <button type="button" className="btn small ghost" style={{ justifySelf: 'start' }} onClick={reset}>
          ↺ {tr(S.restart, lang)}
        </button>
      )}
    </div>
  );
}
