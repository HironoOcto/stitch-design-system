// scripts/lib/scope-theme.mjs
// Re-scope a site's adapter.css :root into a `[data-site="<site>"]` block for
// the themes/* export (issue #8) — the opt-in per-site layer that lets a
// consuming app pick/switch themes at runtime. adapter.css holds ONLY 【每站】
// values, so this copies exactly those onto the role names under a data-site
// selector; 恒定/派生 stay in dist/style.css :root and follow via var().
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

export function scopeAdapter(adapterPath, site) {
  const map = collectRootDecls(readFileSync(adapterPath, 'utf8'));
  const body = [...map].map(([p, v]) => `  ${p}: ${v};`).join('\n');
  return (
    `/* site theme: ${site}. per-site values only; ` +
    `constants/derived follow from :root. DO NOT EDIT. */\n` +
    `[data-site="${site}"] {\n${body}\n}\n`
  );
}
