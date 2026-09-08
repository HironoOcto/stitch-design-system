// scripts/build-blurb.mjs — build:blurb (§4.4).
// Extract DESIGN.md's 3 sections → fixed LLM prompt → sites/<site>/skill-blurb.md.
// NON-DETERMINISTIC (contains an LLM call): product is frozen to disk and human-approved.
// Never call from build:skill — that would re-roll every build and break idempotence.
//
// Usage:
//   node scripts/build-blurb.mjs [site=steep]        # call the LLM, write the draft
//   node scripts/build-blurb.mjs [site] --prompt-only # print the assembled prompt, exit
//   node scripts/build-blurb.mjs [site] --from FILE    # use FILE as the LLM output (no call)
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { extractDesignSections } from './lib/design-sections.mjs';

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

export function buildPrompt({ subtitle, styleParagraph, dosDonts }) {
  return `${PROMPT}

INPUT:
Subtitle: ${subtitle}

Style paragraph:
${styleParagraph}

${dosDonts}
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
export function renderBlurbFile(site, { description, styleParagraph }) {
  return `<!-- sites/${site}/skill-blurb.md — generated once from source/DESIGN.md by build:blurb.
     Draft — pending human sign-off; a maintainer replaces this line with the approval
     marker once the blurb is reviewed for fidelity to DESIGN.md.
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
  const outPath = resolve(root, 'sites', site, 'skill-blurb.md');

  const sections = extractDesignSections(design);
  const prompt = buildPrompt(sections);

  if (flags.includes('--prompt-only')) {
    process.stdout.write(prompt);
    return;
  }

  const raw = fromFlag
    ? readFileSync(fromFlag.slice('--from='.length), 'utf8')
    : callLLM(prompt);

  const blurb = parseBlurb(raw);
  const problems = lintBlurb(blurb);
  const file = renderBlurbFile(site, blurb);
  writeFileSync(outPath, file);

  console.log(`build:blurb → sites/${site}/skill-blurb.md`);
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
