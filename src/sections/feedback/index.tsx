// Feedback screen of the neurofeedback test phase: confidence calibration,
// response tempo, focus hints and pronunciation, from the learner's own data.
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { SectionProps } from '../types.ts';
import type { Confidence, Lang, Text2 } from '../../types.ts';
import { useFlag, useSection, useStore } from '../../lib/storage.ts';
import { tr } from '../../lib/i18n.ts';
import { allAttempts, calibration, CONFIDENCES, type TimedKind } from '../../lib/neuro.ts';
import { EMPTY_FEEDBACK_LOG, FEEDBACK_KEY, readFeedbackLog, type FeedbackLog } from '../../lib/neuroLog.ts';
import { PART_LABEL } from '../modelltest/score.ts';
import { NeuroSwitch } from './NeuroSwitch.tsx';
import {
  calibrationVerdict,
  confidentErrorItems,
  focusSummary,
  itemTarget,
  speechSummary,
  tempoByKind,
} from './stats.ts';

const L = {
  title: { de: 'Feedback', en: 'Feedback' },
  intro: {
    de: 'Rückmeldung zu Ihrem Lernzustand aus Ihren eigenen Antworten. Nur auf diesem Gerät bzw. in Ihrem Konto.',
    en: 'Feedback on your learning state from your own answers. Only on this device or in your account.',
  },
  offNote: {
    de: 'Der Neurofeedback-Modus ist ausgeschaltet. Schalten Sie ihn ein, um diese Rückmeldungen zu sammeln.',
    en: 'Neurofeedback mode is off. Turn it on to collect this feedback.',
  },
  // Sicherheit
  calibration: { de: 'Sicherheit', en: 'Confidence' },
  calibrationScore: { de: 'Treffsicherheit Ihres Gefühls', en: 'How well your feeling predicts' },
  tooFew: {
    de: 'Noch zu wenig eingeschätzte Antworten (mindestens 10). Schätzen Sie vor dem Antworten ein, wie sicher Sie sind.',
    en: 'Not enough rated answers yet (at least 10). Rate how sure you are before answering.',
  },
  answers: { de: 'Antworten', en: 'answers' },
  correct: { de: 'richtig', en: 'correct' },
  sureWrong: { de: 'Sicher, aber falsch', en: 'Sure, but wrong' },
  sureWrongWhy: {
    de: 'Diese Fehler lohnen sich am meisten: Hier hat sich etwas Falsches festgesetzt.',
    en: 'These mistakes are most worth a look: something wrong has stuck here.',
  },
  luckyGuess: { de: 'Geraten, aber richtig', en: 'Guessed, but right' },
  luckyWhy: {
    de: 'Richtig, aber noch nicht sicher – diese Fragen kommen früher wieder.',
    en: 'Right, but not secure yet – these items come back sooner.',
  },
  practise: { de: 'Üben', en: 'Practise' },
  // Tempo
  tempo: { de: 'Tempo', en: 'Tempo' },
  tempoWhy: {
    de: 'Mittlere Zeit bis zur richtigen Antwort, letzte 7 Tage im Vergleich zu den 7 Tagen davor.',
    en: 'Median time to a correct answer, last 7 days compared with the 7 days before.',
  },
  noTimes: { de: 'Noch keine gemessenen Antworten.', en: 'No timed answers yet.' },
  faster: { de: 'schneller', en: 'faster' },
  slower: { de: 'langsamer', en: 'slower' },
  same: { de: 'gleich', en: 'same' },
  before: { de: 'davor', en: 'before' },
  // Konzentration
  focus: { de: 'Konzentration', en: 'Focus' },
  focusCount: { de: 'Pausenhinweise in den letzten 14 Tagen', en: 'Break hints in the last 14 days' },
  focusDip: { de: 'nachlassende Konzentration', en: 'focus dropping' },
  focusLong: { de: 'lange Lerneinheit', en: 'long session' },
  focusNone: { de: 'Keine Pausenhinweise in den letzten 14 Tagen.', en: 'No break hints in the last 14 days.' },
  // Aussprache
  speech: { de: 'Aussprache', en: 'Pronunciation' },
  speechAvg: { de: 'Erkannte Wörter (Durchschnitt der letzten Versuche)', en: 'Words recognised (average of the last attempts)' },
  speechNone: {
    de: 'Noch keine Sprechversuche mit Spracherkennung.',
    en: 'No speaking attempts with speech recognition yet.',
  },
  attempts: { de: 'Versuche', en: 'attempts' },
  points: { de: 'Prozentpunkte', en: 'points' },
  // Explanation
  how: { de: 'Wie funktioniert das?', en: 'How does it work?' },
  howConf: {
    de: 'Sicherheit: Vor jeder Antwort sagen Sie, ob Sie sicher sind, unsicher sind oder raten. Wer sein Wissen gut einschätzen kann, lernt gezielter. „Sicher, aber falsch“ zeigt Fehler, die sich festgesetzt haben; geratene richtige Antworten steigen nicht auf, sondern kommen bald wieder.',
    en: 'Confidence: before each answer you say whether you are sure, unsure or guessing. Knowing what you know makes learning more targeted. "Sure, but wrong" shows mistakes that have stuck; right answers that were guessed do not move up but come back soon.',
  },
  howTempo: {
    de: 'Tempo: Die App misst, wie lange Sie bis zur Antwort brauchen. Sehr langsame richtige Antworten sind noch nicht automatisch und werden wie geratene behandelt.',
    en: 'Tempo: the app measures how long you take to answer. Very slow correct answers are not automatic yet and are treated like guesses.',
  },
  howFocus: {
    de: 'Konzentration: Werden Ihre Antworten in einer Lerneinheit deutlich langsamer oder öfter falsch als am Anfang, oder lernen Sie länger als 25 Minuten, schlägt die App eine kurze Pause vor.',
    en: 'Focus: if your answers in a session become clearly slower or more often wrong than at the start, or you study for more than 25 minutes, the app suggests a short break.',
  },
  howSpeech: {
    de: 'Aussprache: Die Spracherkennung des Browsers schreibt mit, was Sie sagen. Die App vergleicht das mit dem Satz, den Sie sprechen sollten.',
    en: "Pronunciation: the browser's speech recognition writes down what you say. The app compares it with the sentence you were meant to say.",
  },
  honest: {
    de: 'Ehrlich gesagt: Das ist kein Neurofeedback mit EEG oder Gehirnmessung. Es ist eine Rückmeldeschleife aus der Lernforschung, die nur Ihre Antworten, Zeiten und Ihre Stimme (über die Spracherkennung) nutzt.',
    en: 'To be honest: this is not EEG neurofeedback and measures no brain activity. It is a feedback loop from learning science that only uses your answers, timings and your voice (through speech recognition).',
  },
} satisfies Record<string, Text2>;

