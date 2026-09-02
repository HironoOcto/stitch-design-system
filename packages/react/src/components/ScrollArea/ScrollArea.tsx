// 1. React 及其生态
import React from 'react';
import { ScrollArea as RadixScrollArea } from 'radix-ui';
import clsx from 'clsx';

// 3. 样式（永远最后）
import styles from './scroll-area.module.less';

export type ScrollAreaOrientation = 'vertical' | 'horizontal' | 'both';

/**
 * 自定义滚动区（无 Ant 对应）：给内容区套一层样式统一的滚动条，抹平各浏览器原生滚动条的
 * 视觉差异。**纯样式增强件**——只包一层滚动条外观，不改 `children` 的内容语义、不新增交互，
 * 使用者仍在 `children` 里放任意可滚动内容、由 `className`/`style` 定容器高度或最大高度。
 *
 * 跨-prop 注意事项：
 * - **高度/尺寸由使用者给**：组件本身不设高度；容器需可溢出才出滚动条，故必须由使用者经
 *   `style`（如 `{ height }` / `{ maxHeight }`）或 `className` 约束尺寸，否则内容撑开不滚动。
 * - **`orientation` → 渲哪条滚动条**：`vertical`（默认）只纵向、`horizontal` 只横向、`both`
 *   纵横两条 + 右下角块（`Corner`）。这是本组件唯一的分支逻辑。
 * - **溢出才现条**：底层 `type="auto"`——仅当内容在对应方向溢出时才渲出滚动条（贴近原生
 *   语义），不溢出不占位。
 * - **Less 皮**：`Scrollbar` 走透明槽、`Thumb` 走 `--stitch-text-muted` 中性中灰（近原生
 *   手柄）+ hover/拖动加深到 `--stitch-text-secondary`，圆角走 `--stitch-radius-button`；
 *   状态由底层挂的 `data-state`/
 *   `data-orientation` 描，组件不自持 state。
 * - **键盘/焦点/滚动/ARIA** 全归底层原语，组件不重复实现（纯外观层，非新增交互）。
 */
export interface ScrollAreaProps {
  /** 可滚动内容（放进 Viewport，语义原样保留） */
  children?: React.ReactNode;
  /**
   * 滚动方向：决定渲哪条滚动条
   * @default 'vertical'
   */
  orientation?: ScrollAreaOrientation;
  /** 自定义类名（挂到根容器；配 style 定高度/最大高度） */
  className?: string;
  /** 行内样式（挂到根容器；使用者在此定 height / maxHeight 令内容可溢出） */
  style?: React.CSSProperties;
}

export const ScrollArea: React.FC<ScrollAreaProps> = ({
  children,
  orientation = 'vertical',
  className,
  style,
}) => {
  const showVertical = orientation === 'vertical' || orientation === 'both';
  const showHorizontal = orientation === 'horizontal' || orientation === 'both';

  return (
    <RadixScrollArea.Root
      className={clsx(styles.root, className)}
      style={style}
      type="auto"
    >
      <RadixScrollArea.Viewport className={styles.viewport}>
        {children}
      </RadixScrollArea.Viewport>

      {showVertical && (
        <RadixScrollArea.Scrollbar
          className={styles.scrollbar}
          orientation="vertical"
        >
          <RadixScrollArea.Thumb className={styles.thumb} />
        </RadixScrollArea.Scrollbar>
      )}

      {showHorizontal && (
        <RadixScrollArea.Scrollbar
          className={styles.scrollbar}
          orientation="horizontal"
        >
          <RadixScrollArea.Thumb className={styles.thumb} />
        </RadixScrollArea.Scrollbar>
      )}

      {orientation === 'both' && (
        <RadixScrollArea.Corner className={styles.corner} />
      )}
    </RadixScrollArea.Root>
  );
};

ScrollArea.displayName = 'ScrollArea';
