// Genus-Regeln: the article rules a teacher gives, grouped by der/die/das,
// with how many nouns of the word list each rule explains and which break it.
import { useMemo } from 'react';
import type { Lang, Text2 } from '../../types.ts';
import { vocab } from '../../content/wortschatz.ts';
import {
  type Article,
  COMPOUND_RULE,
  GENDER_RULES,
  type GenderRule,
  PLURAL_TIPS,
  RELIABILITY,
  VERB_TIPS,
  type VerbTipKind,
  genderTip,
  genderTipText,
  pluralTip,
  ruleCoverage,
  verbTip,
} from '../../content/merktipps.ts';
import { tr } from '../../lib/i18n.ts';
import { ArticleBadge, BackLink, SpeakButton, useTts } from './shared.tsx';
import { MT, spokenTip } from './Merktipp.tsx';

export const G = {
  title: { de: 'Genus-Regeln', en: 'Gender rules' },
  intro: {
    de: 'Mit diesen Merktipps erkennen Sie den Artikel oft schon an der Endung. „immer“ heißt ohne Ausnahme, „fast immer“ heißt wenige Ausnahmen, „meistens“ heißt: eine starke Tendenz – die Ausnahmen lernen Sie extra.',
    en: 'With these memory tips you can often tell the article from the ending. “immer” means always, “fast immer” almost always, “meistens” mostly – learn the exceptions separately.',
  },
  coverage: { de: 'Die Regeln erklären {n} von {total} Nomen aus der Wortliste.', en: 'The rules explain {n} of the {total} nouns in the word list.' },
  practise: { de: 'Genus-Regeln üben', en: 'Practise the gender rules' },
  practiseSub: { de: '10 Nomen – jedes muss 3-mal hintereinander sitzen', en: '10 nouns – each must be right 3 times in a row' },
  inList: { de: 'Wörter in der Liste', en: 'words in the list' },
  word: { de: 'Wort in der Liste', en: 'word in the list' },
  noneInList: { de: 'Keine Beispiele in der B1-Liste – die Regel gilt trotzdem.', en: 'No examples in the B1 list – the rule still applies.' },
  examples: { de: 'Beispiele', en: 'Examples' },
  exceptionsInList: { de: 'Ausnahmen in der Liste', en: 'Exceptions in the list' },
  knownExceptions: { de: 'Bekannte Ausnahmen', en: 'Well-known exceptions' },
  compoundTitle: { de: 'Zusammengesetzte Wörter', en: 'Compound nouns' },
  topExceptions: { de: 'Die wichtigsten Ausnahmen', en: 'The most important exceptions' },
  topExceptionsSub: { de: 'Diese Wörter halten sich nicht an ihre Regel – am besten einzeln lernen.', en: 'These words break their rule – best learnt one by one.' },
  pluralTitle: { de: 'Plural-Tipps', en: 'Plural tips' },
  perfektTitle: { de: 'Perfekt-Tipps', en: 'Perfekt tips' },
  verbs: { de: 'Verben', en: 'verbs' },
  nouns: { de: 'Nomen', en: 'nouns' },
} satisfies Record<string, Text2>;

const fill = (t: Text2, lang: Lang, vars: Record<string, number>) =>
  tr(t, lang).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));

const ARTICLE_TITLE: Record<Article, Text2> = {
  der: { de: 'der – maskulin', en: 'der – masculine' },
  die: { de: 'die – feminin', en: 'die – feminine' },
  das: { de: 'das – neutrum', en: 'das – neuter' },
};

const VERB_ORDER: VerbTipKind[] = ['sein', 'sein-extra', 'haben', 'haben-reflexiv', 'untrennbar', 'untrennbar-2', 'ieren', 'trennbar', 'trennbar-untrennbar'];

function RelBadge({ rel, lang }: { rel: GenderRule['reliability']; lang: Lang }) {
  return <span className={`badge ws-rel ws-rel-${rel.replace(' ', '-')}`}>{tr(RELIABILITY[rel], lang)}</span>;
}

