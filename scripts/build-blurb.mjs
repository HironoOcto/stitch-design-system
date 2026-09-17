// scripts/build-blurb.mjs — build:blurb (§4.4).
// Extract DESIGN.md's 3 sections (+ the OPTIONAL composition-layer corrections, #36) →
// fixed LLM prompt → sites/<site>/skill-blurb.md.
// NON-DETERMINISTIC (contains an LLM call): product is frozen to disk and human-approved.
// Never call from build:skill — that would re-roll every build and break idempotence.
//
// #36 (ADR 0013): when sites/<site>/composition.md exists, its consumer-clean prose is
// fused into the prompt as ground truth from probing the live site (corrections WIN over
// the austere DESIGN spec); the draft's contract header records "as corrected by
// composition.md". No composition.md → degrade to the pre-#36 DESIGN.md-only behavior.
//
// Usage:
//   node scripts/build-blurb.mjs [site=steep]        # call the LLM, write the draft
//   node scripts/build-blurb.mjs [site] --prompt-only # print the assembled prompt, exit
//   node scripts/build-blurb.mjs [site] --dry-run     # run the full pipeline to stdout, write nothing
//   node scripts/build-blurb.mjs [site] --from FILE    # use FILE as the LLM output (no call)
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import {
  extractDesignSections,
  extractComposition,
} from './lib/design-sections.mjs';

// Read the body of a `## <label>` section: lines after the marker up to the first
// blank line / next `## ` / EOF. The one-blank-line stop drops any prose or fences the
// model wrapped around the required two sections (prompt says output EXACTLY two).
function section(text, label) {
  const lines = text.split('\n');
  const start = lines.findIndex((l) => l.trim() === `## ${label}`);
  if (start === -1)
    throw new Error(`skill-blurb: missing "## ${label}" section`);
  const body = [];
  for (let j = start + 1; j < lines.length; j++) {
    const l = lines[j];
    if (l.startsWith('## ')) break;
    if (l.trim() === '') {
      if (body.length) break;
      else continue;
    }
    body.push(l);
  }
  return body.join('\n').trim();
}

// §4.4b — the fixed prompt. Theme-neutral; only the INPUT (three DESIGN.md sections) varies.
const PROMPT = `You are writing two blurbs for an AI coding-skill, from a UI theme's style spec.
INPUT (bottom) = the theme's subtitle line, its style paragraph, and its do's & don'ts.

Output EXACTLY these two sections, nothing else:

## description
2–3 lines for the skill's frontmatter \`description\`. Form:
"Build React UIs in the <Name> style — <the concrete visual signals that let an AI
recognize and trigger this look>." Name: dominant palette feel, typography, radius/shape,
shadow intensity, spacing rhythm. No marketing adjectives.

## style-paragraph
One paragraph (~4–6 sentences) for the skill's "The style in one paragraph": a visual
mental model of how a page feels and composes — canvas/background, the accent and how
sparingly it is used, typography's role, card/shape treatment, shadow/elevation policy,
spacing and rhythm.

Value rule: NO hex. Keep only a few signature sizes that define the look (hero type size,
card radius, section rhythm); do NOT restate the token table — exact values live in
tokens.css. Be faithful to the spec, invent nothing. Write in English, concrete not
flowery. Describe this as THE style — never say it is one of several or can be switched.

Before output, verify each — fix any that fail:
[ ] description is 2–3 lines and uses the "Build … in the <Name> style — …" form
[ ] style-paragraph is ONE paragraph (~4–6 sentences), a visual mental model
[ ] NO hex anywhere; only a few signature sizes, never the full token table
[ ] no marketing adjectives, no flowery language
[ ] every claim traces to the INPUT — nothing invented or borrowed from another style
[ ] described as THE style — no mention of other themes, variants, or switching
[ ] output is EXACTLY the two ## sections — nothing before, between-labels, or after`;

// §4.4b (#36, ADR 0013) — when the site authored a composition layer, the model gets a
// SECOND input: ground truth observed by probing the live site (ambient backdrop, dark
// bands, glow/frost, typographic devices, deliberate refusals) that the DESIGN spec above
// systematically misses or contradicts. The preamble tells the model to FUSE the two into
// one style faithful to the REAL site, with the corrections winning on conflict. Omitted
// entirely when there is no composition → the prompt (and thus the behavior) is unchanged.
const FUSION_PREAMBLE = `The INPUT below is followed by a block of corrections: ground truth
observed by probing the theme's LIVE site. The DESIGN spec (Subtitle / Style paragraph /
Do's & Don'ts) is an austere baseline that can under-describe or even contradict the real
page; the corrections describe what the site actually renders. FUSE the two into one style
faithful to the REAL site — where they conflict the corrections WIN and override the spec,
where the spec is silent fold the corrections in. Treat the corrections as part of the spec
for the "invent nothing" rule below.`;

export function buildPrompt({
  subtitle,
  styleParagraph,
  dosDonts,
  composition,
}) {
  const base = `${PROMPT}

INPUT:
Subtitle: ${subtitle}

Style paragraph:
${styleParagraph}

${dosDonts}
`;
  if (!composition) return base; // degrade: DESIGN.md-only, pre-#36 behavior unchanged
  return `${FUSION_PREAMBLE}

${base}
COMPOSITION CORRECTIONS (ground truth from the live site — these WIN over the DESIGN spec
above wherever they conflict; where the spec is silent, fold them in):
${composition}
`;
}

const HEX = /#[0-9a-fA-F]{3,8}\b/;

