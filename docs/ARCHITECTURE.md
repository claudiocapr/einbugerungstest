# telc B1 Trainer – architecture and conventions

A static React + TypeScript PWA (Vite), served from GitHub Pages. Everything
runs in the browser; progress lives in `localStorage` first and is mirrored to
Supabase for the signed-in owner. Only free services are used.

## Layout

| Path | What | Owner |
| --- | --- | --- |
| `src/App.tsx`, `src/main.tsx` | Shell: header, hash routing, footer | integrator |
| `src/sections/registry.ts` | Every screen (id, title, icon, lazy component) | integrator |
| `src/sections/<id>/` | One folder per screen, default export `index.tsx` | that section's author |
| `src/content/types.ts` | Content schemas for every exam part | integrator (read-only for others) |
| `src/content/<part>.ts` | Practice content; **export names are fixed** (the Modelltest imports them) | that part's author |
| `src/lib/*` | Shared helpers (see below) | integrator (read-only for others) |
| `src/components/*` | Shared components (`Confirm`, `Strength`) | integrator |
| `src/sync/**`, `supabase/**` | Login, sync, analytics sink, migrations (see `docs/BACKEND.md`) | backend |

Section authors touch only their own folder and content file. A change needed in
a shared file is reported back, not made directly.

## Routing

`#/<section>/<rest...>`. Each section receives `SectionProps`:

```ts
{ lang: 'de' | 'en'; path: string[]; go: (route: string) => void }
```

`path` is everything after the section id; `go('lesen/teil1/set-03')` navigates.
Use the browser back button semantics: one screen per route, no hidden state
that a reload would lose.

## Shared helpers

- `lib/storage.ts`
  - `recordItem(id, ok, chosen?)` – one answer to a practice item; drives spaced
    repetition. Ids are namespaced: `vocab:<entry-id>`, `lesen1:<set>:<n>`,
    `sb1:<set>:<gap>`, `hoeren2:<set>:<n>`, …
  - `recordResult(DrillResult)` – a finished set, task or mock exam.
  - `useSection(key, initial)` – persistent, synced state for a section
    (drafts, settings). Keep it small.
  - `useStore()` – the whole store (read-mostly).
- `lib/srs.ts` – `practiceOrder(ids, progress)`, `dueOrder`, `strengthLevel`, …
- `lib/tts.ts` – `speak(text)`, `speakLines(lines)`, `stop()`, `ttsAvailable`.
- `lib/useCountdown.ts` – `useCountdown(ms, running, onDone)`, `formatClock(ms)`.
- `lib/analytics.ts` – `track('<section>.<action>', props)`, `logError(err, ctx)`.
  Never put typed text or anything identifying into props.
- `lib/i18n.ts` – `t(key, lang)` for shell strings; sections keep their own
  `{ de, en }` objects and read them with `tr(text, lang)`.
- `components/Confirm.tsx` – use instead of `window.confirm` (sandboxed
  iframes block native dialogs silently).

## CSS

Use the existing classes in `src/styles.css`: `card`, `stack`, `row`, `btn`
(`primary`, `ghost`, `small`, `block`, `danger`), `tile`, `chip(s)`, `option(s)`
(`selected`, `correct`, `incorrect`), `badge`, `bar`, `clock` (`urgent`),
`exambar`, `grid-nav`, `verdict`, `statgrid`/`stat`, `muted`, `small`, `good`,
`bad`, `overlay`. Colours come from CSS variables (`--good`, `--bad`, `--accent`,
…) so light and dark themes keep working.

## Content and copyright

All practice texts are written for this app and follow the **format** of telc
Deutsch B1 (number of items, instructions, topics, difficulty). Original telc
texts, audio, answer keys and word lists are never committed to this public
repository; the private telc area loads them from a private Supabase bucket
for allow-listed accounts only.

## Checks

```
npm run typecheck && npm test && npm run build
```

Tests run with `node --test --experimental-strip-types`, so relative imports
carry explicit `.ts` / `.tsx` extensions.
