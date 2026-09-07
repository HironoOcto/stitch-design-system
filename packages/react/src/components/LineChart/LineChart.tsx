// 折线 / 面积图（data-viz 族；recharts 折线引擎）。
//
// 系列色一律经图表换肤桥读 `var(--stitch-cat-*)`——组件内绝不落 hex，切站时整图跟随；
// 折线下的面积用 `color-mix()` 从同一系列色派生软填充（随系列色一起换肤）。
// 多系列的区分不只靠颜色：另加两条不依赖颜色的通道——线型（`strokeDasharray` 按序循环）
// 与末端标名（每条线只在末点旁标出系列名，文字走 `var(--stitch-text-primary)`）——
// 主题线色偏淡时也能分得开（不靠颜色即可辨别，守 a11y）。
// 响应式 + `role="img"` a11y 外壳复用 `ChartFrame`；悬浮内容复用 `ChartTooltip`（Card 表面）。
//
// 1. React 及其生态
import React from 'react';
import clsx from 'clsx';
import {
  AreaChart,
  Area,
  LineChart as RcLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
  type TooltipContentProps,
  type LabelProps,
} from 'recharts';

// 2. 内部组件（相对路径）
import {
  ChartFrame,
  ChartTooltip,
  catColor,
  type ChartTooltipProps,
} from '../_internal/dataviz';

// 3. 样式（永远最后）
import styles from './line-chart.module.less';

// 线型循环：实 / 虚 / 点 / 点划——按系列序号取，单系列恒取 `'0'`（实线，外观零变化），
// 多系列从第 2 条起自动虚/点，凭线型即可分（一条不依赖颜色的区分通道）。
const DASH_CYCLE = ['0', '6 4', '2 4', '10 4 2 4'];
const dashOf = (index: number): string =>
  DASH_CYCLE[
    ((index % DASH_CYCLE.length) + DASH_CYCLE.length) % DASH_CYCLE.length
  ];

/** 单条系列：从每行数据里取哪个字段、显示成什么名。 */
export interface LineChartSeries {
  /** 该系列在数据项里取值的字段名 */
  dataKey: string;
  /** 系列显示名（tooltip / 图例）；缺省用 `dataKey` */
  name?: string;
}

/**
 * 折线 / 面积图。系列色只从契约分类色槽 `var(--stitch-cat-*)` 取、按序号循环，随站换肤整图跟随；
 * `area` 开启时线下软填充由同一系列色经 `color-mix()` 派生。多系列不只靠颜色区分——每系列按序
 * 循环线型（`strokeDasharray`），并在末点旁直接标出系列名（文字走 `var(--stitch-text-primary)`），
 * 故主题线色偏淡时也能分辨（不依赖颜色，守 a11y）。svg 全由 recharts 出、源码零手写 svg，无 emoji。
 * 整图作一张图对外——`role="img"` + `aria-label`（缺省兜底非空名）。
 */
export interface LineChartProps {
  /** 数据源，每项一行记录（Ant charts `data` 语义） */
  data: Record<string, unknown>[];
  /** x 轴取值字段名（Ant charts `xField` 语义） */
  xField: string;
  /** 一条或多条系列（各取一个 y 字段） */
  series: LineChartSeries[];
  /**
   * 平滑曲线（Ant charts `smooth` 语义）
   * @default false
   */
  smooth?: boolean;
  /**
   * 折线下渲染派生软填充面积（Ant charts `area` 语义）
   * @default false
   */
  area?: boolean;
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
 * 把数据画成折线（可选面积），系列色走契约分类色槽、随站换肤。
 */
export const LineChart: React.FC<LineChartProps> = ({
  data,
  xField,
  series,
  smooth = false,
  area = false,
  height = 300,
  valueFormatter,
  ariaLabel,
  className,
}) => {
  const curveType = smooth ? 'monotone' : 'linear';

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

  // 末端标名：每条线只在最后一个数据点旁标出系列名——一条不依赖颜色的区分通道。
  // recharts 逐点调用 content，仅末点渲染 <text>（其余返回 null）；文字色是「墨色」不是线色，
  // 走 var(--stitch-text-primary)（映射靠标签贴在该线末点的位置，不靠颜色）。
  const lastIndex = data.length - 1;
  const renderEndLabel =
    (name: string) =>
    ({ x, y, index }: LabelProps) => {
      if (index !== lastIndex) return null;
      return (
        <text
          x={Number(x) + 8}
          y={Number(y)}
          dy={4}
          className={styles.endLabel}
        >
          {name}
        </text>
      );
    };

  // 右侧留白，给末端标签让位，防贴右边被裁。
  const margin = { top: 8, right: 56, bottom: 4, left: 4 };

  const commonAxes = (
    <>
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
      <Tooltip content={renderTooltip} />
    </>
  );

  const chart = area ? (
    <AreaChart data={data} margin={margin}>
      {commonAxes}
      {series.map((s, i) => {
        const color = catColor(i);
        const name = s.name ?? s.dataKey;
        return (
          <Area
            key={s.dataKey}
            type={curveType}
            dataKey={s.dataKey}
            name={name}
            stroke={color}
            strokeWidth={2}
            // 线型按序循环——不依赖颜色的区分通道（单系列恒实线，外观零变化）。
            strokeDasharray={dashOf(i)}
            // 面积软填充：从同一系列色派生，随系列色一起换肤（H2：不落 hex）。
            fill={`color-mix(in srgb, ${color}, transparent 88%)`}
            fillOpacity={1}
            dot={false}
            activeDot={{ r: 4 }}
            // recharts 的入场动画是 JS 定时驱动（约 1.5s），既接不到 `--stitch-motion-*`、
            // 也超出 design-rules 动效时长窗口 → 关掉，不引入库外的越窗动效。
            isAnimationActive={false}
          >
            <LabelList dataKey={s.dataKey} content={renderEndLabel(name)} />
          </Area>
        );
      })}
    </AreaChart>
  ) : (
    <RcLineChart data={data} margin={margin}>
      {commonAxes}
      {series.map((s, i) => {
        const name = s.name ?? s.dataKey;
        return (
          <Line
            key={s.dataKey}
            type={curveType}
            dataKey={s.dataKey}
            name={name}
            stroke={catColor(i)}
            strokeWidth={2}
            // 线型按序循环——同 Area，不依赖颜色的区分通道。
            strokeDasharray={dashOf(i)}
            dot={false}
            activeDot={{ r: 4 }}
            // 同 Area：关掉 recharts 越窗的 JS 入场动画（见上）。
            isAnimationActive={false}
          >
            <LabelList dataKey={s.dataKey} content={renderEndLabel(name)} />
          </Line>
        );
      })}
    </RcLineChart>
  );

  return (
    <ChartFrame
      ariaLabel={ariaLabel}
      height={height}
      className={clsx(styles.chart, className)}
    >
      {chart}
    </ChartFrame>
  );
};

LineChart.displayName = 'LineChart';