// Machine-doc checks (skill-acceptance §9, mirrored in pipeline §4.4c):
// no hex; description ≤1024 chars & 2–3 lines; style-paragraph one paragraph.
export function lintBlurb({ description, styleParagraph }) {
  const problems = [];
  if (HEX.test(description) || HEX.test(styleParagraph)) {
    problems.push('contains a hex literal (values live in tokens.css)');
  }
  if (description.length > 1024) {
    problems.push(`description is ${description.length} chars (max 1024)`);
  }
  const descLines = description
    .split('\n')
    .filter((l) => l.trim() !== '').length;
  if (descLines > 3) {
    problems.push(`description is ${descLines} lines (want 2–3)`);
  }
  const paras = styleParagraph
    .split(/\n\s*\n/)
    .filter((p) => p.trim() !== '').length;
  if (paras > 1) {
    problems.push(`style-paragraph is ${paras} paragraphs (want exactly one)`);
  }
  return problems;
}

export function parseBlurb(text) {
  return {
    description: section(text, 'description'),
    styleParagraph: section(text, 'style-paragraph'),
  };
}

// Call the LLM: pipe the prompt to `claude -p`, return its stdout. Non-deterministic.
function callLLM(prompt) {
  const model = process.env.BLURB_MODEL;
  const args = ['-p', ...(model ? ['--model', model] : [])];
  const r = spawnSync('claude', args, {
    input: prompt,
    encoding: 'utf8',
    maxBuffer: 4 * 1024 * 1024,
  });
  if (r.error)
    throw new Error(
      `build:blurb: failed to spawn "claude": ${r.error.message}`,
    );
  if (r.status !== 0)
    throw new Error(`build:blurb: claude exited ${r.status}: ${r.stderr}`);
  return r.stdout;
}

// §4.4c file shape: frozen header comment + the two sections, nothing else.
// Header marks the draft as pending review; the human sign-off flips it to
// "human-approved" (skill-acceptance §9, the one manual gate).
//
// The contract line states what the blurb is faithful TO (#36, ADR 0013): when a
// composition layer was fused in, that is "DESIGN.md as corrected by composition.md";
// without one it degrades to the plain "fidelity to DESIGN.md" wording. The header is a
// comment — build:skill's parseBlurb ignores it, so this never touches the preset style.md.
export function renderBlurbFile(
  site,
  { description, styleParagraph },
  { corrected } = {},
) {
  const source = corrected
    ? 'source/DESIGN.md as corrected by composition.md'
    : 'source/DESIGN.md';
  const fidelity = corrected
    ? 'fidelity to DESIGN.md as corrected by composition.md'
    : 'fidelity to DESIGN.md';
  return `<!-- sites/${site}/skill-blurb.md — generated once from ${source} by build:blurb.
     Draft — pending human sign-off; a maintainer replaces this line with the approval
     marker once the blurb is reviewed for ${fidelity}.
     build:skill copies these two sections verbatim into the site's preset style.md
     (references/theme-presets/<site>/style.md). Do not hand-edit the preset copy —
     edit here and re-run build:skill. -->

## description
${description}

## style-paragraph
${styleParagraph}
`;
}

function main(argv) {
  const flags = argv.filter((a) => a.startsWith('--'));
  const site = argv.find((a) => !a.startsWith('--')) || 'steep';
  const fromFlag = flags.find((f) => f.startsWith('--from='));

  const here = dirname(fileURLToPath(import.meta.url));
  const root = resolve(here, '..');
  const design = resolve(root, 'sites', site, 'source', 'DESIGN.md');
  const compositionPath = resolve(root, 'sites', site, 'composition.md');
  const outPath = resolve(root, 'sites', site, 'skill-blurb.md');

  const sections = extractDesignSections(design);
  const composition = extractComposition(compositionPath); // null when the site has none
  const prompt = buildPrompt({ ...sections, composition });

  if (flags.includes('--prompt-only')) {
    process.stdout.write(prompt);
    return;
  }

  const raw = fromFlag
    ? readFileSync(fromFlag.slice('--from='.length), 'utf8')
    : callLLM(prompt);

  const blurb = parseBlurb(raw);
  const problems = lintBlurb(blurb);
  const file = renderBlurbFile(site, blurb, {
    corrected: Boolean(composition),
  });

  // --dry-run: run the whole pipeline (fusion → LLM → parse → lint → render) but write
  // NOTHING — for demonstrating the fused draft without freezing product (frozen product
  // is #37's human-gated step, not build:blurb's mechanism).
  const dryRun = flags.includes('--dry-run');
  if (!dryRun) writeFileSync(outPath, file);

  const fusion = composition ? ' (fused with composition.md)' : '';
  if (dryRun) {
    console.error(
      `build:blurb DRY RUN — sites/${site}${fusion}, nothing written:\n`,
    );
    process.stdout.write(file);
    return;
  }
  console.log(`build:blurb → sites/${site}/skill-blurb.md${fusion}`);
  if (problems.length) {
    console.log('  ⚠ machine-doc problems (fix before human sign-off):');
    for (const p of problems) console.log(`    - ${p}`);
  } else {
    console.log(
      '  ✓ machine-doc clean (no hex, description ≤1024 & ≤3 lines, one paragraph)',
    );
  }
  console.log(
    '  → DRAFT: agent-judge fidelity vs DESIGN.md, then human approves',
  );
  console.log(
    '    (flip the header line to "human-approved"). Do NOT run inside build:skill.',
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2));
}
