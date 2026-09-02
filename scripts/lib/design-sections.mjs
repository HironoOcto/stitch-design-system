// scripts/lib/design-sections.mjs
// Deterministic extraction of the 3 blurb inputs from a Refero DESIGN.md.
import { readFileSync } from 'node:fs';

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
