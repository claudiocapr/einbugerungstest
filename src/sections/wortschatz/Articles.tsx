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
import { genderTip, genderTipText } from '../../content/merktipps.ts';
import { MT, spokenTip } from './Merktipp.tsx';
import { RETRY_GAP, requeue } from './genusDrill.ts';

const ARTICLES = ['der', 'die', 'das'] as const;
const isNoun = (e: VocabEntry) => e.pos === 'noun' && !!e.article;

const AT = {
  retry: { de: 'Kommt gleich noch einmal – bis es sitzt.', en: 'Coming back in a moment – until it sticks.' },
  retryBadge: { de: 'Wiederholung', en: 'Retry' },
};

/**
 * Artikel-Trainer: pick der, die or das for a noun; graded at once, with the
 * Merktipp. A wrong noun is asked again three cards later, so a round ends
 * only when every noun was answered correctly.
 */
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
  // The cards still to show: the deck plus every re-queued retry.
  const [queue, setQueue] = useState<VocabEntry[]>(deck);
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  /** First answer per noun id: what the score counts. */
  const [first, setFirst] = useState<Record<string, boolean>>({});
  const [retries, setRetries] = useState(0);
  const [finished, setFinished] = useState(false);
  const startedAt = useRef(Date.now());
  const tts = useTts();
  const [settings] = useWsSettings();
  const backTo = scope === 'due' || scope === 'weak' ? 'wortschatz' : `wortschatz/thema/${scope}`;
  const card = queue[index] as VocabEntry | undefined;
  const isRetry = !!card && first[card.id] !== undefined && chosen === null;

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
    (firstAnswers: Record<string, boolean>) => {
      setFinished(true);
      const all = Object.values(firstAnswers);
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
      track('wortschatz.session_finished', { mode: 'articles', topic: scope, n: all.length, correct, retries });
      if (nf) trackNfFinished('articles', nfAnswers());
    },
    [scope, nf, nfAnswers, retries],
  );

  const choose = useCallback(
    (i: number) => {
      if (!card || chosen !== null || i < 0 || i > 2) return;
      const ok = ARTICLES[i] === card.article;
      setChosen(i);
      if (first[card.id] === undefined) setFirst((f) => ({ ...f, [card.id]: ok }));
      if (!ok) {
        setQueue((q) => requeue(q, index, card, RETRY_GAP));
        setRetries((r) => r + 1);
      }
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
    [card, chosen, tts, settings.autoSpeak, nf, guessing, nfAdd, nfFlash, first, index],
  );

  const next = useCallback(() => {
    if (chosen === null) return;
    if (index + 1 >= queue.length) finish(first);
    else {
      setIndex(index + 1);
      setChosen(null);
      if (nf) {
        nfClear();
        setGuessing(false);
        shownAt.current = Date.now();
      }
    }
  }, [chosen, index, queue.length, first, finish, nf, nfClear]);

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
    const answered = Object.values(first);
    return (
      <div className="ws">
        <SessionEnd
          lang={lang}
          correct={answered.filter(Boolean).length}
          total={answered.length}
          missed={deck.filter((e) => first[e.id] === false)}
          retries={retries}
          complete={index + 1 >= queue.length}
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
  const tip = answered ? genderTip(card) : null;
  const tipText = tip ? genderTipText(tip, card) : null;
  const answeredCount = Object.keys(first).length;

  return (
    <div className="ws">
      <div className="exambar">
        <BackLink lang={lang} go={go} to={backTo} />
        <span className="small muted ws-scope">
          {tr(S.articles, lang)} · {scopeLabel(scope, lang)}
        </span>
        <button type="button" className="btn small ghost" onClick={() => (answeredCount ? finish(first) : go(backTo))}>
          {tr(S.finish, lang)}
        </button>
      </div>
      <div className="row small muted" style={{ marginBottom: 8 }}>
        <span>
          {index + 1} / {queue.length}
        </span>
        <span style={{ flex: 1 }}>
          <ShareBar value={index / queue.length} />
        </span>
        {retries > 0 && <span>🔁 {retries}</span>}
      </div>

      {nf && (
        <FocusMonitor
          lang={lang}
          signal={nfs.hint}
          onContinue={nfs.dismissHint}
          onBreak={() => {
            nfs.breakHint();
            finish(first);
          }}
        />
      )}

      <div className="card ws-card ws-art-card">
        <span className="ws-pos">
          {tr(S.whichArticle, lang)}
          {isRetry && <span className="badge bad ws-retry-badge">🔁 {tr(AT.retryBadge, lang)}</span>}
        </span>
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
          {tipText && (
            <div className={`body ws-verdict-tip ${tip!.matches ? '' : 'ws-tip-exc'}`}>
              💡 {tr(tipText, lang)}
              {tts && <SpeakButton text={spokenTip(tipText.de)} label={MT.listenTip} lang={lang} />}
            </div>
          )}
          {!right && <div className="body small">{tr(AT.retry, lang)}</div>}
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
