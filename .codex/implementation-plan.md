# Implementation Plan

## Current Decision

Build a root Vite + React JavaScript app with React Router and CSS modules. Preserve `netlify_files/` as the deployed legacy archive.

## Phase 0: Scaffold

Goal: establish a root React app that can build and deploy without migrating product behavior yet.

Tasks:

1. Add `package.json`, `vite.config.js`, root `index.html`, and root `netlify.toml`.
2. Add `public/_redirects`.
3. Copy legacy Field Kit files to `public/docs/`.
4. Copy legacy `claude.mjs` to `netlify/functions/claude.mjs`.
5. Add minimal `src/main.jsx`, `src/App.jsx`, and global styles with the current tokens.
6. Render placeholder routes for all six app screens so routing and navigation are proven.

Exit criteria:

- `npm install` can install dependencies.
- `npm run build` succeeds.
- The app shell shows all six navigation targets.
- No legacy business logic has been altered.

## Phase 1: Data And Persistence

Goal: extract core constants and progress helpers without rendering all features.

Tasks:

1. Extract constants from `netlify_files/index.html` into `src/data/`.
2. Add `src/lib/progressCode.js` with legacy-compatible encode/decode.
3. Add `src/lib/storage.js` using `rpa_progress_v1`.
4. Add `src/context/ProgressContext.jsx` with reducer actions.
5. Add a small compatibility test or script for progress code round trips.

Exit criteria:

- Old backup codes can import.
- New backup codes can export.
- Snapshot shape matches legacy expectations.

## Phase 2: Learn

Goal: migrate Learn tabs with content parity.

Tasks:

1. Build shared UI primitives: cards, pills, tab buttons, accordions, lock notices.
2. Migrate Steps, Glossary, KPIs, Discovery, Key Scripts, and Field Kit.
3. Add Pivot Points with Apprentice gate.
4. Verify `/learn/:tab` paths and Field Kit downloads.

Exit criteria:

- Learn content is usable without AI.
- Locked Pivot behavior matches legacy rank gate.

## Phase 3: Home

Goal: migrate the dashboard and backup/restore loop.

Tasks:

1. Rank card and ladder.
2. Assigned drills.
3. Flashcard and drill stat summaries.
4. Protocol Daily 20 snapshot.
5. Progress export/import UI.

Exit criteria:

- A fresh Rookie can see useful next actions.
- Export/import preserves progress across reload.

## Phase 4: Drill

Goal: migrate practice flows.

Tasks:

1. Flashcards with weak-first behavior and mastery updates.
2. Partner drills with Apprentice gate.
3. Training Protocol phases and Daily 20.
4. Train My Weakness shell, leaving AI generation for Phase 6 if needed.

Exit criteria:

- Manual practice works without AI.
- Progress updates persist.

## Phase 5: Quiz

Goal: migrate rank exams.

Tasks:

1. Apprentice, Closer, and Top Rep exams.
2. 80 percent pass threshold.
3. Best scores and rank-up behavior.
4. Missed questions create dashboard assignments.

Exit criteria:

- Ranks unlock exactly as the legacy app.

## Phase 6: AI

Goal: migrate AI features after the non-AI product is stable.

Tasks:

1. Add `src/lib/ai.js`.
2. Port `kbPrompt()` and grading/training prompts verbatim.
3. Migrate Panda Bot.
4. Migrate Grade My Call.
5. Migrate Train My Weakness AI modes.

Exit criteria:

- Works with `ANTHROPIC_API_KEY` on Netlify.
- Helpful fallback notices appear without AI.

## Phase 7: QA And Cutover

Goal: prove parity before replacing the deployed artifact.

Tasks:

1. Fresh Rookie path.
2. Apprentice unlock path.
3. Closer unlock and Grade Call path.
4. Progress backup/restore with old and new codes.
5. Field Kit downloads.
6. Netlify build and SPA route fallback.

Exit criteria:

- Root React build is ready to deploy.
- `netlify_files/` remains available as rollback/archive.
