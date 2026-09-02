// 1. React 及其生态
import React, { useCallback, useId, useState } from 'react';
import clsx from 'clsx';

// 2. 内部组件（相对路径）
import { Icon } from '../Icon';

// 3. 样式（永远最后）
import styles from './collapse.module.less';

/**
 * 单项披露件（Ant v5 `Collapse.Panel` 语义，非多面板 accordion）：`header`（触发标题）+
 * `children`（面板内容）+ 受控/非受控 `open` / `defaultOpen` / `onOpenChange` + `disabled`。
 *
 * 跨-prop 注意事项：
 * - **受控/非受控双模式**：给 `open` 由父管（配 `onOpenChange`），只给 `defaultOpen` 组件自管
 *   （非靠 remount 换 `defaultOpen` 的伪受控）。`extends HTMLAttributes<HTMLDivElement>`、
 *   `...rest` 透传（`className` / `style` / `data-*` / `aria-*`）。
 * - **展开指示走 `<Icon name="chevron-down">`**（跟随 `currentColor`、展开旋转 180°），非
 *   Unicode `+`/`−` 字符、非裸 `<svg>`；用中立 chevron 而非填充强调圆，避免与「一屏最多一个填充
 *   强调」的克制冲突。头部/内容经 `aria-controls` / `aria-labelledby` 关联，`disabled` 时不可展开。
 * - **容器表面**：`--stitch-bg-elevated` + `--stitch-border`（发丝）+ `--stitch-radius-card`，
 *   无阴影（边框即结构）；圆角随主题变。
 */
export interface CollapseProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onChange'
> {
  /** 触发区标题（可点击的问句 / 标签） */
  header: React.ReactNode;
  /** 展开后显示的面板内容 */
  children?: React.ReactNode;
  /**
   * 受控展开状态（给了即受控；配 `onOpenChange` 用）
   */
  open?: boolean;
  /**
   * 非受控初始展开状态
   * @default false
   */
  defaultOpen?: boolean;
  /** 展开状态变化回调（受控/非受控都会触发） */
  onOpenChange?: (open: boolean) => void;
  /**
   * 是否禁用（禁用后不可切换、按钮 disabled）
   * @default false
   */
  disabled?: boolean;
}

export const Collapse: React.FC<CollapseProps> = ({
  header,
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  className,
  ...rest
}) => {
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const expanded = isControlled ? open : innerOpen;

  const idPrefix = `stitch-collapse-${useId().replace(/:/g, '')}`;
  const headerId = `${idPrefix}-header`;
  const panelId = `${idPrefix}-panel`;

  const handleToggle = useCallback(() => {
    if (disabled) return;
    const next = !expanded;
    if (!isControlled) setInnerOpen(next);
    onOpenChange?.(next);
  }, [disabled, expanded, isControlled, onOpenChange]);

  const cls = clsx(
    styles.collapse,
    expanded && styles.expanded,
    disabled && styles.disabled,
    className,
  );

  return (
    <div className={cls} {...rest}>
      <button
        type="button"
        id={headerId}
        className={styles.header}
        onClick={handleToggle}
        disabled={disabled}
        aria-expanded={expanded}
        aria-controls={panelId}
      >
        <span className={styles.indicator}>
          <Icon name="chevron-down" />
        </span>
        <span className={styles.text}>{header}</span>
      </button>
      <div
        className={styles.panel}
        id={panelId}
        role="region"
        aria-labelledby={headerId}
      >
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
};

Collapse.displayName = 'Collapse';
