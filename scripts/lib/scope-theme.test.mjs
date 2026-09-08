// node --test — behavior of scopeAdapter against the real site adapters.
// scopeAdapter re-scopes a site's adapter.css :root (per-site values only) into
// a `[data-site="<site>"]` block for the preview-only themes/* export (issue #8).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { scopeAdapter } from './scope-theme.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..', '..'); // stitch-design-system/
const seline = resolve(root, 'sites/seline/adapter.css');
const steep = resolve(root, 'sites/steep/adapter.css');

test('tracer: seline adapter → a [data-site="seline"] block with its per-site accent', () => {
  const css = scopeAdapter(seline, 'seline');
  assert.match(css, /\[data-site="seline"\]\s*\{/);
  assert.match(css, /--stitch-accent:\s*#3ba6f1;/);
});

test('per-site values only — no derived/constant contract vars leak in', () => {
  const css = scopeAdapter(seline, 'seline');
  // derived (color-mix, lives only in contract :root) must NOT be copied
  assert.doesNotMatch(css, /--stitch-accent-hover/);
  assert.doesNotMatch(css, /color-mix\(/);
  // 恒定 contract-only var must NOT be copied (seline adapter never sets it)
  assert.doesNotMatch(css, /--stitch-border-width/);
  // never emit a :root selector — the preview layer is scoped under data-site only
  assert.doesNotMatch(css, /:root\s*\{/);
});

test('flip: steep carries its own accent under its own selector, not seline’s', () => {
  const css = scopeAdapter(steep, 'steep');
  assert.match(css, /\[data-site="steep"\]\s*\{/);
  assert.match(css, /--stitch-accent:\s*#17191c;/); // steep ink-black
  assert.doesNotMatch(css, /--stitch-accent:\s*#3ba6f1;/); // not seline's cyan
});

test('DO NOT EDIT header names the site on the first line', () => {
  const css = scopeAdapter(steep, 'steep');
  assert.match(css.split('\n')[0], /site theme: steep\. .*DO NOT EDIT\./);
});
