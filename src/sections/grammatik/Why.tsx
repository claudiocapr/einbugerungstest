// "Was bestimmt den Fall?" and the collected Eselsbrücken.
import type { Lang, Text2 } from '../../types.ts';
import { tr } from '../../lib/i18n.ts';
import { AKK_VERBS, CONTRACTIONS, DAT_AKK_VERBS, DAT_VERBS, NOM_VERBS, PREPS, type PrepKind } from '../../content/grammatik/rules.ts';
import { Aid, CaseTag, SpeakButton, useTts } from './shared.tsx';

const prepClass: Record<PrepKind, string> = { akk: 'gr-akk', dat: 'gr-dat', gen: 'gr-gen', wechsel: 'gr-wechsel' };

function Preps({ kind }: { kind: PrepKind }) {
  return (
    <div className="gr-preps">
      {PREPS.filter((p) => p.kind === kind).map((p) => (
        <span key={p.prep} className={`gr-prep ${prepClass[kind]}`} title={p.en}>
          {p.prep}
        </span>
      ))}
    </div>
  );
}

export function WhyCase({ lang }: { lang: Lang }) {
  const tts = useTts();
  return (
    <>
      <h1>{tr({ de: 'Was bestimmt den Fall?', en: 'What decides the case?' }, lang)}</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        {tr(
          {
            de: 'Drei Dinge entscheiden: das Verb, eine Präposition oder die Rolle im Satz. Fragen Sie immer zuerst: Steht eine Präposition davor?',
            en: 'Three things decide: the verb, a preposition or the role in the sentence. Always ask first: is there a preposition in front?',
          },
          lang,
        )}
      </p>
      <div className="stack">
        <div className="card">
          <h2 style={{ marginTop: 0 }}>1 · {tr({ de: 'Das Verb', en: 'The verb' }, lang)}</h2>
          <p style={{ margin: 0 }}>
            {tr({ de: 'Die meisten Verben haben ein Akkusativ-Objekt:', en: 'Most verbs take an accusative object:' }, lang)}{' '}
            <span className="small muted">{AKK_VERBS.join(', ')} …</span>
          </p>
          <h2 className="gr-dat">
            <CaseTag c="dat" lang={lang} /> {tr({ de: 'Verben mit Dativ', en: 'Verbs with the dative' }, lang)}
          </h2>
          <div className="gr-verbs gr-dat">
            {DAT_VERBS.map((v) => (
              <div key={v.verb} className="gr-verb">
                <b>{v.verb}</b> <span className="small muted">– {v.en}</span>
                <span className="ex">{v.example}</span>
              </div>
            ))}
          </div>
          <Aid lang={lang} tts={tts} title={tr({ de: 'Dativ-Verben als Kette lernen', en: 'Learn the dative verbs as a chain' }, lang)} chant="helfen, danken, gefallen, gehören, gratulieren, antworten, passen, schmecken, fehlen, folgen, glauben, vertrauen, zuhören. Alle mit Dativ.">
            {tr(
              {
                de: 'helfen – danken – gefallen – gehören – gratulieren – antworten – passen – schmecken – fehlen – folgen – glauben – vertrauen – zuhören. Bei fast allen „bekommt“ die Person etwas: Hilfe, Dank, eine Antwort.',
                en: 'helfen – danken – gefallen – gehören – gratulieren – antworten – passen – schmecken – fehlen – folgen – glauben – vertrauen – zuhören. With almost all of them the person “receives” something: help, thanks, an answer.',
              },
              lang,
            )}
          </Aid>
          <h2>
            <CaseTag c="dat" lang={lang} /> + <CaseTag c="akk" lang={lang} /> {tr({ de: 'Person und Sache', en: 'Person and thing' }, lang)}
          </h2>
          <div className="gr-verbs">
            {DAT_AKK_VERBS.map((v) => (
              <div key={v.verb} className="gr-verb gr-dat">
                <b>{v.verb}</b> <span className="small muted">– {v.en}</span>
                <span className="ex">{v.example}</span>
              </div>
            ))}
          </div>
          <Aid lang={lang} tts={tts} title={tr({ de: 'Person = Dativ, Sache = Akkusativ', en: 'Person = dative, thing = accusative' }, lang)} chant="Ich gebe dem Kind den Ball. Ich gebe ihn ihm.">
            {tr({ de: 'Wem gebe ich etwas? Dem Kind (Dativ). Was gebe ich? Den Ball (Akkusativ).', en: 'To whom? Dem Kind (dative). What? Den Ball (accusative).' }, lang)}
          </Aid>
          <h2>{tr({ de: 'Wortstellung mit zwei Objekten', en: 'Word order with two objects' }, lang)}</h2>
          <ul className="gr-list">
            <li>
              {tr({ de: 'Zwei Nomen: Dativ vor Akkusativ –', en: 'Two nouns: dative before accusative –' }, lang)} <i>Ich gebe dem Kind den Ball.</i>
            </li>
            <li>
              {tr({ de: 'Pronomen vor Nomen –', en: 'Pronoun before noun –' }, lang)} <i>Ich gebe ihm den Ball. · Ich gebe ihn dem Kind.</i>
            </li>
            <li>
              {tr({ de: 'Zwei Pronomen: Akkusativ vor Dativ –', en: 'Two pronouns: accusative before dative –' }, lang)} <i>Ich gebe ihn ihm.</i>
            </li>
          </ul>
          <h2>
            <CaseTag c="nom" lang={lang} /> {tr({ de: 'sein, werden, bleiben, heißen', en: 'sein, werden, bleiben, heißen' }, lang)}
          </h2>
          <p style={{ margin: 0 }}>
            {tr({ de: 'Diese Verben verbinden zwei Nominative:', en: 'These verbs link two nominatives:' }, lang)} <i>Das ist ein guter Freund. Er wird ein guter Arzt.</i>{' '}
            <span className="small muted">({NOM_VERBS.join(', ')})</span>
          </p>
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0 }}>2 · {tr({ de: 'Die Präposition', en: 'The preposition' }, lang)}</h2>
          <h2 className="gr-akk">
            <CaseTag c="akk" lang={lang} /> {tr({ de: 'immer Akkusativ', en: 'always accusative' }, lang)}
          </h2>
          <Preps kind="akk" />
          <Aid lang={lang} tts={tts} title="DOGFUB" chant="durch, ohne, gegen, für, um, bis. Und entlang. Immer Akkusativ.">
            {tr({ de: 'durch – ohne – gegen – für – um – bis (+ entlang, meist nachgestellt: den Fluss entlang).', en: 'durch – ohne – gegen – für – um – bis (+ entlang, usually after the noun: den Fluss entlang).' }, lang)}
          </Aid>
          <h2>
            <CaseTag c="dat" lang={lang} /> {tr({ de: 'immer Dativ', en: 'always dative' }, lang)}
          </h2>
          <Preps kind="dat" />
          <Aid lang={lang} tts={tts} title="aus – bei – mit – nach – seit – von – zu" chant="aus, bei, mit, nach, seit, von, zu. Immer Dativ!">
            {tr({ de: 'Im Rhythmus sprechen, dazu gegenüber, ab und außer. Auch wenn es eine Richtung ist: zu dem Arzt → zum Arzt (Dativ!).', en: 'Say it rhythmically, plus gegenüber, ab and außer. Even with movement: zu dem Arzt → zum Arzt (dative!).' }, lang)}
          </Aid>
          <h2>
            <span className="gr-tag gr-wechsel">Wechsel</span> {tr({ de: 'Wo? oder Wohin?', en: 'Where? or where to?' }, lang)}
          </h2>
          <Preps kind="wechsel" />
          <Aid lang={lang} tts={tts} title={tr({ de: 'Wo? → Dativ · Wohin? → Akkusativ', en: 'Wo? (where) → dative · Wohin? (where to) → accusative' }, lang)} chant="Wo? Dativ. Wohin? Akkusativ. Das Buch liegt auf dem Tisch. Ich lege das Buch auf den Tisch.">
            {tr({ de: 'Ort ohne Ziel → Dativ. Bewegung zu einem Ziel → Akkusativ.', en: 'Position → dative. Movement to a goal → accusative.' }, lang)}
          </Aid>
          <div className="gr-tablewrap">
            <table className="gr-table">
              <thead>
                <tr>
                  <th scope="col">
                    <CaseTag c="akk" lang={lang} /> Wohin?
                  </th>
                  <th scope="col">
                    <CaseTag c="dat" lang={lang} /> Wo?
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['stellen: Ich stelle die Vase auf den Tisch.', 'stehen: Die Vase steht auf dem Tisch.'],
                  ['legen: Ich lege das Buch auf das Bett.', 'liegen: Das Buch liegt auf dem Bett.'],
                  ['setzen: Ich setze mich auf den Stuhl.', 'sitzen: Ich sitze auf dem Stuhl.'],
                  ['hängen: Ich hänge das Bild an die Wand.', 'hängen: Das Bild hängt an der Wand.'],
                  ['gehen: Ich gehe in die Küche.', 'sein: Ich bin in der Küche.'],
                ].map(([a, d]) => (
                  <tr key={a}>
                    <td style={{ whiteSpace: 'normal' }} className="small">
                      {a}
                    </td>
                    <td style={{ whiteSpace: 'normal' }} className="small">
                      {d}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h2>
            <CaseTag c="gen" lang={lang} /> Genitiv
          </h2>
          <Preps kind="gen" />
          <p className="small muted">
            {tr({ de: 'Gesprochen hört man oft wegen + Dativ („wegen dem Wetter“). In der Prüfung schreiben Sie Genitiv: wegen des Wetters.', en: 'In speech you often hear wegen + dative („wegen dem Wetter“). In the exam write the genitive: wegen des Wetters.' }, lang)}
          </p>
          <h2>{tr({ de: 'Kurzformen', en: 'Contractions' }, lang)}</h2>
          <div className="gr-preps">
            {CONTRACTIONS.map(([long, short]) => (
              <span key={short} className="gr-prep" style={{ ['--c' as string]: 'var(--muted)' }}>
                {long} → <b>{short}</b>
              </span>
            ))}
          </div>
          <p className="small muted">
            {tr({ de: 'im, am, beim, vom, zum = Dativ · ins, ans = Akkusativ · zur = Dativ feminin.', en: 'im, am, beim, vom, zum = dative · ins, ans = accusative · zur = dative feminine.' }, lang)}
          </p>
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0 }}>3 · {tr({ de: 'Die Rolle im Satz', en: 'The role in the sentence' }, lang)}</h2>
          <ul className="gr-list">
            <li>
              <CaseTag c="nom" lang={lang} /> {tr({ de: 'Wer handelt? Das Subjekt:', en: 'Who acts? The subject:' }, lang)} <i>Der Zug kommt.</i>
            </li>
            <li>
              <CaseTag c="akk" lang={lang} /> {tr({ de: 'Zeitangaben ohne Präposition:', en: 'Time phrases without a preposition:' }, lang)} <i>jeden Tag, nächsten Montag, den ganzen Abend</i>
            </li>
            <li>
              <CaseTag c="akk" lang={lang} /> <i>es gibt</i> + Akkusativ: <i>Es gibt keinen Parkplatz.</i>
            </li>
            <li>
              <CaseTag c="gen" lang={lang} /> {tr({ de: 'Besitz:', en: 'Possession:' }, lang)} <i>das Auto meines Vaters</i>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}

