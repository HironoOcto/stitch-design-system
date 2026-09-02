// node --test — config-driven behavior of the build-tokens runnable.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { buildTokens } from './build-tokens.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const scratch = resolve(root, 'packages/tokens/dist/__test__');

test.after(() => rmSync(scratch, { recursive: true, force: true }));

test('reads activeSite from stitch.config.json (steep)', () => {
  // stitch.config.json is committed as { activeSite: "steep" }.
  const { site, css } = buildTokens({
    out: 'packages/tokens/dist/__test__/a.css',
  });
  assert.equal(site, 'steep');
  assert.match(css, /--stitch-text-muted:\s*#979799;/); // steep value
});

test('--site overrides activeSite (seline)', () => {
  const { site, css } = buildTokens({
    site: 'seline',
    out: 'packages/tokens/dist/__test__/b.css',
  });
  assert.equal(site, 'seline');
  assert.match(css, /--stitch-accent:\s*#3ba6f1;/); // seline value
});

test('--out controls where the artifact lands', () => {
  const rel = 'packages/tokens/dist/__test__/custom.css';
  const { outPath } = buildTokens({ out: rel });
  assert.equal(outPath, resolve(root, rel));
  const onDisk = readFileSync(outPath, 'utf8');
  assert.match(onDisk, /generated for site: steep\. DO NOT EDIT\./);
});

test('flip via --site changes the written artifact', () => {
  const s = buildTokens({
    site: 'steep',
    out: 'packages/tokens/dist/__test__/s.css',
  }).css;
  const l = buildTokens({
    site: 'seline',
    out: 'packages/tokens/dist/__test__/l.css',
  }).css;
  assert.notEqual(s, l);
});
