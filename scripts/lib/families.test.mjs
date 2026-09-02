// node --test — parseFamilies / renderCatalog against the real families table.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import {
  parseFamilies,
  classification,
  renderCatalog,
  builtFamilyRows,
} from './families.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const table = resolve(here, '..', 'component-families.md');

test('parses the 9 families with members', () => {
  const rows = parseFamilies(table);
  assert.equal(rows.length, 9);
  const general = rows.find((r) => r.family === 'general');
  assert.ok(general.members.includes('Icon'));
  assert.ok(general.members.includes('Button'));
});

test('classification maps component → family', () => {
  const map = classification(parseFamilies(table));
  assert.equal(map.get('Icon'), 'general');
  assert.equal(map.get('Modal'), 'overlays');
});

test('renderCatalog emits a family→members table with reference links', () => {
  const cat = renderCatalog(parseFamilies(table));
  assert.match(cat, /\| Category \| Components \| Reference \|/);
  assert.match(
    cat,
    /\| general \| .*Icon.* \| \[general\.md\]\(references\/components\/general\.md\) \|/,
  );
});

test('deterministic: parsing twice is equal', () => {
  assert.deepEqual(parseFamilies(table), parseFamilies(table));
});

test('builtFamilyRows keeps only families whose <family>.md exists in refsDir', () => {
  const rows = parseFamilies(table);
  const refs = mkdtempSync(join(tmpdir(), 'refs-'));
  // Only two families have a generated ref file; the rest (incl. an unbuilt
  // roadmap family like navigation) are absent from disk.
  writeFileSync(join(refs, 'general.md'), '# general');
  writeFileSync(join(refs, 'overlays.md'), '# overlays');

  const built = builtFamilyRows(rows, refs);
  const names = built.map((r) => r.family);
  assert.deepEqual(names, ['general', 'overlays']);
  // Order follows the source table, not disk order.
  assert.equal(
    built[0].family,
    rows.find((r) => r.family === 'general').family,
  );
});

test('renderCatalog over builtFamilyRows drops unbuilt families (no dead links)', () => {
  const rows = parseFamilies(table);
  const refs = mkdtempSync(join(tmpdir(), 'refs-'));
  // navigation intentionally NOT written → must not appear in the catalog.
  for (const fam of rows.map((r) => r.family)) {
    if (fam === 'navigation') continue;
    writeFileSync(join(refs, `${fam}.md`), `# ${fam}`);
  }
  const cat = renderCatalog(builtFamilyRows(rows, refs));
  assert.doesNotMatch(cat, /navigation/);
  assert.match(cat, /\[general\.md\]/);
});
