// scripts/build-skill.mjs — build:skill (§4.1–4.2, §4.4②, §4.5; issue #9 / ADR 0010).
// Assemble the theme presets into the one skill. Pure, deterministic, idempotent: it only
// merges / copies / injects frozen inputs — no LLM, no clock, no randomness. Re-running
// with the same sources is byte-for-byte identical, which is what lets "switch the
// consumer's pointer → the skill files don't change, only which preset the AI reads" hold.
//
// Publish time defines the DEFAULT; consume time picks the active preset (read-time
// resolution, see scripts/lib/resolve-preset.mjs + SKILL.md "Current style"). So build:skill
// emits a preset for EVERY publishable site (#7 listPublishableSites), not just one:
//   ① references/theme-presets/<site>/tokens.css = mergeTokens(contract, layer, adapter, site) (§4.1, H4)
//      layer = sites/<site>/layout.css (the page-scale layer, build:layout output). Per ADR 0012
//      决策5 the layer is FOLDED INTO this one tokens.css (no separate layout.css in the skill) —
//      so the AI reads one token file and sees the complete scale (--stitch-space-*, the full
//      --stitch-text-<role> type scale, the four layout keys) alongside the component roles.
//      Three-input merge, adapter still wins; the contract's --stitch-spacing-* aliases now
//      resolve to the folded-in --stitch-space-N.
//   ② references/theme-presets/<site>/rules.md    = sites/<site>/rules.md               (verbatim)
//   ③ references/theme-presets/<site>/style.md    = the two skill-blurb.md sections     (verbatim)
//   ⑥ references/theme-presets/<site>/composition.md = sites/<site>/composition.md (verbatim, OPTIONAL —
//      the pure-prose composition layer, #30/#31; copied only when the site authored one)
//   ④ references/theme/design-rules.md            = docs/.../design-rules.md            (global, once)
//   ⑤ SKILL.md SLOT:default-site                  = the published-default site name
// The published default = stitch.config.json `activeSite` (override with `--site`), = the
// npm package default skin, so a consumer with no pointer lands on the same theme as npm.
// The non-deterministic blurb generation lives in build:blurb (frozen to disk); build:skill
// only READS that product — never re-rolls it.
import {
  readFileSync,
  writeFileSync,
  copyFileSync,
  mkdirSync,
  existsSync,
} from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { mergeTokens } from './lib/merge-tokens.mjs';
import { replaceSlot } from './lib/slot.mjs';
import { parseBlurb } from './build-blurb.mjs';
import { listPublishableSites } from './lib/publishable-sites.mjs';

// Read stitch.config.json's activeSite (the published default). --site overrides it.
export function resolveSite(root, argv = []) {
  const flagIdx = argv.indexOf('--site');
  if (flagIdx !== -1 && argv[flagIdx + 1]) return argv[flagIdx + 1];
  const cfgPath = resolve(root, 'stitch.config.json');
  const cfg = JSON.parse(readFileSync(cfgPath, 'utf8'));
  if (!cfg.activeSite)
    throw new Error(
      `stitch.config.json has no "activeSite" (and no --site given)`,
    );
  return cfg.activeSite;
}

function must(path, label) {
  if (!existsSync(path))
    throw new Error(`build:skill: missing ${label} — ${path}`);
  return path;
}

// The two frozen blurb sections re-emitted as the preset's style.md, in the same
// `## description` / `## style-paragraph` shape so it round-trips through parseBlurb.
function renderStyleMd({ description, styleParagraph }) {
  return `## description\n${description}\n\n## style-paragraph\n${styleParagraph}\n`;
}

/**
 * Assemble every theme preset into the skill and record the published default.
 * Deterministic; returns a report. @param {{ root, site, skillDir? }} opts
 */
export function buildSkill({ root, site, skillDir }) {
  const contract = must(
    resolve(root, 'packages/tokens/contract.css'),
    'contract.css',
  );
  const designRules = must(
    resolve(root, 'docs/design-system/design-rules.md'),
    'docs/design-system/design-rules.md',
  );

  const skill = skillDir ?? resolve(root, 'skills/stitch-design-system');
  const skillMd = must(
    join(skill, 'SKILL.md'),
    'SKILL.md (skeleton with slots)',
  );

  const presetSites = listPublishableSites(root);
  if (!presetSites.includes(site))
    throw new Error(
      `build:skill: default site "${site}" is not publishable (triad incomplete)`,
    );

  // ①②③ one preset per publishable site — tokens.css (H4), rules.md, style.md.
  const presetsRoot = join(skill, 'references/theme-presets');
  for (const s of presetSites) {
    const adapter = must(
      resolve(root, 'sites', s, 'adapter.css'),
      `sites/${s}/adapter.css`,
    );
    // Page-scale layer (build:layout output). Committed per publishable site; folded in here.
    const layer = must(
      resolve(root, 'sites', s, 'layout.css'),
      `sites/${s}/layout.css (run build:layout first)`,
    );
    const rules = must(
      resolve(root, 'sites', s, 'rules.md'),
      `sites/${s}/rules.md`,
    );
    const blurbPath = must(
      resolve(root, 'sites', s, 'skill-blurb.md'),
      `sites/${s}/skill-blurb.md (run build:blurb ${s} first)`,
    );
    const dir = join(presetsRoot, s);
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, 'tokens.css'),
      mergeTokens(contract, layer, adapter, s),
    );
    copyFileSync(rules, join(dir, 'rules.md'));
    writeFileSync(
      join(dir, 'style.md'),
      renderStyleMd(parseBlurb(readFileSync(blurbPath, 'utf8'))),
    );
    // ⑥ composition.md — the pure-prose composition layer (#30/#31): OPTIONAL, not part
    //    of the publishable quartet. Copied VERBATIM (byte-exact, like rules.md) only when
    //    the site has authored one; a site without it gets NO composition.md in its preset.
    //    Conditional by design → parity in check:skill is likewise conditional (Hook H7);
    //    it adds no token slot and touches no contract/adapter/component.
    const composition = resolve(root, 'sites', s, 'composition.md');
    if (existsSync(composition))
      copyFileSync(composition, join(dir, 'composition.md'));
  }

  // ④ global, theme-neutral rules — one copy, shared by every preset.
  const themeDir = join(skill, 'references/theme');
  mkdirSync(themeDir, { recursive: true });
  copyFileSync(designRules, join(themeDir, 'design-rules.md'));

  // ⑤ record the published default in SKILL.md (the read-time fallback). The style prose
  //    is NOT baked here anymore — it lives per-preset and is resolved at read time.
  let src = readFileSync(skillMd, 'utf8');
  src = replaceSlot(src, 'default-site', site, '   ');
  writeFileSync(skillMd, src);

  return {
    site,
    presetSites,
    presets: presetSites.map((s) => `references/theme-presets/${s}`),
    // Which presets received the optional composition.md (source-present sites only).
    compositionSites: presetSites.filter((s) =>
      existsSync(resolve(root, 'sites', s, 'composition.md')),
    ),
    designRules: 'references/theme/design-rules.md',
    slots: ['default-site'],
  };
}

function main(argv) {
  const here = dirname(fileURLToPath(import.meta.url));
  const root = resolve(here, '..'); // stitch-design-system/
  const site = resolveSite(root, argv);
  const report = buildSkill({ root, site });
  console.log(
    `build:skill ✓ default=${report.site} → presets {${report.presetSites.join(', ')}} ` +
      `(composition.md: {${report.compositionSites.join(', ') || '—'}}) ` +
      `+ ${report.designRules} + SKILL.md slot {${report.slots.join(', ')}}`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2));
}
