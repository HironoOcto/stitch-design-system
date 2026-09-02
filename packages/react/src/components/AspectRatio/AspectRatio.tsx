// 1. React 及其生态
import React from 'react';
import { AspectRatio as RadixAspectRatio } from 'radix-ui';
import clsx from 'clsx';

// 3. 样式（永远最后）
import styles from './aspect-ratio.module.less';

/**
 * 锁宽高比容器（无 Ant 对应）：把 `children` 约束在固定宽高比（如 `16/9`）里，宽度自适应、
 * 高度按比例算出。常配图片 / 视频 / 头像等媒体，避免加载前后的布局抖动（CLS）。
 *
 * 跨-prop 注意事项：
 * - **纯布局件，无皮无状态**：不含交互 / 状态 / 皮色，无 `--stitch-*` 颜色角色可上（基本零
 *   Less）；圆角、边框、底色等观感由**使用者在 `children` 上或 `className`/`style` 里定**，
 *   本组件只负责撑出比例框。无 `data-state`（静态布局）。
 * - **`ratio` 直接透传底层**（与 Radix 同名，非回调、无需归一）：`ratio` 为宽 ÷ 高，如
 *   `16 / 9`、`4 / 3`、`1`（正方形）。底层用外层 wrapper 的 `padding-bottom = 100 / ratio`
 *   撑出比例，`children` 绝对定位铺满内层。
 * - **常与 Image / Avatar 组合**：如 `<AspectRatio ratio={16/9}><Image …/></AspectRatio>`，
 *   让媒体填满比例框（媒体自身设 `width:100%; height:100%; object-fit:cover`）。
 */
export interface AspectRatioProps {
  /**
   * 宽高比（宽 ÷ 高），如 `16 / 9`、`4 / 3`
   * @default 1
   */
  ratio?: number;
  /** 约束进比例框的内容（媒体等） */
  children?: React.ReactNode;
  /** 自定义类名（挂到比例框内容层） */
  className?: string;
  /** 行内样式（挂到比例框内容层） */
  style?: React.CSSProperties;
}

export const AspectRatio: React.FC<AspectRatioProps> = ({
  ratio = 1,
  children,
  className,
  style,
}) => (
  <RadixAspectRatio.Root
    ratio={ratio}
    className={clsx(styles.root, className)}
    style={style}
  >
    {children}
  </RadixAspectRatio.Root>
);

AspectRatio.displayName = 'AspectRatio';
