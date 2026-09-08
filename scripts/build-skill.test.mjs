// node --test — build:skill orchestration against the real repo sources.
// Runs into a throwaway skillDir (copy of the real SKILL.md skeleton) so the test
// never clobbers the committed skill. Covers: products in place, H4 on tokens.css,
// byte-exact rule copies, both blurb slots filled, and idempotence.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtempSync,
  mkdirSync,
  copyFileSync,
  readFileSync,
  existsSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { buildSkill, resolveSite } from './build-skill.mjs';
import { mergeTokens } from './lib/merge-tokens.mjs';
import { parseBlurb } from './build-blurb.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..'); // stitch-design-system/
const realSkill = resolve(root, 'skills/stitch-design-system');

// Seed a throwaway skillDir with a copy of the real SKILL.md skeleton.
function seedSkillDir() {
  const dir = mkdtempSync(join(tmpdir(), 'build-skill-'));
  copyFileSync(join(realSkill, 'SKILL.md'), join(dir, 'SKILL.md'));
  mkdirSync(join(dir, 'references/theme'), { recursive: true });
  return dir;
}

test('resolveSite: --site overrides, else stitch.config.json activeSite', () => {
  // Read the repo's current activeSite instead of hardcoding it — this test
  // guards "resolveSite reads the config", not which site happens to be active.
  const activeSite = JSON.parse(
    readFileSync(resolve(root, 'stitch.config.json'), 'utf8'),
  ).activeSite;
  assert.equal(resolveSite(root, ['--site', 'seline']), 'seline');
  assert.equal(resolveSite(root, []), activeSite);
});

test('products land in references/theme/ for the active site', () => {
  const skillDir = seedSkillDir();
  buildSkill({ root, site: 'steep', skillDir });
  for (const f of ['tokens.css', 'design-rules.md', 'rules.md']) {
    assert.ok(
      existsSync(join(skillDir, 'references/theme', f)),
      `${f} should exist`,
    );
  }
});

test('tokens.css == mergeTokens(contract, steep adapter) with H4 features', () => {
  const skillDir = seedSkillDir();
  buildSkill({ root, site: 'steep', skillDir });
  const css = readFileSync(
    join(skillDir, 'references/theme/tokens.css'),
    'utf8',
  );
  const expected = mergeTokens(
    resolve(root, 'packages/tokens/contract.css'),
    resolve(root, 'sites/steep/adapter.css'),
    'steep',
  );
  assert.equal(css, expected); // recomputed-expected comparison
  // H4: single :root + first-line DO NOT EDIT + color-mix() verbatim (not hex).
  assert.equal(css.match(/:root\s*\{/g).length, 1);
  assert.match(css.split('\n')[0], /generated.*DO NOT EDIT/);
  assert.match(css, /color-mix\(/);
});

test('design-rules.md / rules.md are byte-exact copies of their sources', () => {
  const skillDir = seedSkillDir();
  buildSkill({ root, site: 'steep', skillDir });
  const bytesEqual = (a, b) => readFileSync(a).equals(readFileSync(b));
  assert.ok(
    bytesEqual(
      join(skillDir, 'references/theme/design-rules.md'),
      resolve(root, 'docs/design-system/design-rules.md'),
    ),
    'design-rules.md must equal its global source byte-for-byte',
  );
  assert.ok(
    bytesEqual(
      join(skillDir, 'references/theme/rules.md'),
      resolve(root, 'sites/steep/rules.md'),
    ),
    'rules.md must equal sites/steep/rules.md byte-for-byte',
  );
});

test('SKILL.md two slots filled from skill-blurb.md, verbatim + valid YAML indent', () => {
  const skillDir = seedSkillDir();
  buildSkill({ root, site: 'steep', skillDir });
  const skill = readFileSync(join(skillDir, 'SKILL.md'), 'utf8');
  const { description, styleParagraph } = parseBlurb(
    readFileSync(resolve(root, 'sites/steep/skill-blurb.md'), 'utf8'),
  );
  // both sections present verbatim…
  assert.ok(skill.includes(description), 'description injected verbatim');
  assert.ok(
    skill.includes(styleParagraph),
    'style-paragraph injected verbatim',
  );
  // …no placeholder residue…
  assert.doesNotMatch(skill, /【槽/);
  // …and the description line stays indented 4 under the YAML block scalar.
  assert.match(
    skill,
    new RegExp(
      `\\n {4}${description.slice(0, 20).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
    ),
  );
});

test('idempotent: same site + sources re-run → byte-identical products', () => {
  const skillDir = seedSkillDir();
  buildSkill({ root, site: 'steep', skillDir });
  const snap = (f) => readFileSync(join(skillDir, f), 'utf8');
  const first = {
    tokens: snap('references/theme/tokens.css'),
    design: snap('references/theme/design-rules.md'),
    rules: snap('references/theme/rules.md'),
    skill: snap('SKILL.md'),
  };
  buildSkill({ root, site: 'steep', skillDir });
  assert.equal(snap('references/theme/tokens.css'), first.tokens);
  assert.equal(snap('references/theme/design-rules.md'), first.design);
  assert.equal(snap('references/theme/rules.md'), first.rules);
  assert.equal(snap('SKILL.md'), first.skill);
});
