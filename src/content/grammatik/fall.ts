/**
 * Fall erkennen (case detective): one phrase in [brackets] – which case is it?
 */
import type { Text2 } from '../../types.ts';
import type { Case } from './forms.ts';

export interface FallItem {
  id: string;
  /** The sentence; the phrase to analyse is in [brackets]. */
  s: string;
  c: Case;
  why: Text2;
}

const f = (n: number, s: string, c: Case, de: string, en: string): FallItem => ({
  id: `f${String(n).padStart(2, '0')}`,
  s,
  c,
  why: { de, en },
});

export const FALL: FallItem[] = [
  f(1, '[Der Vater] gibt dem Kind den Ball des Nachbarn.', 'nom', 'Wer gibt? Der Vater – das Subjekt.', 'Who gives? The father – the subject.'),
  f(2, 'Der Vater gibt [dem Kind] den Ball des Nachbarn.', 'dat', 'Wem gibt er den Ball? Dem Kind – die Person, die etwas bekommt (geben + Dativ).', 'To whom? The child – the receiver (geben + dative).'),
  f(3, 'Der Vater gibt dem Kind [den Ball] des Nachbarn.', 'akk', 'Was gibt er? Den Ball – das direkte Objekt.', 'What does he give? The ball – the direct object.'),
  f(4, 'Der Vater gibt dem Kind den Ball [des Nachbarn].', 'gen', 'Wessen Ball? Der Ball des Nachbarn – Besitz.', 'Whose ball? The neighbour’s – possession.'),
  f(5, 'Ich helfe [meiner Mutter].', 'dat', 'helfen + Dativ: Wem helfe ich?', 'helfen takes the dative: to whom?'),
  f(6, '[Meine Mutter] hilft mir oft.', 'nom', 'Wer hilft? Meine Mutter – das Subjekt.', 'Who helps? My mother – the subject.'),
  f(7, 'Ich besuche [meine Mutter].', 'akk', 'Wen besuche ich? besuchen + Akkusativ. „meine“ sieht aus wie Nominativ – die Funktion entscheidet.', 'Whom do I visit? besuchen + accusative. „meine“ looks like the nominative – the function decides.'),
  f(8, 'Wir fahren mit [dem Bus].', 'dat', 'mit + Dativ.', 'mit always takes the dative.'),
  f(9, 'Das Geschenk ist für [meinen Bruder].', 'akk', 'für + Akkusativ.', 'für always takes the accusative.'),
  f(10, 'Mein Bruder ist [ein guter Koch].', 'nom', 'sein + Nominativ: Beide Teile stehen im Nominativ.', 'sein links two nominatives.'),
  f(11, 'Ich lege das Handy auf [den Tisch].', 'akk', 'Wohin lege ich es? Richtung → auf + Akkusativ.', 'Where to? Direction → auf + accusative.'),
  f(12, 'Das Handy liegt auf [dem Tisch].', 'dat', 'Wo liegt es? Ort → auf + Dativ.', 'Where is it? Position → auf + dative.'),
  f(13, 'Wegen [des Streiks] fällt der Zug aus.', 'gen', 'wegen + Genitiv.', 'wegen takes the genitive.'),
  f(14, '[Den Film] habe ich schon gesehen.', 'akk', 'Das Objekt steht vorne, ist aber trotzdem Akkusativ: Ich habe den Film gesehen.', 'The object comes first but is still accusative: Ich habe den Film gesehen.'),
  f(15, '[Dem Mann] gehört das Auto.', 'dat', 'gehören + Dativ: Wem gehört das Auto?', 'gehören takes the dative: to whom does it belong?'),
  f(16, 'Dem Mann gehört [das Auto].', 'nom', 'Was gehört dem Mann? Das Auto ist das Subjekt (es gehört).', 'What belongs to the man? The car is the subject.'),
  f(17, 'Es gibt hier [keinen Parkplatz].', 'akk', 'es gibt + Akkusativ: keinen (maskulin).', 'es gibt takes the accusative: keinen (masculine).'),
  f(18, 'Ich warte schon seit [einer Stunde].', 'dat', 'seit + Dativ.', 'seit takes the dative.'),
  f(19, 'Gestern habe ich [einen alten Freund] getroffen.', 'akk', 'Wen habe ich getroffen? treffen + Akkusativ.', 'Whom did I meet? treffen + accusative.'),
  f(20, '[Meinem Sohn] gefällt die Schule.', 'dat', 'gefallen + Dativ: Wem gefällt die Schule?', 'gefallen takes the dative: who likes it?'),
  f(21, 'Meinem Sohn gefällt [die Schule].', 'nom', 'Was gefällt? Die Schule ist das Subjekt von „gefallen“.', 'What is pleasing? The school is the subject of „gefallen“.'),
  f(22, 'Er wird [ein bekannter Musiker].', 'nom', 'werden + Nominativ.', 'werden links two nominatives.'),
  f(23, 'Wir gehen durch [den Park].', 'akk', 'durch + Akkusativ.', 'durch takes the accusative.'),
  f(24, 'Die Kinder spielen in [unserem Garten].', 'dat', 'Wo spielen sie? Ort → in + Dativ.', 'Where? Position → in + dative.'),
  f(25, 'Die Kinder laufen in [unseren Garten].', 'akk', 'Wohin laufen sie? Richtung → in + Akkusativ.', 'Where to? Direction → in + accusative.'),
  f(26, 'Das Fahrrad [meiner Schwester] ist kaputt.', 'gen', 'Wessen Fahrrad? Das meiner Schwester – Genitiv feminin: meiner.', 'Whose bike? My sister’s – feminine genitive: meiner.'),
  f(27, 'Ich gratuliere [dir] zum Geburtstag.', 'dat', 'gratulieren + Dativ: dir.', 'gratulieren takes the dative: dir.'),
  f(28, 'Ich rufe [dich] morgen an.', 'akk', 'anrufen + Akkusativ: dich.', 'anrufen takes the accusative: dich.'),
  f(29, 'Kannst du [mir] helfen?', 'dat', 'helfen + Dativ: mir.', 'helfen takes the dative: mir.'),
  f(30, '[Wir] treffen uns um acht.', 'nom', 'Wer trifft sich? Wir – das Subjekt.', 'Who meets? We – the subject.'),
  f(31, 'Ich danke [Ihnen] für Ihre Hilfe.', 'dat', 'danken + Dativ: Ihnen.', 'danken takes the dative: Ihnen.'),
  f(32, 'Ich interessiere mich für [die Ausstellung].', 'akk', 'sich interessieren für + Akkusativ.', 'sich interessieren für + accusative.'),
  f(33, 'Nach [dem Essen] trinken wir Kaffee.', 'dat', 'nach + Dativ.', 'nach takes the dative.'),
  f(34, 'Trotz [des schlechten Wetters] fahren wir ans Meer.', 'gen', 'trotz + Genitiv.', 'trotz takes the genitive.'),
  f(35, 'Er wohnt noch bei [seinen Eltern].', 'dat', 'bei + Dativ (Plural: seinen).', 'bei takes the dative (plural: seinen).'),
  f(36, 'Ohne [meine Brille] sehe ich nichts.', 'akk', 'ohne + Akkusativ.', 'ohne takes the accusative.'),
  f(37, 'Die Wohnung, [die] ich gemietet habe, ist hell.', 'akk', 'Im Relativsatz ist „die“ das Objekt: Ich habe die Wohnung gemietet.', 'In the relative clause „die“ is the object: I rented the flat.'),
  f(38, 'Der Kollege, [dem] ich geholfen habe, hat sich bedankt.', 'dat', 'Im Relativsatz: Ich habe ihm geholfen – helfen + Dativ.', 'In the relative clause: I helped him – helfen + dative.'),
  f(39, 'Die Frau, [deren] Sohn hier wohnt, ist Ärztin.', 'gen', 'Ihr Sohn → deren Sohn: Genitiv.', 'Her son → deren Sohn: genitive.'),
  f(40, '[Jeden Morgen] trinke ich Kaffee.', 'akk', 'Zeitangabe ohne Präposition → Akkusativ: jeden Morgen.', 'A time phrase without a preposition → accusative: jeden Morgen.'),
  f(41, 'Ich bringe [meinen Kindern] Schokolade mit.', 'dat', 'Wem bringe ich etwas mit? Die Person bei mitbringen steht im Dativ (Plural: meinen Kindern).', 'Who is it for? The person is dative (plural: meinen Kindern).'),
  f(42, 'Ich bringe meinen Kindern [Schokolade] mit.', 'akk', 'Was bringe ich mit? Die Sache ist das Akkusativ-Objekt, hier ohne Artikel.', 'What do I bring? The thing is the accusative object, here without an article.'),
  f(43, 'Die Kinder [meiner Nachbarin] sind sehr nett.', 'gen', 'Wessen Kinder? Die meiner Nachbarin – Genitiv.', 'Whose children? My neighbour’s – genitive.'),
  f(44, '[Mein Nachbar] ist sehr nett.', 'nom', 'Wer ist nett? Mein Nachbar – das Subjekt.', 'Who is nice? My neighbour – the subject.'),
  f(45, 'Ich habe [meinem Nachbarn] die Schlüssel gegeben.', 'dat', 'geben: Die Person (wem?) steht im Dativ.', 'geben: the person (to whom?) is dative.'),
  f(46, 'Zwischen [den Häusern] ist ein Spielplatz.', 'dat', 'Wo? → zwischen + Dativ. Dativ Plural: den Häusern (+n).', 'Where? → zwischen + dative. Dative plural: den Häusern (+n).'),
  f(47, 'Ich habe heute [keine Zeit].', 'akk', 'haben + Akkusativ: keine Zeit.', 'haben takes the accusative: keine Zeit.'),
  f(48, 'Das ist [keine gute Idee].', 'nom', 'sein + Nominativ.', 'sein links two nominatives.'),
  f(49, 'Während [des Urlaubs] lese ich viel.', 'gen', 'während + Genitiv.', 'während takes the genitive.'),
  f(50, 'Das Restaurant ist gegenüber [dem Bahnhof].', 'dat', 'gegenüber + Dativ.', 'gegenüber takes the dative.'),
];
