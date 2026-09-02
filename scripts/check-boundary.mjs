// scripts/check-boundary.mjs — check:boundary.
// 结构 Hook H1「自包含边界」的永久守护（本脚本即 H1 的守卫，不再靠每 issue 手 grep）。
//
// 定义正本 = ADR 0003（知识边界：三层模型 source/agnostic/ds-surface + 出身测试判据）。
// 本文件只实现、不重复定义；判据/分层/豁免的「为什么」一律看 ADR 0003。
// 结构 Hook 登记见 docs/issue-management.zh-CN.md 的 H1 行（同样是指针）。
//
// 三层（各自 denylist，比外层严的在内层）：
//   source     packages/react/src/**（含测试）——组件实现，主题无关，只认 --stitch-* 角色变量：
//                禁 animal 痕迹 / 旧包名 / 全部站名（含当下 active，因站会换）/ 源 hex。
//   agnostic   发货 skill 的消费者面（SKILL.md/README.md/references 的 project/standalone/components）：
//                禁 animal / 源 hex / 非 active 站名 / 旧包名。
//   ds-surface 主题值合法处（contract.css / templates/** / references/theme/*）：
//                只禁 animal / 旧包名（hex + 全站枚举在此合法）。
//
// 站名一律动态解析（resolveSite 取 active、readdirSync(sites) 取全集），脚本零写死站名
// ——这本身是 H1 自测。命中即非零退出。
//
// 已知边界：steep 也是普通英文词。source 层若误红正常英文注释——先不预开豁免、红了改词。
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join, relative } from 'node:path';
import { resolveSite } from './build-skill.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..'); // stitch-design-system/
const argv = process.argv.slice(2);

// ---------- 站名（动态、零写死） ----------
const sitesDir = resolve(root, 'sites');
const allSites = readdirSync(sitesDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);
const activeSite = resolveSite(root, argv);
const inactiveSites = allSites.filter((s) => s !== activeSite);

