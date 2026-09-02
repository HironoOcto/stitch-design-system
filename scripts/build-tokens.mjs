// scripts/build-tokens.mjs — thin runnable around mergeTokens.
//
// Resolves the active site (stitch.config.json.activeSite, or --site override),
// merges contract.css + sites/<site>/adapter.css, writes the single :root to
// --out (default packages/tokens/dist/tokens.css — a gitignored, self-proving
// artifact, NOT an input to anything downstream; see ADR 0004 / 0007).
//
// Usage: node scripts/build-tokens.mjs [--site <name>] [--out <path>]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { mergeTokens } from './lib/merge-tokens.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--site') out.site = argv[++i];
    else if (argv[i] === '--out') out.out = argv[++i];
  }
  return out;
}

export function resolveSite(cliSite) {
  if (cliSite) return cliSite;
  const cfg = JSON.parse(
    readFileSync(resolve(root, 'stitch.config.json'), 'utf8'),
  );
  if (!cfg.activeSite)
    throw new Error('stitch.config.json: missing "activeSite"');
  return cfg.activeSite;
}

export function buildTokens({ site, out } = {}) {
  const resolvedSite = resolveSite(site);
  const contract = resolve(root, 'packages/tokens/contract.css');
  const adapter = resolve(root, 'sites', resolvedSite, 'adapter.css');
  const outPath = resolve(root, out || 'packages/tokens/dist/tokens.css');
  const css = mergeTokens(contract, adapter, resolvedSite);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, css);
  return { site: resolvedSite, outPath, css };
}

// Run only when invoked directly (not when imported by tests).
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { site, out } = parseArgs(process.argv.slice(2));
  const res = buildTokens({ site, out });
  console.log(`built tokens for site "${res.site}" -> ${res.outPath}`);
}
