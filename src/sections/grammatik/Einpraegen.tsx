// Einprägen: a round of 8 items, each asked until it was answered right three times in a row.
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Confidence, Lang, Text2 } from '../../types.ts';
import { getStore, recordItem, recordResult, useFlag } from '../../lib/storage.ts';
import { isSlow, pastTimes, shouldHold } from '../../lib/neuro.ts';
import { logError, track } from '../../lib/analytics.ts';
import { useKeys } from '../../lib/useKeys.ts';
import { tr } from '../../lib/i18n.ts';
import { type MasterySession, answer, createSession, current, isDone, progress } from '../../lib/mastery.ts';
import { Confirm } from '../../components/Confirm.tsx';
import { MERK_TARGET, type MerkDrill, type MerkQuestion, merkQuestion, pickMerkIds } from '../../content/grammatik/merken.ts';
import { BackLink, CaseTag, S, Sentence, say, useTts } from './shared.tsx';

export const MERK_META: Record<MerkDrill, { icon: string; title: Text2; sub: Text2 }> = {
  verb: {
    icon: '🔗',
    title: { de: 'Verb + Fall', en: 'Verb + case' },
    sub: { de: 'helfen → Dativ oder Akkusativ?', en: 'helfen → dative or accusative?' },
  },
  praep: {
    icon: '🧭',
    title: { de: 'Präposition + Fall', en: 'Preposition + case' },
    sub: { de: 'mit, für, auf, wegen … welcher Fall?', en: 'mit, für, auf, wegen … which case?' },
  },
  vprep: {
    icon: '🧩',
    title: { de: 'Verb/Adjektiv + Präposition', en: 'Verb/adjective + preposition' },
    sub: { de: 'warten auf + Akk · stolz auf + Akk', en: 'warten auf + acc · stolz auf + acc' },
  },
  fehler: {
    icon: '🔁',
    title: { de: 'Meine Fehler', en: 'My mistakes' },
    sub: { de: 'Was Sie falsch hatten – kommt zuerst', en: 'What you got wrong – comes first' },
  },
};

export const E = {
  title: { de: 'Einprägen', en: 'Memorise' },
  intro: {
    de: 'Jede Form kommt so lange wieder, bis Sie sie dreimal hintereinander richtig haben – dann sitzt sie. Falsche Antworten kommen nach 2–4 Fragen zurück.',
    en: 'Each form comes back until you get it right three times in a row – then it sticks. Wrong answers return after 2–4 questions.',
  },
  sitzen: { de: 'sitzen', en: 'memorised' },
  sitzt: { de: 'Sitzt!', en: 'Memorised!' },
  more: { de: 'Noch {n}× richtig, dann sitzt es.', en: '{n} more correct in a row and it sticks.' },
  again: { de: 'Kommt gleich noch einmal.', en: 'It comes back in a moment.' },
  tip: { de: 'Merktipp', en: 'Memory tip' },
  done: { de: 'Alles eingeprägt!', en: 'All memorised!' },
  partial: { de: 'Runde beendet', en: 'Round ended' },
  memorised: { de: '{a} von {b} sitzen', en: '{a} of {b} memorised' },
  tries: { de: '{n} Versuche bis es saß', en: '{n} attempts until it stuck' },
  triesOpen: { de: '{n} Versuche – noch nicht sicher', en: '{n} attempts – not secure yet' },
  wrongTimes: { de: '{n}× falsch', en: '{n}× wrong' },
  perfect: { de: 'Alles beim ersten Mal richtig – stark!', en: 'All right first time – great!' },
  later: { de: 'Diese Formen kommen in den nächsten Tagen wieder (Wiederholung).', en: 'These forms come back over the next days (spaced repetition).' },
  noErrors: { de: 'Noch keine Fehler gespeichert. Üben Sie zuerst ein Set – falsche Antworten landen hier.', en: 'No mistakes saved yet. Practise a set first – wrong answers land here.' },
  dots: { de: 'Fortschritt der Runde', en: 'Round progress' },
} satisfies Record<string, Text2>;

const fill = (text: string, vars: Record<string, number | string>) => text.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));

function Dots({ streak, target, label }: { streak: number; target: number; label?: string }) {
  return (
    <span className="gr-dots" aria-label={label ?? `${streak}/${target}`} role="img">
      {Array.from({ length: target }, (_, i) => (
        <span key={i} className={i < streak ? 'on' : undefined}>
          {i < streak ? '●' : '○'}
        </span>
      ))}
    </span>
  );
}

function build(drill: MerkDrill): string[] {
  try {
    return pickMerkIds(drill, getStore().progress);
  } catch (err) {
    logError(err, `grammatik.einpraegen.build.${drill}`);
    return [];
  }
}

function questionOf(id: string | null): MerkQuestion | null {
  if (!id) return null;
  try {
    return merkQuestion(id);
  } catch (err) {
    logError(err, 'grammatik.einpraegen.question');
    return null;
  }
}

const labelOf = (id: string) => questionOf(id)?.label ?? id;

