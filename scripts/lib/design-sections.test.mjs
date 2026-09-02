// node --test — extractDesignSections against the real steep DESIGN.md (§6.4/§6.5).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { extractDesignSections } from './design-sections.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const design = resolve(
  here,
  '..',
  '..',
  'sites',
  'steep',
  'source',
  'DESIGN.md',
);

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
