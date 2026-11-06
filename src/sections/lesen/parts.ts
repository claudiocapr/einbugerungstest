/** Instructions, tips and suggested timing per Leseverstehen part (no React, reusable). */
import type { Text2 } from '../../types.ts';
import { MAX_POINTS, type ScoredPart } from './score.ts';

/** One exam part as the drills show it. */
export interface PartInfo {
  /** Route segment, e.g. "teil1". */
  slug: string;
  part: ScoredPart;
  title: Text2;
  /** "Was ist zu tun?" – the exam instruction, shortened. */
  todo: Text2;
  /** Strategy tip. */
  tip: Text2;
  /** Suggested minutes ("Prüfungstempo"). */
  minutes: number;
  maxPoints: number;
}

export const LESEN_PARTS: PartInfo[] = [
  {
    slug: 'teil1',
    part: 'lesen1',
    title: { de: 'Teil 1 · Überschriften', en: 'Part 1 · Headlines' },
    todo: {
      de: 'Lesen Sie die Überschriften a–j und die Texte 1–5. Finden Sie für jeden Text die passende Überschrift. Jede Überschrift passt nur einmal – fünf bleiben übrig.',
      en: 'Read headlines a–j and texts 1–5. Find the matching headline for each text. Each headline fits only once – five are left over.',
    },
    tip: {
      de: 'Lesen Sie zuerst alle zehn Überschriften und markieren Sie die Schlüsselwörter. Fragen Sie bei jedem Text: Was ist die Hauptaussage – nicht nur ein Detail? Vorsicht: Falsche Überschriften greifen oft ein Wort aus dem Text auf (z. B. „Bahn“, „billiger“), sagen aber etwas anderes. Beginnen Sie mit dem Text, der Ihnen am leichtesten fällt.',
      en: 'First read all ten headlines and mark the key words. For each text ask: what is the main point – not just a detail? Careful: wrong headlines often pick up a word from the text (e.g. "train", "cheaper") but say something else. Start with the text you find easiest.',
    },
    minutes: 15,
    maxPoints: MAX_POINTS.lesen1,
  },
  {
    slug: 'teil2',
    part: 'lesen2',
    title: { de: 'Teil 2 · Detailverstehen', en: 'Part 2 · Detail' },
    todo: {
      de: 'Lesen Sie den Text und die Aufgaben 6–10. Welche Lösung (a, b oder c) ist jeweils richtig?',
      en: 'Read the text and items 6–10. Which answer (a, b or c) is correct?',
    },
    tip: {
      de: 'Lesen Sie zuerst die Aufgaben: Sie folgen der Reihenfolge des Textes. Suchen Sie dann die passende Stelle und vergleichen Sie genau. Falsche Lösungen enthalten oft Wörter aus dem Text, verdrehen aber Zahlen, Zeiten, Personen oder die Verneinung („nicht“, „kein“, „noch nicht“).',
      en: 'Read the items first: they follow the order of the text. Then find the matching passage and compare carefully. Wrong answers often reuse words from the text but twist numbers, times, people or negation ("nicht", "kein", "noch nicht").',
    },
    minutes: 20,
    maxPoints: MAX_POINTS.lesen2,
  },
  {
    slug: 'teil3',
    part: 'lesen3',
    title: { de: 'Teil 3 · Anzeigen', en: 'Part 3 · Ads' },
    todo: {
      de: 'Lesen Sie die Situationen 11–20 und die Anzeigen a–l. Finden Sie für jede Situation die passende Anzeige. Jede Anzeige nur einmal. Wenn keine Anzeige passt, wählen Sie x.',
      en: 'Read situations 11–20 and ads a–l. Find the matching ad for each situation. Each ad only once. If no ad fits, choose x.',
    },
    tip: {
      de: 'Markieren Sie in jeder Situation alle Bedingungen (wer? was? wann? wo? wie teuer?). Eine Anzeige passt nur, wenn ALLE Bedingungen stimmen – das Thema allein reicht nicht. Rechnen Sie mit ein bis zwei Situationen ohne passende Anzeige (x). Benutzte Anzeigen streichen.',
      en: 'In each situation mark every condition (who? what? when? where? how much?). An ad fits only if ALL conditions match – the topic alone is not enough. Expect one or two situations without a matching ad (x). Cross off ads you have used.',
    },
    minutes: 20,
    maxPoints: MAX_POINTS.lesen3,
  },
];
