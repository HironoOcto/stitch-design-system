// node --test — behavior of the reset-theme skill's self-contained helper (issue #10).
// The helper ships inside the skill under scripts/; this test sits in the skill's tests/
// dir (a maintainer artifact, kept out of scripts/ which is for agent-run code).
// Exercises the two public seams through their real signatures, against throwaway
// consumer roots and a throwaway "installed plugin" layout — never the real skill,
// never git. The properties under test are the ones the issue pins:
//   · write ONLY the consumer's .agent/stitch.theme.json activeSite pointer
//   · idempotent (re-pick same theme = byte-identical)
//   · never touch any installed-plugin file (upgrade-safe)
//   · enumerate themes dynamically from the sibling skill (zero hardcoded names)
//   · the pointer round-trips through #9's read-time resolution
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  readdirSync,
  existsSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { applyTheme, listThemes, run } from '../scripts/theme-pointer.mjs';
import { resolveActiveSite } from '../../../scripts/lib/resolve-preset.mjs';

const here = dirname(fileURLToPath(import.meta.url)); // skills/reset-theme/tests/
// The reset-theme skill root is this test's parent dir (holds SKILL.md + scripts/).
const skillRoot = resolve(here, '..');

function tmp(prefix) {
  return mkdtempSync(join(tmpdir(), prefix));
}

// Snapshot every file under a dir as { relPath -> contents }, for change detection.
function snapshotDir(root) {
  const snap = {};
  const walk = (dir) => {
    for (const ent of readdirSync(dir, { withFileTypes: true })) {
      const abs = join(dir, ent.name);
      if (ent.isDirectory()) walk(abs);
      else snap[abs] = readFileSync(abs, 'utf8');
    }
  };
  walk(root);
  return snap;
}

// A throwaway plugin layout: skills/reset-theme + a sibling stitch-design-system
// carrying theme-presets/<name>/. Returns the plugin root and the reset-theme skill root.
function makePluginFixture(themes) {
  const plugin = tmp('plugin-');
  mkdirSync(join(plugin, 'skills', 'reset-theme'), { recursive: true });
  writeFileSync(
    join(plugin, 'skills', 'reset-theme', 'SKILL.md'),
    '# marker\n',
  );
  const presets = join(
    plugin,
    'skills',
    'stitch-design-system',
    'references',
    'theme-presets',
  );
  for (const name of themes) {
    mkdirSync(join(presets, name), { recursive: true });
    writeFileSync(join(presets, name, 'tokens.css'), ':root{}\n');
  }
  return { plugin, skillRoot: join(plugin, 'skills', 'reset-theme') };
}

test('applyTheme on a fresh project creates .agent/stitch.theme.json with the chosen activeSite', () => {
  const consumer = tmp('consumer-');
  const result = applyTheme(consumer, 'steep');

  const cfgPath = join(consumer, '.agent', 'stitch.theme.json');
  assert.ok(existsSync(cfgPath), '.agent/stitch.theme.json was created');
  assert.equal(JSON.parse(readFileSync(cfgPath, 'utf8')).activeSite, 'steep');
  assert.equal(result.activeSite, 'steep');
  assert.equal(result.path, cfgPath);
});

test('applyTheme is idempotent — re-picking the same theme is byte-identical', () => {
  const consumer = tmp('consumer-');
  const cfgPath = join(consumer, '.agent', 'stitch.theme.json');

  applyTheme(consumer, 'steep');
  const first = readFileSync(cfgPath);
  applyTheme(consumer, 'steep');
  const second = readFileSync(cfgPath);

  assert.ok(first.equals(second), 'second write is byte-for-byte identical');
});

test("applyTheme updates the pointer in place, preserving the project's other config keys", () => {
  const consumer = tmp('consumer-');
  const cfgPath = join(consumer, '.agent', 'stitch.theme.json');
  mkdirSync(join(consumer, '.agent'), { recursive: true });
  writeFileSync(
    cfgPath,
    JSON.stringify({ activeSite: 'seline', somethingElse: { keep: true } }),
  );

  applyTheme(consumer, 'steep');

  const cfg = JSON.parse(readFileSync(cfgPath, 'utf8'));
  assert.equal(cfg.activeSite, 'steep', 'pointer updated');
  assert.deepEqual(cfg.somethingElse, { keep: true }, 'sibling keys preserved');
});

