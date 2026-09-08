// reset-theme's self-contained helper (issue #10). Ships INSIDE the skill so it runs
// from the installed plugin — no repo, no network, no hardcoded site names.
//
// One job: point a consuming project at a theme. `listThemes` enumerates the themes
// that ship in the sibling stitch-design-system skill (same plugin); `applyTheme`
// writes/updates ONLY the consumer's own .agent/stitch.theme.json `activeSite`. Which
// theme is then active is resolved at read time by the stitch-design-system skill — this
// helper only moves the pointer, it never touches any installed-plugin file.
import {
  readFileSync,
  writeFileSync,
  readdirSync,
  mkdirSync,
  existsSync,
} from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// The consumer's theme pointer lives under the project's agent directory (not the project
// root, and deliberately NOT named stitch.config.json — that name belongs to the design
// system's own build config, a different file for a different role).
const POINTER = ['.agent', 'stitch.theme.json'];

// The sibling stitch-design-system skill's preset root, relative to THIS skill's ROOT
// dir (the folder holding SKILL.md, one level above this scripts/ file). Both skills ship
// in the same plugin under skills/<name>/, so the sibling is a stable in-plugin path —
// not an external dependency. Theme names are the subdir names there, read live: nothing
// about a site is hardcoded here.
const SIBLING_PRESETS = [
  '..',
  'stitch-design-system',
  'references',
  'theme-presets',
];

// This script lives in <skill root>/scripts/, so the skill root is its parent dir.
const skillRootFromHere = () =>
  resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * The themes a consumer can choose, enumerated live from the sibling skill.
 * @param {string} skillRoot  this (reset-theme) skill's root directory (holds SKILL.md)
 * @returns {string[]}        theme names, stably (lexicographically) sorted; [] if none
 */
export function listThemes(skillRoot) {
  const dir = resolve(skillRoot, ...SIBLING_PRESETS);
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
}

/**
 * Create or update the consuming project's theme pointer.
 * @param {string} consumerRoot  the consuming project root (holds .agent/stitch.theme.json)
 * @param {string} site          the chosen theme name
 * @returns {{ path: string, activeSite: string, created: boolean }}
 */
export function applyTheme(consumerRoot, site) {
  const path = resolve(consumerRoot, ...POINTER);
  const created = !existsSync(path);
  // Update the pointer in place: merge onto any existing config so a project's
  // other keys survive. A missing / malformed file is treated as empty (start fresh).
  let existing = {};
  if (!created) {
    try {
      const parsed = JSON.parse(readFileSync(path, 'utf8'));
      if (parsed && typeof parsed === 'object') existing = parsed;
    } catch {
      existing = {};
    }
  }
  mkdirSync(dirname(path), { recursive: true }); // ensure <root>/.agent/ exists
  const next = { ...existing, activeSite: site };
  writeFileSync(path, JSON.stringify(next, null, 2) + '\n');
  return { path, activeSite: site, created };
}

/**
 * Drive the helper from argv. `--list` returns the available themes; `--site <name>
 * --root <project>` validates the pick against the live theme list (never write a pointer
 * to a theme the skill can't resolve) and updates that project's pointer. `--root` is
 * REQUIRED for a write: the target project is always explicit, never inferred from the
 * shell's current directory — so it works the same whether the shell sits in the skill
 * dir or the project, and the helper can never write inside the skill/plugin by accident.
 * `skillRoot` (where the sibling themes are read from) is injectable for testing.
 * @param {string[]} argv
 * @param {{ skillRoot?: string }} [opts]
 */
export function run(argv, { skillRoot = skillRootFromHere() } = {}) {
  const themes = listThemes(skillRoot);
  const flag = (name) => {
    const i = argv.indexOf(name);
    return i !== -1 ? (argv[i + 1] ?? true) : undefined;
  };

  if (argv.includes('--list') || argv.length === 0) {
    return { action: 'list', themes };
  }

  const site = flag('--site');
  if (typeof site !== 'string') {
    throw new Error(
      'reset-theme: expected `--list`, or `--site <theme> --root <project>`',
    );
  }
  if (!themes.includes(site)) {
    throw new Error(
      `reset-theme: "${site}" is not an available theme. Available: ${themes.join(', ') || '(none)'}`,
    );
  }
  const root = flag('--root');
  if (typeof root !== 'string') {
    throw new Error(
      'reset-theme: `--site` requires `--root <project>` — the project whose ' +
        '.agent/stitch.theme.json to update (the write target is never the current directory).',
    );
  }
  return { action: 'apply', ...applyTheme(resolve(root), site) };
}

function main(argv) {
  const res = run(argv);
  if (res.action === 'list') {
    if (!res.themes.length) {
      console.log(
        'reset-theme: no themes found in the stitch-design-system skill.',
      );
      return;
    }
    console.log('Available themes:');
    for (const t of res.themes) console.log(`  - ${t}`);
    console.log(
      '\nPick one, then re-run with:  --site <theme> --root <project>',
    );
  } else {
    console.log(`reset-theme ✓ activeSite=${res.activeSite} → ${res.path}`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    main(process.argv.slice(2));
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
