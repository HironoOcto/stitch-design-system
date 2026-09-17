// scripts/lib/design-sections.mjs
// Deterministic extraction of the 3 blurb inputs from a Refero DESIGN.md,
// plus the OPTIONAL composition-layer correction (#36) fed alongside them.
import { existsSync, readFileSync } from 'node:fs';
import { stripTrace } from './strip-trace.mjs';

export function extractDesignSections(path) {
  const lines = readFileSync(path, 'utf8').split('\n');

  // subtitle: first "> …" quote line (sits right under the H1)
  const subtitle = (lines.find((l) => l.startsWith('> ')) || '')
    .replace(/^>\s*/, '')
    .trim();

  // style paragraph: prose after "**Theme:**" (fallback: after the subtitle),
  // collected until the next blank line or first "## ".
  let i = lines.findIndex((l) => /^\*\*Theme:\*\*/.test(l));
  if (i === -1) i = lines.findIndex((l) => l.startsWith('> '));
  const para = [];
  for (let j = i + 1; j < lines.length; j++) {
    const l = lines[j];
    if (l.startsWith('## ')) break;
    if (l.trim() === '') {
      if (para.length) break;
      else continue;
    }
    para.push(l.trim());
  }
  const styleParagraph = para.join(' ');

  // do's & don'ts: the whole "## Do's and Don'ts" section, until the next "## "
  const dosIdx = lines.findIndex((l) => /^##\s+Do'?s and Don'?ts/i.test(l));
  let dosDonts = '';
  if (dosIdx !== -1) {
    const end = lines.findIndex((l, k) => k > dosIdx && l.startsWith('## '));
    dosDonts = lines
      .slice(dosIdx, end === -1 ? undefined : end)
      .join('\n')
      .trim();
  }
  return { subtitle, styleParagraph, dosDonts };
}

// The composition layer (#36, ADR 0013) is a site's SECOND style source — the parts of
// the real look DESIGN.md systematically misses or contradicts (ambient backdrop, dark
// bands, glow/frost, typographic devices, deliberate refusals). It is OPTIONAL: only
// sites that authored one have the file. build:blurb fuses it into the style-paragraph
// when present, and degrades to DESIGN.md-only when absent.
//
// We feed build:blurb the SAME consumer-clean prose the skill ships — i.e. stripTrace of
// the source (drops the `<!-- trace -->` maintainer table and `←` heading trailers). That
// keeps DESIGN.md 追溯 out of the prompt (stripTrace's zero-residual self-check throws if
// any DESIGN.md leaked into body prose, exactly as build:skill enforces on the shipped copy).
//
// @param {string} path sites/<site>/composition.md
// @returns {string|null} the stripTrace-clean prose, or null when the file is absent.
export function extractComposition(path) {
  if (!existsSync(path)) return null;
  return stripTrace(readFileSync(path, 'utf8'), { label: path }).trim();
}
