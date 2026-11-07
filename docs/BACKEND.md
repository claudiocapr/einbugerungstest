# Backend: login, sync, analytics, private telc material

Everything runs on the **free tier** of Supabase (project ref
`armhdiedsojtpcqknpjt`, region Frankfurt) and GitHub Actions. There is no
server of our own. The app works fully without an account; Supabase is only
used for:

1. **Login + progress sync** for invited accounts (sign-ups are disabled).
2. **Anonymous usage statistics and error logs** (opt-out, first-party).
3. **Private telc material** (official PDFs/MP3s and the Übungstest answer key)
   for allow-listed accounts.

The project URL and the *publishable* key are in `src/sync/config.ts`. They are
public by design: every browser receives them, and row-level security (RLS) in
the database decides what each request may do. The **service-role key** (secret)
is never in the code; it lives only in a GitHub secret for the upload workflow.

## Current state of the live project (7 November 2026)

- **Migrations:** `20261106120000_analytics_and_admin.sql` is applied, except
  `purge_old_analytics` (not needed yet; create it from the file when old
  statistics should be deleted).
- **Admin:** the owner's account is in `app_admins` and `telc_access`.
- **Security check:** the only remaining Supabase advisor warning is
  "leaked password protection", a paid-plan feature; sign-ups are disabled.
- **telc material:** all 33 objects (74 MB) are in the private bucket `telc`,
  including `uebungstest-1/key.json` with 60/60 answers. They were uploaded
  with a temporary edge function, `telc-ingest`, which is now retired
  (it returns 410) and can be deleted in the dashboard under Edge Functions.
  The GitHub workflow below remains the way to upload again later.

## Files

| Path | What |
| --- | --- |
| `src/sync/config.ts` | Project URL, publishable key, bucket name, app version |
| `src/sync/supabase.ts` | supabase-js client, loaded lazily (own chunk; only for people who sign in) |
| `src/sync/merge.ts` | `mergeStores(local, remote)` – pure, tested |
| `src/sync/sync.ts` | Sign in/out, sync engine, `useSyncStatus()` |
| `src/sync/access.ts` | `useAccess()` – may this account open telc material / statistics? |
| `src/sync/analytics.ts` | Analytics sink, error handlers, queue, opt-out |
| `src/sync/Boot.tsx` | Start-up: installs analytics, restores the session, shows the one-time notice |
| `src/sections/konto` | `#/konto` – sign in/out, sync status, statistics opt-out, privacy notice |
| `src/sections/telc` | `#/telc`, `#/telc/antwortbogen` – private material and the digital answer sheet |
| `src/sections/statistik` | `#/statistik` – owner-only usage statistics and error log |
| `supabase/migrations/*.sql` | Database schema (apply by hand, see below) |
| `scripts/telc/*.mjs`, `.github/workflows/telc-upload.yml` | Upload of telc's files to the private bucket |

## How sync works

- The device's `localStorage` is always the working copy (`src/lib/storage.ts`).
  Nothing waits for the network.
- The table `public.progress` holds one row per account: the whole store as
  JSON (`data`) plus a server timestamp (`updated_at`).
- **On app start** (if a session is stored) and **on sign-in**, the app reads
  the row's `updated_at`. If another device wrote since this device last
  looked, it downloads the row and merges it with the local store:
  - practice items: per item, the entry with the later `lastSeen` wins (tie:
    more attempts);
  - results: both lists united, duplicates (same `startedAt` + `section` +
    `setId`) removed, newest first, at most 500;
  - section state (drafts, answer sheet …) and settings (language, theme,
    daily goal): from the device whose store changed last.
  Then the merged store is saved locally and uploaded.
- **After that**, every local change is uploaded about 3 seconds later. Before
  each upload the same `updated_at` check runs, so two devices never overwrite
  each other's progress. When the device comes back online, it syncs at once.
- Errors never block the app. `#/konto` shows the state (up to date / offline /
  error), the time of the last sync, whether changes are pending, and a
  "Jetzt synchronisieren" button.
- Free Supabase projects **pause after about a week without use**. The app then
  says "Server nicht erreichbar …". Fix: Supabase dashboard → the project →
  **Restore project**. Local progress is not affected and syncs afterwards.
