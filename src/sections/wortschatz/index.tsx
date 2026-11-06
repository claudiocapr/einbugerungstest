// Wortschatz: B1 vocabulary by topic, flashcards with spaced repetition, and an article trainer.
//
// Routes:
//   #/wortschatz                          overview (due, weak, topics)
//   #/wortschatz/thema/<topic|all>        word list with search and progress
//   #/wortschatz/lernen/<topic|all|due|weak>   flashcard round (15 cards)
//   #/wortschatz/artikel/<topic|all|due|weak>  der/die/das trainer (15 nouns)
import { useState } from 'react';
import type { SectionProps } from '../types.ts';
import { tr } from '../../lib/i18n.ts';
import Overview from './Overview.tsx';
import TopicView from './TopicView.tsx';
import Cards from './Cards.tsx';
import Articles from './Articles.tsx';
import { S, type Scope, isTopic } from './shared.tsx';
import './wortschatz.css';

const isScope = (s: string | undefined): s is Scope => s === 'all' || s === 'due' || s === 'weak' || isTopic(s);

export default function Section({ lang, path, go }: SectionProps) {
  const [view, scope] = path;
  // Bumped by "Neue Runde" so a session starts over with a freshly picked deck.
  const [round, setRound] = useState(0);
  const restart = () => setRound((r) => r + 1);

  if (!view) return <Overview lang={lang} go={go} />;

  if (view === 'thema' && (scope === 'all' || isTopic(scope))) {
    return <TopicView key={scope} scope={scope} lang={lang} go={go} />;
  }
  if (view === 'lernen' && isScope(scope)) {
    return <Cards key={`${scope}-${round}`} scope={scope} lang={lang} go={go} onRestart={restart} />;
  }
  if (view === 'artikel' && isScope(scope)) {
    return <Articles key={`${scope}-${round}`} scope={scope} lang={lang} go={go} onRestart={restart} />;
  }

  return (
    <div className="card" style={{ marginTop: 24 }}>
      <p style={{ marginTop: 0 }}>{tr(S.notFound, lang)}</p>
      <button type="button" className="btn" onClick={() => go('wortschatz')}>
        ← {tr(S.back, lang)}
      </button>
    </div>
  );
}
