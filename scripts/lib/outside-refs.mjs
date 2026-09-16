// scripts/lib/outside-refs.mjs — check:boundary 的「引用 <skill>/ 外资源」扫描 (issue #34).
// 发货面双保险：stripTrace 保证 preset rules.md 零 DESIGN.md（放错即 build 红）；本扫描是独立
// 的静态复核——即便 stripTrace 有 bug，committed 的发货预置里任何指向 skill 目录外资源的痕迹
// 也会被这道文本扫描拦下。定义见 ADR 0003（知识边界）；本文件只实现。
//
// 种子 = 「外资源」的字面痕迹（路径段 / 文件名 / 记号）。命中即越界。
export const OUTSIDE_REF_SEEDS = [
  ['DESIGN.md', /DESIGN\.md/], // 站源超集，只在 sites/<站>/source/ 下
  ['docs/', /docs\//], // 源仓库文档树
  ['scripts/', /scripts\//], // 构建脚本
  ['CONTEXT', /CONTEXT/], // 根 CONTEXT.md 词汇表
  ['source/', /source\//], // sites/<站>/source/ bundle 存档
  ['ADR', /\bADR\b/], // docs/adr/*
  // 孪生横指（#34）：rules.md 与 adapter.css/variables.css 是同源平行产出、互不引用。
  // 发货预置里出现回指孪生的痕迹 = onboard 生成流程被污染（见 onboard-site.md 双 prompt 隔离）。
  ['adapter.css', /adapter\.css/], // 回指值视图文件
  ['variables.css', /variables\.css/], // 回指站 bundle 值源
  ['见 adapter', /见\s*adapter/], // 「见 adapter <token>」横指短语（无 .css 也拦）
];

/**
 * 扫描文本里指向 skill 目录外资源的痕迹。
 * @param {string} text
 * @param {{ seeds?: [string,RegExp][], whitelist?: string[] }} [opts]
 *   whitelist：明确放行的外部引用字面量（如消费项目的 `.agent/stitch.theme.json` 指针）。
 *   命中前先把白名单字面量从行里抹成等长空白，故白名单可豁免「恰好含某种子」的合法引用。
 * @returns {{line:number,label:string,match:string}[]} 命中列表（1-based 行号）
 */
export function scanOutsideRefs(
  text,
  { seeds = OUTSIDE_REF_SEEDS, whitelist = [] } = {},
) {
  const hits = [];
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    for (const w of whitelist)
      if (w) line = line.split(w).join(' '.repeat(w.length)); // 抹白名单，保列位
    for (const [label, re] of seeds) {
      const m = line.match(re);
      if (m) hits.push({ line: i + 1, label, match: m[0] });
    }
  }
  return hits;
}
