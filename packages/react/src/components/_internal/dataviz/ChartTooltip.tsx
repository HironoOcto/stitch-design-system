// 图表统一 tooltip（dataviz 私有原语——不进桶导出、不进族表/demo）。
//
// recharts 默认 tooltip 是写死的白框，不换肤、不合我们的表面语言。这里把它的悬浮内容改由
// 现有 `Card`（elevated 表面）承载——边/影/圆角/底色全走 Card 的角色变量，与全库浮层一致；
// 系列色块只吃传入的 `color`（由 chartColors 桥给的 `var(--stitch-cat-*)`），绝不落 hex（守 H2）。
//
// 用法（后续图表族成员）：`<Tooltip content={<ChartTooltip />} />`——recharts 运行时把
// active/payload/label 注入进来。此处只声明我们用到的最小形状，不耦合 recharts 的类型版本。
//
// 1. React 及其生态
import React from 'react';

// 2. 内部组件（相对路径）
import { Card } from '../../Card';

// 3. 样式（永远最后）
import styles from './chart-tooltip.module.less';

/** recharts 运行时注入的单条系列数据（我们用到的最小形状）。 */
export interface ChartTooltipEntry {
  /** 系列名 */
  name?: React.ReactNode;
  /** 该点的值 */
  value?: React.ReactNode;
  /** 系列色——恒为 chartColors 桥给的 `var(--stitch-cat-*)` 角色变量 */
  color?: string;
}

export interface ChartTooltipProps {
  /** 是否命中数据点（recharts 注入）；非命中不渲染 */
  active?: boolean;
  /** 命中点的各系列数据（recharts 注入） */
  payload?: ChartTooltipEntry[];
  /** 该点的 x 轴标签（recharts 注入） */
  label?: React.ReactNode;
}

/**
 * recharts tooltip 的自定义内容：用 `Card` 作表面，逐系列列出「色块 · 名 · 值」。
 * 非 active 或无数据时返回 `null`（不挡视线）。
 */
export const ChartTooltip: React.FC<ChartTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <Card variant="elevated" className={styles.tooltip}>
      {label != null && label !== '' && (
        <div className={styles.label}>{label}</div>
      )}
      {payload.map((entry, i) => (
        <div key={i} className={styles.row}>
          <span
            data-chart-swatch
            className={styles.swatch}
            style={{ background: entry.color }}
          />
          <span className={styles.name}>{entry.name}</span>
          <span className={styles.value}>{entry.value}</span>
        </div>
      ))}
    </Card>
  );
};

ChartTooltip.displayName = 'ChartTooltip';
