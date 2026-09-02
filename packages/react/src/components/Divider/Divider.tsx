// 1. React 及其生态
import React, { useId } from 'react';
import clsx from 'clsx';

// 2. 样式（永远最后）
import styles from './divider.module.less';

/** 方向：水平（默认）/ 垂直（内联细线） */
export type DividerType = 'horizontal' | 'vertical';

/** 线型：实线 / 虚线（只留可 CSS 表达的两档） */
export type DividerVariant = 'solid' | 'dashed';

/** 带文字时文字位置（仅水平生效） */
export type DividerOrientation = 'left' | 'center' | 'right';

/**
 * 分隔线（Ant `Divider` 语义）：`type`（水平/垂直）+ `variant`（实线/虚线）+ `children` 文字
 * 分隔线（`orientation` 左/中/右 + `plain` 常规字重）。非交互件，`role="separator"`。
 *
 * 跨-prop 注意事项：
 * - **线色统一走 `--stitch-border`**：主题里 border 即「主结构分隔手段」，正是分隔线该用的角色；
 *   线宽 `--stitch-border-width`，虚线由 `border-style: dashed` 表达（颜色仍是 border 角色）。
 * - **文字分隔线（仅水平）**：`::before`/`::after` 两段 `border-top` 画线、文字居中夹在中间；
 *   `orientation=left/right` 调两段 width 占比。文字色 `--stitch-text-primary`、字重
 *   `--stitch-font-weight-medium`（`plain` → `-normal` + 小一档字号）。**垂直分隔线忽略
 *   `children`**（与 Ant 一致）。
 * - **a11y**：根 `role="separator"`；垂直显式 `aria-orientation="vertical"`（水平用 ARIA 默认
 *   方向，不标注）；文字分隔线的文字即其可访问名。
 */
export interface DividerProps {
  /**
   * 方向：水平 / 垂直
   * @default 'horizontal'
   */
  type?: DividerType;
  /**
   * 线型：实线 / 虚线
   * @default 'solid'
   */
  variant?: DividerVariant;
  /**
   * 文字位置（仅水平且带文字时生效）
   * @default 'center'
   */
  orientation?: DividerOrientation;
  /**
   * 文字用常规字重（非加粗强调）
   * @default false
   */
  plain?: boolean;
  /** 分隔线中间的文字内容（仅水平生效；垂直分隔线忽略） */
  children?: React.ReactNode;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

export const Divider: React.FC<DividerProps> = ({
  type = 'horizontal',
  variant = 'solid',
  orientation = 'center',
  plain = false,
  children,
  className,
  style,
}) => {
  // 文字分隔线：仅水平方向、且确有内容时成立（垂直分隔线无文字）。
  const hasText =
    type === 'horizontal' && children != null && children !== false;
  // separator 的可访问名不取自内容 → 用 aria-labelledby 指向文字，令 SR 读出文字。
  const textId = useId();

  const cls = clsx(
    styles.divider,
    type === 'vertical'
      ? styles['divider-vertical']
      : styles['divider-horizontal'],
    variant === 'dashed' && styles['divider-dashed'],
    hasText && styles['divider-with-text'],
    hasText && styles[`divider-${orientation}`],
    hasText && plain && styles['divider-plain'],
    className,
  );

  return (
    <div
      className={cls}
      style={style}
      role="separator"
      // separator 默认方向为 horizontal（ARIA 规范）→ 仅垂直时显式标注。
      aria-orientation={type === 'vertical' ? 'vertical' : undefined}
      aria-labelledby={hasText ? textId : undefined}
    >
      {hasText && (
        <span id={textId} className={styles['divider-text']}>
          {children}
        </span>
      )}
    </div>
  );
};

Divider.displayName = 'Divider';
