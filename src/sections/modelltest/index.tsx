// Placeholder. Owned by: Schreiben + Modelltest agent. Replace this file's contents; keep the default export.
import type { SectionProps } from '../types.ts';

export default function Section({ lang, go }: SectionProps) {
  return (
    <div className="card" style={{ marginTop: 24 }}>
      <h1 style={{ marginTop: 0 }}>Modelltest</h1>
      <p className="muted">{lang === 'de' ? 'Kommt bald.' : 'Coming soon.'}</p>
      <button type="button" className="btn" onClick={() => go('home')}>
        ← {lang === 'de' ? 'Start' : 'Home'}
      </button>
    </div>
  );
}
