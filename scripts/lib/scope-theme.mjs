// scripts/lib/scope-theme.mjs
// Re-scope a site's per-site values into a `[data-site="<site>"]` block for the
// themes/* export (issue #8) — the opt-in layer that lets a consuming app
// pick/switch themes at runtime. Both inputs hold ONLY 【每站】 values and are the
// site's two PAIRED value-files (ADR 0012):
//   • adapter.css (hand-written): colors / fonts / radii / shadows …
//   • layout.css  (build:layout): the page-scale layer — --stitch-space-* /
//     text scale / layout keys.
// Both are copied onto the role names under one data-site selector so a runtime
// theme-switch reflows layout AND repaints. 恒定/派生 stay in dist/style.css
// :root and follow via var() (never duplicated into the scoped block).
//
// Callers pass this only for a publishable site (four-file quartet, layout.css
// required), so BOTH value-files are guaranteed present — layerPath is required,
// not tolerated-missing.
//
// Sibling of merge-tokens.mjs (which bakes the single default :root into
// style.css). This one does NOT merge contract — the themes/* layer is an
// opt-in override of per-site values only. See ADR 0009.
import postcss from 'postcss';
import { readFileSync } from 'node:fs';

function collectRootDecls(css) {
  const map = new Map(); // insertion-ordered
  postcss.parse(css).walkRules(':root', (rule) => {
    rule.walkDecls(/^--/, (decl) => map.set(decl.prop, decl.value));
  });
  return map;
}

export function scopeAdapter(adapterPath, site, layerPath) {
  // Fold order mirrors mergeTokens (layer → adapter): the layer's page-scale
  // keys and the adapter's per-site keys don't overlap, but on any shared name
  // the hand-written adapter wins, same as the baked :root.
  const map = new Map();
  for (const [p, v] of collectRootDecls(readFileSync(layerPath, 'utf8')))
    map.set(p, v);
  for (const [p, v] of collectRootDecls(readFileSync(adapterPath, 'utf8')))
    map.set(p, v);
  const body = [...map].map(([p, v]) => `  ${p}: ${v};`).join('\n');
  return (
    `/* site theme: ${site}. per-site values only; ` +
    `constants/derived follow from :root. DO NOT EDIT. */\n` +
    `[data-site="${site}"] {\n${body}\n}\n`
  );
}
