#!/usr/bin/env node
/**
 * Downloads telc's free B1 material from telc.net, derives the answer key of
 * Übungstest 1 from its PDF, and uploads everything to the PRIVATE Supabase
 * bucket `telc`. Nothing is written into the repository checkout: all files go
 * to a temporary directory ($RUNNER_TEMP on GitHub Actions) that is deleted at
 * the end. Run by .github/workflows/telc-upload.yml (manual trigger only).
 *
 *   node scripts/telc/upload.mjs --dry-run           download + parse, print a summary, upload nothing
 *   SUPABASE_SERVICE_ROLE_KEY=... node scripts/telc/upload.mjs
 *
 * Options:
 *   --dry-run          no upload, no key needed
 *   --work-dir <dir>   where to download/extract (default: $RUNNER_TEMP or the OS temp dir)
 *   --keep             keep the work dir afterwards (and reuse downloads already in it)
 *
 * Environment:
 *   SUPABASE_SERVICE_ROLE_KEY  required unless --dry-run; never printed
 *   SUPABASE_URL               optional, defaults to the app's project
 *   PDFJS_DIR                  optional directory whose node_modules holds pdfjs-dist
 *
 * Logs never contain file contents or answers: the repository (and with it the
 * workflow logs) is public.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { describeKey, ITEM_COUNT, parseAnswerKey } from './key-parser.mjs';

const DEFAULT_SUPABASE_URL = 'https://armhdiedsojtpcqknpjt.supabase.co';
const BUCKET = 'telc';
const TELC = 'https://www.telc.net/fileadmin/user_upload';
const PT = `${TELC}/Downloads_Verlag/Pruefungstraining_telc_Deutsch_B1`;

/** Verified with HEAD requests on 6 Nov 2026 (all 200). */
export const SOURCES = {
  mock: { url: `${TELC}/mock_exams/Deutsch/telc_deutsch_b1.zip`, file: 'telc_deutsch_b1.zip' },
  tracks: [
    { url: `${PT}/Audios/Pruefungstraining_telc_Deutsch_B1_Track_01-10.zip`, file: 'tracks_01-10.zip' },
    { url: `${PT}/Audios/Pruefungstraining_telc_Deutsch_B1_Track_11-20.zip`, file: 'tracks_11-20.zip' },
    { url: `${PT}/Audios/Pruefungstraining_telc_Deutsch_B1_Track_21-28.zip`, file: 'tracks_21-28.zip' },
  ],
  hoertexte: { url: `${PT}/Loesungen_Hoertexte/Pruefungstraining_telc_Deutsch_B1_Hoertexte.pdf`, file: 'Hoertexte.pdf' },
  loesungen: { url: `${PT}/Loesungen_Hoertexte/Pruefungstraining_telc_Deutsch_B1_Loesungen.pdf`, file: 'Loesungen.pdf' },
};
const EXPECTED_TRACKS = 28;

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

function fail(message, code = 1) {
  console.error(`✖ ${message}`);
  process.exit(code);
}

function parseArgs(argv) {
  const args = { dryRun: false, keep: false, workDir: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') args.dryRun = true;
    else if (a === '--keep') args.keep = true;
    else if (a === '--work-dir') args.workDir = argv[++i];
    else if (a === '--help' || a === '-h') {
      console.log('Usage: node scripts/telc/upload.mjs [--dry-run] [--work-dir <dir>] [--keep]');
      process.exit(0);
    } else fail(`Unknown option ${a}`, 2);
  }
  return args;
}

const inside = (child, parent) => {
  const rel = path.relative(parent, child);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
};

function resolveWorkDir(requested) {
  const dir = path.resolve(requested ?? path.join(process.env.RUNNER_TEMP || os.tmpdir(), 'telc-upload'));
  const forbidden = [REPO_ROOT, process.env.GITHUB_WORKSPACE].filter(Boolean).map((p) => path.resolve(p));
  for (const f of forbidden) {
    if (inside(dir, f)) fail(`Refusing to write telc files inside the repository checkout (${f}). Use a temp dir.`, 2);
  }
  return dir;
}

