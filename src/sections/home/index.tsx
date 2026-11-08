// Home: today's plan (about 15 minutes), daily goal, pass outlook, and all sections.
import type { SectionProps } from '../types.ts';
import type { Text2 } from '../../types.ts';
import { SECTIONS, type SectionMeta } from '../registry.ts';
import { useStore, setStore, DAILY_GOAL_CHOICES } from '../../lib/storage.ts';
import { tr } from '../../lib/i18n.ts';
import { activityByDay, answeredToday, dueVocab, partOfTheDay, productiveOfTheDay, streak } from '../../lib/plan.ts';
import { PART_LABEL, predictPass, type PredictionLabel } from '../modelltest/score.ts';

const L = {
  hello: { de: 'Für telc Deutsch B1 üben', en: 'Practise for telc Deutsch B1' },
  today: { de: 'Heute · etwa 15 Minuten', en: 'Today · about 15 minutes' },
  vocabDue: { de: 'Wortschatz wiederholen', en: 'Review vocabulary' },
  vocabNew: { de: 'Neue Wörter lernen', en: 'Learn new words' },
  cards: { de: 'Karten fällig', en: 'cards due' },
  newRound: { de: 'Eine Runde mit 15 Karten', en: 'One round of 15 cards' },
  drill: { de: 'Prüfungsteil üben', en: 'Practise an exam part' },
  untried: { de: 'Noch nie geübt – gut, ihn kennenzulernen.', en: 'Never practised – good to get to know it.' },
  weakest: { de: 'Ihr schwächster Teil zurzeit', en: 'Your weakest part right now' },
  write: { de: 'Eine E-Mail schreiben', en: 'Write an e-mail' },
  writeWhy: { de: '4 Leitpunkte, ca. 30 Minuten oder kürzer', en: '4 points, about 30 minutes or less' },
  speak: { de: 'Sprechen üben', en: 'Practise speaking' },
  speakWhy: { de: 'Eine Aufgabe laut beantworten und aufnehmen', en: 'Answer one task aloud and record it' },
  goal: { de: 'Tagesziel', en: 'Daily goal' },
  answers: { de: 'Antworten', en: 'answers' },
  days: { de: 'Tage in Folge', en: 'days in a row' },
  outlook: { de: 'Prognose', en: 'Outlook' },
  allSections: { de: 'Alle Bereiche', en: 'All sections' },
} satisfies Record<string, Text2>;

const OUTLOOK: Record<PredictionLabel, Text2> = {
  good: { de: 'Auf gutem Weg zum Bestehen', en: 'On track to pass' },
  close: { de: 'Knapp – noch etwas üben', en: 'Close – keep practising' },
  notyet: { de: 'Noch nicht bestanden', en: 'Not passing yet' },
  unknown: { de: 'Noch zu wenig Ergebnisse', en: 'Not enough results yet' },
};

const GROUPS: { id: SectionMeta['group']; label: Text2 }[] = [
  { id: 'basis', label: { de: 'Grundlagen', en: 'Basics' } },
  { id: 'schriftlich', label: { de: 'Schriftliche Prüfung', en: 'Written exam' } },
  { id: 'muendlich', label: { de: 'Mündliche Prüfung', en: 'Oral exam' } },
  { id: 'pruefung', label: { de: 'Prüfung', en: 'Exam' } },
  { id: 'konto', label: { de: 'Fortschritt', en: 'Progress' } },
];