test('applyTheme writes only the consumer config — the installed plugin is untouched', () => {
  const { plugin } = makePluginFixture(['one', 'two']);
  const before = snapshotDir(plugin);

  const consumer = tmp('consumer-');
  applyTheme(consumer, 'one');

  const after = snapshotDir(plugin);
  assert.deepEqual(
    after,
    before,
    'no installed-plugin file was added, removed, or modified',
  );
  // and the pointer really did land in the consumer, outside the plugin tree
  assert.ok(existsSync(join(consumer, '.agent', 'stitch.theme.json')));
});

test("listThemes enumerates the sibling skill's presets dynamically, stably sorted", () => {
  const { skillRoot: root } = makePluginFixture(['zeta', 'alpha', 'mid']);
  assert.deepEqual(listThemes(root), ['alpha', 'mid', 'zeta']);
});

test('listThemes returns [] when the sibling skill has no presets (no crash)', () => {
  const { skillRoot: root } = makePluginFixture([]);
  assert.deepEqual(listThemes(root), []);
});

// End-to-end against the REAL sibling skill: reset-theme lists a real theme, writes the
// consumer pointer to it, and #9's read-time resolver (the other end of the seam) reads
// that same pointer back — with the resolved theme's preset actually present in the skill.
test('the written pointer round-trips through #9 read-time resolution', () => {
  const themes = listThemes(skillRoot);
  assert.ok(themes.length >= 1, 'real sibling skill ships at least one theme');
  const pick = themes.includes('steep') ? 'steep' : themes[0];

  const consumer = tmp('consumer-');
  applyTheme(consumer, pick);

  // published default is deliberately a DIFFERENT theme so a stale fallback can't pass
  const publishedDefault = themes.find((t) => t !== pick) ?? pick;
  assert.equal(resolveActiveSite(consumer, publishedDefault), pick);

  const presetDir = resolve(
    skillRoot,
    '..',
    'stitch-design-system',
    'references',
    'theme-presets',
    pick,
  );
  assert.ok(
    existsSync(presetDir),
    `preset dir for "${pick}" exists in the skill`,
  );
});

test('run --list reports the available themes without writing anything', () => {
  const { plugin, skillRoot: root } = makePluginFixture(['one', 'two']);
  const before = snapshotDir(plugin);

  const res = run(['--list'], { skillRoot: root });

  assert.equal(res.action, 'list');
  assert.deepEqual(res.themes, ['one', 'two']);
  assert.deepEqual(snapshotDir(plugin), before, 'plugin untouched on --list');
});

test('run --site rejects a theme the sibling does not offer', () => {
  const { skillRoot: root } = makePluginFixture(['one', 'two']);
  const consumer = tmp('consumer-');
  assert.throws(
    () => run(['--site', 'nope', '--root', consumer], { skillRoot: root }),
    /nope/,
    'error names the bad pick',
  );
  assert.ok(
    !existsSync(join(consumer, '.agent', 'stitch.theme.json')),
    'nothing written when the pick is invalid',
  );
});

test('run --site requires --root — it never writes based on the current directory', () => {
  const { skillRoot: root } = makePluginFixture(['one', 'two']);
  assert.throws(
    () => run(['--site', 'two'], { skillRoot: root }),
    /--root/,
    'a write without an explicit target project is refused',
  );
});

test('run --site --root writes the pointer into the named project', () => {
  const { skillRoot: root } = makePluginFixture(['one', 'two']);
  const consumer = tmp('consumer-');
  const res = run(['--site', 'two', '--root', consumer], { skillRoot: root });

  assert.equal(res.action, 'apply');
  assert.equal(res.activeSite, 'two');
  assert.equal(
    JSON.parse(
      readFileSync(join(consumer, '.agent', 'stitch.theme.json'), 'utf8'),
    ).activeSite,
    'two',
  );
});
