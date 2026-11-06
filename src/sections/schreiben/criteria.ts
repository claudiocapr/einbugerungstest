/**
 * The three telc criteria for the Schriftlicher Ausdruck and how a self-assessed
 * A–D grade turns into points. Pure, so the Modelltest and the tests use it too.
 *
 * telc gives 5 / 3 / 1 / 0 raw points for A / B / C / D on each criterion and
 * multiplies the sum by three, so the subtest is worth 45 points (15 % of 300).
 */
import type { Text2 } from '../../types.ts';

/** 0 = A, 1 = B, 2 = C, 3 = D. */
export type Grade = 0 | 1 | 2 | 3;

export const GRADE_LETTERS = ['A', 'B', 'C', 'D'] as const;

/** Weighted points per criterion for A, B, C, D (raw 5/3/1/0 × 3). */
export const WRITING_GRADE_POINTS = [15, 9, 3, 0] as const;

export const WRITING_MAX = 45;

export const isGrade = (g: unknown): g is Grade => g === 0 || g === 1 || g === 2 || g === 3;

/** Points for the three criterion grades; an ungraded criterion counts as D. */
export function writingPoints(grades: readonly (Grade | null | undefined)[]): number {
  let sum = 0;
  for (let i = 0; i < 3; i++) {
    const g = grades[i];
    sum += isGrade(g) ? WRITING_GRADE_POINTS[g] : 0;
  }
  return sum;
}

export interface CriterionCheck {
  id: string;
  text: Text2;
}

export interface Criterion {
  id: 'I' | 'II' | 'III';
  title: Text2;
  /** What A, B, C and D mean for this criterion, in our own words. */
  levels: [Text2, Text2, Text2, Text2];
  /** Guided questions the learner answers about their own text. */
  checks: CriterionCheck[];
}

