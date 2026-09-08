// node --test — read-time preset resolution (issue #9).
// This is the seam the SKILL.md "current style" section describes in prose: the
// consuming project's .agent/stitch.theme.json `activeSite` picks which embedded preset
// the AI reads; with no pointer it falls back to the published default (= the npm
// package default baked at build time). Pure, no side effects.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { resolveActiveSite, presetPath } from './resolve-preset.mjs';

// A throwaway consuming-project root with a given .agent/stitch.theme.json content.
function consumerRoot(configText) {
  const dir = mkdtempSync(join(tmpdir(), 'consumer-'));
  if (configText !== null) {
    mkdirSync(join(dir, '.agent'), { recursive: true });
    writeFileSync(join(dir, '.agent', 'stitch.theme.json'), configText);
  }
  return dir;
}

test('consumer pointer activeSite=steep → resolves to steep', () => {
  const root = consumerRoot('{ "activeSite": "steep" }');
  assert.equal(resolveActiveSite(root, 'seline'), 'steep');
});

test('no .agent/stitch.theme.json → falls back to the published default', () => {
  const root = consumerRoot(null);
  assert.equal(resolveActiveSite(root, 'seline'), 'seline');
});

test('config present but no activeSite key → falls back to published default', () => {
  const root = consumerRoot('{ "somethingElse": true }');
  assert.equal(resolveActiveSite(root, 'seline'), 'seline');
});

test('malformed .agent/stitch.theme.json → falls back (never throws on a bad consumer file)', () => {
  const root = consumerRoot('{ not json');
  assert.equal(resolveActiveSite(root, 'seline'), 'seline');
});

test('presetPath composes references/theme-presets/<site>/<file>', () => {
  assert.equal(
    presetPath('steep', 'tokens.css'),
    'references/theme-presets/steep/tokens.css',
  );
});
