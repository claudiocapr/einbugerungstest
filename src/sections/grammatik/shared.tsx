import { useEffect, useState, type ReactNode } from 'react';
import type { Lang, Text2 } from '../../types.ts';
import { tr } from '../../lib/i18n.ts';
import { speak, stop, ttsAvailable } from '../../lib/tts.ts';
import { logError } from '../../lib/analytics.ts';
import { CASE_NAME, type Case, GENDER_NAME, type Gender } from '../../content/grammatik/forms.ts';
import type { ExId } from '../../content/grammatik/items.ts';

export const S = {
  title: { de: 'Grammatik: Fälle', en: 'Grammar: cases' },
  intro: {
    de: 'Nominativ, Akkusativ, Dativ, Genitiv – verstehen, in Tabellen sehen, mit Eselsbrücken merken und üben, bis die Formen automatisch kommen.',
    en: 'Nominative, accusative, dative, genitive – understand them, see them in tables, memorise them with mnemonics and practise until the forms come automatically.',
  },
  learn: { de: 'Lernen', en: 'Learn' },
  practise: { de: 'Üben', en: 'Practise' },
  back: { de: 'Zurück', en: 'Back' },
  overview: { de: 'Übersicht', en: 'Overview' },
  notFound: { de: 'Diese Seite gibt es nicht.', en: 'This page does not exist.' },
  weak: { de: 'Schwache Formen', en: 'Weak forms' },
  weakSub: { de: 'Fällige und falsch beantwortete Formen wiederholen', en: 'Repeat forms that are due or were answered wrong' },
  weakNone: { de: 'Noch nichts fällig – erst üben', en: 'Nothing due yet – practise first' },
  practised: { de: 'geübt', en: 'practised' },
  strong: { de: 'sicher', en: 'strong' },
  items: { de: 'Aufgaben', en: 'items' },
  next: { de: 'Weiter', en: 'Next' },
  finish: { de: 'Beenden', en: 'Finish' },
  correct: { de: 'Richtig!', en: 'Correct!' },
  wrong: { de: 'Leider falsch.', en: 'Not quite.' },
  answer: { de: 'Richtig ist', en: 'The answer is' },
  done: { de: 'Runde geschafft', en: 'Round complete' },
  again: { de: 'Neue Runde', en: 'New round' },
  missed: { de: 'Das üben wir noch einmal', en: 'We will practise these again' },
  allRight: { de: 'Alles richtig – stark!', en: 'All correct – great!' },
  keys: { de: 'Tasten: 1–4 antworten, Enter = weiter', en: 'Keys: 1–4 to answer, Enter = next' },
  listen: { de: 'Anhören', en: 'Listen' },
  empty: { de: 'Hier gibt es gerade nichts zu üben.', en: 'There is nothing to practise here right now.' },
  guess: { de: 'Ich rate', en: 'I’m guessing' },
  guessHint: { de: 'Vorher antippen, wenn Sie nur raten.', en: 'Tap first if you are only guessing.' },
  held: { de: 'Geraten oder langsam – kommt morgen wieder.', en: 'Guessed or slow – it comes back tomorrow.' },
  leaveTitle: { de: 'Runde beenden? Die beantworteten Aufgaben sind gespeichert.', en: 'End this round? The answered items are saved.' },
} satisfies Record<string, Text2>;

export const EX_META: Record<ExId | 'schwach', { icon: string; title: Text2; sub: Text2 }> = {
  tabelle: {
    icon: '🔢',
    title: { de: 'Artikel-Tabelle', en: 'Article table' },
    sub: { de: 'der · ein · kein · mein … in allen Fällen', en: 'der · ein · kein · mein … in every case' },
  },
  luecke: {
    icon: '✍️',
    title: { de: 'Lückensätze', en: 'Gap sentences' },
    sub: { de: 'Ich helfe ___ Mutter. – Form und Grund', en: 'Ich helfe ___ Mutter. – form and reason' },
  },
  pronomen: {
    icon: '🔁',
    title: { de: 'Pronomen-Tausch', en: 'Pronoun swap' },
    sub: { de: 'dem Kollegen → ihm · es ihm · mich/mir', en: 'dem Kollegen → ihm · es ihm · mich/mir' },
  },
  fall: {
    icon: '🔍',
    title: { de: 'Fall erkennen', en: 'Case detective' },
    sub: { de: 'Welcher Fall ist das – und warum?', en: 'Which case is it – and why?' },
  },
  praep: {
    icon: '🧭',
    title: { de: 'Präpositionen sortieren', en: 'Sort prepositions' },
    sub: { de: 'Akk · Dat · Wechsel · Gen – schnell', en: 'acc · dat · two-way · gen – fast' },
  },
  adjektiv: {
    icon: '🎨',
    title: { de: 'Adjektivendungen', en: 'Adjective endings' },
    sub: { de: 'ein guter Film · mit frischem Brot', en: 'ein guter Film · mit frischem Brot' },
  },
  schwach: {
    icon: '🎯',
    title: { de: 'Schwache Formen', en: 'Weak forms' },
    sub: { de: 'Was fällig oder falsch war', en: 'What is due or was wrong' },
  },
};

