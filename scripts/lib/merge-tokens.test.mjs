// node --test — behavior of mergeTokens against the real contract + adapters.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { mergeTokens } from './merge-tokens.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..', '..'); // stitch-design-system/
const contract = resolve(root, 'packages/tokens/contract.css');
const steep = resolve(root, 'sites/steep/adapter.css');
const seline = resolve(root, 'sites/seline/adapter.css');

test('adapter overrides contract on same role var', () => {
  const css = mergeTokens(contract, steep, 'steep');
  // steep's ash-gray muted wins over contract's smoke default.
  assert.match(css, /--stitch-text-muted:\s*#979799;/);
  assert.doesNotMatch(css, /--stitch-text-muted:\s*#a3a6af;/);
});

test('output is a single :root block', () => {
  const css = mergeTokens(contract, steep, 'steep');
  assert.equal(css.match(/:root\s*\{/g)?.length, 1);
});

test('has a DO NOT EDIT header on the first line', () => {
  const css = mergeTokens(contract, steep, 'steep');
  assert.match(css.split('\n')[0], /generated for site: steep\. DO NOT EDIT\./);
});

test('derived color-mix() is copied verbatim, not evaluated to hex', () => {
  const css = mergeTokens(contract, steep, 'steep');
  // accent-hover is 【派生】 in contract; steep does not override it.
  assert.match(
    css,
    /--stitch-accent-hover:\s*color-mix\(in srgb, var\(--stitch-accent\), black 12%\);/,
  );
});

test('【恒定】 contract-only vars survive the merge', () => {
  const css = mergeTokens(contract, steep, 'steep');
  // border-width is 【恒定】 and never overridden by steep.
  assert.match(css, /--stitch-border-width:\s*1px;/);
});

test('idempotent: merging twice is byte-identical', () => {
  const a = mergeTokens(contract, steep, 'steep');
  const b = mergeTokens(contract, steep, 'steep');
  assert.equal(a, b);
});

test('flip: steep vs seline yield different tokens (seline value appears)', () => {
  const s = mergeTokens(contract, steep, 'steep');
  const l = mergeTokens(contract, seline, 'seline');
  assert.notEqual(s, l);
  // seline's cyan-signal accent is present; steep's ink-black accent is not.
  assert.match(l, /--stitch-accent:\s*#3ba6f1;/);
  assert.doesNotMatch(l, /--stitch-accent:\s*#17191c;/);
});

// H4 — generated-tokens invariant, all four clauses in one grep-style guard.
test('H4: single :root + DO NOT EDIT header + verbatim color-mix', () => {
  const css = mergeTokens(contract, seline, 'seline');
  assert.equal(css.match(/:root\s*\{/g).length, 1); // single :root
  assert.match(css.split('\n')[0], /DO NOT EDIT\./); // header
  assert.match(css, /color-mix\(in srgb, var\(--stitch-accent\), black 12%\)/); // verbatim
  assert.doesNotMatch(css, /--stitch-accent-hover:\s*#[0-9a-fA-F]{6}/); // not evaluated
});
