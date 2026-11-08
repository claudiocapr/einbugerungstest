import { useCallback, useEffect, useRef, useState } from 'react';
import type { Confidence, Lang } from '../../types.ts';
import type { VocabEntry } from '../../content/types.ts';
import { getStore, recordItem, recordResult, useFlag } from '../../lib/storage.ts';
import { isSlow, pastTimes, shouldHold } from '../../lib/neuro.ts';
import { ConfidencePicker } from '../../components/ConfidencePicker.tsx';
import { logError, track } from '../../lib/analytics.ts';
import { useKeys } from '../../lib/useKeys.ts';
import { tr } from '../../lib/i18n.ts';
import {
  ArticleBadge,
  BackLink,
  EntryDetails,
  POS_LABEL,
  S,
  type Scope,
  ShareBar,
  SpeakButton,
  buildDeck,
  cardKey,
  say,
  scopeLabel,
  spoken,
  useTts,
} from './shared.tsx';
import { useWsSettings } from './settings.ts';
import SessionEnd from './SessionEnd.tsx';
import { FeedbackLine, FocusMonitor, NF, NfEndLines, SpeechCheck, trackNfFinished, useNfSession, useSpeechAvailable } from './nf.tsx';
import { feedbackLine } from './nfLogic.ts';

/** How long the feedback line stays after a card is graded (neurofeedback mode). */
const FEEDBACK_MS = 1500;

