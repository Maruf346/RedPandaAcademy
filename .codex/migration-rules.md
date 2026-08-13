# Migration Rules

## Preserve Compatibility

- Keep the `localStorage` key `rpa_progress_v1`.
- Keep progress export/import byte-compatible with the legacy algorithm:

```js
btoa(unescape(encodeURIComponent(JSON.stringify(snapshot()))))
```

and the matching `decodeURIComponent(escape(atob(code)))` decode path.

- Keep the persisted snapshot shape compatible with the legacy `snapshot()`:

```js
{
  rank,
  best,
  cards,
  drills,
  assignments,
  kpiStats,
  scenStats,
  customDone,
  proto
}
```

- Do not persist session-only values unless explicitly requested.
- Do not rewrite scripts, sales logic, KPI rules, quiz pass thresholds, rank gates, or AI prompt constraints during the React conversion.
- Keep `netlify_files/` unchanged until parity QA passes.

## Routing Target

Use React Router with browser paths:

- `/`
- `/learn/:tab?`
- `/drill/:tab?`
- `/quiz`
- `/bot`
- `/grade`

Add `public/_redirects` with:

```txt
/*    /index.html   200
```

Hash URL compatibility can be added later with a small redirect shim if needed.

## Netlify Target

Root `netlify.toml` should build the React app:

```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[functions]
  node_bundler = "esbuild"
```

The function path remains `/.netlify/functions/claude`, and Netlify still needs `ANTHROPIC_API_KEY`.

## Field Kit

Move `netlify_files/docs/manifest.json` and PDFs into `public/docs/` for the React app. Keep Field Kit links relative to `/docs/`.

## Styling

Port the existing visual system first. Avoid redesign during migration.

- Keep dark training-app UI.
- Keep existing tokens as the starting point.
- Use CSS modules for component/page styling after the global shell is stable.
- Keep mobile-first ergonomics and bottom navigation.
