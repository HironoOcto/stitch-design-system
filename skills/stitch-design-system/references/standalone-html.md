# Standalone single-file HTML usage

Deliver one self-contained `index.html` the user saves and double-clicks — no npm, no
bundler, non-technical audience. The package ships **ESM only** (no UMD bundle to drop
in via a `<script>` tag), so you hand-roll the components inline while mirroring the real
library API. For a real React project, use [react-project.md](react-project.md) instead.

## Workflow

1. **Ask first.** If the page intent is unclear, reply with a short question plus 3–5
   concrete suggestions (blog, product grid, FAQ, login, dashboard). **Generate nothing yet.**
2. **Resolve the active theme first.** Exactly one theme is active — determine it as in
   [SKILL.md](../SKILL.md) "Active theme" (project `.agent/stitch.theme.json` `activeSite`,
   else the published default; never pick or guess). Its folder is
   `theme-presets/<active-theme>/`. Then **use the embedded specs — do NOT fetch anything:**
   - `:root` token block (paste-ready, complete): the theme's `theme-presets/<active-theme>/tokens.css`
   - Global rules: [theme/design-rules.md](theme/design-rules.md)
   - This theme's look rules (fonts, shadow policy, shapes, accent usage): the theme's
     `theme-presets/<active-theme>/rules.md`
   - The composition layer, **if the theme folder has a** `theme-presets/<active-theme>/composition.md`
     (some themes do, some don't): how the look is *composed* beyond any single token —
     ambient/backdrop treatment, light/dark acts, image/material texture, letterform-as-device
     typography, and an explicit reject-list. When present it is load-bearing for a hand-rolled
     full-page layout, so honor it; if absent, the theme simply has no composition layer.
   - Per-component props: [components/](components/)
3. **Generate** one complete `index.html` in a single fenced code block, then list any
   spec line you intentionally relaxed and why.

## Output requirements

- Single `index.html`; React + Babel via CDN:

```html
<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
```

- Page code in one `<script type="text/babel" data-presets="react,typescript">` block;
  mount on `<div id="root"></div>` via `ReactDOM.createRoot(...).render(<App />)`.
- All CSS inline in one `<style>` in `<head>`: paste the theme's `tokens.css` `:root` first,
  then component classes. **No CSS frameworks; Tailwind is forbidden.**
- Fonts: load exactly the families named in the theme's `tokens.css` (`--stitch-font-*`) —
  do not hard-code a font here.
- Shadows / radii / typography weights / any shape (clip-path): take from the theme's
  `tokens.css` + `rules.md`; never write literal values in this file.
  Shadow application is the most-misapplied rule — follow the theme's `rules.md` exactly.
- Page scale is tokens too — the folded-in `tokens.css` carries the full spacing scale
  (`var(--stitch-space-*)`), the four layout keys (`var(--stitch-page-max-width)`,
  `var(--stitch-section-gap)`, `var(--stitch-card-padding)`, `var(--stitch-element-gap)`),
  and the type scale (`var(--stitch-text-<role>)` + `var(--stitch-leading-*)`). Use them for
  padding, gaps, page width, and headings — never a bare `px` or point size. (Skip
  `--stitch-spacing-*` / `--stitch-font-size-*`; those are the components' internal aliases.)
- If the theme uses an SVG clip-path shape (see the theme's `rules.md`), inject its `<defs>`
  once at the top of `<body>` so `clip-path: url(#…)` resolves.

## Hand-roll the library API, then compose with it

- Define inline React components named exactly like the exports (`Button`, `Card`,
  `Input`, `Modal`, `Table`, …) accepting the documented props — see [components/](components/).
  `Notification` is imperative (static methods).
- Compose the page **only** with these components. Raw HTML/JSX allowed only where no
  component fits, then styled with `var(--stitch-*)`, never raw colors.
- Forbidden as visible UI: native `<button>`, `<input>`, `<select>`, checkbox/radio.

## Scenario-specific rules

- Every value comes from the embedded specs — do not round or substitute "close" colors.
- All hard rules from [SKILL.md](../SKILL.md) + the theme's `theme-presets/<active-theme>/rules.md` apply.