/** One flashcard round: German side first, tap to flip, then grade yourself. */
export default function Cards({
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
      return buildDeck(scope, getStore().progress, cardKey);
    } catch (err) {
      logError(err, 'wortschatz.cards.deck');
      return [];
    }
  });
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);
  const startedAt = useRef(Date.now());
  const tts = useTts();
  const [settings, setAutoSpeak] = useWsSettings();
  const backTo = scope === 'due' || scope === 'weak' ? 'wortschatz' : `wortschatz/thema/${scope}`;

  // Neurofeedback mode (test phase): rate before flipping, timing, focus monitor, pronunciation.
  const [nf] = useFlag('neurofeedback');
  const nfs = useNfSession(nf, startedAt.current);
  const { add: nfAdd, flash: nfFlash, getAnswers: nfAnswers } = nfs;
  const speechOk = useSpeechAvailable(nf);
  const shownAt = useRef(Date.now());
  const flipMs = useRef<number | null>(null);
  const [conf, setConf] = useState<Confidence | undefined>(undefined);

  useEffect(() => {
    if (deck.length > 0) track('wortschatz.session_started', { mode: 'cards', topic: scope, n: deck.length });
  }, [deck.length, scope]);

  const card = deck[index] as VocabEntry | undefined;

  // Read the word aloud when a new card appears, if the learner wants that.
  useEffect(() => {
    if (card && tts && settings.autoSpeak && !finished) say(spoken(card));
  }, [card, tts, settings.autoSpeak, finished]);

  const finish = useCallback(
    (all: boolean[]) => {
      setFinished(true);
      if (all.length === 0) return;
      const correct = all.filter(Boolean).length;
      try {
        recordResult({
          section: 'wortschatz',
          setId: `karten-${scope}`,
          correct,
          total: all.length,
          startedAt: startedAt.current,
          finishedAt: Date.now(),
        });
      } catch (err) {
        logError(err, 'wortschatz.cards.result');
      }
      track('wortschatz.session_finished', { mode: 'cards', topic: scope, n: all.length, correct });
      if (nf) trackNfFinished('cards', nfAnswers());
    },
    [scope, nf, nfAnswers],
  );

  const grade = useCallback(
    (ok: boolean) => {
      if (!card || !flipped || finished) return;
      try {
        if (nf) {
          const now = Date.now();
          const ms = flipMs.current ?? now - shownAt.current;
          const slow = isSlow(ms, 'card', pastTimes(getStore().progress, 'vocab:'));
          const hold = shouldHold(ok, conf, slow);
          recordItem(cardKey(card.id), ok, -1, now, { conf, ms, hold });
          nfAdd({ ok, conf, ms, hold });
          nfFlash(feedbackLine(ok, conf, slow, ms), FEEDBACK_MS);
        } else recordItem(cardKey(card.id), ok);
      } catch (err) {
        logError(err, 'wortschatz.cards.record');
      }
      const next = [...answers, ok];
      setAnswers(next);
      if (index + 1 >= deck.length) finish(next);
      else {
        setIndex(index + 1);
        setFlipped(false);
        if (nf) {
          shownAt.current = Date.now();
          flipMs.current = null;
          setConf(undefined);
        }
      }
    },
    [card, flipped, finished, answers, index, deck.length, finish, nf, conf, nfAdd, nfFlash],
  );

  const flip = useCallback(() => {
    if (finished) return;
    // The time to recall counts up to the first flip, with or without a rating.
    if (nf && flipMs.current === null) flipMs.current = Date.now() - shownAt.current;
    setFlipped((f) => !f);
  }, [finished, nf]);

  /** Neurofeedback mode: rating how sure you are flips the card. */
  const pickConf = useCallback(
    (c: Confidence) => {
      if (finished || flipped) return;
      // Already seen (flipped and turned back): a rating now would not be honest.
      if (flipMs.current === null) {
        flipMs.current = Date.now() - shownAt.current;
        setConf(c);
      }
      setFlipped(true);
    },
    [finished, flipped],
  );

  useKeys({
    onOption: (i) => {
      if (i === 0) grade(true);
      else if (i === 1) grade(false);
    },
    onNext: () => {
      if (!flipped) flip();
    },
  });

  // Space flips the card, unless a button or field has focus (then it keeps its usual meaning).
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== ' ' || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'BUTTON' || t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      e.preventDefault();
      flip();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [flip]);

  if (deck.length === 0) {
    return (
      <div className="ws">
        <BackLink lang={lang} go={go} />
        <div className="card" style={{ marginTop: 16 }}>
          <p style={{ marginTop: 0 }}>
            {scope === 'due' ? tr(S.dueNone, lang) : scope === 'weak' ? tr(S.weakNone, lang) : tr(S.empty, lang)}
          </p>
          <button type="button" className="btn primary" onClick={() => go('wortschatz')}>
            ← {tr(S.back, lang)}
          </button>
        </div>
      </div>
    );
  }

  if (finished || !card) {
    const missed = deck.filter((_, i) => answers[i] === false);
    return (
      <div className="ws">
        <SessionEnd
          lang={lang}
          correct={answers.filter(Boolean).length}
          total={answers.length}
          missed={missed}
          onAgain={onRestart}
          onBack={() => go(backTo)}
          backLabel={scopeLabel(scope, lang)}
          extra={nf ? <NfEndLines answers={nfs.answers} lang={lang} /> : undefined}
        />
      </div>
    );
  }

  return (
    <div className="ws">
      <div className="exambar">
        <BackLink lang={lang} go={go} to={backTo} />
        <span className="small muted ws-scope">{scopeLabel(scope, lang)}</span>
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

      <div
        role="button"
        tabIndex={0}
        className={`card ws-card ${flipped ? 'flipped' : ''}`}
        onClick={flip}
        aria-expanded={flipped}
      >
        <span className="ws-pos">{tr(POS_LABEL[card.pos], lang)}</span>
        <span className="ws-word">
          <ArticleBadge article={card.article} /> {card.de}
        </span>
        {!flipped && <span className="ws-hint">{tr(nf ? NF.rateFirst : S.tapToFlip, lang)}</span>}
        {flipped && (
          <div className="ws-back-side">
            <span className="ws-en">{card.en}</span>
            <EntryDetails e={card} lang={lang} />
            <span className="ws-example">{card.example}</span>
            <span className="ws-example-en">{card.exampleEn}</span>
          </div>
        )}
      </div>

      {tts && (
        <div className="row wrap ws-speak">
          <SpeakButton text={spoken(card)} label={S.listen} lang={lang} small={false} />
          {flipped && <SpeakButton text={card.example} label={S.listenExample} lang={lang} small={false} />}
          <label className="ws-toggle small">
            <input type="checkbox" checked={settings.autoSpeak} onChange={(e) => setAutoSpeak(e.target.checked)} />
            <span>{tr(S.autoSpeak, lang)}</span>
          </label>
        </div>
      )}

      {nf && flipped && speechOk && <SpeechCheck key={card.id} entry={card} lang={lang} />}

      <div className="sticky-actions">
        {flipped ? (
          <>
            <button type="button" className="btn block ws-knew" onClick={() => grade(true)}>
              ✓ {tr(S.knew, lang)} <kbd>1</kbd>
            </button>
            <button type="button" className="btn block ws-missed-btn" onClick={() => grade(false)}>
              ✗ {tr(S.didntKnow, lang)} <kbd>2</kbd>
            </button>
          </>
        ) : nf ? (
          <ConfidencePicker lang={lang} onPick={pickConf} />
        ) : (
          <button type="button" className="btn primary block" onClick={flip}>
            {tr(S.tapToFlip, lang)}
          </button>
        )}
      </div>
      {nf && <FeedbackLine feedback={nfs.feedback} lang={lang} />}
      <p className="small muted center ws-keys">{tr(nf ? NF.keysCards : S.keysCards, lang)}</p>
    </div>
  );
}
