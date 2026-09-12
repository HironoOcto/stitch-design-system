# React project usage

Scenario: a React project where `@octohirono/stitch-design-system` is (or can be) installed.
For a no-build single HTML file, use [standalone-html.md](standalone-html.md).

## Setup (once per project)

```bash
npm install @octohirono/stitch-design-system
```

```ts
// app entry (main.tsx / App.tsx)
import '@octohirono/stitch-design-system/style'; // MUST import before any component renders
```

Peers: `react` / `react-dom` >= 18. The library's runtime dependencies — `radix-ui`
and `clsx` — install with the package; you don't add them yourself (they are not peers).
The build ships per-component modules (`preserveModules`) — import from the package root
only, and tree-shaking drops the rest.

Importing the stylesheet defines the `var(--stitch-*)` role variables that components
resolve at runtime — no extra setup.

### Let the app pick / switch themes (opt-in)

Zero-config default: `import '.../style'` and you are done — do NOT set `data-site`,
you get the one baked-in theme. To let your app choose a theme (or switch it at
runtime, e.g. a user-facing theme picker), the package also exports per-site layers:

```ts
import '@octohirono/stitch-design-system/style';        // required, baked default
import '@octohirono/stitch-design-system/themes/<site>'; // opt-in, one import per theme you offer
```

Then set `document.documentElement.dataset.site = '<site>'` to select/switch (unset =
the baked default). Each layer only re-scopes that site's per-site role values under
`[data-site="<site>"]`; constants/derived stay in `/style` and follow via `var()`, so
you ship no redundant CSS for themes you don't import.

## Explore the real API before writing code

The installed package ships complete TypeScript declarations — the ground truth for
props, legal values, and defaults; prefer them over any document.

- Resolve the package's type entry from its `package.json` (`types` / `exports`), then
  read the exported component and prop types.
- The [components/](components/) files mirror the same API (convenient), but the
  declarations win on any conflict.

## Minimal boilerplate

```tsx
import { Button, Card, Input, Table } from '@octohirono/stitch-design-system';

export default function App() {
    return (
        <main style={{ maxWidth: 1200, margin: '0 auto', padding: 32 }}>
            <Card>
                <Input placeholder="Ask anything…" />
                <Button type="primary" style={{ marginTop: 16 }}>Post</Button>
            </Card>
        </main>
    );
}
```

## Styling app-specific UI around the components

- Use role tokens: `color: var(--stitch-text-primary)`,
  `background: var(--stitch-bg-card)`, `border-radius: var(--stitch-radius-card)` —
  so custom UI stays on-palette.
- Exact token values: the active theme's `theme-presets/<active-theme>/tokens.css` (resolve
  `<active-theme>` as in [SKILL.md](../SKILL.md) "Active theme").
- Do NOT hard-code hex/px; use the `--stitch-*` role variables only.

## Scenario-specific rules

- One `import '@octohirono/stitch-design-system/style'` at the entry — never per file.
- Import types from the package root.
- All hard rules from [SKILL.md](../SKILL.md) apply.
