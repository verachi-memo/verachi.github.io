# Verachi Landing — Design Notes

The marketing site mirrors the product's **Editorial Ledger** language so the
landing page feels like Verachi, not a generic SaaS template.

## Principles

- **Warm paper, deep teal.** Background `#efe7db`, surfaces `#fffdf8`, primary
  `#173f3b`. Full light/dark support via `[data-theme]` + `prefers-color-scheme`.
- **Border-led, not card-soup.** Hairline borders and rows do the structural
  work; shadows are reserved for floating surfaces (hero record, form, panels).
- **Editorial type.** Inter for UI/body, **Instrument Serif** italic for display
  accents, **JetBrains Mono** for decision IDs, citations, and eyebrows.
- **Calm motion.** Scroll reveals, a typed "Ask Verachi" answer, and staggered
  hero citations — all gated behind `prefers-reduced-motion`.
- **Trust is content.** Read-only, mandatory citations, audit trail, and
  pointer-only storage are first-class sections, matching the product posture in
  `../verachi/docs/internal-docs/SOURCE_OF_TRUTH.md`.

## Structure

```
src/index.html        Source page (full <head> inline + partial markers)
partials/header.html  Sticky header: nav, theme toggle, mobile menu
partials/footer.html  Footer
home/styles.css       Design tokens + all section styles
home/app.js           Reveal observer, theme, menu, chat demo, contact form
home/site-init.js     Pre-paint theme setter (avoids flash), loaded in <head>
home/verachi-logo.svg Brand mark
```

Run `node build.js` to inject partials from `src/` into the root `index.html`
that GitHub Pages serves.

## Security / performance

- Strict CSP (no `unsafe-inline`): all JS is local files, all dynamic styling is
  set via CSSOM (`element.style`), never inline `style=` attributes.
- No frameworks or build step beyond partial injection; one CSS file, two small
  JS files, system-font fallbacks, `preconnect` to Google Fonts.
- The contact form is progressive enhancement: it posts natively without JS and
  upgrades to an inline async submit (honeypot + load-time fields) when JS runs.
