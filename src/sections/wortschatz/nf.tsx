// Neurofeedback mode (test phase) for Wortschatz: the React pieces shared by the
// flashcards and the article trainer. Only rendered while the flag is on.
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Lang, Text2 } from '../../types.ts';
import type { VocabEntry } from '../../content/types.ts';
import { type FocusSample, type FocusSignal, type SpeechMatch, focusState, speechMatch } from '../../lib/neuro.ts';
import { SPEECH_PRIVACY, listen, speechErrorText, speechRecognitionAvailable } from '../../lib/speech.ts';
import { noteSpeech } from '../../lib/neuroLog.ts';
import { logError, track } from '../../lib/analytics.ts';
import { tr } from '../../lib/i18n.ts';
import { FocusHint } from '../../components/FocusHint.tsx';
import {
  type Feedback,
  type FocusGate,
  FOCUS_GATE,
  type NfAnswer,
  formatSeconds,
  gateFocus,
  nfSummary,
  pct,
  shownWords,
  snoozeFocus,
  speechTarget,
} from './nfLogic.ts';
import { useWsSettings } from './settings.ts';

export const NF = {
  rateFirst: { de: 'Wie sicher sind Sie? Erst einschätzen, dann umdrehen.', en: 'How sure are you? Rate first, then flip.' },
  keysCards: {
    de: 'Tasten: 7 = sicher, 8 = unsicher, 9 = geraten (dreht um), Leertaste = ohne Einschätzung umdrehen, 1 = gewusst, 2 = nicht gewusst',
    en: 'Keys: 7 = sure, 8 = unsure, 9 = guess (flips), space = flip without rating, 1 = knew it, 2 = didn’t know',
  },
  guessToggle: { de: 'Ich rate', en: 'I’m guessing' },
  guessHint: { de: 'Vorher antippen, wenn Sie nur raten.', en: 'Tap first if you are only guessing.' },
  say: { de: 'Aussprechen', en: 'Say it' },
  listening: { de: 'Ich höre zu …', en: 'Listening …' },
  stop: { de: 'Stopp', en: 'Stop' },
  heard: { de: 'Erkannt', en: 'Heard' },
  match: { de: 'Treffer', en: 'Match' },
  ok: { de: 'Verstanden', en: 'Got it' },
  endTitle: { de: 'Ihre Selbsteinschätzung', en: 'How sure you were' },
  sure: { de: 'Sicher', en: 'Sure' },
  unsure: { de: 'Unsicher', en: 'Unsure' },
  guess: { de: 'Geraten', en: 'Guessed' },
  unrated: { de: 'Ohne Einschätzung', en: 'Not rated' },
  answer: { de: 'Antwort', en: 'answer' },
  answers: { de: 'Antworten', en: 'answers' },
  correct: { de: 'richtig', en: 'correct' },
  medianTime: { de: 'Mittlere Antwortzeit', en: 'Median answer time' },
  held: { de: 'Für morgen zurückgehalten (geraten oder langsam)', en: 'Held back for tomorrow (guessed or slow)' },
} satisfies Record<string, Text2>;

/* ----------------------------------------------------------------- session */

/**
 * The neurofeedback state of one round: the answers with their ratings and
 * times, the short feedback line, and the focus monitor.
 */
