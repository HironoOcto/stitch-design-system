// scripts/lib/merge-tokens.mjs
// Merge contract.css + (page-scale) layer.css + adapter.css into ONE :root.
// Merge order contract → layer → adapter, so ADAPTER STILL WINS on a shared
// custom-property name and the layer sits between (layer beats contract, adapter
// beats layer). Insertion order is kept for pre-existing props; derived
// color-mix()/var() values are copied verbatim (NOT evaluated). ADR 0012 § three-input.
//
// `layerPath` is NULLABLE: falsy → the page-scale layer is skipped and the output
// is exactly the old contract+adapter merge. The skill presets (build:skill / check:skill)
// now pass a REAL layer — the page-scale layer is folded into each preset's tokens.css
// (#24, ADR 0012 决策5). The runtime (vite virtual module) still passes null until #25
// rescopes it, which is why the nullable path stays.
//
// Shared by both build paths (ADR 0007): the package's dist/style.css and the
// skill's references/theme/tokens.css. Header is path-neutral for that reason.
import postcss from 'postcss';
import { readFileSync } from 'node:fs';

function collectRootDecls(css) {
  const map = new Map(); // insertion-ordered
  postcss.parse(css).walkRules(':root', (rule) => {
    rule.walkDecls(/^--/, (decl) => map.set(decl.prop, decl.value));
  });
  return map;
}

export function mergeTokens(contractPath, layerPath, adapterPath, site) {
  const map = collectRootDecls(readFileSync(contractPath, 'utf8'));
  // contract → layer → adapter. Each later source overrides the earlier on a
  // shared prop; a new prop is appended in first-seen order.
  for (const path of [layerPath, adapterPath]) {
    if (!path) continue; // nullable layer (or adapter) → skip
    for (const [prop, val] of collectRootDecls(readFileSync(path, 'utf8'))) {
      map.set(prop, val);
    }
  }
  const body = [...map].map(([p, v]) => `  ${p}: ${v};`).join('\n');
  return (
    `/* generated for site: ${site}. DO NOT EDIT. */\n` +
    `:root {\n${body}\n}\n`
  );
}
