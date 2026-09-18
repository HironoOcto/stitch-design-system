// node --test — extractDesignSections against the real steep DESIGN.md (§6.4/§6.5).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import {
  extractDesignSections,
  extractComposition,
} from './design-sections.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(here, '..', '..', 'sites');
const design = resolve(siteRoot, 'steep', 'source', 'DESIGN.md');

test('subtitle is the "> …" quote under the H1', () => {
  const { subtitle } = extractDesignSections(design);
  assert.equal(subtitle, 'serif analytics on warm paper');
});

test('styleParagraph is the prose after **Theme:**, non-empty, single line', () => {
  const { styleParagraph } = extractDesignSections(design);
  assert.ok(styleParagraph.length > 0, 'styleParagraph must be non-empty');
  assert.doesNotMatch(styleParagraph, /\n/, 'collected into one line');
  assert.match(styleParagraph, /^Steep renders analytics as editorial/);
});

test("dosDonts is the whole ## Do's and Don'ts section", () => {
  const { dosDonts } = extractDesignSections(design);
  assert.match(dosDonts, /^## Do's and Don'ts/);
});

test('deterministic: extracting twice is equal', () => {
  assert.deepEqual(
    extractDesignSections(design),
    extractDesignSections(design),
  );
});

// extractComposition — the OPTIONAL second style source (#36). Present → the
// consumer-clean prose (stripTrace of the source: no <!-- trace --> table, no `←`
// trailers, no DESIGN.md leakage). Absent → null, so build:blurb degrades to
// DESIGN.md-only (the pre-#36 behavior).
test('extractComposition returns stripTrace-clean prose for a site that authored one', () => {
  const composition = resolve(siteRoot, 'steep', 'composition.md');
  const prose = extractComposition(composition);
  assert.ok(prose, 'steep authored a composition.md');
  // consumer-clean: no maintainer trace container, no ← trailers, no DESIGN.md
  assert.doesNotMatch(prose, /<!--\s*trace/);
  assert.doesNotMatch(prose, /←/);
  assert.doesNotMatch(prose, /DESIGN\.md/);
  // the corrected ground truth survived (the real steep backdrop the DESIGN spec denies)
  assert.match(prose, /氛围铺底/);
});

test('extractComposition returns null when the site authored none (degrade signal)', () => {
  const absent = resolve(siteRoot, 'saybriefly', 'composition.md');
  assert.equal(extractComposition(absent), null);
});
