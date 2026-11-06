import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Line } from '../../content/types.ts';
import type { Lang, Text2 } from '../../types.ts';
import { Confirm } from '../../components/Confirm.tsx';
import { logError, track } from '../../lib/analytics.ts';
import { tr } from '../../lib/i18n.ts';
import { recordItem, recordResult, useSection } from '../../lib/storage.ts';
import { speak, speakLines, stop, ttsAvailable, voicesReady } from '../../lib/tts.ts';
import { formatClock, useCountdown } from '../../lib/useCountdown.ts';
import {
  HOEREN_MAX_POINTS,
  HOEREN_READING_SECONDS,
  examPlan,
  hoerenEntries,
  hoerenExamPart,
  hoerenItemId,
  instruction,
  numberWord,
  relevantLines,
  rfChoiceIndex,
  scoreHoeren,
  spokenInstruction,
  type HoerenPart,
  type HoerenSet,
  type RfAnswer,
  type Segment,
} from './score.ts';
import { Transcript } from './Transcript.tsx';

type Phase = 'start' | 'reading' | 'playing' | 'answer' | 'results';
export interface HoerenSettings {
  /** Lernmodus: replay, transcript, per-line replay. */
  learn: boolean;
  /** Slower speech (0.8). */
  slow: boolean;
}
export const DEFAULT_SETTINGS: HoerenSettings = { learn: false, slow: false };

/** Exam numbering of the statements: Teil 1 41–45, Teil 2 46–55, Teil 3 56–60. */
const FIRST_NUMBER: Record<HoerenPart, number> = { 1: 41, 2: 46, 3: 56 };

const S = {
  start: { de: 'Start', en: 'Start' },
  reading: { de: 'Lesezeit', en: 'Reading time' },
  skip: { de: 'Überspringen', en: 'Skip' },
  playing: { de: 'Hören läuft …', en: 'Playing …' },
  stopAudio: { de: 'Stopp', en: 'Stop' },
  submit: { de: 'Abgeben', en: 'Submit' },
  again: { de: 'Noch einmal üben', en: 'Practise again' },
  back: { de: 'Zur Übersicht', en: 'Back to the list' },
  richtig: { de: 'richtig', en: 'true' },
  falsch: { de: 'falsch', en: 'false' },
  learn: { de: 'Lernmodus', en: 'Learning mode' },
  learnHint: {
    de: 'Wiederholen, Text anzeigen und Zeilen einzeln hören. Im Prüfungsmodus hören Sie wie in der Prüfung: Teil 1 einmal, Teil 2 und 3 zweimal, ohne Text.',
    en: 'Replay, show the text and play single lines. Exam mode works like the exam: part 1 once, parts 2 and 3 twice, no text.',
  },
  slow: { de: 'Langsamer sprechen (0,8)', en: 'Slower speech (0.8)' },
  replayAll: { de: 'Alles noch einmal hören', en: 'Play everything again' },
  showText: { de: 'Text anzeigen', en: 'Show text' },
  hideText: { de: 'Text ausblenden', en: 'Hide text' },
  done: { de: 'Hören beendet. Prüfen Sie Ihre Antworten und geben Sie ab.', en: 'Listening finished. Check your answers and submit.' },
  unanswered: {
    de: 'Nicht alle Aussagen sind beantwortet. Trotzdem abgeben?',
    en: 'Not all statements are answered. Submit anyway?',
  },
  noVoice: {
    de: 'Auf diesem Gerät gibt es keine deutsche Stimme für die Sprachausgabe. Sie können die Texte stattdessen lesen. Tipp: Installieren Sie in den Systemeinstellungen eine deutsche Stimme (Sprachausgabe / Text-to-Speech).',
    en: 'This device has no German text-to-speech voice. You can read the texts instead. Tip: install a German voice in your system settings (text-to-speech).',
  },
  noTts: {
    de: 'Dieser Browser unterstützt keine Sprachausgabe. Sie können die Texte stattdessen lesen.',
    en: 'This browser does not support speech output. You can read the texts instead.',
  },
  readInstead: { de: 'Texte lesen statt hören', en: 'Read the texts instead' },
  checking: { de: 'Stimmen werden geladen …', en: 'Loading voices …' },
  yourAnswer: { de: 'Ihre Antwort', en: 'Your answer' },
  noAnswer: { de: 'keine', en: 'none' },
  solution: { de: 'Lösung', en: 'Solution' },
  transcript: { de: 'Transkript', en: 'Transcript' },
  points: { de: 'Punkte', en: 'points' },
  passHint: {
    de: 'Zum Bestehen der schriftlichen Prüfung brauchen Sie insgesamt 60 % der Punkte.',
    en: 'To pass the written exam you need 60 % of the points overall.',
  },
  ttsNote: {
    de: 'Die Texte liest die Sprachausgabe Ihres Geräts vor. Die Qualität hängt vom Gerät ab.',
    en: 'Your device’s speech output reads the texts. Quality depends on the device.',
  },
} satisfies Record<string, Text2>;

