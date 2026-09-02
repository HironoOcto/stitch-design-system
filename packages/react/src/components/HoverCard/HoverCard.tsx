// 1. React 及其生态
import React from 'react';
import { HoverCard as RadixHoverCard } from 'radix-ui';
import clsx from 'clsx';

// 3. 样式（永远最后）
import styles from './hover-card.module.less';

/**
 * 悬浮富信息卡：`trigger` 触发器 + `children` 富内容（头像 / 简介 / 预览之类）+ 延时控制
 * `openDelay` / `closeDelay` + 受控 `open` / 非受控 `defaultOpen` / `onOpenChange`。**hover 触发**、
 * 延时弹出，不抢焦点。
 *
 * 跨-prop 注意事项（三件浮层划清，别混用）：
 * - **vs Tooltip**：Tooltip 是短**文字**提示、`role="tooltip"`、快速出现、不含交互；HoverCard 是
 *   **hover 触发的富内容卡**（可放头像 / 链接 / 预览），非 tooltip 语义、延时弹出。
 * - **vs Popover**：Popover 是 **click** 触发的可交互浮层、`role="dialog"`、点开后**抢焦点**并做焦点陷阱；
 *   HoverCard 是 **hover** 触发、**不抢焦点**（鼠标移走即收），供「顺带一瞥」的补充信息，不是主操作面。
 * - **延时是本组件的核心手感**：`openDelay`（默认 700ms）避免鼠标划过误触，`closeDelay`（默认 300ms）
 *   让指针能移到卡上而不立即消失；两者与底层同名，直接透传。
 * - **面 = 浮起层**（同 Popover 浮层族）：卡面走 `--stitch-bg-elevated`（浮起面）+ 深字
 *   `--stitch-text-primary`，边框 `--stitch-border`、圆角 `--stitch-radius-card`、阴影
 *   `--stitch-shadow-base`；开合态由底层挂的 `data-state` 描（`open` 时淡入），组件不自持显隐 state。
 * - **键盘 / 焦点 / ARIA**（hover / focus 触发、Esc 收、指针出入时序）由底层保证，组件不重复实现。
 */
export interface HoverCardProps {
  /** 触发器：任意可承载 hover / focus 的元素（如头像、链接、姓名），卡片锚定其上 */
  trigger: React.ReactNode;
  /** 卡片富内容，可含头像 / 简介 / 链接 / 预览等 */
  children?: React.ReactNode;
  /** 受控显隐（气泡浮层约定：Ant v5 `open`） */
  open?: boolean;
  /** 非受控初始显隐 @default false */
  defaultOpen?: boolean;
  /** 显隐变化回调（气泡浮层约定：Ant v5 `onOpenChange`） */
  onOpenChange?: (open: boolean) => void;
  /** 指针进入触发器到弹出的延时（ms） @default 700 */
  openDelay?: number;
  /** 指针离开到收起的延时（ms） @default 300 */
  closeDelay?: number;
  /** 触发器与卡片的间距（px） @default 8 */
  sideOffset?: number;
  /** 卡片的可及名——无可见标题时用它 */
  'aria-label'?: string;
  /** 卡片的可及名来源：指向卡内标题元素的 id */
  'aria-labelledby'?: string;
  /** 自定义类名（挂到卡面上） */
  className?: string;
}

/**
 * 悬浮富信息卡：hover 触发、延时弹出的富内容卡，不抢焦点；
 * 受控（`open`/`onOpenChange`）与非受控（`defaultOpen`）双模式，延时由 `openDelay`/`closeDelay` 调。
 */
export const HoverCard: React.FC<HoverCardProps> = ({
  trigger,
  children,
  open,
  defaultOpen,
  onOpenChange,
  openDelay,
  closeDelay,
  sideOffset = 8,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}) => (
  // open/defaultOpen/onOpenChange/openDelay/closeDelay 与底层同名，直接透传
  <RadixHoverCard.Root
    open={open}
    defaultOpen={defaultOpen}
    onOpenChange={onOpenChange}
    openDelay={openDelay}
    closeDelay={closeDelay}
  >
    <RadixHoverCard.Trigger asChild>{trigger}</RadixHoverCard.Trigger>
    <RadixHoverCard.Portal>
      <RadixHoverCard.Content
        className={clsx(styles.content, className)}
        sideOffset={sideOffset}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
      >
        {children}
        <RadixHoverCard.Arrow className={styles.arrow} />
      </RadixHoverCard.Content>
    </RadixHoverCard.Portal>
  </RadixHoverCard.Root>
);

HoverCard.displayName = 'HoverCard';
