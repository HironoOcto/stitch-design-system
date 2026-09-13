// node --test — build-layout: writes one sites/<site>/layout.css per site that has
// an adapter.css (layout is adapter's value-file peer) from that site's
// source/variables.css. Guards structural Hook H6's file-level
// clauses: DO NOT EDIT header, only --stitch-*, idempotent, no site-name/foreign leak,
// and that the COMMITTED file stays in sync with a regeneration (like check:skill does
// for presets). ADR 0012.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { layoutFileFor, LAYOUT_HEADER } from './build-layout.mjs';
import { listAdapterSites } from './lib/publishable-sites.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SITES = listAdapterSites(root);
const committed = (s) => resolve(root, 'sites', s, 'layout.css');

test('there is at least one adapter site to build a layer for', () => {
  assert.ok(SITES.length >= 1, 'expected ≥1 site with an adapter.css');
});

test('first line is exactly the generated / DO NOT EDIT header', () => {
  for (const s of SITES) {
    const first = layoutFileFor(root, s).split('\n')[0];
    assert.equal(first, LAYOUT_HEADER);
    assert.match(first, /generated .*by build:layout\. DO NOT EDIT\./);
  }
});

test('every produced file contains ONLY --stitch-* declarations, single :root (H6)', () => {
  for (const s of SITES) {
    const css = layoutFileFor(root, s);
    assert.equal(css.match(/:root\s*\{/g).length, 1, `${s}: single :root`);
    const bad = css
      .split('\n')
      .filter((l) => /^\s*--/.test(l) && !/^\s*--stitch-/.test(l));
    assert.equal(bad.length, 0, `${s}: non-stitch prop: ${bad}`);
  }
});

test('no site name / no source hex / no foreign --var leaks into the file (H6)', () => {
  const allSites = ['steep', 'phantom', 'seline', 'saybriefly'];
  for (const s of SITES) {
    const css = layoutFileFor(root, s);
    assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}\b/, `${s}: source hex leaked`);
    assert.doesNotMatch(css, /--(?!stitch-)[a-z]+-/, `${s}: foreign --var`);
    for (const name of allSites)
      assert.doesNotMatch(
        css,
        new RegExp(`\\b${name}\\b`, 'i'),
        `${s}: site name "${name}" leaked`,
      );
  }
});

test('idempotent: regenerating a site is byte-identical', () => {
  for (const s of SITES)
    assert.equal(layoutFileFor(root, s), layoutFileFor(root, s));
});

test('committed sites/<site>/layout.css == regeneration (in sync, run build:layout)', () => {
  for (const s of SITES) {
    assert.ok(
      existsSync(committed(s)),
      `missing committed layout.css for ${s}`,
    );
    assert.equal(
      readFileSync(committed(s), 'utf8'),
      layoutFileFor(root, s),
      `${s}/layout.css out of sync — run npm run build:layout`,
    );
  }
});
