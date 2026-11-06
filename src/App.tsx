import { Suspense, useEffect, useState } from 'react';
import Home from './sections/home/index.tsx';
import Boot from './sync/Boot.tsx';
import { sectionById } from './sections/registry.ts';
import { useStore } from './lib/storage.ts';
import { t } from './lib/i18n.ts';
import { track } from './lib/analytics.ts';

const readRoute = () => window.location.hash.replace(/^#\/?/, '') || 'home';

export default function App() {
  const [store, update] = useStore();
  const [route, setRoute] = useState(readRoute);

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
          <button type="button" className="btn small ghost" aria-label={t('account', lang)} onClick={() => go('konto')}>
            👤
          </button>
        </div>
      </header>

      <Boot />

      <main className="shell">{view}</main>

      <footer className="foot">{t('dataNote', lang)}</footer>
    </>
  );
}
