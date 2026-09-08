// node --test — build:skill orchestration against the real repo sources (issue #9).
// build:skill now emits ONE preset per publishable site (references/theme-presets/<site>/*)
// plus the global design-rules.md, and injects only the published-default site name into
// SKILL.md — the style prose lives per-preset and is resolved at read time, not baked here.
// Runs into a throwaway skillDir (copy of the real SKILL.md skeleton) so the test never
// clobbers the committed skill. Covers: presets for every publishable site, H4 on each
// tokens.css, byte-exact rules copies, style.md == blurb two sections, default-site slot,
// theme-neutral description, and idempotence.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, copyFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { buildSkill, resolveSite } from './build-skill.mjs';
import { mergeTokens } from './lib/merge-tokens.mjs';
import { parseBlurb } from './build-blurb.mjs';
import { listPublishableSites } from './lib/publishable-sites.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..'); // stitch-design-system/
const realSkill = resolve(root, 'skills/stitch-design-system');
const SITES = listPublishableSites(root);

// Seed a throwaway skillDir with a copy of the real SKILL.md skeleton.
function seedSkillDir() {
  const dir = mkdtempSync(join(tmpdir(), 'build-skill-'));
  copyFileSync(join(realSkill, 'SKILL.md'), join(dir, 'SKILL.md'));
  return dir;
}
const slotBody = (src, name) => {
  const open = src.indexOf(`<!-- SLOT:${name}`);
  const openEnd = src.indexOf('-->', open);
  const close = src.indexOf(`<!-- /SLOT:${name} -->`, openEnd);
  return src.slice(openEnd + 3, close).trim();
};

test('resolveSite: --site overrides, else stitch.config.json activeSite', () => {
  const activeSite = JSON.parse(
    readFileSync(resolve(root, 'stitch.config.json'), 'utf8'),
  ).activeSite;
  assert.equal(resolveSite(root, ['--site', 'seline']), 'seline');
  assert.equal(resolveSite(root, []), activeSite);
});

test('a preset (tokens.css + rules.md + style.md) lands for EVERY publishable site', () => {
  const skillDir = seedSkillDir();
  buildSkill({ root, site: 'steep', skillDir });
  for (const s of SITES)
    for (const f of ['tokens.css', 'rules.md', 'style.md'])
      assert.ok(
        existsSync(join(skillDir, 'references/theme-presets', s, f)),
        `theme-presets/${s}/${f} should exist`,
      );
});

test('preset site set == listPublishableSites (no extra, none missing)', () => {
  const skillDir = seedSkillDir();
  const report = buildSkill({ root, site: 'steep', skillDir });
  assert.deepEqual(report.presetSites, SITES);
});

test('global design-rules.md still lands once under references/theme/', () => {
  const skillDir = seedSkillDir();
  buildSkill({ root, site: 'steep', skillDir });
  assert.ok(
    existsSync(join(skillDir, 'references/theme/design-rules.md')),
    'references/theme/design-rules.md should exist (global, theme-neutral)',
  );
});

test('each preset tokens.css == mergeTokens(contract, that site adapter) with H4 features', () => {
  const skillDir = seedSkillDir();
  buildSkill({ root, site: 'steep', skillDir });
  for (const s of SITES) {
    const css = readFileSync(
      join(skillDir, 'references/theme-presets', s, 'tokens.css'),
      'utf8',
    );
    const expected = mergeTokens(
      resolve(root, 'packages/tokens/contract.css'),
      resolve(root, 'sites', s, 'adapter.css'),
      s,
    );
    assert.equal(css, expected, `${s}/tokens.css == recomputed mergeTokens`);
    assert.equal(css.match(/:root\s*\{/g).length, 1, `${s}: single :root`);
    assert.match(css.split('\n')[0], /generated.*DO NOT EDIT/, `${s}: header`);
    assert.match(css, /color-mix\(/, `${s}: color-mix verbatim`);
  }
});

test('each preset rules.md is a byte-exact copy of sites/<site>/rules.md', () => {
  const skillDir = seedSkillDir();
  buildSkill({ root, site: 'steep', skillDir });
  const bytesEqual = (a, b) => readFileSync(a).equals(readFileSync(b));
  for (const s of SITES)
    assert.ok(
      bytesEqual(
        join(skillDir, 'references/theme-presets', s, 'rules.md'),
        resolve(root, 'sites', s, 'rules.md'),
      ),
      `${s}/rules.md must equal its site source byte-for-byte`,
    );
});

test('each preset style.md carries the two blurb sections verbatim', () => {
  const skillDir = seedSkillDir();
  buildSkill({ root, site: 'steep', skillDir });
  for (const s of SITES) {
    const styleMd = readFileSync(
      join(skillDir, 'references/theme-presets', s, 'style.md'),
      'utf8',
    );
    const fromStyle = parseBlurb(styleMd);
    const fromBlurb = parseBlurb(
      readFileSync(resolve(root, 'sites', s, 'skill-blurb.md'), 'utf8'),
    );
    assert.deepEqual(fromStyle, fromBlurb, `${s}: style.md == blurb sections`);
  }
});

test('SKILL.md records the published default site in the default-site slot', () => {
  const skillDir = seedSkillDir();
  buildSkill({ root, site: 'steep', skillDir });
  const skill = readFileSync(join(skillDir, 'SKILL.md'), 'utf8');
  assert.equal(slotBody(skill, 'default-site'), 'steep');
  // re-build with the other default → slot follows
  const other = SITES.find((s) => s !== 'steep');
  buildSkill({ root, site: other, skillDir });
  assert.equal(
    slotBody(readFileSync(join(skillDir, 'SKILL.md'), 'utf8'), 'default-site'),
    other,
  );
});

test('SKILL.md description is theme-neutral: no site name, no baked style prose', () => {
  const skillDir = seedSkillDir();
  buildSkill({ root, site: 'steep', skillDir });
  const skill = readFileSync(join(skillDir, 'SKILL.md'), 'utf8');
  const fm = (skill.match(/^---\n([\s\S]*?)\n---/) || ['', ''])[1];
  for (const s of SITES)
    assert.doesNotMatch(fm, new RegExp(`\\b${s}\\b`, 'i'), `no "${s}" in fm`);
  // no per-site blurb description got baked into the frontmatter
  for (const s of SITES) {
    const { description } = parseBlurb(
      readFileSync(resolve(root, 'sites', s, 'skill-blurb.md'), 'utf8'),
    );
    assert.ok(!fm.includes(description), `no ${s} blurb description in fm`);
  }
});

test('idempotent: same default + sources re-run → byte-identical products', () => {
  const skillDir = seedSkillDir();
  buildSkill({ root, site: 'steep', skillDir });
  const files = [
    'SKILL.md',
    'references/theme/design-rules.md',
    ...SITES.flatMap((s) => [
      `references/theme-presets/${s}/tokens.css`,
      `references/theme-presets/${s}/rules.md`,
      `references/theme-presets/${s}/style.md`,
    ]),
  ];
  const snap = () => files.map((f) => readFileSync(join(skillDir, f), 'utf8'));
  const first = snap();
  buildSkill({ root, site: 'steep', skillDir });
  const second = snap();
  assert.deepEqual(second, first, 'build:skill must be byte-idempotent');
});
