/**
 * Builds src/data/questions.json from the official BAMF catalogue.
 *
 * Sources, in order of authority:
 *
 * 1. The BAMF "Gesamtfragenkatalog" PDF — the German question and answer text.
 *    Downloaded from bamf.de (cached under .cache/) and parsed by
 *    scripts/parse-catalogue.mjs. This is the only source of truth for German.
 * 2. data/answers.json — the correct-answer key. The PDF does not mark correct
 *    answers anywhere, so the key is carried here; see that file's own notes
 *    for where it comes from and how it was checked.
 * 3. data/translations.json — the English text, written for this app, since
 *    BAMF publishes the catalogue in German only.
 *
 * Images are not generated here. public/images/ is committed, and a question's
 * pictures are matched by filename: qN.webp illustrates question N, and
 * qN_1..qN_4.webp illustrate its four options.
 *
 * Run with `npm run data`. Pass --pdf <path> to build from a local file and
 * --offline to require the cached download.
 */
import { mkdir, readFile, writeFile, readdir, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { parseCatalogue, STATES } from './parse-catalogue.mjs';

const ROOT = path.join(import.meta.dirname, '..');
const CACHE = path.join(ROOT, '.cache', 'gesamtfragenkatalog.pdf');
const OUT_DATA = path.join(ROOT, 'src', 'data', 'questions.json');
const IMAGES = path.join(ROOT, 'public', 'images');

const CATALOGUE_URL =
  'https://www.bamf.de/SharedDocs/Anlagen/DE/Integration/Einbuergerung/gesamtfragenkatalog-lebenindeutschland.pdf?__blob=publicationFile&v=23';

/**
 * The edition this data was built and translated against. BAMF revises the
 * catalogue and reuses the same URL, so a different Stand date means questions
 * may have been added, dropped or reworded: the translations and the answer key
 * both need reviewing before it can be accepted. Failing here is the point.
 */
const EXPECTED_STAND = '07.05.2025';

const stateForId = (id) => STATES[Math.floor((id - 301) / 10)];

/**
 * The 300 general questions are split into three topics for the practice modes.
 *
 * These boundaries are ours, read off where the catalogue's subject matter
 * visibly changes. The PDF carries no Themenbereich headings at all — its only
 * structure is "Teil I / Allgemeine Fragen" and "Teil II / Fragen für das
 * Bundesland X" — so there is nothing official to check them against.
 */
const TOPICS = [
  { id: 'politik', from: 1, to: 150 },
  { id: 'geschichte', from: 151, to: 220 },
  { id: 'gesellschaft', from: 221, to: 300 },
];

const topicForId = (id) => TOPICS.find((t) => id >= t.from && id <= t.to)?.id ?? 'bundesland';

/**
 * Questions 184 and 206 carry their own catalogue number in the question text
 * in the official PDF. Stripping it is a correction to BAMF's own file, so it
 * is applied by number and the build fails below if the prefix ever survives.
 */
const stripNumberPrefix = (text, id) => text.replace(new RegExp(`^\\s*${id}\\.\\s+`), '').trim();

async function loadPdf() {
  const args = process.argv.slice(2);
  const explicit = args.indexOf('--pdf');
  if (explicit >= 0) return readFile(args[explicit + 1]);

  try {
    const cached = await readFile(CACHE);
    console.log(`catalogue: ${CACHE} (cached, ${(cached.length / 1e6).toFixed(1)} MB)`);
    return cached;
  } catch {
    if (args.includes('--offline')) throw new Error(`--offline given but ${CACHE} is missing`);
  }

  console.log(`catalogue: downloading ${CATALOGUE_URL}`);
  const response = await fetch(CATALOGUE_URL);
  if (!response.ok) throw new Error(`download failed: ${response.status} ${response.statusText}`);
  const body = Buffer.from(await response.arrayBuffer());
  await mkdir(path.dirname(CACHE), { recursive: true });
  await writeFile(CACHE, body);
  console.log(`catalogue: ${(body.length / 1e6).toFixed(1)} MB, sha256 ${createHash('sha256').update(body).digest('hex')}`);
  return body;
}

/** Maps question id to its pictures, from what is actually committed. */
async function imagesById() {
  const files = new Set(await readdir(IMAGES));
  const map = new Map();
  for (const file of files) {
    const single = /^q(\d+)\.webp$/.exec(file);
    if (single) {
      const id = Number(single[1]);
      map.set(id, { ...map.get(id), image: `images/${file}` });
      continue;
    }
    const option = /^q(\d+)_([1-4])\.webp$/.exec(file);
    if (!option) throw new Error(`unexpected file in public/images: ${file}`);
    const id = Number(option[1]);
    const entry = map.get(id) ?? {};
    entry.optionImages = entry.optionImages ?? [];
    entry.optionImages[Number(option[2]) - 1] = `images/${file}`;
    map.set(id, entry);
  }
  return map;
}

const pdf = await loadPdf();
const { stand, questions: catalogue } = await parseCatalogue(new Uint8Array(pdf));
console.log(`catalogue: Stand ${stand}, ${catalogue.length} questions`);
if (stand !== EXPECTED_STAND) {
  throw new Error(
    `catalogue is Stand ${stand}, this build targets ${EXPECTED_STAND}. ` +
    'Re-check data/answers.json and data/translations.json against the new edition, ' +
    'then update EXPECTED_STAND.',
  );
}
if (catalogue.length !== 460) throw new Error(`expected 460 questions, got ${catalogue.length}`);

const answers = JSON.parse(await readFile(path.join(ROOT, 'data', 'answers.json'), 'utf8'));
const translations = JSON.parse(await readFile(path.join(ROOT, 'data', 'translations.json'), 'utf8'));
const pictures = await imagesById();

const questions = catalogue.map((source, index) => {
  const id = index + 1;
  const isState = source.part === 'II';
  const answer = answers.answers[id];
  const en = translations.translations[id];
  if (answer === undefined) throw new Error(`question ${id} has no answer in data/answers.json`);
  if (!en) throw new Error(`question ${id} has no entry in data/translations.json`);

  const out = {
    id,
    state: isState ? stateForId(id) : null,
    topic: topicForId(id),
    text: stripNumberPrefix(source.text, id),
    options: source.options,
    answer,
    en: { text: en.text, options: en.options, context: en.context ?? null },
  };
  const picture = pictures.get(id);
  if (picture?.image) out.image = picture.image;
  if (picture?.optionImages) out.optionImages = picture.optionImages;
  if (source.credit) out.imageCredit = source.credit;
  return out;
});

for (const q of questions) {
  if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) {
    throw new Error(`question ${q.id} has no correct answer`);
  }
  if (q.options.length !== 4 || q.options.some((o) => !o)) throw new Error(`question ${q.id} has bad options`);
  if (q.en.options.length !== 4 || q.en.options.some((o) => !o)) throw new Error(`question ${q.id} has bad English options`);
  if (!q.en.text) throw new Error(`question ${q.id} has no English text`);
  if (q.optionImages && q.optionImages.length !== 4) {
    throw new Error(`question ${q.id} has ${q.optionImages.length} option images`);
  }
  if (/^\s*\d+\.\s/.test(q.text)) throw new Error(`question ${q.id} still carries a number prefix`);
  // Catches words that ran together, the way "imInternetäußern" did.
  for (const text of [q.text, ...q.options]) {
    const join = text.match(/[a-zäöüß][A-ZÄÖÜ][a-zäöüß]/);
    if (join) throw new Error(`question ${q.id} has a missing space near "${join[0]}" in: ${text}`);
  }
}

const state = questions.filter((q) => q.state).length;
const perState = {};
for (const q of questions.filter((q) => q.state)) perState[q.state] = (perState[q.state] ?? 0) + 1;
const wrong = Object.entries(perState).filter(([, n]) => n !== 10);
if (Object.keys(perState).length !== 16 || wrong.length || state !== 160) {
  throw new Error(`expected 16 states x 10 questions, got ${JSON.stringify(perState)}`);
}

const perTopic = {};
for (const q of questions) perTopic[q.topic] = (perTopic[q.topic] ?? 0) + 1;
console.log('topics:', JSON.stringify(perTopic));

const withPictures = questions.filter((q) => q.image || q.optionImages).length;
const used = questions.reduce((n, q) => n + (q.image ? 1 : 0) + (q.optionImages?.length ?? 0), 0);
console.log(`images: ${used} files on ${withPictures} questions, ${(await readdir(IMAGES)).length - used} unused`);

await mkdir(path.dirname(OUT_DATA), { recursive: true });
const json = JSON.stringify(questions);
await writeFile(OUT_DATA, json);
console.log(`questions: ${questions.length} (${(Buffer.byteLength(json) / 1024).toFixed(0)} kB), 16 states`);
