/**
 * Extracts the answer key ("Lösungsschlüssel") of a telc Deutsch B1 /
 * Zertifikat Deutsch Übungstest from the text of its PDF, at run time, so the
 * key itself never has to be committed.
 *
 * Input: the text of every page (as pdfjs-dist yields it, one item per line).
 * The key page lists one item per line: "<number> <mark>", where the mark is a
 * letter, "x" (Leseverstehen Teil 3: no matching ad), "+" (richtig) or "–"
 * (falsch, often an en dash). Output: { "1": "c", …, "41": "+", "42": "-" }.
 */

/** Which marks each item range allows (the format of Antwortbogen S30). */
export const ITEM_RULES = [
  { from: 1, to: 5, allowed: /^[a-j]$/ },
  { from: 6, to: 10, allowed: /^[a-c]$/ },
  { from: 11, to: 20, allowed: /^([a-l]|x)$/ },
  { from: 21, to: 30, allowed: /^[a-c]$/ },
  { from: 31, to: 40, allowed: /^[a-o]$/ },
  { from: 41, to: 60, allowed: /^[+-]$/ },
];
export const ITEM_COUNT = 60;

const ruleFor = (n) => ITEM_RULES.find((r) => n >= r.from && n <= r.to);

/** "–", "—", "−" -> "-"; "X" -> "x"; collapses whitespace. */
function normaliseLine(line) {
  return line
    .replace(/[‐-―−]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

/** The key page carries the heading, sometimes letter-spaced ("L ö s u n g s s c h l ü s s e l"). */
const HEADING = /l\s*ö\s*s\s*u\s*n\s*g\s*s\s*s\s*c\s*h\s*l\s*ü\s*s\s*s\s*e\s*l/i;
/** Table-of-contents lines ("Lösungsschlüssel ____ 41") are not the key page. */
const TOC_LINE = /_{3,}|\.{5,}/;

/** All "<n> <mark>" pairs on one page; a line may hold several pairs. */
export function pairsOnPage(text) {
  const pairs = [];
  for (const raw of String(text).split(/\r?\n/)) {
    const line = normaliseLine(raw);
    if (!/^(\d{1,2} ([a-oxX]|\+|-))( \d{1,2} ([a-oxX]|\+|-))*$/.test(line)) continue;
    const re = /(\d{1,2}) ([a-oxX]|\+|-)/g;
    let m;
    while ((m = re.exec(line))) pairs.push([Number(m[1]), m[2].toLowerCase()]);
  }
  return pairs;
}

function isKeyHeadingPage(text) {
  return String(text)
    .split(/\r?\n/)
    .some((line) => HEADING.test(line) && !TOC_LINE.test(line));
}

/**
 * @param {string[] | string} pages page texts, or one text with form feeds / "==== PAGE n ====" markers
 * @returns {{ key: Record<string,string>, found: number, missing: number[], invalid: string[], page: number | null }}
 */
export function parseAnswerKey(pages) {
  const list = Array.isArray(pages) ? pages : String(pages).split(/\f|^==== PAGE \d+ ====$/m);

  // Candidate pages: the ones with the heading first, then by number of pairs.
  const scored = list
    .map((text, index) => ({ index, heading: isKeyHeadingPage(text), pairs: pairsOnPage(text) }))
    .filter((p) => p.pairs.length >= 10)
    .sort((a, b) => Number(b.heading) - Number(a.heading) || b.pairs.length - a.pairs.length);

  let best = { key: {}, found: 0, missing: [], invalid: [], page: null };
  for (const candidate of scored) {
    const key = {};
    const invalid = [];
    for (const [n, mark] of candidate.pairs) {
      const rule = ruleFor(n);
      if (!rule) continue;
      if (!rule.allowed.test(mark)) {
        invalid.push(`${n}:${mark}`);
        continue;
      }
      if (!(String(n) in key)) key[String(n)] = mark;
    }
    const found = Object.keys(key).length;
    const missing = [];
    for (let n = 1; n <= ITEM_COUNT; n++) if (!(String(n) in key)) missing.push(n);
    if (found > best.found) best = { key, found, missing, invalid, page: candidate.index + 1 };
    if (found === ITEM_COUNT) break;
  }
  if (best.page === null) {
    best.missing = Array.from({ length: ITEM_COUNT }, (_, i) => i + 1);
  }
  // Keys in item order, for a stable file.
  const ordered = {};
  for (let n = 1; n <= ITEM_COUNT; n++) if (String(n) in best.key) ordered[String(n)] = best.key[String(n)];
  return { ...best, key: ordered };
}

/** Summary without revealing any answer (safe for public workflow logs). */
export function describeKey(result) {
  const counts = {};
  for (const mark of Object.values(result.key)) {
    const kind = mark === '+' || mark === '-' ? 'richtig/falsch' : mark === 'x' ? 'x' : 'letter';
    counts[kind] = (counts[kind] ?? 0) + 1;
  }
  return `${result.found}/${ITEM_COUNT} items (page ${result.page ?? '?'}; ${Object.entries(counts)
    .map(([k, v]) => `${v} ${k}`)
    .join(', ')})${result.missing.length ? `; missing ${result.missing.join(',')}` : ''}${
    result.invalid.length ? `; ${result.invalid.length} invalid` : ''
  }`;
}