function RuleCard({ rule, lang, tts }: { rule: GenderRule; lang: Lang; tts: boolean }) {
  const cov = ruleCoverage().get(rule.id)!;
  const n = cov.matches.length + cov.exceptions.length;
  // Short, simple words make the best examples (Lampe before Muttersprache).
  const examples = [...cov.matches].sort((a, b) => a.de.length - b.de.length).slice(0, 8);
  return (
    <div className="card ws-rule">
      <div className="ws-rule-head">
        <strong>{tr(rule.label, lang)}</strong>
        <span className="ws-rule-arrow">→</span>
        <ArticleBadge article={rule.article} />
        <RelBadge rel={rule.reliability} lang={lang} />
        {tts && <SpeakButton text={spokenTip(rule.tip.de)} label={MT.listenTip} lang={lang} />}
      </div>
      <p className="ws-rule-tip">{tr(rule.tip, lang)}</p>
      <p className="small muted ws-rule-count">
        {n > 0 ? `${rule.article}: ${n} ${tr(n === 1 ? G.word : G.inList, lang)}` : tr(G.noneInList, lang)}
      </p>
      {cov.matches.length > 0 && (
        <div className="ws-rule-words">
          {examples.map((e) => (
            <span key={e.id} className="chip ws-word-chip">
              {e.article} {e.de}
            </span>
          ))}
          {cov.matches.length > 8 && <span className="small muted">+{cov.matches.length - 8}</span>}
        </div>
      )}
      {cov.exceptions.length > 0 && (
        <p className="small ws-tip-exc">
          ⚠️ {tr(G.exceptionsInList, lang)}: {cov.exceptions.map((e) => `${e.article} ${e.de}`).join(', ')}
        </p>
      )}
    </div>
  );
}

