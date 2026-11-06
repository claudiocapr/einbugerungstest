import { useEffect, useState } from 'react';
import type { ItemProgress, Lang, Text2 } from '../../types.ts';
import type { PartOfSpeech, TopicId, VocabEntry } from '../../content/types.ts';
import { vocab } from '../../content/wortschatz.ts';
import { TOPICS } from '../../content/topics.ts';
import { dueOrder, historyOf, isWeak, practiceOrder, strengthLevel } from '../../lib/srs.ts';
import { shuffle } from '../../lib/random.ts';
import { speak, stop, ttsAvailable } from '../../lib/tts.ts';
import { logError } from '../../lib/analytics.ts';
import { tr } from '../../lib/i18n.ts';

/* ------------------------------------------------------------------ strings */

export const S = {
  title: { de: 'Wortschatz', en: 'Vocabulary' },
  intro: { de: 'B1-Wörter und Wendungen nach Themen – mit Karteikarten und Artikel-Trainer.', en: 'B1 words and phrases by topic – with flashcards and an article trainer.' },
  back: { de: 'Wortschatz', en: 'Vocabulary' },
  due: { de: 'Fällige Karten', en: 'Cards due' },
  dueSub: { de: 'Wiederholen, was heute dran ist', en: 'Review what is scheduled for today' },
  dueNone: { de: 'Gerade ist nichts fällig. Lernen Sie neue Wörter!', en: 'Nothing is due right now. Learn some new words!' },
  weak: { de: 'Schwache Wörter', en: 'Weak words' },
  weakSub: { de: 'Wörter, die Sie noch nicht sicher können', en: 'Words you don’t know well yet' },
  weakNone: { de: 'Keine schwachen Wörter – sehr gut!', en: 'No weak words – well done!' },
  mixed: { de: 'Gemischt lernen', en: 'Mixed practice' },
  mixedSub: { de: '15 Karten aus allen Themen', en: '15 cards from all topics' },
  articles: { de: 'Artikel-Trainer', en: 'Article trainer' },
  articlesSub: { de: 'der, die oder das?', en: 'der, die or das?' },
  browseAll: { de: 'Alle Wörter durchsuchen', en: 'Search all words' },
  browseAllSub: { de: 'Liste mit Lernstand', en: 'List with your progress' },
  topics: { de: 'Themen', en: 'Topics' },
  words: { de: 'Wörter', en: 'words' },
  strongShort: { de: 'sicher', en: 'strong' },
  autoSpeak: { de: 'Automatisch vorlesen', en: 'Read aloud automatically' },
  learn: { de: 'Karteikarten lernen', en: 'Study flashcards' },
  search: { de: 'Suchen (Deutsch oder Englisch) …', en: 'Search (German or English) …' },
  noMatch: { de: 'Keine Treffer.', en: 'No matches.' },
  all: { de: 'Alle', en: 'All' },
  allWords: { de: 'Alle Wörter', en: 'All words' },
  total: { de: 'Wörter', en: 'Words' },
  newOnes: { de: 'Neu', en: 'New' },
  weakOnes: { de: 'Schwach', en: 'Weak' },
  strongOnes: { de: 'Sicher', en: 'Strong' },
  tapToFlip: { de: 'Tippen zum Umdrehen', en: 'Tap to flip' },
  knew: { de: 'Gewusst', en: 'Knew it' },
  didntKnow: { de: 'Nicht gewusst', en: 'Didn’t know' },
  listen: { de: 'Wort', en: 'Word' },
  listenExample: { de: 'Beispiel', en: 'Example' },
  plural: { de: 'Plural', en: 'Plural' },
  noPlural: { de: 'kein Plural', en: 'no plural' },
  forms: { de: 'Formen', en: 'Forms' },
  government: { de: 'Mit', en: 'Pattern' },
  example: { de: 'Beispiel', en: 'Example' },
  finish: { de: 'Beenden', en: 'Finish' },
  next: { de: 'Weiter', en: 'Next' },
  done: { de: 'Runde geschafft!', en: 'Round complete!' },
  again: { de: 'Neue Runde', en: 'New round' },
  missed: { de: 'Diese Wörter üben Sie noch einmal', en: 'Words to practise again' },
  allKnown: { de: 'Alles gewusst – prima!', en: 'You knew them all – great!' },
  empty: { de: 'Hier gibt es gerade keine Karten.', en: 'There are no cards here right now.' },
  whichArticle: { de: 'Welcher Artikel ist richtig?', en: 'Which article is correct?' },
  correct: { de: 'Richtig!', en: 'Correct!' },
  wrong: { de: 'Leider falsch.', en: 'Not quite.' },
  keysCards: { de: 'Tasten: Leertaste = umdrehen, 1 = gewusst, 2 = nicht gewusst', en: 'Keys: space = flip, 1 = knew it, 2 = didn’t know' },
  keysArticles: { de: 'Tasten: 1 = der, 2 = die, 3 = das, Enter = weiter', en: 'Keys: 1 = der, 2 = die, 3 = das, Enter = next' },
  notFound: { de: 'Diese Seite gibt es nicht.', en: 'This page does not exist.' },
} satisfies Record<string, Text2>;

export const POS_LABEL: Record<PartOfSpeech, Text2> = {
  noun: { de: 'Nomen', en: 'Noun' },
  verb: { de: 'Verb', en: 'Verb' },
  adjective: { de: 'Adjektiv', en: 'Adjective' },
  adverb: { de: 'Adverb', en: 'Adverb' },
  phrase: { de: 'Wendung', en: 'Phrase' },
  other: { de: 'Sonstiges', en: 'Other' },
};

/* ------------------------------------------------------------------- scopes */

