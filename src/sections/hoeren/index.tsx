// Hörverstehen: Teil 1–3 in exam format, read aloud by the device's speech output.
import { useEffect } from 'react';
import type { SectionProps } from '../types.ts';
import type { Lang, Text2 } from '../../types.ts';
import { hoeren1, hoeren2, hoeren3 } from '../../content/hoeren.ts';
import { topicLabel } from '../../content/topics.ts';
import { t, tr } from '../../lib/i18n.ts';
import { useStore } from '../../lib/storage.ts';
import { stop } from '../../lib/tts.ts';
import { HOEREN_MAX_POINTS, hoerenExamPart, type HoerenPart, type HoerenSet } from './score.ts';
import { Player } from './Player.tsx';
import './hoeren.css';

const SETS: Record<HoerenPart, HoerenSet[]> = { 1: hoeren1, 2: hoeren2, 3: hoeren3 };

const PARTS: { part: HoerenPart; title: Text2; sub: Text2; icon: string }[] = [
  {
    part: 1,
    title: { de: 'Teil 1 · Fünf kurze Texte', en: 'Part 1 · Five short texts' },
    sub: { de: 'Einmal hören · 5 Aussagen richtig/falsch · 25 Punkte', en: 'Heard once · 5 true/false statements · 25 points' },
    icon: '1️⃣',
  },
  {
    part: 2,
    title: { de: 'Teil 2 · Ein Gespräch', en: 'Part 2 · A conversation' },
    sub: { de: 'Zweimal hören · 10 Aussagen richtig/falsch · 25 Punkte', en: 'Heard twice · 10 true/false statements · 25 points' },
    icon: '2️⃣',
  },
  {
    part: 3,
    title: { de: 'Teil 3 · Ansagen und Durchsagen', en: 'Part 3 · Announcements and messages' },
    sub: { de: 'Jeder Text zweimal · 5 Aussagen richtig/falsch · 25 Punkte', en: 'Each text twice · 5 true/false statements · 25 points' },
    icon: '3️⃣',
  },
];

const S = {
  title: { de: 'Hörverstehen', en: 'Listening' },
  intro: {
    de: 'Wie in der Prüfung: Lesezeit, dann hören Sie die Texte und entscheiden „richtig“ oder „falsch“. Im Lernmodus können Sie wiederholen, langsamer hören und den Text mitlesen.',
    en: 'As in the exam: reading time, then you hear the texts and decide "true" or "false". Learning mode lets you replay, slow down and read along.',
  },
  set: { de: 'Übung', en: 'Set' },
  last: { de: 'Zuletzt', en: 'Last time' },
  never: { de: 'Noch nicht geübt', en: 'Not practised yet' },
  points: { de: 'Punkte', en: 'points' },
} satisfies Record<string, Text2>;

function partFromSegment(seg: string | undefined): HoerenPart | null {
  return seg === 'teil1' ? 1 : seg === 'teil2' ? 2 : seg === 'teil3' ? 3 : null;
}

function setLabel(part: HoerenPart, set: HoerenSet, index: number, lang: Lang) {
  const title = part === 2 && 'title' in set ? set.title : topicLabel(set.topic, lang);
  return `${tr(S.set, lang)} ${index + 1} · ${title}`;
}

export default function Hoeren({ lang, path, go }: SectionProps) {
  const [store] = useStore();
  // Any speech still running when the route changes is stopped.
  useEffect(() => () => stop(), []);

  const part = partFromSegment(path[0]);
  const lastResult = (setId: string) => store.results.find((r) => r.setId === setId && r.section === 'hoeren');

  if (path.length === 0) {
    return (
      <div>
        <h1>{tr(S.title, lang)}</h1>
        <p className="muted">{tr(S.intro, lang)}</p>
        <div className="stack" style={{ marginTop: 16 }}>
          {PARTS.map((p) => {
            const done = SETS[p.part].filter((s) => lastResult(s.id)).length;
            return (
              <button key={p.part} type="button" className="tile" onClick={() => go(`hoeren/teil${p.part}`)}>
                <span className="icon">{p.icon}</span>
                <span>
                  <span className="title">{tr(p.title, lang)}</span>
                  <span className="sub">
                    {tr(p.sub, lang)} · {done}/{SETS[p.part].length}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (!part) return <NotFound lang={lang} go={go} />;
  const meta = PARTS[part - 1];
  const sets = SETS[part];

  if (path.length === 1) {
    return (
      <div>
        <button type="button" className="btn small ghost" style={{ marginTop: 16 }} onClick={() => go('hoeren')}>
          ← {tr(S.title, lang)}
        </button>
        <h1>{tr(meta.title, lang)}</h1>
        <p className="muted">{tr(meta.sub, lang)}</p>
        <div className="stack" style={{ marginTop: 16 }}>
          {sets.map((set, i) => {
            const r = lastResult(set.id);
            return (
              <button key={set.id} type="button" className="tile" onClick={() => go(`hoeren/teil${part}/${set.id}`)}>
                <span className="icon">🎧</span>
                <span>
                  <span className="title">{setLabel(part, set, i, lang)}</span>
                  <span className="sub">
                    {r && r.part === hoerenExamPart(part)
                      ? `${tr(S.last, lang)}: ${r.correct}/${r.total} · ${String(r.points ?? 0).replace('.', lang === 'de' ? ',' : '.')}/${HOEREN_MAX_POINTS} ${tr(S.points, lang)}`
                      : tr(S.never, lang)}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const index = sets.findIndex((s) => s.id === path[1]);
  if (index < 0 || path.length > 2) return <NotFound lang={lang} go={go} />;
  const set = sets[index];
  return (
    <div>
      <button type="button" className="btn small ghost" style={{ marginTop: 16 }} onClick={() => go(`hoeren/teil${part}`)}>
        ← {tr(meta.title, lang)}
      </button>
      <h1>{setLabel(part, set, index, lang)}</h1>
      <Player key={set.id} lang={lang} part={part} set={set} onBack={() => go(`hoeren/teil${part}`)} />
    </div>
  );
}

function NotFound({ lang, go }: { lang: Lang; go: (r: string) => void }) {
  return (
    <div className="card" style={{ marginTop: 24 }}>
      <p>{t('notFound', lang)}</p>
      <button type="button" className="btn" onClick={() => go('hoeren')}>
        ← {tr(S.title, lang)}
      </button>
    </div>
  );
}
