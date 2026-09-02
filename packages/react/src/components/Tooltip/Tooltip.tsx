// 1. React 及其生态
import React, { useState, useRef, useCallback, useEffect, useId } from 'react';
import clsx from 'clsx';

// 3. 样式（永远最后）
import styles from './tooltip.module.less';

export type TooltipPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';

export type TooltipTrigger = 'hover' | 'focus' | 'click';

/**
 * 文字提示浮层（Ant `Tooltip` 语义）：`title` 内容 + `placement`（12 向）+ `trigger`
 * （`hover` / `focus` / `click`）+ 受控 `open` / `defaultOpen` / `onOpenChange`。标准矩形浮层，
 * 圆角 / 边框 / 阴影由主题决定。
 *
 * 跨-prop 注意事项：
 * - **受控/非受控双模式**：给 `open` 由父管（配 `onOpenChange`），只给 `defaultOpen` 组件自管。
 * - **a11y 描述关联**：显示时把 tooltip 的 id 拼进触发器的 `aria-describedby`（保留子元素原有值），
 *   隐藏时撤回；浮层 `role="tooltip"` + `aria-hidden` 随显隐切换。
 * - **面 = 浅底浮起层**：气泡走 `--stitch-bg-elevated`（浮起面）+ 深字 `--stitch-text-primary`；
 *   边框 / 箭头走 `--stitch-text-disabled`。箭头几何（菱形边长、位置微调、gap）为浮层结构量、
 *   非主题值。
 */
export interface TooltipProps {
  /** 提示内容，支持多行（可用 \n 或 <br/> 换行） */
  title: React.ReactNode;
  /** 弹出位置 @default 'top' */
  placement?: TooltipPlacement;
  /** 触发方式 @default 'hover' */
  trigger?: TooltipTrigger;
  /** 受控显隐（气泡浮层约定：Ant v5 `open`） */
  open?: boolean;
  /** 非受控初始显隐 @default false */
  defaultOpen?: boolean;
  /** 显隐变化回调（气泡浮层约定：Ant v5 `onOpenChange`） */
  onOpenChange?: (open: boolean) => void;
  /** 子元素（触发器） */
  children: React.ReactElement;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

/**
 * 文字提示浮层：hover / focus / click 触发，12 向定位。
 * 显示时通过 `aria-describedby` 把内容关联到触发器，屏幕阅读器可读；受控（`open`/`onOpenChange`）与非受控双模式。
 */
export const Tooltip: React.FC<TooltipProps> = ({
  title,
  placement = 'top',
  trigger = 'hover',
  open,
  defaultOpen = false,
  onOpenChange,
  children,
  className,
  style,
}) => {
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const visible = isControlled ? open : innerOpen;

  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const rawId = useId().replace(/:/g, '');
  const tooltipId = `stitch-tooltip-${rawId}`;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setInnerOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const show = useCallback(() => {
    clearTimeout(timerRef.current);
    setOpen(true);
  }, [setOpen]);

  const hide = useCallback(() => {
    // 100ms 防抖：允许指针从触发器移入浮层而不闪隐
    timerRef.current = setTimeout(() => setOpen(false), 100);
  }, [setOpen]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const child = React.Children.only(children);
  const childDescribedBy = (child.props as { 'aria-describedby'?: string })[
    'aria-describedby'
  ];

  // 仅在显示时把 tooltip id 关联到触发器；隐藏时保留子元素原有 aria-describedby。
  // 只往子元素注入 aria（不注入事件）——事件挂在 wrapper 上，靠冒泡/区域捕获触发。
  const ariaProps: Record<string, unknown> = {
    'aria-describedby': visible
      ? [childDescribedBy, tooltipId].filter(Boolean).join(' ')
      : childDescribedBy,
  };

  // 触发事件挂 wrapper：focus/click 从子元素冒泡上来，hover 覆盖 wrapper 区域，
  // 子元素自身的处理器原生保留，无需手动透传。
  const wrapperHandlers: React.HTMLAttributes<HTMLDivElement> = {};
  if (trigger === 'hover') {
    wrapperHandlers.onMouseEnter = show;
    wrapperHandlers.onMouseLeave = hide;
  } else if (trigger === 'focus') {
    wrapperHandlers.onFocus = show;
    wrapperHandlers.onBlur = hide;
  } else if (trigger === 'click') {
    wrapperHandlers.onClick = () => setOpen(!visible);
  }

  const placementClass = styles[placement.replace(/-/g, '_')];

  return (
    <div
      className={clsx(styles.tooltipWrapper, className)}
      style={style}
      {...wrapperHandlers}
    >
      {React.cloneElement(child, ariaProps)}
      <div
        className={clsx(
          styles.tooltip,
          placementClass,
          visible && styles.visible,
        )}
        role="tooltip"
        id={tooltipId}
        aria-hidden={!visible}
        onMouseEnter={trigger === 'hover' ? show : undefined}
        onMouseLeave={trigger === 'hover' ? hide : undefined}
      >
        <div className={styles.content}>{title}</div>
      </div>
    </div>
  );
};

Tooltip.displayName = 'Tooltip';
