// 柱状图（data-viz 族；recharts 柱状引擎）。
//
// 系列色一律经图表换肤桥读 `var(--stitch-cat-*)`——组件内绝不落 hex，切站时整图跟随。
// 参考长相是扁平蓝柱（克制的实心矩形）：柱体不加圆角（`radius=0`）、不描边。
// 单系列直接一排柱；多系列默认分组并排（`stack` 开启则堆叠成一柱，Ant charts `isStack` 语义）。
// 多系列不只靠颜色区分——另加图例（`Legend`，只在多系列时出）把「系列名 → 色块」显式列出，
// 读名即可对应，主题色偏近时也分得开（不靠颜色即可辨别，守 a11y）。
// hover 高亮的柱背景（`Tooltip cursor`）从墨色 `color-mix()` 派生软色，不落 hex。
// 响应式 + `role="img"` a11y 外壳复用 `ChartFrame`；悬浮内容复用 `ChartTooltip`（Card 表面）。
//
// 1. React 及其生态
import React from 'react';
import clsx from 'clsx';
import {
  BarChart as RcBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
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
import styles from './bar-chart.module.less';

/** 单条系列：从每行数据里取哪个字段、显示成什么名。 */
export interface BarChartSeries {
  /** 该系列在数据项里取值的字段名 */
  dataKey: string;
  /** 系列显示名（tooltip / 图例）；缺省用 `dataKey` */
  name?: string;
}

/**
 * 柱状图。系列色只从契约分类色槽 `var(--stitch-cat-*)` 取、按序号循环，随站换肤整图跟随；
 * 组件内零硬编码主题值、零手写内联 svg（svg 全由 recharts 出），无 emoji。多系列默认分组并排，
 * `stack` 开启则堆叠成一柱；多系列另出图例（`Legend`）把系列名列出，不只靠颜色区分（守 a11y）。
 * 整图作一张图对外——`role="img"` + `aria-label`（缺省兜底非空名）。
 */
export interface BarChartProps {
  /** 数据源，每项一行记录（Ant charts `data` 语义） */
  data: Record<string, unknown>[];
  /** x 轴取值字段名（Ant charts `xField` 语义） */
  xField: string;
  /** 一条或多条系列（各取一个 y 字段） */
  series: BarChartSeries[];
  /**
   * 多系列堆叠成一柱（Ant charts `isStack` 语义）；关闭时多系列分组并排
   * @default false
   */
  stack?: boolean;
  /**
   * 图表高度（px）；宽度恒铺满容器
   * @default 300
   */
  height?: number;
  /** y 值格式化（如货币）；作用于坐标轴刻度与 tooltip 值 */
  valueFormatter?: (value: number) => string;
  /** 图表整体可访问名（`role="img"` 的文本替代）；缺省兜底非空名 */
  ariaLabel?: string;
  /** 透传外层容器类名 */
  className?: string;
}

/**
 * 把数据画成柱状（单 / 多系列，可堆叠），系列色走契约分类色槽、随站换肤。
 */
export const BarChart: React.FC<BarChartProps> = ({
  data,
  xField,
  series,
  stack = false,
  height = 300,
  valueFormatter,
  ariaLabel,
  className,
}) => {
  const axisTick = { fill: 'var(--stitch-text-secondary)' };
  const tickFormatter = valueFormatter
    ? (value: number) => valueFormatter(value)
    : undefined;

  // recharts 在给了自定义 `content` 时会忽略 `<Tooltip formatter>`（那只喂默认 tooltip），
  // 故在这里先把 payload 的数值过一遍 valueFormatter，再交给复用的 ChartTooltip 渲染。
  const renderTooltip = (props: TooltipContentProps) => {
    const { active, label, payload } = props;
    const entries: ChartTooltipProps['payload'] = payload?.map((entry) => ({
      name: entry.name,
      value:
        valueFormatter && typeof entry.value === 'number'
          ? valueFormatter(entry.value)
          : entry.value,
      color: entry.color,
    }));
    return (
      <ChartTooltip
        active={active}
        label={label as ChartTooltipProps['label']}
        payload={entries}
      />
    );
  };

  // 堆叠时所有系列共享一个 stackId → 叠成一柱；分组时不给 stackId → recharts 自动并排。
  const stackId = stack ? 'stack' : undefined;
  const showLegend = series.length > 1;

  return (
    <ChartFrame
      ariaLabel={ariaLabel}
      height={height}
      className={clsx(styles.chart, className)}
    >
      <RcBarChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: 4 }}>
        <CartesianGrid stroke="var(--stitch-border)" vertical={false} />
        <XAxis
          dataKey={xField}
          stroke="var(--stitch-border)"
          tick={axisTick}
          tickLine={false}
        />
        <YAxis
          stroke="var(--stitch-border)"
          tick={axisTick}
          tickLine={false}
          tickFormatter={tickFormatter}
        />
        {/* hover 柱背景：从墨色派生软色，随主题换肤（H2：不落 hex）。 */}
        <Tooltip
          content={renderTooltip}
          cursor={{
            fill: 'color-mix(in srgb, var(--stitch-text-primary), transparent 92%)',
          }}
        />
        {/* 多系列才出图例——把「系列名 → 色块」显式列出，一条不依赖颜色的区分通道。 */}
        {showLegend && (
          <Legend wrapperStyle={{ color: 'var(--stitch-text-primary)' }} />
        )}
        {series.map((s, i) => (
          <Bar
            key={s.dataKey}
            dataKey={s.dataKey}
            name={s.name ?? s.dataKey}
            // 系列色只从换肤桥取 var(--stitch-cat-*)，按序号循环（H2：不落 hex）。
            fill={catColor(i)}
            stackId={stackId}
            // 扁平柱：实心矩形、不加圆角。
            radius={0}
            // recharts 的入场动画是 JS 定时驱动（约 1.5s），既接不到 `--stitch-motion-*`、
            // 也超出 design-rules 动效时长窗口 → 关掉，不引入库外的越窗动效。
            isAnimationActive={false}
          />
        ))}
      </RcBarChart>
    </ChartFrame>
  );
};

BarChart.displayName = 'BarChart';
