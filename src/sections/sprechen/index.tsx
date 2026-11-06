// Mündlicher Ausdruck: task cards, prep timer, phrases, recorder, partner mode, self-assessment.
import { useEffect } from 'react';
import type { SectionProps } from '../types.ts';
import type { Lang, Text2 } from '../../types.ts';
import { sprechen1, sprechen2, sprechen3, sprechenPhrases } from '../../content/sprechen.ts';
import type { Speaking1Card, Speaking2Task, Speaking3Task } from '../../content/types.ts';
import { t, tr } from '../../lib/i18n.ts';
import { useStore } from '../../lib/storage.ts';
import { stop } from '../../lib/tts.ts';
import { SPRECHEN_MAX_POINTS, sprechenExamPart, type SprechenPart } from './score.ts';
import { PhraseBank, Task, type SprechenTask } from './Task.tsx';
import './sprechen.css';

const TASKS: Record<SprechenPart, SprechenTask[]> = { 1: sprechen1, 2: sprechen2, 3: sprechen3 };

const PARTS: { part: SprechenPart; title: Text2; sub: Text2; icon: string }[] = [
  {
    part: 1,
    title: { de: 'Teil 1 · Einander kennenlernen', en: 'Part 1 · Getting to know each other' },
    sub: { de: 'ca. 3 Minuten · 15 Punkte', en: 'about 3 minutes · 15 points' },
    icon: '👋',
  },
  {
    part: 2,
    title: { de: 'Teil 2 · Über ein Thema sprechen', en: 'Part 2 · Talking about a topic' },
    sub: { de: 'ca. 6 Minuten · 30 Punkte', en: 'about 6 minutes · 30 points' },
    icon: '💭',
  },
  {
    part: 3,
    title: { de: 'Teil 3 · Gemeinsam etwas planen', en: 'Part 3 · Planning something together' },
    sub: { de: 'ca. 6 Minuten · 30 Punkte', en: 'about 6 minutes · 30 points' },
    icon: '🗓️',
  },
];

const S = {
  title: { de: 'Mündlicher Ausdruck', en: 'Speaking' },
  intro: {
    de: 'Die mündliche Prüfung ist eine Paarprüfung (ca. 15 Minuten) mit 20 Minuten Vorbereitung. Üben Sie mit Vorbereitungszeit, Redemitteln, Aufnahme, Mustergespräch und einem Partner aus der Sprachausgabe – und bewerten Sie sich danach selbst. Zum Bestehen brauchen Sie 45 von 75 Punkten.',
    en: 'The oral exam is taken in pairs (about 15 minutes) after 20 minutes of preparation. Practise with a prep timer, phrases, recording, a model conversation and a text-to-speech partner – then assess yourself. You need 45 of 75 points to pass.',
  },
  phrases: { de: 'Redemittel', en: 'Useful phrases' },
  phrasesSub: { de: 'Meinung, Vorschläge, Zustimmung, Widerspruch …', en: 'Opinions, suggestions, agreeing, disagreeing …' },
  card: { de: 'Karte', en: 'Card' },
  last: { de: 'Selbstbewertung', en: 'Self-assessment' },
  never: { de: 'Noch nicht geübt', en: 'Not practised yet' },
  points: { de: 'Punkte', en: 'points' },
} satisfies Record<string, Text2>;

const partOf = (seg: string | undefined): SprechenPart | null =>
  seg === 'teil1' ? 1 : seg === 'teil2' ? 2 : seg === 'teil3' ? 3 : null;

