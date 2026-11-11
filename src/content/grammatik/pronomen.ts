/**
 * Pronomen-Tausch: replace a noun phrase with the right pronoun, then put two
 * objects in the right order.
 */
import type { Text2 } from '../../types.ts';
import type { Case, Person } from './forms.ts';

export interface SwapItem {
  id: string;
  /** The sentence. */
  s: string;
  /** The phrase to replace, exactly as it appears in `s`. */
  np: string;
  /** Which pronoun replaces it (er/sie/es/sie_pl). */
  p: Person;
  c: Exclude<Case, 'gen'>;
  /** The sentence with the pronoun, when the word order changes (an Akkusativ pronoun moves before the Dativ noun). */
  out?: string;
}

const sw = (n: number, s: string, np: string, p: Person, c: Exclude<Case, 'gen'>, out?: string): SwapItem => ({
  id: `s${String(n).padStart(2, '0')}`,
  s,
  np,
  p,
  c,
  ...(out ? { out } : {}),
});

export const SWAPS: SwapItem[] = [
  sw(1, 'Ich gebe dem Kollegen das Buch.', 'dem Kollegen', 'er', 'dat'),
  sw(2, 'Ich gebe dem Kollegen das Buch.', 'das Buch', 'es', 'akk', 'Ich gebe es dem Kollegen.'),
  sw(3, 'Der Kollege liest das Buch.', 'Der Kollege', 'er', 'nom'),
  sw(4, 'Ich sehe die Nachbarin jeden Tag.', 'die Nachbarin', 'sie', 'akk'),
  sw(5, 'Ich helfe der Nachbarin.', 'der Nachbarin', 'sie', 'dat'),
  sw(6, 'Wir besuchen unsere Großeltern.', 'unsere Großeltern', 'sie_pl', 'akk'),
  sw(7, 'Wir schreiben unseren Großeltern eine Karte.', 'unseren Großeltern', 'sie_pl', 'dat'),
  sw(8, 'Ich kaufe den Kuchen beim Bäcker.', 'den Kuchen', 'er', 'akk'),
  sw(9, 'Das Kind spielt im Garten.', 'Das Kind', 'es', 'nom'),
  sw(10, 'Ich gebe dem Kind ein Eis.', 'dem Kind', 'es', 'dat'),
  sw(11, 'Ich rufe meinen Vater an.', 'meinen Vater', 'er', 'akk'),
  sw(12, 'Das Auto gehört meinem Vater.', 'meinem Vater', 'er', 'dat'),
  sw(13, 'Die Wohnung ist sehr hell.', 'Die Wohnung', 'sie', 'nom'),
  sw(14, 'Wir mieten die Wohnung.', 'die Wohnung', 'sie', 'akk'),
  sw(15, 'Ich danke meinen Kollegen.', 'meinen Kollegen', 'sie_pl', 'dat'),
  sw(16, 'Ich habe die Schlüssel vergessen.', 'die Schlüssel', 'sie_pl', 'akk'),
  sw(17, 'Kannst du dem Hausmeister Bescheid sagen?', 'dem Hausmeister', 'er', 'dat'),
  sw(18, 'Ich finde den Film langweilig.', 'den Film', 'er', 'akk'),
  sw(19, 'Der Film beginnt um acht.', 'Der Film', 'er', 'nom'),
  sw(20, 'Wir warten auf unseren Lehrer.', 'unseren Lehrer', 'er', 'akk'),
  sw(21, 'Ich fahre mit meiner Freundin nach Berlin.', 'meiner Freundin', 'sie', 'dat'),
  sw(22, 'Das Geschenk ist für meine Eltern.', 'meine Eltern', 'sie_pl', 'akk'),
  sw(23, 'Sprichst du oft mit deinen Eltern?', 'deinen Eltern', 'sie_pl', 'dat'),
  sw(24, 'Ich esse das Brot.', 'das Brot', 'es', 'akk'),
  sw(25, 'Er zeigt seiner Tochter die Stadt.', 'seiner Tochter', 'sie', 'dat'),
  sw(26, 'Er zeigt seiner Tochter die Stadt.', 'die Stadt', 'sie', 'akk', 'Er zeigt sie seiner Tochter.'),
  sw(27, 'Ich gratuliere meinem Bruder.', 'meinem Bruder', 'er', 'dat'),
  sw(28, 'Die Kinder schlafen schon.', 'Die Kinder', 'sie_pl', 'nom'),
  sw(29, 'Ohne meinen Hund gehe ich nicht spazieren.', 'meinen Hund', 'er', 'akk'),
  sw(30, 'Ich erkläre den Schülern die Aufgabe.', 'den Schülern', 'sie_pl', 'dat'),
  sw(31, 'Das Fahrrad gehört dem Mädchen.', 'dem Mädchen', 'es', 'dat'),
  sw(32, 'Ich besuche das Museum.', 'das Museum', 'es', 'akk'),
];