export type Scope = TopicId | 'all' | 'due' | 'weak';

const TOPIC_IDS = new Set<string>(TOPICS.map((t) => t.id));
export const isTopic = (s: string | undefined): s is TopicId => !!s && TOPIC_IDS.has(s);

export function scopeLabel(scope: Scope, lang: Lang): string {
  if (scope === 'all') return tr(S.allWords, lang);
  if (scope === 'due') return tr(S.due, lang);
  if (scope === 'weak') return tr(S.weak, lang);
  return TOPICS.find((t) => t.id === scope)?.label[lang] ?? scope;
}

export const cardKey = (id: string) => `vocab:${id}`;
export const articleKey = (id: string) => `vocab-art:${id}`;

export const SESSION_SIZE = 15;

const byId = new Map(vocab.map((e) => [e.id, e]));

export const entriesOf = (scope: TopicId | 'all'): VocabEntry[] =>
  scope === 'all' ? vocab : vocab.filter((e) => e.topic === scope);

/**
 * The cards for one session: due ones, weak ones, or a topic in practice
 * order (unseen first, then the weakest). The pick is shuffled so a round does
 * not always run in list order.
 */
export function buildDeck(
  scope: Scope,
  progress: Record<string, ItemProgress>,
  keyOf: (id: string) => string,
  filter: (e: VocabEntry) => boolean = () => true,
  now = Date.now(),
): VocabEntry[] {
  const pool = (scope === 'due' || scope === 'weak' ? vocab : entriesOf(scope)).filter(filter);
  const keys = pool.map((e) => keyOf(e.id));
  let ordered: string[];
  if (scope === 'due') ordered = dueOrder(keys, progress, now);
  else if (scope === 'weak') ordered = practiceOrder(keys.filter((k) => isWeak(progress[k], now)), progress, now);
  else {
    ordered = practiceOrder(keys, progress, now);
    if (scope === 'all') {
      // Across all topics, new words come from everywhere rather than topic by topic.
      const unseen = ordered.filter((k) => historyOf(progress[k]).length === 0);
      const seen = ordered.filter((k) => historyOf(progress[k]).length > 0);
      ordered = [...shuffle(unseen), ...seen];
    }
  }
  const prefix = keyOf('');
  return shuffle(ordered.slice(0, SESSION_SIZE))
    .map((k) => byId.get(k.slice(prefix.length)))
    .filter((e): e is VocabEntry => !!e);
}

export interface Counts {
  total: number;
  fresh: number;
  weak: number;
  strong: number;
}

export function countsFor(entries: VocabEntry[], progress: Record<string, ItemProgress>, now = Date.now()): Counts {
  const c: Counts = { total: entries.length, fresh: 0, weak: 0, strong: 0 };
  for (const e of entries) {
    const level = strengthLevel(progress[cardKey(e.id)], now);
    if (level === 'new') c.fresh++;
    else if (level === 'strong') c.strong++;
    else if (level === 'weak' || level === 'shaky') c.weak++;
  }
  return c;
}

/* ---------------------------------------------------------------- bits of UI */

/** What text-to-speech reads for an entry: the article belongs to the noun. */
export const spoken = (e: VocabEntry) => (e.article ? `${e.article} ${e.de}` : e.de);

export const pluralText = (e: VocabEntry, lang: Lang) =>
  !e.plural || e.plural === '-' ? tr(S.noPlural, lang) : `die ${e.plural}`;

export function ArticleBadge({ article }: { article?: VocabEntry['article'] }) {
  if (!article) return null;
  return <span className={`ws-art ws-art-${article}`}>{article}</span>;
}

/** Whether speech is possible, checked after mount so server-free builds and old browsers agree. */
export function useTts(): boolean {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    try {
      setOk(ttsAvailable());
    } catch (err) {
      logError(err, 'wortschatz.tts');
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
    void speak(text);
  } catch (err) {
    logError(err, 'wortschatz.speak');
  }
}

export function SpeakButton({ text, label, lang, small = true }: { text: string; label: Text2; lang: Lang; small?: boolean }) {
  return (
    <button
      type="button"
      className={`btn ghost ${small ? 'small' : ''}`}
      aria-label={tr(label, lang)}
      title={tr(label, lang)}
      onClick={(e) => {
        e.stopPropagation();
        say(text);
      }}
    >
      🔊{small ? '' : ` ${tr(label, lang)}`}
    </button>
  );
}

export function BackLink({ lang, go, to = 'wortschatz' }: { lang: Lang; go: (r: string) => void; to?: string }) {
  return (
    <button type="button" className="btn small ghost ws-back" onClick={() => go(to)}>
      ← {tr(S.back, lang)}
    </button>
  );
}

/** A thin bar for a 0..1 share. */
export function ShareBar({ value, good = false }: { value: number; good?: boolean }) {
  return (
    <div className={`bar ${good ? 'good' : ''}`}>
      <span style={{ width: `${Math.round(Math.min(Math.max(value, 0), 1) * 100)}%` }} />
    </div>
  );
}

/** The details shown on the back of a card and in the word list. */
export function EntryDetails({ e, lang }: { e: VocabEntry; lang: Lang }) {
  return (
    <dl className="ws-details">
      {e.pos === 'noun' && (
        <>
          <dt>{tr(S.plural, lang)}</dt>
          <dd>{pluralText(e, lang)}</dd>
        </>
      )}
      {e.forms && (
        <>
          <dt>{tr(S.forms, lang)}</dt>
          <dd>{e.forms}</dd>
        </>
      )}
      {e.government && (
        <>
          <dt>{tr(S.government, lang)}</dt>
          <dd>{e.government}</dd>
        </>
      )}
    </dl>
  );
}
