// 1. React 及其生态
import React, { useCallback, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

// 2. 内部组件（相对路径）
import { Button } from '../Button';
import { useOverlay } from '../_internal/useOverlay';

// 3. 样式（永远最后）
import styles from './modal.module.less';

export interface ModalProps {
  /** 是否可见 */
  open: boolean;
  /** 标题 */
  title?: React.ReactNode;
  /** 宽度 @default 520 */
  width?: number | string;
  /**
   * 点击遮罩是否关闭
   * @default true
   */
  maskClosable?: boolean;
  /** 底部按钮区域；`null` 隐藏页脚，`undefined` 用默认「取消/确定」 */
  footer?: React.ReactNode | null;
  /** 确认回调（默认页脚「确定」按钮） */
  onOk?: () => void;
  /** 关闭回调（遮罩 / Esc / 默认页脚「取消」触发；Ant v5 Modal 约定名 `onCancel`） */
  onCancel?: () => void;
  /** 对话框内容 */
  children?: React.ReactNode;
  /** 自定义类名 */
  className?: string;
  /** 遮罩层自定义样式 */
  maskStyle?: React.CSSProperties;
  /**
   * 对话框语义角色：普通对话框用 `dialog`；必须做决策的确认框用 `alertdialog`
   * （由 `AlertDialog` 复用本件时传入，读屏据此提示不可忽略）
   * @default 'dialog'
   */
  role?: 'dialog' | 'alertdialog';
}

/**
 * 对话框浮层：Portal 挂到 body，遮罩 + 居中面板。
 * 打开时把焦点送进对话框并做 Tab 焦点陷阱，Esc / 点遮罩关闭，关闭时焦点归还触发元素（共享自 `useOverlay`）。
 * `role`（默认 `dialog`，确认框变体传 `alertdialog`）+ `aria-modal` + `aria-labelledby`/`aria-describedby` 关联标题与正文。
 */
export const Modal: React.FC<ModalProps> = ({
  open,
  title,
  width = 520,
  maskClosable = true,
  footer,
  onOk,
  onCancel,
  children,
  className,
  maskStyle,
  role = 'dialog',
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useOverlay({ open, containerRef: dialogRef, onEscape: onCancel });

  const handleMaskClick = useCallback(() => {
    if (maskClosable) onCancel?.();
  }, [maskClosable, onCancel]);

  const handleContentClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const idPrefix = `stitch-modal-${useId().replace(/:/g, '')}`;
  const titleId = `${idPrefix}-title`;
  const bodyId = `${idPrefix}-body`;

  if (!open) return null;

  const defaultFooter = (
    <>
      <Button type="default" onClick={onCancel}>
        取消
      </Button>
      <Button type="primary" onClick={onOk}>
        确定
      </Button>
    </>
  );

  const modalContent = (
    <div className={styles.mask} style={maskStyle} onClick={handleMaskClick}>
      <div
        ref={dialogRef}
        className={[styles.modal, className].filter(Boolean).join(' ')}
        style={{ width }}
        onClick={handleContentClick}
        role={role}
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={bodyId}
        tabIndex={-1}
      >
        {title && (
          <div className={styles.header}>
            <div className={styles.title} id={titleId}>
              {title}
            </div>
          </div>
        )}
        <div className={styles.body} id={bodyId}>
          {children}
        </div>
        {footer !== null && (
          <div className={styles.footer}>
            {footer === undefined ? defaultFooter : footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

Modal.displayName = 'Modal';
