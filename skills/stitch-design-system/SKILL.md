---
name: stitch-design-system
description: >
    Build or restyle web UIs with stitch-design-system, a React + TypeScript component library
    with themeable `--stitch-*` design tokens. Use whenever writing or editing web UI — a page,
    dashboard, landing/marketing section, form, React component, or a single standalone HTML
    file — that should use stitch-design-system's components or match its themed look. Works
    both in a React project (the `@octohirono/stitch-design-system` npm package) and in plain
    standalone HTML via CDN — the npm package is NOT required. Gives exact component props, the
    active theme's `--stitch-*` token values, and the theme's do/don't rules, so you build with
    real components and correct tokens instead of guessing a component API, color, font, or shadow.
---

# stitch-design-system

A React + TypeScript component library for building web UIs. Every visual value comes from
CSS role variables (`--stitch-*`) supplied by the active theme. Two rules hold everywhere:
never hardcode a color, font, radius, or shadow — use a `--stitch-*` variable; and never
invent a component prop — the component references are the ground truth. Everything you need
is bundled under `references/`; do not fetch anything or guess a value.

## Choose your setup

| Setup | Read |
| --- | --- |
| React project using (or able to install) `@octohirono/stitch-design-system` | [references/react-project.md](references/react-project.md) |
| Single self-contained HTML file — no build, React via CDN | [references/standalone-html.md](references/standalone-html.md) |

## Active theme

Exactly one theme is active for a project. Never pick, mix, or guess a theme, and never
browse `references/theme-presets/` to choose one — the active theme is determined, not
selected:

1. If the project has a `.agent/stitch.theme.json` with an `activeSite`, that value is the
   active theme.
2. Otherwise the active theme is the default:

   <!-- SLOT:default-site -->
   seline
   <!-- /SLOT:default-site -->

If this is still ambiguous — e.g. `activeSite` names a theme that has no folder under
`references/theme-presets/` — do not guess or substitute another; ask the user which theme
to use.

Use only that one theme. Read its folder — `references/theme-presets/<active-theme>/` (with
`<active-theme>` substituted from the step above) — and use these files:

- `style.md` — how this theme looks and composes, in one paragraph. Read it first.
- `tokens.css` — the complete `:root` of `--stitch-*` values. Use these exact values (via
  `var(--stitch-*)`), never raw hex or a literal px. Groups: backgrounds (`--stitch-bg-*`),
  text colors (`--stitch-text-primary/secondary/muted/on-accent/…`), accent/link
  (`--stitch-accent*`, `--stitch-link`), borders, radii (`--stitch-radius-*`), shadows, fonts
  (`--stitch-font-*`), motion, control heights, feedback (`danger/success/warning/info`),
  category slots (`--stitch-cat-1…6`), and the **page-scale layer**: the full spacing scale
  (`--stitch-space-4` … `--stitch-space-160` on a 4px grid, plus `--stitch-space-unit`), the
  full type scale (`--stitch-text-<role>` with `--stitch-leading-*` / `--stitch-tracking-*`,
  roles `caption`…`display`), and the four layout keys (`--stitch-page-max-width`,
  `--stitch-section-gap`, `--stitch-card-padding`, `--stitch-element-gap`).

  **Which scale to size pages with:** use `--stitch-space-*`, `--stitch-text-<role>`, and the
  four layout keys — that is the complete page scale, with no upper cap. `--stitch-spacing-xs…xl`
  and `--stitch-font-size-*` are component-internal aliases (the library's own components read
  them); you do not reach for those when writing pages or custom UI.
- `rules.md` — this theme's do/don't look rules (shapes, colors, when to use the accent).
- `composition.md` — **read it if the folder has one** (some themes do, some don't). The
  composition layer: how the look is *composed* beyond any single token — ambient/backdrop
  treatment, light/dark acts, image and material texture, letterform-as-device typography,
  and an explicit reject-list. It covers what `tokens.css` and `rules.md` cannot say on
  their own; when present it is load-bearing, so honor it. If the folder has no
  `composition.md`, the theme simply has no composition layer — do not invent one.

## Components

Props, legal values, and defaults for every component live under `references/components/`,
generated verbatim from source — the ground truth. Read the relevant file before using a
component; never guess or invent props.

<!-- SLOT:catalog (build:refs generates from component-families.md — do not hand-edit) -->
| Category | Components | Reference |
| --- | --- | --- |
| general | Button, Icon, Image, Toggle, ToggleGroup | [general.md](references/components/general.md) |
| layout | Card, Divider, Collapse, Tabs, Accordion, AspectRatio, ScrollArea | [layout.md](references/components/layout.md) |
| form-controls | Input, Switch, Checkbox, Radio, Select, Slider, Label, OtpField, PasswordInput, Calendar, DatePicker | [form-controls.md](references/components/form-controls.md) |
| overlays | Modal, Drawer, Tooltip, Popover, HoverCard, AlertDialog | [overlays.md](references/components/overlays.md) |
| navigation | DropdownMenu, ContextMenu, Menubar, NavigationMenu, Toolbar | [navigation.md](references/components/navigation.md) |
| feedback | Loading, Progress, Skeleton | [feedback.md](references/components/feedback.md) |
| data-display | Table, CodeBlock, Tag, Avatar | [data-display.md](references/components/data-display.md) |
| chat | ChatMessage, ChatMessageActions, ChatList, ChatInput, TypingIndicator, ChatImage, ChatFile, ChatVoice | [chat.md](references/components/chat.md) |
| data-viz | LineChart, BarChart, PieChart, Stat | [data-viz.md](references/components/data-viz.md) |
| Form | Form | [Form.md](references/components/Form.md) |
| Notification | Notification | [Notification.md](references/components/Notification.md) |
<!-- /SLOT:catalog -->

## Rules (violations are bugs)

- **Global engineering rules** — no hardcoded values, icons, motion, accessibility, color
  proportion: [references/theme/design-rules.md](references/theme/design-rules.md).
- **The active theme's look rules** — the `rules.md` in the theme folder above.

Both apply. Icons come only from `<Icon name="…" />` — never emoji, Unicode symbols, or
hand-drawn SVG. Import the stylesheet once at app entry. Prefer library components over raw
HTML controls.
