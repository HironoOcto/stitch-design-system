// 1. React 及其生态
import React from 'react';
import { Popover as RadixPopover } from 'radix-ui';
import clsx from 'clsx';

// 3. 样式（永远最后）
import styles from './popover.module.less';

/**
 * 可交互浮层（Ant `Popover` 语义）：`trigger` 触发器 + `children` 浮层内容（可放按钮 / 表单 /
 * 链接）+ 受控 `open` / 非受控 `defaultOpen` / `onOpenChange`。click 触发，点外部或 Esc 关闭。
 *
 * 跨-prop 注意事项：
 * - **vs Tooltip**：Tooltip 是短文字提示、hover 触发、`role="tooltip"`、不含交互；Popover 是
 *   **click 触发的可交互浮层**，内容可获得焦点、可交互，别混用。
 * - **受控/非受控双模式**：给 `open` 由父管（配 `onOpenChange`），只给 `defaultOpen` 组件自管；
 *   两者与底层同名，直接透传。
 * - **面 = 浮起层**：浮层走 `--stitch-bg-elevated`（浮起面）+ `--stitch-text-primary`，
 *   边框 `--stitch-border`、圆角 `--stitch-radius-card`、阴影 `--stitch-shadow-base`；开合态由
 *   底层挂的 `data-state` 描（`open` 时淡入），组件不自持显隐 state。
 * - **键盘 / 焦点 / ARIA**（Esc 关、焦点陷阱与归还、`aria-expanded`）由底层保证，组件不重复实现；
 *   但浮层是 `role="dialog"`，**须有可及名**——用 `aria-label` 或 `aria-labelledby` 指定（内容相关，
 *   由使用者给）。
 */
export interface PopoverProps {
  /** 触发器：任意可承载 click 与焦点的元素（如 `<button>`），浮层锚定其上 */
  trigger: React.ReactNode;
  /** 浮层内容，可含按钮 / 表单 / 链接等可交互元素 */
  children?: React.ReactNode;
  /** 浮层（`role="dialog"`）的可及名——无可见标题时用它 */
  'aria-label'?: string;
  /** 浮层的可及名来源：指向浮层内标题元素的 id */
  'aria-labelledby'?: string;
  /** 受控显隐（气泡浮层约定：Ant v5 `open`） */
  open?: boolean;
  /** 非受控初始显隐 @default false */
  defaultOpen?: boolean;
  /** 显隐变化回调（气泡浮层约定：Ant v5 `onOpenChange`） */
  onOpenChange?: (open: boolean) => void;
  /** 触发器与浮层的间距（px） @default 8 */
  sideOffset?: number;
  /** 自定义类名（挂到浮层面上） */
  className?: string;
}

/**
 * 可交互浮层：click 触发，点外部 / Esc 关闭，焦点管理与 ARIA 由底层保证；
 * 受控（`open`/`onOpenChange`）与非受控双模式。
 */
export const Popover: React.FC<PopoverProps> = ({
  trigger,
  children,
  open,
  defaultOpen,
  onOpenChange,
  sideOffset = 8,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}) => (
  // open/defaultOpen/onOpenChange 与底层同名，直接透传
  <RadixPopover.Root
    open={open}
    defaultOpen={defaultOpen}
    onOpenChange={onOpenChange}
  >
    <RadixPopover.Trigger asChild>{trigger}</RadixPopover.Trigger>
    <RadixPopover.Portal>
      <RadixPopover.Content
        className={clsx(styles.content, className)}
        sideOffset={sideOffset}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
      >
        {children}
        <RadixPopover.Arrow className={styles.arrow} />
      </RadixPopover.Content>
    </RadixPopover.Portal>
  </RadixPopover.Root>
);

Popover.displayName = 'Popover';
