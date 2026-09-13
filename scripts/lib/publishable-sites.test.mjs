// node --test — behavior of listAdapterSites / listPublishableSites against the
// real sites/ and throwaway fixtures.
//   • listAdapterSites: a site is "has values" iff it has adapter.css (layout.css
//     is its generated peer — see build:layout).
//   • listPublishableSites: a site is "publishable" iff all four of the quartet
//     {adapter.css, layout.css, rules.md, skill-blurb.md} are present (ADR 0012 修正).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import {
  listAdapterSites,
  listPublishableSites,
} from './publishable-sites.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..', '..'); // stitch-design-system/

test('real sites/ → listAdapterSites = every site with an adapter.css', () => {
  // phantom + seline + steep have adapter.css; saybriefly only has {README.md,
  // source/} and is excluded (no adapter → no values).
  assert.deepEqual(listAdapterSites(root), ['phantom', 'seline', 'steep']);
});

test('real sites/ → listPublishableSites = the quartet-complete sites, stably sorted', () => {
  // Today phantom + seline + steep carry the full quartet {adapter.css,
  // layout.css, rules.md, skill-blurb.md} (layout.css committed by build:layout),
  // so the publishable set is unchanged — only the criterion widened to quartet.
  assert.deepEqual(listPublishableSites(root), ['phantom', 'seline', 'steep']);
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

const QUARTET = ['adapter.css', 'layout.css', 'rules.md', 'skill-blurb.md'];

test('missing any one quartet member → site excluded from publishable', () => {
  const { fixtureRoot, cleanup } = makeFixture([
    ['whole', QUARTET], // complete → kept
    ['no-adapter', ['layout.css', 'rules.md', 'skill-blurb.md']],
    ['no-layout', ['adapter.css', 'rules.md', 'skill-blurb.md']], // values half-paired
    ['no-rules', ['adapter.css', 'layout.css', 'skill-blurb.md']],
    ['no-blurb', ['adapter.css', 'layout.css', 'rules.md']],
    ['bare', ['README.md']], // saybriefly shape → excluded
  ]);
  try {
    assert.deepEqual(listPublishableSites(fixtureRoot), ['whole']);
  } finally {
    cleanup();
  }
});

test('adapter-only / adapter+docs-minus-layout → in listAdapterSites, out of publishable', () => {
  const { fixtureRoot, cleanup } = makeFixture([
    ['whole', QUARTET],
    ['adapter-only', ['adapter.css']], // has values, mid-onboarding
    ['no-layout', ['adapter.css', 'rules.md', 'skill-blurb.md']],
    ['bare', ['README.md']], // no adapter → out of both
  ]);
  try {
    // discovered by "has adapter" (what demo/build:layout key off)
    assert.deepEqual(listAdapterSites(fixtureRoot), [
      'adapter-only',
      'no-layout',
      'whole',
    ]);
    // but only the quartet-complete one is publishable
    assert.deepEqual(listPublishableSites(fixtureRoot), ['whole']);
  } finally {
    cleanup();
  }
});

test('output is stably sorted regardless of on-disk creation order', () => {
  const { fixtureRoot, cleanup } = makeFixture([
    ['zeta', QUARTET],
    ['alpha', QUARTET],
    ['mid', QUARTET],
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
