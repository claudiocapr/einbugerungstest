import { useEffect, useRef, useState } from 'react';
import type { Line } from '../../content/types.ts';
import type { Lang, Text2 } from '../../types.ts';
import { logError } from '../../lib/analytics.ts';
import { tr } from '../../lib/i18n.ts';
import { speakLines, stop, ttsAvailable, voicesReady } from '../../lib/tts.ts';

const S = {
  title: { de: 'Mustergespräch', en: 'Model conversation' },
  read: { de: 'Lesen und anhören', en: 'Read and listen' },
  partner: { de: 'Mit Partner üben', en: 'Practise with a partner' },
  playAll: { de: 'Ganzes Gespräch anhören', en: 'Play the whole conversation' },
  stop: { de: 'Stopp', en: 'Stop' },
  partnerIntro: {
    de: 'Wählen Sie Ihre Rolle. Die Sprachausgabe spricht die anderen Rollen. Wenn Sie dran sind, sprechen Sie Ihren Teil laut (gern mit eigenen Worten) und tippen dann auf „Weiter“.',
    en: 'Choose your role. Speech output reads the other roles. When it is your turn, say your part aloud (in your own words is fine), then tap "Next".',
  },
  partnerNoAudio: {
    de: 'Ohne Sprachausgabe: Lesen Sie die Zeilen der anderen still und sprechen Sie Ihre eigenen laut.',
    en: 'Without speech output: read the other lines silently and say your own lines aloud.',
  },
  iAm: { de: 'Ich bin', en: 'I am' },
  yourTurn: { de: 'Sie sind dran!', en: 'Your turn!' },
  next: { de: 'Weiter', en: 'Next' },
  showMine: { de: 'Meinen Mustertext zeigen', en: 'Show my model line' },
  restart: { de: 'Von vorn', en: 'Start over' },
  done: { de: 'Gespräch beendet. Gut gemacht!', en: 'Conversation finished. Well done!' },
  start: { de: 'Starten', en: 'Start' },
} satisfies Record<string, Text2>;

export const ROLE_LABELS: Record<Line['voice'], Text2> = {
  a: { de: 'Teilnehmer/in A', en: 'Candidate A' },
  b: { de: 'Teilnehmer/in B', en: 'Candidate B' },
  n: { de: 'Prüfer/in', en: 'Examiner' },
};

function useAudio() {
  const [audio, setAudio] = useState(false);
  useEffect(() => {
    if (!ttsAvailable()) return;
    let alive = true;
    voicesReady()
      .then((v) => alive && setAudio(v.length > 0))
      .catch((e) => logError(e, 'sprechen.voicesReady'));
    return () => {
      alive = false;
    };
  }, []);
  return audio;
}

export function Dialogue({ lang, model }: { lang: Lang; model: Line[] }) {
  const audio = useAudio();
  const [mode, setMode] = useState<'read' | 'partner'>('read');
  const [playing, setPlaying] = useState(false);

  // Stop speech when switching mode or leaving.
  useEffect(() => () => stop(), [mode]);

  const playAll = async () => {
    setPlaying(true);
    try {
      await speakLines(model);
    } catch (e) {
      logError(e, 'sprechen.playAll');
    } finally {
      setPlaying(false);
    }
  };
  const halt = () => {
    stop();
    setPlaying(false);
  };

  return (
    <div className="card stack">
      <h2 style={{ margin: 0 }}>💬 {tr(S.title, lang)}</h2>
      <div className="chips" role="tablist">
        {(['read', 'partner'] as const).map((m) => (
          <button
            key={m}
            type="button"
            className="chip"
            role="tab"
            aria-pressed={mode === m}
            aria-selected={mode === m}
            onClick={() => {
              halt();
              setMode(m);
            }}
          >
            {tr(m === 'read' ? S.read : S.partner, lang)}
          </button>
        ))}
      </div>
      {mode === 'read' ? (
        <>
          {audio && (
            <div className="row wrap">
              {playing ? (
                <button type="button" className="btn small" onClick={halt}>
                  ■ {tr(S.stop, lang)}
                </button>
              ) : (
                <button type="button" className="btn small" onClick={playAll}>
                  ▶ {tr(S.playAll, lang)}
                </button>
              )}
            </div>
          )}
          <ol className="dialogue">
            {model.map((line, i) => (
              <li key={i} className={`voice-${line.voice}`}>
                <span className="who">{tr(ROLE_LABELS[line.voice], lang)}</span>
                <span className="text">{line.text}</span>
                {audio && (
                  <button
                    type="button"
                    className="btn small ghost play"
                    aria-label={lang === 'de' ? 'Zeile anhören' : 'Play line'}
                    onClick={() => {
                      setPlaying(false);
                      void speakLines([line]);
                    }}
                  >
                    ▶
                  </button>
                )}
              </li>
            ))}
          </ol>
        </>
      ) : (
        <PartnerMode lang={lang} model={model} audio={audio} />
      )}
    </div>
  );
}