export function BackLink({ lang, go, to = 'grammatik', label }: { lang: Lang; go: (r: string) => void; to?: string; label?: Text2 }) {
  return (
    <button type="button" className="btn small ghost gr-back" onClick={() => go(to)}>
      ← {tr(label ?? S.back, lang)}
    </button>
  );
}

/** A small pill in the colour of its case. */
export function CaseTag({ c, lang, short = false }: { c: Case; lang: Lang; short?: boolean }) {
  const name = CASE_NAME[c][lang];
  return <span className={`gr-tag gr-${c}`}>{short ? name.slice(0, 3) + '.' : name}</span>;
}

export function GenderTag({ g, lang }: { g: Gender; lang: Lang }) {
  return <span className="gr-tag plain">{GENDER_NAME[g][lang]}</span>;
}

/** A form with its ending underlined in the case colour: unser|em. */
export function Ending({ stem, end, c }: { stem: string; end: string; c?: Case }) {
  return (
    <span className={c ? `gr-${c}` : undefined}>
      {stem}
      {end && <span className="gr-end">{end}</span>}
    </span>
  );
}

/** der-article forms with the last letter highlighted (r-e-s-e, n-e-s-e, …). */
export function LastLetter({ word, c }: { word: string; c?: Case }) {
  return <Ending stem={word.slice(0, -1)} end={word.slice(-1)} c={c} />;
}

/* ------------------------------------------------------------------ speech */

export function useTts(): boolean {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    try {
      setOk(ttsAvailable());
    } catch (err) {
      logError(err, 'grammatik.tts');
    }
    return () => {
      try {
        stop();
      } catch {
        /* nothing to stop */
      }
    };
  }, []);
  return ok;
}

export function say(text: string) {
  try {
    stop();
    void speak(text, { rate: 0.9 });
  } catch (err) {
    logError(err, 'grammatik.speak');
  }
}

export function SpeakButton({ text, lang }: { text: string; lang: Lang }) {
  return (
    <button type="button" className="btn small ghost" aria-label={tr(S.listen, lang)} title={tr(S.listen, lang)} onClick={() => say(text)}>
      🔊
    </button>
  );
}

/** An Eselsbrücke: a memory aid, with an optional chant to listen to. */
export function Aid({ title, children, chant, lang, tts }: { title: string; children?: ReactNode; chant?: string; lang: Lang; tts: boolean }) {
  return (
    <div className="gr-aid">
      <span className="icon" aria-hidden="true">
        💡
      </span>
      <div className="body">
        <strong>{title}</strong>
        {children}
      </div>
      {chant && tts && <SpeakButton text={chant} lang={lang} />}
    </div>
  );
}

/* ---------------------------------------------------------------- sentences */

/**
 * Renders a practice sentence: "___" becomes the gap (filled once answered),
 * [brackets] mark the phrase to analyse.
 */
export function Sentence({ text, fill, c, hint }: { text: string; fill?: string; c?: Case; hint?: string }) {
  const parts: ReactNode[] = [];
  const re = /___|\[([^\]]+)\]/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[0] === '___') {
      const atStart = m.index === 0;
      const shown = fill ? (atStart ? fill[0].toUpperCase() + fill.slice(1) : fill) : ' ';
      parts.push(
        <span key={i++} className={`gap ${fill ? 'filled' : ''} ${c ? `gr-${c}` : ''}`}>
          {shown}
        </span>,
      );
    } else {
      parts.push(
        <span key={i++} className="mark">
          {m[1]}
        </span>,
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return (
    <>
      {parts}
      {hint && <span className="hint"> {hint}</span>}
    </>
  );
}

export const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);
