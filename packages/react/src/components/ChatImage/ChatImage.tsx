// 1. React 及其生态
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';

// 2. 内部组件（相对路径）
import { Image } from '../Image';
import { Icon } from '../Icon';

// 3. 样式（永远最后）
import styles from './chat-image.module.less';

/**
 * 图片消息（气泡内缩略图 + 大图查看器）：气泡里显缩略图（复用通用 `<Image>`、`preview` 关闭），
 * 点击开大图——**大图仍复用通用 `<Image>`（它自带的相框即「框」）**，本组件只做一层遮罩 + 把下载 /
 * 关闭工具键**叠在这个框上**。作为 `<ChatMessage>` 的 `content` 塞入（sent / received 两侧皆可）。
 * `src` / `alt` / `width` / `height` 照搬 antd `Image`；`width` 即缩略图宽。
 *
 * 跨-prop 注意事项：
 * - **缩略图与大图都复用 `<Image preview={false}>`**（不手写裸 `<img>`、不重造 Image 的相框 / 圆角 /
 *   加载淡入 / 错误占位）；本组件只加聊天专属的遮罩 + 框上工具键（下载 / 关闭），`<Image>` 一行未改。
 * - **块级排布**：根为块级元素，故 `<ChatMessage>` 的时间 / 回执落在缩略图**下方**（同文件卡）。
 * - **大图查看器 a11y**：Portal 遮罩 + `role="dialog"`；打开焦点落关闭键、Tab 在下载 / 关闭间循环、
 *   ESC 关闭、关闭后焦点归还缩略图。下载走原生 `<a download href={src}>`（存下当前图，不解码不发
 *   请求），工具键图标走 `<Icon>`，均带可访问名。
 * - `width` 控缩略图尺寸；点击后大图按视口放大（原始尺寸）。
 */
export interface ChatImageProps {
  /** 图片地址（必填，照搬 antd Image） */
  src: string;
  /** 图片替代文本（无障碍）；留空表示装饰性图片 */
  alt?: string;
  /** 缩略图宽度（数字按 px，字符串原样） */
  width?: number | string;
  /** 缩略图高度（数字按 px，字符串原样） */
  height?: number | string;
  /** 自定义类名（挂到根） */
  className?: string;
  /** 行内样式（挂到根） */
  style?: React.CSSProperties;
}

export const ChatImage: React.FC<ChatImageProps> = ({
  src,
  alt = '',
  width,
  height,
  className,
  style,
}) => {
  const [open, setOpen] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const downloadBtnRef = useRef<HTMLAnchorElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  // 打开：焦点落关闭键；ESC 关闭；Tab 在两个工具键（下载 / 关闭）之间循环。
  useEffect(() => {
    if (!open) return;
    closeBtnRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        const els = (
          [
            downloadBtnRef.current,
            closeBtnRef.current,
          ] as (HTMLElement | null)[]
        ).filter((el): el is HTMLElement => el != null);
        if (els.length === 0) return;
        const idx = els.indexOf(document.activeElement as HTMLElement);
        const next = e.shiftKey
          ? idx <= 0
            ? els.length - 1
            : idx - 1
          : idx >= els.length - 1
            ? 0
            : idx + 1;
        els[next]?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // 关闭后把焦点还给缩略图触发元素。
  useEffect(() => {
    if (!open) {
      lastFocusedRef.current?.focus();
      lastFocusedRef.current = null;
    }
  }, [open]);

  const openViewer = () => {
    lastFocusedRef.current = document.activeElement as HTMLElement | null;
    setOpen(true);
  };

  return (
    <span className={clsx(styles.frame, className)} style={style}>
      <button
        type="button"
        className={styles.thumb}
        onClick={openViewer}
        aria-label={alt ? `查看大图 ${alt}` : '查看大图'}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          preview={false}
        />
      </button>
      {createPortal(
        open ? (
          <div className={styles.mask} onClick={() => setOpen(false)}>
            <div
              className={styles.dialog}
              role="dialog"
              aria-modal="true"
              aria-label={alt ? `查看图片：${alt}` : '图片预览'}
              onClick={(e) => e.stopPropagation()}
            >
              {/* 大图复用通用 <Image>（它自带的相框即「框」）；下载 / 关闭键叠在框上。 */}
              <Image
                src={src}
                alt={alt}
                preview={false}
                className={styles.full}
              />
              <div className={styles.tools}>
                <a
                  ref={downloadBtnRef}
                  className={styles.toolBtn}
                  href={src}
                  download
                  aria-label={alt ? `下载图片 ${alt}` : '下载图片'}
                >
                  <Icon name="download" size={14} />
                </a>
                <button
                  type="button"
                  ref={closeBtnRef}
                  className={styles.toolBtn}
                  aria-label="关闭大图"
                  onClick={() => setOpen(false)}
                >
                  <Icon name="close" size={14} />
                </button>
              </div>
            </div>
          </div>
        ) : null,
        document.body,
      )}
    </span>
  );
};

ChatImage.displayName = 'ChatImage';