interface AidEntry {
  title: Text2;
  text: Text2;
  chant?: string;
}

const AIDS: AidEntry[] = [
  {
    title: { de: 'Die vier Fragen', en: 'The four questions' },
    text: { de: 'Wer/Was? Nominativ · Wen/Was? Akkusativ · Wem? Dativ · Wessen? Genitiv.', en: 'Wer/Was? nominative · Wen/Was? accusative · Wem? dative · Wessen? genitive.' },
    chant: 'Wer oder was? Nominativ. Wen oder was? Akkusativ. Wem? Dativ. Wessen? Genitiv.',
  },
  {
    title: { de: 'r-e-s-e · n-e-s-e · m-r-m-n · s-r-s-r', en: 'r-e-s-e · n-e-s-e · m-r-m-n · s-r-s-r' },
    text: { de: 'Die letzten Buchstaben von der/die/das/die in Nominativ, Akkusativ, Dativ, Genitiv.', en: 'The last letters of der/die/das/die in nominative, accusative, dative, genitive.' },
    chant: 'der, die, das, die. den, die, das, die. dem, der, dem, den. des, der, des, der.',
  },
  {
    title: { de: 'Nur maskulin ändert sich im Akkusativ', en: 'Only the masculine changes in the accusative' },
    text: { de: 'der → den, ein → einen, kein → keinen, mein → meinen. Alles andere bleibt wie im Nominativ.', en: 'der → den, ein → einen, kein → keinen, mein → meinen. Everything else stays as in the nominative.' },
    chant: 'der wird den. ein wird einen. mein wird meinen.',
  },
  {
    title: { de: 'Dativ: dem – der – dem – den + n', en: 'Dative: dem – der – dem – den + n' },
    text: { de: 'Im Dativ Plural bekommt auch das Nomen ein -n: den Kindern, mit meinen Freunden (nicht bei -n/-s: den Autos).', en: 'In the dative plural the noun takes -n too: den Kindern, mit meinen Freunden (not after -n/-s: den Autos).' },
    chant: 'dem, der, dem, den. Mit den Kindern.',
  },
  {
    title: { de: 'ein-Wörter: Endung vom Artikel', en: 'ein-words: the article’s ending' },
    text: {
      de: 'ein, kein, mein, dein, sein, ihr, unser, euer, Ihr nehmen die Endung von der/die/das: dem → einem, der → meiner. Ausnahme ohne Endung: Nom. m, Nom./Akk. n.',
      en: 'ein, kein, mein, dein, sein, ihr, unser, euer, Ihr take the ending of der/die/das: dem → einem, der → meiner. No ending in nom. m and nom./acc. n.',
    },
    chant: 'dem, einem, meinem. der, einer, meiner. den, einen, meinen.',
  },
  {
    title: { de: 'ihN wie deN, ihM wie deM', en: 'ihN like deN, ihM like deM' },
    text: { de: 'Ich sehe ihn (den Mann). Ich helfe ihm (dem Mann). Ebenso: mich/dich = Akkusativ, mir/dir = Dativ.', en: 'Ich sehe ihn (den Mann). Ich helfe ihm (dem Mann). Likewise: mich/dich = accusative, mir/dir = dative.' },
    chant: 'den Mann, ihn. dem Mann, ihm. mich, dich: Akkusativ. mir, dir: Dativ.',
  },
  {
    title: { de: 'DOGFUB → Akkusativ', en: 'DOGFUB → accusative' },
    text: { de: 'durch, ohne, gegen, für, um, bis (+ entlang).', en: 'durch, ohne, gegen, für, um, bis (+ entlang).' },
    chant: 'durch, ohne, gegen, für, um, bis. Immer Akkusativ.',
  },
  {
    title: { de: 'aus – bei – mit – nach – seit – von – zu → Dativ', en: 'aus – bei – mit – nach – seit – von – zu → dative' },
    text: { de: 'Dazu: gegenüber, ab, außer.', en: 'Plus: gegenüber, ab, außer.' },
    chant: 'aus, bei, mit, nach, seit, von, zu. Immer Dativ!',
  },
  {
    title: { de: 'Wo? → Dativ · Wohin? → Akkusativ', en: 'Wo? → dative · Wohin? → accusative' },
    text: { de: 'an, auf, hinter, in, neben, über, unter, vor, zwischen. stehen/liegen/sitzen/hängen (Wo?) – stellen/legen/setzen/hängen (Wohin?).', en: 'an, auf, hinter, in, neben, über, unter, vor, zwischen. stehen/liegen/sitzen/hängen (where?) – stellen/legen/setzen/hängen (where to?).' },
    chant: 'an, auf, hinter, in, neben, über, unter, vor, zwischen. Wo? Dativ. Wohin? Akkusativ.',
  },
  {
    title: { de: 'wegen, trotz, während, statt → Genitiv', en: 'wegen, trotz, während, statt → genitive' },
    text: { de: 'Auch innerhalb und außerhalb. Wegen des Wetters, trotz des Regens.', en: 'Also innerhalb and außerhalb. Wegen des Wetters, trotz des Regens.' },
    chant: 'wegen, trotz, während, statt. Genitiv. Wegen des Wetters.',
  },
  {
    title: { de: 'Wortstellung: Nomen D-A, Pronomen A-D', en: 'Word order: nouns D-A, pronouns A-D' },
    text: { de: 'Ich gebe dem Kind den Ball. → Ich gebe ihn ihm. Pronomen stehen vor Nomen.', en: 'Ich gebe dem Kind den Ball. → Ich gebe ihn ihm. Pronouns come before nouns.' },
    chant: 'Ich gebe dem Kind den Ball. Ich gebe ihn ihm.',
  },
  {
    title: { de: 'sein + Nominativ', en: 'sein + nominative' },
    text: { de: 'Nach sein, werden, bleiben, heißen kein Akkusativ: Das ist ein guter Freund.', en: 'No accusative after sein, werden, bleiben, heißen: Das ist ein guter Freund.' },
    chant: 'Das ist ein guter Freund. Er wird ein guter Arzt.',
  },
  {
    title: { de: 'Relativpronomen = Artikel, außer denen, dessen, deren', en: 'Relative pronoun = article, except denen, dessen, deren' },
    text: { de: 'Die Leute, denen ich helfe. Der Mann, dessen Auto hier steht. Die Frau, deren Sohn …', en: 'Die Leute, denen ich helfe. Der Mann, dessen Auto hier steht. Die Frau, deren Sohn …' },
    chant: 'denen, dessen, deren.',
  },
  {
    title: { de: 'Adjektiv: Einer muss das Signal zeigen', en: 'Adjectives: someone has to show the signal' },
    text: { de: 'der gute Wein · ein guter Wein · guter Wein. Zeigt der Artikel das Signal, reicht -e/-en.', en: 'der gute Wein · ein guter Wein · guter Wein. If the article shows the signal, -e/-en is enough.' },
    chant: 'der gute Wein. ein guter Wein. guter Wein.',
  },
  {
    title: { de: 'Ohne Nomen: meiner, eins, keiner', en: 'Without a noun: meiner, eins, keiner' },
    text: { de: 'Das ist meiner (der Schlüssel). Ich habe keins (das Auto). Hast du einen (den Stift)?', en: 'Das ist meiner (der Schlüssel). Ich habe keins (das Auto). Hast du einen (den Stift)?' },
    chant: 'Das ist meiner. Ich habe keins. Hast du einen?',
  },
];

export function Aids({ lang }: { lang: Lang }) {
  const tts = useTts();
  return (
    <>
      <h1>{tr({ de: 'Eselsbrücken', en: 'Memory aids' }, lang)}</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        {tr({ de: 'Laut mitsprechen hilft: Tippen Sie auf 🔊 und sprechen Sie nach.', en: 'Saying them out loud helps: tap 🔊 and repeat.' }, lang)}
      </p>
      <div className="stack">
        {AIDS.map((a) => (
          <Aid key={a.title.de} lang={lang} tts={tts} title={tr(a.title, lang)} chant={a.chant}>
            {tr(a.text, lang)}
          </Aid>
        ))}
      </div>
      {tts && (
        <p className="small muted center" style={{ marginTop: 16 }}>
          <SpeakButton text={AIDS.map((a) => a.chant).filter(Boolean).join(' ')} lang={lang} />{' '}
          {tr({ de: 'Alle hintereinander anhören', en: 'Listen to all of them' }, lang)}
        </p>
      )}
    </>
  );
}

export const AID_COUNT = AIDS.length;
