// 1. React 及其生态
import React from 'react';
import clsx from 'clsx';

// 3. 样式（永远最后）
import styles from './typing-indicator.module.less';

/**
 * 「对方正在输入」指示：三点循环动画（IM 语境是**对方**的态）。点为角色变量小元素
 * （`--stitch-text-muted` 铺底的小圆，非 emoji / Unicode / 裸 svg），动效走 `--stitch-motion-*`
 * （不超设计动效窗）。无 Ant 对应件 → 取 Ant 最近惯例（`label` 可访问名 + 透传原生属性）。
 *
 * 跨-prop 注意事项：
 * - **纯呈现件**：只画「正在输入」的三点动画，不含业务（谁在输入、何时出现由上层决定）。
 * - **可及名走 `label`**：根节点 `role="status"`（`aria-live` 区，屏幕阅读器读出 `label`），
 *   三点纯装饰（`aria-hidden`）。默认可访问名「对方正在输入」。
 * - **动效降级**：尊重 `prefers-reduced-motion`——用户关动效时三点停在静止态、不循环。
 */
export interface TypingIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * 可访问名（屏幕阅读器读出，如「张三正在输入」）
   * @default '对方正在输入'
   */
  label?: string;
  /** 自定义类名（挂到根容器） */
  className?: string;
  /** 行内样式（挂到根容器） */
  style?: React.CSSProperties;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  label = '对方正在输入',
  className,
  style,
  ...rest
}) => {
  return (
    <span
      className={clsx(styles.indicator, className)}
      style={style}
      role="status"
      aria-label={label}
      {...rest}
    >
      <span className={styles.dot} aria-hidden="true" />
      <span className={styles.dot} aria-hidden="true" />
      <span className={styles.dot} aria-hidden="true" />
    </span>
  );
};

TypingIndicator.displayName = 'TypingIndicator';
