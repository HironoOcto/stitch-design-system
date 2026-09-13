// scripts/lib/extract-layout.mjs
// 页面尺度层生成器的纯函数核心（ADR 0012）。输入某站 source/variables.css 文本，
// 输出该站页面尺度层的单个 `:root {…}` 块，**只含 --stitch-***：机械改名映射，
// 几乎零判断（区别于要大量裁值的手写 adapter.css）。build:layout 负责读文件、
// 加 DO NOT EDIT 头、按站写盘；本文件不碰盘、不知道站名。
//
// 收（Tier 1，ADR 0012 决策1）：字阶 --text/leading/tracking-<角色>、全间距
// --spacing-<n> + --spacing-unit、layout 四键。**不收**：颜色 / 字体族 / 字重 /
// 圆角(含 named radii) / 阴影 / surfaces —— 留 rules.md 散文或现契约。
import postcss from 'postcss';

// 稳定的角色词表（公开超集，各站填子集；词表外的名 = 不生成，见 ADR 0012 决策3）。
const TYPE_ROLES = new Set([
  'micro',
  'caption',
  'body-sm',
  'body',
  'body-lg',
  'subheading',
  'heading-sm',
  'heading',
  'heading-lg',
  'display',
]);

// layout 四键：源名 → --stitch- 前缀名（逐字，仅加前缀）。
const LAYOUT_KEYS = new Set([
  'page-max-width',
  'section-gap',
  'card-padding',
  'element-gap',
]);

// 归一化①：区间值取下界（phantom --element-gap: 8-16px → 8px）。「8–16 弹性」留散文。
// 非区间值原样返回（间距/字阶恒为单值 → no-op）。
function normalizeRange(value) {
  const m = value.match(/^(\d+)-\d+([a-z%]*)$/i);
  return m ? `${m[1]}${m[2]}` : value;
}

/**
 * @param {string} css  某站 source/variables.css 全文
 * @returns {string}    `:root {\n  --stitch-*: …;\n}\n`，仅含 --stitch-*，源序保留
 */
export function extractLayout(css) {
  const out = []; // [prop, value]，源插入序
  postcss.parse(css).walkRules(':root', (rule) => {
    rule.walkDecls(/^--/, (decl) => {
      const mapped = mapDecl(decl.prop, decl.value);
      if (mapped) out.push(mapped);
    });
  });
  const body = out.map(([p, v]) => `  ${p}: ${v};`).join('\n');
  return `:root {\n${body}\n}\n`;
}

// 单条 decl 的映射。命中 → [新prop, 值]；不收 → null。归一化②③在此体现为直映：
// ② saybriefly 8px 基的 --spacing-8 直落 --stitch-space-8（8 的倍数天然在 4px 网格）；
// ③ --spacing-unit → --stitch-space-unit（元数据带上）。
function mapDecl(prop, value) {
  // 字阶三族：--text/leading/tracking-<角色>，角色须在词表内（缺的不生成）。
  for (const axis of ['text', 'leading', 'tracking']) {
    const pre = `--${axis}-`;
    if (prop.startsWith(pre)) {
      const role = prop.slice(pre.length);
      return TYPE_ROLES.has(role) ? [`--stitch-${axis}-${role}`, value] : null;
    }
  }
  // 间距：--spacing-unit（元数据）优先于 --spacing-<n>。
  if (prop === '--spacing-unit') return ['--stitch-space-unit', value];
  const sp = prop.match(/^--spacing-(\d+)$/);
  if (sp) return [`--stitch-space-${sp[1]}`, value];
  // layout 四键：仅加前缀 + 归一化区间。
  const lk = prop.slice(2); // 去 '--'
  if (LAYOUT_KEYS.has(lk)) return [`--stitch-${lk}`, normalizeRange(value)];
  // 其余（颜色/字体/字重/圆角/阴影/surfaces）不收。
  return null;
}
