# Plan: replace the app with a telc Deutsch B1 trainer

Agreed with the user on 6 November 2026. Nothing below is built yet. The next
session starts here. Read this file in full before writing code, then
`HANDOVER.md` for how the current app (and its pipeline) works.

## Decisions already made

| Question | Decision |
|---|---|
| Which exam | **telc Deutsch B1 / Zertifikat Deutsch**, not DTZ |
| What happens to the Einbürgerungstest app | **Replaced at the same link** (`claudiocapr.github.io/einbugerungstest/`). It stays in git history and at the Claude Artifact link `claude.ai/artifact/FbyuDSgtB5b1WDiF5wkW5o` |
| Feedback on writing and speaking | **Self-check** against telc's criteria plus model answers. No AI correction |
| Private telc material and progress sync | **Supabase** (login, progress table, private storage bucket). SQLite in the repo was ruled out: GitHub Pages cannot accept writes, and committing progress needs a write token in the browser |
| Progress across devices | **Yes, sync it** for the owner's account. Friends use the app without an account; their progress stays on their own devices |

## The exam (from telc's official Übungstest 1, read directly)

Source: `https://www.telc.net/fileadmin/user_upload/mock_exams/Deutsch/telc_deutsch_b1.zip`
(PDF `telc_deutsch_b1_zd_uebungstest_1.pdf` + MP3), pages "Testformat" and
"Punkte und Gewichtung".

| Subtest | Teil | Task type | Items | Points |
|---|---|---|---|---|
| Leseverstehen (90 min, with Sprachbausteine) | 1 | Globalverstehen: match headlines to texts | 5 | 25 |
| | 2 | Detailverstehen: multiple choice a/b/c | 5 | 25 |
| | 3 | Selektives Verstehen: match situations to ads | 10 | 25 |
| Sprachbausteine | 1 | Grammar, multiple choice a/b/c in a letter | 10 | 15 |
| | 2 | Vocabulary, fill 10 gaps from a list | 10 | 15 |
| Hörverstehen (~30 min) | 1 | Global, richtig/falsch | 5 | 25 |
| | 2 | Detail, richtig/falsch | 10 | 25 |
| | 3 | Selective, richtig/falsch | 5 | 25 |
| Schriftlicher Ausdruck (30 min) | – | Informal or semi-formal e-mail covering 4 Leitpunkte | 1 | 45 |
| Mündlicher Ausdruck (~15 min, pairs, 20 min prep) | 1 | Einander kennenlernen (~3 min) | – | 15 |
| | 2 | Über ein Thema sprechen (~6 min) | – | 30 |
| | 3 | Gemeinsam etwas planen (~6 min) | – | 30 |

Written total 225, oral total 75. **Pass = 60% in each part separately: 135
written and 45 oral.** Grades: 270–300 sehr gut, 240–269.5 gut, 210–239.5
befriedigend, 180–209.5 ausreichend.

Consequences for the app: Lesen + Hören are 150 of the 225 written points, so
most practice goes there. Sprachbausteine is only 30. Speaking is its own
pass/fail gate, and Teile 2 and 3 carry 60 of its 75 points.

## Method

1. A 15-minute daily session: about 5 min flashcards, 5 min one exam-format
   drill, 5 min one phrase set. The app picks what is due. Streak and daily
   goal carry over from the current app.
2. Learn chunks rather than single words ("einen Termin vereinbaren").
3. Every drill copies a real exam Teil, so the format is familiar on the day.
4. Templates and phrase banks (Redemittel) for the e-mail and for Sprechen
   Teile 2 and 3. The highest payoff at B1.
5. Spaced repetition (the existing Leitner code in `src/lib/srs.ts`).
6. Every grammar mistake shows the rule, not just a red mark.

## App sections

- **Home:** today's 15-minute plan, streak, predicted written and oral result
  against the 60% marks.
- **Wortschatz:** flashcards by B1 topic (work, housing, health, authorities,
  travel, media...), with article, plural, example sentence and TTS audio.
- **Lesen:** drills for Teile 1–3, optional timer.
- **Sprachbausteine:** gap-fill drills with an explanation per answer.
- **Hören:** own dialogues read by the browser's German voice
  (`speechSynthesis`), played once or twice as in the exam, transcript after.
- **Schreiben:** e-mail builder with phrase suggestions, self-check against
  the 4 Leitpunkte and telc's criteria, model answer.
