// 1. React 及其生态
import React, { useCallback, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

// 2. 内部组件（相对路径）
import { Icon } from '../Icon';
import { useOverlay } from '../_internal/useOverlay';

// 3. 样式（永远最后）
import styles from './drawer.module.less';

export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom';

export interface DrawerProps {
  /** 是否可见 */
  open: boolean;
  /** 标题 */
  title?: React.ReactNode;
  /** 弹出位置 @default 'right' */
  placement?: DrawerPlacement;
  /** 宽度（left / right 时生效） @default 378 */
  width?: number | string;
  /** 高度（top / bottom 时生效） @default 300 */
  height?: number | string;
  /**
   * 点击遮罩是否关闭
   * @default true
   */
  maskClosable?: boolean;
  /** 底部区域；不传则不渲染 */
  footer?: React.ReactNode;
  /** 关闭回调（遮罩 / Esc / 关闭按钮触发；Ant v5 Drawer 约定名 `onClose`） */
  onClose?: () => void;
  /** 抽屉内容 */
  children?: React.ReactNode;
  /** 自定义类名（挂到面板） */
  className?: string;
  /** 遮罩层自定义样式 */
  maskStyle?: React.CSSProperties;
}

const PLACEMENT_CLASS: Record<DrawerPlacement, string> = {
  left: styles.panelLeft,
  right: styles.panelRight,
  top: styles.panelTop,
  bottom: styles.panelBottom,
};

/**
 * 抽屉浮层：Portal 挂到 body，遮罩 + 贴边滑入面板。
 * 打开时把焦点送进抽屉并做 Tab 焦点陷阱，Esc / 点遮罩关闭，关闭时焦点归还触发元素（共享自 `useOverlay`）。
 * `role="dialog"` + `aria-modal` + `aria-labelledby` 关联标题。
 * 标准贴边浮层：几何随 `placement`、圆角/阴影/字体随站点。
 */
export const Drawer: React.FC<DrawerProps> = ({
  open,
  title,
  placement = 'right',
  width = 378,
  height = 300,
  maskClosable = true,
  footer,
  onClose,
  children,
  className,
  maskStyle,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useOverlay({ open, containerRef: dialogRef, onEscape: onClose });

  const handleMaskClick = useCallback(() => {
    if (maskClosable) onClose?.();
  }, [maskClosable, onClose]);

  const handleContentClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const idPrefix = `stitch-drawer-${useId().replace(/:/g, '')}`;
  const titleId = `${idPrefix}-title`;

  if (!open) return null;

  const isHorizontal = placement === 'left' || placement === 'right';
  const panelStyle: React.CSSProperties = isHorizontal ? { width } : { height };

  const drawerContent = (
    <div className={styles.mask} style={maskStyle} onClick={handleMaskClick}>
      <div
        ref={dialogRef}
        className={[styles.panel, PLACEMENT_CLASS[placement], className]
          .filter(Boolean)
          .join(' ')}
        style={panelStyle}
        onClick={handleContentClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
      >
        {title && (
          <div className={styles.header}>
            <div className={styles.title} id={titleId}>
              {title}
            </div>
            <button
              type="button"
              className={styles.close}
              onClick={onClose}
              aria-label="关闭"
            >
              <Icon name="close" size="1em" />
            </button>
          </div>
        )}
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );

  return createPortal(drawerContent, document.body);
};

Drawer.displayName = 'Drawer';
