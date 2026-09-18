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
  assert.match(out, /build:skill copies these two sections/i);
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

// #36 — the header contract states what the blurb is faithful TO. With a composition layer
// fused in, that is "DESIGN.md as corrected by composition.md" (ADR 0013); without one it
// degrades to the plain "fidelity to DESIGN.md" wording.
test('renderBlurbFile upgrades the contract header when corrected by composition', () => {
  const out = renderBlurbFile('steep', parseBlurb(GOOD), { corrected: true });
  assert.match(out, /as corrected by composition\.md/i);
  assert.match(out, /DESIGN\.md/);
  // still a fresh, pending draft — the human gate is unchanged
  assert.match(out, /pending human sign-off/i);
  assert.doesNotMatch(out, /human-approved/);
  // the two sections still round-trip
  assert.deepEqual(parseBlurb(out), parseBlurb(GOOD));
});

test('renderBlurbFile keeps the plain DESIGN.md contract when there is no composition', () => {
  const bare = renderBlurbFile('steep', parseBlurb(GOOD));
  assert.doesNotMatch(bare, /as corrected by composition\.md/i);
  assert.match(bare, /fidelity to DESIGN\.md/i);
  // passing corrected:false is identical to passing nothing (default degrade)
  assert.equal(
    renderBlurbFile('steep', parseBlurb(GOOD), { corrected: false }),
    bare,
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

// #36 — composition is an OPTIONAL fusion input.
test('buildPrompt WITHOUT composition is byte-identical to the pre-#36 prompt (degrade)', () => {
  // The red line: no composition → original behavior, unchanged. Passing an explicit
  // null/undefined must equal passing no composition key at all.
  const bare = buildPrompt(SECTIONS);
  assert.equal(buildPrompt({ ...SECTIONS, composition: null }), bare);
  assert.equal(buildPrompt({ ...SECTIONS, composition: undefined }), bare);
  // and the degrade prompt names no composition layer anywhere
  assert.doesNotMatch(bare, /composition/i);
});

test('buildPrompt WITH composition fuses the corrections after the DESIGN INPUT, spine kept', () => {
  const composition =
    'steep 的暖纸画布满屏铺着一层位图氛围底 + 颗粒噪声 + overlay 混合；页面下部有一整幕近黑暗场。';
  const p = buildPrompt({ ...SECTIONS, composition });

  // fixed spine survives (same two-section contract, same value rule)
  assert.match(p, /Output EXACTLY these two sections/);
  assert.match(p, /## description/);
  assert.match(p, /## style-paragraph/);
  assert.match(p, /NO hex/);
  assert.match(p, /described as THE style/);

  // the corrections are present, verbatim, as their own labeled block
  assert.match(p, /COMPOSITION CORRECTIONS/);
  assert.match(p, /位图氛围底 \+ 颗粒噪声 \+ overlay 混合/);

  // fusion framing: corrections are ground truth from the live site and WIN on conflict
  assert.match(p, /live site/i);
  assert.match(p, /win|wins|override|prevail/i);

  // ordering: the DESIGN INPUT block comes before the composition corrections
  const inputAt = p.indexOf('INPUT:');
  const corrAt = p.indexOf('COMPOSITION CORRECTIONS');
  assert.ok(
    inputAt > 0 && corrAt > inputAt,
    'corrections follow the DESIGN INPUT',
  );
});
