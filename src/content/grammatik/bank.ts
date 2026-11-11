/**
 * Lückensätze: hand-written B1 sentences with one gap. Each sentence names
 * what goes into the gap (the word family, gender and case) and why; the
 * correct form and the options are computed from the tested tables in
 * ./forms.ts, so a sentence can only be wrong in what it states here.
 *
 * Gap kinds:
 *   der, ein, kein, mein … Ihr   determiner before a noun
 *   pp:<person>                  personal pronoun (pp:er → er/ihn/ihm)
 *   refl:<person>                reflexive pronoun (refl:ich → mich/mir)
 *   rel                          relative pronoun (der/die/das/dessen/deren/denen)
 *   wer                          wer/wen/wem/wessen
 *   alone:<stem>                 ein-word without a noun (einer, keins, meiner)
 *
 * Nouns of the n-Deklination (Kollege, Nachbar, Student) only appear with
 * "ein", whose missing plural keeps the gap unambiguous.
 */
import type { Text2 } from '../../types.ts';
import type { Case, Gender } from './forms.ts';
import type { Trigger } from './rules.ts';

export interface BankItem {
  id: string;
  /** The sentence, with "___" for the gap. */
  s: string;
  /** What goes into the gap, see above. */
  k: string;
  /** Gender/number of the noun (determiners, rel, alone). */
  g?: Gender;
  c: Case;
  /** Why this case. */
  t: Trigger;
  /** Extra explanation, shown after the rule. */
  why?: Text2;
}

const b = (n: number, s: string, k: string, g: Gender | undefined, c: Case, t: Trigger, why?: Text2): BankItem => ({
  id: `b${String(n).padStart(3, '0')}`,
  s,
  k,
  ...(g ? { g } : {}),
  c,
  t,
  ...(why ? { why } : {}),
});

const REL = (de: string, en: string): Text2 => ({ de, en });

