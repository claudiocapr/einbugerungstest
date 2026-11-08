import { useCallback, useEffect, useRef, useState } from 'react';
import type { Lang } from '../../types.ts';
import type { VocabEntry } from '../../content/types.ts';
import { getStore, recordItem, recordResult, useFlag } from '../../lib/storage.ts';
import { isSlow, pastTimes, shouldHold } from '../../lib/neuro.ts';
import { logError, track } from '../../lib/analytics.ts';
import { useKeys } from '../../lib/useKeys.ts';
import { tr } from '../../lib/i18n.ts';
import {
  BackLink,
  S,
  type Scope,
  ShareBar,
  SpeakButton,
  articleKey,
  buildDeck,
  pluralText,
  say,
  scopeLabel,
  spoken,
  useTts,
} from './shared.tsx';
import { useWsSettings } from './settings.ts';
import SessionEnd from './SessionEnd.tsx';
import { FocusMonitor, NF, NfEndLines, trackNfFinished, useNfSession } from './nf.tsx';
import { feedbackLine } from './nfLogic.ts';

const ARTICLES = ['der', 'die', 'das'] as const;
const isNoun = (e: VocabEntry) => e.pos === 'noun' && !!e.article;

/** Artikel-Trainer: pick der, die or das for a noun; graded at once. */
export default function Articles({
  scope,
  lang,
  go,
  onRestart,
}: {
  scope: Scope;
  lang: Lang;
  go: (r: string) => void;
  onRestart: () => void;
}) {
  const [deck] = useState<VocabEntry[]>(() => {
    try {
      return buildDeck(scope, getStore().progress, articleKey, isNoun);
    } catch (err) {
      logError(err, 'wortschatz.articles.deck');
      return [];
    }
  });
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);
  const startedAt = useRef(Date.now());
  const tts = useTts();
  const [settings] = useWsSettings();
  const backTo = scope === 'due' || scope === 'weak' ? 'wortschatz' : `wortschatz/thema/${scope}`;
  const card = deck[index] as VocabEntry | undefined;

  // Neurofeedback mode (test phase): timing per noun, an optional "I'm guessing" toggle, focus monitor.
  const [nf] = useFlag('neurofeedback');
  const nfs = useNfSession(nf, startedAt.current);
  const { add: nfAdd, flash: nfFlash, clearFeedback: nfClear, getAnswers: nfAnswers } = nfs;
  const shownAt = useRef(Date.now());
  const [guessing, setGuessing] = useState(false);

  useEffect(() => {
    if (deck.length > 0) track('wortschatz.session_started', { mode: 'articles', topic: scope, n: deck.length });
  }, [deck.length, scope]);

  const finish = useCallback(
    (all: boolean[]) => {
      setFinished(true);
      if (all.length === 0) return;
      const correct = all.filter(Boolean).length;
      try {
        recordResult({
          section: 'wortschatz',
          setId: `artikel-${scope}`,
          correct,
          total: all.length,
          startedAt: startedAt.current,
          finishedAt: Date.now(),
        });
      } catch (err) {
        logError(err, 'wortschatz.articles.result');
      }
      track('wortschatz.session_finished', { mode: 'articles', topic: scope, n: all.length, correct });
      if (nf) trackNfFinished('articles', nfAnswers());
    },
    [scope, nf, nfAnswers],
  );

  const choose = useCallback(
    (i: number) => {
      if (!card || chosen !== null || i < 0 || i > 2) return;
      const ok = ARTICLES[i] === card.article;
      setChosen(i);
      setAnswers((a) => [...a, ok]);
      try {
        if (nf) {
          const now = Date.now();
          const ms = now - shownAt.current;
          const conf = guessing ? 'guess' : 'sure';
          const slow = isSlow(ms, 'article', pastTimes(getStore().progress, 'vocab-art:'));
          const hold = shouldHold(ok, conf, slow);
          recordItem(articleKey(card.id), ok, i, now, { conf, ms, hold });
          nfAdd({ ok, conf, ms, hold });
          nfFlash(feedbackLine(ok, conf, slow, ms));
        } else recordItem(articleKey(card.id), ok, i);
      } catch (err) {
        logError(err, 'wortschatz.articles.record');
      }
      if (tts && settings.autoSpeak) say(spoken(card));
    },
    [card, chosen, tts, settings.autoSpeak, nf, guessing, nfAdd, nfFlash],
  );

  const next = useCallback(() => {
    if (chosen === null) return;
    if (index + 1 >= deck.length) finish(answers);
    else {
      setIndex(index + 1);
      setChosen(null);
      if (nf) {
        nfClear();
        setGuessing(false);
        shownAt.current = Date.now();
      }
    }
  }, [chosen, index, deck.length, answers, finish, nf, nfClear]);

  useKeys({ onOption: choose, onNext: next });

  if (deck.length === 0) {
    return (
      <div className="ws">
        <BackLink lang={lang} go={go} />
        <div className="card" style={{ marginTop: 16 }}>
          <p style={{ marginTop: 0 }}>{tr(S.empty, lang)}</p>
          <button type="button" className="btn primary" onClick={() => go('wortschatz')}>
            ← {tr(S.back, lang)}
          </button>
        </div>
      </div>
    );
  }

  if (finished || !card) {
    return (
      <div className="ws">
        <SessionEnd
          lang={lang}
          correct={answers.filter(Boolean).length}
          total={answers.length}
          missed={deck.filter((_, i) => answers[i] === false)}
          onAgain={onRestart}
          onBack={() => go(backTo)}
          backLabel={scopeLabel(scope, lang)}
          extra={nf ? <NfEndLines answers={nfs.answers} lang={lang} /> : undefined}
        />
      </div>
    );
  }

  const answered = chosen !== null;
  const right = answered && ARTICLES[chosen] === card.article;

  return (
    <div className="ws">
      <div className="exambar">
        <BackLink lang={lang} go={go} to={backTo} />
        <span className="small muted ws-scope">
          {tr(S.articles, lang)} · {scopeLabel(scope, lang)}
        </span>
        <button type="button" className="btn small ghost" onClick={() => (answers.length ? finish(answers) : go(backTo))}>
          {tr(S.finish, lang)}
        </button>
      </div>
      <div className="row small muted" style={{ marginBottom: 8 }}>
        <span>
          {index + 1} / {deck.length}
        </span>
        <span style={{ flex: 1 }}>
          <ShareBar value={index / deck.length} />
        </span>
      </div>

      {nf && (
        <FocusMonitor
          lang={lang}
          signal={nfs.hint}
          onContinue={nfs.dismissHint}
          onBreak={() => {
            nfs.breakHint();
            finish(answers);
          }}
        />
      )}

      <div className="card ws-card ws-art-card">
        <span className="ws-pos">{tr(S.whichArticle, lang)}</span>
        <span className="ws-word">
          {answered ? <span className={`ws-art ws-art-${card.article}`}>{card.article}</span> : <span className="ws-art ws-art-blank">___</span>}{' '}
          {card.de}
        </span>
        <span className="ws-hint">{card.en}</span>
      </div>

      {nf && !answered && (
        <div className="row wrap ws-nf-guess">
          <button type="button" className="chip" aria-pressed={guessing} onClick={() => setGuessing((g) => !g)}>
            🎲 {tr(NF.guessToggle, lang)}
          </button>
          <span className="small muted">{tr(NF.guessHint, lang)}</span>
        </div>
      )}

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
            </strong>{' '}
            · {tr(S.plural, lang)}: {pluralText(card, lang)}
            {tts && <SpeakButton text={spoken(card)} label={S.listen} lang={lang} />}
          </div>
          <div className="body ws-example">{card.example}</div>
          {nf && nfs.feedback && (
            <div className={`body ws-nf-verdict ${nfs.feedback.tone === 'neutral' ? '' : nfs.feedback.tone}`}>{tr(nfs.feedback.text, lang)}</div>
          )}
        </div>
      )}

      <div className="sticky-actions">
        <button type="button" className="btn primary block" disabled={!answered} onClick={next} autoFocus={answered}>
          {tr(S.next, lang)} →
        </button>
      </div>
      <p className="small muted center ws-keys">{tr(S.keysArticles, lang)}</p>
    </div>
  );
}
