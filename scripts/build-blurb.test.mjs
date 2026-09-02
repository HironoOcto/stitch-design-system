// node --test — deterministic helpers of build:blurb (parse/lint/render/prompt).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseBlurb,
  lintBlurb,
  renderBlurbFile,
  buildPrompt,
} from './build-blurb.mjs';

const GOOD = `## description
Build React UIs in the Steep style — editorial serif analytics on warm paper.

## style-paragraph
Steep presents analytics as an editorial magazine spread. It breathes.`;

test('parseBlurb splits the two sections and trims bodies', () => {
  const { description, styleParagraph } = parseBlurb(GOOD);
  assert.match(description, /^Build React UIs in the Steep style/);
  assert.match(styleParagraph, /^Steep presents analytics/);
  assert.doesNotMatch(description, /## /);
  assert.doesNotMatch(styleParagraph, /## /);
});

test('parseBlurb tolerates prose/fences the model wrapped around the two sections', () => {
  const noisy =
    'Here you go:\n\n' + GOOD + '\n\nLet me know if you want changes.';
  const { description, styleParagraph } = parseBlurb(noisy);
  assert.match(description, /^Build React UIs in the Steep style/);
  assert.doesNotMatch(styleParagraph, /Let me know/);
});

test('parseBlurb throws when a section is missing', () => {
  assert.throws(
    () => parseBlurb('## description\nonly one section'),
    /style-paragraph/,
  );
});

test('lintBlurb passes a clean blurb', () => {
  assert.deepEqual(lintBlurb(parseBlurb(GOOD)), []);
});

test('lintBlurb flags a hex literal in either section', () => {
  const bad = parseBlurb(GOOD.replace('warm paper.', 'warm paper (#fbe1d1).'));
  assert.ok(lintBlurb(bad).some((p) => /hex/i.test(p)));
});

test('lintBlurb flags an over-long description (>1024 chars)', () => {
  const bad = { description: 'x'.repeat(1025), styleParagraph: 'ok.' };
  assert.ok(lintBlurb(bad).some((p) => /1024/.test(p)));
});

test('lintBlurb flags a description with too many lines (>3)', () => {
  const bad = { description: 'a\nb\nc\nd', styleParagraph: 'ok.' };
  assert.ok(lintBlurb(bad).some((p) => /line/i.test(p)));
});

test('lintBlurb flags a multi-paragraph style-paragraph', () => {
  const bad = { description: 'ok', styleParagraph: 'one.\n\ntwo.' };
  assert.ok(lintBlurb(bad).some((p) => /paragraph/i.test(p)));
});

test('renderBlurbFile emits the frozen header + exactly the two sections', () => {
  const out = renderBlurbFile('steep', parseBlurb(GOOD));
  // header comment names the source + build:skill contract, marks it a pending draft
  assert.match(out, /^<!--/);
  assert.match(out, /source\/DESIGN\.md/);
  assert.match(out, /build:skill injects/i);
  assert.match(out, /pending human sign-off/i);
  // a fresh draft must NOT already carry the approval marker (that is the human gate)
  assert.doesNotMatch(out, /human-approved/);
  // exactly the two required sections, in order
  const headings = out.match(/^## .*/gm);
  assert.deepEqual(headings, ['## description', '## style-paragraph']);
  // round-trips back through the parser to the same bodies
  assert.deepEqual(parseBlurb(out), parseBlurb(GOOD));
});

test('renderBlurbFile is deterministic for the same input', () => {
  assert.equal(
    renderBlurbFile('steep', parseBlurb(GOOD)),
    renderBlurbFile('steep', parseBlurb(GOOD)),
  );
});

const SECTIONS = {
  subtitle: 'serif analytics on warm paper',
  styleParagraph: 'Steep renders analytics as editorial.',
  dosDonts: "## Do's and Don'ts\n### Do\n- keep it quiet",
};

test('buildPrompt keeps the fixed instruction spine', () => {
  const p = buildPrompt(SECTIONS);
  assert.match(p, /Output EXACTLY these two sections/);
  assert.match(p, /## description/);
  assert.match(p, /## style-paragraph/);
  assert.match(p, /NO hex/);
  assert.match(p, /described as THE style/);
});

test('buildPrompt appends the three extracted sections as INPUT, last', () => {
  const p = buildPrompt(SECTIONS);
  const inputAt = p.indexOf('INPUT:');
  assert.ok(inputAt > 0);
  const input = p.slice(inputAt);
  assert.match(input, /serif analytics on warm paper/);
  assert.match(input, /Steep renders analytics as editorial/);
  assert.match(input, /## Do's and Don'ts/);
});
