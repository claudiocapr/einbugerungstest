// Account: sign in / out, sync status, analytics opt-out and privacy notice. Owned by the backend agent.
import { useEffect, useState, useSyncExternalStore, type CSSProperties, type FormEvent } from 'react';
import type { SectionProps } from '../types.ts';
import { tr } from '../../lib/i18n.ts';
import { signIn, signOut, syncNow, useSyncStatus } from '../../sync/sync.ts';
import {
  doNotTrackSet,
  isAnalyticsEnabled,
  setAnalyticsEnabled,
  subscribeAnalyticsSetting,
} from '../../sync/analytics.ts';
import { useAccess } from '../../sync/access.ts';

const L = {
  title: { de: 'Konto', en: 'Account' },
  inviteOnly: {
    de: 'Konten gibt es nur auf Einladung; eine Registrierung ist nicht möglich. Die App funktioniert ohne Konto vollständig – Ihr Fortschritt bleibt dann auf diesem Gerät (sichern Sie ihn unter „Fortschritt“ als Datei).',
    en: 'Accounts are by invitation only; there is no sign-up. The app works fully without an account – your progress then stays on this device (save it as a file under “Progress”).',
  },
  email: { de: 'E-Mail', en: 'E-mail' },
  password: { de: 'Passwort', en: 'Password' },
  signIn: { de: 'Anmelden', en: 'Sign in' },
  signingIn: { de: 'Anmelden …', en: 'Signing in …' },
  signOut: { de: 'Abmelden', en: 'Sign out' },
  signedInAs: { de: 'Angemeldet als', en: 'Signed in as' },
  syncNow: { de: 'Jetzt synchronisieren', en: 'Sync now' },
  sync: { de: 'Synchronisierung', en: 'Sync' },
  lastSynced: { de: 'Zuletzt synchronisiert', en: 'Last synced' },
  never: { de: 'noch nie', en: 'never' },
  pending: { de: 'Ungesicherte Änderungen', en: 'Unsynced changes' },
  none: { de: 'keine', en: 'none' },
  yes: { de: 'ja – werden gleich übertragen', en: 'yes – sending shortly' },
  syncNote: {
    de: 'Ihr Fortschritt wird zuerst auf dem Gerät gespeichert und dann mit Ihrem Konto abgeglichen. Offline geht nichts verloren.',
    en: 'Your progress is saved on the device first and then matched with your account. Nothing is lost offline.',
  },
  starting: { de: 'Verbindung wird hergestellt …', en: 'Connecting …' },
  states: {
    'signed-out': { de: 'abgemeldet', en: 'signed out' },
    starting: { de: 'startet …', en: 'starting …' },
    syncing: { de: 'synchronisiert …', en: 'syncing …' },
    idle: { de: 'aktuell', en: 'up to date' },
    offline: { de: 'offline – wird nachgeholt', en: 'offline – will catch up' },
    error: { de: 'Fehler', en: 'error' },
  },
  links: { de: 'Bereiche für Ihr Konto', en: 'Areas for your account' },
  telc: { de: 'telc-Material öffnen', en: 'Open telc material' },
  stats: { de: 'Nutzungsstatistik ansehen', en: 'View usage statistics' },
  analytics: { de: 'Anonyme Nutzungsstatistik', en: 'Anonymous usage statistics' },
  analyticsToggle: { de: 'Anonyme Statistik und Fehlerberichte senden', en: 'Send anonymous statistics and error reports' },
  dnt: {
    de: 'Ihr Browser sendet „Do Not Track“. Darum ist die Statistik aus, solange Sie sie hier nicht selbst einschalten.',
    en: 'Your browser sends “Do Not Track”, so statistics stay off unless you switch them on here yourself.',
  },
  privacyTitle: { de: 'Datenschutz in Kürze', en: 'Privacy in brief' },
  privacy: [
    {
      de: 'Was gesendet wird: welche Bereiche geöffnet und welche Übungen beendet werden (mit kleinen Zahlen wie Punkten), die App-Version, ob die App installiert ist, der aktuelle Bildschirm (z. B. „lesen/teil1“) und technische Fehlermeldungen mit Browserkennung. Dazu eine zufällige Installations-ID, die nur in diesem Browser gespeichert ist.',
      en: 'What is sent: which areas are opened and which exercises are finished (with small numbers such as points), the app version, whether the app is installed, the current screen (e.g. “lesen/teil1”) and technical error messages with the browser’s user agent. Plus a random install id stored only in this browser.',
    },
    {
      de: 'Was nicht gesendet wird: Name, E-Mail, Konto, eingegebene Texte, Antworten oder Aufnahmen. Keine Cookies, keine Drittanbieter, keine Werbung.',
      en: 'What is not sent: name, e-mail, account, typed texts, answers or recordings. No cookies, no third parties, no advertising.',
    },
    {
      de: 'Wo es gespeichert wird: in der Datenbank dieser App bei Supabase (Rechenzentrum Frankfurt, EU). Nur der Betreiber kann die Daten lesen; sie werden nach 180 Tagen gelöscht. Supabase selbst protokolliert technisch bedingt kurzzeitig IP-Adressen; die App speichert keine.',
      en: 'Where it is stored: in this app’s database at Supabase (Frankfurt data centre, EU). Only the operator can read it; it is deleted after 180 days. Supabase itself briefly logs IP addresses for technical reasons; the app stores none.',
    },
    {
      de: 'Mit Konto: Ihr Lernfortschritt (geübte Einheiten, Ergebnisse, Entwürfe) wird in Ihrem Konto gespeichert, damit er auf allen Geräten gleich ist. Nur Sie können ihn lesen.',
      en: 'With an account: your learning progress (items practised, results, drafts) is stored in your account so it is the same on every device. Only you can read it.',
    },
  ],
};

