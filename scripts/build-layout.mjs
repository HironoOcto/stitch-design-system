// scripts/build-layout.mjs — build:layout (ADR 0012).
// Writes sites/<site>/layout.css (the page-scale layer) for EVERY publishable site
// (#7 listPublishableSites — zero hardcoded site names), from that site's
// source/variables.css via the pure extractLayout(). Deterministic & idempotent:
// re-running with the same frozen source is byte-for-byte identical. The file is
// committed, carries a DO NOT EDIT header, and contains only --stitch-* (H6).
//
// This is a GENERATED, not hand-written, layer: unlike adapter.css (which needs
// judgement — grey convergence, accent-role arbitration, contrast review),
// build:layout is a mechanical rename with just three normalizations, all inside
// extractLayout. No value is chosen here.
//
// Usage: node scripts/build-layout.mjs        (all publishable sites)
//        node scripts/build-layout.mjs --site steep   (one site)
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { extractLayout } from './lib/extract-layout.mjs';
import { listPublishableSites } from './lib/publishable-sites.mjs';

// Path-neutral (no site name) so it never trips the boundary/H6 no-leak clause.
export const LAYOUT_HEADER =
  '/* generated from source/variables.css by build:layout. DO NOT EDIT. */';

/** Pure: the full layout.css text for one site (header + extracted :root). No write. */
export function layoutFileFor(root, site) {
  const vars = readFileSync(
    resolve(root, 'sites', site, 'source/variables.css'),
    'utf8',
  );
  return `${LAYOUT_HEADER}\n${extractLayout(vars)}`;
}

/**
 * Write layout.css for the given sites (default: every publishable site).
 * @param {{ root: string, sites?: string[] }} opts
 * @returns {{ sites: string[], files: string[] }}
 */
export function buildLayout({ root, sites } = {}) {
  const targets = sites ?? listPublishableSites(root);
  const files = [];
  for (const site of targets) {
    const outPath = join(resolve(root, 'sites', site), 'layout.css');
    writeFileSync(outPath, layoutFileFor(root, site));
    files.push(outPath);
  }
  return { sites: targets, files };
}

function parseArgs(argv) {
  const i = argv.indexOf('--site');
  return i !== -1 && argv[i + 1] ? { sites: [argv[i + 1]] } : {};
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const here = dirname(fileURLToPath(import.meta.url));
  const root = resolve(here, '..'); // stitch-design-system/
  const { sites } = parseArgs(process.argv.slice(2));
  const res = buildLayout({ root, sites });
  console.log(
    `build:layout ✓ → ${res.sites.length} site(s): {${res.sites.join(', ')}}`,
  );
}
