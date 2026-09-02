// scripts/build-skill.mjs — build:skill (§4.1–4.2, §4.4②, §4.5).
// Assemble the CURRENTLY ACTIVE theme into the one skill. Pure, deterministic,
// idempotent: it only merges / copies / injects frozen inputs — no LLM, no clock,
// no randomness. Re-running with the same site + same sources is byte-for-byte
// identical, which is what lets "switch theme → everything else diffs empty" hold.
//
// Three things (all deterministic file ops):
//   ① tokens.css   = mergeTokens(contract, sites/<site>/adapter.css, site)   (§4.1)
//   ② copy         = docs/design-system/design-rules.md + sites/<site>/rules.md (§4.2, verbatim)
//   ③ inject       = sites/<site>/skill-blurb.md's two sections → SKILL.md's
//                    SLOT:description / SLOT:style-paragraph                   (§4.4②)
//
// Site: stitch.config.json `activeSite`, overridable with `--site <name>`.
// The non-deterministic blurb generation lives in build:blurb (frozen to disk);
// build:skill only READS that product — never re-rolls it.
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

// Read stitch.config.json's activeSite (the current theme). --site overrides it.
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

/**
 * Assemble the active theme into the skill. Deterministic; returns a report.
 * @param {{ root: string, site: string, skillDir?: string }} opts
 */
export function buildSkill({ root, site, skillDir }) {
  const contract = must(
    resolve(root, 'packages/tokens/contract.css'),
    'contract.css',
  );
  const adapter = must(
    resolve(root, 'sites', site, 'adapter.css'),
    `sites/${site}/adapter.css`,
  );
  const rules = must(
    resolve(root, 'sites', site, 'rules.md'),
    `sites/${site}/rules.md`,
  );
  const designRules = must(
    resolve(root, 'docs/design-system/design-rules.md'),
    'docs/design-system/design-rules.md',
  );
  const blurbPath = must(
    resolve(root, 'sites', site, 'skill-blurb.md'),
    `sites/${site}/skill-blurb.md (run build:blurb ${site} first)`,
  );

  const skill = skillDir ?? resolve(root, 'skills/stitch-design-system');
  const skillMd = must(
    join(skill, 'SKILL.md'),
    'SKILL.md (skeleton with slots)',
  );
  const themeDir = join(skill, 'references/theme');
  mkdirSync(themeDir, { recursive: true });

  // ① tokens.css — single :root, DO NOT EDIT header, color-mix() verbatim (H4).
  writeFileSync(
    join(themeDir, 'tokens.css'),
    mergeTokens(contract, adapter, site),
  );

  // ② byte-exact copies of the two rule sources (global + this theme's look).
  copyFileSync(designRules, join(themeDir, 'design-rules.md'));
  copyFileSync(rules, join(themeDir, 'rules.md'));

  // ③ inject the frozen blurb's two sections into SKILL.md's slots. The
  //    description slot lives inside a `description: >` YAML block scalar, so its
  //    body must stay indented 4 spaces; style-paragraph is markdown body (flush).
  const { description, styleParagraph } = parseBlurb(
    readFileSync(blurbPath, 'utf8'),
  );
  let src = readFileSync(skillMd, 'utf8');
  src = replaceSlot(src, 'description', description, '    ');
  src = replaceSlot(src, 'style-paragraph', styleParagraph);
  writeFileSync(skillMd, src);

  return {
    site,
    theme: ['tokens.css', 'design-rules.md', 'rules.md'].map((f) =>
      join('references/theme', f),
    ),
    slots: ['description', 'style-paragraph'],
  };
}

function main(argv) {
  const here = dirname(fileURLToPath(import.meta.url));
  const root = resolve(here, '..'); // stitch-design-system/
  const site = resolveSite(root, argv);
  const report = buildSkill({ root, site });
  console.log(
    `build:skill ✓ site=${report.site} → ${report.theme.join(', ')} ` +
      `+ SKILL.md slots {${report.slots.join(', ')}}`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2));
}
