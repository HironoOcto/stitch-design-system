// 1. React 及其生态
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';

// 2. 内部组件（相对路径）
import { Icon } from '../Icon';

// 3. 样式（永远最后）
import styles from './image.module.less';

// matte 底色 API：语义 + 抽象分类（与同源 Card 对齐）。
export type ImageColor =
  | 'default'
  | 'accent'
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
 * 衬板相框（Ant `Image` `preview` 语义）：`src`（必填）+ `alt` + `width` / `height` +
 * `color`（matte 底，语义 + 抽象分类，与同源 Card 对齐）+ `lazy`（原生 `loading="lazy"`）+
 * `preview`（默认 true，点击开大图）+ `onLoad` / `onError`。加载淡入 + 加载失败错误占位 +
 * Portal 大图预览。
 *
 * 跨-prop 注意事项：
 * - **`extends ImgHTMLAttributes<img>`**（`Omit` 掉受控的 `src`/`alt`/`width`/`height`/
 *   `onLoad`/`onError`），`...rest` 透传到内层 `<img>`。`color` enum 与 Card 对齐
 *   （`default` | `accent` | 语义 | `cat-1…6`）；`default` 为中性白面。
 * - **预览键盘 + 焦点管理**：`preview` 开启时相框升格为原生 `<button>`（Enter/Space 开预览）；
 *   预览弹层焦点自动落关闭按钮、Tab 圈定在遮罩内、ESC 关闭、关闭后焦点归还触发元素。
 * - **图标走 `<Icon>`**：错误占位 `<Icon name="error">`、关闭按钮 `<Icon name="close">`，非裸
 *   `<svg>` / 伪元素叉号；错误占位图标装饰性 `aria-hidden`。
 * - **随 `src` 改 state 用渲染期写法**（`useState` 记 `prevSrc` 立即 bail-out），不在 effect 里
 *   `setState`，避级联渲染。
 */
export interface ImageProps extends Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  'src' | 'alt' | 'width' | 'height' | 'onLoad' | 'onError'
> {
  /** 图片地址（必填） */
  src: string;
  /** 图片替代文本（无障碍）；留空表示装饰性图片 */
  alt?: string;
  /** 图片宽度（数字按 px，字符串原样） */
  width?: number | string;
  /** 图片高度（数字按 px，字符串原样） */
  height?: number | string;
  /**
   * 相框底色（matte）：`default` 中性白面；语义态 `danger/success/warning/info`；
   * `accent` 强调面；`cat-1…6` 分类色槽（只为「互相区分」，非表状态）。
   * @default 'default'
   */
  color?: ImageColor;
  /**
   * 是否启用原生懒加载（`loading="lazy"`）
   * @default false
   */
  lazy?: boolean;
  /**
   * 点击图片弹出大图预览（Ant Image `preview` 语义）
   * @default true
   */
  preview?: boolean;
  /** 图片加载完成回调 */
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  /** 图片加载失败回调 */
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

// default = 中性，走基础类兜底面、不加 color 类（与 Card 一致，便于测试断言）。
const colorClass = (color: ImageColor): string =>
  color === 'default' ? '' : styles[`image-${color}`];

export const Image: React.FC<ImageProps> = ({
  src,
  alt = '',
  width,
  height,
  color = 'default',
  lazy = false,
  preview = true,
  className,
  style,
  onLoad,
  onError,
  ...rest
}) => {
  // failed：主图加载失败时显示错误占位
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  // 大图预览开关
  const [previewOpen, setPreviewOpen] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  // src 变化时重置加载状态：渲染期直接调整（React 官方「随 prop 变化改 state」写法，
  // 用 state 记住上一个 src、立即 bail-out 重渲染 —— 避免 setState-in-effect 的级联渲染）。
  const [prevSrc, setPrevSrc] = useState(src);
  if (src !== prevSrc) {
    setPrevSrc(src);
    setFailed(false);
    setLoaded(false);
  }

  const handleLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      setLoaded(true);
      onLoad?.(e);
    },
    [onLoad],
  );

  const handleError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      // 加载失败 → 错误占位
      setFailed(true);
      setLoaded(true);
      onError?.(e);
    },
    [onError],
  );

  // 预览打开：聚焦关闭按钮；ESC 关闭；Tab 圈定在遮罩内（遮罩里只有关闭按钮可聚焦）
  useEffect(() => {
    if (!previewOpen) return;
    closeBtnRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPreviewOpen(false);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        closeBtnRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [previewOpen]);

  // 预览关闭后把焦点还给触发元素
  useEffect(() => {
    if (!previewOpen) {
      lastFocusedRef.current?.focus();
      lastFocusedRef.current = null;
    }
  }, [previewOpen]);

  const openPreview = () => {
    lastFocusedRef.current = document.activeElement as HTMLElement | null;
    setPreviewOpen(true);
  };

  if (failed) {
    return (
      <span
        className={clsx(
          styles.image,
          colorClass(color),
          styles.error,
          className,
        )}
        style={{ width, height, ...style }}
        role="img"
        aria-label={alt || '图片加载失败'}
      >
        <Icon name="error" size={32} />
        <span>图片加载失败</span>
      </span>
    );
  }

  const frameCls = clsx(
    styles.image,
    colorClass(color),
    loaded && styles.loaded,
    preview && styles.preview,
    className,
  );
  const frameStyle: React.CSSProperties = { width, height, ...style };

  const content = (
    <img
      src={src}
      alt={alt}
      loading={lazy ? 'lazy' : undefined}
      className={styles.img}
      onLoad={handleLoad}
      onError={handleError}
      {...rest}
    />
  );

  // 点击预览：相框升格为按钮（原生支持 Enter / Space），预览弹层经 Portal 挂到 body
  if (preview) {
    return (
      <>
        <button
          type="button"
          className={frameCls}
          style={frameStyle}
          onClick={openPreview}
        >
          {content}
        </button>
        {createPortal(
          previewOpen ? (
            <div className={styles.mask} onClick={() => setPreviewOpen(false)}>
              <div
                className={styles.dialog}
                role="dialog"
                aria-modal="true"
                aria-label={alt ? `查看图片：${alt}` : '图片预览'}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  ref={closeBtnRef}
                  className={styles.closeBtn}
                  aria-label="关闭预览"
                  onClick={() => setPreviewOpen(false)}
                >
                  <Icon name="close" size={16} />
                </button>
                <img src={src} alt={alt} className={styles.previewImg} />
              </div>
            </div>
          ) : null,
          document.body,
        )}
      </>
    );
  }

  return (
    <span className={frameCls} style={frameStyle}>
      {content}
    </span>
  );
};

Image.displayName = 'Image';