const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function download(source, dir, reuse) {
  const dest = path.join(dir, source.file);
  if (reuse && fs.existsSync(dest) && fs.statSync(dest).size > 0) {
    console.log(`  = ${source.file} (already downloaded, ${mb(fs.statSync(dest).size)})`);
    return dest;
  }
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(source.url, { headers: { 'user-agent': 'telc-b1-trainer-upload (personal study use)' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(dest, buf);
      console.log(`  ↓ ${source.file} (${mb(buf.length)})`);
      return dest;
    } catch (err) {
      if (attempt >= 3) fail(`Download failed: ${source.url} (${err.message})`);
      await sleep(2000 * attempt);
    }
  }
}

function unzip(zip, dir) {
  fs.mkdirSync(dir, { recursive: true });
  execFileSync('unzip', ['-o', '-q', zip, '-d', dir], { stdio: ['ignore', 'ignore', 'inherit'] });
}

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== '__MACOSX') out.push(...walk(p));
    } else out.push(p);
  }
  return out;
}

async function loadPdfjs() {
  const candidates = [];
  if (process.env.PDFJS_DIR) {
    candidates.push(path.join(process.env.PDFJS_DIR, 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.mjs'));
  }
  for (const file of candidates) {
    if (fs.existsSync(file)) return import(pathToFileURL(file).href);
  }
  try {
    return await import('pdfjs-dist/legacy/build/pdf.mjs');
  } catch {
    fail('pdfjs-dist not found. Install it outside the repo, e.g. `npm i --prefix "$RUNNER_TEMP/tools" pdfjs-dist@4.10.38` and set PDFJS_DIR to that directory.', 2);
  }
}

/** The text of every page, one pdfjs text item per line break, as the parser expects. */
export async function pdfPages(file) {
  const pdfjs = await loadPdfjs();
  const doc = await pdfjs.getDocument({ data: new Uint8Array(fs.readFileSync(file)), useSystemFonts: true, verbosity: 0 })
    .promise;
  const pages = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const content = await (await doc.getPage(p)).getTextContent();
    pages.push(content.items.map((i) => ('str' in i ? i.str + (i.hasEOL ? '\n' : '') : '')).join(''));
  }
  await doc.destroy();
  return pages;
}

function authHeaders(key) {
  // New-style secret keys (sb_secret_…) go in `apikey` only; legacy JWT keys also as Bearer.
  const headers = { apikey: key };
  if (key.startsWith('eyJ')) headers.authorization = `Bearer ${key}`;
  return headers;
}

async function upload(baseUrl, key, item) {
  const objectPath = item.path.split('/').map(encodeURIComponent).join('/');
  const url = `${baseUrl}/storage/v1/object/${BUCKET}/${objectPath}`;
  const body = item.buffer ?? fs.readFileSync(item.file);
  for (let attempt = 1; ; attempt++) {
    let status = 0;
    let text = '';
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { ...authHeaders(key), 'content-type': item.type, 'x-upsert': 'true', 'cache-control': '3600' },
        body,
      });
      status = res.status;
      if (res.ok) return;
      text = (await res.text()).slice(0, 300);
    } catch (err) {
      text = err.message;
    }
    if ((status && status < 500 && status !== 429) || attempt >= 3) {
      fail(`Upload of ${item.path} failed: ${status || 'network'} ${text}`);
    }
    await sleep(2000 * attempt);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!args.dryRun && !serviceKey) {
    fail('SUPABASE_SERVICE_ROLE_KEY is not set. Save it as a GitHub secret (see docs/BACKEND.md) or use --dry-run.', 2);
  }
  const baseUrl = (process.env.SUPABASE_URL?.trim() || DEFAULT_SUPABASE_URL).replace(/\/+$/, '');
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(baseUrl)) fail(`SUPABASE_URL looks wrong: ${baseUrl}`, 2);

  const work = resolveWorkDir(args.workDir);
  fs.mkdirSync(work, { recursive: true });
  const dl = path.join(work, 'downloads');
  const ex = path.join(work, 'extracted');
  fs.mkdirSync(dl, { recursive: true });
  fs.rmSync(ex, { recursive: true, force: true });
  console.log(`Work dir: ${work}${args.dryRun ? ' (dry run)' : ''}`);

  try {
    console.log('Downloading from telc.net …');
    const mockZip = await download(SOURCES.mock, dl, args.keep);
    const trackZips = [];
    for (const s of SOURCES.tracks) trackZips.push(await download(s, dl, args.keep));
    const hoertexte = await download(SOURCES.hoertexte, dl, args.keep);
    const loesungen = await download(SOURCES.loesungen, dl, args.keep);

    console.log('Extracting …');
    unzip(mockZip, path.join(ex, 'mock'));
    const mockFiles = walk(path.join(ex, 'mock'));
    const mockPdf = mockFiles.find((f) => /\.pdf$/i.test(f));
    const mockMp3 = mockFiles.find((f) => /\.mp3$/i.test(f));
    if (!mockPdf || !mockMp3) fail('The mock exam zip no longer contains one PDF and one MP3; check telc.net.');

    const tracks = new Map();
    trackZips.forEach((zip, i) => unzip(zip, path.join(ex, `tracks${i}`)));
    for (let i = 0; i < trackZips.length; i++) {
      for (const f of walk(path.join(ex, `tracks${i}`))) {
        const m = /track[_ -]?(\d{1,3})\.mp3$/i.exec(path.basename(f));
        if (m) tracks.set(Number(m[1]), f);
      }
    }
    if (tracks.size !== EXPECTED_TRACKS) console.warn(`! Expected ${EXPECTED_TRACKS} tracks, found ${tracks.size}.`);

    console.log('Reading the answer key from the Übungstest PDF …');
    const parsed = parseAnswerKey(await pdfPages(mockPdf));
    console.log(`  key: ${describeKey(parsed)}`);
    if (parsed.found !== ITEM_COUNT || parsed.invalid.length > 0) {
      fail('The answer key could not be read completely; nothing was uploaded.');
    }

    const plan = [
      { path: 'uebungstest-1/uebungstest-1.pdf', file: mockPdf, type: 'application/pdf' },
      { path: 'uebungstest-1/uebungstest-1.mp3', file: mockMp3, type: 'audio/mpeg' },
      {
        path: 'uebungstest-1/key.json',
        buffer: Buffer.from(JSON.stringify(parsed.key)),
        type: 'application/json',
      },
      { path: 'pruefungstraining/Hoertexte.pdf', file: hoertexte, type: 'application/pdf' },
      { path: 'pruefungstraining/Loesungen.pdf', file: loesungen, type: 'application/pdf' },
      ...[...tracks.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([n, file]) => ({ path: `pruefungstraining/Track_${String(n).padStart(2, '0')}.mp3`, file, type: 'audio/mpeg' })),
    ];
    const size = (item) => (item.buffer ? item.buffer.length : fs.statSync(item.file).size);
    const total = plan.reduce((a, item) => a + size(item), 0);

    console.log(`\n${plan.length} objects, ${mb(total)} → bucket "${BUCKET}" at ${baseUrl}`);
    for (const item of plan) console.log(`  ${item.path.padEnd(40)} ${mb(size(item)).padStart(8)}`);

    if (args.dryRun) {
      console.log('\nDry run: nothing uploaded.');
      return;
    }

    console.log('\nUploading (upsert) …');
    for (const item of plan) {
      await upload(baseUrl, serviceKey, item);
      console.log(`  ↑ ${item.path}`);
    }
    console.log(`\n✔ Uploaded ${plan.length} objects.`);
  } finally {
    if (!args.keep) fs.rmSync(work, { recursive: true, force: true });
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((err) => fail(err?.stack ?? String(err)));
}
