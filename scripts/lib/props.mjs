// scripts/lib/props.mjs
// Single source for "extract the exported `<X>Props` interfaces from a component
// source file" — shared by build:refs (writes them into references/components/*.md)
// and check:skill (§5 "props == source": recompute the expected interfaces and
// assert the product still contains them verbatim). One lib, so the expected value
// can never drift from what build:refs actually emits.
import { Project } from 'ts-morph';

// Public-surface interface suffixes. `Props` is the normal component surface;
// `Config` / `Static` are the imperative (command-style) faces — e.g. Notification
// takes a `NotificationConfig` and is called through the `NotificationStatic` methods.
// One unified path: no per-component special-casing (see docs/contributing/skill-build-pipeline.md §4.3).
const PUBLIC_SUFFIX = /(?:Props|Config|Static)$/;

/** An `@internal`-tagged interface is an internal surface (e.g. a component's view
 *  props), not part of the consumed API → excluded from the reference. */
function isInternal(iface) {
  return iface
    .getJsDocs()
    .some((d) => d.getTags().some((t) => t.getTagName() === 'internal'));
}

/**
 * Extract every exported public-surface interface (`*Props` / `*Config` / `*Static`)
 * across the component's source files. Composite components (Form) and imperative
 * ones (Notification) split these across `types.ts` / sibling files, so callers pass
 * the whole component directory's source files (a single file is accepted too). Each
 * entry has:
 *   - `text`: the verbatim interface source (`iface.getText()`) — body + per-prop
 *     field JSDoc, but NOT the interface-level leading JSDoc (ts-morph excludes
 *     leading trivia). This is what §5 "props == source" asserts is present verbatim.
 *   - `note`: the interface-level leading JSDoc prose (cross-prop notes), trimmed;
 *     `''` when there is none. Carried by the MAIN `<X>Props` interface (normal
 *     components) OR by an imperative face `*Config` / `*Static` (command-style ones);
 *     sub-part Props stay API-only. build:refs renders it as prose after the ```ts```
 *     block — the notes.md successor.
 */
export function extractPropsInterfaces(sourceFileOrFiles, componentName) {
  const files = Array.isArray(sourceFileOrFiles)
    ? sourceFileOrFiles
    : [sourceFileOrFiles];
  const out = [];
  for (const sf of files) {
    for (const iface of sf.getInterfaces()) {
      const name = iface.getName();
      if (!iface.isExported()) continue;
      if (!PUBLIC_SUFFIX.test(name)) continue;
      if (isInternal(iface)) continue;
      const main = name === `${componentName}Props`;
      // An imperative component has no `<X>Props`; its Config/Static faces carry the
      // cross-cutting prose instead. Sub-part Props stay API-only (note '').
      const carriesNote = main || /(?:Config|Static)$/.test(name);
      const jsdoc = iface.getJsDocs().at(-1);
      const note =
        carriesNote && jsdoc ? (jsdoc.getCommentText() ?? '').trim() : '';
      out.push({ name, text: iface.getText(), main, note });
    }
  }
  // Main Props first; the rest keep discovery order (callers pass files in a stable,
  // path-sorted order so the emitted reference is deterministic).
  out.sort((a, b) => Number(b.main) - Number(a.main));
  return out;
}

/** A ts-morph Project bound to the react package's tsconfig. */
export function propsProjectFor(reactTsconfigPath) {
  return new Project({ tsConfigFilePath: reactTsconfigPath });
}
