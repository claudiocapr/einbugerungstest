import type { Lang, Text2 } from '../types.ts';

/**
 * Strings used by the app shell and shared components. Each section keeps its
 * own strings next to its code (a local `Text2` object per string) and reads
 * them with `tr`, so sections never need to edit this file.
 */
const T = {
  appName: { de: 'telc B1 Trainer', en: 'telc B1 Trainer' },
  home: { de: 'Start', en: 'Home' },
  back: { de: 'Zurück', en: 'Back' },
  next: { de: 'Weiter', en: 'Next' },
  cancel: { de: 'Abbrechen', en: 'Cancel' },
  confirmOk: { de: 'Ja', en: 'Yes' },
  correct: { de: 'Richtig', en: 'Correct' },
  wrong: { de: 'Falsch', en: 'Wrong' },
  correctAnswer: { de: 'Richtige Antwort', en: 'Correct answer' },
  explanation: { de: 'Erklärung', en: 'Explanation' },
  loading: { de: 'Lädt …', en: 'Loading …' },
  notFound: { de: 'Diese Seite gibt es nicht.', en: 'This page does not exist.' },
  account: { de: 'Konto', en: 'Account' },
  levelNew: { de: 'Neu', en: 'New' },
  levelWeak: { de: 'Schwach', en: 'Weak' },
  levelShaky: { de: 'Wackelig', en: 'Shaky' },
  levelGood: { de: 'Gut', en: 'Good' },
  levelStrong: { de: 'Sicher', en: 'Strong' },
  neverAnswered: { de: 'Noch nicht geübt', en: 'Not practised yet' },
  yourAnswers: { de: 'Ihre letzten Antworten', en: 'Your recent answers' },
  dataNote: {
    de: 'Übungsmaterial nach dem Format von telc Deutsch B1 / Zertifikat Deutsch, eigens für diese App geschrieben. Kein offizielles telc-Angebot. Ohne Gewähr.',
    en: 'Practice material in the format of telc Deutsch B1 / Zertifikat Deutsch, written for this app. Not an official telc product. No guarantee of accuracy.',
  },
} satisfies Record<string, Text2>;

export type Key = keyof typeof T;

export const t = (key: Key, lang: Lang): string => T[key][lang];

/** Reads a section's own bilingual string. */
export const tr = (text: Text2, lang: Lang): string => text[lang];
