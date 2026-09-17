/**
 * Parses the official BAMF "Gesamtfragenkatalog zum Test Leben in Deutschland
 * und zum Einbürgerungstest" PDF into the 460 catalogue questions.
 *
 * The PDF is the authoritative source for the German question and answer text.
 * It does NOT mark the correct answers: every one of the 1800 checkboxes is the
 * same empty-box glyph. The answer key comes from data/answers.json instead.
 *
 * Layout notes, read off the actual file rather than assumed:
 *
 * - Checkboxes are Wingdings glyphs mapped into the private use area at U+F0A3.
 *   They decode to a string that `String.prototype.trim` does not clear, so an
 *   option line looks like it has no marker unless you test for the codepoint.
 * - The questions added in the 2025 revision use a literal U+25A1 WHITE SQUARE
 *   at x≈71 with the option text at x≈106, instead of U+F0A3 at x≈113 with the
 *   text at x≈143. Both layouts appear in the same file.
 * - Words are split across text runs separated by sub-point-wide spaces, so
 *   dropping "narrow" items welds words together ("Aufgabe16", "imInternet").
 *   Only zero-width items may be discarded.
 * - Five questions carry a photo credit line under the image, in the same
 *   column as the question text but a smaller font.
 */
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

/** The 16 state blocks follow Teil I in this order, 10 questions each. */
export const STATES = [
  'Baden-Württemberg', 'Bayern', 'Berlin', 'Brandenburg', 'Bremen', 'Hamburg',
  'Hessen', 'Mecklenburg-Vorpommern', 'Niedersachsen', 'Nordrhein-Westfalen',
  'Rheinland-Pfalz', 'Saarland', 'Sachsen', 'Sachsen-Anhalt',
  'Schleswig-Holstein', 'Thüringen',
];

/** Either checkbox glyph marks the start of an option. */
const CHECKBOX = /[□]/;

const collapse = (s) => s.replace(CHECKBOX, '').replace(/\s+/g, ' ').trim();

/** Groups a page's text items into visual lines, top to bottom, left to right. */
function linesOf(items) {
  const lines = [];
  for (const item of items) {
    if (!('str' in item)) continue;
    // Zero-width items are end-of-line markers; every other item carries ink,
    // including the sub-point spaces that separate words.
    if (item.str.trim() === '' && item.width === 0) continue;
    const x = item.transform[4];
    const y = item.transform[5];
    let line = lines.find((l) => Math.abs(l.y - y) < 3);
    if (!line) lines.push((line = { y, items: [] }));
    line.items.push({ x, str: item.str, box: CHECKBOX.test(item.str) });
  }
  lines.sort((a, b) => b.y - a.y);
  for (const line of lines) line.items.sort((a, b) => a.x - b.x);
  return lines;
}

/**
 * @param {Uint8Array} data the raw PDF
 * @returns {Promise<{stand: string, questions: object[]}>}
 */
export async function parseCatalogue(data) {
  const doc = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;
  const questions = [];
  const problems = [];
  let current = null;
  let state = null;
  let part = null;
  let stand = null;

  const finish = () => {
    if (current) questions.push(current);
    current = null;
  };

  for (let pageNo = 1; pageNo <= doc.numPages; pageNo++) {
    const page = await doc.getPage(pageNo);
    const { items } = await page.getTextContent();

    for (const line of linesOf(items)) {
      const marked = line.items.some((i) => i.box);
      const text = collapse(line.items.map((i) => i.str).join(''));
      const x = line.items.find((i) => !i.box)?.x ?? Infinity;
      if (!text) continue;
      if (/^Seite \d+ von \d+$/.test(text)) continue;
      // The caption row above a set of four option pictures.
      if (!marked && /^Bild 1 Bild 2 Bild 3 Bild 4$/.test(text)) continue;

      let match;
      if (!marked && (match = /^Stand: (\d{2}\.\d{2}\.\d{4})$/.exec(text))) {
        stand = match[1];
        continue;
      }
      if (!marked && /^Teil (I|II)$/.test(text)) {
        finish();
        part = text.slice(5);
        continue;
      }
      if (!marked && text === 'Allgemeine Fragen') {
        finish();
        state = null;
        continue;
      }
      if (!marked && (match = /^Fragen für das Bundesland (.+)$/.exec(text))) {
        finish();
        state = match[1].trim();
        if (!STATES.includes(state)) problems.push(`unknown state heading "${state}" on page ${pageNo}`);
        continue;
      }
      if (!marked && x < 100 && (match = /^Aufgabe\s*(\d+)$/.exec(text))) {
        finish();
        current = { part, state, aufgabe: Number(match[1]), text: '', options: [], credit: null };
        continue;
      }
      if (!current) {
        // The cover page, which carries the title and the Stand date.
        continue;
      }
      if (/^©/.test(text)) {
        current.credit = text;
      } else if (marked) {
        current.options.push(text);
      } else if (x < 100) {
        current.text = current.text ? `${current.text} ${text}` : text;
      } else {
        if (!current.options.length) {
          problems.push(`page ${pageNo}: indented text before any option: "${text}"`);
          continue;
        }
        current.options[current.options.length - 1] += ` ${text}`;
      }
    }
  }
  finish();

  for (const question of questions) {
    question.text = collapse(question.text);
    question.options = question.options.map(collapse);
  }

  if (problems.length) throw new Error(`catalogue layout not understood:\n  ${problems.join('\n  ')}`);
  if (!stand) throw new Error('no "Stand:" date found on the cover page');
  return { stand, questions };
}
