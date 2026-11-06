// Owner-only usage statistics and error log, read from the app's own Supabase tables. Owned by the backend agent.
import { useEffect, useState } from 'react';
import type { SectionProps } from '../types.ts';
import { tr } from '../../lib/i18n.ts';
import { useAccess } from '../../sync/access.ts';
import { describeError, getSupabase } from '../../sync/supabase.ts';

const L = {
  title: { de: 'Statistik', en: 'Statistics' },
  noAccess: { de: 'Kein Zugriff. Diese Seite ist nur für den Betreiber der App.', en: 'No access. This page is only for the app’s operator.' },
  checking: { de: 'Zugang wird geprüft …', en: 'Checking access …' },
  loading: { de: 'Lädt …', en: 'Loading …' },
  toKonto: { de: 'Zum Konto', en: 'Go to account' },
  reload: { de: 'Neu laden', en: 'Reload' },
  days: { de: 'Tage', en: 'days' },
  installs: { de: 'Aktive Installationen pro Tag', en: 'Active installs per day' },
  installsTotal: { de: 'Installationen (Zeitraum)', en: 'Installs (period)' },
  eventsTotal: { de: 'Ereignisse (Zeitraum)', en: 'Events (period)' },
  errorsShown: { de: 'Letzte Fehler', en: 'Recent errors' },
  topEvents: { de: 'Häufigste Ereignisse', en: 'Top events' },
  sections: { de: 'Genutzte Bereiche', en: 'Section usage' },
  passRate: { de: 'Bestehensquote (Prüfungen)', en: 'Pass rate (exams)' },
  errors: { de: 'Fehler (letzte 50)', en: 'Errors (last 50)' },
  none: { de: 'Keine Daten.', en: 'No data.' },
  event: { de: 'Ereignis', en: 'Event' },
  count: { de: 'Anzahl', en: 'Count' },
  section: { de: 'Bereich', en: 'Section' },
  views: { de: 'Aufrufe', en: 'Views' },
  attempts: { de: 'Versuche', en: 'Attempts' },
  passed: { de: 'bestanden', en: 'passed' },
  avg: { de: 'Ø Punkte', en: 'Avg points' },
  when: { de: 'Zeit', en: 'Time' },
  message: { de: 'Meldung', en: 'Message' },
  privacy: {
    de: 'Anonym: nur zufällige Installations-IDs, keine Konten oder IP-Adressen. Daten älter als 180 Tage mit purge_old_analytics() löschen (siehe docs/BACKEND.md).',
    en: 'Anonymous: random install ids only, no accounts or IP addresses. Delete data older than 180 days with purge_old_analytics() (see docs/BACKEND.md).',
  },
};

type DailyRow = { day: string; installs: number; events: number };
type TopRow = { name: string; n: number; installs: number };
type SectionRow = { section: string; views: number; installs: number };
type PassRow = { name: string; attempts: number; passed: number; avg_points: number | string | null };
type ErrorRow = { at: string; message: string; context: string | null; path: string | null; app_version: string | null; user_agent: string | null; stack: string | null };

interface Data {
  daily: DailyRow[];
  top: TopRow[];
  sections: SectionRow[];
  pass: PassRow[];
  errors: ErrorRow[];
}

const PERIODS = [7, 30, 90];

async function rpc<T>(fn: string, args: Record<string, number>): Promise<T[]> {
  const sb = await getSupabase();
  const { data, error } = await sb.rpc(fn, args);
  if (error) throw error;
  return (data ?? []) as T[];
}

async function load(days: number): Promise<Data> {
  const [daily, top, sections, pass, errors] = await Promise.all([
    rpc<DailyRow>('admin_daily_installs', { p_days: days }),
    rpc<TopRow>('admin_top_events', { p_days: days }),
    rpc<SectionRow>('admin_section_usage', { p_days: days }),
    rpc<PassRow>('admin_pass_rate', { p_days: Math.max(days, 90) }),
    rpc<ErrorRow>('admin_recent_errors', { p_limit: 50 }),
  ]);
  return { daily, top, sections, pass, errors };
}

