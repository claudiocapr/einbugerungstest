// Merktipps in the Wortschatz section: the small "💡 Merktipp" block on the back
// of a flashcard and in the word list. The rules live in src/content/merktipps.ts.
import type { Lang, Text2 } from '../../types.ts';
import type { VocabEntry } from '../../content/types.ts';
import { type Merktipp, merktipps } from '../../content/merktipps.ts';
import { tr } from '../../lib/i18n.ts';

export const MT = {
  title: { de: 'Merktipp', en: 'Memory tip' },
  genus: { de: 'Artikel', en: 'Article' },
  plural: { de: 'Plural', en: 'Plural' },
  perfekt: { de: 'Perfekt', en: 'Perfekt' },
  partizip: { de: 'Partizip', en: 'Participle' },
  listenTip: { de: 'Tipp vorlesen', en: 'Read the tip aloud' },
} satisfies Record<string, Text2>;

/** Tip text read aloud: no arrows or hyphenated endings for the voice to stumble over. */
export const spokenTip = (text: string) =>
  text
    .replace(/\s*→\s*/g, ': ')
    .replace(/(^|[\s(,])-(?=\p{L})/gu, '$1')
    .replace(/\s+/g, ' ')
    .trim();

function TipLine({ tip, lang }: { tip: Merktipp; lang: Lang }) {
  return (
    <li className={tip.exception ? 'ws-tip-exc' : undefined}>
      <span className="ws-tip-kind">{tr(MT[tip.kind], lang)}</span> {tr(tip.text, lang)}
    </li>
  );
}

/** The tips for one entry; renders nothing when no rule applies. */
export function MerktippBox({ entry, lang }: { entry: VocabEntry; lang: Lang }) {
  const tips = merktipps(entry);
  if (tips.length === 0) return null;
  return (
    <div className="ws-tip">
      <span className="ws-tip-title">💡 {tr(MT.title, lang)}</span>
      <ul>
        {tips.map((t) => (
          <TipLine key={t.kind} tip={t} lang={lang} />
        ))}
      </ul>
    </div>
  );
}
