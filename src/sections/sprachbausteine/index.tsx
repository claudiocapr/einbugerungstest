import { useState } from 'react';
import type { SectionProps } from '../types.ts';
import type { Lang, Text2 } from '../../types.ts';
import type { Sb2Set } from '../../content/types.ts';
import { sb1, sb2 } from '../../content/sprachbausteine.ts';
import { tr } from '../../lib/i18n.ts';
import { DrillFrame, NotFound, PartCard, type PartInfo } from '../lesen/drill.tsx';
import { Sb1Task, Sb2Task, Sb2WordBank } from './tasks.tsx';
import { SB_PARTS } from './parts.ts';
import { nextId, sb1Keys, sb2Keys } from './score.ts';

const T = {
  title: { de: 'Sprachbausteine', en: 'Sprachbausteine (language elements)' },
  intro: {
    de: 'Zwei Teile, zusammen 30 Punkte: Grammatik im Kontext (Teil 1) und Wortschatz (Teil 2). In der Prüfung zusammen mit dem Leseverstehen 90 Minuten.',
    en: 'Two parts, 30 points in total: grammar in context (part 1) and vocabulary (part 2). In the exam, 90 minutes together with Reading.',
  },
  home: { de: 'Start', en: 'Home' },
} satisfies Record<string, Text2>;

function Sb2Drill({ lang, go, info, set, index }: { lang: Lang; go: (r: string) => void; info: PartInfo; set: Sb2Set; index: number }) {
  const [active, setActive] = useState<number | null>(0);
  return (
    <DrillFrame lang={lang} section="sprachbausteine" info={info} setId={set.id} setNumber={index + 1} topic={set.topic}
      keys={sb2Keys(set)} go={go} nextSetId={nextId(sb2.map((s) => s.id), set.id)}
      dock={(ctx) => <Sb2WordBank set={set} lang={lang} active={active} setActive={setActive} {...ctx} />}>
      {(ctx) => <Sb2Task set={set} lang={lang} active={active} setActive={setActive} {...ctx} />}
    </DrillFrame>
  );
}

export default function Section({ lang, path, go }: SectionProps) {
  const [slug, setId] = path;
  const info = SB_PARTS.find((p) => p.slug === slug);

  if (slug && !info) return <NotFound lang={lang} onBack={() => go('sprachbausteine')} />;

  if (info && setId) {
    const back = () => go(`sprachbausteine/${info.slug}`);
    if (info.part === 'sb1') {
      const i = sb1.findIndex((s) => s.id === setId);
      if (i < 0) return <NotFound lang={lang} onBack={back} />;
      const set = sb1[i];
      return (
        <DrillFrame key={set.id} lang={lang} section="sprachbausteine" info={info} setId={set.id} setNumber={i + 1}
          topic={set.topic} keys={sb1Keys(set)} go={go} nextSetId={nextId(sb1.map((s) => s.id), set.id)}>
          {(ctx) => <Sb1Task set={set} lang={lang} {...ctx} />}
        </DrillFrame>
      );
    }
    const i = sb2.findIndex((s) => s.id === setId);
    if (i < 0) return <NotFound lang={lang} onBack={back} />;
    return <Sb2Drill key={sb2[i].id} lang={lang} go={go} info={info} set={sb2[i]} index={i} />;
  }

  const parts = info ? [info] : SB_PARTS;
  return (
    <div>
      <div className="drill-head">
        <button type="button" className="btn small ghost" onClick={() => go(info ? 'sprachbausteine' : 'home')}>
          ← {info ? tr(T.title, lang) : tr(T.home, lang)}
        </button>
      </div>
      <h1>🧩 {tr(T.title, lang)}</h1>
      <p className="muted" style={{ marginTop: 0 }}>{tr(T.intro, lang)}</p>
      <div className="stack">
        {parts.map((p) => (
          <PartCard key={p.slug} lang={lang} section="sprachbausteine" info={p} go={go} openTip={!!info}
            sets={p.part === 'sb1' ? sb1 : sb2} />
        ))}
      </div>
    </div>
  );
}
