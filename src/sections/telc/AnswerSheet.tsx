import { useEffect, useState } from 'react';
import type { SectionProps } from '../types.ts';
import { tr } from '../../lib/i18n.ts';
import { recordResult, useSection } from '../../lib/storage.ts';
import { track } from '../../lib/analytics.ts';
import { Confirm } from '../../components/Confirm.tsx';
import { describeError } from '../../sync/supabase.ts';
import { loadKey, useSignedUrls } from './files.ts';
import { SignedAudio } from './Audio.tsx';
import {
  formatPoints,
  ITEM_COUNT,
  optionLabel,
  PARTS,
  scoreSheet,
  type AnswerKey,
  type Answers,
  type SheetScore,
} from './sheet.ts';

const L = {
  title: { de: 'Antwortbogen – Übungstest 1', en: 'Answer sheet – practice test 1' },
  intro: {
    de: 'Lösen Sie die Aufgaben im Testheft (PDF) und markieren Sie hier wie auf dem Antwortbogen S30. Die Auswertung nutzt den Lösungsschlüssel von telc und die Punkte der echten Prüfung. Der Schriftliche Ausdruck (45 Punkte) wird hier nicht bewertet.',
    en: 'Work through the test booklet (PDF) and mark your answers here as on answer sheet S30. Scoring uses telc’s key and the real exam’s points. Writing (45 points) is not scored here.',
  },
  booklet: { de: 'Testheft (PDF) öffnen', en: 'Open test booklet (PDF)' },
  listening: { de: 'Audio zum Hörverstehen', en: 'Listening audio' },
  answered: { de: 'beantwortet', en: 'answered' },
  score: { de: 'Auswerten', en: 'Score' },
  scoring: { de: 'Wird ausgewertet …', en: 'Scoring …' },
  openItems: {
    de: (n: number) => `${n} Aufgaben sind noch offen und zählen als falsch. Trotzdem auswerten?`,
    en: (n: number) => `${n} items are still open and count as wrong. Score anyway?`,
  },
  again: { de: 'Neuer Versuch', en: 'New attempt' },
  confirmAgain: { de: 'Alle Markierungen löschen und neu beginnen?', en: 'Clear all marks and start again?' },
  noKey: {
    de: 'Der Lösungsschlüssel fehlt oder ist unvollständig. Der Inhaber muss den Upload-Workflow ausführen.',
    en: 'The answer key is missing or incomplete. The owner needs to run the upload workflow.',
  },
  result: { de: 'Ergebnis', en: 'Result' },
  points: { de: 'Punkte', en: 'points' },
  of: { de: 'von', en: 'of' },
  correct: { de: 'richtig', en: 'correct' },
  passHint: {
    de: 'Bestanden ist die schriftliche Prüfung ab 135 von 225 Punkten (60 %), Schriftlicher Ausdruck eingerechnet. 60 % von diesen 180 Punkten sind 108.',
    en: 'The written exam is passed from 135 of 225 points (60%), including writing. 60% of these 180 points is 108.',
  },
  subtests: {
    lesen: { de: 'Leseverstehen', en: 'Reading' },
    sprachbausteine: { de: 'Sprachbausteine', en: 'Language elements' },
    hoeren: { de: 'Hörverstehen', en: 'Listening' },
  },
  expected: { de: 'Lösung', en: 'Key' },
  back: { de: 'telc-Material', en: 'telc material' },
};

interface SheetState {
  answers: Answers;
  startedAt: number | null;
  scoredAt: number | null;
}

const EMPTY_SHEET: SheetState = { answers: {}, startedAt: null, scoredAt: null };
const PDF = 'uebungstest-1/uebungstest-1.pdf';
const MP3 = 'uebungstest-1/uebungstest-1.mp3';