function firstSentence(text: string, max = 90) {
  const s = text.split(/(?<=[.!?])\s/)[0];
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

export function taskTitle(part: SprechenPart, task: SprechenTask, index: number, lang: Lang): string {
  if (part === 1) return `${tr(S.card, lang)} ${index + 1} · ${(task as Speaking1Card).extraQuestions[0]}`;
  if (part === 2) return (task as Speaking2Task).theme;
  return firstSentence((task as Speaking3Task).situation);
}

export default function Sprechen({ lang, path, go }: SectionProps) {
  const [store] = useStore();
  useEffect(() => () => stop(), []);
  const last = (setId: string) => store.results.find((r) => r.section === 'sprechen' && r.setId === setId);

  if (path.length === 0) {
    return (
      <div>
        <h1>{tr(S.title, lang)}</h1>
        <p className="muted">{tr(S.intro, lang)}</p>
        <div className="stack" style={{ marginTop: 16 }}>
          {PARTS.map((p) => (
            <button key={p.part} type="button" className="tile" onClick={() => go(`sprechen/teil${p.part}`)}>
              <span className="icon">{p.icon}</span>
              <span>
                <span className="title">{tr(p.title, lang)}</span>
                <span className="sub">
                  {tr(p.sub, lang)} · {TASKS[p.part].filter((x) => last(x.id)).length}/{TASKS[p.part].length}
                </span>
              </span>
            </button>
          ))}
          <button type="button" className="tile" onClick={() => go('sprechen/redemittel')}>
            <span className="icon">📚</span>
            <span>
              <span className="title">{tr(S.phrases, lang)}</span>
              <span className="sub">{tr(S.phrasesSub, lang)}</span>
            </span>
          </button>
        </div>
      </div>
    );
  }

  if (path[0] === 'redemittel' && path.length === 1) {
    return (
      <div>
        <BackButton lang={lang} label={tr(S.title, lang)} onClick={() => go('sprechen')} />
        <h1>{tr(S.phrases, lang)}</h1>
        <PhraseBank lang={lang} groups={sprechenPhrases} open />
      </div>
    );
  }

  const part = partOf(path[0]);
  if (!part) return <NotFound lang={lang} go={go} />;
  const meta = PARTS[part - 1];
  const tasks = TASKS[part];

  if (path.length === 1) {
    return (
      <div>
        <BackButton lang={lang} label={tr(S.title, lang)} onClick={() => go('sprechen')} />
        <h1>{tr(meta.title, lang)}</h1>
        <p className="muted">{tr(meta.sub, lang)}</p>
        <div className="stack" style={{ marginTop: 16 }}>
          {tasks.map((task, i) => {
            const r = last(task.id);
            return (
              <button key={task.id} type="button" className="tile" onClick={() => go(`sprechen/teil${part}/${task.id}`)}>
                <span className="icon">{meta.icon}</span>
                <span>
                  <span className="title">{taskTitle(part, task, i, lang)}</span>
                  <span className="sub">
                    {r && r.part === sprechenExamPart(part)
                      ? `${tr(S.last, lang)}: ${r.points ?? 0}/${SPRECHEN_MAX_POINTS[part]} ${tr(S.points, lang)}`
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

  const index = tasks.findIndex((x) => x.id === path[1]);
  if (index < 0 || path.length > 2) return <NotFound lang={lang} go={go} />;
  const task = tasks[index];
  return (
    <div>
      <BackButton lang={lang} label={tr(meta.title, lang)} onClick={() => go(`sprechen/teil${part}`)} />
      <h1>{taskTitle(part, task, index, lang)}</h1>
      <p className="muted small">{tr(meta.title, lang)}</p>
      <Task key={task.id} lang={lang} part={part} task={task} go={go} />
    </div>
  );
}

function BackButton({ label, onClick }: { lang: Lang; label: string; onClick: () => void }) {
  return (
    <button type="button" className="btn small ghost" style={{ marginTop: 16 }} onClick={onClick}>
      ← {label}
    </button>
  );
}

function NotFound({ lang, go }: { lang: Lang; go: (r: string) => void }) {
  return (
    <div className="card" style={{ marginTop: 24 }}>
      <p>{t('notFound', lang)}</p>
      <button type="button" className="btn" onClick={() => go('sprechen')}>
        ← {tr(S.title, lang)}
      </button>
    </div>
  );
}
