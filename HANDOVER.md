# Handover

State of this branch as of 17 September 2026, written for whoever picks the
work up next. Everything described here is committed and pushed.

- **Branch:** `claude/einbuergerungstest-app-25gcw6`
- **Commits:** `cb2f7ee` (the app), `a969974` (answer tracking and recommendations)
- **Working tree:** clean, in sync with origin
- **No pull request has been opened.** The user has not asked for one; do not
  open one unprompted.

---

## 1. The one open item

**The question data has never been checked against the official BAMF
catalogue.** This is the only outstanding task, and the user cares about it.

Everything in `src/data/questions.json` came from the npm package
`@cemusta/burgertest` (MIT), not from BAMF directly. This environment's egress
policy allows only package registries and Anthropic APIs, so `www.bamf.de` is
refused at CONNECT (403) — by `curl` and by the `WebFetch` tool alike. The
official source was therefore never reached.

What the data *does* evidence, which is why it is probably current but not
certainly so:

- 13 questions on Jewish life, Israel and antisemitism (#111, #118, #149,
  #184, #288 among them), the block added by the June 2024 citizenship-law
  reform — so it is not a pre-2024 catalogue
- "Wie viele Mitgliedstaaten hat die EU heute?" → 27 (post-Brexit)
- "Wie viele Einwohner hat Deutschland?" → 84 Millionen (the newer figure)
- Structure is exactly official: 300 general + 16 × 10 state = 460

What is thin: the upstream package is version `0.1.0` with no README, no
changelog and nothing stating which edition of the catalogue it captured. The
answer spot-checks that were done covered roughly a dozen questions, not 460.

### How to close it

Either route works; the second needs no policy change.

1. **Egress opened.** The user was told to change the environment's network
   policy in claude.ai/code to allow `www.bamf.de`, and that a new session is
   needed for it to take effect. Sources:
   - [Gesamtfragenkatalog](https://www.bamf.de/SharedDocs/Anlagen/DE/Integration/Einbuergerung/gesamtfragenkatalog-lebenindeutschland.html?nn=282388) (the PDF carries a *Stand* date)
   - [Interaktiver Fragenkatalog](https://www.bamf.de/SharedDocs/Links/DE/O/oet-bamf-interaktiv_einbuergerungstest_fragenkatalog.html?nn=282388)
2. **Local PDF.** The user drops the Gesamtfragenkatalog PDF into the repo and
   it is parsed from disk. No network needed at all.

Then: diff all 460 question texts and correct answers against
`src/data/questions.json`, report every divergence, and fold the corrections
plus the catalogue's *Stand* date into `scripts/build-questions.mjs` so the
check is repeatable.

**A PDF parser was deliberately not written in advance.** The document's
internal layout has never been seen, so a parser written blind is likely
wasted work. Look at the file first, then write it once.

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
`@cemusta/burgertest`. The generated files are committed, so a plain build
never needs the script. It corrects three upstream defects:

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

1. **Verify against BAMF** — section 1. Everything else is optional.
2. **Confirm the topic boundaries** against the official Themenbereiche while
   doing so.
3. **Bundle size.** 469 kB raw / 134 kB gzipped, mostly the inlined 296 kB of
   question JSON. Fine for a study app that then works offline; worth lazy
   loading only if the first paint ever becomes a complaint.
4. **No `CLAUDE.md`** exists. If conventions keep recurring, that is where the
   `.ts`-extension rule and the data-guard rule belong.
5. **Deployment.** `dist/` is plain static output. No CI or Pages workflow was
   added, deliberately — publishing is an outward-facing action the user has
   not asked for.