export const CRITERIA: Criterion[] = [
  {
    id: 'I',
    title: { de: 'I Aufgabenbewältigung', en: 'I Task completion' },
    levels: [
      { de: 'Alle vier Leitpunkte sind inhaltlich passend behandelt.', en: 'All four points are covered appropriately.' },
      { de: 'Drei Leitpunkte sind passend behandelt.', en: 'Three points are covered appropriately.' },
      { de: 'Zwei Leitpunkte sind passend behandelt.', en: 'Two points are covered appropriately.' },
      {
        de: 'Höchstens ein Leitpunkt – oder der Text passt nicht zur Situation.',
        en: 'One point at most – or the text does not fit the situation.',
      },
    ],
    checks: [
      {
        id: 'I-situation',
        text: {
          de: 'Mein Text ist eine Antwort auf genau diese E-Mail (richtige Rolle, richtige Situation).',
          en: 'My text replies to exactly this e-mail (right role, right situation).',
        },
      },
      {
        id: 'I-points',
        text: {
          de: 'Zu jedem Leitpunkt steht mindestens ein sinnvoller Satz.',
          en: 'There is at least one sensible sentence for each point.',
        },
      },
    ],
  },
  {
    id: 'II',
    title: { de: 'II Kommunikative Gestaltung', en: 'II Communicative design' },
    levels: [
      {
        de: 'B1 gut erfüllt: passende Redemittel, abwechslungsreich, gut verbunden, Register stimmt.',
        en: 'Strong B1: fitting phrases, varied, well connected, right register.',
      },
      {
        de: 'B1 erfüllt: zusammenhängend und verständlich, kleine Schwächen bei Wortwahl oder Verbindungen.',
        en: 'B1: coherent and clear, small weaknesses in wording or linking.',
      },
      {
        de: 'A2: einfache Sätze, nur und/aber/weil, Teile stehen eher nebeneinander.',
        en: 'A2: simple sentences, only and/but/because, parts stand side by side.',
      },
      { de: 'A1 oder darunter: einzelne Wörter und auswendig gelernte Wendungen.', en: 'A1 or below: single words and memorised chunks.' },
    ],
    checks: [
      {
        id: 'II-anrede',
        text: { de: 'Anrede passt zur Person (Liebe/r … oder Sehr geehrte/r …).', en: 'The greeting fits the person (Liebe/r … or Sehr geehrte/r …).' },
      },
      {
        id: 'II-einleitung',
        text: { de: 'Die Einleitung bezieht sich auf die E-Mail (Dank, Reaktion).', en: 'The opening refers to the e-mail (thanks, reaction).' },
      },
      {
        id: 'II-schluss',
        text: { de: 'Es gibt einen Schluss und einen passenden Gruß.', en: 'There is a closing line and a fitting sign-off.' },
      },
      {
        id: 'II-register',
        text: { de: 'Ich bleibe durchgehend bei du – oder durchgehend bei Sie.', en: 'I stick to du – or to Sie – throughout.' },
      },
      {
        id: 'II-connect',
        text: {
          de: 'Die Leitpunkte sind verbunden (deshalb, außerdem, trotzdem, weil, dass …).',
          en: 'The points are linked (deshalb, außerdem, trotzdem, weil, dass …).',
        },
      },
      {
        id: 'II-starts',
        text: { de: 'Nicht jeder Satz beginnt mit „Ich“ – die Satzanfänge wechseln.', en: 'Not every sentence starts with “Ich” – openings vary.' },
      },
    ],
  },
  {
    id: 'III',
    title: { de: 'III Formale Richtigkeit', en: 'III Accuracy' },
    levels: [
      { de: 'Nur vereinzelte Fehler, der Text ist gut verständlich.', en: 'Only occasional errors, easy to understand.' },
      { de: 'Einige Fehler, aber es bleibt meistens klar, was gemeint ist.', en: 'Some errors, but the meaning is mostly clear.' },
      {
        de: 'Viele elementare Fehler (Verbformen, Zeiten), der Sinn ist meist noch erkennbar.',
        en: 'Many basic errors (verb forms, tenses), the meaning usually still comes through.',
      },
      { de: 'So viele Fehler, dass man den Text kaum versteht.', en: 'So many errors that the text is hard to understand.' },
    ],
    checks: [
      {
        id: 'III-v2',
        text: {
          de: 'Im Hauptsatz steht das konjugierte Verb an Position 2 (auch nach „Deshalb“, „Morgen“ …).',
          en: 'In main clauses the finite verb is in position 2 (also after “Deshalb”, “Morgen” …).',
        },
      },
      {
        id: 'III-nebensatz',
        text: { de: 'Im Nebensatz (weil, dass, wenn, ob …) steht das Verb am Ende.', en: 'In subordinate clauses (weil, dass, wenn, ob …) the verb goes last.' },
      },
      {
        id: 'III-klammer',
        text: {
          de: 'Satzklammer: Infinitiv oder Partizip steht am Satzende (… kann am Samstag kommen / habe … gemacht).',
          en: 'Sentence bracket: infinitive or participle at the end (… kann am Samstag kommen / habe … gemacht).',
        },
      },
      {
        id: 'III-gross',
        text: { de: 'Nomen schreibe ich groß, das höfliche „Sie/Ihnen“ auch.', en: 'Nouns are capitalised, and so is polite “Sie/Ihnen”.' },
      },
      {
        id: 'III-formen',
        text: {
          de: 'Verbformen und Zeiten stimmen (ich habe … gemacht, er kommt, wir sind gefahren).',
          en: 'Verb forms and tenses are right (ich habe … gemacht, er kommt, wir sind gefahren).',
        },
      },
    ],
  },
];

/**
 * A suggested grade from the learner's own checklist. For criterion I the
 * number of Leitpunkte covered decides (4 → A … ≤1 → D) and a missed
 * situation forces D; for II and III the share of ticked checks does.
 */
export function suggestGrade(criterion: Criterion, checked: readonly string[], pointsCovered: number): Grade {
  const ticked = criterion.checks.filter((c) => checked.includes(c.id)).length;
  if (criterion.id === 'I') {
    if (!checked.includes('I-situation')) return 3;
    const covered = checked.includes('I-points') ? Math.max(pointsCovered, 0) : Math.min(pointsCovered, 3);
    return covered >= 4 ? 0 : covered === 3 ? 1 : covered === 2 ? 2 : 3;
  }
  const share = criterion.checks.length > 0 ? ticked / criterion.checks.length : 0;
  if (share >= 1) return 0;
  if (share >= 2 / 3) return 1;
  if (share >= 1 / 3) return 2;
  return 3;
}