- Signing out (only on this device) keeps the local progress on the device.

## What analytics collects

Anonymous, first-party, into this project's own tables. No cookies, no third
parties.

| Sent | Not sent |
| --- | --- |
| a random install id (`crypto.randomUUID()`, stored in this browser under `telc-b1.install`) | name, e-mail, account id |
| event names such as `app.open`, `screen.view`, `telc.sheet_scored` | anything the user typed, answers, recordings |
| small flat props: numbers, booleans, strings cut to 100 characters (e-mail-like text is masked) | IP addresses (the app stores none; Supabase's own platform logs keep them briefly) |
| app version, display mode (installed or browser), current route (e.g. `lesen/teil1`) | |
| error messages (≤ 500 chars), stack (≤ 4000), context, route, browser user agent | |

Details:

- `app.open` once per browser session (version, display mode). The shell sends
  `screen.view` with `{ section }` on every screen change. Sections may call
  `track('<section>.<action>', props)`.
- Exams/mock tests should send a boolean `passed` (and `points`) prop, e.g.
  `track('modelltest.finished', { passed: true, points: 162 })`; the pass-rate
  table picks up every event with a `passed` prop.
- `window.onerror`, unhandled promise rejections and `logError()` are logged;
  identical messages once per session, at most 20 per session.
- Events are batched (every 10 s, at 20 events, or when the tab is hidden, with
  `fetch(..., { keepalive: true })`). The queue holds at most 200 items; a batch
  that fails 5 times (also while offline) is dropped.
- **Opt-out:** `#/konto` → "Anonyme Statistik und Fehlerberichte senden". On by
  default after a one-time notice; browsers sending **Do Not Track** start with
  it off. The choice is stored in this browser (`telc-b1.analytics`).
- Who can read it: only accounts listed in `public.app_admins` (the owner),
  through `#/statistik`. Nobody can change or delete rows through the API.
- Retention: delete rows older than 180 days with `purge_old_analytics()` (see
  below).

## Applying the migrations (step by step)

The files in `supabase/migrations/` are plain SQL. Apply each one once, oldest
first:

1. Open <https://supabase.com/dashboard> → your project → **SQL Editor** →
   **New query**.
2. Open the migration file on GitHub, copy its whole content, paste it into the
   editor, press **Run**. It should say "Success. No rows returned".
3. Afterwards: **Advisors → Security Advisor** → "Rerun linter". There should be
   no warnings about the new tables.

Migrations:

- `20260101000000_telc_b1_progress_and_private_bucket.sql` – **already applied**
  on 6 Nov 2026 (it documents the existing `progress`, `telc_access` and bucket
  setup). Do not re-run it on the live project unless the policy names match
  the ones in the dashboard (Database → Policies); it is there to rebuild a
  fresh project.
- `20261106120000_analytics_and_admin.sql` – **apply this one**: tables
  `events`, `app_errors`, `app_admins`, the statistics functions and
  `purge_old_analytics()`. Safe to run twice.

Both were tested against a local Postgres (PGlite) with stand-ins for Supabase's
roles: anonymous inserts work, oversized/invalid rows are rejected, anonymous
reads/updates/deletes are refused, and only an `app_admins` user sees data.

## Adding a user to the telc area or to the statistics

Users first need an account (sign-ups are disabled):

1. Dashboard → **Authentication → Users → Add user → Send invitation** (or
   "Create new user"). The person sets their own password via the e-mail.
2. Copy the user's **UID** from the users list.
3. SQL Editor → run, with the UID filled in:

```sql
-- may open the private telc material (#/telc)
insert into public.telc_access (user_id) values ('<UID>') on conflict do nothing;

-- may see the usage statistics (#/statistik) – normally only the owner
insert into public.app_admins (user_id) values ('<UID>') on conflict do nothing;
```

The owner (`a1053c14-3a76-4982-9d76-50cf9539316a`) is already in
`telc_access`; after applying the analytics migration, run the second line
for the owner too:

```sql
insert into public.app_admins (user_id) values ('a1053c14-3a76-4982-9d76-50cf9539316a') on conflict do nothing;
```

To remove access: `delete from public.telc_access where user_id = '<UID>';`
(same for `app_admins`).

## Deleting old statistics (retention)

Run now and then in the SQL Editor:

```sql
select public.purge_old_analytics(180);  -- deletes events and errors older than 180 days
```

Optional automation: Dashboard → **Database → Extensions** → enable `pg_cron`,
then:

```sql
select cron.schedule('purge-old-analytics', '17 3 * * *', $$select public.purge_old_analytics(180)$$);
```

## Uploading telc's material (GitHub Actions)

telc's files are © telc and are **never committed**. The workflow
`.github/workflows/telc-upload.yml` downloads them from telc.net while it runs,
reads the Übungstest 1 answer key out of the PDF, and uploads everything into
the private bucket `telc`. Files only exist in the runner's temp directory;
the logs show only file names, sizes and counts.

Sources (checked 6 Nov 2026, all HTTP 200):

- `https://www.telc.net/fileadmin/user_upload/mock_exams/Deutsch/telc_deutsch_b1.zip`
  (Übungstest 1 PDF + MP3)
- `https://www.telc.net/fileadmin/user_upload/Downloads_Verlag/Pruefungstraining_telc_Deutsch_B1/Audios/Pruefungstraining_telc_Deutsch_B1_Track_01-10.zip`,
  `…_Track_11-20.zip`, `…_Track_21-28.zip` (28 tracks)
- `…/Pruefungstraining_telc_Deutsch_B1/Loesungen_Hoertexte/Pruefungstraining_telc_Deutsch_B1_Hoertexte.pdf`
- `…/Pruefungstraining_telc_Deutsch_B1/Loesungen_Hoertexte/Pruefungstraining_telc_Deutsch_B1_Loesungen.pdf`

What ends up in the bucket (33 objects, about 70 MB of the free 1 GB):

```
uebungstest-1/uebungstest-1.pdf
uebungstest-1/uebungstest-1.mp3
uebungstest-1/key.json              answer key {"1":"…", …, "60":"…"}, "+" = richtig, "-" = falsch
pruefungstraining/Hoertexte.pdf
pruefungstraining/Loesungen.pdf
pruefungstraining/Track_01.mp3 … Track_28.mp3
```

### One-time: save the secret

1. Supabase dashboard → **Project Settings → API Keys**. Copy the **secret**
   key (`sb_secret_…`) or, under "Legacy API keys", the `service_role` key.
   Never paste it anywhere else.
2. GitHub → the repository → **Settings → Secrets and variables → Actions →
   New repository secret**. Name: `SUPABASE_SERVICE_ROLE_KEY`, value: the key.
   Save. (`SUPABASE_URL` is optional; the script defaults to this project.)

### Run it

1. GitHub → **Actions** → "Upload telc material" → **Run workflow**.
2. First tick **Dry run** to check that downloading and reading the answer key
   work (the log should say `key: 60/60 items …`). Then run it again without
   the tick to upload.
3. Open the app, sign in, go to `#/telc`: the files appear; the answer sheet
   (`#/telc/antwortbogen`) can be scored.

Re-running is safe: files are overwritten (upsert). If telc changes a file name,
the workflow fails with a clear message; update the URLs in
`scripts/telc/upload.mjs`.

### Local test (no upload)

```
npm i --prefix /tmp/pdfjs pdfjs-dist@4.10.38
PDFJS_DIR=/tmp/pdfjs node scripts/telc/upload.mjs --dry-run
```

The script refuses to run without the secret (except `--dry-run`) and refuses
a work directory inside the repository.

## The answer sheet

`#/telc/antwortbogen` mirrors answer sheet S30 of Übungstest 1: items 1–60 with
the right choices per part (Lesen 1: a–j, Lesen 2: a/b/c, Lesen 3: a–l or x,
Sprachbausteine 1: a/b/c, Sprachbausteine 2: a–o, Hören 1–3: richtig/falsch).
Marks are saved like any other progress (and synced). Scoring loads
`uebungstest-1/key.json` from the private bucket and uses telc's points per
item: Lesen 1 = 5, Lesen 2 = 5, Lesen 3 = 2.5, Sprachbausteine = 1.5,
Hören 1 = 5, Hören 2 = 2.5, Hören 3 = 5 (180 points; writing's 45 points are
not part of it). The result is stored with `recordResult({ section: 'telc', setId: 'uebungstest-1', … })`.
