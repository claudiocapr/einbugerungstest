import { useEffect, useState } from 'react';
import { Home } from './components/Home.tsx';
import { Exam } from './components/Exam.tsx';
import { Practice, type PracticeScope } from './components/Practice.tsx';
import { Browse } from './components/Browse.tsx';
import { Stats } from './components/Stats.tsx';
import { useStore } from './lib/storage.ts';
import { t } from './lib/i18n.ts';

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
  };

  const [head, tail] = route.split('/');
  const state = store.state;
  const lang = store.lang;

  // Every screen except the picker needs a Bundesland, so fall back to home.
  const view = !state ? (
    <Home lang={lang} onGo={go} />
  ) : head === 'exam' ? (
    <Exam state={state} lang={lang} onExit={() => go('home')} />
  ) : head === 'practice' ? (
    <Practice
      state={state}
      lang={lang}
      scope={(tail as PracticeScope) || 'all'}
      onScope={(s) => go(`practice/${s}`)}
      onExit={() => go('home')}
    />
  ) : head === 'browse' ? (
    <Browse state={state} lang={lang} onExit={() => go('home')} />
  ) : head === 'stats' ? (
    <Stats state={state} lang={lang} onExit={() => go('home')} />
  ) : (
    <Home lang={lang} onGo={go} />
  );

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
        </div>
      </header>

      <main className="shell">{view}</main>

      <footer className="foot">{t('dataNote', lang)}</footer>
    </>
  );
}
