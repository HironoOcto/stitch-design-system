// dataviz 图表换肤地基（私有内部原语，仅供图表族成员 #2–#5 复用；
// `_` 前缀 → build:refs 跳过、不进桶导出/族表/demo）。三件套：
//   · chartColors  换肤桥：系列序号 → `var(--stitch-cat-*)`，杜绝 recharts 落默认 hex。
//   · ChartFrame   响应式 + a11y 外壳：ResponsiveContainer 包法 + role="img"/aria-label。
//   · ChartTooltip 统一 tooltip：recharts tooltip 内容改由 Card 承载，复用其角色变量。
export { CAT_SLOT_COUNT, catColor, seriesColors } from './chartColors';
export { ChartFrame } from './ChartFrame';
export type { ChartFrameProps } from './ChartFrame';
export { ChartTooltip } from './ChartTooltip';
export type { ChartTooltipProps, ChartTooltipEntry } from './ChartTooltip';
