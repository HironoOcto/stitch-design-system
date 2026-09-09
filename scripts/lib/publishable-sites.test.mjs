// node --test — behavior of listPublishableSites against the real sites/ and
// throwaway fixtures. A site is "publishable" iff all three of the triad
// {adapter.css, rules.md, skill-blurb.md} are present (§ issue #7).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { listPublishableSites } from './publishable-sites.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..', '..'); // stitch-design-system/

test('real sites/ → only the triad-complete sites, stably sorted', () => {
  // seline + steep carry the full triad; phantom + saybriefly only have
  // {README.md, source/} and must be excluded.
  assert.deepEqual(listPublishableSites(root), ['seline', 'steep']);
});

// Build a throwaway root/sites/ so the real publish products stay untouched.
// Each entry: [siteName, filesToWrite]. Returns { fixtureRoot, cleanup }.
function makeFixture(sites) {
  const fixtureRoot = mkdtempSync(join(tmpdir(), 'pub-sites-'));
  const sitesDir = join(fixtureRoot, 'sites');
  for (const [name, files] of sites) {
    const dir = join(sitesDir, name);
    mkdirSync(dir, { recursive: true });
    for (const f of files) writeFileSync(join(dir, f), '');
  }
  return {
    fixtureRoot,
    cleanup: () => rmSync(fixtureRoot, { recursive: true }),
  };
}

const TRIAD = ['adapter.css', 'rules.md', 'skill-blurb.md'];

test('missing any one triad member → site excluded', () => {
  const { fixtureRoot, cleanup } = makeFixture([
    ['whole', TRIAD], // complete → kept
    ['no-adapter', ['rules.md', 'skill-blurb.md']],
    ['no-rules', ['adapter.css', 'skill-blurb.md']],
    ['no-blurb', ['adapter.css', 'rules.md']],
    ['bare', ['README.md']], // phantom/saybriefly shape → excluded
  ]);
  try {
    assert.deepEqual(listPublishableSites(fixtureRoot), ['whole']);
  } finally {
    cleanup();
  }
});

test('output is stably sorted regardless of on-disk creation order', () => {
  const { fixtureRoot, cleanup } = makeFixture([
    ['zeta', TRIAD],
    ['alpha', TRIAD],
    ['mid', TRIAD],
  ]);
  try {
    assert.deepEqual(listPublishableSites(fixtureRoot), [
      'alpha',
      'mid',
      'zeta',
    ]);
  } finally {
    cleanup();
  }
});