export default function Genus({ lang, go }: { lang: Lang; go: (r: string) => void }) {
  const tts = useTts();
  const stats = useMemo(() => {
    const nouns = vocab.filter((e) => e.pos === 'noun' && e.article);
    const covered = nouns.filter((e) => genderTip(e)).length;
    const plural = new Map<string, number>();
    for (const e of nouns) {
      const p = pluralTip(e);
      if (p) plural.set(p.id, (plural.get(p.id) ?? 0) + 1);
    }
    const verbCounts = new Map<VerbTipKind, number>();
    for (const e of vocab) {
      const v = verbTip(e);
      if (!v) continue;
      verbCounts.set(v.perfekt.kind, (verbCounts.get(v.perfekt.kind) ?? 0) + 1);
      if (v.ge) verbCounts.set(v.ge.kind, (verbCounts.get(v.ge.kind) ?? 0) + 1);
    }
    return { nouns: nouns.length, covered, plural, verbCounts };
  }, []);

  const cov = ruleCoverage();
  const byArticle = (a: Article) =>
    GENDER_RULES.filter((r) => r.article === a && r.id !== 'adj-person').sort((x, y) => {
      const nx = cov.get(x.id)!.matches.length + cov.get(x.id)!.exceptions.length;
      const ny = cov.get(y.id)!.matches.length + cov.get(y.id)!.exceptions.length;
      return ny - nx;
    });
  const compound = cov.get(COMPOUND_RULE.id)!;
  const exceptions = GENDER_RULES.flatMap((r) => cov.get(r.id)!.exceptions).concat(compound.exceptions);
  const famous = [...new Set(GENDER_RULES.filter((r) => r.reliability !== 'immer').flatMap((r) => r.exceptions ?? []))];
  const adjPerson = GENDER_RULES.find((r) => r.id === 'adj-person')!;

  return (
    <div className="ws">
      <BackLink lang={lang} go={go} />
      <h1>💡 {tr(G.title, lang)}</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        {tr(G.intro, lang)}
      </p>
      <p className="small">{fill(G.coverage, lang, { n: stats.covered, total: stats.nouns })}</p>

      <button type="button" className="rec lead" onClick={() => go('wortschatz/genus/ueben')}>
        <span className="icon">🎯</span>
        <span style={{ flex: 1 }}>
          <span className="title">{tr(G.practise, lang)}</span>
          <span className="why">{tr(G.practiseSub, lang)}</span>
        </span>
      </button>

      {(['die', 'der', 'das'] as const).map((a) => (
        <section key={a}>
          <h2>
            <ArticleBadge article={a} /> {tr(ARTICLE_TITLE[a], lang)}
          </h2>
          <div className="ws-rules">
            {byArticle(a).map((r) => (
              <RuleCard key={r.id} rule={r} lang={lang} tts={tts} />
            ))}
            {a === 'der' && <RuleCard rule={adjPerson} lang={lang} tts={tts} />}
          </div>
        </section>
      ))}

      <h2>🧩 {tr(G.compoundTitle, lang)}</h2>
      <div className="card ws-rule">
        <div className="ws-rule-head">
          <RelBadge rel={COMPOUND_RULE.reliability} lang={lang} />
          {tts && <SpeakButton text={spokenTip(COMPOUND_RULE.tip.de)} label={MT.listenTip} lang={lang} />}
        </div>
        <p className="ws-rule-tip">{tr(COMPOUND_RULE.tip, lang)}</p>
        <p className="small muted ws-rule-count">
          {compound.matches.length + compound.exceptions.length} {tr(G.inList, lang)}
        </p>
        <ul className="ws-compounds">
          {compound.matches.slice(0, 8).map((e) => {
            const head = genderTip(e)!.head!;
            return (
              <li key={e.id}>
                {head.article} {head.de} → <strong>{e.article} {e.de}</strong>
              </li>
            );
          })}
        </ul>
        {compound.exceptions.length > 0 && (
          <p className="small ws-tip-exc">
            ⚠️ {tr(G.exceptionsInList, lang)}: {compound.exceptions.map((e) => `${e.article} ${e.de} (${genderTip(e)!.head!.article} ${genderTip(e)!.head!.de})`).join(', ')}
          </p>
        )}
      </div>

      <h2>⚠️ {tr(G.topExceptions, lang)}</h2>
      <div className="card ws-rule">
        <p className="small muted" style={{ marginTop: 0 }}>
          {tr(G.topExceptionsSub, lang)}
        </p>
        <ul className="ws-exc-list">
          {exceptions.map((e) => (
            <li key={e.id}>
              <ArticleBadge article={e.article} /> <strong>{e.de}</strong>
              <span className="small muted"> – {tr(genderTipText(genderTip(e)!, e), lang)}</span>
              {tts && <SpeakButton text={`${e.article} ${e.de}`} label={MT.listenTip} lang={lang} />}
            </li>
          ))}
        </ul>
        <p className="small">
          <strong>{tr(G.knownExceptions, lang)}:</strong> {famous.join(', ')}
        </p>
      </div>

      <h2>📚 {tr(G.pluralTitle, lang)}</h2>
      <div className="ws-rules">
        {Object.values(PLURAL_TIPS).map((p) => (
          <div key={p.id} className="card ws-rule">
            <div className="ws-rule-head">
              <span style={{ flex: 1 }}>{tr(p.text, lang)}</span>
              {tts && <SpeakButton text={spokenTip(p.text.de)} label={MT.listenTip} lang={lang} />}
            </div>
            <p className="small muted ws-rule-count">
              {stats.plural.get(p.id) ?? 0} {tr(G.nouns, lang)}
            </p>
          </div>
        ))}
      </div>

      <h2>⏱️ {tr(G.perfektTitle, lang)}</h2>
      <div className="ws-rules">
        {VERB_ORDER.map((k) => (
          <div key={k} className="card ws-rule">
            <div className="ws-rule-head">
              <span style={{ flex: 1 }}>{tr(VERB_TIPS[k], lang)}</span>
              {tts && <SpeakButton text={spokenTip(VERB_TIPS[k].de)} label={MT.listenTip} lang={lang} />}
            </div>
            <p className="small muted ws-rule-count">
              {stats.verbCounts.get(k) ?? 0} {tr(G.verbs, lang)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
