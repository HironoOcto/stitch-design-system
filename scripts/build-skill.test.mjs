// node --test — build:skill orchestration against the real repo sources (issue #9).
// build:skill now emits ONE preset per publishable site (references/theme-presets/<site>/*)
// plus the global design-rules.md, and injects only the published-default site name into
// SKILL.md — the style prose lives per-preset and is resolved at read time, not baked here.
// Runs into a throwaway skillDir (copy of the real SKILL.md skeleton) so the test never
// clobbers the committed skill. Covers: presets for every publishable site, H4 on each
// tokens.css, rules.md == stripTrace(source) (#34), style.md == blurb two sections, default-site slot,
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
import { stripTrace } from './lib/strip-trace.mjs';

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

test('each preset tokens.css == mergeTokens(contract, layer, that site adapter) with H4 features', () => {
  const skillDir = seedSkillDir();
  buildSkill({ root, site: 'steep', skillDir });
  for (const s of SITES) {
    const css = readFileSync(
      join(skillDir, 'references/theme-presets', s, 'tokens.css'),
      'utf8',
    );
    // ADR 0012 决策5: build:skill folds the page-scale layer (sites/<s>/layout.css)
    // INTO the one preset tokens.css — three-input mergeTokens, adapter still wins.
    const expected = mergeTokens(
      resolve(root, 'packages/tokens/contract.css'),
      resolve(root, 'sites', s, 'layout.css'),
      resolve(root, 'sites', s, 'adapter.css'),
      s,
    );
    assert.equal(css, expected, `${s}/tokens.css == recomputed mergeTokens`);
    assert.equal(css.match(/:root\s*\{/g).length, 1, `${s}: single :root`);
    assert.match(css.split('\n')[0], /generated.*DO NOT EDIT/, `${s}: header`);
    assert.match(css, /color-mix\(/, `${s}: color-mix verbatim`);
  }
});

test('the folded preset carries the whole page-scale layer + resolvable spacing aliases', () => {
  const skillDir = seedSkillDir();
  buildSkill({ root, site: 'steep', skillDir });
  const decls = (css) =>
    new Map(
      [...css.matchAll(/^\s*(--stitch-[\w-]+):\s*(.+?);\s*$/gm)].map((m) => [
        m[1],
        m[2],
      ]),
    );
  for (const s of SITES) {
    const tokens = decls(
      readFileSync(
        join(skillDir, 'references/theme-presets', s, 'tokens.css'),
        'utf8',
      ),
    );
    // (a) every --stitch-* the site's layout.css defines is present in the fold-in.
    const layer = decls(
      readFileSync(resolve(root, 'sites', s, 'layout.css'), 'utf8'),
    );
    for (const prop of layer.keys())
      assert.ok(
        tokens.has(prop),
        `${s}: layer prop ${prop} folded into tokens.css`,
      );
    // (b) the stable layout schema (four keys) is present.
    for (const k of [
      '--stitch-page-max-width',
      '--stitch-section-gap',
      '--stitch-card-padding',
      '--stitch-element-gap',
    ])
      assert.ok(tokens.has(k), `${s}: layout key ${k} present`);
    // (c) the P1 spacing aliases resolve: each --stitch-spacing-* is a var(--stitch-space-N,…)
    //     whose referenced --stitch-space-N is now defined in the SAME file.
    for (const [prop, val] of tokens) {
      if (!/^--stitch-spacing-/.test(prop)) continue;
      const ref = val.match(/var\((--stitch-space-\d+)/);
      assert.ok(
        ref,
        `${s}: ${prop} is a var(--stitch-space-N,…) alias, got "${val}"`,
      );
      assert.ok(
        tokens.has(ref[1]),
        `${s}: alias ${prop} → ${ref[1]} resolves within tokens.css`,
      );
    }
  }
});

test('composition.md is a 4th preset file — == stripTrace(source) iff the site has one (#35)', () => {
  // Pure-prose composition layer (#30/#31): OPTIONAL. Like rules.md (#34→#35), the SOURCE
  // keeps its DESIGN.md 追溯（可剥 trace 表 + ← 尾注）；build:skill 迁移时 stripTrace 剥掉可剥位置
  // → preset consumer-clean。build:skill emits theme-presets/<site>/composition.md ==
  // stripTrace(source) when the source exists, and NO composition.md for a site without one.
  const skillDir = seedSkillDir();
  buildSkill({ root, site: 'steep', skillDir });
  let sawSource = false;
  for (const s of SITES) {
    const src = resolve(root, 'sites', s, 'composition.md');
    const preset = join(
      skillDir,
      'references/theme-presets',
      s,
      'composition.md',
    );
    if (existsSync(src)) {
      sawSource = true;
      assert.ok(
        existsSync(preset),
        `${s}: has source composition.md → preset must exist`,
      );
      const got = readFileSync(preset, 'utf8');
      const expected = stripTrace(readFileSync(src, 'utf8'), {
        label: `sites/${s}/composition.md`,
      });
      assert.equal(
        got,
        expected,
        `${s}/composition.md must equal stripTrace(source)`,
      );
      // preset consumer-clean: no DESIGN.md 追溯, no twin cross-ref (见 adapter/adapter.css/variables.css)
      assert.doesNotMatch(
        got,
        /DESIGN\.md/,
        `${s}/composition.md preset must be consumer-clean (no DESIGN.md)`,
      );
      assert.doesNotMatch(
        got,
        /adapter\.css|variables\.css|见\s*adapter/,
        `${s}/composition.md preset must not cross-ref its twin`,
      );
    } else {
      assert.ok(
        !existsSync(preset),
        `${s}: no source composition.md → preset must NOT exist`,
      );
    }
  }
  assert.ok(
    sawSource,
    'expected at least one publishable site with composition.md (steep)',
  );
});

test('each preset rules.md == stripTrace(sites/<site>/rules.md) (#34, was byte-exact)', () => {
  // 源 rules.md 保留 DESIGN.md 来源追溯；build:skill 迁移时 stripTrace 剥掉可剥位置的追溯。
  // preset 必须正好是剥离产物：既不多剥（丢内容）也不少剥（漏 DESIGN.md）。
  const skillDir = seedSkillDir();
  buildSkill({ root, site: 'steep', skillDir });
  for (const s of SITES) {
    const preset = readFileSync(
      join(skillDir, 'references/theme-presets', s, 'rules.md'),
      'utf8',
    );
    const expected = stripTrace(
      readFileSync(resolve(root, 'sites', s, 'rules.md'), 'utf8'),
      { label: `sites/${s}/rules.md` },
    );
    assert.equal(
      preset,
      expected,
      `${s}/rules.md must equal stripTrace(source)`,
    );
    assert.doesNotMatch(
      preset,
      /DESIGN\.md/,
      `${s}/rules.md preset consumer-clean`,
    );
  }
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