const inputStyle: CSSProperties = {
  font: 'inherit',
  color: 'var(--text)',
  background: 'var(--surface-2)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  padding: '9px 11px',
  width: '100%',
  boxSizing: 'border-box',
};

function useAnalyticsSetting(): boolean {
  return useSyncExternalStore(subscribeAnalyticsSetting, isAnalyticsEnabled, isAnalyticsEnabled);
}

function formatTime(ms: number | null, lang: 'de' | 'en'): string {
  if (!ms) return tr(L.never, lang);
  try {
    return new Date(ms).toLocaleString(lang === 'de' ? 'de-DE' : 'en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return new Date(ms).toISOString();
  }
}

export default function Konto({ lang, go }: SectionProps) {
  const status = useSyncStatus();
  const analyticsOn = useAnalyticsSetting();
  const access = useAccess();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status.userId) setPassword('');
  }, [status.userId]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const err = await signIn(email, password);
    setBusy(false);
    if (err) setError(err);
  };

  const signedIn = !!status.userId;

  return (
    <div className="stack">
      <h1>{tr(L.title, lang)}</h1>

      {status.state === 'starting' && !signedIn && <p className="muted">{tr(L.starting, lang)}</p>}

      {!signedIn && status.state !== 'starting' && (
        <form className="card stack" onSubmit={submit} autoComplete="on">
          <p className="muted small" style={{ margin: 0 }}>
            {tr(L.inviteOnly, lang)}
          </p>
          <label className="stack" style={{ gap: 6 }}>
            <span className="small">{tr(L.email, lang)}</span>
            <input
              style={inputStyle}
              type="email"
              name="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="stack" style={{ gap: 6 }}>
            <span className="small">{tr(L.password, lang)}</span>
            <input
              style={inputStyle}
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {(error || status.error) && (
            <p className="bad small" role="alert" style={{ margin: 0 }}>
              {error ?? status.error}
            </p>
          )}
          <button type="submit" className="btn primary" disabled={busy || !email || !password}>
            {busy ? tr(L.signingIn, lang) : tr(L.signIn, lang)}
          </button>
        </form>
      )}

      {signedIn && (
        <div className="card stack">
          <div>
            <span className="muted small">{tr(L.signedInAs, lang)}</span>
            <div style={{ fontWeight: 600, overflowWrap: 'anywhere' }}>{status.email}</div>
          </div>
          <h2 style={{ margin: 0 }}>{tr(L.sync, lang)}</h2>
          <table className="history">
            <tbody>
              <tr>
                <th>Status</th>
                <td className={status.state === 'error' ? 'bad' : status.state === 'idle' ? 'good' : undefined}>
                  {tr(L.states[status.state], lang)}
                </td>
              </tr>
              <tr>
                <th>{tr(L.lastSynced, lang)}</th>
                <td>{formatTime(status.lastSyncedAt, lang)}</td>
              </tr>
              <tr>
                <th>{tr(L.pending, lang)}</th>
                <td>{status.pending ? tr(L.yes, lang) : tr(L.none, lang)}</td>
              </tr>
            </tbody>
          </table>
          {status.error && (
            <p className="bad small" role="alert" style={{ margin: 0 }}>
              {status.error}
            </p>
          )}
          <p className="muted small" style={{ margin: 0 }}>
            {tr(L.syncNote, lang)}
          </p>
          <div className="row wrap">
            <button
              type="button"
              className="btn primary"
              disabled={status.state === 'syncing'}
              onClick={() => void syncNow()}
            >
              {tr(L.syncNow, lang)}
            </button>
            <button type="button" className="btn ghost" onClick={() => void signOut()}>
              {tr(L.signOut, lang)}
            </button>
          </div>
          {(access.telc || access.admin) && (
            <div className="stack" style={{ gap: 8 }}>
              <span className="muted small">{tr(L.links, lang)}</span>
              {access.telc && (
                <button type="button" className="tile" onClick={() => go('telc')}>
                  <span className="icon">🔒</span>
                  <span className="title">{tr(L.telc, lang)}</span>
                </button>
              )}
              {access.admin && (
                <button type="button" className="tile" onClick={() => go('statistik')}>
                  <span className="icon">📊</span>
                  <span className="title">{tr(L.stats, lang)}</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <div className="card stack">
        <h2 style={{ margin: 0 }}>{tr(L.analytics, lang)}</h2>
        <label className="row" style={{ cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={analyticsOn}
            onChange={(e) => setAnalyticsEnabled(e.target.checked)}
            style={{ width: 20, height: 20, accentColor: 'var(--accent)' }}
          />
          <span>{tr(L.analyticsToggle, lang)}</span>
        </label>
        {doNotTrackSet() && (
          <p className="muted small" style={{ margin: 0 }}>
            {tr(L.dnt, lang)}
          </p>
        )}
        <details>
          <summary style={{ cursor: 'pointer', fontWeight: 550 }}>{tr(L.privacyTitle, lang)}</summary>
          <div className="stack small" style={{ marginTop: 10 }}>
            {L.privacy.map((p, i) => (
              <p key={i} style={{ margin: 0 }}>
                {tr(p, lang)}
              </p>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}
