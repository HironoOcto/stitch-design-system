// 饼 / 环图（data-viz 族；recharts 饼图引擎）。
//
// 扇区色一律经图表换肤桥读 `var(--stitch-cat-*)`——组件内绝不落 hex，切站时整图跟随；
// 扇区数不限、色槽恒 6，超出按序号循环取槽。扇区之间留一道细缝（`stroke` 取当前表面色
// `var(--stitch-bg-elevated)`），随主题换肤，视觉上把相邻扇区分开。
// 环形（donut）由 `innerRadius`（0–1 占比，Ant charts 语义）挖空中心；挖空后中心的留白
// 可放一个中心值（`centerLabel`），由 recharts 的 `<Label>` 出（svg 全由 recharts 出，
// 源码零手写 svg），文字走角色变量。
// 扇区不只靠颜色区分——默认出图例（`Legend`）把「分类名 → 色块」显式列出，读名即可对应，
// 主题色偏近时也分得开（不靠颜色即可辨别，守 a11y）。
// hover 悬浮内容复用 #1 的统一 `ChartTooltip`（Card 表面）；响应式 + `role="img"` a11y
// 外壳复用 `ChartFrame`。
//
// 1. React 及其生态
import React from 'react';
import clsx from 'clsx';
import {
  PieChart as RcPieChart,
  Pie,
  Cell,
  Label,
  Tooltip,
  Legend,
  type TooltipContentProps,
} from 'recharts';

// 2. 内部组件（相对路径）
import {
  ChartFrame,
  ChartTooltip,
  catColor,
  type ChartTooltipProps,
} from '../_internal/dataviz';

// 3. 样式（永远最后）
import styles from './pie-chart.module.less';

/**
 * 饼 / 环图。扇区色只从契约分类色槽 `var(--stitch-cat-*)` 取、按序号循环，随站换肤整图跟随；
 * 组件内零硬编码主题值、零手写内联 svg（svg 全由 recharts 出），无 emoji。`innerRadius` 挖空
 * 中心即成环形（donut），此时可用 `centerLabel` 在中心放一个值；默认出图例（`Legend`）把
 * 分类名列出，不只靠颜色区分（守 a11y）。整图作一张图对外——`role="img"` + `aria-label`
 * （缺省兜底非空名）。
 */
export interface PieChartProps {
  /** 数据源，每项一扇区（Ant charts `data` 语义） */
  data: Record<string, unknown>[];
  /** 扇区数值字段——决定扇区角度大小（Ant charts `angleField` 语义） */
  angleField: string;
  /** 扇区分类字段——作图例名与 tooltip 名（Ant charts `colorField` 语义） */
  colorField: string;
  /**
   * 环形内半径占比 0–1（Ant charts `innerRadius` 语义）；0 = 实心饼，>0 = 环形 donut
   * @default 0
   */
  innerRadius?: number;
  /** 环形中心值（仅 `innerRadius` > 0 挖空后有空间显示；扇区数值的汇总等） */
  centerLabel?: string | number;
  /**
   * 是否显示图例（把分类名 → 色块显式列出，作不依赖颜色的区分通道）
   * @default true
   */
  legend?: boolean;
  /**
   * 图表高度（px）；宽度恒铺满容器
   * @default 300
   */
  height?: number;
  /** 扇区值格式化（如货币 / 百分比）；作用于 tooltip 值 */
  valueFormatter?: (value: number) => string;
  /** 图表整体可访问名（`role="img"` 的文本替代）；缺省兜底非空名 */
  ariaLabel?: string;
  /** 透传外层容器类名 */
  className?: string;
}

/**
 * 把数据画成饼 / 环图，扇区色走契约分类色槽、随站换肤；可挖空成环形并在中心放一个值。
 */
export const PieChart: React.FC<PieChartProps> = ({
  data,
  angleField,
  colorField,
  innerRadius = 0,
  centerLabel,
  legend = true,
  height = 300,
  valueFormatter,
  ariaLabel,
  className,
}) => {
  // recharts 在给了自定义 `content` 时会忽略 `<Tooltip formatter>`（那只喂默认 tooltip），
  // 故在这里先把 payload 的数值过一遍 valueFormatter，再交给复用的 ChartTooltip 渲染。
  const renderTooltip = (props: TooltipContentProps) => {
    const { active, payload } = props;
    const entries: ChartTooltipProps['payload'] = payload?.map((entry) => ({
      name: entry.name,
      value:
        valueFormatter && typeof entry.value === 'number'
          ? valueFormatter(entry.value)
          : entry.value,
      color: entry.color,
    }));
    return <ChartTooltip active={active} payload={entries} />;
  };

  // innerRadius 是 0–1 占比 → 转成 recharts 认的百分比字符串（相对较短边，随容器自适应）。
  const innerPct = `${Math.max(0, Math.min(1, innerRadius)) * 100}%`;
  const showCenter =
    innerRadius > 0 && centerLabel != null && centerLabel !== '';

  return (
    <ChartFrame
      ariaLabel={ariaLabel}
      height={height}
      className={clsx(styles.chart, className)}
    >
      <RcPieChart margin={{ top: 8, right: 8, bottom: 4, left: 4 }}>
        <Tooltip content={renderTooltip} />
        {/* 默认出图例——把「分类名 → 色块」显式列出，一条不依赖颜色的区分通道。 */}
        {legend && (
          <Legend wrapperStyle={{ color: 'var(--stitch-text-primary)' }} />
        )}
        <Pie
          data={data}
          dataKey={angleField}
          nameKey={colorField}
          innerRadius={innerPct}
          outerRadius="80%"
          // 扇区间细缝取当前表面色（随主题换肤，H2：不落 hex），把相邻扇区分开。
          stroke="var(--stitch-bg-elevated)"
          // recharts 的入场动画是 JS 定时驱动（约 1.5s），既接不到 `--stitch-motion-*`、
          // 也超出 design-rules 动效时长窗口 → 关掉，不引入库外的越窗动效。
          isAnimationActive={false}
        >
          {data.map((_, i) => (
            // 每扇区色只从换肤桥取 var(--stitch-cat-*)，按序号循环（H2：不落 hex）。
            <Cell key={i} fill={catColor(i)} />
          ))}
          {/* 环形中心值：由 recharts 的 Label 出（svg 由库出、非手写），文字走角色变量。 */}
          {showCenter && (
            <Label
              position="center"
              value={centerLabel}
              className={styles.center}
            />
          )}
        </Pie>
      </RcPieChart>
    </ChartFrame>
  );
};

PieChart.displayName = 'PieChart';
