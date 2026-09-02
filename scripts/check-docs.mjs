// scripts/check-docs.mjs —— 源码 ↔ skill 参考文档「存在性」校验（不漂移）。
// 见 docs/contributing/sync-and-ci.md。查一件事：
//   覆盖：packages/react/src/components/ 每个组件在
//   skills/<skill>/references/components/*.md 有 `## <Name>` 标题。
// 漂移 → 退出码 1。空库 0 组件、0 参考文件 → 天然过。
//
// 不查行数：references/components/*.md 是按需读取的生成物（DO NOT EDIT），不设物理行闸、
// 不分片（build:refs 一族一文件）。行/预算闸只对常驻入口 SKILL.md 与手写文档有意义，归
// check:skill / 手写文档 lint，不在此。
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const COMPONENTS_DIR = 'packages/react/src/components';
const SKILLS_DIR = 'skills';

const errors = [];

// 1. 组件名（src/components/<X>/）
const components = existsSync(COMPONENTS_DIR)
  ? readdirSync(COMPONENTS_DIR, { withFileTypes: true })
      // `_` 前缀 = 私有内部模块（非公开组件），不要求 skill 参考条目。
      .filter((d) => d.isDirectory() && !d.name.startsWith('_'))
      .map((d) => d.name)
  : [];

// 2. skill 参考文件（skills/<skill>/references/components/*.md）
const refFiles = [];
if (existsSync(SKILLS_DIR)) {
  for (const skill of readdirSync(SKILLS_DIR)) {
    const compDir = join(SKILLS_DIR, skill, 'references', 'components');
    if (!existsSync(compDir)) continue;
    for (const f of readdirSync(compDir)) {
      if (f.endsWith('.md')) refFiles.push(join(compDir, f));
    }
  }
}

// 3. 覆盖检查：每个组件都有对应 `## <Name>` 条目
const headings = new Set();
for (const f of refFiles) {
  for (const m of readFileSync(f, 'utf8').matchAll(/^##\s+(.+?)\s*$/gm)) {
    headings.add(m[1].trim());
  }
}
for (const name of components) {
  if (!headings.has(name)) {
    errors.push(`组件 ${name} 在 skill references 无 "## ${name}" 条目`);
  }
}

if (errors.length) {
  console.error('check:docs 失败：');
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}
console.log(
  `check:docs ✓ (${components.length} 组件 / ${refFiles.length} 参考文件)`,
);
