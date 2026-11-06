/**
 * Simple, rule-based hints about a learner's e-mail. No AI and nothing leaves
 * the device: these only look at word counts, the first and last lines, du/Sie
 * forms and how sentences start. They are hints, not a grade.
 */
import type { Text2 } from '../../types.ts';
import type { WritingTask } from '../../content/types.ts';

export const WORD_TARGET = { min: 100, max: 150 } as const;
/** Drafts are capped so the synced store stays small. */
export const MAX_TEXT_LENGTH = 4000;

const WORD = /[\p{L}\p{N}]+(?:[-'’][\p{L}\p{N}]+)*/gu;

export function words(text: string): string[] {
  return text.match(WORD) ?? [];
}

export const countWords = (text: string) => words(text).length;

const lines = (text: string) =>
  text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

export type Register = WritingTask['register'];

export interface Detected {
  found: boolean;
  /** Which register the line signals; "neutral" fits both. */
  kind: Register | 'neutral' | null;
  line: string;
}

const ANREDE_FORMAL = /^(sehr\s+geehrte[rs]?|guten\s+(tag|morgen|abend))\b/iu;
const ANREDE_ANY = /^(liebe[rs]?|hallo|hi|hey|servus|moin|sehr\s+geehrte[rs]?|guten\s+(tag|morgen|abend))\b/iu;
const TITLE = /\b(frau|herr|herrn|damen\s+und\s+herren|dr\.?)\b/iu;

/** Looks at the first line for an Anrede ("Liebe Jana," / "Sehr geehrte Frau Becker,"). */
export function detectAnrede(text: string): Detected {
  const first = lines(text)[0] ?? '';
  if (!ANREDE_ANY.test(first)) return { found: false, kind: null, line: first };
  const kind: Register = ANREDE_FORMAL.test(first) || TITLE.test(first) ? 'semiformal' : 'informal';
  return { found: true, kind, line: first };
}

const GRUSS_FORMAL = /(mit\s+freundlichen\s+grüßen|freundliche\s+grüße|hochachtungsvoll)/iu;
const GRUSS_INFORMAL = /(liebe\s+grüße|\blg\b|bis\s+(bald|dann|morgen|später)|tschüss|mach'?s\s+gut|umarmung|küsse|^(dein|deine)\b)/iu;
const GRUSS_NEUTRAL = /(viele\s+grüße|herzliche\s+grüße|beste\s+grüße|schöne\s+grüße|grüße\s+aus|alles\s+gute|^gruß\b|^grüße\b)/iu;

/** Looks at the last three lines for a Gruß ("Viele Grüße", "Mit freundlichen Grüßen", "Dein …"). */
export function detectGruss(text: string): Detected {
  const tail = lines(text).slice(-3);
  for (const line of tail) {
    if (GRUSS_FORMAL.test(line)) return { found: true, kind: 'semiformal', line };
  }
  for (const line of tail) {
    if (GRUSS_INFORMAL.test(line)) return { found: true, kind: 'informal', line };
  }
  for (const line of tail) {
    if (GRUSS_NEUTRAL.test(line)) return { found: true, kind: 'neutral', line };
  }
  return { found: false, kind: null, line: tail[tail.length - 1] ?? '' };
}

const DU_FORMS = new Set([
  'du', 'dich', 'dir', 'dein', 'deine', 'deinen', 'deinem', 'deiner', 'deines',
  'euch', 'euer', 'eure', 'euren', 'eurem', 'eurer', 'eures',
]);
const SIE_FORMS = new Set(['Sie', 'Ihnen', 'Ihr', 'Ihre', 'Ihren', 'Ihrem', 'Ihrer', 'Ihres']);

/**
 * Counts du-forms and polite Sie-forms. A capitalised "Sie"/"Ihr…" at the start
 * of a sentence or line is ambiguous (she/they/her) and is skipped; "Ihnen" is
 * counted anywhere.
 */
export function addressForms(text: string): { du: number; sie: number } {
  let du = 0;
  let sie = 0;
  for (const m of text.matchAll(WORD)) {
    const w = m[0];
    if (DU_FORMS.has(w.toLowerCase())) {
      du++;
      continue;
    }
    if (!SIE_FORMS.has(w)) continue;
    if (w === 'Ihnen') {
      sie++;
      continue;
    }
    const before = text.slice(0, m.index).replace(/[ \t]+$/u, '');
    const initial = before === '' || /[.!?:\n"„]$/u.test(before);
    if (!initial) sie++;
  }
  return { du, sie };
}

/** Splits into sentences on . ! ? and line breaks. */
export function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|\r?\n+/u)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Sentence openings used three times or more and in at least 30 % of the
 * sentences, e.g. "Ich … Ich … Ich …". Short lines (Anrede, Gruß, name) are
 * ignored.
 */
export function repeatedStarts(text: string): { word: string; count: number }[] {
  const starts = sentences(text)
    .filter((s) => words(s).length >= 3)
    .map((s) => words(s)[0]?.toLowerCase())
    .filter((w): w is string => Boolean(w));
  const counts = new Map<string, number>();
  for (const w of starts) counts.set(w, (counts.get(w) ?? 0) + 1);
  return [...counts]
    .filter(([, n]) => n >= 3 && n / starts.length >= 0.3)
    .sort((a, b) => b[1] - a[1])
    .map(([word, count]) => ({ word, count }));
}

export interface Hint {
  id: string;
  ok: boolean;
  text: Text2;
}

const word = (n: number, lang: 'de' | 'en') => (lang === 'de' ? (n === 1 ? 'Wort' : 'Wörter') : n === 1 ? 'word' : 'words');

/** All automatic hints for a text, positives included so the learner sees what already works. */
export function writingHints(text: string, register: Register): Hint[] {
  const hints: Hint[] = [];
  const n = countWords(text);

  if (n < 80) {
    hints.push({
      id: 'length',
      ok: false,
      text: {
        de: `${n} ${word(n, 'de')} – zu kurz. Ziel: etwa ${WORD_TARGET.min}–${WORD_TARGET.max} Wörter.`,
        en: `${n} ${word(n, 'en')} – too short. Aim for about ${WORD_TARGET.min}–${WORD_TARGET.max} words.`,
      },
    });
  } else if (n < WORD_TARGET.min) {
    hints.push({
      id: 'length',
      ok: false,
      text: {
        de: `${n} Wörter – etwas knapp. Ein, zwei Sätze mehr zu einem Leitpunkt helfen.`,
        en: `${n} words – a little short. One or two more sentences on a point would help.`,
      },
    });
  } else if (n > 180) {
    hints.push({
      id: 'length',
      ok: false,
      text: {
        de: `${n} Wörter – deutlich mehr als nötig. Längere Texte kosten Zeit und bringen mehr Fehler.`,
        en: `${n} words – much more than needed. Longer texts cost time and invite more errors.`,
      },
    });
  } else {
    hints.push({
      id: 'length',
      ok: true,
      text: { de: `${n} Wörter – gute Länge.`, en: `${n} words – a good length.` },
    });
  }

  const anrede = detectAnrede(text);
  if (!anrede.found) {
    hints.push({
      id: 'anrede',
      ok: false,
      text: {
        de: register === 'informal'
          ? 'Keine Anrede gefunden. Beginnen Sie z. B. mit „Liebe Jana,“ oder „Hallo Tobias,“.'
          : 'Keine Anrede gefunden. Beginnen Sie z. B. mit „Sehr geehrte Frau Becker,“.',
        en: register === 'informal'
          ? 'No greeting found. Start with e.g. “Liebe Jana,” or “Hallo Tobias,”.'
          : 'No greeting found. Start with e.g. “Sehr geehrte Frau Becker,”.',
      },
    });
  } else if (anrede.kind !== register) {
    hints.push({
      id: 'anrede',
      ok: false,
      text: register === 'informal'
        ? { de: `„${anrede.line}“ klingt für einen Freund / eine Freundin zu förmlich.`, en: `“${anrede.line}” is too formal for a friend.` }
        : { de: `„${anrede.line}“ ist für diese Person zu locker. Besser: „Sehr geehrte/r …“ oder „Liebe Frau …“.`, en: `“${anrede.line}” is too casual for this person. Better: “Sehr geehrte/r …” or “Liebe Frau …”.` },
    });
  } else {
    hints.push({ id: 'anrede', ok: true, text: { de: `Anrede: „${anrede.line}“`, en: `Greeting: “${anrede.line}”` } });
    if (!/,\s*$/u.test(anrede.line)) {
      hints.push({
        id: 'anrede-komma',
        ok: false,
        text: { de: 'Nach der Anrede steht ein Komma.', en: 'The greeting is followed by a comma.' },
      });
    }
  }

  const gruss = detectGruss(text);
  if (!gruss.found) {
    hints.push({
      id: 'gruss',
      ok: false,
      text: {
        de: register === 'informal'
          ? 'Kein Gruß am Ende gefunden, z. B. „Viele Grüße“ oder „Liebe Grüße“ und Ihr Name.'
          : 'Kein Gruß am Ende gefunden, z. B. „Mit freundlichen Grüßen“ und Ihr Name.',
        en: register === 'informal'
          ? 'No sign-off found, e.g. “Viele Grüße” or “Liebe Grüße” and your name.'
          : 'No sign-off found, e.g. “Mit freundlichen Grüßen” and your name.',
      },
    });
  } else if (gruss.kind !== 'neutral' && gruss.kind !== register) {
    hints.push({
      id: 'gruss',
      ok: false,
      text: register === 'informal'
        ? { de: `„${gruss.line}“ ist für Freunde zu förmlich.`, en: `“${gruss.line}” is too formal for friends.` }
        : { de: `„${gruss.line}“ ist hier zu persönlich.`, en: `“${gruss.line}” is too personal here.` },
    });
  } else {
    hints.push({ id: 'gruss', ok: true, text: { de: `Gruß: „${gruss.line}“`, en: `Sign-off: “${gruss.line}”` } });
  }

  const forms = addressForms(text);
  if (forms.du > 0 && forms.sie > 0) {
    hints.push({
      id: 'register',
      ok: false,
      text: {
        de: `Du und Sie gemischt (${forms.du}× du-Formen, ${forms.sie}× Sie-Formen). Bleiben Sie bei einer Form.`,
        en: `du and Sie are mixed (${forms.du}× du, ${forms.sie}× Sie). Stick to one.`,
      },
    });
  } else if (register === 'informal' && forms.sie > 0) {
    hints.push({
      id: 'register',
      ok: false,
      text: { de: 'Sie schreiben einem Freund / einer Freundin: Hier passt „du“.', en: 'You are writing to a friend: use “du”.' },
    });
  } else if (register === 'semiformal' && forms.du > 0) {
    hints.push({
      id: 'register',
      ok: false,
      text: { de: 'Diese Person siezen Sie: „Sie“, „Ihnen“, „Ihr“ statt „du“.', en: 'Address this person with “Sie”, “Ihnen”, “Ihr” instead of “du”.' },
    });
  } else if (forms.du + forms.sie > 0) {
    hints.push({
      id: 'register',
      ok: true,
      text: register === 'informal'
        ? { de: 'Durchgehend „du“ – passt.', en: 'Consistently “du” – fits.' }
        : { de: 'Durchgehend „Sie“ – passt.', en: 'Consistently “Sie” – fits.' },
    });
  }

  for (const r of repeatedStarts(text)) {
    const w = r.word.charAt(0).toUpperCase() + r.word.slice(1);
    hints.push({
      id: `starts-${r.word}`,
      ok: false,
      text: {
        de: `${r.count} Sätze beginnen mit „${w}“. Abwechseln: „Deshalb …“, „Am Samstag …“, „Leider …“.`,
        en: `${r.count} sentences start with “${w}”. Vary it: “Deshalb …”, “Am Samstag …”, “Leider …”.`,
      },
    });
  }

  return hints;
}
