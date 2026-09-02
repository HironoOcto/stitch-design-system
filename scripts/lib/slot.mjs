// scripts/lib/slot.mjs
// Replace the body between <!-- SLOT:name … --> and <!-- /SLOT:name -->.
// Pure string op. Idempotent: same body in → same output. The open marker
// may carry a trailing note before its "-->".
//
// `indent` (optional): a per-line prefix applied AFTER trimming — needed when the
// slot sits inside a YAML block scalar (e.g. `description: >`), where every content
// line must stay indented under the key or the scalar ends early. Default '' leaves
// the body flush (the markdown-body slots).
export function replaceSlot(source, name, body, indent = '') {
  const openIdx = source.indexOf(`<!-- SLOT:${name}`);
  if (openIdx === -1) throw new Error(`slot not found: SLOT:${name}`);
  const openEnd = source.indexOf('-->', openIdx);
  if (openEnd === -1) throw new Error(`unterminated open marker: SLOT:${name}`);
  const closeIdx = source.indexOf(`<!-- /SLOT:${name} -->`, openEnd);
  if (closeIdx === -1) throw new Error(`close marker not found: /SLOT:${name}`);
  const head = source.slice(0, openEnd + 3); // through the open "-->"
  const tail = source.slice(closeIdx); // from the close marker on
  const inner = indent
    ? body
        .trim()
        .split('\n')
        .map((l) => (l ? indent + l : l))
        .join('\n')
    : body.trim();
  // Re-apply the indent to the close marker too: replaceSlot drops the original
  // whitespace between the open "-->" and the close "<", so an indented slot would
  // otherwise leave the close marker flush and end a YAML block scalar early.
  return `${head}\n${inner}\n${indent}${tail}`;
}

/** Whether a source carries a given slot pair (open + close). */
export function hasSlot(source, name) {
  return (
    source.includes(`<!-- SLOT:${name}`) &&
    source.includes(`<!-- /SLOT:${name} -->`)
  );
}