// ---------- 共享 denylist 原子 ----------
const ANIMAL = ['animal', /animal/i]; // 覆盖 "animal" / "Animal Crossing" / "--animal-"
const HEX = ['hex', /#[0-9a-fA-F]{3,8}\b/];
// 旧包名：@stitch/react（旧 scope）+ 裸 `stitch-design-system` 导入说明符。
// 当下正确包名是 @octohirono/stitch-design-system —— 裸说明符要求 stitch 前紧挨引号，
// 故 '@octohirono/stitch-design-system'（引号前是 @/斜杠）不误命中。
const OLD_PKG = [
  ['old-pkg:@stitch/react', /@stitch\/react/],
  ['old-pkg:bare-import', /['"]stitch-design-system['"]/],
];
const siteRule = (name) => [`site:${name}`, new RegExp(`\\b${name}\\b`, 'i')];

// ---------- 三层配置 ----------
// surface: () => 相对 root 的文件路径数组（惰性求值，缺失目录天然产出空数组）。
const TIERS = [
  {
    name: 'source',
    surface: () => walk(resolve(root, 'packages/react/src')),
    denylist: [
      ANIMAL,
      ...OLD_PKG,
      ...allSites.map(siteRule), // 全部站名（含 active）
      HEX,
    ],
  },
  {
    name: 'agnostic',
    surface: () => skillConsumerFiles(),
    denylist: [
      ANIMAL,
      HEX,
      ...inactiveSites.map(siteRule), // 仅非 active 站名
      ...OLD_PKG,
    ],
  },
  {
    name: 'ds-surface',
    surface: () => [
      ...(existsSync(resolve(root, 'packages/tokens/contract.css'))
        ? [resolve(root, 'packages/tokens/contract.css')]
        : []),
      ...walk(resolve(root, 'templates')),
      ...themeRefFiles(),
    ],
    denylist: [ANIMAL, ...OLD_PKG], // hex + 全站枚举在此合法
  },
];

// ---------- 扫描面辅助 ----------
const TEXT_EXT =
  /\.(ts|tsx|js|jsx|mjs|cjs|less|css|scss|md|json|html|svg|txt)$/i;
// 合理豁免（ADR 0003）：站 adapter / demo / study 侧迁移笔记与历史。
// 三层的扫描面本就不含它们，此处再兜一道，防未来 glob 放宽误纳。
const EXEMPT = (rel) =>
  rel.split(/[/\\]/).includes('sites') ||
  rel.split(/[/\\]/).includes('demo') ||
  rel.includes('迁移笔记');

/** 递归收集目录下的文本文件（绝对路径）；缺失目录→空。 */
function walk(absDir) {
  if (!existsSync(absDir)) return [];
  const out = [];
  for (const ent of readdirSync(absDir, { withFileTypes: true })) {
    const p = join(absDir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p));
    else if (ent.isFile() && TEXT_EXT.test(ent.name)) out.push(p);
  }
  return out;
}

/** agnostic 层：发货 skill 的消费者面文件（跨所有 skills/<skill>）。 */
function skillConsumerFiles() {
  const skillsRoot = resolve(root, 'skills');
  if (!existsSync(skillsRoot)) return [];
  const out = [];
  for (const skill of readdirSync(skillsRoot, { withFileTypes: true })) {
    if (!skill.isDirectory()) continue;
    const dir = join(skillsRoot, skill.name);
    for (const f of ['SKILL.md', 'README.md']) {
      const p = join(dir, f);
      if (existsSync(p)) out.push(p);
    }
    for (const f of ['react-project.md', 'standalone-html.md']) {
      const p = join(dir, 'references', f);
      if (existsSync(p)) out.push(p);
    }
    const compDir = join(dir, 'references', 'components');
    if (existsSync(compDir))
      for (const f of readdirSync(compDir))
        if (f.endsWith('.md')) out.push(join(compDir, f));
  }
  return out;
}

/** ds-surface 层：每个 skill 的 references/theme/* 主题参考。 */
function themeRefFiles() {
  const skillsRoot = resolve(root, 'skills');
  if (!existsSync(skillsRoot)) return [];
  const out = [];
  for (const skill of readdirSync(skillsRoot, { withFileTypes: true })) {
    if (!skill.isDirectory()) continue;
    const themeDir = join(skillsRoot, skill.name, 'references', 'theme');
    if (!existsSync(themeDir)) continue;
    for (const f of readdirSync(themeDir)) {
      const p = join(themeDir, f);
      if (statSync(p).isFile() && TEXT_EXT.test(f)) out.push(p);
    }
  }
  return out;
}

// ---------- 扫描 ----------
const hits = [];
for (const tier of TIERS) {
  for (const abs of tier.surface()) {
    const rel = relative(root, abs);
    if (EXEMPT(rel)) continue;
    const lines = readFileSync(abs, 'utf8').split('\n');
    for (let i = 0; i < lines.length; i++) {
      for (const [label, re] of tier.denylist) {
        const m = lines[i].match(re);
        if (m)
          hits.push({
            tier: tier.name,
            file: rel,
            line: i + 1,
            label,
            match: m[0],
          });
      }
    }
  }
}

// ---------- 报告 ----------
console.log(
  `check:boundary — active=${activeSite}, sites=[${allSites.join(', ')}]`,
);
if (hits.length) {
  let lastTier = '';
  for (const h of hits) {
    if (h.tier !== lastTier) {
      console.log(`\n[${h.tier}]`);
      lastTier = h.tier;
    }
    console.log(`  ✗ ${h.file}:${h.line} — ${h.label} → "${h.match}"`);
  }
  console.log(`\ncheck:boundary ✗ — ${hits.length} 处越界`);
  process.exit(1);
}
console.log('check:boundary ✓ — 三层零越界');
process.exit(0);