function PartnerMode({ lang, model, audio }: { lang: Lang; model: Line[]; audio: boolean }) {
  const [role, setRole] = useState<'a' | 'b'>('a');
  const [idx, setIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const [showMine, setShowMine] = useState(true);
  // Speech started inside the click on "Start" (browsers such as iOS Safari
  // only allow speech that begins in a user gesture).
  const kicked = useRef<Promise<void> | null>(null);

  const current = model[idx];
  const finished = running && idx >= model.length;
  const myTurn = running && !!current && current.voice === role;

  // The partner's (and examiner's) lines are spoken, then the dialogue moves on.
  useEffect(() => {
    if (!running || !audio || !current || current.voice === role) return;
    let cancelled = false;
    const speaking = kicked.current ?? speakLines([current]);
    kicked.current = null;
    speaking
      .then(() => {
        if (!cancelled) setIdx((i) => i + 1);
      })
      .catch((e) => logError(e, 'sprechen.partner'));
    return () => {
      cancelled = true;
      stop();
    };
  }, [running, audio, current, role]);

  const reset = () => {
    stop();
    setRunning(false);
    setIdx(0);
  };

  return (
    <div className="stack">
      <p className="muted small" style={{ margin: 0 }}>
        {tr(S.partnerIntro, lang)} {!audio && tr(S.partnerNoAudio, lang)}
      </p>
      <div className="row wrap">
        <span className="small">{tr(S.iAm, lang)}:</span>
        {(['a', 'b'] as const).map((r) => (
          <button
            key={r}
            type="button"
            className="chip"
            aria-pressed={role === r}
            onClick={() => {
              reset();
              setRole(r);
            }}
          >
            {tr(ROLE_LABELS[r], lang)}
          </button>
        ))}
      </div>
      <label className="toggle">
        <input type="checkbox" checked={showMine} onChange={(e) => setShowMine(e.target.checked)} /> {tr(S.showMine, lang)}
      </label>
      {!running ? (
        <button
          type="button"
          className="btn primary"
          onClick={() => {
            if (audio && model[0] && model[0].voice !== role) kicked.current = speakLines([model[0]]);
            setRunning(true);
          }}
        >
          ▶ {tr(S.start, lang)}
        </button>
      ) : (
        <>
          <ol className="dialogue">
            {model.slice(0, Math.min(idx + 1, model.length)).map((line, i) => {
              const mine = line.voice === role;
              const hidden = mine && i === idx && !showMine;
              return (
                <li key={i} className={`voice-${line.voice} ${i === idx ? 'current' : ''} ${mine ? 'mine' : ''}`}>
                  <span className="who">{tr(ROLE_LABELS[line.voice], lang)}</span>
                  <span className="text">{hidden ? '…' : line.text}</span>
                </li>
              );
            })}
          </ol>
          {myTurn && (
            <div className="row wrap">
              <strong>{tr(S.yourTurn, lang)}</strong>
              <span className="spacer" />
              <button type="button" className="btn primary" onClick={() => setIdx((i) => i + 1)}>
                {tr(S.next, lang)} →
              </button>
            </div>
          )}
          {!myTurn && !finished && !audio && (
            <div className="row">
              <span className="spacer" />
              <button type="button" className="btn" onClick={() => setIdx((i) => i + 1)}>
                {tr(S.next, lang)} →
              </button>
            </div>
          )}
          {finished && <p className="good">{tr(S.done, lang)}</p>}
          <button type="button" className="btn small ghost" onClick={reset}>
            ↺ {tr(S.restart, lang)}
          </button>
        </>
      )}
    </div>
  );
}
