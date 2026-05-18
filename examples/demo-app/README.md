# rich-text demo app

Standalone Vite + React 19 app that consumes the local `@tolipovjs/rich-text` build via `file:../..`. Use it to test the library as if installed from npm.

## Run

From this directory:

```bash
npm install   # already done if you built lib first
npm run dev   # opens http://localhost:5174
```

## Rebuild lib + re-test

If you change library source:

```bash
# from D:/rich-text (repo root)
npm run build

# then in this folder
npm run dev
```

> The demo consumes `dist/` from the repo root, so always rebuild the lib first.

## What to try

- Type `/` anywhere — slash command menu opens (try `/head`, `/table`, `/todo`).
- Type `**bold**` then space → converts to bold.
- Type `# ` at start of line → H1. Same for `## `, `### `, `> `, `- `, `1. `, `[] `, `--- `, ` ``` `.
- Select any text → bubble toolbar appears above.
- Toggle features via the pill buttons.
- Switch theme: light / dark / pink.

## Files

- `src/App.tsx` — main demo UI with all v2.1 features wired
- `src/styles.css` — host page styles (gradient, layout, pills)
- `src/main.tsx` — imports the editor's stylesheet
- `vite.config.ts` — Vite + React on port 5174