export function useNfSession(enabled: boolean, startedAt: number) {
  const [answers, setAnswers] = useState<NfAnswer[]>([]);
  // The same answers, readable synchronously when a round ends right after one.
  const all = useRef<NfAnswer[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [hint, setHint] = useState<FocusSignal>('ok');
  const samples = useRef<FocusSample[]>([]);
  const gate = useRef<FocusGate>(FOCUS_GATE);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  /** Shows a feedback line; with `forMs` it disappears again. */
  const flash = useCallback((fb: Feedback, forMs?: number) => {
    clearTimeout(timer.current);
    setFeedback(fb);
    if (forMs) timer.current = setTimeout(() => setFeedback(null), forMs);
  }, []);

  const clearFeedback = useCallback(() => {
    clearTimeout(timer.current);
    setFeedback(null);
  }, []);

  const add = useCallback(
    (a: NfAnswer) => {
      if (!enabled) return;
      all.current = [...all.current, a];
      setAnswers(all.current);
      samples.current = [...samples.current, { ok: a.ok, ms: a.ms }];
      try {
        const { signal } = focusState(samples.current, Date.now() - startedAt);
        const next = gateFocus(gate.current, signal, samples.current.length);
        gate.current = next.gate;
        if (next.show) setHint(signal);
      } catch (err) {
        logError(err, 'wortschatz.nf.focus');
      }
    },
    [enabled, startedAt],
  );

  const dismissHint = useCallback(() => {
    track('wortschatz.nf_focus', { signal: hint, action: 'continue', n: samples.current.length });
    gate.current = snoozeFocus(samples.current.length);
    setHint('ok');
  }, [hint]);

  /** "Pause": the caller ends the round; this only closes the hint. */
  const breakHint = useCallback(() => {
    track('wortschatz.nf_focus', { signal: hint, action: 'break', n: samples.current.length });
    setHint('ok');
  }, [hint]);

  const getAnswers = useCallback(() => all.current, []);

  return { answers, getAnswers, feedback, flash, clearFeedback, hint, add, dismissHint, breakHint };
}

export function FocusMonitor({
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
  if (signal === 'ok') return null;
  return (
    <div className="ws-nf-focus">
      <FocusHint lang={lang} signal={signal} onBreak={onBreak} onContinue={onContinue} />
    </div>
  );
}

/** The short line right after an answer. Keeps its height so the buttons do not jump. */
export function FeedbackLine({ feedback, lang }: { feedback: Feedback | null; lang: Lang }) {
  return (
    <p className={`small center ws-nf-line ${feedback && feedback.tone !== 'neutral' ? feedback.tone : 'muted'}`} role="status" aria-live="polite">
      {feedback ? tr(feedback.text, lang) : ''}
    </p>
  );
}

/* ------------------------------------------------------------------- speech */

/** Whether speech recognition exists, checked after mount. */
export function useSpeechAvailable(enabled: boolean): boolean {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    try {
      setOk(speechRecognitionAvailable());
    } catch (err) {
      logError(err, 'wortschatz.nf.speech');
    }
  }, [enabled]);
  return ok;
}

/**
 * Aussprache-Check on the back of a card: say the word, see what the browser
 * understood, word by word. Nothing heard is stored or sent by the app.
 */
