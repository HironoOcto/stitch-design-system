// scripts/build-refs.mjs —— 组件源码 + FAMILIES 表 → skill 参考文档（主题无关）。
// 见 docs/contributing/skill-build-pipeline.md §4.3 + §6。确定性、幂等。
//
// 做三件事：
//   1. ts-morph 抽每个组件目录下导出的公开面 interface 原文（`<X>Props` 普通件 /
//      `*Config`·`*Static` 命令式件；`@internal` 跳过），verbatim，含 JSDoc。
//   2. 从该组件 demo 页抽 1–3 段代表性 `<X …/>` tsx 用例。
//   3. parseFamilies/renderCatalog：按族拼 references/components/<族>.md（一族一文件、
//      不分片），并把 catalog 片段注入带 <!-- SLOT:catalog --> 的文件（SKILL.md / README）。
//
// 组件增改后重跑本命令即可；换主题不跑它（catalog 主题无关）。
import {
  readdirSync,
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  rmSync,
} from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { Project, SyntaxKind } from 'ts-morph';
import {
  parseFamilies,
  classification,
  renderCatalog,
  builtFamilyRows,
} from './lib/families.mjs';
import { replaceSlot, hasSlot } from './lib/slot.mjs';
import { extractPropsInterfaces } from './lib/props.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..'); // stitch-design-system/

const COMPONENTS_DIR = resolve(root, 'packages/react/src/components');
const DEMO_DIR = resolve(root, 'demo/components');
const FAMILIES_TABLE = resolve(root, 'scripts/component-families.md');
const REACT_TSCONFIG = resolve(root, 'packages/react/tsconfig.json');
const SKILL_DIR = resolve(root, 'skills/stitch-design-system');
const REFS_DIR = join(SKILL_DIR, 'references/components');
// catalog 注入目标（存在且带槽才注入）。
const SLOT_FILES = [join(SKILL_DIR, 'SKILL.md'), join(SKILL_DIR, 'README.md')];

// ---------- helpers ----------

/** 去掉多行文本的公共缩进（extracted JSX 保留了源文件缩进）。 */
function dedent(text) {
  const lines = text.split('\n');
  const indents = lines
    .filter((l) => l.trim())
    .map((l) => l.match(/^\s*/)[0].length);
  const min = indents.length ? Math.min(...indents) : 0;
  return lines
    .map((l) => l.slice(min))
    .join('\n')
    .trim();
}

// `extractPropsInterfaces` 抽到 lib/props.mjs（build:refs 与 check:skill 共用同一份，
// 避免 §5「props == source」的期望值与产物漂移）。

/** 从 demo 页抽最多 3 段该组件的 JSX 用例（自闭合 + 成对）。 */
function extractExamples(demoProject, demoPath, componentName) {
  if (!existsSync(demoPath)) return [];
  const sf = demoProject.addSourceFileAtPath(demoPath);
  const seen = new Set();
  const examples = [];
  const push = (node) => {
    const text = dedent(node.getText());
    if (seen.has(text)) return;
    seen.add(text);
    examples.push(text);
  };
  for (const el of sf.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement)) {
    if (el.getTagNameNode().getText() === componentName) push(el);
  }
  for (const el of sf.getDescendantsOfKind(SyntaxKind.JsxElement)) {
    if (el.getOpeningElement().getTagNameNode().getText() === componentName)
      push(el);
  }
  return examples.slice(0, 3);
}

/** 组件 → demo 文件夹（大小写不敏感匹配，与 registry.ts 一致）。 */
function demoPathFor(componentName) {
  if (!existsSync(DEMO_DIR)) return null;
  const dir = readdirSync(DEMO_DIR, { withFileTypes: true }).find(
    (d) =>
      d.isDirectory() && d.name.toLowerCase() === componentName.toLowerCase(),
  );
  return dir ? join(DEMO_DIR, dir.name, 'index.tsx') : null;
}

/** 渲染单个组件的 `## Name` 段。 */
function renderComponentSection(componentName, interfaces, examples) {
  const parts = [`## ${componentName}`, ''];
  for (const iface of interfaces) {
    parts.push('```ts', iface.text, '```', '');
  }
  if (examples.length) {
    parts.push('```tsx', examples.join('\n\n'), '```', '');
  }
  // 散文 note 单一来源 = 源码 interface 级 JSDoc：主 `<X>Props`（普通件）或命令式面
  // `*Config`/`*Static`（命令式件）头顶 JSDoc（源码唯一真相）；props.mjs 只给这些面算 note，
  // 子部件 Props 不带。旁挂 sidecar 机制已于 #37 移除 → 注意事项单一来源 = 源码 JSDoc。
  for (const iface of interfaces) {
    if (iface.note) parts.push(iface.note.trim(), '');
  }
  return parts.join('\n');
}

// ---------- main ----------

const rows = parseFamilies(FAMILIES_TABLE);
const family = classification(rows);

