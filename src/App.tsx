import { Suspense, useEffect, useState } from 'react';
import Home from './sections/home/index.tsx';
import Boot from './sync/Boot.tsx';
import { sectionById } from './sections/registry.ts';
import { useStore } from './lib/storage.ts';
import { t, tr } from './lib/i18n.ts';

const NF_TIP = {
  label: { de: 'Neurofeedback-Modus (Testphase) an/aus', en: 'Neurofeedback mode (test phase) on/off' },
  hover: {
    de: 'Neurofeedback-Modus (Testphase): Sicherheit einschätzen, Antworttempo, Konzentrationspausen und Aussprache-Feedback. Antippen zum Ein- und Ausschalten.',
    en: 'Neurofeedback mode (test phase): rate your confidence, response speed, focus breaks and pronunciation feedback. Tap to turn on or off.',
  },
  on: { de: 'Neurofeedback-Modus: an', en: 'Neurofeedback mode: on' },
  off: { de: 'Neurofeedback-Modus: aus', en: 'Neurofeedback mode: off' },
  onText: {
    de: 'Sie schätzen jetzt vor Antworten ein, wie sicher Sie sind, und bekommen Rückmeldung zu Tempo, Konzentration und Aussprache. Erneut antippen zum Ausschalten.',
    en: 'You now rate how sure you are before answering and get feedback on speed, focus and pronunciation. Tap again to turn it off.',
  },
  offText: {
    de: 'Die App funktioniert wieder wie gewohnt. Ihr Fortschritt bleibt erhalten.',
    en: 'The app works as usual again. Your progress is kept.',
  },
  more: { de: 'Mehr erfahren', en: 'Learn more' },
};
import { track } from './lib/analytics.ts';

const readRoute = () => window.location.hash.replace(/^#\/?/, '') || 'home';

export default function App() {
  const [store, update] = useStore();
  const [route, setRoute] = useState(readRoute);
  const [nfTip, setNfTip] = useState<boolean | null>(null);

  useEffect(() => {
    if (nfTip === null) return;
    const id = setTimeout(() => setNfTip(null), 6000);
    return () => clearTimeout(id);
  }, [nfTip]);

  useEffect(() => {
    const onHash = () => setRoute(readRoute());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (store.theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', store.theme);
  }, [store.theme]);

  useEffect(() => {
    document.documentElement.lang = store.lang;
  }, [store.lang]);

  const go = (next: string) => {
    window.location.hash = `#/${next}`;
    setRoute(next);
    window.scrollTo(0, 0);
  };

  const [head, ...rest] = route.split('/');
  const lang = store.lang;
  const section = head === 'home' ? undefined : sectionById(head);

  useEffect(() => {
    track('screen.view', { section: section?.id ?? 'home' });
  }, [section?.id]);

  let view;
  if (head === 'home' || !head) {
    view = <Home lang={lang} path={rest} go={go} />;
  } else if (section) {
    const Screen = section.component;
    view = (
      <Suspense fallback={<p className="muted" style={{ marginTop: 24 }}>{t('loading', lang)}</p>}>
        <Screen lang={lang} path={rest} go={go} />
      </Suspense>
    );
  } else {
    view = (
      <div className="card" style={{ marginTop: 24 }}>
        <p>{t('notFound', lang)}</p>
        <button type="button" className="btn" onClick={() => go('home')}>
          ← {t('home', lang)}
        </button>
      </div>
    );
  }

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <button type="button" className="brand" onClick={() => go('home')}>
            <span className="flag" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            {t('appName', lang)}
          </button>
          <button
            type="button"
            className="btn small ghost"
            aria-label="Sprache / Language"
            onClick={() => update((s) => ({ ...s, lang: s.lang === 'de' ? 'en' : 'de' }))}
          >
            {lang === 'de' ? 'DE' : 'EN'}
          </button>
          <button
            type="button"
            className="btn small ghost"
            aria-label="Theme"
            onClick={() =>
              update((s) => ({ ...s, theme: s.theme === 'dark' ? 'light' : s.theme === 'light' ? 'system' : 'dark' }))
            }
          >
            {store.theme === 'dark' ? '🌙' : store.theme === 'light' ? '☀️' : '🌗'}
          </button>
          <span className="nf-toggle" data-tip={tr(NF_TIP.hover, lang)}>
            <button
              type="button"
              className="btn small ghost"
              aria-pressed={store.flags.neurofeedback}
              aria-label={tr(NF_TIP.label, lang)}
              style={store.flags.neurofeedback ? { background: 'var(--accent)', color: 'var(--accent-ink)', borderColor: 'var(--accent)' } : { opacity: 0.55 }}
              onClick={() => {
                const on = !store.flags.neurofeedback;
                update((s) => ({ ...s, flags: { ...s.flags, neurofeedback: on } }));
                setNfTip(on);
                track('flag.neurofeedback', { on, from: 'header' });
              }}
            >
              🧠
            </button>
          </span>
          <button type="button" className="btn small ghost" aria-label={t('account', lang)} onClick={() => go('konto')}>
            👤
          </button>
        </div>
      </header>

      <Boot />

      {nfTip !== null && (
        <div className="nf-toast card" role="status">
          <strong>🧠 {tr(nfTip ? NF_TIP.on : NF_TIP.off, lang)}</strong>
          <p className="small" style={{ margin: '6px 0 8px' }}>{tr(nfTip ? NF_TIP.onText : NF_TIP.offText, lang)}</p>
          <div className="row" style={{ gap: 8 }}>
            <button type="button" className="btn small" onClick={() => { setNfTip(null); go('feedback'); }}>
              {tr(NF_TIP.more, lang)}
            </button>
            <button type="button" className="btn small ghost" onClick={() => setNfTip(null)}>
              OK
            </button>
          </div>
        </div>
      )}

      <main className="shell">{view}</main>

      <footer className="foot">{t('dataNote', lang)}</footer>
    </>
  );
}