/** Word order with two objects. */
export interface OrderItem {
  id: string;
  s: string;
  task: Text2;
  /** The correct sentence first; shuffled when shown. */
  options: string[];
  rule: 'both' | 'datpron' | 'akkpron';
}

const o = (n: number, s: string, rule: OrderItem['rule'], ...options: string[]): OrderItem => ({
  id: `o${String(n).padStart(2, '0')}`,
  s,
  rule,
  task:
    rule === 'both'
      ? { de: 'Beide Objekte als Pronomen:', en: 'Both objects as pronouns:' }
      : rule === 'datpron'
        ? { de: 'Nur die Person (Dativ) als Pronomen:', en: 'Only the person (dative) as a pronoun:' }
        : { de: 'Nur die Sache (Akkusativ) als Pronomen:', en: 'Only the thing (accusative) as a pronoun:' },
  options,
});

export const ORDER_RULE: Record<OrderItem['rule'], Text2> = {
  both: {
    de: 'Zwei Pronomen: Akkusativ vor Dativ – „es ihm“, „sie ihr“, „ihn mir“.',
    en: 'Two pronouns: accusative before dative – „es ihm“, „sie ihr“, „ihn mir“.',
  },
  datpron: {
    de: 'Pronomen vor Nomen: Das Dativ-Pronomen steht vor dem Akkusativ-Nomen.',
    en: 'Pronoun before noun: the dative pronoun comes before the accusative noun.',
  },
  akkpron: {
    de: 'Pronomen vor Nomen: Das Akkusativ-Pronomen steht vor dem Dativ-Nomen.',
    en: 'Pronoun before noun: the accusative pronoun comes before the dative noun.',
  },
};

export const ORDERS: OrderItem[] = [
  o(1, 'Ich gebe dem Kollegen das Buch.', 'both', 'Ich gebe es ihm.', 'Ich gebe ihm es.'),
  o(2, 'Ich gebe dem Kollegen das Buch.', 'datpron', 'Ich gebe ihm das Buch.', 'Ich gebe das Buch ihm.'),
  o(3, 'Ich gebe dem Kollegen das Buch.', 'akkpron', 'Ich gebe es dem Kollegen.', 'Ich gebe dem Kollegen es.'),
  o(4, 'Er schenkt seiner Frau die Blumen.', 'both', 'Er schenkt sie ihr.', 'Er schenkt ihr sie.'),
  o(5, 'Wir zeigen den Gästen die Wohnung.', 'both', 'Wir zeigen sie ihnen.', 'Wir zeigen ihnen sie.'),
  o(6, 'Ich schicke meiner Mutter das Paket.', 'datpron', 'Ich schicke ihr das Paket.', 'Ich schicke das Paket ihr.'),
  o(7, 'Kannst du mir den Weg erklären?', 'akkpron', 'Kannst du ihn mir erklären?', 'Kannst du mir ihn erklären?'),
  o(8, 'Sie leiht ihrem Bruder das Auto.', 'both', 'Sie leiht es ihm.', 'Sie leiht ihm es.'),
  o(9, 'Ich bringe dir den Kaffee.', 'akkpron', 'Ich bringe ihn dir.', 'Ich bringe dir ihn.'),
  o(10, 'Der Lehrer erklärt den Schülern die Regel.', 'datpron', 'Der Lehrer erklärt ihnen die Regel.', 'Der Lehrer erklärt die Regel ihnen.'),
  o(11, 'Wir empfehlen unseren Freunden das Restaurant.', 'akkpron', 'Wir empfehlen es unseren Freunden.', 'Wir empfehlen unseren Freunden es.'),
  o(12, 'Ich zeige dem Arzt die Versichertenkarte.', 'both', 'Ich zeige sie ihm.', 'Ich zeige ihm sie.'),
];