const components = existsSync(COMPONENTS_DIR)
  ? readdirSync(COMPONENTS_DIR, { withFileTypes: true })
      // `_` 前缀 = 私有内部模块（如 _internal/ 的共享原语），非公开组件 → 跳过参考生成。
      .filter((d) => d.isDirectory() && !d.name.startsWith('_'))
      .map((d) => d.name)
      .sort()
  : [];

const propsProject = new Project({ tsConfigFilePath: REACT_TSCONFIG });
const demoProject = new Project({ useInMemoryFileSystem: false });

// family → [section markdown]，按族表顺序排 members。
const byFamily = new Map();
const warnings = [];

for (const name of components) {
  const fam = family.get(name);
  if (!fam) {
    warnings.push(
      `组件 ${name} 不在 component-families.md 任何族的成员列 → 未生成参考条目（去族表加成员名）。`,
    );
    continue;
  }
  const compDir = join(COMPONENTS_DIR, name);
  // Scan every source file in the component dir (path-sorted → deterministic), not
  // just <X>.tsx: composite components (Form) and imperative ones (Notification)
  // split their public interfaces into types.ts / sibling files.
  const sourceFiles = propsProject
    .getSourceFiles()
    .filter((sf) => sf.getFilePath().startsWith(compDir + '/'))
    .sort((a, b) => a.getFilePath().localeCompare(b.getFilePath()));
  if (!sourceFiles.length) {
    warnings.push(`组件 ${name} 无源文件（tsconfig include 未覆盖？）→ 跳过。`);
    continue;
  }
  const interfaces = extractPropsInterfaces(sourceFiles, name);
  if (!interfaces.length) {
    warnings.push(
      `组件 ${name} 无导出的 *Props/*Config/*Static interface → 跳过。`,
    );
    continue;
  }
  const examples = extractExamples(demoProject, demoPathFor(name), name);
  const section = renderComponentSection(name, interfaces, examples);
  if (!byFamily.has(fam)) byFamily.set(fam, new Map());
  byFamily.get(fam).set(name, section);
}

// 写 references/components/<族>.md（只写有成员的族），成员按族表顺序、每族一个文件。
// 这些是按需读取的生成物（DO NOT EDIT）：不设物理行闸、不分片。catalog 一族一链的诚实
// 由下方 builtFamilyRows 过滤保证（只列已落盘的族），不靠「族表 == 已建」的巧合。某族真
// 大到该拆，是 component-families.md 该拆成两个逻辑族的信号（各有正经族名），而非物理切片。
mkdirSync(REFS_DIR, { recursive: true });

// 先清掉旧的 generated 文件（含历史遗留的 <族>-N.md 分片），避免成员缩减 / 改族后残留陈旧文件。
for (const f of readdirSync(REFS_DIR)) {
  if (f.endsWith('.md')) rmSync(join(REFS_DIR, f));
}

const written = [];
const familyHeader = (rowFam) =>
  [
    `<!-- references/components/${rowFam.family}.md — generated by build:refs. DO NOT EDIT. -->`,
    `# ${rowFam.family} — component reference`,
    '',
    `> ${rowFam.fn}. Interfaces (\`*Props\` / \`*Config\` / \`*Static\`) are verbatim from source (\`packages/react/src/components/<X>/\`).`,
    '',
  ].join('\n');
const linesOf = (s) => s.split('\n').length;

for (const rowFam of rows) {
  const built = byFamily.get(rowFam.family);
  if (!built) continue;
  const sections = rowFam.members
    .filter((m) => built.has(m))
    .map((m) => built.get(m));

  const fname = `${rowFam.family}.md`;
  const body = (familyHeader(rowFam) + '\n' + sections.join('\n')).replace(
    /\n+$/,
    '\n',
  );
  writeFileSync(join(REFS_DIR, fname), body);
  written.push({ file: fname, lines: linesOf(body) });
}

// 注入 catalog 片段到带槽的文件（SKILL.md / README；不存在或无槽则跳过）。
// 只列已建族（`<族>.md` 已落盘）—— 族表里列了、但源码尚无对应组件的族（如 navigation）
// 不出链，避免 catalog 指向不存在的文件（死链）。此刻族文件已写完（见上），故按盘上存在性判定。
const catalog = renderCatalog(builtFamilyRows(rows, REFS_DIR));
const injected = [];
for (const f of SLOT_FILES) {
  if (!existsSync(f)) continue;
  const src = readFileSync(f, 'utf8');
  if (!hasSlot(src, 'catalog')) continue;
  const next = replaceSlot(src, 'catalog', catalog);
  if (next !== src) writeFileSync(f, next);
  injected.push(f.replace(root + '/', ''));
}

// 报告
for (const w of warnings) console.warn('  ⚠ ' + w);
console.log(
  `build:refs ✓ ${components.length} 组件 / ${written.length} 族文件` +
    (written.length
      ? '（' + written.map((w) => `${w.file}:${w.lines}行`).join(', ') + '）'
      : '') +
    (injected.length
      ? ` / catalog 注入 ${injected.join(', ')}`
      : ' / 无 catalog 槽目标'),
);