export default function Einpraegen({ drill, lang, go, onRestart }: { drill: MerkDrill; lang: Lang; go: (r: string) => void; onRestart: () => void }) {
  const [session, setSession] = useState<MasterySession>(() => createSession(build(drill), { target: MERK_TARGET }));
  const [q, setQ] = useState<MerkQuestion | null>(() => questionOf(current(session)));
  const [chosen, setChosen] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const startedAt = useRef(Date.now());
  const shownAt = useRef(Date.now());
  const correct = useRef(0);
  const tts = useTts();

  const [nf] = useFlag('neurofeedback');
  const [guessing, setGuessing] = useState(false);
  const [held, setHeld] = useState(false);

  const total = session.order.length;

  useEffect(() => {
    if (total > 0) track('grammatik.einpraegen_started', { set: drill, items: total });
  }, [drill, total]);

  const finish = useCallback(
    (s: MasterySession) => {
      setFinished(true);
      setConfirmLeave(false);
      const p = progress(s);
      if (p.answers === 0) return;
      try {
        recordResult({ section: 'grammatik', setId: `einpraegen-${drill}`, correct: correct.current, total: p.answers, startedAt: startedAt.current, finishedAt: Date.now() });
      } catch (err) {
        logError(err, 'grammatik.einpraegen.result');
      }
      track('grammatik.einpraegen_finished', { set: drill, items: p.total, mastered: p.mastered, answers: p.answers, retries: p.retries });
    },
    [drill],
  );

  const choose = useCallback(
    (i: number) => {
      if (!q || chosen !== null || finished || i < 0 || i >= q.options.length) return;
      const ok = i === q.answer;
      // A lucky guess does not prove the form sits: it counts as not yet secure.
      const sure = ok && !(nf && guessing);
      setChosen(i);
      if (ok) correct.current++;
      setSession((s) => answer(s, sure));
      try {
        if (nf) {
          const now = Date.now();
          const ms = now - shownAt.current;
          const conf: Confidence = guessing ? 'guess' : 'sure';
          const slow = isSlow(ms, 'choice', pastTimes(getStore().progress, 'merk:'));
          const hold = shouldHold(ok, conf, slow);
          setHeld(hold);
          recordItem(q.id, ok, i, now, { conf, ms, hold });
        } else recordItem(q.id, ok, i, Date.now());
      } catch (err) {
        logError(err, 'grammatik.einpraegen.record');
      }
    },
    [q, chosen, finished, nf, guessing],
  );

  const next = useCallback(() => {
    if (chosen === null) return;
    if (isDone(session)) {
      finish(session);
      return;
    }
    setQ(questionOf(current(session)));
    setChosen(null);
    setGuessing(false);
    setHeld(false);
    shownAt.current = Date.now();
  }, [chosen, session, finish]);

  useKeys({ onOption: finished || confirmLeave ? undefined : choose, onNext: finished || confirmLeave ? undefined : next });

  useEffect(() => {
    window.scrollTo?.(0, 0);
  }, [q, finished]);

  const meta = MERK_META[drill];

  if (total === 0) {
    return (
      <div className="gr">
        <BackLink lang={lang} go={go} />
        <div className="card" style={{ marginTop: 16 }}>
          <p style={{ marginTop: 0 }}>{tr(drill === 'fehler' ? E.noErrors : S.empty, lang)}</p>
          <button type="button" className="btn primary" onClick={() => go('grammatik')}>
            ← {tr(S.overview, lang)}
          </button>
        </div>
      </div>
    );
  }

  const p = progress(session);

  if (finished || !q) {
    const items = [...p.items].sort((a, b) => Number(b.mastered) - Number(a.mastered) || b.attempts - a.attempts);
    const done = p.mastered === p.total;
    return (
      <div className="gr">
        <div className="card center" style={{ marginTop: 16 }}>
          <h1 style={{ marginTop: 0 }}>{tr(done ? E.done : E.partial, lang)} 🧠</h1>
          <div className="score">
            {p.mastered} / {p.total}
          </div>
          <p className="muted" style={{ marginTop: 4 }}>
            {fill(tr(E.memorised, lang), { a: p.mastered, b: p.total })}
          </p>
          {done && p.retries === 0 && <p className="good">{tr(E.perfect, lang)}</p>}
          <ul className="gr-missed gr-merk-list">
            {items
              .filter((it) => it.attempts > 0)
              .map((it) => (
                <li key={it.id}>
                  <strong>{labelOf(it.id)}</strong>
                  {': '}
                  <span className="muted">{fill(tr(it.mastered ? E.tries : E.triesOpen, lang), { n: it.attempts })}</span>{' '}
                  {it.wrong > 0 && <span className="small bad">· {fill(tr(E.wrongTimes, lang), { n: it.wrong })}</span>}
                </li>
              ))}
          </ul>
          <p className="small muted">{tr(E.later, lang)}</p>
          <div className="row wrap" style={{ justifyContent: 'center', marginTop: 14 }}>
            <button type="button" className="btn primary" onClick={onRestart} autoFocus>
              {tr(S.again, lang)}
            </button>
            <button type="button" className="btn" onClick={() => go('grammatik')}>
              ← {tr(S.overview, lang)}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const answered = chosen !== null;
  const right = answered && chosen === q.answer;
  const item = session.items[q.id];
  const streak = item?.streak ?? 0;
  const sits = item?.mastered ?? false;
  const isGap = q.prompt.includes('___');

  return (
    <div className="gr">
      <div className="exambar">
        <BackLink lang={lang} go={go} label={S.overview} />
        <span className="small muted gr-scope">
          {meta.icon} {tr(meta.title, lang)}
        </span>
        <button type="button" className="btn small ghost" onClick={() => (p.answers ? setConfirmLeave(true) : go('grammatik'))}>
          {tr(S.finish, lang)}
        </button>
      </div>

      <div className="row small muted" style={{ marginBottom: 6 }}>
        <span style={{ whiteSpace: 'nowrap' }}>
          {p.mastered} / {p.total} {tr(E.sitzen, lang)}
        </span>
        <span style={{ flex: 1 }}>
          <div className="bar">
            <span style={{ width: `${Math.round((p.mastered / p.total) * 100)}%` }} />
          </div>
        </span>
      </div>
      <div className="gr-mstrip" aria-label={tr(E.dots, lang)}>
        {p.items.map((it) => (
          <span key={it.id} className={`gr-mitem ${it.id === q.id ? 'now' : ''} ${it.mastered ? 'sat' : ''}`}>
            <Dots streak={Math.min(it.streak, MERK_TARGET)} target={MERK_TARGET} />
          </span>
        ))}
      </div>

      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between', gap: 8 }}>
          <span className="gr-task">{tr(q.task, lang)}</span>
          <Dots streak={Math.min(streak, MERK_TARGET)} target={MERK_TARGET} />
        </div>
        <p className={`gr-q center ${isGap ? '' : 'big'}`}>
          {isGap ? <Sentence text={q.prompt} fill={answered ? q.options[q.answer] : undefined} c={answered ? q.kase : undefined} /> : q.prompt}
        </p>
        <p className="small muted center" style={{ margin: 0 }}>
          {q.cue && <span>{tr(q.cue, lang)} · </span>}
          <span>{q.gloss}</span>
        </p>
      </div>

      {nf && !answered && (
        <div className="row wrap gr-nf-guess">
          <button type="button" className="chip" aria-pressed={guessing} onClick={() => setGuessing((g) => !g)}>
            🎲 {tr(S.guess, lang)}
          </button>
          <span className="small muted">{tr(S.guessHint, lang)}</span>
        </div>
      )}

      <div className="options gr-options gr-options-grid">
        {q.options.map((o, i) => {
          let cls = 'option';
          if (answered && i === q.answer) cls += ' correct';
          else if (answered && i === chosen) cls += ' incorrect';
          return (
            <button key={`${q.id}-${session.answers}-${i}`} type="button" className={cls} disabled={answered} onClick={() => choose(i)}>
              <span className="key">{i + 1}</span>
              <span className="body">{o}</span>
            </button>
          );
        })}
      </div>

      {answered && (
        <div className={`verdict ${right ? 'good' : 'bad'}`} role="status">
          <div className="head">
            {right ? tr(S.correct, lang) : `${tr(S.wrong, lang)} ${tr(S.answer, lang)}: ${q.options[q.answer]}`} {q.kase && <CaseTag c={q.kase} lang={lang} />}
          </div>
          <div className="body small">
            {sits ? <strong className="good">{tr(E.sitzt, lang)} 🎉</strong> : right && streak > 0 ? fill(tr(E.more, lang), { n: MERK_TARGET - streak }) : tr(E.again, lang)}
          </div>
          <div className="body gr-why">{tr(q.reason, lang)}</div>
          {nf && held && <div className="body small gr-nf-line">{tr(S.held, lang)}</div>}
        </div>
      )}

      {answered && (
        <div className={`gr-aid gr-tip ${right ? '' : 'strong'}`}>
          <span className="icon" aria-hidden="true">
            💡
          </span>
          <div className="body">
            <strong>{tr(E.tip, lang)}</strong>
            {tr(q.tip, lang)}
          </div>
          {tts && (
            <button type="button" className="btn small ghost" aria-label={tr(S.listen, lang)} title={tr(S.listen, lang)} onClick={() => say(q.chant)}>
              🔊
            </button>
          )}
        </div>
      )}

      <div className="sticky-actions">
        <button type="button" className="btn primary block" disabled={!answered} onClick={next} autoFocus={answered}>
          {tr(S.next, lang)} →
        </button>
      </div>
      <p className="small muted center">{tr(S.keys, lang)}</p>

      {confirmLeave && <Confirm message={tr(S.leaveTitle, lang)} lang={lang} onConfirm={() => finish(session)} onCancel={() => setConfirmLeave(false)} />}
    </div>
  );
}
