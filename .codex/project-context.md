# Project Context

## Product

Red Panda Closer Academy is a mobile-first sales rep training app for Red Panda Roofing. It trains closers through a closed loop:

1. Live appointment
2. Grade My Call
3. Assigned drills
4. Flashcards, partner drills, and quizzes
5. Rank unlocks
6. Back to live appointments

The current content still contains New Era Roofs scripts in places. Do not rebrand the sales content unless source documents are updated.

## Current Deployed Artifact

The deployed Netlify package lives in `netlify_files/`.

- `netlify_files/index.html` is the current single-file SPA.
- `netlify_files/logo.png` is the current app icon asset.
- `netlify_files/docs/manifest.json` lists Field Kit PDFs.
- `netlify_files/docs/*.pdf` contains the deployed Field Kit documents.
- `netlify_files/netlify/functions/claude.mjs` is the Anthropic proxy.
- `netlify_files/netlify.toml` publishes the folder root for manual Netlify deploys.

The React app should be built at the repo root while leaving `netlify_files/` unchanged as the archive and parity reference.

## Existing App Architecture

Current `index.html` contains:

- Inline CSS tokens and component styles
- Embedded knowledge base constants
- Global progress state `S`
- `localStorage` persistence under `rpa_progress_v1`
- Hash-style routing and full `innerHTML` renders
- Netlify function calls to `/.netlify/functions/claude`
- Field Kit fetch from `/docs/manifest.json`

Major constants to extract later:

- `RANKS`, `PHASES`, `STEPS`
- `DISCOVERY`, `SCENARIOS`, `FOURCS`
- `KPIS`, `KEYSCRIPTS`
- `CARDS`, `DRILLS`, `DRILL_LINKS`
- `QUIZZES`, `GLOSSARY`, `DIAGNOSE`
- `PROTOCOL`

## Rank Gates

- Rookie: 12-Step reader, Discovery Form, Flashcards
- Apprentice: Pivot Points library, Partner Drills
- Closer: Grade My Call, Advanced AI training
- Top Rep: Full platform and mentor status

Rank-up exams require 80 percent to pass.

## Screens

- Home: dashboard, rank, assignments, protocol, progress code backup/restore
- Learn: 12 steps, glossary, pivot points, KPIs, discovery, scripts, Field Kit
- Drill: flashcards, partner drills, Train My Weakness, Training Protocol
- Rank Up: Apprentice, Closer, and Top Rep exams
- Panda Bot: docs-only AI coach
- Grade Call: transcript grader, locked until Closer
