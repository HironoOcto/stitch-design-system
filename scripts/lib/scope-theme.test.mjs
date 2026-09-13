// node --test — behavior of scopeAdapter against the real site value-files.
// scopeAdapter re-scopes a site's two paired value-files — adapter.css plus the
// page-scale layer layout.css (ADR 0012) — into one `[data-site="<site>"]` block
// for the themes/* export (issue #8), so a runtime theme-switch reflows layout too.
// Both value-files are required (callers only pass publishable sites, quartet-complete).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { scopeAdapter } from './scope-theme.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..', '..'); // stitch-design-system/
const seline = resolve(root, 'sites/seline/adapter.css');
const steep = resolve(root, 'sites/steep/adapter.css');
const selineLayout = resolve(root, 'sites/seline/layout.css');
const steepLayout = resolve(root, 'sites/steep/layout.css');

test('tracer: seline value-files → a [data-site="seline"] block with its per-site accent', () => {
  const css = scopeAdapter(seline, 'seline', selineLayout);
  assert.match(css, /\[data-site="seline"\]\s*\{/);
  assert.match(css, /--stitch-accent:\s*#3ba6f1;/);
});

test('per-site values only — no derived/constant contract vars leak in', () => {
  const css = scopeAdapter(seline, 'seline', selineLayout);
  // derived (color-mix, lives only in contract :root) must NOT be copied
  assert.doesNotMatch(css, /--stitch-accent-hover/);
  assert.doesNotMatch(css, /color-mix\(/);
  // 恒定 contract-only var must NOT be copied (seline value-files never set it)
  assert.doesNotMatch(css, /--stitch-border-width/);
  // never emit a :root selector — the preview layer is scoped under data-site only
  assert.doesNotMatch(css, /:root\s*\{/);
});

test('flip: steep carries its own accent under its own selector, not seline’s', () => {
  const css = scopeAdapter(steep, 'steep', steepLayout);
  assert.match(css, /\[data-site="steep"\]\s*\{/);
  assert.match(css, /--stitch-accent:\s*#17191c;/); // steep ink-black
  assert.doesNotMatch(css, /--stitch-accent:\s*#3ba6f1;/); // not seline's cyan
});

test('DO NOT EDIT header names the site on the first line', () => {
  const css = scopeAdapter(steep, 'steep', steepLayout);
  assert.match(css.split('\n')[0], /site theme: steep\. .*DO NOT EDIT\./);
});

// ADR 0012 (#25): the page-scale layer (sites/<site>/layout.css) is folded into
// the SAME [data-site] block so runtime theme-switch reflows layout too.
test('layer fold: steep block carries its layout.css space/text/layout keys', () => {
  const css = scopeAdapter(steep, 'steep', steepLayout);
  assert.match(css, /\[data-site="steep"\]\s*\{/);
  assert.match(css, /--stitch-section-gap:\s*80px;/); // layout key
  assert.match(css, /--stitch-space-8:\s*8px;/); // spacing key
  assert.match(css, /--stitch-text-body:\s*17px;/); // type-scale key
  assert.match(css, /--stitch-accent:\s*#17191c;/); // adapter per-site value still there
});

test('layer flip: seline section-gap 96 vs steep 80 under their own selectors', () => {
  assert.match(
    scopeAdapter(seline, 'seline', selineLayout),
    /--stitch-section-gap:\s*96px;/,
  );
  assert.match(
    scopeAdapter(steep, 'steep', steepLayout),
    /--stitch-section-gap:\s*80px;/,
  );
});

test('layer fold still leaks no constants/derived into the scoped block', () => {
  const css = scopeAdapter(seline, 'seline', selineLayout);
  assert.doesNotMatch(css, /--stitch-accent-hover/); // derived color-mix
  assert.doesNotMatch(css, /color-mix\(/);
  assert.doesNotMatch(css, /--stitch-border-width/); // contract-only constant
  assert.doesNotMatch(css, /:root\s*\{/);
});
