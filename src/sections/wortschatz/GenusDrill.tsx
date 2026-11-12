// Genus-Regel-Drill: der, die or das for nouns a Merktipp explains (about one in
// five is an exception). Each noun must be right three times in a row before it
// "sitzt"; a mistake resets it and brings it back a few cards later.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Lang, Text2 } from '../../types.ts';
import type { VocabEntry } from '../../content/types.ts';
import { genderTip, genderTipText } from '../../content/merktipps.ts';
import { getStore, recordItem, recordResult } from '../../lib/storage.ts';
import { logError, track } from '../../lib/analytics.ts';
import { useKeys } from '../../lib/useKeys.ts';
import { tr } from '../../lib/i18n.ts';
import { ArticleBadge, BackLink, S, SpeakButton, say, spoken, useTts } from './shared.tsx';
import { useWsSettings } from './settings.ts';
import { MT, spokenTip } from './Merktipp.tsx';
import { G } from './Genus.tsx';
import { MASTERY, advanceDrill, genusKey, gradeDrill, isMastered, pickRound, shouldRecord, startDrill } from './genusDrill.ts';

const ARTICLES = ['der', 'die', 'das'] as const;

const D = {
  title: { de: 'Genus-Regel-Drill', en: 'Gender rule drill' },
  question: { de: 'Welcher Artikel? Denken Sie an die Regel.', en: 'Which article? Think of the rule.' },
  sits: { de: 'sitzt', en: 'mastered' },
  sitsNow: { de: 'Sitzt! 3-mal hintereinander richtig.', en: 'Mastered! Right 3 times in a row.' },
  streak: { de: 'richtig in Folge', en: 'right in a row' },
  again: { de: 'Kommt in ein paar Karten wieder.', en: 'Comes back in a few cards.' },
  doneTitle: { de: 'Alle Wörter sitzen!', en: 'All words mastered!' },
  stopped: { de: 'Runde beendet', en: 'Round ended' },
  firstTry: { de: 'Beim ersten Versuch richtig', en: 'Right at the first try' },
  answers: { de: 'Antworten insgesamt', en: 'Answers in total' },
  mistakes: { de: 'Fehler', en: 'Mistakes' },
  practiseAgain: { de: 'Diese Regeln kommen in den nächsten Tagen wieder:', en: 'These rules come back over the next days:' },
  newRound: { de: 'Neue Runde', en: 'New round' },
  rules: { de: 'Genus-Regeln', en: 'Gender rules' },
  empty: { de: 'Keine passenden Nomen gefunden.', en: 'No matching nouns found.' },
  progress: { de: 'Fortschritt: 3 Punkte pro Wort', en: 'Progress: 3 dots per word' },
} satisfies Record<string, Text2>;

