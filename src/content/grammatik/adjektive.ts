/**
 * Adjektivendungen: one adjective per sentence, written as {adjective}. The
 * ending is computed from ./forms.ts (ADJ_END) from the article type, gender
 * and case given here.
 */
import type { AdjType, Case, Gender } from './forms.ts';

export interface AdjItem {
  id: string;
  /** Sentence with the adjective in braces: "Ich trinke gern {heiß} Kaffee." */
  s: string;
  t: AdjType;
  g: Gender;
  c: Case;
}

const a = (n: number, s: string, t: AdjType, g: Gender, c: Case): AdjItem => ({
  id: `a${String(n).padStart(2, '0')}`,
  s,
  t,
  g,
  c,
});

export const ADJ_ITEMS: AdjItem[] = [
  a(1, 'Ich trinke gern {heiß} Kaffee.', 'none', 'm', 'akk'),
  a(2, 'Das ist ein {gut} Film.', 'ein', 'm', 'nom'),
  a(3, 'Ich habe einen {neu} Job.', 'ein', 'm', 'akk'),
  a(4, 'Der {alt} Mann wohnt allein.', 'def', 'm', 'nom'),
  a(5, 'Ich kenne den {neu} Kollegen noch nicht.', 'def', 'm', 'akk'),
  a(6, 'Wir wohnen in einer {klein} Wohnung.', 'ein', 'f', 'dat'),
  a(7, 'Sie hat ein {schön} Kleid gekauft.', 'ein', 'n', 'akk'),
  a(8, 'Das {rot} Auto gehört mir.', 'def', 'n', 'nom'),
  a(9, 'Mit {frisch} Brot schmeckt alles besser.', 'none', 'n', 'dat'),
  a(10, 'Ich esse gern {italienisch} Pasta.', 'none', 'f', 'akk'),
  a(11, '{Lieb} Grüße aus Berlin!', 'none', 'pl', 'akk'),
  a(12, 'Wir suchen eine {groß} Wohnung.', 'ein', 'f', 'akk'),
  a(13, 'Ich wünsche dir einen {schön} Tag.', 'ein', 'm', 'akk'),
  a(14, 'Er wohnt in einem {alt} Haus.', 'ein', 'n', 'dat'),
  a(15, 'Die {neu} Nachbarin ist sehr nett.', 'def', 'f', 'nom'),
  a(16, 'Kennst du die {neu} Nachbarn?', 'def', 'pl', 'akk'),
  a(17, 'Ich habe keine {sauber} Socken mehr.', 'ein', 'pl', 'akk'),
  a(18, 'Das ist mein {neu} Fahrrad.', 'ein', 'n', 'nom'),
  a(19, 'Wo ist dein {alt} Handy?', 'ein', 'n', 'nom'),
  a(20, 'Ich spreche gleich mit meinem {neu} Chef.', 'ein', 'm', 'dat'),
  a(21, 'Er trinkt nur {kalt} Milch.', 'none', 'f', 'akk'),
  a(22, 'Bei {schlecht} Wetter bleiben wir zu Hause.', 'none', 'n', 'dat'),
  a(23, 'Trotz des {schlecht} Wetters gehen wir spazieren.', 'def', 'n', 'gen'),
  a(24, 'Sie trägt heute {schwarz} Schuhe.', 'none', 'pl', 'akk'),
  a(25, 'Mit {freundlich} Grüßen', 'none', 'pl', 'dat'),
  a(26, 'Das ist eine {gut} Idee.', 'ein', 'f', 'nom'),
  a(27, 'Wir haben einen {teuer} Fernseher gekauft.', 'ein', 'm', 'akk'),
  a(28, 'Das ist ein sehr {hoch} Berg.', 'ein', 'm', 'nom'),
  a(29, 'Ich mag {dunkel} Schokolade.', 'none', 'f', 'akk'),
  a(30, 'Der Junge mit dem {rot} Pullover ist mein Sohn.', 'def', 'm', 'dat'),
  a(31, 'Ich suche ein {günstig} Hotel.', 'ein', 'n', 'akk'),
  a(32, '{Deutsch} Brot ist sehr bekannt.', 'none', 'n', 'nom'),
  a(33, 'Die Kinder spielen mit {neu} Spielsachen.', 'none', 'pl', 'dat'),
  a(34, 'Das Zimmer hat ein {groß} Fenster.', 'ein', 'n', 'akk'),
  a(35, 'Er ist ein {nett} Kollege.', 'ein', 'm', 'nom'),
  a(36, 'Ich habe eine {wichtig} Frage.', 'ein', 'f', 'akk'),
  a(37, 'Das ist der Hund meiner {neu} Nachbarin.', 'ein', 'f', 'gen'),
  a(38, 'Wir helfen den {alt} Leuten.', 'def', 'pl', 'dat'),
  a(39, 'Gibt es hier ein {gut} Restaurant?', 'ein', 'n', 'akk'),
  a(40, 'Ich hätte gern einen {klein} Salat.', 'ein', 'm', 'akk'),
  a(41, 'Sie wohnt in der {schön} Altstadt.', 'def', 'f', 'dat'),
  a(42, 'Das {klein} Kind schläft schon.', 'def', 'n', 'nom'),
  a(43, 'Unsere {neu} Wohnung ist sehr hell.', 'ein', 'f', 'nom'),
  a(44, 'Ich trinke morgens {grün} Tee.', 'none', 'm', 'akk'),
  a(45, 'Ich möchte {kalt} Wasser, bitte.', 'none', 'n', 'akk'),
  a(46, 'Wir haben sehr {nett} Nachbarn.', 'none', 'pl', 'akk'),
  a(47, 'Er hat keinen {gut} Grund.', 'ein', 'm', 'akk'),
  a(48, 'Das ist kein {gut} Plan.', 'ein', 'm', 'nom'),
  a(49, 'Die Wohnung liegt in einer {ruhig} Straße.', 'ein', 'f', 'dat'),
  a(50, 'Ich nehme den {blau} Pullover.', 'def', 'm', 'akk'),
];
