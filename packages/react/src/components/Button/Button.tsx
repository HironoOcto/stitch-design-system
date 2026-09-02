// 1. React 及其生态
import React from 'react';
import clsx from 'clsx';

// 3. 样式（永远最后）
import styles from './button.module.less';

export type ButtonType = 'primary' | 'default' | 'dashed' | 'text' | 'link';
export type ButtonSize = 'small' | 'middle' | 'large';
export type ButtonHTMLType = 'submit' | 'reset' | 'button';

/**
 * 动作按钮：`type` 语义 + `size` + `danger`/`ghost`/`block` 布尔态 + `icon` 插槽 +
 * `loading`/`disabled`。`extends ButtonHTMLAttributes<button>`（`Omit` 掉受控的
 * `type`），`...rest` 透传到根 `<button>`。
 *
 * 跨-prop 注意事项：
 * - **`type="primary"`** 是强调填充 CTA（`--stitch-accent` 填充 + `--stitch-accent-text`）；
 *   圆角由 `--stitch-radius-button` 决定（每站不同）。
 * - **`icon`** 传你自己的 `<Icon>`（Button 只做插槽包裹，本体不产出任何图标）；`loading` 时
 *   icon 隐藏。
 * - **`loading`** = 非交互（`pointer-events:none`）+ `aria-busy` + 暗淡，不带内建加载动画
 *   （需要动效由消费者按 `--stitch-motion-*` 自行加）。
 * - **Accessibility**：纯图标按钮请传 `aria-label`；`disabled` 走原生 `disabled` 属性
 *   （自动阻断点击与键盘）。
 * - **Do NOT** 传 emoji / Unicode 符号 / 裸 `<svg>` 作图标——一律经 `<Icon>`。
 */
export interface ButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'type'
> {
  /** 按钮类型 */
  type?: ButtonType;
  /** 尺寸 */
  size?: ButtonSize;
  /**
   * 危险按钮样式
   * @default false
   */
  danger?: boolean;
  /**
   * 幽灵按钮（透明填充）
   * @default false
   */
  ghost?: boolean;
  /**
   * 块级按钮（撑满宽度）
   * @default false
   */
  block?: boolean;
  /**
   * 加载状态（非交互 + `aria-busy`；loading 时不渲染 icon）
   * @default false
   */
  loading?: boolean;
  /**
   * 禁用状态
   * @default false
   */
  disabled?: boolean;
  /** 图标节点（传入自己的 `<Icon>`；loading 时隐藏） */
  icon?: React.ReactNode;
  /**
   * 原生 button type
   * @default 'button'
   */
  htmlType?: ButtonHTMLType;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  type = 'default',
  size = 'middle',
  danger = false,
  ghost = false,
  block = false,
  loading = false,
  disabled = false,
  icon,
  htmlType = 'button',
  className,
  children,
  ...rest
}) => {
  const cls = clsx(
    styles.btn,
    styles[`btn-${type}`],
    styles[`btn-${size}`],
    danger && styles['btn-danger'],
    ghost && styles['btn-ghost'],
    block && styles['btn-block'],
    loading && styles['btn-loading'],
    className,
  );

  return (
    <button
      type={htmlType}
      className={cls}
      disabled={disabled}
      aria-busy={loading || undefined}
      {...rest}
    >
      {icon && !loading && <span className={styles['btn-icon']}>{icon}</span>}
      {children && <span>{children}</span>}
    </button>
  );
};

Button.displayName = 'Button';