export function SpeechCheck({ entry, lang }: { entry: VocabEntry; lang: Lang }) {
  const [settings, , markNoteSeen] = useWsSettings();
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState('');
  const [result, setResult] = useState<SpeechMatch | null>(null);
  const [error, setError] = useState<string | null>(null);
  const stopRef = useRef<(() => void) | null>(null);
  const scored = useRef(false);
  const target = speechTarget(entry.de, entry.article);

  useEffect(
    () => () => {
      stopRef.current?.();
      stopRef.current = null;
    },
    [],
  );

  const start = () => {
    if (listening) {
      stopRef.current?.();
      return;
    }
    if (!settings.speechNoteSeen) markNoteSeen();
    setHeard('');
    setResult(null);
    setError(null);
    scored.current = false;
    setListening(true);
    track('wortschatz.nf_speech_started', { pos: entry.pos });
    try {
      stopRef.current = listen({
        onText: (text, final) => {
          setHeard(text);
          if (!final || scored.current || !text) return;
          scored.current = true;
          const m = speechMatch(target, text);
          setResult(m);
          const score = Math.round(m.score * 100);
          noteSpeech(score);
          track('wortschatz.nf_speech', { score, words: m.words.length });
        },
        onError: (code) => {
          setError(code);
          track('wortschatz.nf_speech_error', { code });
        },
        onEnd: () => {
          setListening(false);
          stopRef.current = null;
        },
      });
    } catch (err) {
      logError(err, 'wortschatz.nf.listen');
      setListening(false);
      setError('start-failed');
    }
  };

  return (
    <div className="ws-nf-speech">
      {!settings.speechNoteSeen && (
        <div className="ws-nf-note small muted row">
          <span style={{ flex: 1 }}>{tr(SPEECH_PRIVACY, lang)}</span>
          <button type="button" className="btn small ghost" onClick={markNoteSeen}>
            {tr(NF.ok, lang)}
          </button>
        </div>
      )}
      <div className="row wrap" style={{ gap: 8 }}>
        <button type="button" className={`btn ${listening ? 'primary' : ''}`} onClick={start} aria-pressed={listening}>
          🎙️ {listening ? tr(NF.stop, lang) : tr(NF.say, lang)}
        </button>
        {listening && <span className="small muted">{tr(NF.listening, lang)}</span>}
        {result && <span className={`badge ${result.score >= 0.8 ? 'good' : 'bad'}`}>{Math.round(result.score * 100)} %</span>}
      </div>
      {heard && (
        <p className="small" style={{ margin: '8px 0 0' }}>
          <span className="muted">{tr(NF.heard, lang)}:</span> „{heard}“
        </p>
      )}
      {result && (
        <p className="ws-nf-words" aria-label={tr(NF.match, lang)}>
          {shownWords(target, result.words).map((w, i) => (
            <span key={i} className={w.heard ? 'good' : 'bad'}>
              {w.heard ? '✓' : '✗'} {w.word}
            </span>
          ))}
        </p>
      )}
      {error && <p className="small bad" style={{ margin: '8px 0 0' }}>{tr(speechErrorText(error), lang)}</p>}
    </div>
  );
}

/* ---------------------------------------------------------------- end screen */

export function NfEndLines({ answers, lang }: { answers: NfAnswer[]; lang: Lang }) {
  if (answers.length === 0) return null;
  const s = nfSummary(answers);
  const rows = (['sure', 'unsure', 'guess'] as const).filter((c) => s.byConf[c].n > 0);
  return (
    <div className="ws-nf-end">
      <h2 style={{ marginTop: 0 }}>{tr(NF.endTitle, lang)}</h2>
      <ul className="ws-missed">
        {rows.map((c) => (
          <li key={c}>
            <strong>{tr(NF[c], lang)}:</strong> {s.byConf[c].n} {tr(s.byConf[c].n === 1 ? NF.answer : NF.answers, lang)}, {pct(s.byConf[c].correct, s.byConf[c].n)} %{' '}
            {tr(NF.correct, lang)}
          </li>
        ))}
        {s.unrated > 0 && (
          <li>
            <strong>{tr(NF.unrated, lang)}:</strong> {s.unrated} {tr(s.unrated === 1 ? NF.answer : NF.answers, lang)}
          </li>
        )}
        {s.medianMs !== null && (
          <li>
            <strong>{tr(NF.medianTime, lang)}:</strong> {formatSeconds(s.medianMs, lang)}
          </li>
        )}
        <li>
          <strong>{tr(NF.held, lang)}:</strong> {s.held}
        </li>
      </ul>
    </div>
  );
}

/** Counts only – never words. */
export function trackNfFinished(mode: 'cards' | 'articles', answers: NfAnswer[]) {
  if (answers.length === 0) return;
  const s = nfSummary(answers);
  track('wortschatz.nf_session_finished', {
    mode,
    n: answers.length,
    sure: s.byConf.sure.n,
    sureCorrect: s.byConf.sure.correct,
    unsure: s.byConf.unsure.n,
    unsureCorrect: s.byConf.unsure.correct,
    guess: s.byConf.guess.n,
    guessCorrect: s.byConf.guess.correct,
    unrated: s.unrated,
    held: s.held,
    medianMs: s.medianMs === null ? null : Math.round(s.medianMs),
  });
}
