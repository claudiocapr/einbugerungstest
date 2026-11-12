// Lernseiten: die vier Fälle, Tabellen mit Eselsbrücken, der Possessiv-Baukasten.
import { useState, type ReactNode } from 'react';
import type { Lang, Text2 } from '../../types.ts';
import { tr } from '../../lib/i18n.ts';
import {
  ADJ_END,
  type AdjType,
  CASES,
  CASE_NAME,
  CASE_QUESTION,
  CASE_ROLE,
  type Case,
  DEF,
  type EinWord,
  GENDERS,
  type Gender,
  PERSONS,
  PERSON_LABEL,
  POSSESSIVES,
  POSSESSIVE_OF,
  PP,
  type Possessive,
  REFL,
  REL,
  WER,
  aloneForm,
  einParts,
} from '../../content/grammatik/forms.ts';
import { SAMPLE } from '../../content/grammatik/items.ts';
import { Aid, CaseTag, Ending, LastLetter, SpeakButton, useTts } from './shared.tsx';

export type LearnPage = 'faelle' | 'artikel' | 'possessiv' | 'pronomen' | 'fragen' | 'allein' | 'adjektive' | 'ndekl';

export const LEARN_PAGES: { id: LearnPage | 'warum' | 'eselsbruecken' | 'merktipps'; icon: string; title: Text2; sub: Text2 }[] = [
  { id: 'faelle', icon: '🎯', title: { de: 'Die vier Fälle', en: 'The four cases' }, sub: { de: 'Fragen, Rollen, Farben – ein Beispielsatz', en: 'Questions, roles, colours – one example sentence' } },
  { id: 'artikel', icon: '📋', title: { de: 'der · ein · kein', en: 'der · ein · kein' }, sub: { de: 'Artikel in allen Fällen', en: 'Articles in every case' } },
  { id: 'possessiv', icon: '🧱', title: { de: 'mein, dein, sein …', en: 'mein, dein, sein …' }, sub: { de: 'Possessivartikel + Baukasten', en: 'Possessives + form builder' } },
  { id: 'pronomen', icon: '👤', title: { de: 'ich – mich – mir', en: 'ich – mich – mir' }, sub: { de: 'Personal- und Reflexivpronomen', en: 'Personal and reflexive pronouns' } },
  { id: 'fragen', icon: '❓', title: { de: 'wer – wen – wem – wessen', en: 'wer – wen – wem – wessen' }, sub: { de: 'Fragewörter und Relativpronomen', en: 'Question words and relative pronouns' } },
  { id: 'allein', icon: '☝️', title: { de: 'einer, keiner, meiner', en: 'einer, keiner, meiner' }, sub: { de: 'Ohne Nomen: Das ist meiner.', en: 'Without a noun: Das ist meiner.' } },
  { id: 'adjektive', icon: '🎨', title: { de: 'Adjektivendungen', en: 'Adjective endings' }, sub: { de: 'der gute · ein guter · guter', en: 'der gute · ein guter · guter' } },
  { id: 'ndekl', icon: '➕', title: { de: 'n-Deklination', en: 'Weak nouns (n-declension)' }, sub: { de: 'der Kollege → dem Kollegen', en: 'der Kollege → dem Kollegen' } },
  { id: 'warum', icon: '⚖️', title: { de: 'Was bestimmt den Fall?', en: 'What decides the case?' }, sub: { de: 'Verben, Präpositionen, Wo?/Wohin?', en: 'Verbs, prepositions, where?/where to?' } },
  { id: 'eselsbruecken', icon: '💡', title: { de: 'Eselsbrücken', en: 'Memory aids' }, sub: { de: 'Alle Merksätze zum Anhören', en: 'Every mnemonic, with audio' } },
  { id: 'merktipps', icon: '🧠', title: { de: 'Merktipps', en: 'Memory tips' }, sub: { de: 'Verb + Fall, Präposition + Fall, warten auf + Akk', en: 'Verb + case, preposition + case, warten auf + acc' } },
];

const GENDER_COL: Record<Gender, Text2> = {
  m: { de: 'mask.', en: 'masc.' },
  f: { de: 'fem.', en: 'fem.' },
  n: { de: 'neutr.', en: 'neut.' },
  pl: { de: 'Plural', en: 'plural' },
};

const L = {
  example: { de: 'Beispiel', en: 'Example' },
} satisfies Record<string, Text2>;

