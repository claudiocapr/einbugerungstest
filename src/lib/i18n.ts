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
  saveToFile: { de: 'Als Datei sichern', en: 'Save to a file' },
  loadFromFile: { de: 'Aus Datei laden', en: 'Load from a file' },
  fileNote: {
    de: 'Die Datei landet in Ihren Downloads. Sie finden sie dort wieder, können sie auf ein anderes Gerät kopieren oder einfach löschen.',
    en: 'The file lands in your downloads. You can find it there, copy it to another device, or simply delete it.',
  },
  importDone: { de: 'Fortschritt geladen.', en: 'Progress loaded.' },
  importFailed: { de: 'Datei konnte nicht gelesen werden.', en: 'That file could not be read.' },
  confirmImport: {
    de: 'Der gespeicherte Fortschritt wird durch die Datei ersetzt. Fortfahren?',
    en: 'Your saved progress will be replaced by the file. Continue?',
  },
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
  randomMode: { de: 'Zufallsfragen', en: 'Random questions' },
  randomHint: { de: 'Endlos zufällige Fragen aus Ihrem Katalog', en: 'Endless random questions from your catalogue' },
  dueMode: { de: 'Fällige Wiederholungen', en: 'Due for review' },
  dueHint: { de: 'Fragen, deren Wiederholung heute ansteht', en: 'Questions scheduled for repetition today' },
  noDue: {
    de: 'Nichts fällig – alle Wiederholungen sind erledigt.',
    en: 'Nothing due - you are on top of your repetitions.',
  },

  recommended: { de: 'Empfehlung', en: 'Recommended' },
  recDue: { de: 'Wiederholungen nachholen', en: 'Catch up on repetitions' },
  recDueWhy: {
    de: 'Diese Fragen stehen heute zur Wiederholung an. Wer sie liegen lässt, vergisst sie wieder.',
    en: 'These are scheduled for today. Leaving them is how they slip away again.',
  },
  recWeak: { de: 'Schwachstellen schließen', en: 'Close your weak spots' },
  recWeakWhy: {
    de: 'Fragen, die Sie zuletzt falsch oder unsicher beantwortet haben.',
    en: 'Questions you recently got wrong or answered shakily.',
  },
  recTopic: { de: 'Schwächster Themenbereich', en: 'Your weakest topic' },
  recTopicWhy: { de: 'Hier ist Ihre Trefferquote am niedrigsten.', en: 'This is where your score is lowest.' },
  recNew: { de: 'Neue Fragen kennenlernen', en: 'Meet new questions' },
  recNewWhy: {
    de: 'Diese Fragen haben Sie noch nie gesehen.',
    en: 'You have not seen these questions yet.',
  },
  recExam: { de: 'Zeit für eine Prüfung', en: 'Time for an exam' },
  recExamWhy: {
    de: 'Ihr Katalog sitzt – prüfen Sie sich unter echten Bedingungen.',
    en: 'Your catalogue is solid - test yourself under real conditions.',
  },

  levelNew: { de: 'Neu', en: 'New' },
  levelWeak: { de: 'Schwach', en: 'Weak' },
  levelShaky: { de: 'Wackelig', en: 'Shaky' },
  levelGood: { de: 'Gut', en: 'Good' },
  levelStrong: { de: 'Sicher', en: 'Strong' },

  strength: { de: 'Stärke', en: 'Strength' },
  strengthByTopic: { de: 'Stärke je Themenbereich', en: 'Strength by topic' },
  distribution: { de: 'Verteilung', en: 'Breakdown' },
  weakest: { de: 'Ihre schwächsten Fragen', en: 'Your weakest questions' },
  strongest: { de: 'Ihre stärksten Fragen', en: 'Your strongest questions' },
  yourAnswers: { de: 'Ihre letzten Antworten', en: 'Your recent answers' },
  neverAnswered: { de: 'Noch nicht beantwortet', en: 'Not answered yet' },
  timesAnswered: { de: 'mal beantwortet', en: 'times answered' },
  streak: { de: 'Tage in Folge', en: 'day streak' },
  today: { de: 'Heute', en: 'Today' },
  dailyGoal: { de: 'Tagesziel', en: 'Daily goal' },
  goalReached: { de: 'Tagesziel erreicht!', en: 'Daily goal reached!' },
  activity: { de: 'Letzte 14 Tage', en: 'Last 14 days' },
  dueNow: { de: 'fällig', en: 'due' },
  practised: { de: 'Geübt', en: 'Practised' },

  dataNote: {
    de: 'Fragen: amtlicher Gesamtfragenkatalog des BAMF, Stand 07.05.2025. Ohne Gewähr.',
    en: 'Questions: official BAMF catalogue, as of 07.05.2025. No guarantee of accuracy.',
  },
} satisfies Record<string, Entry>;

export type Key = keyof typeof T;

export const t = (key: Key, lang: Lang): string => T[key][lang];

/** "1 Frage" / "7 Fragen", "1 question" / "7 questions". */
export const countQuestions = (n: number, lang: Lang): string =>
  lang === 'de' ? `${n} ${n === 1 ? 'Frage' : 'Fragen'}` : `${n} question${n === 1 ? '' : 's'}`;

export const useT = (lang: Lang) => (key: Key) => t(key, lang);
