# verachi.io Landing (Static Site)

Static marketing site served via GitHub Pages.

## Source of truth

- `src/*.html` — editable source pages
- `partials/*.html` — shared head/header/footer snippets (injected at build time)
- `home/*` + `landing.*` — static CSS/JS assets

## Local Preview

- Simple dev server:

```bash
task dev
```

Open `http://localhost:8080`.

## Build

Builds `src/*.html` into root-level `*.html` (what GitHub Pages serves):

```bash
node build.js
```

## Deploy

Push to `main` (GitHub Pages serves the repository root).
