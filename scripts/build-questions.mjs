/**
 * Builds src/data/questions.json and public/images/* from the upstream
 * BAMF question catalogue shipped in @cemusta/burgertest (MIT).
 *
 * Run with `npm run data` after bumping that dependency.
 */
import { mkdir, readFile, writeFile, rm, readdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.join(import.meta.dirname, '..');
// The package blocks subpath resolution via "exports", so reach for the files directly.
const SRC = path.join(ROOT, 'node_modules', '@cemusta', 'burgertest', 'data');
const OUT_DATA = path.join(ROOT, 'src', 'data', 'questions.json');
const OUT_IMG = path.join(ROOT, 'public', 'images');

/**
 * Upstream labels questions 431-440 as "Sachsen" because it matches the state
 * name as a substring; they are the Sachsen-Anhalt block. The catalogue orders
 * the 16 state blocks alphabetically, 10 questions each, starting at 301.
 */
const STATES = [
  'Baden-Württemberg', 'Bayern', 'Berlin', 'Brandenburg', 'Bremen', 'Hamburg',
  'Hessen', 'Mecklenburg-Vorpommern', 'Niedersachsen', 'Nordrhein-Westfalen',
  'Rheinland-Pfalz', 'Saarland', 'Sachsen', 'Sachsen-Anhalt',
  'Schleswig-Holstein', 'Thüringen',
];

const stateForId = (id) => STATES[Math.floor((id - 301) / 10)];

/**
 * The catalogue groups the 300 general questions into three Themenbereiche.
 * The boundaries below were read off the catalogue's own ordering: 150 is the
 * last justice question and 151 opens the Nazi/DDR block; 220 is the last
 * remembrance question and 221 opens the Europe/society block.
 */
const TOPICS = [
  { id: 'politik', from: 1, to: 150 },
  { id: 'geschichte', from: 151, to: 220 },
  { id: 'gesellschaft', from: 221, to: 300 },
];

const topicForId = (id) => TOPICS.find((t) => id >= t.from && id <= t.to)?.id ?? 'bundesland';

/** A couple of upstream entries carry their own question number in the text. */
const stripNumberPrefix = (text, id) =>
  text.replace(new RegExp(`^\\s*${id}\\.\\s+`), '').trim();

/**
 * Words that lost their spaces upstream. Each fix is applied only where the
 * broken text is still present, so the build keeps working once the source is
 * corrected; `npm run data` reports any fix that has become unnecessary.
 */
const TEXT_FIXES = [
  { id: 14, from: 'meine Meinung imInternetäußern kann.', to: 'meine Meinung im Internet äußern kann.' },
  {
    id: 14,
    from: 'Nazi-, Hamas- oder Islamischer Staat-Symbole öffentlichtragen darf.',
    to: 'Nazi-, Hamas- oder Islamischer Staat-Symbole öffentlich tragen darf.',
  },
];

function applyTextFixes(questions) {
  const unused = [];
  for (const fix of TEXT_FIXES) {
    const q = questions.find((x) => x.id === fix.id);
    const index = q ? q.options.indexOf(fix.from) : -1;
    if (index === -1) unused.push(fix);
    else q.options[index] = fix.to;
  }
  console.log(`text fixes: ${TEXT_FIXES.length - unused.length} applied, ${unused.length} no longer needed`);
  for (const fix of unused) console.log(`  - question ${fix.id}: upstream no longer has "${fix.from}"`);
}

async function optimiseImages(refs) {
  await rm(OUT_IMG, { recursive: true, force: true });
  await mkdir(OUT_IMG, { recursive: true });
  const map = new Map();
  let before = 0;
  let after = 0;
  for (const ref of refs) {
    const from = path.join(SRC, ref);
    const name = path.basename(ref, path.extname(ref)) + '.webp';
    const to = path.join(OUT_IMG, name);
    const input = await readFile(from);
    const out = await sharp(input)
      .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    await writeFile(to, out);
    before += input.length;
    after += out.length;
    map.set(ref, `images/${name}`);
  }
  const mb = (n) => (n / 1024 / 1024).toFixed(1) + ' MB';
  console.log(`images: ${map.size} files, ${mb(before)} -> ${mb(after)}`);
  return map;
}

const raw = JSON.parse(await readFile(path.join(SRC, 'questions.json'), 'utf8'));
if (raw.length !== 460) throw new Error(`expected 460 questions, got ${raw.length}`);

const imageRefs = [...new Set(raw.flatMap((q) => (Array.isArray(q.image) ? q.image : q.image ? [q.image] : [])))];
const imageMap = await optimiseImages(imageRefs);

const questions = raw.map((q) => {
  const images = (Array.isArray(q.image) ? q.image : q.image ? [q.image] : []).map((r) => imageMap.get(r));
  const isState = q.type === 'state';
  const out = {
    id: q.id,
    state: isState ? stateForId(q.id) : null,
    topic: topicForId(q.id),
    text: stripNumberPrefix(q.text, q.id),
    options: ['a', 'b', 'c', 'd'].map((k) => q.options[k]),
    answer: ['a', 'b', 'c', 'd'].indexOf(q.correctAnswer),
    en: {
      text: stripNumberPrefix(q.translations.en.text, q.id),
      options: ['a', 'b', 'c', 'd'].map((k) => q.translations.en.options[k]),
      context: q.translations.en.context ?? null,
    },
  };
  // A single image illustrates the question; four images illustrate the options.
  if (images.length === 1) out.image = images[0];
  else if (images.length > 1) out.optionImages = images;
  if (q.imageText) out.imageCredit = q.imageText;
  return out;
});

applyTextFixes(questions);

for (const q of questions) {
  if (q.answer < 0) throw new Error(`question ${q.id} has no correct answer`);
  if (q.options.length !== 4 || q.options.some((o) => !o)) throw new Error(`question ${q.id} has bad options`);
  if (q.optionImages && q.optionImages.length !== 4) throw new Error(`question ${q.id} has ${q.optionImages.length} option images`);
  if (/^\s*\d+\.\s/.test(q.text)) throw new Error(`question ${q.id} still carries a number prefix`);
  // Catches words that ran together, the way "imInternetäußern" did.
  for (const text of [q.text, ...q.options]) {
    const join = text.match(/[a-zäöüß][A-ZÄÖÜ][a-zäöüß]/);
    if (join) throw new Error(`question ${q.id} has a missing space near "${join[0]}" in: ${text}`);
  }
}

const perTopic = {};
for (const q of questions) perTopic[q.topic] = (perTopic[q.topic] ?? 0) + 1;
console.log('topics:', JSON.stringify(perTopic));

const perState = {};
for (const q of questions.filter((q) => q.state)) perState[q.state] = (perState[q.state] ?? 0) + 1;
const wrong = Object.entries(perState).filter(([, n]) => n !== 10);
if (Object.keys(perState).length !== 16 || wrong.length) {
  throw new Error(`expected 16 states x 10 questions, got ${JSON.stringify(perState)}`);
}

await mkdir(path.dirname(OUT_DATA), { recursive: true });
await writeFile(OUT_DATA, JSON.stringify(questions));
const kb = (Buffer.byteLength(JSON.stringify(questions)) / 1024).toFixed(0);
console.log(`questions: ${questions.length} (${kb} kB), ${Object.keys(perState).length} states`);
console.log(`orphan images: ${(await readdir(OUT_IMG)).length - imageMap.size}`);
