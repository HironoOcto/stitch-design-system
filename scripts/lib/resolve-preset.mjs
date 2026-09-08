// scripts/lib/resolve-preset.mjs
// Read-time preset resolution (issue #9, ADR 0010). The skill embeds ONE style
// preset per publishable site under `references/theme-presets/<site>/`; which one
// is active is a per-consuming-project choice, not baked at publish time. This is
// the seam the SKILL.md "current style" section describes in prose so an AI can
// perform it, and the seam check:skill exercises to prove the pointer works.
//
// Invariant kept (ADR 0005): the skill still presents exactly ONE theme at any
// moment — only WHERE the "which" decision lives moved (publish time → consume time).
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Which site's preset is active for a consuming project.
 * @param {string} consumerRoot  the consuming project root (holds stitch.config.json)
 * @param {string} publishedDefault  the default baked at build time (= npm default skin)
 * @returns {string}  consumer's stitch.config.json `activeSite`, else publishedDefault
 *
 * A missing / malformed / activeSite-less consumer config is not an error — it is the
 * zero-config path: the consumer gets the published default, matching the npm package.
 */
export function resolveActiveSite(consumerRoot, publishedDefault) {
  const cfgPath = resolve(consumerRoot, 'stitch.config.json');
  if (!existsSync(cfgPath)) return publishedDefault;
  try {
    const cfg = JSON.parse(readFileSync(cfgPath, 'utf8'));
    return cfg && cfg.activeSite ? cfg.activeSite : publishedDefault;
  } catch {
    return publishedDefault;
  }
}

/** In-skill path of one preset file (skill-relative, one dir per site). */
export function presetPath(site, file) {
  return `references/theme-presets/${site}/${file}`;
}
