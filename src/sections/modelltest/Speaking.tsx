// Optional, self-assessed oral part of the mock: the three speaking tasks and
// telc's four criteria per part, graded A–D by the learner.
import type { Lang, Text2 } from '../../types.ts';
import type { Speaking1Card, Speaking2Task, Speaking3Task } from '../../content/types.ts';
import { tr } from '../../lib/i18n.ts';
import { GRADE_LETTERS, type Grade } from '../schreiben/criteria.ts';
import { PART_MAX, SPEAKING_POINTS_T1, speakingPoints } from './score.ts';

const L = {
  title: { de: 'Mündlicher Ausdruck (Selbsteinschätzung)', en: 'Speaking (self-assessment)' },
  intro: {
    de: 'Die mündliche Prüfung dauert etwa 15 Minuten und findet zu zweit statt. Üben Sie die drei Teile laut – mit einer Partnerin, einem Partner oder allein – und bewerten Sie sich dann ehrlich. Sie können diesen Teil auch überspringen; dann bleibt das mündliche Ergebnis offen.',
    en: 'The oral exam takes about 15 minutes and is done in pairs. Practise the three parts aloud – with a partner or alone – then rate yourself honestly. You can also skip this part; the oral result then stays open.',
  },
  teil1: { de: 'Teil 1 – Einander kennenlernen', en: 'Part 1 – Getting to know each other' },
  teil2: { de: 'Teil 2 – Über ein Thema sprechen', en: 'Part 2 – Talking about a topic' },
  teil3: { de: 'Teil 3 – Gemeinsam etwas planen', en: 'Part 3 – Planning something together' },
  generic1: {
    de: 'Stellen Sie sich vor und fragen Sie Ihre Partnerin / Ihren Partner: Name, Herkunft, Wohnort, Familie, Arbeit oder Ausbildung, Sprachen, Hobbys, Pläne.',
    en: 'Introduce yourself and ask your partner: name, origin, home town, family, work or training, languages, hobbies, plans.',
  },
  generic2: {
    de: 'Geben Sie die Meinung aus einem kurzen Text wieder, sagen Sie Ihre eigene Meinung, erzählen Sie von Erfahrungen und reagieren Sie auf Ihre Partnerin / Ihren Partner.',
    en: 'Summarise the opinion in a short text, give your own opinion, talk about experiences and respond to your partner.',
  },
  generic3: {
    de: 'Planen Sie zusammen etwas (z. B. ein Fest oder einen Ausflug): Vorschläge machen, auf Vorschläge reagieren, sich einigen.',
    en: 'Plan something together (e.g. a party or a trip): make suggestions, respond to them, agree.',
  },
  missing: { de: 'Für diesen Teil gibt es noch keine Aufgabe – üben Sie mit der Beschreibung.', en: 'No task for this part yet – practise with the description.' },
  extra: { de: 'Weitere Fragen', en: 'More questions' },
  points: { de: 'Punkte', en: 'points' },
  finish: { de: 'Bewertung abschließen', en: 'Finish assessment' },
  gradeAll: { de: 'Bitte alle zwölf Kriterien bewerten.', en: 'Please rate all twelve criteria.' },
  skip: { de: 'Sprechen überspringen', en: 'Skip speaking' },
  oral: { de: 'Mündlich', en: 'Oral' },
};

export const SPEAKING_CRITERIA: { title: Text2; levels: [Text2, Text2, Text2, Text2] }[] = [
  {
    title: { de: 'Ausdrucksfähigkeit', en: 'Range of expression' },
    levels: [
      { de: 'passend und abwechslungsreich', en: 'fitting and varied' },
      { de: 'im Großen und Ganzen passend', en: 'mostly fitting' },
      { de: 'kaum noch ausreichend', en: 'barely adequate' },
      { de: 'nicht ausreichend', en: 'not adequate' },
    ],
  },
  {
    title: { de: 'Aufgabenbewältigung', en: 'Task handling' },
    levels: [
      { de: 'aktiv, flüssig, reagiert gut', en: 'active, fluent, responds well' },
      { de: 'meistens aktiv und flüssig', en: 'mostly active and fluent' },
      { de: 'stockend, wenig Beteiligung', en: 'halting, little participation' },
      { de: 'Gespräch kommt nicht zustande', en: 'no real conversation' },
    ],
  },
  {
    title: { de: 'Formale Richtigkeit', en: 'Accuracy' },
    levels: [
      { de: 'kaum Fehler', en: 'hardly any errors' },
      { de: 'Fehler, aber gut verständlich', en: 'errors, but clear' },
      { de: 'Fehler stören das Verständnis', en: 'errors get in the way' },
      { de: 'so viele Fehler, dass es scheitert', en: 'so many errors it breaks down' },
    ],
  },
  {
    title: { de: 'Aussprache und Intonation', en: 'Pronunciation and intonation' },
    levels: [
      { de: 'gut verständlich', en: 'easy to understand' },
      { de: 'manchmal schwer verständlich', en: 'sometimes hard to follow' },
      { de: 'oft schwer verständlich', en: 'often hard to follow' },
      { de: 'kaum verständlich', en: 'barely understandable' },
    ],
  },
];