/** A table with one row per case (in its colour) and one column per gender. */
export function CaseTable({
  lang,
  cases = CASES,
  cols = GENDERS.map((g) => ({ key: g, label: tr(GENDER_COL[g], lang) })),
  cell,
  hl,
  caption,
}: {
  lang: Lang;
  cases?: Case[];
  cols?: { key: string; label: string }[];
  cell: (c: Case, key: string) => ReactNode;
  hl?: (c: Case, key: string) => boolean;
  caption?: string;
}) {
  return (
    <div className="gr-tablewrap">
      <table className="gr-table">
        {caption && <caption className="small muted" style={{ textAlign: 'left', paddingBottom: 4 }}>{caption}</caption>}
        <thead>
          <tr>
            <th scope="col">
              <span className="sr-only">{tr({ de: 'Fall', en: 'Case' }, lang)}</span>
            </th>
            {cols.map((col) => (
              <th key={col.key} scope="col">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cases.map((c) => (
            <tr key={c}>
              <th scope="row" className={`gr-${c}`} title={CASE_NAME[c][lang]}>
                {CASE_NAME[c].de.slice(0, 3)}.
              </th>
              {cols.map((col) => (
                <td key={col.key} className={hl?.(c, col.key) ? 'gr-hl' : undefined}>
                  {cell(c, col.key)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EinCell({ stem, c, g }: { stem: EinWord; c: Case; g: Gender }) {
  const p = einParts(stem, c, g);
  if (!p) return <span className="muted">–</span>;
  return <Ending stem={p.stem} end={p.end} c={c} />;
}

function Page({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <h1>{title}</h1>
      <div className="stack">{children}</div>
    </>
  );
}

/* ------------------------------------------------------------------ pages */

function Faelle({ lang, tts }: { lang: Lang; tts: boolean }) {
  const parts: { text: string; c?: Case }[] = [
    { text: 'Der Vater', c: 'nom' },
    { text: ' gibt ' },
    { text: 'dem Kind', c: 'dat' },
    { text: ' ' },
    { text: 'den Ball', c: 'akk' },
    { text: ' ' },
    { text: 'des Nachbarn', c: 'gen' },
    { text: '.' },
  ];
  return (
    <Page title={tr({ de: 'Die vier Fälle', en: 'The four cases' }, lang)}>
      <p className="muted" style={{ margin: 0 }}>
        {tr(
          {
            de: 'Jedes Nomen hat in einem Satz eine Rolle. Die Rolle bestimmt den Fall – und der Fall verändert vor allem den Artikel: der → den → dem → des.',
            en: 'Every noun plays a role in the sentence. The role decides the case – and the case mostly changes the article: der → den → dem → des.',
          },
          lang,
        )}
      </p>
      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <p className="gr-sentence" style={{ margin: 0 }}>
            {parts.map((p, i) =>
              p.c ? (
                <span key={i} className={`gr-${p.c}`}>
                  <span className="seg">{p.text}</span>
                  <span className="lab">{CASE_NAME[p.c].de.slice(0, 3)}</span>
                </span>
              ) : (
                <span key={i}>{p.text}</span>
              ),
            )}
          </p>
          {tts && <SpeakButton text="Der Vater gibt dem Kind den Ball des Nachbarn." lang={lang} />}
        </div>
        <p className="small muted" style={{ marginBottom: 0 }}>
          „The father gives the child the neighbour’s ball.“
        </p>
      </div>
      <div className="gr-cases">
        {CASES.map((c) => (
          <div key={c} className={`gr-case gr-${c}`}>
            <div className="name">{CASE_NAME[c].de}</div>
            <div className="q">{CASE_QUESTION[c]}</div>
            <div className="role">{tr(CASE_ROLE[c], lang)}</div>
            <div className="ex">
              {c === 'nom' && <><b className="gr-c">Der Vater</b> gibt …</>}
              {c === 'akk' && <>… gibt <b className="gr-c">den Ball</b></>}
              {c === 'dat' && <>… gibt <b className="gr-c">dem Kind</b> …</>}
              {c === 'gen' && <>der Ball <b className="gr-c">des Nachbarn</b></>}
            </div>
          </div>
        ))}
      </div>
      <Aid lang={lang} tts={tts} title={tr({ de: 'Frage-Trick', en: 'The question trick' }, lang)} chant="Wer oder was? Nominativ. Wen oder was? Akkusativ. Wem? Dativ. Wessen? Genitiv.">
        {tr(
          {
            de: 'Fragen Sie nach dem Nomen: Wer/Was? → Nominativ · Wen/Was? → Akkusativ · Wem? → Dativ · Wessen? → Genitiv.',
            en: 'Ask about the noun: Wer/Was? → nominative · Wen/Was? → accusative · Wem? → dative · Wessen? → genitive.',
          },
          lang,
        )}
      </Aid>
      <div className="card small">
        <strong>{tr({ de: 'Was ist am wichtigsten?', en: 'What matters most?' }, lang)}</strong>
        <p style={{ margin: '6px 0 0' }}>
          {tr(
            {
              de: 'Für B1 sind Akkusativ und Dativ das Wichtigste. Der Fall kommt vom Verb (helfen + Dativ), von der Präposition (mit + Dativ, für + Akkusativ) oder von der Rolle im Satz. Den Genitiv brauchen Sie vor allem für Besitz (das Auto meines Vaters) und nach wegen, trotz, während.',
              en: 'For B1, the accusative and dative matter most. The case comes from the verb (helfen + dative), the preposition (mit + dative, für + accusative) or the role in the sentence. You mainly need the genitive for possession (das Auto meines Vaters) and after wegen, trotz, während.',
            },
            lang,
          )}
        </p>
      </div>
    </Page>
  );
}

function Artikel({ lang, tts }: { lang: Lang; tts: boolean }) {
  return (
    <Page title={tr({ de: 'der · ein · kein', en: 'der · ein · kein' }, lang)}>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>{tr({ de: 'Bestimmter Artikel', en: 'Definite article' }, lang)}</h2>
        <CaseTable lang={lang} cell={(c, g) => <LastLetter word={DEF[c][g as Gender]} c={c} />} />
        <Aid lang={lang} tts={tts} title="r-e-s-e · n-e-s-e · m-r-m-n · s-r-s-r" chant="der, die, das, die. den, die, das, die. dem, der, dem, den. des, der, des, der.">
          {tr(
            { de: 'Die letzten Buchstaben, Zeile für Zeile. Einmal laut sprechen, dann sitzt die Tabelle.', en: 'The last letters, row by row. Say them out loud and the table sticks.' },
            lang,
          )}
        </Aid>
        <ul className="gr-list small">
          <li>
            {tr({ de: 'Dativ Plural: Artikel den und Nomen + n:', en: 'Dative plural: article den and noun + n:' }, lang)} <b className="gr-dat gr-c">den Kindern</b>,{' '}
            {tr({ de: 'aber nicht bei -n oder -s:', en: 'but not after -n or -s:' }, lang)} den Frauen, den Autos.
          </li>
          <li>
            {tr({ de: 'Genitiv maskulin/neutrum: auch das Nomen bekommt -s/-es:', en: 'Genitive masculine/neuter: the noun takes -s/-es too:' }, lang)}{' '}
            <b className="gr-gen gr-c">des Vaters, des Kindes</b>.
          </li>
        </ul>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>{tr({ de: 'Unbestimmter Artikel: ein', en: 'Indefinite article: ein' }, lang)}</h2>
        <CaseTable lang={lang} cell={(c, g) => <EinCell stem="ein" c={c} g={g as Gender} />} />
        <p className="small muted">{tr({ de: 'ein hat keinen Plural: ein Kind → Kinder.', en: 'ein has no plural: ein Kind → Kinder.' }, lang)}</p>
        <h2>{tr({ de: 'Negation: kein', en: 'Negation: kein' }, lang)}</h2>
        <CaseTable lang={lang} cell={(c, g) => <EinCell stem="kein" c={c} g={g as Gender} />} />
        <Aid lang={lang} tts={tts} title={tr({ de: 'Nur maskulin ändert sich im Akkusativ', en: 'Only the masculine changes in the accusative' }, lang)} chant="der wird den. ein wird einen. kein wird keinen.">
          {tr({ de: 'der → den, ein → einen, kein → keinen. Feminin, neutrum und Plural bleiben im Akkusativ gleich.', en: 'der → den, ein → einen, kein → keinen. Feminine, neuter and plural stay the same in the accusative.' }, lang)}
        </Aid>
        <Aid lang={lang} tts={tts} title={tr({ de: 'Drei Formen ohne Endung', en: 'Three forms without an ending' }, lang)}>
          {tr(
            {
              de: 'ein Vater (Nom. m), ein Kind (Nom. und Akk. n). Sonst nimmt ein/kein die Endung von der/die/das: dem → einem, der → einer, den → keinen.',
              en: 'ein Vater (nom. m), ein Kind (nom. and acc. n). Otherwise ein/kein takes the ending of der/die/das: dem → einem, der → einer, den → keinen.',
            },
            lang,
          )}
        </Aid>
      </div>
    </Page>
  );
}

const SENT: Record<Case, (np: string) => string> = {
  nom: (np) => `Das ist ${np}.`,
  akk: (np) => `Ich sehe ${np}.`,
  dat: (np) => `Ich helfe ${np}.`,
  gen: (np) => `Das ist das Auto ${np}.`,
};

function Possessiv({ lang, tts }: { lang: Lang; tts: boolean }) {
  const [poss, setPoss] = useState<Possessive>('mein');
  const [c, setC] = useState<Case>('dat');
  const [g, setG] = useState<Gender>('m');
  const p = einParts(poss, c, g)!;
  const np = `${p.stem}${p.end} ${SAMPLE[g][c]}`;
  const sentence = SENT[c](np);
  return (
    <Page title={tr({ de: 'mein, dein, sein …', en: 'mein, dein, sein …' }, lang)}>
      <div className="card">
        <p style={{ marginTop: 0 }}>
          {tr(
            {
              de: 'Alle Possessivartikel gehen wie ein/kein. Erst wählen Sie das Wort nach dem Besitzer, dann die Endung nach dem Nomen und dem Fall.',
              en: 'Every possessive works like ein/kein. First pick the word by the owner, then the ending by the noun and the case.',
            },
            lang,
          )}
        </p>
        <div className="gr-tablewrap">
          <table className="gr-table">
            <thead>
              <tr>
                <th scope="col">{tr({ de: 'Besitzer', en: 'Owner' }, lang)}</th>
                <th scope="col">{tr({ de: 'Possessiv', en: 'Possessive' }, lang)}</th>
                <th scope="col">{tr(L.example, lang)}</th>
              </tr>
            </thead>
            <tbody>
              {POSSESSIVES.map((x) => (
                <tr key={x}>
                  <td className="wrap">{POSSESSIVE_OF[x]}</td>
                  <td>
                    <b>{x}</b>
                  </td>
                  <td className="small wrap">
                    {x} Sohn
                    <br />
                    <Ending stem={x === 'euer' ? 'eur' : x} end="e" c="nom" /> Tochter
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Aid lang={lang} tts={tts} title={tr({ de: 'euer verliert sein e', en: 'euer drops its e' }, lang)} chant="euer Sohn, eure Tochter, euren Sohn, eurem Kind.">
          {tr({ de: 'Sobald eine Endung kommt: eure, euren, eurem, eurer, eures.', en: 'As soon as an ending is added: eure, euren, eurem, eurer, eures.' }, lang)}
        </Aid>
        <Aid lang={lang} tts={tts} title={tr({ de: 'sein oder ihr?', en: 'sein or ihr?' }, lang)}>
          {tr(
            {
              de: 'Das hängt vom Besitzer ab, nicht vom Nomen: Er besucht seine Mutter. Sie besucht ihren Vater. Die Endung kommt vom Nomen.',
              en: 'It depends on the owner, not the noun: Er besucht seine Mutter. Sie besucht ihren Vater. The ending comes from the noun.',
            },
            lang,
          )}
        </Aid>
      </div>

      <div className="card gr-builder">
        <h2 style={{ margin: 0 }}>{tr({ de: 'Baukasten: Form bilden', en: 'Builder: make any form' }, lang)}</h2>
        <div className="chips" role="group" aria-label="Possessiv">
          {POSSESSIVES.map((x) => (
            <button key={x} type="button" className="chip" aria-pressed={poss === x} onClick={() => setPoss(x)}>
              {x}
            </button>
          ))}
        </div>
        <div className="chips" role="group" aria-label={tr({ de: 'Fall', en: 'Case' }, lang)}>
          {CASES.map((x) => (
            <button key={x} type="button" className={`chip gr-${x}`} aria-pressed={c === x} onClick={() => setC(x)}>
              <span className="gr-c">{CASE_NAME[x].de}</span>
            </button>
          ))}
        </div>
        <div className="chips" role="group" aria-label={tr({ de: 'Genus', en: 'Gender' }, lang)}>
          {GENDERS.map((x) => (
            <button key={x} type="button" className="chip" aria-pressed={g === x} onClick={() => setG(x)}>
              {tr(GENDER_COL[x], lang)}
            </button>
          ))}
        </div>
        <div className="gr-result" aria-live="polite">
          <Ending stem={p.stem} end={p.end} c={c} /> <span className="noun">{SAMPLE[g][c]}</span>
        </div>
        <div className="row" style={{ justifyContent: 'center' }}>
          <span className="small">{sentence}</span>
          {tts && <SpeakButton text={sentence} lang={lang} />}
        </div>
        <CaseTable lang={lang} cell={(cc, gg) => <EinCell stem={poss} c={cc} g={gg as Gender} />} hl={(cc, gg) => cc === c && gg === g} />
      </div>
    </Page>
  );
}

function Pronomen({ lang, tts }: { lang: Lang; tts: boolean }) {
  return (
    <Page title={tr({ de: 'ich – mich – mir', en: 'ich – mich – mir' }, lang)}>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>{tr({ de: 'Personalpronomen', en: 'Personal pronouns' }, lang)}</h2>
        <div className="gr-tablewrap">
          <table className="gr-table">
            <thead>
              <tr>
                <th scope="col" />
                {(['nom', 'akk', 'dat'] as Case[]).map((c) => (
                  <th key={c} scope="col">
                    <CaseTag c={c} lang={lang} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERSONS.map((p) => (
                <tr key={p}>
                  <td className="small muted">{tr(PERSON_LABEL[p], lang)}</td>
                  <td className="gr-nom">{PP[p].nom}</td>
                  <td className="gr-akk">
                    <span className="gr-c">{PP[p].akk}</span>
                  </td>
                  <td className="gr-dat">
                    <span className="gr-c">{PP[p].dat}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Aid lang={lang} tts={tts} title={tr({ de: 'ihN wie deN, ihM wie deM', en: 'ihN like deN, ihM like deM' }, lang)} chant="den Mann: ihn. dem Mann: ihm.">
          {tr({ de: 'Ich sehe den Mann → ich sehe ihn. Ich helfe dem Mann → ich helfe ihm.', en: 'Ich sehe den Mann → ich sehe ihn. Ich helfe dem Mann → ich helfe ihm.' }, lang)}
        </Aid>
        <Aid lang={lang} tts={tts} title={tr({ de: 'mich/dich = Akkusativ, mir/dir = Dativ', en: 'mich/dich = accusative, mir/dir = dative' }, lang)} chant="Er sieht mich. Er hilft mir. Er sieht dich. Er hilft dir.">
          {tr({ de: 'Er sieht mich (sehen + Akk). Er hilft mir (helfen + Dat).', en: 'Er sieht mich (sehen + acc). Er hilft mir (helfen + dat).' }, lang)}
        </Aid>
        <Aid lang={lang} tts={tts} title={tr({ de: 'sie, ihr, ihnen – nicht verwechseln', en: 'sie, ihr, ihnen – don’t mix them up' }, lang)}>
          {tr(
            {
              de: 'sie (Sg.) → Dativ ihr: Ich helfe ihr. sie (Pl.) → Dativ ihnen: Ich helfe ihnen. Sie (höflich) → Ihnen: Ich danke Ihnen.',
              en: 'sie (she) → dative ihr: Ich helfe ihr. sie (they) → dative ihnen: Ich helfe ihnen. Sie (formal) → Ihnen: Ich danke Ihnen.',
            },
            lang,
          )}
        </Aid>
      </div>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>{tr({ de: 'Reflexivpronomen', en: 'Reflexive pronouns' }, lang)}</h2>
        <div className="gr-tablewrap">
          <table className="gr-table">
            <thead>
              <tr>
                <th scope="col" />
                <th scope="col">
                  <CaseTag c="akk" lang={lang} />
                </th>
                <th scope="col">
                  <CaseTag c="dat" lang={lang} />
                </th>
              </tr>
            </thead>
            <tbody>
              {PERSONS.map((p) => (
                <tr key={p}>
                  <td className="small muted">{tr(PERSON_LABEL[p], lang)}</td>
                  <td className="gr-akk">
                    <span className={REFL[p].akk !== REFL[p].dat ? 'gr-c' : undefined}>{REFL[p].akk}</span>
                  </td>
                  <td className="gr-dat">
                    <span className={REFL[p].akk !== REFL[p].dat ? 'gr-c' : undefined}>{REFL[p].dat}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Aid lang={lang} tts={tts} title={tr({ de: 'Gibt es schon ein Akkusativ-Objekt? → Dativ', en: 'Already an accusative object? → dative' }, lang)} chant="Ich wasche mich. Ich wasche mir die Hände.">
          {tr(
            {
              de: 'Ich wasche mich. – Ich wasche mir die Hände (die Hände = Akkusativ). Nur bei ich und du sieht man den Unterschied: mich/mir, dich/dir.',
              en: 'Ich wasche mich. – Ich wasche mir die Hände (die Hände = accusative). Only ich and du show the difference: mich/mir, dich/dir.',
            },
            lang,
          )}
        </Aid>
      </div>
    </Page>
  );
}

function Fragen({ lang, tts }: { lang: Lang; tts: boolean }) {
  const examples: Record<Case, string> = {
    nom: 'Wer hat angerufen?',
    akk: 'Wen hast du getroffen?',
    dat: 'Wem gehört die Tasche?',
    gen: 'Wessen Schlüssel ist das?',
  };
  return (
    <Page title={tr({ de: 'wer – wen – wem – wessen', en: 'wer – wen – wem – wessen' }, lang)}>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>{tr({ de: 'Fragewörter', en: 'Question words' }, lang)}</h2>
        <div className="gr-tablewrap">
          <table className="gr-table">
            <tbody>
              {CASES.map((c) => (
                <tr key={c}>
                  <th scope="row" className={`gr-${c}`}>
                    {CASE_NAME[c].de.slice(0, 3)}.
                  </th>
                  <td>
                    <b className={`gr-${c} gr-c`}>{WER[c]}</b>
                  </td>
                  <td className="small" style={{ whiteSpace: 'normal' }}>
                    {examples[c]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Aid lang={lang} tts={tts} title={tr({ de: 'wer geht wie der', en: 'wer goes like der' }, lang)} chant="der, den, dem, des. wer, wen, wem, wessen.">
          {tr({ de: 'der → wer, den → wen, dem → wem, des → wessen. Nach einer Präposition: mit wem? für wen?', en: 'der → wer, den → wen, dem → wem, des → wessen. After a preposition: mit wem? für wen?' }, lang)}
        </Aid>
      </div>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>{tr({ de: 'Relativpronomen (B1)', en: 'Relative pronouns (B1)' }, lang)}</h2>
        <CaseTable
          lang={lang}
          cell={(c, g) => {
            const form = REL[c][g as Gender];
            return form === DEF[c][g as Gender] ? form : <b className={`gr-${c} gr-c`}>{form}</b>;
          }}
        />
        <Aid lang={lang} tts={tts} title={tr({ de: 'Wie der Artikel – mit drei Ausnahmen', en: 'Like the article – with three exceptions' }, lang)} chant="denen, dessen, deren.">
          {tr({ de: 'Dativ Plural denen, Genitiv dessen (m/n) und deren (f/Pl.).', en: 'Dative plural denen, genitive dessen (m/n) and deren (f/pl.).' }, lang)}
        </Aid>
        <ul className="gr-list small">
          <li>
            {tr({ de: 'Genus und Zahl kommen vom Nomen davor, der Fall vom Relativsatz:', en: 'Gender and number come from the noun before, the case from the relative clause:' }, lang)}{' '}
            <i>Das ist der Mann, dem ich geholfen habe.</i> (helfen + Dat)
          </li>
          <li>
            <i>Die Leute, denen wir geholfen haben, …</i>
          </li>
          <li>
            <i>Die Kollegin, deren Sohn hier wohnt, …</i>
          </li>
        </ul>
      </div>
    </Page>
  );
}

function Allein({ lang, tts }: { lang: Lang; tts: boolean }) {
  const cases: Case[] = ['nom', 'akk', 'dat'];
  const cell = (stem: 'ein' | 'kein' | 'mein') => (c: Case, g: string) => {
    const f = aloneForm(stem, c, g as Gender);
    if (!f) return <span className="muted">{stem === 'ein' && g === 'pl' ? (c === 'dat' ? 'welchen' : 'welche') : '–'}</span>;
    const article = einParts(stem, c, g as Gender);
    return f === (article ? article.stem + article.end : '') ? f : <b className={`gr-${c} gr-c`}>{f}</b>;
  };
  return (
    <Page title={tr({ de: 'einer, keiner, meiner', en: 'einer, keiner, meiner' }, lang)}>
      <div className="card">
        <p style={{ marginTop: 0 }}>
          {tr(
            {
              de: 'Ohne Nomen braucht das Wort selbst ein Signal für das Genus. Es nimmt die Endung von der/das: der → einer, das → eins. Die markierten Formen sind anders als beim Artikel.',
              en: 'Without a noun the word itself has to show the gender. It takes the ending of der/das: der → einer, das → eins. The marked forms differ from the article.',
            },
            lang,
          )}
        </p>
        <CaseTable lang={lang} cases={cases} cell={cell('ein')} caption="ein-" />
        <CaseTable lang={lang} cases={cases} cell={cell('kein')} caption="kein-" />
        <CaseTable lang={lang} cases={cases} cell={cell('mein')} caption="mein- (dein-, sein-, ihr-, unser-, Ihr-)" />
        <Aid lang={lang} tts={tts} title={tr({ de: 'Beispiele', en: 'Examples' }, lang)} chant="Hast du einen Stift? Ja, ich habe einen. Ist das dein Schlüssel? Ja, das ist meiner. Hast du ein Auto? Nein, ich habe keins.">
          <ul className="gr-list">
            <li>Hast du einen Stift? – Ja, ich habe <b>einen</b>.</li>
            <li>Ist das dein Schlüssel? – Ja, das ist <b>meiner</b>.</li>
            <li>Hast du ein Auto? – Nein, ich habe <b>keins</b>.</li>
            <li>Von den Kollegen hat mir <b>keiner</b> geholfen.</li>
          </ul>
        </Aid>
        <p className="small muted">
          {tr({ de: 'eins/keins/meins heißen auch eines/keines/meines (etwas formeller).', en: 'eins/keins/meins can also be eines/keines/meines (slightly more formal).' }, lang)}
        </p>
      </div>
    </Page>
  );
}

function Adjektive({ lang, tts }: { lang: Lang; tts: boolean }) {
  const table = (t: AdjType, before: (c: Case, g: Gender) => string) => (
    <CaseTable
      lang={lang}
      cell={(c, g) => {
        const gg = g as Gender;
        const art = before(c, gg);
        return (
          <span>
            {art && <span className="gr-art">{art}</span>}
            <Ending stem="gut" end={ADJ_END[t][c][gg]} c={c} />
          </span>
        );
      }}
    />
  );
  return (
    <Page title={tr({ de: 'Adjektivendungen', en: 'Adjective endings' }, lang)}>
      <div className="card">
        <p style={{ marginTop: 0 }}>
          {tr(
            {
              de: 'Die Grundidee: Irgendwer muss den Fall zeigen. Zeigt ihn der Artikel schon deutlich, bekommt das Adjektiv nur -e oder -en. Zeigt ihn kein Artikel, trägt das Adjektiv das Signal selbst.',
              en: 'The core idea: something has to show the case. If the article already shows it clearly, the adjective only takes -e or -en. If no article shows it, the adjective carries the signal itself.',
            },
            lang,
          )}
        </p>
        <h2>1 · {tr({ de: 'nach der/die/das (dieser, jeder …)', en: 'after der/die/das (dieser, jeder …)' }, lang)}</h2>
        {table('def', (c, g) => DEF[c][g])}
        <Aid lang={lang} tts={tts} title={tr({ de: 'Fünfmal -e, sonst -en', en: 'Five times -e, otherwise -en' }, lang)} chant="der gute Mann, die gute Frau, das gute Kind, die gute Frau, das gute Kind. Sonst immer en.">
          {tr({ de: 'Nominativ Singular (alle drei) und Akkusativ feminin/neutrum: -e. Alles andere: -en.', en: 'Nominative singular (all three) and accusative feminine/neuter: -e. Everything else: -en.' }, lang)}
        </Aid>
        <h2>2 · {tr({ de: 'nach ein/kein/mein …', en: 'after ein/kein/mein …' }, lang)}</h2>
        {table('ein', (c, g) => (g === 'pl' ? (c === 'dat' ? 'keinen' : c === 'gen' ? 'keiner' : 'keine') : (einParts('ein', c, g)?.stem ?? '') + (einParts('ein', c, g)?.end ?? '')))}
        <Aid lang={lang} tts={tts} title={tr({ de: 'Wo ein keine Endung hat, springt das Adjektiv ein', en: 'Where ein has no ending, the adjective steps in' }, lang)} chant="ein guter Wein. ein gutes Brot.">
          {tr({ de: 'ein guter Wein (der → -er), ein gutes Brot (das → -es). Sonst wie nach der/die/das.', en: 'ein guter Wein (der → -er), ein gutes Brot (das → -es). Otherwise as after der/die/das.' }, lang)}
        </Aid>
        <h2>3 · {tr({ de: 'ohne Artikel', en: 'without an article' }, lang)}</h2>
        {table('none', () => '')}
        <Aid lang={lang} tts={tts} title={tr({ de: 'Das Adjektiv übernimmt die Artikel-Endung', en: 'The adjective takes over the article’s ending' }, lang)} chant="guter Wein, frische Milch, kaltes Wasser, mit frischem Brot.">
          {tr({ de: 'der → guter Wein, die → frische Milch, das → kaltes Wasser, dem → mit frischem Brot. Nur Genitiv m/n: -en.', en: 'der → guter Wein, die → frische Milch, das → kaltes Wasser, dem → mit frischem Brot. Only genitive m/n: -en.' }, lang)}
        </Aid>
        <p className="small muted">
          {tr({ de: 'Aufpassen: hoch → hohe, teuer → teure, dunkel → dunkle.', en: 'Watch out: hoch → hohe, teuer → teure, dunkel → dunkle.' }, lang)}
        </p>
      </div>
    </Page>
  );
}

function NDekl({ lang, tts }: { lang: Lang; tts: boolean }) {
  const rows: [string, string, string][] = [
    ['der Kollege', 'den Kollegen', 'die Kollegen'],
    ['der Junge', 'den Jungen', 'die Jungen'],
    ['der Kunde', 'den Kunden', 'die Kunden'],
    ['der Student', 'den Studenten', 'die Studenten'],
    ['der Praktikant', 'den Praktikanten', 'die Praktikanten'],
    ['der Polizist', 'den Polizisten', 'die Polizisten'],
    ['der Mensch', 'den Menschen', 'die Menschen'],
    ['der Nachbar', 'den Nachbarn', 'die Nachbarn'],
    ['der Herr', 'den Herrn', 'die Herren'],
  ];
  return (
    <Page title={tr({ de: 'n-Deklination', en: 'Weak nouns (n-declension)' }, lang)}>
      <div className="card">
        <p style={{ marginTop: 0 }}>
          {tr(
            {
              de: 'Einige maskuline Nomen bekommen in allen Fällen außer dem Nominativ Singular ein -n oder -en: der Kollege → den/dem/des Kollegen.',
              en: 'Some masculine nouns add -n or -en in every case except the nominative singular: der Kollege → den/dem/des Kollegen.',
            },
            lang,
          )}
        </p>
        <CaseTable
          lang={lang}
          cols={[
            { key: 'sg', label: 'Singular' },
            { key: 'pl', label: 'Plural' },
          ]}
          cell={(c, k) => {
            const art = k === 'pl' ? DEF[c].pl : DEF[c].m;
            const noun = c === 'nom' && k === 'sg' ? 'Kollege' : 'Kollegen';
            return (
              <span>
                {art} {noun === 'Kollegen' ? <Ending stem="Kollege" end="n" c={c} /> : noun}
              </span>
            );
          }}
        />
        <div className="gr-tablewrap">
          <table className="gr-table">
            <thead>
              <tr>
                <th scope="col">Nom.</th>
                <th scope="col">Akk./Dat./Gen.</th>
                <th scope="col">Plural</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([a, b, p]) => (
                <tr key={a}>
                  <td className="wrap">{a}</td>
                  <td className="wrap">{b}</td>
                  <td className="wrap muted">{p}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Aid lang={lang} tts={tts} title={tr({ de: 'Woran erkenne ich sie?', en: 'How do I spot them?' }, lang)} chant="der Kollege, den Kollegen. der Student, dem Studenten. der Herr, dem Herrn.">
          {tr(
            {
              de: 'Maskulin auf -e (Kollege, Junge, Kunde, Neffe), auf -ent, -ant, -ist (Student, Praktikant, Polizist) und einige andere: Mensch, Herr, Nachbar. Herr: Singular Herrn, Plural Herren.',
              en: 'Masculine nouns in -e (Kollege, Junge, Kunde, Neffe), in -ent, -ant, -ist (Student, Praktikant, Polizist) and a few others: Mensch, Herr, Nachbar. Herr: singular Herrn, plural Herren.',
            },
            lang,
          )}
        </Aid>
        <p className="small muted">
          {tr({ de: 'Sonderfall: der Name → des Namens (auch: der Gedanke → des Gedankens).', en: 'Special case: der Name → des Namens (also: der Gedanke → des Gedankens).' }, lang)}
        </p>
      </div>
    </Page>
  );
}

export default function Learn({ page, lang }: { page: LearnPage; lang: Lang }) {
  const tts = useTts();
  switch (page) {
    case 'faelle':
      return <Faelle lang={lang} tts={tts} />;
    case 'artikel':
      return <Artikel lang={lang} tts={tts} />;
    case 'possessiv':
      return <Possessiv lang={lang} tts={tts} />;
    case 'pronomen':
      return <Pronomen lang={lang} tts={tts} />;
    case 'fragen':
      return <Fragen lang={lang} tts={tts} />;
    case 'allein':
      return <Allein lang={lang} tts={tts} />;
    case 'adjektive':
      return <Adjektive lang={lang} tts={tts} />;
    case 'ndekl':
      return <NDekl lang={lang} tts={tts} />;
  }
}

export const isLearnPage = (p: string | undefined): p is LearnPage =>
  p === 'faelle' || p === 'artikel' || p === 'possessiv' || p === 'pronomen' || p === 'fragen' || p === 'allein' || p === 'adjektive' || p === 'ndekl';
