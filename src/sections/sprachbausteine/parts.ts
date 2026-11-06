/** Instructions, tips and suggested timing per Sprachbausteine part (no React, reusable). */
import type { PartInfo } from '../lesen/parts.ts';
import { MAX_POINTS } from '../lesen/score.ts';

export const SB_PARTS: PartInfo[] = [
  {
    slug: 'teil1',
    part: 'sb1',
    title: { de: 'Teil 1 · Grammatik', en: 'Part 1 · Grammar' },
    todo: {
      de: 'Lesen Sie den Text und schließen Sie die Lücken 21–30. Welche Lösung (a, b oder c) ist jeweils richtig?',
      en: 'Read the text and fill gaps 21–30. Which answer (a, b or c) is correct?',
    },
    tip: {
      de: 'Lesen Sie immer den ganzen Satz – auch, was nach der Lücke kommt. Fragen Sie: Hauptsatz oder Nebensatz (steht das Verb am Ende)? Welcher Kasus (Präposition, Verb)? Passt die Endung zu Artikel und Genus? Bei Konnektoren Bedeutung UND Wortstellung prüfen: „weil“ + Verb am Ende, „deshalb“ + Verb auf Position 2, „denn“ + normale Stellung.',
      en: 'Always read the whole sentence – including what follows the gap. Ask: main or subordinate clause (verb at the end)? Which case (preposition, verb)? Does the ending match article and gender? For connectors check meaning AND word order: "weil" + verb last, "deshalb" + verb in position 2, "denn" + normal order.',
    },
    minutes: 15,
    maxPoints: MAX_POINTS.sb1,
  },
  {
    slug: 'teil2',
    part: 'sb2',
    title: { de: 'Teil 2 · Wortschatz', en: 'Part 2 · Vocabulary' },
    todo: {
      de: 'Lesen Sie den Text und schließen Sie die Lücken 31–40. Benutzen Sie die Wörter a–o. Jedes Wort passt nur einmal.',
      en: 'Read the text and fill gaps 31–40 using words a–o. Each word fits only once.',
    },
    tip: {
      de: 'Lesen Sie den Text erst einmal ganz. Bestimmen Sie dann für jede Lücke die Wortart: Nomen, Verb, Präposition, Konnektor? Achten Sie auf feste Verbindungen („sich interessieren für“, „Bescheid geben“, „in Anspruch nehmen“). Füllen Sie zuerst die sicheren Lücken – fünf Wörter bleiben am Ende übrig.',
      en: 'Read the whole text once first. Then decide the word class for each gap: noun, verb, preposition, connector? Watch for fixed phrases ("sich interessieren für", "Bescheid geben", "in Anspruch nehmen"). Fill the sure gaps first – five words are left over at the end.',
    },
    minutes: 15,
    maxPoints: MAX_POINTS.sb2,
  },
];
