// 1. React 及其生态
import React, { useCallback } from 'react';
import clsx from 'clsx';

// 2. 内部组件（相对路径）
import { Icon } from '../Icon';

// 3. 样式（永远最后）
import styles from './tag.module.less';

export type TagSize = 'small' | 'middle' | 'large';

export type TagVariant = 'solid' | 'outlined' | 'dashed' | 'soft' | 'text';

/**
 * 颜色 = 语义状态 + 抽象分类槽（非「长相制」）：
 * - 语义：`default`（中性）/ `danger` / `success` / `warning` / `info`，走状态角色变量；
 * - 分类：`cat-1…cat-6`，走契约的分类色槽 `--stitch-cat-*`，只为「互相区分」而非表状态。
 */
export type TagColor =
  | 'default'
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
 * 标签 / 徽章（Ant `Tag` 语义）：`children` 内容 + `size` + `variant` + `color` +
 * `closable`/`onClose` + `onClick`（可点击）+ `disabled`。`variant` 有
 * `solid`/`outlined`/`dashed`/`soft`/`text` 五档（`text` = 无底无框 ghost 排版标签），与
 * `color` 正交。
 *
 * 跨-prop 注意事项：
 * - **文字色与身份色分离，保证可读（关键）**：文字**绝不**直接用身份色——分类槽
 *   `--stitch-cat-*` 各主题可能填浅色，浅色当文字必失对比。故语义色文字 = 身份色混黑、分类色
 *   文字 = 身份色混 `--stitch-text-primary`（兜底墨色 + 一丝色相），任意浅色都拉到可读 ≥AA；
 *   身份色只用于描边 + soft/solid 底的淡色派生。`solid` = 「亮填充 + 深字」（非饱和填充白字），
 *   soft 比 solid 更淡，两档拉开强弱层级。
 * - **可点击**：给 `onClick` → `role="button"` + `tabIndex=0` + 键盘 Enter/Space 触发
 *   （`:focus-visible` 焦点环走 `--stitch-focus-ring`）；关闭按钮 `stopPropagation` 防冒泡到
 *   `onClick`。
 * - **关闭图标走 `<Icon name="close">`**（`size="1em"` 跟随字号），非 emoji / Unicode `×` /
 *   裸 `<svg>`；关闭按钮自带 `aria-label="close"`，内层 Icon 无 label → `aria-hidden`。
 * - **无固定高度**：`inline-flex` + 纵向 padding + `line-height:1`，高度随字号自然生成；不套
 *   `--stitch-height-*`（那是表单控件对齐用）。
 */
export interface TagProps {
  /** 标签内容 */
  children?: React.ReactNode;
  /**
   * 尺寸
   * @default 'middle'
   */
  size?: TagSize;
  /**
   * 风格变体：solid 填充、outlined 描边、dashed 虚线、soft 软底、text 无底无框（ghost 排版标签）
   * @default 'soft'
   */
  variant?: TagVariant;
  /**
   * 颜色（语义状态 + 分类槽）
   * @default 'default'
   */
  color?: TagColor;
  /**
   * 是否可关闭（渲染关闭按钮）
   * @default false
   */
  closable?: boolean;
  /** 关闭回调 */
  onClose?: (e: React.MouseEvent<HTMLElement>) => void;
  /** 点击回调，开启后标签渲染为可点击（role=button + 键盘可达） */
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  /**
   * 禁用状态
   * @default false
   */
  disabled?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

const SIZE_CLASS: Record<TagSize, string> = {
  small: styles['size-small'],
  middle: styles['size-middle'],
  large: styles['size-large'],
};

const VARIANT_CLASS: Record<TagVariant, string> = {
  solid: styles['variant-solid'],
  outlined: styles['variant-outlined'],
  dashed: styles['variant-dashed'],
  soft: styles['variant-soft'],
  text: styles['variant-text'],
};

// default = 中性，走基础类的兜底色变量、不加 color 类（与源一致，便于测试断言）。
const colorClass = (color: TagColor): string =>
  color === 'default' ? '' : styles[`color-${color}`];

export const Tag: React.FC<TagProps> = ({
  children,
  size = 'middle',
  variant = 'soft',
  color = 'default',
  closable = false,
  onClose,
  onClick,
  disabled = false,
  className,
  style,
}) => {
  const handleClose = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      if (disabled) return;
      onClose?.(e);
    },
    [disabled, onClose],
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (disabled) return;
      onClick?.(e);
    },
    [disabled, onClick],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      if (disabled) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick?.(e as unknown as React.MouseEvent<HTMLElement>);
      }
    },
    [disabled, onClick],
  );

  const isInteractive = !!onClick && !disabled;

  const cls = clsx(
    styles.tag,
    SIZE_CLASS[size],
    VARIANT_CLASS[variant],
    colorClass(color),
    disabled && styles['is-disabled'],
    isInteractive && styles['is-clickable'],
    className,
  );

  const body = (
    <>
      <span className={styles.text}>{children}</span>
      {closable && (
        <button
          type="button"
          className={styles.close}
          aria-label="close"
          onClick={handleClose}
          disabled={disabled}
        >
          <Icon name="close" size="1em" />
        </button>
      )}
    </>
  );

  if (isInteractive) {
    return (
      <span
        className={cls}
        style={style}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {body}
      </span>
    );
  }

  return (
    <span className={cls} style={style}>
      {body}
    </span>
  );
};

Tag.displayName = 'Tag';
