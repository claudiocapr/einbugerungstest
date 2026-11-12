// Merktipps: every memory tip about cases in one place – verbs, prepositions, verb + preposition.
import { useMemo } from 'react';
import type { Lang } from '../../types.ts';
import { tr } from '../../lib/i18n.ts';
import { PREPS, type PrepKind } from '../../content/grammatik/rules.ts';
import {
  PREP_GROUP_TIP,
  PREP_KIND_OPTIONS,
  PREP_KIND_LABEL,
  type TipGroup,
  VERB_CASE_ITEMS,
  VERB_CASE_NAME,
  VERB_TIP_GROUPS,
  VPREP_ITEMS,
  VPREP_TIP_GROUPS,
  type VerbCase,
  pairText,
  prepTip,
} from '../../content/grammatik/merken.ts';
import { Aid, CaseTag, useTts } from './shared.tsx';

const prepClass: Record<PrepKind, string> = { akk: 'gr-akk', dat: 'gr-dat', gen: 'gr-gen', wechsel: 'gr-wechsel' };

function Group({ g, lang, tts }: { g: TipGroup; lang: Lang; tts: boolean }) {
  const cls = g.c === 'wechsel' ? 'gr-wechsel' : g.c ? `gr-${g.c}` : '';
  return (
    <Aid lang={lang} tts={tts} title={tr(g.title, lang)} chant={g.chant}>
      {tr(g.text, lang)}
      {g.words.length > 0 && (
        <div className="gr-preps">
          {g.words.map((w) => (
            <span key={w} className={`gr-prep ${cls}`} style={cls ? undefined : { ['--c' as string]: 'var(--muted)' }}>
              {w}
            </span>
          ))}
        </div>
      )}
    </Aid>
  );
}

const VERB_ORDER: VerbCase[] = ['dat', 'akk', 'datakk', 'nom'];

export default function Merktipps({ lang }: { lang: Lang }) {
  const tts = useTts();
  // Verb + preposition patterns grouped by "auf + Akk", most frequent first.
  const byPair = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const v of VPREP_ITEMS) {
      const k = pairText(v.pair);
      m.set(k, [...(m.get(k) ?? []), v.frame]);
    }
    return [...m.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], 'de'));
  }, []);

  return (
    <>
      <h1>{tr({ de: 'Merktipps', en: 'Memory tips' }, lang)}</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        {tr(
          {
            de: 'Alle Tipps zu den Fällen auf einer Seite: welche Verben Dativ oder Akkusativ wollen, welche Präpositionen welchen Fall, und Verb + Präposition. Tippen Sie auf 🔊 und sprechen Sie laut mit.',
            en: 'Every case tip on one page: which verbs take the dative or accusative, which prepositions take which case, and verb + preposition. Tap 🔊 and say them out loud.',
          },
          lang,
        )}
      </p>

      <div className="stack">
        <div className="card">
          <h2 style={{ marginTop: 0 }}>1 · {tr({ de: 'Verb + Fall', en: 'Verb + case' }, lang)}</h2>
          {VERB_TIP_GROUPS.map((g) => (
            <Group key={g.title.de} g={g} lang={lang} tts={tts} />
          ))}
          {VERB_ORDER.map((c) => (
            <details key={c} className="gr-details">
              <summary>
                {c === 'datakk' ? (
                  <>
                    <CaseTag c="dat" lang={lang} /> + <CaseTag c="akk" lang={lang} />
                  </>
                ) : (
                  <CaseTag c={c} lang={lang} />
                )}{' '}
                {tr({ de: 'Alle Verben mit Tipp', en: 'All verbs with their tip' }, lang)} ({VERB_CASE_ITEMS.filter((v) => v.c === c).length})
              </summary>
              <div className="gr-verbs">
                {VERB_CASE_ITEMS.filter((v) => v.c === c).map((v) => (
                  <div key={v.key} className={`gr-verb ${c === 'datakk' ? 'gr-dat' : `gr-${c}`}`}>
                    <b>{v.verb}</b> <span className="small muted">– {VERB_CASE_NAME[v.c].de}</span>
                    <span className="ex">{v.example}</span>
                    <span className="ex">💡 {tr(v.tip, lang)}</span>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0 }}>2 · {tr({ de: 'Präposition + Fall', en: 'Preposition + case' }, lang)}</h2>
          {PREP_KIND_OPTIONS.map((k) => (
            <Aid key={k} lang={lang} tts={tts} title={PREP_KIND_LABEL[k]} chant={PREP_GROUP_TIP[k].chant}>
              {tr(PREP_GROUP_TIP[k], lang)}
              <div className="gr-preps">
                {PREPS.filter((p) => p.kind === k).map((p) => (
                  <span key={p.prep} className={`gr-prep ${prepClass[k]}`} title={p.en}>
                    {p.prep}
                  </span>
                ))}
              </div>
            </Aid>
          ))}
          <details className="gr-details">
            <summary>{tr({ de: 'Jede Präposition mit Tipp', en: 'Every preposition with its tip' }, lang)} ({PREPS.length})</summary>
            <div className="gr-verbs">
              {PREPS.map((p) => (
                <div key={p.prep} className={`gr-verb ${prepClass[p.kind]}`}>
                  <b>{p.prep}</b> <span className="small muted">– {PREP_KIND_LABEL[p.kind]} · {p.en}</span>
                  <span className="ex">{p.example}</span>
                  <span className="ex">💡 {tr(prepTip(p), lang)}</span>
                </div>
              ))}
            </div>
          </details>
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0 }}>3 · {tr({ de: 'Verb/Adjektiv/Nomen + Präposition', en: 'Verb/adjective/noun + preposition' }, lang)}</h2>
          {VPREP_TIP_GROUPS.map((g) => (
            <Group key={g.title.de} g={g} lang={lang} tts={tts} />
          ))}
          <h2>{tr({ de: 'Nach Präposition sortiert', en: 'Sorted by preposition' }, lang)}</h2>
          {byPair.map(([pair, frames]) => (
            <details key={pair} className="gr-details">
              <summary>
                <b className={pair.endsWith('Akk') ? 'gr-akk gr-c' : 'gr-dat gr-c'}>{pair}</b> <span className="small muted">({frames.length})</span>
              </summary>
              <p className="small" style={{ margin: '6px 0 0' }}>
                {frames.join(' · ')}
              </p>
            </details>
          ))}
        </div>
      </div>
    </>
  );
}
