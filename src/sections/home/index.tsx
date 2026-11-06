// Home screen. Owned by the integrator; replaced with the daily plan after the sections land.
import type { SectionProps } from '../types.ts';
import { SECTIONS } from '../registry.ts';
import { tr } from '../../lib/i18n.ts';

export default function Home({ lang, go }: SectionProps) {
  return (
    <div>
      <h1>{lang === 'de' ? 'Für telc Deutsch B1 üben' : 'Practise for telc Deutsch B1'}</h1>
      <div className="stack" style={{ marginTop: 16 }}>
        {SECTIONS.filter((s) => s.tile).map((s) => (
          <button key={s.id} type="button" className="tile" onClick={() => go(s.id)}>
            <span className="icon">{s.icon}</span>
            <span>
              <span className="title">{tr(s.title, lang)}</span>
              <span className="sub">{tr(s.blurb, lang)}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
