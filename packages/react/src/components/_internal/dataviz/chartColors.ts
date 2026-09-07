// 图表换肤桥（dataviz 私有原语——不进桶导出、不进族表/demo，供后续图表族成员复用）。
//
// recharts 的系列色靠 `fill` / `stroke` 逐系列传入。若不接管，recharts 会落自己的默认
// 十六进制调色板 → 破 H2（组件只读 `var(--stitch-*)`、不落 hex）。本桥把「系列序号」映射到
// 契约的抽象分类色槽 `--stitch-cat-1..6`（只为互相区分、随站换肤），任何图表系列的颜色都从这里取，
// 不在图表组件里各写一套、更不许出现 hex。零新增契约 token——纯复用现有分类槽。

/** 契约分类色槽数量（`--stitch-cat-1..6`，见 contract.css，固定 6，可移植）。 */
export const CAT_SLOT_COUNT = 6;

/**
 * 系列序号 → 分类色角色变量。序号从 0 起，超出 6 个槽位循环复用
 * （recharts 系列数不限，色槽恒 6）。产出恒为 `var(--stitch-cat-N)`，绝不落 hex。
 */
export const catColor = (index: number): string =>
  `var(--stitch-cat-${(((index % CAT_SLOT_COUNT) + CAT_SLOT_COUNT) % CAT_SLOT_COUNT) + 1})`;

/**
 * 一次取一整排系列色，喂给 recharts 的多系列（Line/Bar/Pie 的 N 个系列/扇区）。
 * `seriesColors(n)[i]` === `catColor(i)`。
 */
export const seriesColors = (count: number): string[] =>
  Array.from({ length: Math.max(0, count) }, (_, i) => catColor(i));