export const BANK: BankItem[] = [
  // ------------------------------------------------------- Dativ-Verben
  b(1, 'Ich helfe ___ Mutter.', 'mein', 'f', 'dat', 'v:helfen'),
  b(2, 'Wir danken ___ Nachbarin für das Paket.', 'der', 'f', 'dat', 'v:danken'),
  b(3, 'Die Wohnung gefällt ___ Frau sehr gut.', 'mein', 'f', 'dat', 'v:gefallen'),
  b(4, 'Das Fahrrad gehört ___ Bruder.', 'mein', 'm', 'dat', 'v:gehören'),
  b(5, 'Wir gratulieren ___ Kollegin zum Geburtstag.', 'unser', 'f', 'dat', 'v:gratulieren'),
  b(6, 'Bitte antworten Sie ___ Kundin bis Freitag.', 'der', 'f', 'dat', 'v:antworten'),
  b(7, 'Die Jacke passt ___ Sohn nicht mehr.', 'mein', 'm', 'dat', 'v:passen'),
  b(8, 'Schmeckt ___ Kindern die Suppe?', 'dein', 'pl', 'dat', 'v:schmecken'),
  b(9, 'Du fehlst ___ Eltern sehr.', 'dein', 'pl', 'dat', 'v:fehlen'),
  b(10, 'Folgen Sie bitte ___ Schildern.', 'der', 'pl', 'dat', 'v:folgen'),
  b(11, 'Ich glaube ___ Chef kein Wort.', 'mein', 'm', 'dat', 'v:glauben'),
  b(12, 'Sie vertraut ___ Freundin.', 'ihr', 'f', 'dat', 'v:vertrauen'),
  b(13, 'Hör ___ Lehrerin bitte zu!', 'dein', 'f', 'dat', 'v:zuhören'),
  b(14, 'Es tut ___ Schwester sehr leid.', 'mein', 'f', 'dat', 'v:leidtun'),
  b(15, 'Der Arzt rät ___ Patientin, mehr zu schlafen.', 'der', 'f', 'dat', 'v:raten'),
  b(16, 'Rauchen schadet ___ Gesundheit.', 'dein', 'f', 'dat', 'v:schaden'),
  b(17, 'Ich stimme ___ Vorschlag zu.', 'dein', 'm', 'dat', 'v:zustimmen'),
  b(18, 'Der Film hat ___ Kindern gut gefallen.', 'der', 'pl', 'dat', 'v:gefallen'),
  b(19, 'Der Schlüssel gehört ___ Hausmeister.', 'der', 'm', 'dat', 'v:gehören'),
  b(20, 'Kannst du ___ Großvater helfen?', 'dein', 'm', 'dat', 'v:helfen'),
  b(21, 'Ich danke ___ für die Einladung.', 'pp:Sie', undefined, 'dat', 'v:danken'),
  b(22, 'Kannst du ___ bitte helfen?', 'pp:ich', undefined, 'dat', 'v:helfen'),
  b(23, 'Wie geht es ___?', 'pp:du', undefined, 'dat', 'v:es geht'),
  b(24, 'Das Essen schmeckt ___ leider nicht.', 'pp:wir', undefined, 'dat', 'v:schmecken'),
  b(25, 'Gefällt ___ die neue Wohnung?', 'pp:ihr', undefined, 'dat', 'v:gefallen'),
  b(26, 'Ich gratuliere ___ zum Geburtstag!', 'pp:du', undefined, 'dat', 'v:gratulieren'),
  b(27, 'Wir haben ___ gestern geantwortet.', 'pp:sie_pl', undefined, 'dat', 'v:antworten'),
  b(28, 'Die Schuhe passen ___ nicht.', 'pp:er', undefined, 'dat', 'v:passen'),
  b(29, 'Hilfst du ___ beim Umzug?', 'pp:sie', undefined, 'dat', 'v:helfen'),
  b(30, 'Gestern bin ich ___ Lehrerin im Supermarkt begegnet.', 'mein', 'f', 'dat', 'v:begegnen'),

  // --------------------------------------------------- Akkusativ-Verben
  b(31, 'Ich besuche morgen ___ Oma.', 'mein', 'f', 'akk', 'va:besuchen'),
  b(32, 'Hast du ___ Schlüssel gesehen?', 'mein', 'm', 'akk', 'va:sehen'),
  b(33, 'Wir brauchen ___ neuen Kühlschrank.', 'ein', 'm', 'akk', 'va:brauchen'),
  b(34, 'Heute habe ich leider ___ Zeit.', 'kein', 'f', 'akk', 'va:haben'),
  b(35, 'Er hat ___ Bruder und zwei Schwestern.', 'ein', 'm', 'akk', 'va:haben'),
  b(36, 'Kennst du ___ Mann dort drüben?', 'der', 'm', 'akk', 'va:kennen'),
  b(37, 'Ich rufe morgen ___ Vermieter an.', 'der', 'm', 'akk', 'va:anrufen'),
  b(38, 'Sie sucht ___ Wohnung in der Nähe.', 'ein', 'f', 'akk', 'va:suchen'),
  b(39, 'Wir bezahlen ___ Rechnung online.', 'der', 'f', 'akk', 'va:bezahlen'),
  b(40, 'Ich habe ___ Regenschirm im Bus vergessen.', 'mein', 'm', 'akk', 'va:vergessen'),
  b(41, 'Kaufst du bitte ___ Brot?', 'ein', 'n', 'akk', 'va:kaufen'),
  b(42, 'Wir haben ___ Auto.', 'kein', 'n', 'akk', 'va:haben'),
  b(43, 'Danke, ich habe ___ Hunger.', 'kein', 'm', 'akk', 'va:haben'),
  b(44, 'Hier gibt es ___ Supermarkt.', 'kein', 'm', 'akk', 'esgibt'),
  b(45, 'Gibt es hier in der Nähe ___ Apotheke?', 'ein', 'f', 'akk', 'esgibt'),
  b(46, 'Ich lese gerade ___ Buch über Berlin.', 'ein', 'n', 'akk', 'va:lesen'),
  b(47, 'Habt ihr ___ Hausaufgaben schon gemacht?', 'euer', 'pl', 'akk', 'va:machen'),
  b(48, 'Am Wochenende treffe ich ___ Freunde.', 'mein', 'pl', 'akk', 'va:treffen'),
  b(49, 'Sie liebt ___ Mann sehr.', 'ihr', 'm', 'akk', 'va:lieben'),
  b(50, 'Wir laden ___ Nachbarin zur Party ein.', 'unser', 'f', 'akk', 'va:einladen'),
  b(51, 'Ich frage ___ Lehrer nach der Hausaufgabe.', 'der', 'm', 'akk', 'va:fragen'),
  b(52, 'Er kennt ___ noch nicht.', 'pp:ich', undefined, 'akk', 'va:kennen'),
  b(53, 'Ich sehe ___ morgen im Kurs.', 'pp:du', undefined, 'akk', 'va:sehen'),
  b(54, 'Hast du ___ schon angerufen?', 'pp:er', undefined, 'akk', 'va:anrufen'),
  b(55, 'Wir besuchen ___ am Sonntag.', 'pp:ihr', undefined, 'akk', 'va:besuchen'),
  b(56, 'Ich vermisse ___ sehr.', 'pp:sie_pl', undefined, 'akk', 'va:vermissen'),
  b(57, 'Darf ich ___ etwas fragen?', 'pp:Sie', undefined, 'akk', 'va:fragen'),
  b(58, 'Kennen Sie schon ___ Sohn?', 'unser', 'm', 'akk', 'va:kennen'),
  b(59, 'Sie nimmt jeden Morgen ___ Bus um acht.', 'der', 'm', 'akk', 'va:nehmen'),
  b(60, 'Ich finde ___ Idee super.', 'dein', 'f', 'akk', 'va:finden'),

  // ------------------------------------------------ Dativ + Akkusativ
  b(61, 'Ich gebe ___ Kind einen Apfel.', 'der', 'n', 'dat', 'vp:geben'),
  b(62, 'Ich schenke ___ Freundin einen Schal.', 'mein', 'f', 'dat', 'vp:schenken'),
  b(63, 'Er zeigt ___ Gästen die Stadt.', 'sein', 'pl', 'dat', 'vp:zeigen'),
  b(64, 'Die Lehrerin erklärt ___ Schülern die Regel.', 'der', 'pl', 'dat', 'vp:erklären'),
  b(65, 'Wir schicken ___ Oma eine Karte.', 'unser', 'f', 'dat', 'vp:schicken'),
  b(66, 'Bringst du ___ Vater die Zeitung?', 'dein', 'm', 'dat', 'vp:bringen'),
  b(67, 'Kannst du mir ___ Fahrrad leihen?', 'dein', 'n', 'akk', 'vt:leihen'),
  b(68, 'Ich empfehle ___ Kundin dieses Modell.', 'der', 'f', 'dat', 'vp:empfehlen'),
  b(69, 'Er erzählt ___ Kindern eine Geschichte.', 'sein', 'pl', 'dat', 'vp:erzählen'),
  b(70, 'Ich schreibe ___ Tante einen Brief.', 'mein', 'f', 'dat', 'vp:schreiben'),
  b(71, 'Sie kauft ___ Sohn ein Fahrrad.', 'ihr', 'm', 'dat', 'vp:kaufen'),
  b(72, 'Gib mir bitte ___ Schlüssel!', 'der', 'm', 'akk', 'vt:geben'),
  b(73, 'Ich zeige ___ die Fotos vom Urlaub.', 'pp:du', undefined, 'dat', 'vp:zeigen'),
  b(74, 'Kannst du ___ den Weg erklären?', 'pp:wir', undefined, 'dat', 'vp:erklären'),
  b(75, 'Ich schicke ___ die Unterlagen per E-Mail.', 'pp:Sie', undefined, 'dat', 'vp:schicken'),
  b(76, 'Wir wünschen ___ Gästen einen schönen Abend.', 'unser', 'pl', 'dat', 'vp:wünschen'),
  b(77, 'Der Kellner bringt ___ Gast die Rechnung.', 'der', 'm', 'dat', 'vp:bringen'),
  b(78, 'Ich habe ___ Mann ein Buch geschenkt.', 'mein', 'm', 'dat', 'vp:schenken'),
  b(79, 'Sie schenkt ihrem Bruder ___ Uhr.', 'ein', 'f', 'akk', 'vt:schenken'),
  b(80, 'Ich erkläre dir ___ Problem.', 'der', 'n', 'akk', 'vt:erklären'),

  // ---------------------------------------- Präpositionen mit Akkusativ
  b(81, 'Das Geschenk ist für ___ Mutter.', 'mein', 'f', 'akk', 'p:für'),
  b(82, 'Ich gehe jeden Tag durch ___ Park.', 'der', 'm', 'akk', 'p:durch'),
  b(83, 'Ohne ___ Brille kann ich nichts lesen.', 'mein', 'f', 'akk', 'p:ohne'),
  b(84, 'Wir sind gegen ___ Plan.', 'dein', 'm', 'akk', 'p:gegen'),
  b(85, 'Wir sitzen um ___ Tisch herum.', 'der', 'm', 'akk', 'p:um'),
  b(86, 'Sie läuft jeden Morgen ___ Fluss entlang.', 'der', 'm', 'akk', 'p:entlang'),
  b(87, 'Ich habe ein Geschenk für ___.', 'pp:du', undefined, 'akk', 'p:für'),
  b(88, 'Ohne ___ macht die Party keinen Spaß.', 'pp:ihr', undefined, 'akk', 'p:ohne'),
  b(89, 'Er ist mit dem Fahrrad gegen ___ Baum gefahren.', 'ein', 'm', 'akk', 'p:gegen'),
  b(90, 'Für ___ Kinder ist der Eintritt frei.', 'der', 'pl', 'akk', 'p:für'),
  b(91, 'Ich kann nicht ohne ___ Kaffee aufstehen.', 'mein', 'm', 'akk', 'p:ohne'),
  b(92, 'Was hast du gegen ___ Freund?', 'mein', 'm', 'akk', 'p:gegen'),
  b(93, 'Wir bitten um ___ Antwort.', 'Ihr', 'f', 'akk', 'p:um'),
  b(94, 'Ich interessiere mich für ___ Kurs.', 'der', 'm', 'akk', 'p:für'),
  b(95, 'Wir fahren durch ___ Tunnel.', 'ein', 'm', 'akk', 'p:durch'),

  // ------------------------------------------- Präpositionen mit Dativ
  b(96, 'Ich fahre mit ___ Bus zur Arbeit.', 'der', 'm', 'dat', 'p:mit'),
  b(97, 'Sie kommt aus ___ Türkei.', 'der', 'f', 'dat', 'p:aus'),
  b(98, 'Ich wohne noch bei ___ Eltern.', 'mein', 'pl', 'dat', 'p:bei'),
  b(99, 'Nach ___ Unterricht gehen wir essen.', 'der', 'm', 'dat', 'p:nach'),
  b(100, 'Seit ___ Jahr lerne ich Deutsch.', 'ein', 'n', 'dat', 'p:seit'),
  b(101, 'Das Paket ist von ___ Bruder.', 'mein', 'm', 'dat', 'p:von'),
  b(102, 'Ich gehe morgen zu ___ Ärztin.', 'mein', 'f', 'dat', 'p:zu'),
  b(103, 'Die Apotheke ist gegenüber ___ Bahnhof.', 'der', 'm', 'dat', 'p:gegenüber'),
  b(104, 'Ab ___ 1. Mai gilt der neue Fahrplan.', 'der', 'm', 'dat', 'p:ab'),
  b(105, 'Außer ___ Kollegin waren alle da.', 'mein', 'f', 'dat', 'p:außer'),
  b(106, 'Ich telefoniere oft mit ___ Freunden.', 'mein', 'pl', 'dat', 'p:mit'),
  b(107, 'Sie spricht mit ___ Kind.', 'ihr', 'n', 'dat', 'p:mit'),
  b(108, 'Komm doch mit ___ ins Kino!', 'pp:wir', undefined, 'dat', 'p:mit'),
  b(109, 'Ich war gestern Abend bei ___.', 'pp:er', undefined, 'dat', 'p:bei'),
  b(110, 'Das habe ich von ___ gehört.', 'pp:sie_pl', undefined, 'dat', 'p:von'),
  b(111, 'Seit ___ Unfall fährt er nicht mehr Auto.', 'sein', 'm', 'dat', 'p:seit'),
  b(112, 'Nach ___ Arbeit gehe ich einkaufen.', 'der', 'f', 'dat', 'p:nach'),
  b(113, 'Wir fahren mit ___ Auto in den Urlaub.', 'unser', 'n', 'dat', 'p:mit'),
  b(114, 'Er kommt gerade aus ___ Büro.', 'sein', 'n', 'dat', 'p:aus'),
  b(115, 'Was machst du nach ___ Kurs?', 'dein', 'm', 'dat', 'p:nach'),
  b(116, 'Ich habe schon mit ___ Vermieterin gesprochen.', 'der', 'f', 'dat', 'p:mit'),
  b(117, 'Wir treffen uns bei ___ zu Hause.', 'pp:ihr', undefined, 'dat', 'p:bei'),
  b(118, 'Der Brief ist von ___ Krankenkasse.', 'der', 'f', 'dat', 'p:von'),
  b(119, 'Mit ___ Hilfe hat es geklappt.', 'dein', 'f', 'dat', 'p:mit'),
  b(120, 'Seit ___ Ferien habe ich nichts von ihm gehört.', 'der', 'pl', 'dat', 'p:seit'),

  // ------------------------------------------ Wechselpräpositionen
  b(121, 'Das Buch liegt auf ___ Tisch.', 'der', 'm', 'dat', 'wo:auf'),
  b(122, 'Ich lege das Buch auf ___ Tisch.', 'der', 'm', 'akk', 'wohin:auf'),
  b(123, 'Das Bild hängt an ___ Wand.', 'der', 'f', 'dat', 'wo:an'),
  b(124, 'Ich hänge das Bild an ___ Wand.', 'der', 'f', 'akk', 'wohin:an'),
  b(125, 'Die Katze schläft unter ___ Bett.', 'der', 'n', 'dat', 'wo:unter'),
  b(126, 'Ich stelle die Schuhe unter ___ Bett.', 'der', 'n', 'akk', 'wohin:unter'),
  b(127, 'Wir wohnen in ___ Wohnung im dritten Stock.', 'ein', 'f', 'dat', 'wo:in'),
  b(128, 'Wir ziehen bald in ___ größere Wohnung.', 'ein', 'f', 'akk', 'wohin:in'),
  b(129, 'Ich stelle die Milch in ___ Kühlschrank.', 'der', 'm', 'akk', 'wohin:in'),
  b(130, 'Die Milch steht in ___ Kühlschrank.', 'unser', 'm', 'dat', 'wo:in'),
  b(131, 'Das Auto steht vor ___ Haus.', 'der', 'n', 'dat', 'wo:vor'),
  b(132, 'Stell das Fahrrad bitte vor ___ Haus.', 'der', 'n', 'akk', 'wohin:vor'),
  b(133, 'Zwischen ___ Fenstern steht ein Regal.', 'der', 'pl', 'dat', 'wo:zwischen'),
  b(134, 'Ich setze mich neben ___ Freundin.', 'mein', 'f', 'akk', 'wohin:neben'),
  b(135, 'Ich sitze neben ___ Freundin.', 'mein', 'f', 'dat', 'wo:neben'),
  b(136, 'Über ___ Sofa hängt eine Lampe.', 'unser', 'n', 'dat', 'wo:über'),
  b(137, 'Ich hänge die Lampe über ___ Tisch.', 'der', 'm', 'akk', 'wohin:über'),
  b(138, 'Der Schlüssel liegt hinter ___ Tür.', 'der', 'f', 'dat', 'wo:hinter'),
  b(139, 'Leg den Schlüssel hinter ___ Blumentopf.', 'der', 'm', 'akk', 'wohin:hinter'),
  b(140, 'Die Kinder spielen in ___ Garten.', 'unser', 'm', 'dat', 'wo:in'),
  b(141, 'Wir stellen den Grill in ___ Garten.', 'unser', 'm', 'akk', 'wohin:in'),
  b(142, 'Ich warte vor ___ Kino auf dich.', 'der', 'n', 'dat', 'wo:vor'),
  b(143, 'Sie geht in ___ Küche.', 'der', 'f', 'akk', 'wohin:in'),
  b(144, 'Sie ist in ___ Küche.', 'der', 'f', 'dat', 'wo:in'),
  b(145, 'Im Sommer fahren wir an ___ Ostsee.', 'der', 'f', 'akk', 'wohin:an'),
  b(146, 'Wir machen Urlaub an ___ Ostsee.', 'der', 'f', 'dat', 'wo:an'),
  b(147, 'Häng die Jacke bitte in ___ Schrank.', 'der', 'm', 'akk', 'wohin:in'),
  b(148, 'Die Jacke hängt in ___ Schrank.', 'dein', 'm', 'dat', 'wo:in'),
  b(149, 'Er legt das Handy neben ___ Teller.', 'sein', 'm', 'akk', 'wohin:neben'),
  b(150, 'Das Handy liegt neben ___ Teller.', 'sein', 'm', 'dat', 'wo:neben'),
  b(151, 'Stell die Tasche bitte auf ___ Stuhl.', 'der', 'm', 'akk', 'wohin:auf'),
  b(152, 'Die Tasche steht auf ___ Boden.', 'der', 'm', 'dat', 'wo:auf'),
  b(153, 'Er stellt das Fahrrad zwischen ___ Autos.', 'der', 'pl', 'akk', 'wohin:zwischen'),
  b(154, 'Wir sitzen gern in ___ Café am Markt.', 'ein', 'n', 'dat', 'wo:in'),
  b(155, 'Heute gehen wir in ___ Restaurant.', 'ein', 'n', 'akk', 'wohin:in'),

  // ------------------------------------------------------- Genitiv
  b(156, 'Wegen ___ Wetters bleiben wir zu Hause.', 'der', 'n', 'gen', 'p:wegen'),
  b(157, 'Trotz ___ Regens gehen wir spazieren.', 'der', 'm', 'gen', 'p:trotz'),
  b(158, 'Während ___ Prüfung ist das Handy aus.', 'der', 'f', 'gen', 'p:während'),
  b(159, 'Statt ___ Kuchens kaufe ich Obst.', 'ein', 'm', 'gen', 'p:statt'),
  b(160, 'Innerhalb ___ Woche bekommen Sie eine Antwort.', 'ein', 'f', 'gen', 'p:innerhalb'),
  b(161, 'Das ist das Auto ___ Vaters.', 'mein', 'm', 'gen', 'genattr'),
  b(162, 'Das Zimmer ___ Tochter ist sehr hell.', 'unser', 'f', 'gen', 'genattr'),
  b(163, 'Die Farbe ___ Autos gefällt mir.', 'dein', 'n', 'gen', 'genattr'),
  b(164, 'Wegen ___ Erkältung kann ich nicht kommen.', 'mein', 'f', 'gen', 'p:wegen'),
  b(165, 'Außerhalb ___ Öffnungszeiten ist das Büro geschlossen.', 'der', 'pl', 'gen', 'p:außerhalb'),
  b(166, 'Die Wohnung ___ Eltern ist sehr groß.', 'sein', 'pl', 'gen', 'genattr'),
  b(167, 'Während ___ Urlaubs habe ich viel gelesen.', 'mein', 'm', 'gen', 'p:während'),
  b(168, 'Das ist die Meinung ___ Chefin.', 'unser', 'f', 'gen', 'genattr'),

  // ------------------------------------------------------ Nominativ
  b(169, '___ Zug hat zehn Minuten Verspätung.', 'der', 'm', 'nom', 'subj'),
  b(170, 'Das ist ___ Bruder Tom.', 'mein', 'm', 'nom', 'sein'),
  b(171, '___ Kinder spielen im Garten.', 'unser', 'pl', 'nom', 'subj'),
  b(172, 'Er ist ___ guter Arzt.', 'ein', 'm', 'nom', 'sein'),
  b(173, 'Das ist ___ gute Idee.', 'kein', 'f', 'nom', 'sein'),
  b(174, 'Er wird bestimmt ___ guter Vater.', 'ein', 'm', 'nom', 'werden'),
  b(175, '___ Wohnung ist wirklich schön.', 'euer', 'f', 'nom', 'subj'),
  b(176, 'Wo ist ___ Handy?', 'mein', 'n', 'nom', 'subj'),
  b(177, 'Heute ist ___ schöner Tag.', 'ein', 'm', 'nom', 'sein'),
  b(178, '___ Termin ist am Montag um zehn.', 'Ihr', 'm', 'nom', 'subj'),

  // ------------------------------------------------------ Fragewörter
  b(179, '___ hat das gesagt?', 'wer', undefined, 'nom', 'subj'),
  b(180, '___ hast du gestern getroffen?', 'wer', undefined, 'akk', 'va:treffen'),
  b(181, '___ hast du das Buch gegeben?', 'wer', undefined, 'dat', 'vp:geben'),
  b(182, '___ Jacke ist das?', 'wer', undefined, 'gen', 'genattr'),
  b(183, 'Mit ___ fährst du in den Urlaub?', 'wer', undefined, 'dat', 'p:mit'),
  b(184, 'Für ___ ist das Geschenk?', 'wer', undefined, 'akk', 'p:für'),
  b(185, '___ gehört der Schlüssel?', 'wer', undefined, 'dat', 'v:gehören'),

  // -------------------------------------------------- Relativpronomen
  b(186, 'Das ist der Mann, ___ mir geholfen hat.', 'rel', 'm', 'nom', 'subj', REL('Im Relativsatz ist er das Subjekt: Er hat mir geholfen.', 'In the relative clause he is the subject: Er hat mir geholfen.')),
  b(187, 'Das ist der Mann, ___ ich gestern gesehen habe.', 'rel', 'm', 'akk', 'va:sehen', REL('Im Relativsatz: Ich habe ihn gesehen.', 'In the relative clause: Ich habe ihn gesehen.')),
  b(188, 'Das ist der Mann, ___ ich geholfen habe.', 'rel', 'm', 'dat', 'v:helfen', REL('Im Relativsatz: Ich habe ihm geholfen.', 'In the relative clause: Ich habe ihm geholfen.')),
  b(189, 'Das ist der Mann, ___ Auto vor unserem Haus steht.', 'rel', 'm', 'gen', 'genattr', REL('Sein Auto steht vor unserem Haus → dessen Auto.', 'His car stands in front of our house → dessen Auto.')),
  b(190, 'Die Frau, ___ ich das Buch geliehen habe, wohnt nebenan.', 'rel', 'f', 'dat', 'vp:leihen', REL('Im Relativsatz: Ich habe ihr das Buch geliehen.', 'In the relative clause: Ich habe ihr das Buch geliehen.')),
  b(191, 'Die Kollegin, ___ Sohn in meiner Klasse ist, heißt Anna.', 'rel', 'f', 'gen', 'genattr', REL('Ihr Sohn ist in meiner Klasse → deren Sohn.', 'Her son is in my class → deren Sohn.')),
  b(192, 'Die Leute, ___ wir geholfen haben, waren sehr dankbar.', 'rel', 'pl', 'dat', 'v:helfen', REL('Wir haben ihnen geholfen → Dativ Plural: denen.', 'We helped them → dative plural: denen.')),
  b(193, 'Das Buch, ___ ich gerade lese, ist spannend.', 'rel', 'n', 'akk', 'va:lesen', REL('Im Relativsatz: Ich lese es gerade.', 'In the relative clause: Ich lese es gerade.')),
  b(194, 'Die Stadt, in ___ ich wohne, ist klein.', 'rel', 'f', 'dat', 'wo:in', REL('Ich wohne in der Stadt (Wo?) → Dativ.', 'I live in the town (where?) → dative.')),
  b(195, 'Der Kurs, für ___ ich mich angemeldet habe, beginnt im Mai.', 'rel', 'm', 'akk', 'p:für', REL('Ich habe mich für den Kurs angemeldet.', 'I signed up for the course.')),
  b(196, 'Die Kinder, ___ Eltern arbeiten, essen in der Schule.', 'rel', 'pl', 'gen', 'genattr', REL('Ihre Eltern arbeiten → deren Eltern.', 'Their parents work → deren Eltern.')),
  b(197, 'Das Kind, mit ___ ich spiele, heißt Max.', 'rel', 'n', 'dat', 'p:mit', REL('Ich spiele mit dem Kind → Dativ.', 'I play with the child → dative.')),

  // ---------------------------------------------- Reflexivpronomen
  b(198, 'Ich wasche ___ jeden Morgen kalt.', 'refl:ich', undefined, 'akk', 'refl-akk'),
  b(199, 'Ich wasche ___ die Hände.', 'refl:ich', undefined, 'dat', 'refl-dat', REL('„die Hände“ ist das Akkusativ-Objekt.', '„die Hände“ is the accusative object.')),
  b(200, 'Du musst ___ schnell anziehen.', 'refl:du', undefined, 'akk', 'refl-akk'),
  b(201, 'Zieh ___ eine Jacke an!', 'refl:du', undefined, 'dat', 'refl-dat', REL('„eine Jacke“ ist das Akkusativ-Objekt.', '„eine Jacke“ is the accusative object.')),
  b(202, 'Wir freuen ___ auf den Urlaub.', 'refl:wir', undefined, 'akk', 'refl-akk'),
  b(203, 'Habt ihr ___ schon die Zähne geputzt?', 'refl:ihr', undefined, 'dat', 'refl-dat', REL('„die Zähne“ ist das Akkusativ-Objekt.', '„die Zähne“ is the accusative object.')),
  b(204, 'Er rasiert ___ jeden Morgen.', 'refl:er', undefined, 'akk', 'refl-akk'),
  b(205, 'Ich kaufe ___ ein neues Handy.', 'refl:ich', undefined, 'dat', 'refl-dat', REL('„ein neues Handy“ ist das Akkusativ-Objekt.', '„ein neues Handy“ is the accusative object.')),
  b(206, 'Ich interessiere ___ für Politik.', 'refl:ich', undefined, 'akk', 'refl-akk'),
  b(207, 'Kannst du ___ das vorstellen?', 'refl:du', undefined, 'dat', 'refl-dat', REL('„das“ ist das Akkusativ-Objekt: sich etwas vorstellen.', '„das“ is the accusative object: sich etwas vorstellen.')),

  // -------------------------------------- einer / keiner / meiner allein
  b(208, 'Ich brauche einen Stift. Hast du ___?', 'alone:ein', 'm', 'akk', 'va:haben', REL('Ohne Nomen: einer/einen/einem – wie der Artikel, aber maskulin Nominativ „einer“.', 'Without a noun: einer/einen/einem – like the article, but masculine nominative „einer“.')),
  b(209, 'Ist das dein Schlüssel? – Ja, das ist ___.', 'alone:mein', 'm', 'nom', 'sein', REL('Ohne Nomen bekommt mein- die Endung des Artikels: der → meiner.', 'Without a noun, mein- takes the article’s ending: der → meiner.')),
  b(210, 'Ist das dein Handy? – Nein, das ist nicht ___.', 'alone:mein', 'n', 'nom', 'sein', REL('Neutrum ohne Nomen: das → meins (auch: meines).', 'Neuter without a noun: das → meins (also: meines).')),
  b(211, 'Hier ist kein Stuhl frei. – Doch, da hinten ist noch ___.', 'alone:ein', 'm', 'nom', 'subj', REL('Maskulin Nominativ ohne Nomen: einer.', 'Masculine nominative without a noun: einer.')),
  b(212, 'Hast du ein Auto? – Nein, ich habe ___.', 'alone:kein', 'n', 'akk', 'va:haben', REL('Neutrum ohne Nomen: keins (auch: keines).', 'Neuter without a noun: keins (also: keines).')),
  b(213, 'Gibt es hier eine Apotheke? – Ja, am Markt gibt es ___.', 'alone:ein', 'f', 'akk', 'esgibt'),
  b(214, 'Von meinen Kollegen hat mir ___ geholfen.', 'alone:kein', 'm', 'nom', 'subj', REL('„Niemand“: keiner ist das Subjekt.', '„Nobody“: keiner is the subject.')),
  b(215, 'Ich habe kein Ticket. Hast du ___?', 'alone:ein', 'n', 'akk', 'va:haben', REL('Neutrum ohne Nomen: eins.', 'Neuter without a noun: eins.')),
  b(216, 'Mein Laptop ist kaputt. Kann ich mit ___ arbeiten?', 'alone:dein', 'm', 'dat', 'p:mit', REL('mit deinem (Laptop).', 'mit deinem (Laptop).')),

  // ---------------------------------------------- n-Deklination (mit ein)
  b(217, 'Ich habe ___ Kollegen um Hilfe gebeten.', 'ein', 'm', 'akk', 'va:bitten', REL('Kollege gehört zur n-Deklination: einen Kollegen.', 'Kollege is a weak noun: einen Kollegen.')),
  b(218, 'Ich habe mit ___ Studenten aus Spanien gesprochen.', 'ein', 'm', 'dat', 'p:mit', REL('Student gehört zur n-Deklination: einem Studenten.', 'Student is a weak noun: einem Studenten.')),
  b(219, 'Wir suchen ___ Praktikanten für den Sommer.', 'ein', 'm', 'akk', 'va:suchen', REL('Praktikant gehört zur n-Deklination: einen Praktikanten.', 'Praktikant is a weak noun: einen Praktikanten.')),
  b(220, 'Das Paket ist von ___ Nachbarn.', 'ein', 'm', 'dat', 'p:von', REL('Nachbar gehört zur n-Deklination: einem Nachbarn.', 'Nachbar is a weak noun: einem Nachbarn.')),
  b(221, 'Ich habe ___ Herrn nach dem Weg gefragt.', 'ein', 'm', 'akk', 'va:fragen', REL('Herr: einen Herrn (Plural: Herren).', 'Herr: einen Herrn (plural: Herren).')),
  b(222, 'Jeden Montag habe ich ___ Deutschkurs.', 'mein', 'm', 'akk', 'va:haben'),
];
