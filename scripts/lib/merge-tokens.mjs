// scripts/lib/merge-tokens.mjs
// Merge contract.css + adapter.css into ONE :root. adapter overrides contract
// on same custom-property name; contract insertion order is kept for
// pre-existing props; derived color-mix() values are copied verbatim (NOT
// evaluated to static hex). Draft: skill-build-pipeline.md §6.2.
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

export function mergeTokens(contractPath, adapterPath, site) {
  const map = collectRootDecls(readFileSync(contractPath, 'utf8'));
  for (const [prop, val] of collectRootDecls(
    readFileSync(adapterPath, 'utf8'),
  )) {
    map.set(prop, val); // adapter wins
  }
  const body = [...map].map(([p, v]) => `  ${p}: ${v};`).join('\n');
  return (
    `/* generated for site: ${site}. DO NOT EDIT. */\n` +
    `:root {\n${body}\n}\n`
  );
}
