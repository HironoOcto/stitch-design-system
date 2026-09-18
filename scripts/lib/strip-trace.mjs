// scripts/lib/strip-trace.mjs — stripTrace (issue #34).
// 迁移时的确定性剥离：把源 rules.md / composition.md（onboard 忠实产物，保留 DESIGN.md 来源追溯）
// 拷进发货预置前，删掉「可确定性剥离的追溯位置」→ 发布副本 consumer-clean。
//
// 可剥位置只有两处（onboard-site.md 的写法约定）：
//   ① 小节标题的 `← <来源>` 尾注：`## 一句话风格 ← DESIGN.md 顶部 tagline` → `## 一句话风格`
//   ② 专用追溯容器：`<!-- trace: … -->`（可跨行），整块删除
//
// 核心不变量（新站的机器强制，不靠自觉）：剥完这两处后，结果里**零 DESIGN.md 残留**。
// 有残留 = 有人把 DESIGN.md 写进了正文自由句（不可剥位置）→ 抛错并指出源哪行，build:skill 失败。
// 通用（rules.md 与 composition.md 共用；#35 复用），纯字符串、幂等：stripTrace(stripTrace(x)) === stripTrace(x)。

const RESIDUAL = 'DESIGN.md'; // 剥后不许残留的追溯记号

/**
 * 剥离可剥位置的追溯记号；剥后自检零 DESIGN.md 残留。
 * @param {string} text 源文件文本
 * @param {{ label?: string }} [opts] label = 源文件路径，用于报错定位
 * @returns {string} 剥离后的文本
 * @throws 若正文自由句里仍有 DESIGN.md（放在了不可剥位置）
 */
export function stripTrace(text, { label } = {}) {
  let out = text;
  // ② 专用追溯容器：`<!-- trace … -->`（跨行、非贪婪）；连同其独占行的换行一起删。
  out = out.replace(/<!--\s*trace\b[\s\S]*?-->[ \t]*\r?\n?/g, '');
  // ① 小节标题的 `← …` 尾注：保留标题本身，删 `←` 起的整段。
  out = out.replace(/^(#{1,6}\s.*?)\s*←.*$/gm, '$1');

  // 剥后自检：任何 DESIGN.md 残留都说明它被放进了不可剥位置（正文自由句）。
  // 报错定位到【源文件哪行】——残留行未被剥离改动过，直接在源里回查其行号。
  const srcLines = text.split('\n');
  const bad = [];
  for (const line of out.split('\n')) {
    if (!line.includes(RESIDUAL)) continue;
    const idx = srcLines.indexOf(line); // 残留行原样存在于源
    bad.push({ line, n: idx === -1 ? '?' : idx + 1 });
  }
  if (bad.length) {
    const where = label ? `${label}: ` : '';
    const detail = bad
      .map((b) => `  源第 ${b.n} 行: ${b.line.trim()}`)
      .join('\n');
    throw new Error(
      `${where}stripTrace 剥后仍有 ${bad.length} 处 ${RESIDUAL} 残留 —— ` +
        `${RESIDUAL} 追溯只能落在【小节标题 ← 尾注】或【<!-- trace --> 容器】，不许出现在正文：\n${detail}`,
    );
  }
  return out;
}
