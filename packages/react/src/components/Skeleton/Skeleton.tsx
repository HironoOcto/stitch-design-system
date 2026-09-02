// 1. React 及其生态
import React from 'react';
import clsx from 'clsx';

// 3. 样式（永远最后）
import styles from './skeleton.module.less';

export type SkeletonVariant = 'text' | 'circle' | 'rect' | 'paragraph';

export interface SkeletonProps {
  /**
   * 是否显示骨架占位：`true` 渲染骨架，`false` 直接渲染 `children`
   * @default true
   */
  loading?: boolean;
  /**
   * 骨架变体
   * @default 'text'
   */
  variant?: SkeletonVariant;
  /**
   * 是否启用扫光动画（对齐 Ant v5 `Skeleton.active`）
   * @default true
   */
  active?: boolean;
  /** 行数（`paragraph` 变体有效） */
  rows?: number;
  /** 每行宽度（`paragraph` 变体有效，可传数组对不同行指定不同宽度） */
  rowWidths?: (number | string)[];
  /** 宽度（text/circle/rect 变体有效） */
  width?: number | string;
  /** 高度（circle/rect 变体有效） */
  height?: number | string;
  /** 透传到根元素 */
  className?: string;
  /** 透传到根元素 */
  style?: React.CSSProperties;
  /** 无障碍名（默认「加载中」） */
  'aria-label'?: string;
  /** 子元素（`loading=false` 时渲染） */
  children?: React.ReactNode;
}

const VT_CLASS: Record<SkeletonVariant, string> = {
  text: styles['vt-text']!,
  circle: styles['vt-circle']!,
  rect: styles['vt-rect']!,
  paragraph: styles['vt-paragraph']!,
};

const DEFAULT_PARAGRAPH_WIDTHS = ['100%', '92%', '84%', '76%', '60%'];

interface SkeletonComponent extends React.FC<SkeletonProps> {
  Button: React.FC<SkeletonButtonProps>;
  Input: React.FC<SkeletonInputProps>;
  Avatar: React.FC<SkeletonAvatarProps>;
}

const SkeletonBase: React.FC<SkeletonProps> = ({
  loading = true,
  variant = 'text',
  active = true,
  rows = 3,
  rowWidths,
  width,
  height,
  className,
  style,
  'aria-label': ariaLabel = '加载中',
  children,
}) => {
  if (!loading && children) {
    return <>{children}</>;
  }

  const baseCls = clsx(
    styles.skeleton,
    active && styles.active,
    VT_CLASS[variant],
    className,
  );

  // 无障碍：整个骨架 = 一个忙碌状态区（可及名默认「加载中」），内部占位块 aria-hidden
  const statusProps = {
    role: 'status' as const,
    'aria-busy': true,
    'aria-label': ariaLabel,
  };

  if (variant === 'paragraph') {
    const widths = Array.isArray(rowWidths)
      ? rowWidths
      : DEFAULT_PARAGRAPH_WIDTHS;
    const rowCount = Math.max(1, rows);
    return (
      <div className={baseCls} style={style} {...statusProps}>
        {Array.from({ length: rowCount }, (_, i) => {
          const w = widths[i] ?? widths[widths.length - 1] ?? '100%';
          return (
            <div
              key={i}
              className={clsx(styles.line, active && styles.active)}
              style={{ width: w }}
              aria-hidden
            />
          );
        })}
      </div>
    );
  }

  if (variant === 'circle') {
    const size = width ?? height ?? 44;
    return (
      <div
        className={baseCls}
        style={{ width: size, height: size, ...style }}
        {...statusProps}
      />
    );
  }

  if (variant === 'rect') {
    return (
      <div
        className={baseCls}
        style={{ width: width ?? '100%', height: height ?? 120, ...style }}
        {...statusProps}
      />
    );
  }

  // text（默认）
  return (
    <div
      className={baseCls}
      style={{ width: width ?? '100%', height: height ?? 16, ...style }}
      {...statusProps}
    />
  );
};

// ============================================
// Skeleton.Button —— 按钮占位
// ============================================
export interface SkeletonButtonProps {
  /** @default 'middle' */
  size?: 'small' | 'middle' | 'large';
  /** @default true */
  active?: boolean;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
}

const BTN_SIZE: Record<string, { width: number; height: number }> = {
  small: { width: 80, height: 32 },
  middle: { width: 100, height: 40 },
  large: { width: 130, height: 48 },
};

const SkeletonButton: React.FC<SkeletonButtonProps> = ({
  size = 'middle',
  active = true,
  className,
  style,
  'aria-label': ariaLabel = '加载中',
}) => {
  const dim = BTN_SIZE[size]!;
  return (
    <div
      className={clsx(
        styles.skeleton,
        styles['skeleton-btn'],
        active && styles.active,
        className,
      )}
      style={{ width: dim.width, height: dim.height, ...style }}
      role="status"
      aria-busy
      aria-label={ariaLabel}
    />
  );
};
SkeletonButton.displayName = 'Skeleton.Button';

// ============================================
// Skeleton.Input —— 输入框占位
// ============================================
export interface SkeletonInputProps {
  /** @default 'middle' */
  size?: 'small' | 'middle' | 'large';
  /** @default true */
  active?: boolean;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
}

const INPUT_SIZE: Record<string, { width: number; height: number }> = {
  small: { width: 160, height: 32 },
  middle: { width: 200, height: 40 },
  large: { width: 240, height: 48 },
};

const SkeletonInput: React.FC<SkeletonInputProps> = ({
  size = 'middle',
  active = true,
  className,
  style,
  'aria-label': ariaLabel = '加载中',
}) => {
  const dim = INPUT_SIZE[size]!;
  return (
    <div
      className={clsx(
        styles.skeleton,
        styles['skeleton-input'],
        active && styles.active,
        className,
      )}
      style={{ width: dim.width, height: dim.height, ...style }}
      role="status"
      aria-busy
      aria-label={ariaLabel}
    />
  );
};
SkeletonInput.displayName = 'Skeleton.Input';

// ============================================
// Skeleton.Avatar —— 头像占位
// ============================================
export interface SkeletonAvatarProps {
  /** @default 'middle' */
  size?: 'small' | 'middle' | 'large';
  /** @default 'circle' */
  shape?: 'circle' | 'square';
  /** @default true */
  active?: boolean;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
}

const AVATAR_SIZE: Record<string, number> = {
  small: 32,
  middle: 44,
  large: 56,
};

const SkeletonAvatar: React.FC<SkeletonAvatarProps> = ({
  size = 'middle',
  shape = 'circle',
  active = true,
  className,
  style,
  'aria-label': ariaLabel = '加载中',
}) => {
  const px = AVATAR_SIZE[size]!;
  return (
    <div
      className={clsx(
        styles.skeleton,
        shape === 'circle'
          ? styles['vt-circle']
          : styles['skeleton-avatar-square'],
        active && styles.active,
        className,
      )}
      style={{ width: px, height: px, ...style }}
      role="status"
      aria-busy
      aria-label={ariaLabel}
    />
  );
};
SkeletonAvatar.displayName = 'Skeleton.Avatar';

export const Skeleton = SkeletonBase as SkeletonComponent;
Skeleton.Button = SkeletonButton;
Skeleton.Input = SkeletonInput;
Skeleton.Avatar = SkeletonAvatar;
Skeleton.displayName = 'Skeleton';