export default function GenusDrill({ lang, go, onRestart }: { lang: Lang; go: (r: string) => void; onRestart: () => void }) {
  const round = useMemo<VocabEntry[]>(() => {
    try {
      return pickRound(getStore().progress);
    } catch (err) {
      logError(err, 'wortschatz.genus.round');
      return [];
    }
  }, []);
  const byId = useMemo(() => new Map(round.map((e) => [e.id, e])), [round]);
  const [state, setState] = useState(() => startDrill(round.map((e) => e.id)));
  const [chosen, setChosen] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const startedAt = useRef(Date.now());
  const tts = useTts();
  const [settings] = useWsSettings();

  const card = state.queue.length > 0 ? byId.get(state.queue[0]) : undefined;

  useEffect(() => {
    if (round.length > 0) track('wortschatz.session_started', { mode: 'genus', topic: 'all', n: round.length });
  }, [round.length]);

  const finish = useCallback(
    (s: typeof state) => {
      setFinished(true);
      const firsts = Object.values(s.first);
      if (firsts.length === 0) return;
      const correct = firsts.filter(Boolean).length;
      try {
        recordResult({
          section: 'wortschatz',
          part: undefined,
          setId: 'genus',
          correct,
          total: firsts.length,
          startedAt: startedAt.current,
          finishedAt: Date.now(),
        });
      } catch (err) {
        logError(err, 'wortschatz.genus.result');
      }
      track('wortschatz.session_finished', { mode: 'genus', topic: 'all', n: firsts.length, correct, answers: s.answers });
    },
    [],
  );

  const choose = useCallback(
    (i: number) => {
      if (!card || chosen !== null || finished || i < 0 || i > 2) return;
      const ok = ARTICLES[i] === card.article;
      setChosen(i);
      try {
        if (shouldRecord(state, card.id, ok)) recordItem(genusKey(card.id), ok, i);
      } catch (err) {
        logError(err, 'wortschatz.genus.record');
      }
      setState((s) => gradeDrill(s, ok));
      if (tts && settings.autoSpeak) say(spoken(card));
    },
    [card, chosen, finished, state, tts, settings.autoSpeak],
  );

  const next = useCallback(() => {
    if (chosen === null || finished) return;
    const after = advanceDrill(state);
    setState(after);
    setChosen(null);
    if (after.queue.length === 0) finish(after);
  }, [chosen, finished, state, finish]);

  useKeys({ onOption: choose, onNext: next });

  if (round.length === 0) {
    return (
      <div className="ws">
        <BackLink lang={lang} go={go} to="wortschatz/genus" />
        <div className="card" style={{ marginTop: 16 }}>
          <p style={{ marginTop: 0 }}>{tr(D.empty, lang)}</p>
        </div>
      </div>
    );
  }

  const dots = (
    <div className="ws-dots" aria-label={tr(D.progress, lang)}>
      {round.map((e) => {
        const n = Math.min(state.streak[e.id] ?? 0, MASTERY);
        const done = isMastered(state, e.id);
        return (
          <span
            key={e.id}
            className={`ws-dot-group ${done ? 'done' : ''} ${card?.id === e.id && !finished ? 'current' : ''}`}
            title={done ? `${e.article} ${e.de} – ${tr(D.sits, lang)}` : `${n} / ${MASTERY}`}
          >
            {Array.from({ length: MASTERY }, (_, k) => (
              <span key={k} className={`ws-dot ${k < n ? 'on' : ''}`} />
            ))}
          </span>
        );
      })}
    </div>
  );

  if (finished || !card) {
    const firsts = Object.values(state.first);
    const correct = firsts.filter(Boolean).length;
    const missed = round.filter((e) => state.first[e.id] === false);
    const allDone = round.every((e) => isMastered(state, e.id));
    return (
      <div className="ws">
        <div className="card center ws-end">
          <h1 style={{ marginTop: 0 }}>{allDone ? `🎉 ${tr(D.doneTitle, lang)}` : tr(D.stopped, lang)}</h1>
          {dots}
          <div className="statgrid" style={{ marginTop: 14 }}>
            <div className="stat">
              <div className="n good">
                {correct} / {firsts.length}
              </div>
              <div className="l">{tr(D.firstTry, lang)}</div>
            </div>
            <div className="stat">
              <div className="n">{state.answers}</div>
              <div className="l">{tr(D.answers, lang)}</div>
            </div>
            <div className="stat">
              <div className={`n ${state.wrong ? 'bad' : ''}`}>{state.wrong}</div>
              <div className="l">{tr(D.mistakes, lang)}</div>
            </div>
          </div>
          {missed.length > 0 && (
            <div style={{ textAlign: 'left', marginTop: 16 }}>
              <p className="small muted">{tr(D.practiseAgain, lang)}</p>
              <ul className="ws-missed">
                {missed.map((e) => {
                  const t = genderTip(e);
                  return (
                    <li key={e.id}>
                      <ArticleBadge article={e.article} /> <strong>{e.de}</strong>
                      {t && <span className={`ws-missed-tip ${t.matches ? '' : 'ws-tip-exc'}`}>💡 {tr(genderTipText(t, e), lang)}</span>}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          <div className="row wrap" style={{ justifyContent: 'center', marginTop: 18 }}>
            <button type="button" className="btn primary" onClick={onRestart} autoFocus>
              {tr(D.newRound, lang)}
            </button>
            <button type="button" className="btn" onClick={() => go('wortschatz/genus')}>
              ← {tr(D.rules, lang)}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const answered = chosen !== null;
  const right = answered && ARTICLES[chosen] === card.article;
  const tip = genderTip(card);
  const tipText = tip ? genderTipText(tip, card) : null;
  const streak = state.streak[card.id] ?? 0;
  const mastered = answered && isMastered(state, card.id);

  return (
    <div className="ws">
      <div className="exambar">
        <BackLink lang={lang} go={go} to="wortschatz/genus" />
        <span className="small muted ws-scope">{tr(D.title, lang)}</span>
        <button type="button" className="btn small ghost" onClick={() => (state.answers ? finish(state) : go('wortschatz/genus'))}>
          {tr(S.finish, lang)}
        </button>
      </div>
      {dots}

      <div className="card ws-card ws-art-card">
        <span className="ws-pos">{tr(D.question, lang)}</span>
        <span className="ws-word">
          {answered ? <span className={`ws-art ws-art-${card.article}`}>{card.article}</span> : <span className="ws-art ws-art-blank">___</span>}{' '}
          {card.de}
        </span>
        <span className="ws-hint">{card.en}</span>
      </div>

      <div className="options ws-art-options">
        {ARTICLES.map((a, i) => {
          let cls = 'option';
          if (answered && a === card.article) cls += ' correct';
          else if (answered && i === chosen) cls += ' incorrect';
          return (
            <button key={a} type="button" className={`${cls} ws-art-opt-${a}`} disabled={answered} onClick={() => choose(i)}>
              <span className="key">{i + 1}</span>
              <span className="body">{a}</span>
            </button>
          );
        })}
      </div>

      {answered && (
        <div className={`verdict ${right ? 'good' : 'bad'}`} role="status">
          <div className="head">{right ? tr(S.correct, lang) : tr(S.wrong, lang)}</div>
          <div className="body">
            <strong>
              {card.article} {card.de}
            </strong>
            {tts && <SpeakButton text={spoken(card)} label={S.listen} lang={lang} />}
          </div>
          {tipText && (
            <div className={`body ws-verdict-tip ${tip!.matches ? '' : 'ws-tip-exc'}`}>
              💡 {tr(tipText, lang)}
              {tts && <SpeakButton text={spokenTip(tipText.de)} label={MT.listenTip} lang={lang} />}
            </div>
          )}
          {tip && <div className="body small muted">{tr(tip.rule.tip, lang)}</div>}
          <div className="body small">
            {mastered ? `✅ ${tr(D.sitsNow, lang)}` : right ? `${streak} / ${MASTERY} ${tr(D.streak, lang)}` : tr(D.again, lang)}
          </div>
        </div>
      )}

      <div className="sticky-actions">
        <button type="button" className="btn primary block" disabled={!answered} onClick={next} autoFocus={answered}>
          {tr(S.next, lang)} →
        </button>
      </div>
      <p className="small muted center ws-keys">{tr(S.keysArticles, lang)}</p>
      <p className="small muted center">
        <button type="button" className="btn small ghost" onClick={() => go('wortschatz/genus')}>
          💡 {tr(G.title, lang)}
        </button>
      </p>
    </div>
  );
}
