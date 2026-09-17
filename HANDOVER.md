# Handover

State of this branch as of 17 September 2026, written for whoever picks the
work up next. Everything described here is committed and pushed.

**Start at section 1** — it is a live task with decisions already made, not
background reading.

- **Branch:** `claude/einbuergerungstest-app-25gcw6`
- **Commits:** `cb2f7ee` (the app), `a969974` (answer tracking and recommendations)
- **Working tree:** clean, in sync with origin
- **No pull request has been opened.** The user has not asked for one; do not
  open one unprompted.

---

## 1. The task: replace the data source with the official BAMF catalogue

`src/data/questions.json` is currently generated from the npm package
`@cemusta/burgertest`, an unvetted third party. **The user wants the official
BAMF catalogue used instead, and the npm package removed as a dependency.**

That work could not be done in the session that wrote this note: its egress
policy allowed only package registries and Anthropic APIs, so `www.bamf.de`
was refused at CONNECT (403) by `curl` and by the `WebFetch` tool alike. **The
user has since opened egress in the session reading this.** Verify that first:

```bash
curl -sS -o /dev/null -w "%{http_code}\n" --max-time 15 https://www.bamf.de/
```

Sources:

- [Gesamtfragenkatalog](https://www.bamf.de/SharedDocs/Anlagen/DE/Integration/Einbuergerung/gesamtfragenkatalog-lebenindeutschland.html?nn=282388) — the PDF, which carries a *Stand* date
- [Interaktiver Fragenkatalog](https://www.bamf.de/SharedDocs/Links/DE/O/oet-bamf-interaktiv_einbuergerungstest_fragenkatalog.html?nn=282388)

### Decisions the user has already made

- **German questions and answers come from BAMF.** That is the authoritative
  content; nothing else may be the source of truth for it.
- **English translations are written by us**, since BAMF publishes the
  catalogue in German only. All 460 questions plus their four options each.
- **Do not label the translations as unofficial.** The user asked for this
  explicitly. The existing "Erklärung (EN)" marker is a *language* marker, not
  a disclaimer, and can stay.

### Plan

1. Fetch the PDF. **Read its actual structure before writing any parser** — no
   parser was written in advance precisely because the layout had never been
   seen, and one written blind is likely wasted work. Record the *Stand* date.
2. Extract question number, text, the four options and the marked correct
   answer. `pdfjs-dist` from npm is fine here: it is a build tool, not a
   content source.
3. Diff against the current `src/data/questions.json` and **report every
   divergence to the user before overwriting anything.** If the two agree, that
   is itself the answer to the question the user has been asking — say so
   plainly. If they differ, the BAMF text wins.
4. Write the English translations from the authoritative German text. Do this
   *after* step 3, so nothing is translated from text that then changes.
5. Rework `scripts/build-questions.mjs` to build from the PDF plus the
   translation file, and remove `@cemusta/burgertest` from `devDependencies`.
6. Surface the *Stand* date in the app (the footer already carries the source
   note) and in the README.

### Open point for the user

The per-question explanations (`en.context`, shown under each answer in
practice and review) also come from the npm package, and BAMF publishes no
equivalent. Dropping the package removes them too. The user was not asked
about these specifically — only about translations. **Ask before deciding.**
The options are to write fresh explanations for all 460, or to drop the
feature; silently losing it would be a regression, and silently keeping the
package would contradict the instruction to remove it.

### Images

The 100 catalogue images (coats of arms, flags, ballot papers) currently come
from the npm package too, already downscaled from 35 MB of PNG to 2.8 MB of
WebP in `public/images/`. If they can be extracted from the official PDF at
usable quality, do that; if not, raise it with the user rather than quietly
keeping the package for images alone.

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
npm run data       # regenerate question data + images from the npm package
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
| `scripts/build-questions.mjs` | the data pipeline (see below) |

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

**Topic boundaries are derived from content, not from official headings.**
`scripts/build-questions.mjs` splits the 300 general questions at 1–150
(Politik), 151–220 (Geschichte), 221–300 (Gesellschaft), read off where the
catalogue's subject matter visibly changes. This was never checked against
BAMF's own Themenbereich headings — worth confirming during the data
verification above.

**Topic strength rates only the questions already practised in a topic**, with
coverage reported separately. An earlier version averaged over every question
in the topic, which made the largest topic look weakest and skewed the
weakest-topic recommendation toward whichever topic had the most questions.
`test/insights.test.ts` has a test that fails if this regresses — do not
"simplify" it back.

**Explanations are English-only.** The upstream data carries `en.context` and
no German equivalent, so the German UI labels them "Erklärung (EN)" rather
than pretending otherwise.

---

## 4. The data pipeline

`npm run data` rebuilds `src/data/questions.json` and `public/images/` from
`@cemusta/burgertest`. **This is what section 1 replaces.** The generated files
are committed, so a plain build never needs the script.

The normalisation and validation in this script stay useful whatever the
source: keep them when rewiring the input. It corrects three upstream defects
that may or may not exist in the official PDF — check each against it:

1. Questions 431–440 were labelled `"Sachsen"` by a substring match; they are
   the Sachsen-Anhalt block. Left alone, Sachsen had 20 questions and
   Sachsen-Anhalt none.
2. Questions 184 and 206 carried their own catalogue number in the text.
3. Question 14 had two run-together answers (`imInternetäußern`,
   `öffentlichtragen`). Fixed via the `TEXT_FIXES` table, which reports any
   fix that upstream has since made unnecessary rather than failing.

The script **throws** if the catalogue stops being 460 questions with 16 × 10
state questions, if an answer index is missing, or if any text has words
running together. Those guards are the point — do not loosen them to make a
data update pass.

---

## 5. How this was verified

- 49 tests (`npm test`): data integrity 9, exam rules 4, Leitner 6, strength
  10, insights 15, storage migration 5.
- The built app was driven in Chromium via Playwright for each change: full
  33-question exam through scoring and review, all four practice modes,
  keyboard answering, catalogue filters, both language and theme toggles,
  reload persistence, offline reload, and 320px layout.

**Playwright is not a dependency.** It was installed ad hoc for those runs and
uninstalled again, so `package.json` stays honest about what the app needs.
Chromium is at `/opt/pw-browsers/chromium` in this environment; launch with
`executablePath` and never run `playwright install`. If browser checks become
routine, adding Playwright as a devDependency with committed specs would be a
reasonable change — ask first, it widens the toolchain.

---

## 6. Loose ends, in rough priority order

1. **Switch to the official BAMF source** — section 1. This is the live task;
   everything below is optional.
2. **Confirm the topic boundaries** against the official Themenbereich
   headings in the PDF, which was impossible without access to it.
3. **Bundle size.** 469 kB raw / 134 kB gzipped, mostly the inlined 296 kB of
   question JSON. Fine for a study app that then works offline; worth lazy
   loading only if the first paint ever becomes a complaint.
4. **No `CLAUDE.md`** exists. If conventions keep recurring, that is where the
   `.ts`-extension rule and the data-guard rule belong.
5. **Deployment.** `dist/` is plain static output. No CI or Pages workflow was
   added, deliberately — publishing is an outward-facing action the user has
   not asked for.
