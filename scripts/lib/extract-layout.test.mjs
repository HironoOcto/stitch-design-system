// node --test — extract-layout: the pure variables.css → page-scale :root mapping.
// Reads each site's real source/variables.css (frozen Refero bundle) and asserts the
// deterministic rename + the three normalizations (ADR 0012 「决策(已定)」条4). Guards
// structural Hook H6's "only --stitch-* / 缺角色不生成" clauses at the pure-function seam.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { extractLayout } from './extract-layout.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..', '..'); // stitch-design-system/
const varsOf = (site) =>
  readFileSync(resolve(root, 'sites', site, 'source/variables.css'), 'utf8');

const ALL_SITES = ['steep', 'phantom', 'seline', 'saybriefly'];

test('tracer: steep type scale role is renamed to --stitch-text-<role>', () => {
  const css = extractLayout(varsOf('steep'));
  assert.match(css, /--stitch-text-display:\s*90px;/);
});

test('leading + tracking of a present role are carried alongside text', () => {
  const css = extractLayout(varsOf('steep'));
  assert.match(css, /--stitch-leading-display:\s*1\.3;/);
  assert.match(css, /--stitch-tracking-display:\s*-2\.25px;/);
});

test('缺角色不生成: a role absent from the source is never emitted', () => {
  // seline has no --text-body (it jumps caption → body-lg); steep has no --text-micro.
  // Match the colon so --stitch-text-body-lg (a distinct role) isn't caught.
  assert.doesNotMatch(extractLayout(varsOf('seline')), /--stitch-text-body:/);
  assert.doesNotMatch(extractLayout(varsOf('steep')), /--stitch-text-micro:/);
});

test('缺轴不生成: a role with size but no tracking gets no --stitch-tracking-*', () => {
  // steep --text-caption has size + leading but no --tracking-caption in source.
  const css = extractLayout(varsOf('steep'));
  assert.match(css, /--stitch-text-caption:\s*15px;/);
  assert.doesNotMatch(css, /--stitch-tracking-caption\b/);
});

test('word-list boundary: --text-body vs --text-body-lg map to distinct roles', () => {
  // saybriefly has both --text-body(18) and --text-body-lg(20): no prefix collision.
  const css = extractLayout(varsOf('saybriefly'));
  assert.match(css, /--stitch-text-body:\s*18px;/);
  assert.match(css, /--stitch-text-body-lg:\s*20px;/);
});

test('归一化①: phantom --element-gap range 8-16px → lower bound 8px', () => {
  const css = extractLayout(varsOf('phantom'));
  assert.match(css, /--stitch-element-gap:\s*8px;/);
  assert.doesNotMatch(css, /8-16px/);
});

test('归一化②: saybriefly 8px base — --spacing-8 → --stitch-space-8, no --stitch-space-4', () => {
  const css = extractLayout(varsOf('saybriefly'));
  assert.match(css, /--stitch-space-8:\s*8px;/);
  assert.match(css, /--stitch-space-120:\s*120px;/);
  assert.doesNotMatch(css, /--stitch-space-4\b/); // saybriefly has no --spacing-4
});

test('归一化③: --spacing-unit → --stitch-space-unit (per-site metadata)', () => {
  assert.match(extractLayout(varsOf('steep')), /--stitch-space-unit:\s*4px;/);
  assert.match(
    extractLayout(varsOf('saybriefly')),
    /--stitch-space-unit:\s*8px;/,
  );
});

test('layout four keys are all prefixed (steep)', () => {
  const css = extractLayout(varsOf('steep'));
  assert.match(css, /--stitch-page-max-width:\s*1200px;/);
  assert.match(css, /--stitch-section-gap:\s*80px;/);
  assert.match(css, /--stitch-card-padding:\s*20px;/);
  assert.match(css, /--stitch-element-gap:\s*8px;/);
});

test('big spacing beyond the contract (steep --stitch-space-160) is captured', () => {
  assert.match(extractLayout(varsOf('steep')), /--stitch-space-160:\s*160px;/);
});

test('every site: output is a single :root and contains ONLY --stitch-* props (H6)', () => {
  for (const s of ALL_SITES) {
    const css = extractLayout(varsOf(s));
    assert.equal(css.match(/:root\s*\{/g).length, 1, `${s}: single :root`);
    const bad = css
      .split('\n')
      .filter((l) => /^\s*--/.test(l) && !/^\s*--stitch-/.test(l));
    assert.equal(bad.length, 0, `${s}: non-stitch prop leaked: ${bad}`);
  }
});

test('drops colors / radius / shadow / weight / font-family / surfaces', () => {
  for (const s of ALL_SITES) {
    const css = extractLayout(varsOf(s));
    for (const stem of [
      'color',
      'radius',
      'shadow',
      'weight',
      'font',
      'surface',
    ])
      assert.doesNotMatch(
        css,
        new RegExp(`--stitch-${stem}`),
        `${s}: leaked ${stem}`,
      );
    assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}\b/, `${s}: leaked source hex`);
  }
});

test('idempotent: extracting the same source twice is byte-identical', () => {
  const a = extractLayout(varsOf('phantom'));
  const b = extractLayout(varsOf('phantom'));
  assert.equal(a, b);
});