/** Every calendar day of the period, including days without any events. */
export function fillDays(rows: DailyRow[], days: number, today = new Date()): DailyRow[] {
  const byDay = new Map(rows.map((r) => [String(r.day).slice(0, 10), r]));
  const out: DailyRow[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() - i));
    const key = d.toISOString().slice(0, 10);
    out.push(byDay.get(key) ?? { day: key, installs: 0, events: 0 });
  }
  return out;
}

function Bar({ value, max }: { value: number; max: number }) {
  return (
    <div className="bar" style={{ minWidth: 60 }}>
      <span style={{ width: `${max > 0 ? Math.max(2, (value / max) * 100) : 0}%` }} />
    </div>
  );
}

function fmtDate(s: string, lang: 'de' | 'en', withTime = false) {
  try {
    const d = new Date(withTime ? s : `${String(s).slice(0, 10)}T12:00:00Z`);
    return d.toLocaleString(lang === 'de' ? 'de-DE' : 'en-GB', withTime ? { dateStyle: 'short', timeStyle: 'short' } : { day: '2-digit', month: '2-digit' });
  } catch {
    return s;
  }
}

function Dashboard({ lang }: { lang: 'de' | 'en' }) {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let live = true;
    setError(null);
    load(days).then(
      (d) => live && setData(d),
      (e) => live && setError(e),
    );
    return () => {
      live = false;
    };
  }, [days, tick]);

  const daily = data ? fillDays(data.daily, days) : [];
  const maxInstalls = Math.max(0, ...daily.map((d) => Number(d.installs)));
  const maxTop = Math.max(0, ...(data?.top ?? []).map((r) => Number(r.n)));
  const maxViews = Math.max(0, ...(data?.sections ?? []).map((r) => Number(r.views)));
  const totalEvents = daily.reduce((a, d) => a + Number(d.events), 0);
  const peakInstalls = maxInstalls;

  return (
    <div className="stack">
      <div className="row wrap">
        <div className="chips">
          {PERIODS.map((p) => (
            <button key={p} type="button" className="chip" aria-pressed={p === days} onClick={() => setDays(p)}>
              {p} {tr(L.days, lang)}
            </button>
          ))}
        </div>
        <span className="spacer" />
        <button type="button" className="btn small ghost" onClick={() => setTick((n) => n + 1)}>
          ↻ {tr(L.reload, lang)}
        </button>
      </div>

      {!!error && <p className="bad">{describeError(error, lang)}</p>}
      {!data && !error && <p className="muted">{tr(L.loading, lang)}</p>}

      {data && (
        <>
          <div className="statgrid">
            <div className="stat">
              <div className="n">{peakInstalls}</div>
              <div className="l">{lang === 'de' ? 'Max. Installationen/Tag' : 'Peak installs/day'}</div>
            </div>
            <div className="stat">
              <div className="n">{totalEvents}</div>
              <div className="l">{tr(L.eventsTotal, lang)}</div>
            </div>
            <div className="stat">
              <div className="n">{data.errors.length}</div>
              <div className="l">{tr(L.errorsShown, lang)}</div>
            </div>
          </div>

          <section className="card">
            <h2 style={{ marginTop: 0 }}>{tr(L.installs, lang)}</h2>
            <table className="history">
              <tbody>
                {[...daily].reverse().map((d) => (
                  <tr key={d.day}>
                    <td style={{ width: 70 }}>{fmtDate(d.day, lang)}</td>
                    <td style={{ width: '100%' }}>
                      <Bar value={Number(d.installs)} max={maxInstalls} />
                    </td>
                    <td style={{ textAlign: 'right' }}>{d.installs}</td>
                    <td className="muted small" style={{ textAlign: 'right' }}>
                      {d.events}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="card">
            <h2 style={{ marginTop: 0 }}>{tr(L.topEvents, lang)}</h2>
            {data.top.length === 0 ? (
              <p className="muted">{tr(L.none, lang)}</p>
            ) : (
              <table className="history">
                <thead>
                  <tr>
                    <th>{tr(L.event, lang)}</th>
                    <th />
                    <th style={{ textAlign: 'right' }}>{tr(L.count, lang)}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.top.map((r) => (
                    <tr key={r.name}>
                      <td style={{ fontFamily: 'ui-monospace, monospace', fontSize: 13 }}>{r.name}</td>
                      <td style={{ width: '40%' }}>
                        <Bar value={Number(r.n)} max={maxTop} />
                      </td>
                      <td style={{ textAlign: 'right' }}>{r.n}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <section className="card">
            <h2 style={{ marginTop: 0 }}>{tr(L.sections, lang)}</h2>
            {data.sections.length === 0 ? (
              <p className="muted">{tr(L.none, lang)}</p>
            ) : (
              <table className="history">
                <thead>
                  <tr>
                    <th>{tr(L.section, lang)}</th>
                    <th />
                    <th style={{ textAlign: 'right' }}>{tr(L.views, lang)}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.sections.map((r) => (
                    <tr key={r.section}>
                      <td>{r.section}</td>
                      <td style={{ width: '40%' }}>
                        <Bar value={Number(r.views)} max={maxViews} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {r.views} <span className="muted small">({r.installs})</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <section className="card">
            <h2 style={{ marginTop: 0 }}>{tr(L.passRate, lang)}</h2>
            {data.pass.length === 0 ? (
              <p className="muted">{tr(L.none, lang)}</p>
            ) : (
              <table className="history">
                <thead>
                  <tr>
                    <th>{tr(L.event, lang)}</th>
                    <th style={{ textAlign: 'right' }}>{tr(L.attempts, lang)}</th>
                    <th style={{ textAlign: 'right' }}>{tr(L.passed, lang)}</th>
                    <th style={{ textAlign: 'right' }}>{tr(L.avg, lang)}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.pass.map((r) => {
                    const rate = Number(r.attempts) > 0 ? Math.round((Number(r.passed) / Number(r.attempts)) * 100) : 0;
                    return (
                      <tr key={r.name}>
                        <td style={{ fontFamily: 'ui-monospace, monospace', fontSize: 13 }}>{r.name}</td>
                        <td style={{ textAlign: 'right' }}>{r.attempts}</td>
                        <td style={{ textAlign: 'right' }} className={rate >= 50 ? 'good' : 'bad'}>
                          {r.passed} ({rate} %)
                        </td>
                        <td style={{ textAlign: 'right' }}>{r.avg_points ?? '–'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </section>

          <section className="card">
            <h2 style={{ marginTop: 0 }}>{tr(L.errors, lang)}</h2>
            {data.errors.length === 0 ? (
              <p className="muted">{tr(L.none, lang)}</p>
            ) : (
              <div className="qlist" style={{ marginTop: 0 }}>
                {data.errors.map((e, i) => (
                  <details key={`${e.at}-${i}`}>
                    <summary>
                      <span className="num">{fmtDate(e.at, lang, true)}</span>
                      <span style={{ overflowWrap: 'anywhere' }}>{e.message}</span>
                    </summary>
                    <div className="answer small stack" style={{ gap: 4 }}>
                      <div>
                        <span className="muted">context:</span> {e.context ?? '–'} · <span className="muted">path:</span>{' '}
                        {e.path ?? '–'} · <span className="muted">v</span>
                        {e.app_version ?? '?'}
                      </div>
                      {e.user_agent && <div className="muted" style={{ overflowWrap: 'anywhere' }}>{e.user_agent}</div>}
                      {e.stack && (
                        <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', fontSize: 12, margin: 0 }}>{e.stack}</pre>
                      )}
                    </div>
                  </details>
                ))}
              </div>
            )}
          </section>
          <p className="muted small">{tr(L.privacy, lang)}</p>
        </>
      )}
    </div>
  );
}

export default function Statistik({ lang, go }: SectionProps) {
  const access = useAccess();
  return (
    <div className="stack">
      <h1>{tr(L.title, lang)}</h1>
      {access.loading ? (
        <p className="muted">{tr(L.checking, lang)}</p>
      ) : access.admin ? (
        <Dashboard lang={lang} />
      ) : (
        <div className="card stack">
          <p style={{ margin: 0 }}>{tr(L.noAccess, lang)}</p>
          {!!access.error && <p className="bad small" style={{ margin: 0 }}>{describeError(access.error, lang)}</p>}
          {!access.signedIn && (
            <button type="button" className="btn" onClick={() => go('konto')}>
              {tr(L.toKonto, lang)}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