export default function AnswerSheet({ lang, go }: SectionProps) {
  const [saved, setSaved] = useSection<{ ut1?: SheetState }>('telc', {});
  const sheet = saved.ut1 ?? EMPTY_SHEET;
  const update = (fn: (s: SheetState) => SheetState) => setSaved((prev) => ({ ...prev, ut1: fn(prev.ut1 ?? EMPTY_SHEET) }));

  const [key, setKey] = useState<AnswerKey | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<'score' | 'again' | null>(null);
  const { urls, renew } = useSignedUrls([PDF, MP3]);

  const scored = sheet.scoredAt !== null;
  const result: SheetScore | null = scored && key ? scoreSheet(sheet.answers, key) : null;
  const answeredCount = Object.values(sheet.answers).filter(Boolean).length;

  // After a reload the sheet may already be scored: fetch the key to show the result.
  useEffect(() => {
    if (!scored || key) return;
    loadKey().then(
      (k) => (k ? setKey(k) : setError(tr(L.noKey, lang))),
      (e) => setError(describeError(e, lang)),
    );
  }, [scored, key, lang]);

  const mark = (n: number, option: string) => {
    if (scored) return;
    update((s) => {
      const answers = { ...s.answers };
      if (answers[n] === option) delete answers[n];
      else answers[n] = option;
      return { ...s, answers, startedAt: s.startedAt ?? Date.now() };
    });
  };

  const doScore = async () => {
    setConfirm(null);
    setBusy(true);
    setError(null);
    try {
      const k = await loadKey();
      if (!k) {
        setError(tr(L.noKey, lang));
        return;
      }
      setKey(k);
      const s = scoreSheet(sheet.answers, k);
      const now = Date.now();
      update((prev) => ({ ...prev, scoredAt: now }));
      recordResult({
        section: 'telc',
        setId: 'uebungstest-1',
        correct: s.correct,
        total: s.total,
        points: s.points,
        maxPoints: s.maxPoints,
        startedAt: sheet.startedAt ?? now,
        finishedAt: now,
      });
      track('telc.sheet_scored', {
        set: 'uebungstest-1',
        points: s.points,
        max: s.maxPoints,
        answered: s.answered,
        passed: s.points >= s.maxPoints * 0.6,
      });
    } catch (e) {
      setError(describeError(e, lang));
    } finally {
      setBusy(false);
    }
  };

  const onScore = () => {
    if (answeredCount < ITEM_COUNT) setConfirm('score');
    else void doScore();
  };

  return (
    <div className="stack">
      <div className="row" style={{ marginTop: 16 }}>
        <button type="button" className="btn small ghost" onClick={() => go('telc')}>
          ← {tr(L.back, lang)}
        </button>
      </div>
      <h1 style={{ marginTop: 0 }}>{tr(L.title, lang)}</h1>
      <p className="muted" style={{ margin: 0 }}>
        {tr(L.intro, lang)}
      </p>

      <div className="card stack">
        {urls[PDF] && (
          <a className="btn" style={{ textDecoration: 'none', textAlign: 'center' }} href={urls[PDF]} target="_blank" rel="noopener noreferrer">
            📄 {tr(L.booklet, lang)}
          </a>
        )}
        {urls[MP3] && (
          <div className="stack" style={{ gap: 6 }}>
            <span className="muted small">{tr(L.listening, lang)}</span>
            <SignedAudio key={MP3} path={MP3} url={urls[MP3]} renew={renew} label={tr(L.listening, lang)} />
          </div>
        )}
        <div className="row">
          <div className="bar" style={{ flex: 1 }}>
            <span style={{ width: `${(answeredCount / ITEM_COUNT) * 100}%` }} />
          </div>
          <span className="small muted">
            {answeredCount}/{ITEM_COUNT} {tr(L.answered, lang)}
          </span>
        </div>
      </div>

      {result && <ResultCard result={result} lang={lang} />}
      {error && (
        <p className="bad" role="alert">
          {error}
        </p>
      )}

      {PARTS.map((part) => (
        <section key={part.id} className="card stack">
          <h2 style={{ margin: 0 }}>
            {tr(part.label, lang)}{' '}
            <span className="muted small">
              ({part.from}–{part.to} · {formatPoints(part.points, lang)} {tr(L.points, lang)})
            </span>
          </h2>
          {Array.from({ length: part.to - part.from + 1 }, (_, i) => part.from + i).map((n) => {
            const given = sheet.answers[n];
            const item = result?.items[String(n)];
            return (
              <div key={n} className="row" style={{ alignItems: 'flex-start' }}>
                <span
                  className={item ? (item.ok ? 'good' : 'bad') : undefined}
                  style={{ width: 34, flex: 'none', fontWeight: 650, paddingTop: 5, fontVariantNumeric: 'tabular-nums' }}
                >
                  {n}
                </span>
                <div className="stack" style={{ gap: 4, flex: 1 }}>
                  <div className="chips" role="group" aria-label={`${tr(part.label, lang)} ${n}`}>
                    {part.options.map((o) => (
                      <button
                        key={o}
                        type="button"
                        className="chip"
                        aria-pressed={given === o}
                        disabled={scored}
                        onClick={() => mark(n, o)}
                        style={
                          item && o === item.expected
                            ? { borderColor: 'var(--good)' }
                            : item && given === o && !item.ok
                              ? { borderColor: 'var(--bad)' }
                              : undefined
                        }
                      >
                        {optionLabel(o, lang)}
                      </button>
                    ))}
                  </div>
                  {item && !item.ok && (
                    <span className="small bad">
                      {tr(L.expected, lang)}: {optionLabel(item.expected, lang)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      ))}

      <div className="sticky-actions">
        {!scored ? (
          <button type="button" className="btn primary block" disabled={busy} onClick={onScore}>
            {busy ? tr(L.scoring, lang) : `${tr(L.score, lang)} (${answeredCount}/${ITEM_COUNT})`}
          </button>
        ) : (
          <button type="button" className="btn block" onClick={() => setConfirm('again')}>
            {tr(L.again, lang)}
          </button>
        )}
      </div>

      {confirm === 'score' && (
        <Confirm
          lang={lang}
          message={L.openItems[lang](ITEM_COUNT - answeredCount)}
          onConfirm={() => void doScore()}
          onCancel={() => setConfirm(null)}
        />
      )}
      {confirm === 'again' && (
        <Confirm
          lang={lang}
          message={tr(L.confirmAgain, lang)}
          onConfirm={() => {
            setConfirm(null);
            update(() => EMPTY_SHEET);
            window.scrollTo(0, 0);
          }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}

function ResultCard({ result, lang }: { result: SheetScore; lang: 'de' | 'en' }) {
  const pct = Math.round((result.points / result.maxPoints) * 100);
  const passed = result.points >= result.maxPoints * 0.6;
  return (
    <div className={`verdict ${passed ? 'good' : 'bad'}`}>
      <div className="head">{tr(L.result, lang)}</div>
      <div className="score">
        {formatPoints(result.points, lang)} <span className="muted small">/ {result.maxPoints} {tr(L.points, lang)} · {pct} %</span>
      </div>
      <div className="small" style={{ marginBottom: 10 }}>
        {result.correct} {tr(L.of, lang)} {result.total} {tr(L.correct, lang)}
      </div>
      <div className="stack" style={{ gap: 8 }}>
        {(Object.keys(result.subtests) as (keyof SheetScore['subtests'])[]).map((id) => {
          const s = result.subtests[id];
          const ok = s.points >= s.maxPoints * 0.6;
          return (
            <div key={id}>
              <div className="row small" style={{ justifyContent: 'space-between' }}>
                <span>{tr(L.subtests[id], lang)}</span>
                <span className={ok ? 'good' : 'bad'}>
                  {formatPoints(s.points, lang)} / {s.maxPoints}
                </span>
              </div>
              <div className={`bar${ok ? ' good' : ''}`}>
                <span style={{ width: `${(s.points / s.maxPoints) * 100}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      <table className="history" style={{ marginTop: 10 }}>
        <tbody>
          {result.parts.map((p) => {
            const part = PARTS.find((x) => x.id === p.id)!;
            return (
              <tr key={p.id}>
                <td>{tr(part.label, lang)}</td>
                <td>
                  {p.correct}/{p.total}
                </td>
                <td>
                  {formatPoints(p.points, lang)} / {formatPoints(p.maxPoints, lang)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="small muted" style={{ marginBottom: 0 }}>
        {tr(L.passHint, lang)}
      </p>
    </div>
  );
}
