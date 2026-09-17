# Handover

State of this branch as of 17 September 2026, written for whoever picks the
work up next. Everything described here is committed and pushed.

Section 1 describes the data-source change and what it turned up; the rest is
background on the app.

- **Branch:** `claude/einbuergerungstest-app-25gcw6`
- **Commits:** `cb2f7ee` (the app), `a969974` (answer tracking and recommendations)
- **Working tree:** clean, in sync with origin
- **No pull request has been opened.** The user has not asked for one; do not
  open one unprompted.

---

## 1. Done: the data source is now the official BAMF catalogue

`src/data/questions.json` is built from the official **Gesamtfragenkatalog**
PDF (Stand 07.05.2025), and `@cemusta/burgertest` is gone from
`devDependencies`, along with `sharp`. See the README for how the pipeline
works day to day; what follows is what the change turned up.

**The German text already matched.** Parsed out of the PDF and diffed against
what the npm package had produced, all 1840 options and 458 of the 460
question texts were byte-identical, as were the 16 state assignments and the
five photo credits. The only two divergences were questions 184 and 206, where
BAMF's own file leaves the catalogue number in the question text; the build
strips it, as before. So the previous data was a faithful copy — the change is
about provenance, not content.

**The PDF marks no correct answers.** Every one of its 1800 checkboxes is the
same empty-box glyph and there is no solutions section, so the answer key
cannot come from the catalogue. It lives in `data/answers.json` instead.
Reviewing all 460 turned up **three wrong answers** inherited from the npm
package, now corrected: question 5 (free elections), 71 (where the Chancellor
mostly is) and 184 (the legal basis for Israel's founding). That file records
how the key was checked, including against BAMF's interactive Fragenkatalog.

**English is ours.** `data/translations.json` carries the text, the four
options and the explanation for all 460 questions, written here from the
authoritative German. Nothing is inherited from the package, and per the user's
instruction the translations are not labelled unofficial.

**Images stayed as they were.** The user chose to keep the committed WebP files
rather than re-extract from the PDF, so `public/images/` is unchanged and is no
longer generated. A question finds its pictures by filename. (For the record,
the PDF's images are extractable at 1200x800 and better, if that is ever
wanted.)

**Parser gotchas**, all learned the hard way and documented in
`scripts/parse-catalogue.mjs`: checkboxes are Wingdings glyphs at U+F0A3 that
`trim()` does not clear; the questions added in 2025 use a literal U+25A1 in a
different column; and dropping sub-point-wide space runs is what welds words
together, which is almost certainly where `imInternetäußern` came from.

**If BAMF publishes a new edition**, the build fails on purpose: it compares
the PDF's *Stand* date against `EXPECTED_STAND`. Re-check the answer key and
the translations against the new text before bumping it.

---

## 2. What the app is

A static React + TypeScript app (Vite) for practising the German citizenship
test. No backend, no accounts, no tracking; progress lives in `localStorage`.
See `README.md` for the user-facing feature list.

```bash
npm install
npm run dev        # dev server
npm test           # 49 tests, node:test with --experimental-strip-types
npm run typecheck
npm run build      # static output in dist/
npm run data       # rebuild question data from the official BAMF PDF
```

Node 22 is required — the tests import `.ts` files directly and rely on type
stripping. **All relative imports carry explicit `.ts`/`.tsx` extensions** so
the same modules resolve under both Vite and bare Node; keep that convention
or the test suite stops resolving.

### Layout

| Path | Role |
|---|---|
| `src/lib/questions.ts` | loads the data, exposes `catalogueFor(state)` |
| `src/lib/exam.ts` | official exam rules: 30 + 3 questions, 60 min, pass at 17 |
| `src/lib/srs.ts` | Leitner boxes, answer history, `strength()` |
| `src/lib/insights.ts` | summaries, topic strength, streaks, `recommend()` |
| `src/lib/storage.ts` | `localStorage` store + migration of older saves |
| `src/lib/i18n.ts` | every user-facing string, DE and EN |
| `src/components/` | one file per screen, plus `QuestionView` and `Strength` |
| `scripts/parse-catalogue.mjs` | reads the BAMF PDF into 460 questions |
| `scripts/build-questions.mjs` | the data pipeline (see below) |
| `data/answers.json` | the correct-answer key, with its provenance |
| `data/translations.json` | the English text and explanations |

---

## 3. Decisions worth knowing before changing things

**460 vs 310.** The catalogue holds 460 questions, but any one candidate is
examined only on the 300 general questions plus the 10 for their own
Bundesland — 310. Every progress figure in the UI is scoped to those 310. The
home headline deliberately avoids naming 460 because an earlier version said
"Alle 460 amtlichen Fragen üben" above a counter reading `/310`, which the
user flagged as contradictory.

**The catalogue browser is also scoped to 310**, so other states' questions
cannot currently be read. That was deliberate, to keep "310" meaning one
thing everywhere. The user was told and offered the alternative; they have
not asked for it. Do not change it unprompted.

**Topic boundaries are derived from content, and cannot be otherwise.**
`scripts/build-questions.mjs` splits the 300 general questions at 1–150
(Politik), 151–220 (Geschichte), 221–300 (Gesellschaft), read off where the
catalogue's subject matter visibly changes. The PDF carries no Themenbereich
headings at all, so there is nothing official to check this against. It is our
editorial choice; say so if it is ever questioned.

**Topic strength rates only the questions already practised in a topic**, with
coverage reported separately. An earlier version averaged over every question
in the topic, which made the largest topic look weakest and skewed the
weakest-topic recommendation toward whichever topic had the most questions.
`test/insights.test.ts` has a test that fails if this regresses — do not
"simplify" it back.

**Explanations are English-only.** `data/translations.json` carries
`en.context` and no German equivalent, so the German UI labels them
"Erklärung (EN)" rather than pretending otherwise. Writing German ones is a
reasonable future job; it means 460 more short texts.

---

## 4. The data pipeline

`npm run data` rebuilds `src/data/questions.json` from three inputs: the BAMF
PDF (German text, downloaded and cached under `.cache/`), `data/answers.json`
(the key) and `data/translations.json` (the English). `public/images/` is
committed and no longer generated. The README has the day-to-day commands.

The validation is the point of the script, so keep it. It throws if the
catalogue stops being 460 questions with 16 × 10 state questions, if an answer
or a translation is missing, if a question text still carries its own number,
if any text has words running together — the `imInternetäußern` class of bug —
or if the PDF's *Stand* date is not the one the data was built against. Do not
loosen a guard to make an update pass; the guard is what makes an update safe.

Two corrections to BAMF's own file survive in the pipeline, both applied by
number and both covered by a guard: questions 184 and 206 carry their catalogue
number inside the question text, and the build strips it.

## 5. How this was verified

- 49 tests (`npm test`): data integrity 9, exam rules 4, Leitner 6, strength
  10, insights 15, storage migration 5.
- The built app was driven in Chromium via Playwright for each change: full
  33-question exam through scoring and review, all four practice modes,
  keyboard answering, catalogue filters, both language and theme toggles,
  reload persistence, offline reload, and 320px layout.

**Playwright is not a dependency.** It was installed ad hoc for those runs and
uninstalled again, so `package.json` stays honest about what the app needs.
Chromium is at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome` in this
environment (the bare `chromium` path is a directory, not the binary); launch
with `executablePath` and never run `playwright install`. Note that headless
Chromium does **not** trust the session's egress-proxy CA, so it cannot reach
external https hosts — fine for driving the local dev server, useless for
scraping. `curl` trusts the CA and works. If browser checks become
routine, adding Playwright as a devDependency with committed specs would be a
reasonable change — ask first, it widens the toolchain.

---

## 6. Loose ends, in rough priority order

1. ~~Switch to the official BAMF source~~ — done, see section 1.
2. **Topic boundaries cannot be confirmed against BAMF.** The PDF carries no
   Themenbereich headings at all: its only structure is "Teil I / Allgemeine
   Fragen" and "Teil II / Fragen für das Bundesland X". The 1–150 / 151–220 /
   221–300 split is ours and there is nothing official to check it against.
3. **Bundle size.** 437 kB raw / 120 kB gzipped, mostly the inlined 262 kB of
   question JSON. Fine for a study app that then works offline; worth lazy
   loading only if the first paint ever becomes a complaint.
4. **No `CLAUDE.md`** exists. If conventions keep recurring, that is where the
   `.ts`-extension rule and the data-guard rule belong.
5. **Deployment.** `dist/` is plain static output. No CI or Pages workflow was
   added, deliberately — publishing is an outward-facing action the user has
   not asked for.
