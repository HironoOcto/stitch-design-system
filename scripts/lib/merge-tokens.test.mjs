// node --test — behavior of mergeTokens against the real contract + adapters.
// Signature is now THREE inputs: mergeTokens(contract, layer, adapter, site),
// merge order contract → layer → adapter (adapter still wins). layer is nullable
// (falsy → skipped) so the skill-preset / runtime call points keep their products
// byte-identical this issue (ADR 0012; layer fold-in is #24 / #25). Guards H6 / H4.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { tmpdir } from 'node:os';
import { mergeTokens } from './merge-tokens.mjs';
import { extractLayout } from './extract-layout.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..', '..'); // stitch-design-system/
const contract = resolve(root, 'packages/tokens/contract.css');
const steep = resolve(root, 'sites/steep/adapter.css');
const seline = resolve(root, 'sites/seline/adapter.css');

// A real layer for a site, written to a temp file (mergeTokens takes paths).
const tmp = mkdtempSync(join(tmpdir(), 'merge-tokens-'));
const layerOf = (site) => {
  const vars = readFileSync(
    resolve(root, 'sites', site, 'source/variables.css'),
    'utf8',
  );
  const p = join(tmp, `${site}.layout.css`);
  writeFileSync(p, extractLayout(vars));
  return p;
};
const steepLayer = layerOf('steep');

test('adapter overrides contract on same role var', () => {
  const css = mergeTokens(contract, steepLayer, steep, 'steep');
  // steep's ink-black link wins over the contract's slate-gray default.
  assert.match(css, /--stitch-link:\s*#17191c;/);
  assert.doesNotMatch(css, /--stitch-link:\s*#777b86;/);
});

test('layer contributes page-scale tokens the contract never had', () => {
  const css = mergeTokens(contract, steepLayer, steep, 'steep');
  assert.match(css, /--stitch-space-160:\s*160px;/); // beyond contract's xs..xl
  assert.match(css, /--stitch-section-gap:\s*80px;/); // layout key
  assert.match(css, /--stitch-text-display:\s*90px;/); // full type scale
});

test('nullable layer: mergeTokens(contract, null, adapter) omits the page-scale layer', () => {
  const withLayer = mergeTokens(contract, steepLayer, steep, 'steep');
  const noLayer = mergeTokens(contract, null, steep, 'steep');
  assert.match(withLayer, /--stitch-space-160:/);
  assert.doesNotMatch(noLayer, /--stitch-space-160:/); // layer skipped
  // adapter + contract still merge exactly as before the signature change.
  assert.match(noLayer, /--stitch-link:\s*#17191c;/);
});

test('三输入 precedence — adapter wins over layer wins over contract', () => {
  // Synthetic fixtures pinning one shared prop through all three tiers.
  const c = join(tmp, 'c.css');
  const l = join(tmp, 'l.css');
  const a = join(tmp, 'a.css');
  writeFileSync(c, ':root {\n  --stitch-demo: from-contract;\n}\n');
  writeFileSync(l, ':root {\n  --stitch-demo: from-layer;\n}\n');
  writeFileSync(a, ':root {\n  --stitch-demo: from-adapter;\n}\n');
  assert.match(mergeTokens(c, l, a, 'x'), /--stitch-demo:\s*from-adapter;/);
  // layer beats contract when adapter is silent on the prop
  writeFileSync(a, ':root {\n  --stitch-other: y;\n}\n');
  assert.match(mergeTokens(c, l, a, 'x'), /--stitch-demo:\s*from-layer;/);
});

test('output is a single :root block', () => {
  const css = mergeTokens(contract, steepLayer, steep, 'steep');
  assert.equal(css.match(/:root\s*\{/g)?.length, 1);
});

test('has a DO NOT EDIT header on the first line', () => {
  const css = mergeTokens(contract, steepLayer, steep, 'steep');
  assert.match(css.split('\n')[0], /generated for site: steep\. DO NOT EDIT\./);
});

test('derived color-mix() is copied verbatim, not evaluated to hex', () => {
  const css = mergeTokens(contract, steepLayer, steep, 'steep');
  assert.match(
    css,
    /--stitch-accent-hover:\s*color-mix\(in srgb, var\(--stitch-accent\), black 12%\);/,
  );
});

test('P1 alias var() survives verbatim (not evaluated) when the layer is folded in', () => {
  const css = mergeTokens(contract, steepLayer, steep, 'steep');
  // contract's aliased spacing keeps its var(--stitch-space-N, …) form (H4).
  assert.match(css, /--stitch-spacing-md:\s*var\(--stitch-space-12, 12px\);/);
});

test('【恒定】 contract-only vars survive the merge', () => {
  const css = mergeTokens(contract, steepLayer, steep, 'steep');
  assert.match(css, /--stitch-border-width:\s*1px;/);
});

test('idempotent: merging twice is byte-identical', () => {
  const a = mergeTokens(contract, steepLayer, steep, 'steep');
  const b = mergeTokens(contract, steepLayer, steep, 'steep');
  assert.equal(a, b);
});

test('flip: steep vs seline yield different tokens (seline value appears)', () => {
  const s = mergeTokens(contract, steepLayer, steep, 'steep');
  const l = mergeTokens(contract, layerOf('seline'), seline, 'seline');
  assert.notEqual(s, l);
  assert.match(l, /--stitch-accent:\s*#3ba6f1;/);
  assert.doesNotMatch(l, /--stitch-accent:\s*#17191c;/);
});

// H4 — generated-tokens invariant, all four clauses in one grep-style guard.
test('H4: single :root + DO NOT EDIT header + verbatim color-mix', () => {
  const css = mergeTokens(contract, layerOf('seline'), seline, 'seline');
  assert.equal(css.match(/:root\s*\{/g).length, 1);
  assert.match(css.split('\n')[0], /DO NOT EDIT\./);
  assert.match(css, /color-mix\(in srgb, var\(--stitch-accent\), black 12%\)/);
  assert.doesNotMatch(css, /--stitch-accent-hover:\s*#[0-9a-fA-F]{6}/);
});
