---
name: reset-theme
disable-model-invocation: true
compatibility: Requires Node.js and the stitch-design-system skill installed alongside this one.
description: >
    Choose or change which stitch-design-system theme a project develops against. Use when
    the user wants to switch the active theme (the look their code should match), asks to
    "reset the theme", "pick a theme", "change the skin", or set up which theme this project
    uses. It lists the themes that ship with the stitch-design-system skill installed
    alongside it, lets the user pick one, and records that choice as a pointer in the
    project's own .agent/stitch.theme.json. It only ever touches that one file in the current
    project; it never edits the installed skill, so the choice survives plugin upgrades and
    each project can sit on its own theme.
---

# reset-theme

This skill runs only when the user explicitly invokes it (a `/reset-theme` command or a
direct request). It is never triggered automatically — switching a project's theme is a
visible, side-effectful change, so the choice is always the user's to start.

Point a project at one stitch-design-system theme. The pointer is a single field,
`activeSite`, in the project's own `.agent/stitch.theme.json`. The companion
`stitch-design-system` skill reads that same pointer when it builds UI, so setting it here
is what makes that skill use the theme you picked. Nothing else is changed.

This skill bundles a small helper — use it, do not hand-edit config or guess a theme name.
It reads the list of themes live from the `stitch-design-system` skill that is installed
next to this one, so the available names are never assumed or hard-coded.

## Available scripts

- **`scripts/theme-pointer.mjs`** — lists the available themes (`--list`) and writes the
  chosen one into a project's `.agent/stitch.theme.json` (`--site <theme> --root <project>`).

## Steps

Run these from this skill's own directory (`cd` into it first); the `scripts/…` paths below
are relative to it. What gets written is set by `--root`, not by where you run from, so it is
always safe to run from here.

1. **List the themes.** Run:

   ```bash
   node scripts/theme-pointer.mjs --list
   ```

   It prints the theme names that are actually available. If it reports none, the
   `stitch-design-system` skill is not installed beside this one — tell the user and stop.

2. **Let the user choose.** Show the listed names and ask the user which one they want. Never
   pick for them, and never offer a name the list did not print.

3. **Write the pointer.** Run the helper with the chosen name and — **required** — the target
   project's root:

   ```bash
   node scripts/theme-pointer.mjs --site <chosen-theme> --root <project-root>
   ```

   `<project-root>` is the project you are theming; the helper writes the pointer to
   `<project-root>/.agent/stitch.theme.json` (creating `.agent/` if needed). It is required
   so the write target is always explicit (never the current directory), which also
   guarantees the helper never writes inside the skill or plugin. The helper refuses any name
   that was not in the list, so it can never leave a pointer the `stitch-design-system` skill
   cannot resolve.

4. **Confirm.** It prints the resolved `activeSite` and the file it wrote. Tell the user the
   project now develops against that theme.

## What it does and does not do

- **Writes exactly one file**: `.agent/stitch.theme.json` in the chosen project, updating
  only `activeSite` and leaving any other keys in that file untouched.
- **Idempotent**: choosing the same theme again produces the identical file.
- **Never edits the installed skill** or anything outside the project, so upgrading the
  plugin never loses the choice.
- **Per project**: two projects can each point at a different theme.

## How this lines up with the rest

The name you set here is the one the `stitch-design-system` skill resolves at read time to
decide which theme to build with. When a preview uses the same theme name to mark its
markup, the preview and this development pointer agree by construction — same name on both
sides, no drift.
