// scripts/lib/families.mjs
// component-families.md is the single source of truth for families.
// Parsing mirrors demo/families.ts (same table) — keep them equivalent.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

// -> [{ family, fn, members: [...] }]
export function parseFamilies(path) {
  const rows = [];
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t.startsWith('|')) continue;
    const cells = t
      .split('|')
      .slice(1, -1)
      .map((s) => s.trim());
    if (cells.length < 3) continue;
    const [family, fn, members] = cells;
    if (family === '族名') continue; // header
    if (/^:?-{2,}:?$/.test(family)) continue; // separator (---, :--- …)
    rows.push({
      family,
      fn,
      members: members
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    });
  }
  return rows;
}

// component name -> family (placement / validation)
export function classification(rows) {
  const map = new Map();
  for (const { family, members } of rows)
    for (const c of members) map.set(c, family);
  return map;
}

// the EXISTING FAMILIES block for the placement prompt (§4.3)
export function existingFamiliesBlock(rows) {
  return rows.map((r) => `- ${r.family}: ${r.fn}`).join('\n');
}

// A family is "built" iff its generated `<family>.md` exists under refsDir.
// The single definition of "built" shared by build:refs (post-write) and check:skill,
// so the catalog lists exactly the families that have a reachable reference file —
// roadmap families listed in the table but with no components in source yet (e.g.
// navigation) are dropped instead of producing a dead catalog link. Order follows the table.
export function builtFamilyRows(rows, refsDir) {
  return rows.filter((r) => existsSync(join(refsDir, `${r.family}.md`)));
}

// catalog snippet for SKILL.md + README <!-- SLOT:catalog --> (same snippet, both files)
// Pass rows already narrowed to built families (builtFamilyRows) — renderCatalog stays
// pure over the rows it is handed and links every row it renders.
export function renderCatalog(rows) {
  const head = '| Category | Components | Reference |\n| --- | --- | --- |';
  const body = rows
    .map(
      (r) =>
        `| ${r.family} | ${r.members.join(', ')} | [${r.family}.md](references/components/${r.family}.md) |`,
    )
    .join('\n');
  return `${head}\n${body}`;
}