const CONF_LABEL: Record<Confidence, Text2> = {
  sure: { de: '😎 Sicher', en: '😎 Sure' },
  unsure: { de: '🤔 Unsicher', en: '🤔 Unsure' },
  guess: { de: '🎲 Geraten', en: '🎲 Guess' },
};

const KIND_LABEL: Record<TimedKind, Text2> = {
  card: { de: 'Wortkarten', en: 'Word cards' },
  article: { de: 'Artikel (der/die/das)', en: 'Articles (der/die/das)' },
  choice: { de: 'Prüfungsaufgaben', en: 'Exam tasks' },
};

const VOCAB_LABEL: Text2 = { de: 'Wortschatz', en: 'Vocabulary' };
const ARTICLE_LABEL: Text2 = { de: 'Artikel', en: 'Article' };

const seconds = (ms: number, lang: Lang) =>
  `${(ms / 1000).toLocaleString(lang === 'de' ? 'de-DE' : 'en-GB', { maximumFractionDigits: 1 })} s`;

const pct = (share: number) => `${Math.round(share * 100)} %`;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ marginTop: 24 }}>
      <h2>{title}</h2>
      <div className="card stack">{children}</div>
    </section>
  );
}

/** German words of vocabulary entries, loaded only when an entry has to be shown. */
function useVocabWords(ids: string[]): Record<string, string> {
  const [words, setWords] = useState<Record<string, string>>({});
  const key = ids.join('|');
  useEffect(() => {
    if (ids.length === 0) return;
    let alive = true;
    import('../../content/wortschatz.ts')
      .then(({ vocab }) => {
        if (!alive) return;
        const wanted = new Set(ids);
        const out: Record<string, string> = {};
        for (const e of vocab) if (wanted.has(e.id)) out[e.id] = e.article ? `${e.article} ${e.de}` : e.de;
        setWords(out);
      })
      .catch(() => {
        /* offline and not cached: the section name is shown instead */
      });
    return () => {
      alive = false;
    };
    // `key` stands for `ids`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return words;
}

export default function Feedback({ lang, go }: SectionProps) {
  const [on] = useFlag('neurofeedback');
  const [store] = useStore();
  const [rawLog] = useSection<FeedbackLog>(FEEDBACK_KEY, EMPTY_FEEDBACK_LOG);
  const log = useMemo(() => readFeedbackLog(rawLog), [rawLog]);
  const now = Date.now();

  const cal = useMemo(() => calibration(allAttempts(store.progress)), [store.progress]);
  const errors = useMemo(() => confidentErrorItems(store.progress, 10), [store.progress]);
  const tempo = tempoByKind(store.progress, now);
  const focus = focusSummary(log, now, 14);
  const speech = speechSummary(log, 10);
  const vocabIds = errors.map((e) => itemTarget(e.id).vocabId).filter((x): x is string => !!x);
  const words = useVocabWords(vocabIds);

  if (!on) {
    return (
      <div>
        <h1>{tr(L.title, lang)}</h1>
        <p className="muted">{tr(L.offNote, lang)}</p>
        <div style={{ marginTop: 16 }}>
          <NeuroSwitch lang={lang} showLink={false} />
        </div>
        <Explanation lang={lang} />
      </div>
    );
  }

  const label = (id: string) => {
    const t = itemTarget(id);
    if (t.vocabId) {
      const kind = id.startsWith('vocab-art:') ? ARTICLE_LABEL : VOCAB_LABEL;
      return words[t.vocabId] ? `${tr(kind, lang)}: ${words[t.vocabId]}` : tr(kind, lang);
    }
    if (t.part) return tr(PART_LABEL[t.part], lang);
    return id.split(':')[0];
  };

  const rated = CONFIDENCES.reduce((n, c) => n + cal.byConf[c].n, 0);
  const peak = Math.max(1, ...focus.byDay);

  return (
    <div>
      <h1>{tr(L.title, lang)}</h1>
      <p className="muted">{tr(L.intro, lang)}</p>

      <Section title={`🎯 ${tr(L.calibration, lang)}`}>
        {cal.score === null ? (
          <p className="small muted" style={{ margin: 0 }}>
            {tr(L.tooFew, lang)} ({rated} / 10)
          </p>
        ) : (
          <div>
            <div className="small muted">{tr(L.calibrationScore, lang)}</div>
            <div className="row" style={{ alignItems: 'baseline', gap: 6 }}>
              <span className="score">{cal.score}</span>
              <span className="muted">/ 100</span>
            </div>
            <p style={{ margin: '4px 0 0' }}>{tr(calibrationVerdict(cal.score), lang)}</p>
          </div>
        )}

        {rated > 0 && (
          <div className="stack" style={{ gap: 10 }}>
            {CONFIDENCES.map((c) => {
              const s = cal.byConf[c];
              const share = s.n ? s.correct / s.n : 0;
              return (
                <div key={c}>
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <span className="small">{tr(CONF_LABEL[c], lang)}</span>
                    <span className="small muted">
                      {s.n} {tr(L.answers, lang)}
                      {s.n > 0 && ` · ${pct(share)} ${tr(L.correct, lang)}`}
                    </span>
                  </div>
                  <div className={`bar${share >= 0.8 ? ' good' : ''}`} style={{ marginTop: 4 }}>
                    <span style={{ width: `${share * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="statgrid">
          <div className="stat">
            <div className={`n${cal.confidentErrors > 0 ? ' bad' : ''}`}>{cal.confidentErrors}</div>
            <div className="l">{tr(L.sureWrong, lang)}</div>
          </div>
          <div className="stat">
            <div className="n">{cal.luckyGuesses}</div>
            <div className="l">{tr(L.luckyGuess, lang)}</div>
          </div>
        </div>
        {cal.luckyGuesses > 0 && <p className="small muted" style={{ margin: 0 }}>{tr(L.luckyWhy, lang)}</p>}

        {errors.length > 0 && (
          <div>
            <div className="small" style={{ fontWeight: 600 }}>{tr(L.sureWrong, lang)}</div>
            <p className="small muted" style={{ margin: '2px 0 8px' }}>{tr(L.sureWrongWhy, lang)}</p>
            <div className="ranklist">
              {errors.map((e) => {
                const target = itemTarget(e.id);
                return (
                  <div key={e.id} className="ranked">
                    <div className="row" style={{ justifyContent: 'space-between', gap: 8 }}>
                      <span style={{ minWidth: 0 }}>
                        {label(e.id)}
                        {e.count > 1 && <span className="small muted"> · {e.count}×</span>}
                      </span>
                      {target.route && (
                        <button type="button" className="btn small" style={{ flex: 'none' }} onClick={() => go(target.route)}>
                          {tr(L.practise, lang)} →
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Section>

      <Section title={`⏱️ ${tr(L.tempo, lang)}`}>
        <p className="small muted" style={{ margin: 0 }}>{tr(L.tempoWhy, lang)}</p>
        {tempo.every((t) => t.recent === null && t.before === null) ? (
          <p className="small muted" style={{ margin: 0 }}>{tr(L.noTimes, lang)}</p>
        ) : (
          <div className="stack" style={{ gap: 8 }}>
            {tempo
              .filter((t) => t.recent !== null || t.before !== null)
              .map((t) => {
                let trend: { text: string; cls: string } | null = null;
                if (t.recent !== null && t.before !== null) {
                  const change = (t.recent - t.before) / t.before;
                  trend =
                    Math.abs(change) < 0.05
                      ? { text: `→ ${tr(L.same, lang)}`, cls: 'muted' }
                      : change < 0
                        ? { text: `↓ ${pct(-change)} ${tr(L.faster, lang)}`, cls: 'good' }
                        : { text: `↑ ${pct(change)} ${tr(L.slower, lang)}`, cls: 'bad' };
                }
                return (
                  <div key={t.kind} className="row" style={{ justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                    <span>{tr(KIND_LABEL[t.kind], lang)}</span>
                    <span className="small">
                      <strong>{t.recent !== null ? seconds(t.recent, lang) : '–'}</strong>
                      {t.before !== null && (
                        <span className="muted">
                          {' '}
                          ({tr(L.before, lang)} {seconds(t.before, lang)})
                        </span>
                      )}
                      {trend && <span className={trend.cls}> {trend.text}</span>}
                    </span>
                  </div>
                );
              })}
          </div>
        )}
      </Section>

      <Section title={`🧘 ${tr(L.focus, lang)}`}>
        {focus.dip + focus.long === 0 ? (
          <p className="small muted" style={{ margin: 0 }}>{tr(L.focusNone, lang)}</p>
        ) : (
          <>
            <div>
              <div className="small muted">{tr(L.focusCount, lang)}</div>
              <div className="score">{focus.dip + focus.long}</div>
              <div className="small muted">
                {focus.dip} × {tr(L.focusDip, lang)} · {focus.long} × {tr(L.focusLong, lang)}
              </div>
            </div>
            <div className="activity" aria-hidden="true">
              {focus.byDay.map((n, i) => (
                <div key={i} className={`col${n === 0 ? ' empty' : ''}`}>
                  <span style={{ height: `${(n / peak) * 100}%` }} />
                </div>
              ))}
            </div>
          </>
        )}
      </Section>

      <Section title={`🗣️ ${tr(L.speech, lang)}`}>
        {speech.recent === null ? (
          <p className="small muted" style={{ margin: 0 }}>{tr(L.speechNone, lang)}</p>
        ) : (
          <div>
            <div className="small muted">{tr(L.speechAvg, lang)}</div>
            <div className="row" style={{ alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
              <span className="score">{pct(speech.recent)}</span>
              {speech.before !== null &&
                (() => {
                  const d = Math.round((speech.recent - speech.before) * 100);
                  if (d === 0) return <span className="muted">→ {tr(L.same, lang)}</span>;
                  return <span className={d > 0 ? 'good' : 'bad'}>{d > 0 ? `↑ +${d}` : `↓ ${d}`} {tr(L.points, lang)}</span>;
                })()}
            </div>
            <div className={`bar${speech.recent >= 0.8 ? ' good' : ''}`} style={{ marginTop: 6 }}>
              <span style={{ width: `${speech.recent * 100}%` }} />
            </div>
            <div className="small muted" style={{ marginTop: 6 }}>
              {speech.n} {tr(L.attempts, lang)}
            </div>
          </div>
        )}
      </Section>

      <Explanation lang={lang} />

      <div style={{ marginTop: 24 }}>
        <NeuroSwitch lang={lang} showLink={false} />
      </div>
    </div>
  );
}

function Explanation({ lang }: { lang: Lang }) {
  return (
    <section style={{ marginTop: 24 }}>
      <h2>{tr(L.how, lang)}</h2>
      <div className="stack small">
        <p style={{ margin: 0 }}>{tr(L.howConf, lang)}</p>
        <p style={{ margin: 0 }}>{tr(L.howTempo, lang)}</p>
        <p style={{ margin: 0 }}>{tr(L.howFocus, lang)}</p>
        <p style={{ margin: 0 }}>{tr(L.howSpeech, lang)}</p>
        <p className="muted" style={{ margin: 0 }}>{tr(L.honest, lang)}</p>
      </div>
    </section>
  );
}
