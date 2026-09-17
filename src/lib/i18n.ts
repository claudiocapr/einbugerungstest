import type { Lang } from '../types.ts';

type Entry = { de: string; en: string };

const T = {
  appName: { de: 'Einbürgerungstest', en: 'Citizenship Test' },
  tagline: { de: 'Für den Einbürgerungstest üben', en: 'Practise for the citizenship test' },
  home: { de: 'Start', en: 'Home' },
  exam: { de: 'Prüfung', en: 'Exam' },
  practice: { de: 'Üben', en: 'Practice' },
  browse: { de: 'Katalog', en: 'Catalogue' },
  stats: { de: 'Fortschritt', en: 'Progress' },

  chooseState: { de: 'Bundesland wählen', en: 'Choose your federal state' },
  chooseStateHint: {
    de: 'Ihre 3 Landesfragen richten sich nach dem Bundesland, in dem Sie den Test ablegen.',
    en: 'Your 3 state questions depend on the federal state where you sit the test.',
  },
  change: { de: 'Ändern', en: 'Change' },

  startExam: { de: 'Prüfung simulieren', en: 'Simulate the exam' },
  startExamHint: { de: '33 Fragen · 60 Minuten · 17 richtige zum Bestehen', en: '33 questions · 60 minutes · 17 correct to pass' },
  startPractice: { de: 'Üben', en: 'Practice' },
  startPracticeHint: { de: 'Sofortige Auflösung und Erklärung', en: 'Instant feedback and explanation' },
  weakQuestions: { de: 'Schwierige Fragen', en: 'Tricky questions' },
  weakHint: { de: 'Nur Fragen, die Sie falsch beantwortet haben', en: 'Only questions you got wrong' },
  browseHint: { de: 'Alle Fragen mit Lösung durchsuchen', en: 'Search every question with its answer' },
  statsHint: { de: 'Lernstand und Prüfungsverlauf', en: 'Learning progress and exam history' },

  question: { de: 'Frage', en: 'Question' },
  of: { de: 'von', en: 'of' },
  next: { de: 'Weiter', en: 'Next' },
  back: { de: 'Zurück', en: 'Back' },
  finish: { de: 'Abgeben', en: 'Submit' },
  finishNow: { de: 'Jetzt abgeben', en: 'Submit now' },
  cancel: { de: 'Abbrechen', en: 'Cancel' },
  correct: { de: 'Richtig', en: 'Correct' },
  wrong: { de: 'Falsch', en: 'Wrong' },
  yourAnswer: { de: 'Ihre Antwort', en: 'Your answer' },
  correctAnswer: { de: 'Richtige Antwort', en: 'Correct answer' },
  unanswered: { de: 'Nicht beantwortet', en: 'Unanswered' },
  showTranslation: { de: 'Auf Englisch anzeigen', en: 'Show in German' },
  explanation: { de: 'Erklärung', en: 'Explanation' },

  passed: { de: 'Bestanden', en: 'Passed' },
  failed: { de: 'Nicht bestanden', en: 'Not passed' },
  resultLine: { de: 'richtige Antworten', en: 'correct answers' },
  reviewAnswers: { de: 'Antworten durchsehen', en: 'Review answers' },
  againExam: { de: 'Neue Prüfung', en: 'New exam' },
  timeLeft: { de: 'Verbleibend', en: 'Time left' },
  timeUp: { de: 'Die Zeit ist abgelaufen.', en: 'Time is up.' },
  confirmSubmit: {
    de: 'Prüfung abgeben? Nicht beantwortete Fragen zählen als falsch.',
    en: 'Submit the exam? Unanswered questions count as wrong.',
  },

  all: { de: 'Alle', en: 'All' },
  search: { de: 'Suchen', en: 'Search' },
  noResults: { de: 'Keine Fragen gefunden.', en: 'No questions found.' },
  mastered: { de: 'Sicher', en: 'Mastered' },
  learning: { de: 'Im Lernen', en: 'Learning' },
  unseen: { de: 'Neu', en: 'Not seen' },
  accuracy: { de: 'Trefferquote', en: 'Accuracy' },
  examHistory: { de: 'Prüfungsverlauf', en: 'Exam history' },
  noExams: { de: 'Noch keine Prüfung abgelegt.', en: 'No exam taken yet.' },
  resetProgress: { de: 'Fortschritt zurücksetzen', en: 'Reset progress' },
  confirmReset: {
    de: 'Wirklich den gesamten Lernfortschritt löschen?',
    en: 'Really delete all learning progress?',
  },
  noWeak: {
    de: 'Keine schwierigen Fragen – üben Sie weiter, dann sammeln sich hier Ihre Fehler.',
    en: 'No tricky questions yet - keep practising and your mistakes will collect here.',
  },
  sessionDone: { de: 'Runde geschafft!', en: 'Round complete!' },
  keepGoing: { de: 'Weiter üben', en: 'Keep practising' },
  backHome: { de: 'Zur Startseite', en: 'Back to home' },
  imageQuestion: { de: 'Bildfrage', en: 'Picture question' },
  masteredOf: { de: 'sicher beherrscht', en: 'mastered' },
  dataNote: {
    de: 'Fragen: amtlicher Gesamtfragenkatalog des BAMF. Ohne Gewähr.',
    en: 'Questions: official BAMF catalogue. No guarantee of accuracy.',
  },
} satisfies Record<string, Entry>;

export type Key = keyof typeof T;

export const t = (key: Key, lang: Lang): string => T[key][lang];

/** "1 Frage" / "7 Fragen", "1 question" / "7 questions". */
export const countQuestions = (n: number, lang: Lang): string =>
  lang === 'de' ? `${n} ${n === 1 ? 'Frage' : 'Fragen'}` : `${n} question${n === 1 ? '' : 's'}`;

export const useT = (lang: Lang) => (key: Key) => t(key, lang);