- **Sprechen:** prompt cards for all 3 Teile, prep timer, phrase banks,
  record-and-listen-back (`MediaRecorder`), model dialogue.
- **Modelltest:** full timed simulation; auto-scored receptive parts,
  self-assessed productive parts.
- **telc (owner only, behind login):** see below.

Reuse from the current app: `srs.ts`, `insights.ts` (weak spots,
recommendations), `storage.ts` (save/load to file), the exam review screen,
`Confirm.tsx` (never use `window.confirm`; see HANDOVER), PWA/service worker,
hash routing, i18n DE/EN, the GitHub Pages workflow.

## Content and copyright: the rule

Everything on telc.net is © telc, and **the repo and the site are public**.
Free to download is not free to republish.

- **Never commit telc texts, audio, PDFs or transcripts to the repo**, and
  never put them in public site files. A notice saying "personal use only"
  does not change this.
- All practice content in the public app is **written new** for this app,
  modelled on the exam format.
- telc's German B1 word lists may be used as a **coverage checklist** for
  which words the flashcards include. Write own example sentences and
  translations; do not copy the lists.
- The public app may **link** to telc's free downloads.

Useful telc downloads (from `https://www.telc.net/lehrmaterialien/downloadbereich/`,
base `https://www.telc.net/fileadmin/user_upload/Downloads_Verlag/`):
- `Pruefungstraining_telc_Deutsch_B1/`: 28 audio tracks (3 zips),
  `Loesungen_Hoertexte/..._Hoertexte.pdf`, `..._Loesungen.pdf`, answer sheet,
  sample chapter. telc's own exam-prep book (© 2025); the exercises
  themselves are in the paid book, only the sample chapter is free.
- Word lists: `Einfach_gut/Wortschatzlisten/Einfach_gut_B1_Wortschatzliste_alphabetisch.pdf`
  (word + lesson, e.g. "Abfall L1"), `Einfach_besser_B1/Wortschatzlisten/...Deutsch.pdf`.
- Native recordings with transcripts from the B1 course books
  (Auf jeden Fall, Einfach gut, Einfach besser).

## Supabase design

The user is creating a free Supabase project and connecting the **Supabase
connector at claude.ai/customize/connectors**. Use the connector to create
everything below; do not ask the user to click through the dashboard.

- **Auth:** email + password. **Disable sign-ups.** Create the owner's
  account by sending an invite to the owner's email, so the owner sets the
  password; never ask for it in chat.
- **Table `progress`:** one row per user (`user_id uuid primary key
  references auth.users`, `data jsonb`, `updated_at timestamptz`). RLS on;
  policies allow select/insert/update only where `user_id = auth.uid()`.
- **Bucket `telc` (private):** storage policy allows read only to the owner's
  user id (not to "authenticated" in general).
- **Upload:** a GitHub Actions workflow downloads the telc files listed above
  from telc.net and uploads them to the bucket with the service-role key,
  stored as GitHub secret `SUPABASE_SERVICE_ROLE_KEY` (the user saves it;
  never in chat or code). Project URL and the publishable/anon key go in
  app code; they are public by design and safe only because RLS is on.
- **Offline:** progress is written locally first, then synced (last write
  wins per field is fine for one user). telc audio played once is cached on
  the device.
- Free-tier projects pause after about a week of inactivity; the app should
  say so plainly when Supabase is unreachable rather than fail silently.
- The database password the user created is **not needed** and was not
  stored. It was pasted into chat once; the user was advised to reset it.

## Build order

1. **First release:** Wortschatz, Sprachbausteine, Lesen, Schreiben (e-mail
   trainer). Replace the Einbürgerungstest screens; keep the shared
   infrastructure. Deploy.
2. **Second:** Supabase login + progress sync + telc section (official
   Übungstest 1 as a digital answer sheet scored against telc's answer key,
   Prüfungstraining audio with transcripts). Hören (TTS) and Sprechen.
3. **Third:** full Modelltest, pass prediction, polish.

## Practicalities

- Deploys on every push to `main` (`.github/workflows/deploy.yml`).
- `main` is the live branch. The repo's default branch is still
  `claude/einbuergerungstest-app-25gcw6`; the user may switch it.
- Tests: `npm test`, `npm run typecheck`, `npm run build`. Drive the built
  app in Chromium before deploying (see HANDOVER §5).
