// 1. React 及其生态
import React from 'react';
import { Avatar as RadixAvatar } from 'radix-ui';
import clsx from 'clsx';

// 3. 样式（永远最后）
import styles from './avatar.module.less';

export type AvatarSize = 'small' | 'middle' | 'large';
export type AvatarShape = 'circle' | 'square';

/**
 * 头像：展示用户 / 实体的小幅图像，图片加载失败或无 `src` 时优雅回退到兜底内容
 * （首字母 / 占位图标）。固定尺寸档（`size`）+ 圆 / 方（`shape`）+ `fallback` 兜底。
 * 组合 Radix `Avatar.Root/Image/Fallback`。
 *
 * 跨-prop 注意事项：
 * - **vs Image**：Image 是通用图片（任意尺寸 + matte 相框 + 点击预览大图）；Avatar 是
 *   头像——固定尺寸档、圆 / 方两形、缺图必有 `fallback` 兜底语义，非通用图片。
 * - **显图 / 兜底二选一由 Radix 判**：`src` 加载成功才渲 `<img>`；无 `src` 或加载失败渲
 *   `fallback`（Radix 用 `new Image()` 预载探测，非 `data-*`）。故 `fallback` 应常备
 *   （如姓名首字母），别依赖图片一定加载出来。
 * - **`size` / `shape` → class 映射**：`size` 走物理尺寸档（small 24 / middle 32 /
 *   large 40，人机工程量、非主题值）；`shape='circle'` → `border-radius:50%`、`square`
 *   → `--stitch-radius-image`（随站换肤）。
 * - **`alt` 给有意义头像补无障碍名**：`src` 成功显图时 `alt` 透到 `<img>`；纯装饰可留空。
 */
export interface AvatarProps {
  /** 头像图片地址；缺失或加载失败时回退到 `fallback` */
  src?: string;
  /** 图片替代文本（无障碍）；有意义头像应提供，纯装饰可留空 */
  alt?: string;
  /** 图缺失 / 加载失败时的兜底内容（首字母 / 占位图标等） */
  fallback?: React.ReactNode;
  /**
   * 尺寸档：small 24 / middle 32 / large 40（px）
   * @default 'middle'
   */
  size?: AvatarSize;
  /**
   * 形状：圆形或方形（方形圆角随 `--stitch-radius-image` 换肤）
   * @default 'circle'
   */
  shape?: AvatarShape;
  /** 自定义类名（挂到头像根容器） */
  className?: string;
  /** 行内样式（挂到头像根容器） */
  style?: React.CSSProperties;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  fallback,
  size = 'middle',
  shape = 'circle',
  className,
  style,
}) => (
  <RadixAvatar.Root
    className={clsx(styles.root, styles[size], styles[shape], className)}
    style={style}
  >
    {src != null && (
      <RadixAvatar.Image className={styles.image} src={src} alt={alt} />
    )}
    <RadixAvatar.Fallback className={styles.fallback}>
      {fallback}
    </RadixAvatar.Fallback>
  </RadixAvatar.Root>
);

Avatar.displayName = 'Avatar';
