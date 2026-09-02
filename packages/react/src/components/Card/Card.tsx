// 1. React 及其生态
import React from 'react';
import clsx from 'clsx';

// 3. 样式（永远最后）
import styles from './card.module.less';

/**
 * 表面处理（结构语义，非「长相」）：
 * - `outlined` 内容卡：描边 + 极淡升起影（结构主力卡）；
 * - `elevated` 浮动卡：无边、有阴影（真正抬起的浮层卡）；
 * - `filled`   中性卡：填充底、无边无影（扁平中性卡）；
 * - `dashed`   虚线卡：虚线描边。
 */
export type CardVariant = 'outlined' | 'elevated' | 'filled' | 'dashed';

/**
 * 颜色 = 语义状态 + 强调面 + 抽象分类槽（非「长相制」）：
 * - `default`：中性面（跟随 variant 的底/描边）；
 * - `accent`：强调面（走契约 `--stitch-bg-accent` + `--stitch-text-on-accent`）；
 * - 语义：`danger` / `success` / `warning` / `info`，走状态角色变量（软底 + 深同色字）；
 * - 分类：`cat-1…cat-6`，走契约分类色槽 `--stitch-cat-*`，只为「互相区分」而非表状态。
 */
export type CardColor =
  | 'default'
  | 'accent'
  | 'danger'
  | 'success'
  | 'warning'
  | 'info'
  | 'cat-1'
  | 'cat-2'
  | 'cat-3'
  | 'cat-4'
  | 'cat-5'
  | 'cat-6';

/**
 * 容器卡片：`children` 内容 + `variant` 表面处理 + `color` 颜色 + `hoverable`。
 * `extends HTMLAttributes<HTMLDivElement>`，`...rest` 透传到根 `<div>`
 * （`onClick` / `style` / `role` / `aria-*` / `tabIndex`）；无内部状态或 hook。
 *
 * 跨-prop 注意事项：
 * - **文字色与面色分离，保证可读 ≥AA**：任何 `color` 下文字都不直取身份色，而是由面色
 *   派生出足够深的墨色（语义色、分类槽、`accent` 强调面同理）——消费者无需自行处理对比。
 * - **可聚焦焦点环**：当消费者用 `tabIndex` / `onClick` 令卡片可聚焦时，焦点环自动走
 *   `--stitch-focus-ring` 呈现。
 * - `color` 与 `variant` 正交：颜色只改面/字/描边三个局部变量，任一 `variant` 都能承载任一 `color`。
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * 表面处理（描边 / 阴影 / 填充语义）
   * @default 'outlined'
   */
  variant?: CardVariant;
  /**
   * 颜色（语义状态 + 强调面 + 抽象分类槽）
   * @default 'default'
   */
  color?: CardColor;
  /**
   * 是否启用 hover 效果（cursor pointer + 抬起 -2px + 阴影）。
   * 默认 `false`（只读卡片）；设为 `true` 开启（可点击卡片 / 列表项等交互场景）。
   * @default false
   */
  hoverable?: boolean;
  /** 自定义内容 */
  children?: React.ReactNode;
}

const VARIANT_CLASS: Record<CardVariant, string> = {
  outlined: styles['card-outlined'],
  elevated: styles['card-elevated'],
  filled: styles['card-filled'],
  dashed: styles['card-dashed'],
};

// default = 中性，走基础类 + variant 的兜底面、不加 color 类（与源一致，便于测试断言）。
const colorClass = (color: CardColor): string =>
  color === 'default' ? '' : styles[`color-${color}`];

export const Card: React.FC<CardProps> = ({
  variant = 'outlined',
  color = 'default',
  hoverable = false,
  className,
  children,
  ...rest
}) => {
  const cls = clsx(
    styles.card,
    VARIANT_CLASS[variant],
    colorClass(color),
    hoverable && styles['card-hoverable'],
    className,
  );

  return (
    <div className={cls} {...rest}>
      {children}
    </div>
  );
};

Card.displayName = 'Card';
