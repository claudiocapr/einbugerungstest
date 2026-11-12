// Grammatik: Fälle – the four cases, tables with memory aids, and auto-graded drills.
//
// Routes:
//   #/grammatik                        overview: learn pages, exercises with progress
//   #/grammatik/lernen/<page>          faelle, artikel, possessiv, pronomen, fragen,
//                                      allein, adjektive, ndekl, warum, eselsbruecken
//   #/grammatik/ueben/<exercise>       tabelle, luecke, pronomen, fall, praep, adjektiv,
//                                      schwach (weak forms from spaced repetition)
//   #/grammatik/einpraegen/<set>       verb, praep, vprep, fehler: memorise until each item
//                                      was right three times in a row
//   #/grammatik/lernen/merktipps       every case memory tip in one place
import { useEffect, useState } from 'react';
import type { SectionProps } from '../types.ts';
import { tr } from '../../lib/i18n.ts';
import { EXERCISES } from '../../content/grammatik/items.ts';
import { isMerkDrill } from '../../content/grammatik/merken.ts';
import Overview from './Overview.tsx';
import Learn, { LEARN_PAGES, isLearnPage } from './Learn.tsx';
import { Aids, WhyCase } from './Why.tsx';
import Drill, { type DrillId } from './Drill.tsx';
import Einpraegen from './Einpraegen.tsx';
import Merktipps from './Merktipps.tsx';
import { BackLink, S } from './shared.tsx';
import './grammatik.css';

const isDrill = (s: string | undefined): s is DrillId => s === 'schwach' || (EXERCISES as string[]).includes(s ?? '');

function LearnShell({ page, lang, go }: { page: string; lang: SectionProps['lang']; go: SectionProps['go'] }) {
  const i = LEARN_PAGES.findIndex((p) => p.id === page);
  const prev = LEARN_PAGES[i - 1];
  const next = LEARN_PAGES[i + 1];
  useEffect(() => {
    window.scrollTo?.(0, 0);
  }, [page]);
  return (
    <div className="gr">
      <BackLink lang={lang} go={go} label={S.overview} />
      {page === 'warum' ? (
        <WhyCase lang={lang} />
      ) : page === 'eselsbruecken' ? (
        <Aids lang={lang} />
      ) : page === 'merktipps' ? (
        <Merktipps lang={lang} />
      ) : isLearnPage(page) ? (
        <Learn page={page} lang={lang} />
      ) : null}
      <div className="row wrap" style={{ marginTop: 20, justifyContent: 'space-between' }}>
        {prev ? (
          <button type="button" className="btn small" onClick={() => go(`grammatik/lernen/${prev.id}`)}>
            ← {tr(prev.title, lang)}
          </button>
        ) : (
          <span />
        )}
        {next && (
          <button type="button" className="btn small" onClick={() => go(`grammatik/lernen/${next.id}`)}>
            {tr(next.title, lang)} →
          </button>
        )}
      </div>
      <div className="sticky-actions">
        <button type="button" className="btn primary block" onClick={() => go('grammatik')}>
          {tr(S.practise, lang)} ✍️
        </button>
      </div>
    </div>
  );
}

export default function Section({ lang, path, go }: SectionProps) {
  const [view, sub] = path;
  // Bumped by "Neue Runde" so a round starts over with freshly picked items.
  const [round, setRound] = useState(0);

  if (!view) return <Overview lang={lang} go={go} />;

  if (view === 'lernen' && sub && (isLearnPage(sub) || sub === 'warum' || sub === 'eselsbruecken' || sub === 'merktipps')) {
    return <LearnShell page={sub} lang={lang} go={go} />;
  }

  if (view === 'ueben' && isDrill(sub)) {
    return <Drill key={`${sub}-${round}`} ex={sub} lang={lang} go={go} onRestart={() => setRound((r) => r + 1)} />;
  }

  if (view === 'einpraegen' && isMerkDrill(sub)) {
    return <Einpraegen key={`${sub}-${round}`} drill={sub} lang={lang} go={go} onRestart={() => setRound((r) => r + 1)} />;
  }

  return (
    <div className="gr card" style={{ marginTop: 24 }}>
      <p style={{ marginTop: 0 }}>{tr(S.notFound, lang)}</p>
      <button type="button" className="btn" onClick={() => go('grammatik')}>
        ← {tr(S.back, lang)}
      </button>
    </div>
  );
}
