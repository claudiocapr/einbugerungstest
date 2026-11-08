import type { SectionProps } from '../types.ts';
import type { Text2 } from '../../types.ts';
import type { Lesen1Set, Lesen2Set, Lesen3Set } from '../../content/types.ts';
import { lesen1, lesen2, lesen3 } from '../../content/lesen.ts';
import { tr } from '../../lib/i18n.ts';
import { DrillFrame, NotFound, PartCard } from './drill.tsx';
import { LESEN_PARTS } from './parts.ts';
import { Lesen1Task, Lesen2Task, Lesen3Task } from './tasks.tsx';
import { lesen1Keys, lesen2Keys, lesen3Keys, lesen3X, letter, nextId } from './score.ts';

const T = {
  title: { de: 'Leseverstehen', en: 'Reading' },
  intro: {
    de: 'Drei Teile, zusammen 75 Punkte. In der Prüfung haben Sie für Leseverstehen und Sprachbausteine zusammen 90 Minuten.',
    en: 'Three parts, 75 points in total. In the exam you have 90 minutes for Reading and Sprachbausteine together.',
  },
  home: { de: 'Start', en: 'Home' },
} satisfies Record<string, Text2>;

/* Solution and explanation per item, for the neurofeedback review. */
const explain1 = (set: Lesen1Set) => (i: number) => {
  const t = set.texts[i];
  return { solution: `${letter(t.answer)} – ${set.headlines[t.answer]}`, explanation: t.explanation };
};
const explain2 = (set: Lesen2Set) => (i: number) => {
  const item = set.items[i];
  return { solution: `${letter(item.answer)}) ${item.options[item.answer]}`, explanation: item.explanation };
};
const explain3 = (set: Lesen3Set) => (i: number) => {
  const s = set.situations[i];
  const x = lesen3X(set);
  const key = s.answer ?? x;
  const ad = set.ads[key];
  return { solution: key === x ? 'x' : `${letter(key)}${ad?.title ? ` – ${ad.title}` : ''}`, explanation: s.explanation };
};

export default function Section({ lang, path, go }: SectionProps) {
  const [slug, setId] = path;
  const info = LESEN_PARTS.find((p) => p.slug === slug);

  if (slug && !info) return <NotFound lang={lang} onBack={() => go('lesen')} />;

  if (info && setId) {
    const back = () => go(`lesen/${info.slug}`);
    if (info.part === 'lesen1') {
      const i = lesen1.findIndex((s) => s.id === setId);
      if (i < 0) return <NotFound lang={lang} onBack={back} />;
      const set: Lesen1Set = lesen1[i];
      return (
        <DrillFrame key={set.id} lang={lang} section="lesen" info={info} setId={set.id} setNumber={i + 1} topic={set.topic}
          keys={lesen1Keys(set)} go={go} nextSetId={nextId(lesen1.map((s) => s.id), set.id)} explain={explain1(set)}>
          {(ctx) => <Lesen1Task set={set} lang={lang} {...ctx} />}
        </DrillFrame>
      );
    }
    if (info.part === 'lesen2') {
      const i = lesen2.findIndex((s) => s.id === setId);
      if (i < 0) return <NotFound lang={lang} onBack={back} />;
      const set: Lesen2Set = lesen2[i];
      return (
        <DrillFrame key={set.id} lang={lang} section="lesen" info={info} setId={set.id} setNumber={i + 1} topic={set.topic}
          keys={lesen2Keys(set)} go={go} nextSetId={nextId(lesen2.map((s) => s.id), set.id)} explain={explain2(set)}>
          {(ctx) => <Lesen2Task set={set} lang={lang} {...ctx} />}
        </DrillFrame>
      );
    }
    const i = lesen3.findIndex((s) => s.id === setId);
    if (i < 0) return <NotFound lang={lang} onBack={back} />;
    const set: Lesen3Set = lesen3[i];
    return (
      <DrillFrame key={set.id} lang={lang} section="lesen" info={info} setId={set.id} setNumber={i + 1} topic={set.topic}
        keys={lesen3Keys(set)} go={go} nextSetId={nextId(lesen3.map((s) => s.id), set.id)} explain={explain3(set)}>
        {(ctx) => <Lesen3Task set={set} lang={lang} {...ctx} />}
      </DrillFrame>
    );
  }

  const setsFor = { lesen1, lesen2, lesen3 } as const;
  const parts = info ? [info] : LESEN_PARTS;
  return (
    <div>
      <div className="drill-head">
        <button type="button" className="btn small ghost" onClick={() => go(info ? 'lesen' : 'home')}>
          ← {info ? tr(T.title, lang) : tr(T.home, lang)}
        </button>
      </div>
      <h1>📖 {tr(T.title, lang)}</h1>
      <p className="muted" style={{ marginTop: 0 }}>{tr(T.intro, lang)}</p>
      <div className="stack">
        {parts.map((p) => (
          <PartCard key={p.slug} lang={lang} section="lesen" info={p} go={go} openTip={!!info}
            sets={setsFor[p.part as keyof typeof setsFor]} />
        ))}
      </div>
    </div>
  );
}
