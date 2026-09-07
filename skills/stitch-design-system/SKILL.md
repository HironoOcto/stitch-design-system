---
name: stitch-design-system
description: >
    <!-- SLOT:description -->
    Build React UIs in the Seline style — editorial analytics on warm stone paper: a near-monochrome canvas with a single vivid cyan accent used once per headline, geometric 400-weight Roobert sans headlines with tight negative tracking, flat white cards over 1px hairline stone borders, pill controls, and a single soft 16px-blur shadow reserved for product previews.
    <!-- /SLOT:description -->
---

# stitch-design-system style

stitch-design-system is a React + TypeScript component library. Components and any
custom UI use role variables `var(--stitch-*)`; their values live in
`references/theme/tokens.css`. This skill is self-contained: every value it needs is
embedded under `references/` — never fetch anything, never guess a value.

## The style in one paragraph

<!-- SLOT:style-paragraph -->
Seline presents analytics as a quiet analyst's desk — geometric 400-weight Roobert headlines with tight negative tracking sit unhurried over a warm-stone, near-monochrome canvas, never bumping to heavier weights for emphasis. A single vivid cyan is the only chromatic surface and appears at most once per headline, marking the one value-proposition keyword while everything else stays neutral stone. Body copy runs in a small, steady sans at a relaxed line-height, the dominant UI rhythm that carries hierarchy before color ever enters. Surfaces are flat white cards floating over the warm background, structured by 1px stone hairline borders used generously as the primary separator rather than heavy panels or dividers. Elevation is rationed to a single soft 16px-blur shadow reserved for one product-preview artifact per page; controls are pill-shaped. The layout breathes on centered, generous vertical rhythm, and the cyan call-to-action stays the loudest thing on the page precisely because everything around it is restrained.
<!-- /SLOT:style-paragraph -->

## Pick your scenario first

| Scenario | Entry |
| --- | --- |
| React project — `@octohirono/stitch-design-system` is (or can be) installed | [references/react-project.md](references/react-project.md) |
| Single self-contained HTML file — no npm, React via CDN | [references/standalone-html.md](references/standalone-html.md) |

## Design tokens

Components and any custom UI use role variables `var(--stitch-*)` — never raw hex.
The complete, paste-ready `:root` with this theme's exact values is
[references/theme/tokens.css](references/theme/tokens.css). Groups: backgrounds
(`--stitch-bg-*`), text (`--stitch-text-*`), accent/link (`--stitch-accent*`,
`--stitch-link`), borders, radii (`--stitch-radius-*`), shadows, fonts
(`--stitch-font-*`), spacing, motion, control heights, feedback colors
(`danger/success/warning/info`), category slots (`--stitch-cat-1…6`). Exact values
are not restated here — read `tokens.css`.

## Component catalog

Props references under `references/components/` (props, legal values, defaults —
generated verbatim from source):

<!-- SLOT:catalog (build:refs generates from component-families.md — do not hand-edit) -->
| Category | Components | Reference |
| --- | --- | --- |
| general | Button, Icon, Image, Toggle, ToggleGroup | [general.md](references/components/general.md) |
| layout | Card, Divider, Collapse, Tabs, Accordion, AspectRatio, ScrollArea | [layout.md](references/components/layout.md) |
| form-controls | Input, Switch, Checkbox, Radio, Select, Slider, Label, OtpField, PasswordInput | [form-controls.md](references/components/form-controls.md) |
| overlays | Modal, Drawer, Tooltip, Popover, HoverCard, AlertDialog | [overlays.md](references/components/overlays.md) |
| navigation | DropdownMenu, ContextMenu, Menubar, NavigationMenu, Toolbar | [navigation.md](references/components/navigation.md) |
| feedback | Loading, Progress, Skeleton | [feedback.md](references/components/feedback.md) |
| data-display | Table, CodeBlock, Tag, Avatar | [data-display.md](references/components/data-display.md) |
| data-viz | LineChart, BarChart | [data-viz.md](references/components/data-viz.md) |
| Form | Form | [Form.md](references/components/Form.md) |
| Notification | Notification | [Notification.md](references/components/Notification.md) |
<!-- /SLOT:catalog -->

## Hard rules (violations are bugs)

- **Global rules** (no-hardcode, icons, motion, accessibility, color proportion): [references/theme/design-rules.md](references/theme/design-rules.md)
- **This style's look rules** (Do/Don't, shapes, colors, when to use the accent):
  [references/theme/rules.md](references/theme/rules.md)

Both apply. Never invent props (component references are ground truth). Import the
stylesheet once at app entry. Icons come from `<Icon name="…" />` — never emoji /
Unicode / hand-rolled SVG. Prefer library components over raw HTML controls.
