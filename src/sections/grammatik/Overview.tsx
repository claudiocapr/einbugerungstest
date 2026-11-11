import { useMemo } from 'react';
import type { Lang, StrengthLevel } from '../../types.ts';
import { useStore } from '../../lib/storage.ts';
import { tr } from '../../lib/i18n.ts';
import { StrengthBar } from '../../components/Strength.tsx';
import { EXERCISES, exStats, weakIds } from '../../content/grammatik/items.ts';
import { CASES, CASE_NAME, CASE_QUESTION } from '../../content/grammatik/forms.ts';
import { LEARN_PAGES } from './Learn.tsx';
import { EX_META, S } from './shared.tsx';

const levelOf = (value: number, practised: number): StrengthLevel =>
  practised === 0 ? 'new' : value >= 0.85 ? 'strong' : value >= 0.6 ? 'good' : value >= 0.35 ? 'shaky' : 'weak';

export default function Overview({ lang, go }: { lang: Lang; go: (r: string) => void }) {
  const [store] = useStore();
  const progress = store.progress;
  const { stats, weak } = useMemo(() => {
    const now = Date.now();
    return {
      stats: EXERCISES.map((ex) => ({ ex, s: exStats(ex, progress, now) })),
      weak: weakIds(progress, now).length,
    };
  }, [progress]);

  return (
    <div className="gr">
      <h1>{tr(S.title, lang)}</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        {tr(S.intro, lang)}
      </p>

      <div className="gr-tags" style={{ marginBottom: 6 }} aria-hidden="true">
        {CASES.map((c) => (
          <span key={c} className={`gr-tag gr-${c}`}>
            {CASE_NAME[c].de} · {CASE_QUESTION[c]}
          </span>
        ))}
      </div>

      <h2>{tr(S.learn, lang)}</h2>
      <div className="gr-menu">
        {LEARN_PAGES.map((p) => (
          <button key={p.id} type="button" className="tile" onClick={() => go(`grammatik/lernen/${p.id}`)}>
            <span className="icon">{p.icon}</span>
            <span>
              <span className="title">{tr(p.title, lang)}</span>
              <span className="sub">{tr(p.sub, lang)}</span>
            </span>
          </button>
        ))}
      </div>

      <h2>{tr(S.practise, lang)}</h2>
      <div className="stack">
        <button type="button" className={`rec ${weak > 0 ? 'lead' : ''}`} onClick={() => go('grammatik/ueben/schwach')} disabled={weak === 0}>
          <span className="icon">{EX_META.schwach.icon}</span>
          <span style={{ flex: 1 }}>
            <span className="title">{tr(S.weak, lang)}</span>
            <span className="why">{weak > 0 ? tr(S.weakSub, lang) : tr(S.weakNone, lang)}</span>
          </span>
          <span className="count">{weak}</span>
        </button>
        <div className="gr-ex">
          {stats.map(({ ex, s }) => {
            const m = EX_META[ex];
            return (
              <button key={ex} type="button" className="tile" onClick={() => go(`grammatik/ueben/${ex}`)}>
                <span className="icon">{m.icon}</span>
                <span>
                  <span className="title">{tr(m.title, lang)}</span>
                  <span className="sub">{tr(m.sub, lang)}</span>
                  <span className="meta">
                    <StrengthBar value={s.strength} level={levelOf(s.strength, s.practised)} />
                    <span className="small muted">
                      {s.practised}/{s.total} {tr(S.practised, lang)} · {s.strong} {tr(S.strong, lang)}
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