/** Waits `ms`, or less if `cancelled()` turns true. */
function wait(ms: number, cancelled: () => boolean): Promise<void> {
  return new Promise((resolve) => {
    const started = Date.now();
    const tick = () => {
      if (cancelled() || Date.now() - started >= ms) resolve();
      else setTimeout(tick, 200);
    };
    tick();
  });
}

function ReadingClock({ seconds, onDone, lang }: { seconds: number; onDone: () => void; lang: Lang }) {
  const left = useCountdown(seconds * 1000, true, onDone);
  return (
    <span className={`clock ${left <= 10_000 ? 'urgent' : ''}`} aria-label={tr(S.reading, lang)}>
      {formatClock(left)}
    </span>
  );
}

export function Player({ lang, part, set, onBack }: { lang: Lang; part: HoerenPart; set: HoerenSet; onBack: () => void }) {
  const [settings, setSettings] = useSection<HoerenSettings>('hoeren', DEFAULT_SETTINGS);
  const entries = useMemo(() => hoerenEntries(part, set), [part, set]);
  const [answers, setAnswers] = useState<RfAnswer[]>(() => entries.map(() => null));
  const [phase, setPhase] = useState<Phase>('start');
  const [voice, setVoice] = useState<'checking' | 'ok' | 'none'>(() => (ttsAvailable() ? 'checking' : 'none'));
  const [nowLabel, setNowLabel] = useState<Text2 | null>(null);
  const [playing, setPlaying] = useState(false);
  const [showText, setShowText] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const run = useRef(0);
  const learn = settings.learn;
  const rate = learn && settings.slow ? 0.8 : 0.95;
  const audio = voice === 'ok';

  useEffect(() => {
    if (!ttsAvailable()) return;
    let alive = true;
    voicesReady()
      .then((v) => alive && setVoice(v.length > 0 ? 'ok' : 'none'))
      .catch((e) => {
        logError(e, 'hoeren.voicesReady');
        if (alive) setVoice('none');
      });
    return () => {
      alive = false;
    };
  }, []);

  // Leaving the screen stops any speech.
  useEffect(
    () => () => {
      run.current++;
      stop();
    },
    [],
  );

  const cancel = useCallback(() => {
    run.current++;
    stop();
    setPlaying(false);
    setNowLabel(null);
  }, []);

  /** Plays segments in order. Resolves true if it ran to the end. */
  const play = useCallback(
    async (segments: Segment[]): Promise<boolean> => {
      const mine = ++run.current;
      const cancelled = () => run.current !== mine;
      setPlaying(true);
      try {
        for (const seg of segments) {
          if (cancelled()) return false;
          setNowLabel(seg.label);
          if (seg.kind === 'pause') await wait(seg.ms, cancelled);
          else await speakLines(seg.lines, { rate });
        }
        return !cancelled();
      } catch (e) {
        logError(e, 'hoeren.play');
        return false;
      } finally {
        if (!cancelled()) {
          setPlaying(false);
          setNowLabel(null);
        }
      }
    },
    [rate],
  );

  const playLine = useCallback(
    (line: Line) => {
      void play([{ kind: 'speak', lines: [line], label: { de: '…', en: '…' }, pass: 1 }]);
    },
    [play],
  );

  const begin = () => {
    setStartedAt(Date.now());
    if (!audio) {
      setShowText(true);
      setPhase('answer');
      return;
    }
    setPhase('reading');
    // Spoken in the click handler, which also unlocks speech on iOS.
    speak(spokenInstruction(part), { rate }).catch((e) => logError(e, 'hoeren.instruction'));
  };

  const startListening = useCallback(async () => {
    stop();
    setPhase('playing');
    const finished = await play(examPlan(part, set));
    if (finished) setPhase('answer');
  }, [play, part, set]);

  const stopPlaying = () => {
    cancel();
    if (phase === 'playing') setPhase('answer');
  };

  const replayAll = () => {
    const segments: Segment[] =
      part === 2
        ? [{ kind: 'speak', lines: entries[0].script, label: { de: 'Gespräch', en: 'Conversation' }, pass: 1 }]
        : entries.map((e, i) => ({
            kind: 'speak' as const,
            lines: [{ voice: 'n' as const, text: `Nummer ${numberWord(i + 1)}.` }, ...e.script],
            label: { de: `Text ${i + 1}`, en: `Text ${i + 1}` },
            item: i,
            pass: 1 as const,
          }));
    void play(segments);
  };

  const replayItem = (i: number) =>
    void play([{ kind: 'speak', lines: entries[i].script, label: { de: `Text ${i + 1}`, en: `Text ${i + 1}` }, item: i, pass: 1 }]);

  const choose = (i: number, value: boolean) => setAnswers((prev) => prev.map((a, k) => (k === i ? value : a)));

  const submit = () => {
    setConfirm(false);
    cancel();
    const s = scoreHoeren(part, set, answers);
    entries.forEach((_, i) => recordItem(hoerenItemId(part, set.id, i), s.perItem[i], rfChoiceIndex(answers[i])));
    recordResult({
      section: 'hoeren',
      part: hoerenExamPart(part),
      setId: set.id,
      correct: s.correct,
      total: s.total,
      points: s.points,
      maxPoints: s.maxPoints,
      startedAt,
      finishedAt: Date.now(),
    });
    track('hoeren.set_finished', {
      part,
      setId: set.id,
      correct: s.correct,
      total: s.total,
      learn,
      slow: settings.slow,
      audio,
    });
    setPhase('results');
    window.scrollTo?.({ top: 0 });
  };

  const askSubmit = () => (answers.some((a) => a === null || a === undefined) ? setConfirm(true) : submit());

  const restart = () => {
    cancel();
    setAnswers(entries.map(() => null));
    setShowText(false);
    setPhase('start');
    window.scrollTo?.({ top: 0 });
  };

  /* ------------------------------------------------------------ render */

  const score = phase === 'results' ? scoreHoeren(part, set, answers) : null;
  const first = FIRST_NUMBER[part];
  const canPractise = learn || !audio;

  const statementList = (
    <div className="stack">
      {entries.map((e, i) => {
        const chosen = answers[i];
        const ok = score?.perItem[i];
        const optClass = (value: boolean) => {
          if (!score) return chosen === value ? 'option selected' : 'option';
          if (e.item.answer === value) return 'option correct';
          return chosen === value ? 'option incorrect' : 'option';
        };
        const highlight = new Set(relevantLines(e.script, e.item.explanation));
        return (
          <div key={i} className={`card rf ${score ? (ok ? 'ok' : 'no') : ''}`}>
            <div className="rf-head">
              <span className="num">{first + i}</span>
              <span className="statement">{e.item.statement}</span>
              {part !== 2 && audio && (phase === 'results' || (phase === 'answer' && canPractise)) && (
                <button type="button" className="btn small ghost" onClick={() => replayItem(i)} aria-label={`Text ${i + 1} ▶`}>
                  ▶
                </button>
              )}
            </div>
            <div className="rf-options">
              {([true, false] as const).map((value) => (
                <button
                  key={String(value)}
                  type="button"
                  className={optClass(value)}
                  disabled={!!score || phase === 'start'}
                  aria-pressed={chosen === value}
                  onClick={() => choose(i, value)}
                >
                  <span className="key">{value ? '+' : '–'}</span>
                  <span className="body">{tr(value ? S.richtig : S.falsch, lang)}</span>
                </button>
              ))}
            </div>
            {score && (
              <div className={`verdict ${ok ? 'good' : 'bad'}`}>
                <div className="head">
                  {tr(S.yourAnswer, lang)}: {chosen == null ? tr(S.noAnswer, lang) : tr(chosen ? S.richtig : S.falsch, lang)} ·{' '}
                  {tr(S.solution, lang)}: {tr(e.item.answer ? S.richtig : S.falsch, lang)}
                </div>
                <div className="body">{e.item.explanation[lang]}</div>
                {lang === 'en' && <div className="body muted small">{e.item.explanation.de}</div>}
              </div>
            )}
            {score && part !== 2 && (
              <details className="tx" open={!ok}>
                <summary>{tr(S.transcript, lang)}</summary>
                <Transcript lines={e.script} lang={lang} highlight={highlight} onPlay={audio ? playLine : undefined} />
              </details>
            )}
            {!score && showText && part !== 2 && (
              <Transcript lines={e.script} lang={lang} onPlay={audio ? playLine : undefined} />
            )}
          </div>
        );
      })}
    </div>
  );

  // Teil 2: one transcript, lines marked with the statement numbers they answer.
  const conversation = part === 2 ? entries[0].script : null;
  const marks = useMemo(() => {
    const m = new Map<number, number[]>();
    if (part !== 2) return m;
    entries.forEach((e, i) =>
      relevantLines(e.script, e.item.explanation).forEach((line) => m.set(line, [...(m.get(line) ?? []), first + i])),
    );
    return m;
  }, [entries, part, first]);
  const wrongLines = useMemo(() => {
    const set = new Set<number>();
    if (part !== 2 || !score) return set;
    entries.forEach((e, i) => !score.perItem[i] && relevantLines(e.script, e.item.explanation).forEach((l) => set.add(l)));
    return set;
  }, [entries, part, score]);

  return (
    <div className="hoeren">
      {phase !== 'results' && (
        <div className="card stack">
          <p style={{ margin: 0 }}>{tr(instruction(part), lang)}</p>
          {audio && (
            <p className="muted small" style={{ margin: 0 }}>
              {tr(S.ttsNote, lang)}
            </p>
          )}
          {voice === 'checking' && <p className="muted small">{tr(S.checking, lang)}</p>}
          {voice === 'none' && (
            <div className="verdict bad">
              <div className="body">{tr(ttsAvailable() ? S.noVoice : S.noTts, lang)}</div>
            </div>
          )}
          <div className="row wrap">
            <label className="toggle">
              <input
                type="checkbox"
                checked={learn}
                onChange={(e) => {
                  const on = e.target.checked;
                  setSettings((s) => ({ ...s, learn: on }));
                  if (!on && audio) setShowText(false);
                }}
              />{' '}
              {tr(S.learn, lang)}
            </label>
            {learn && audio && (
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={settings.slow}
                  onChange={(e) => {
                    const on = e.target.checked;
                    setSettings((s) => ({ ...s, slow: on }));
                  }}
                />{' '}
                {tr(S.slow, lang)}
              </label>
            )}
          </div>
          <p className="muted small" style={{ margin: 0 }}>
            {tr(S.learnHint, lang)}
          </p>

          {phase === 'start' && (
            <div className="row wrap">
              <button type="button" className="btn primary" onClick={begin} disabled={voice === 'checking'}>
                {audio ? `▶ ${tr(S.start, lang)}` : tr(S.readInstead, lang)}
              </button>
            </div>
          )}
          {phase === 'reading' && (
            <div className="exambar">
              <span>{tr(S.reading, lang)}</span>
              <ReadingClock seconds={HOEREN_READING_SECONDS[part]} onDone={startListening} lang={lang} />
              <span className="spacer" />
              <button type="button" className="btn small" onClick={startListening}>
                {tr(S.skip, lang)} ⏭
              </button>
            </div>
          )}
          {phase === 'playing' && (
            <div className="exambar">
              <span className="pulse" aria-hidden="true">
                🔊
              </span>
              <span>
                {tr(S.playing, lang)} {nowLabel ? `· ${tr(nowLabel, lang)}` : ''}
              </span>
              <span className="spacer" />
              {learn && (
                <button type="button" className="btn small" onClick={stopPlaying}>
                  ■ {tr(S.stopAudio, lang)}
                </button>
              )}
            </div>
          )}
          {phase === 'answer' && (
            <>
              {audio && <p style={{ margin: 0 }}>{tr(S.done, lang)}</p>}
              {canPractise && (
                <div className="row wrap">
                  {audio &&
                    (playing ? (
                      <button type="button" className="btn small" onClick={cancel}>
                        ■ {tr(S.stopAudio, lang)}
                      </button>
                    ) : (
                      <button type="button" className="btn small" onClick={replayAll}>
                        ↺ {tr(S.replayAll, lang)}
                      </button>
                    ))}
                  <button type="button" className="btn small ghost" onClick={() => setShowText((v) => !v)}>
                    {tr(showText ? S.hideText : S.showText, lang)}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {score && (
        <div className="card center" style={{ marginBottom: 12 }}>
          <div className="score">
            {score.correct}/{score.total}
          </div>
          <div>
            {String(score.points).replace('.', lang === 'de' ? ',' : '.')} / {HOEREN_MAX_POINTS} {tr(S.points, lang)}{' '}
            <span className={`badge ${score.points >= HOEREN_MAX_POINTS * 0.6 ? 'good' : 'bad'}`}>
              {Math.round((score.points / HOEREN_MAX_POINTS) * 100)} %
            </span>
          </div>
          <p className="muted small">{tr(S.passHint, lang)}</p>
          <div className="row wrap" style={{ justifyContent: 'center' }}>
            <button type="button" className="btn primary" onClick={restart}>
              ↺ {tr(S.again, lang)}
            </button>
            <button type="button" className="btn" onClick={onBack}>
              {tr(S.back, lang)}
            </button>
          </div>
        </div>
      )}

      <div style={{ marginTop: 12 }}>{statementList}</div>

      {conversation && (score || (showText && canPractise)) && (
        <div className="card" style={{ marginTop: 12 }}>
          <h2 style={{ marginTop: 0 }}>{tr(S.transcript, lang)}</h2>
          <Transcript
            lines={conversation}
            lang={lang}
            highlight={score ? wrongLines.size > 0 ? wrongLines : new Set(marks.keys()) : undefined}
            marks={score ? marks : undefined}
            onPlay={audio ? playLine : undefined}
          />
        </div>
      )}

      {phase !== 'results' && phase !== 'start' && (
        <div className="sticky-actions">
          <button type="button" className="btn primary block" onClick={askSubmit}>
            {tr(S.submit, lang)}
          </button>
        </div>
      )}

      {confirm && <Confirm message={tr(S.unanswered, lang)} lang={lang} onConfirm={submit} onCancel={() => setConfirm(false)} />}
    </div>
  );
}