export function SpeakingScreen({
  lang,
  tasks,
  grades,
  onGrade,
  onFinish,
}: {
  lang: Lang;
  tasks: [Speaking1Card | undefined, Speaking2Task | undefined, Speaking3Task | undefined];
  grades: (Grade | null)[][];
  onGrade: (teil: number, criterion: number, grade: Grade) => void;
  onFinish: (skip: boolean) => void;
}) {
  const [t1, t2, t3] = tasks;
  const complete = grades.every((row) => row.every((g) => g !== null));
  const titles = [L.teil1, L.teil2, L.teil3];
  const total = grades.reduce((s, row, i) => s + speakingPoints((i + 1) as 1 | 2 | 3, row), 0);

  const prompt = (i: number) => {
    if (i === 0) {
      if (!t1) return <Generic text={L.generic1} lang={lang} />;
      return (
        <div lang="de">
          <ul style={{ margin: 0, paddingLeft: 20 }}>{t1.points.map((p) => <li key={p}>{p}</li>)}</ul>
          {t1.extraQuestions.length > 0 && (
            <p className="small muted" style={{ marginBottom: 0 }}>
              {tr(L.extra, lang)}: {t1.extraQuestions.join(' · ')}
            </p>
          )}
        </div>
      );
    }
    if (i === 1) {
      if (!t2) return <Generic text={L.generic2} lang={lang} />;
      return (
        <div lang="de">
          <p style={{ marginTop: 0, fontWeight: 600 }}>{t2.theme}</p>
          <p className="small"><strong>{t2.a.person}:</strong> {t2.a.text}</p>
          <p className="small" style={{ marginBottom: 0 }}><strong>{t2.b.person}:</strong> {t2.b.text}</p>
        </div>
      );
    }
    if (!t3) return <Generic text={L.generic3} lang={lang} />;
    return (
      <div lang="de">
        <p style={{ marginTop: 0 }}>{t3.situation}</p>
        <ul style={{ margin: 0, paddingLeft: 20 }}>{t3.checklist.map((c) => <li key={c}>{c}</li>)}</ul>
      </div>
    );
  };

  return (
    <div className="stack" style={{ marginTop: 14 }}>
      <h1 style={{ margin: 0 }}>{tr(L.title, lang)}</h1>
      <p className="muted" style={{ margin: 0 }}>{tr(L.intro, lang)}</p>
      {[0, 1, 2].map((i) => {
        const teil = (i + 1) as 1 | 2 | 3;
        const factor = teil === 1 ? 1 : 2;
        return (
          <div key={i} className="card">
            <div className="row">
              <h2 style={{ margin: 0 }}>{tr(titles[i], lang)}</h2>
              <span className="spacer" />
              <span className="small muted">
                {speakingPoints(teil, grades[i])} / {PART_MAX[`sprechen${teil}`]}
              </span>
            </div>
            <div style={{ margin: '10px 0 14px' }}>{prompt(i)}</div>
            <div className="stack" style={{ gap: 10 }}>
              {SPEAKING_CRITERIA.map((c, ci) => (
                <div key={ci}>
                  <div className="small" style={{ fontWeight: 600, marginBottom: 4 }}>{tr(c.title, lang)}</div>
                  <div className="chips">
                    {c.levels.map((level, g) => (
                      <button
                        key={g}
                        type="button"
                        className="chip"
                        aria-pressed={grades[i][ci] === g}
                        onClick={() => onGrade(i, ci, g as Grade)}
                        title={`${SPEAKING_POINTS_T1[ci][g] * factor} ${tr(L.points, lang)}`}
                      >
                        {GRADE_LETTERS[g]} · {tr(level, lang)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      <div className="card center">
        <div className="small muted">{tr(L.oral, lang)}</div>
        <div className="score">
          {complete ? total : '–'} <span className="muted" style={{ fontSize: 22 }}>/ 75</span>
        </div>
      </div>
      <div className="sticky-actions" style={{ flexWrap: 'wrap' }}>
        {!complete && <span className="small muted" style={{ width: '100%' }}>{tr(L.gradeAll, lang)}</span>}
        <button type="button" className="btn primary" style={{ flex: 1 }} disabled={!complete} onClick={() => onFinish(false)}>
          {tr(L.finish, lang)}
        </button>
        <button type="button" className="btn" onClick={() => onFinish(true)}>
          {tr(L.skip, lang)}
        </button>
      </div>
    </div>
  );
}

function Generic({ text, lang }: { text: Text2; lang: Lang }) {
  return (
    <div>
      <p style={{ marginTop: 0 }}>{tr(text, lang)}</p>
      <p className="small muted" style={{ marginBottom: 0 }}>{tr(L.missing, lang)}</p>
    </div>
  );
}