export default function Home({ lang, go }: SectionProps) {
  const [store] = useStore();
  const now = Date.now();
  const due = dueVocab(store.progress, now);
  const drill = partOfTheDay(store.results);
  const productive = productiveOfTheDay(now);
  const done = answeredToday(store.progress, now);
  const days = streak(store.progress, store.results, now);
  const activity = activityByDay(store.progress, now, 14);
  const peak = Math.max(1, ...activity);
  const prediction = predictPass(store.results);
  const goalShare = Math.min(1, done / store.dailyGoal);

  const plan = [
    {
      icon: '🗂️',
      title: tr(due > 0 ? L.vocabDue : L.vocabNew, lang),
      why: due > 0 ? `${due} ${tr(L.cards, lang)}` : tr(L.newRound, lang),
      route: due > 0 ? 'wortschatz/lernen/due' : 'wortschatz/lernen/all',
    },
    {
      icon: drill.part.startsWith('hoeren') ? '🎧' : drill.part.startsWith('sb') ? '🧩' : '📖',
      title: `${tr(L.drill, lang)}: ${tr(PART_LABEL[drill.part], lang)}`,
      why: drill.ratio === null ? tr(L.untried, lang) : `${tr(L.weakest, lang)} · ${Math.round(drill.ratio * 100)} %`,
      route: drill.route,
    },
    productive === 'schreiben'
      ? { icon: '✉️', title: tr(L.write, lang), why: tr(L.writeWhy, lang), route: 'schreiben' }
      : { icon: '🗣️', title: tr(L.speak, lang), why: tr(L.speakWhy, lang), route: 'sprechen' },
  ];

  return (
    <div>
      <h1>{tr(L.hello, lang)}</h1>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="goalrow">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="row" style={{ justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
              <span className="small muted">
                {tr(L.goal, lang)}: {done} / {store.dailyGoal} {tr(L.answers, lang)}
              </span>
              <select
                aria-label={tr(L.goal, lang)}
                style={{ width: 'auto', padding: '4px 8px', fontSize: 14 }}
                value={store.dailyGoal}
                onChange={(e) => {
                  const dailyGoal = Number(e.target.value);
                  setStore((s) => ({ ...s, dailyGoal }));
                }}
              >
                {DAILY_GOAL_CHOICES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div className={`bar${goalShare >= 1 ? ' good' : ''}`} style={{ marginTop: 8 }}>
              <span style={{ width: `${goalShare * 100}%` }} />
            </div>
          </div>
          <div className="streak" title={tr(L.days, lang)}>
            🔥 <span className="n">{days}</span>
          </div>
        </div>
        {activity.some((n) => n > 0) && (
          <div className="activity" style={{ marginTop: 14 }} aria-hidden="true">
            {activity.map((n, i) => (
              <div key={i} className={`col${n === 0 ? ' empty' : ''}`}>
                <span style={{ height: `${(n / peak) * 100}%` }} />
              </div>
            ))}
          </div>
        )}
      </div>

      <h2 style={{ marginTop: 24 }}>{tr(L.today, lang)}</h2>
      <div className="stack">
        {plan.map((p, i) => (
          <button key={p.route} type="button" className={`rec${i === 0 ? ' lead' : ''}`} onClick={() => go(p.route)}>
            <span className="icon">{p.icon}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span className="title">{p.title}</span>
              <span className="why">{p.why}</span>
            </span>
          </button>
        ))}
      </div>

      <button type="button" className="tile" style={{ marginTop: 16 }} onClick={() => go('modelltest')}>
        <span className="icon">🎯</span>
        <span>
          <span className="title">
            {tr(L.outlook, lang)}: {tr(OUTLOOK[prediction.label], lang)}
          </span>
          <span className="sub">
            {prediction.label === 'unknown'
              ? lang === 'de'
                ? 'Üben Sie ein paar Prüfungsteile, dann schätzt die App Ihr Ergebnis.'
                : 'Practise a few exam parts and the app will estimate your result.'
              : `${lang === 'de' ? 'Schriftlich' : 'Written'} ≈ ${Math.round(prediction.written.expected)} / ${prediction.written.max}` +
                (prediction.drag ? ` · ${lang === 'de' ? 'Schwachstelle' : 'Weak spot'}: ${tr(PART_LABEL[prediction.drag.part], lang)}` : '')}
          </span>
        </span>
      </button>

      <h2 style={{ marginTop: 28 }}>{tr(L.allSections, lang)}</h2>
      {GROUPS.map((g) => {
        const tiles = SECTIONS.filter((s) => s.tile && s.group === g.id && (!s.flag || store.flags[s.flag] === true));
        if (tiles.length === 0) return null;
        return (
          <section key={g.id} style={{ marginTop: 14 }}>
            <div className="small muted" style={{ marginBottom: 8 }}>
              {tr(g.label, lang)}
            </div>
            <div className="stack">
              {tiles.map((s) => (
                <button key={s.id} type="button" className="tile" onClick={() => go(s.id)}>
                  <span className="icon">{s.icon}</span>
                  <span>
                    <span className="title">{tr(s.title, lang)}</span>
                    <span className="sub">{tr(s.blurb, lang)}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
