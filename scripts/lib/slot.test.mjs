// node --test — replaceSlot behavior.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { replaceSlot, hasSlot } from './slot.mjs';

const src = [
  '# Title',
  '<!-- SLOT:catalog (build:refs injects — do not hand-edit) -->',
  'OLD BODY',
  '<!-- /SLOT:catalog -->',
  'tail',
].join('\n');

test('replaces only the slot body, keeps markers + surrounding text', () => {
  const out = replaceSlot(src, 'catalog', 'NEW BODY');
  assert.match(out, /NEW BODY/);
  assert.doesNotMatch(out, /OLD BODY/);
  assert.match(out, /# Title/);
  assert.match(out, /tail/);
  assert.match(out, /<!-- SLOT:catalog/);
  assert.match(out, /<!-- \/SLOT:catalog -->/);
});

test('idempotent: same body in → byte-identical output', () => {
  const a = replaceSlot(src, 'catalog', 'BODY');
  const b = replaceSlot(a, 'catalog', 'BODY');
  assert.equal(a, b);
});

test('trims body whitespace deterministically', () => {
  const a = replaceSlot(src, 'catalog', '  BODY  ');
  const b = replaceSlot(src, 'catalog', 'BODY');
  assert.equal(a, b);
});

test('indent: prefixes every injected line, after trimming', () => {
  const yaml = [
    'description: >',
    '    <!-- SLOT:description -->',
    '    <!-- /SLOT:description -->',
  ].join('\n');
  const out = replaceSlot(
    yaml,
    'description',
    '  line one\nline two  ',
    '    ',
  );
  // trim first (drops the raw body's incidental edge whitespace), THEN indent
  // every line by 4 — so the folded scalar stays consistently indented.
  assert.match(out, /\n {4}line one\n {4}line two\n/);
  assert.doesNotMatch(out, /\n {6}line one/); // the leading 2 spaces were trimmed
  // the close marker keeps the same indent (else a YAML block scalar ends early).
  assert.match(out, /\n {4}<!-- \/SLOT:description -->/);
  assert.doesNotMatch(out, /\n<!-- \/SLOT:description -->/);
});

test('indent is idempotent', () => {
  const yaml = ['x: >', '    <!-- SLOT:d -->', '    <!-- /SLOT:d -->'].join(
    '\n',
  );
  const a = replaceSlot(yaml, 'd', 'body', '    ');
  const b = replaceSlot(a, 'd', 'body', '    ');
  assert.equal(a, b);
});

test('hasSlot detects presence / absence', () => {
  assert.equal(hasSlot(src, 'catalog'), true);
  assert.equal(hasSlot(src, 'nope'), false);
});

test('throws on missing slot', () => {
  assert.throws(() => replaceSlot(src, 'missing', 'x'), /slot not found/);
});
