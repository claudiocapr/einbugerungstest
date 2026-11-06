import { useEffect, useState } from 'react';
import { useStore } from '../lib/storage.ts';
import { doNotTrackSet, installAnalytics, NOTICE_KEY } from './analytics.ts';
import { hasStoredSession } from './supabase.ts';
import { startSync } from './sync.ts';

/**
 * Start-up work, rendered once by the app shell: installs the analytics sink
 * and error handlers, restores a stored Supabase session and starts progress
 * sync, and shows the one-time analytics notice.
 */

function noticeSeen(): boolean {
  try {
    return globalThis.localStorage?.getItem(NOTICE_KEY) === '1';
  } catch {
    // Without storage the notice would show on every visit; better not at all.
    return true;
  }
}

function markNoticeSeen() {
  try {
    globalThis.localStorage?.setItem(NOTICE_KEY, '1');
  } catch {
    /* ignore */
  }
}

const TEXT = {
  notice: {
    de: 'Anonyme Nutzungsstatistik hilft, die App zu verbessern. Keine persönlichen Daten.',
    en: 'Anonymous usage statistics help improve the app. No personal data.',
  },
  settings: { de: 'Einstellungen', en: 'Settings' },
};

export default function Boot() {
  const [store] = useStore();
  const lang = store.lang;
  // Do Not Track already means "off", so there is nothing to announce.
  const [showNotice, setShowNotice] = useState(() => !noticeSeen() && !doNotTrackSet());

  useEffect(() => {
    installAnalytics();
    // Only load supabase-js when an earlier sign-in left a session behind.
    if (hasStoredSession()) void startSync();
  }, []);

  if (!showNotice) return null;

  const close = () => {
    markNoticeSeen();
    setShowNotice(false);
  };

  return (
    <div
      role="region"
      aria-label={lang === 'de' ? 'Hinweis zur Statistik' : 'Statistics notice'}
      className="card"
      style={{
        position: 'fixed',
        left: 12,
        right: 12,
        bottom: 12,
        zIndex: 40,
        maxWidth: 640,
        margin: '0 auto',
        padding: '12px 14px',
      }}
    >
      <div className="row wrap" style={{ justifyContent: 'space-between' }}>
        <span className="small" style={{ flex: '1 1 260px' }}>
          {TEXT.notice[lang]}
        </span>
        <div className="row">
          <a
            className="btn small ghost"
            href="#/konto"
            style={{ textDecoration: 'none' }}
            onClick={close}
          >
            {TEXT.settings[lang]}
          </a>
          <button type="button" className="btn small primary" onClick={close}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
