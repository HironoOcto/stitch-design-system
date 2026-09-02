// ============================================
// Notification 单条视图
// 4 种 type 走同一组类名，靠 .type-* 区分背景软底 + 边框 + 图标底色
// 进场 / 退场动画由 placement (top/bottom) 决定方向
// 退场流程: leaving 状态 -> 250ms 动画结束 -> 通知父级从 store 移除
// ============================================

import React, { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

// 2. 内部组件（相对路径）
import { Icon, type IconName } from '../Icon';

// 3. 样式（永远最后）
import styles from './notification.module.less';
import type { NotificationItem, NotificationType } from './types';

const ENTER_MS = 250;
const LEAVE_MS = 250;

/**
 * 内部单条通知视图，非公开命令式面。使用方走 `Notification.*` 静态方法而不直接渲染它，
 * 故 `@internal` 标注、不进 skill 参考。
 * @internal
 */
export interface NotificationViewProps {
  item: NotificationItem;
  onRemove: (key: string) => void;
}

// 4 类型默认图标走内置具名 <Icon>（品牌中立、随 currentColor 换肤）。
// 默认图标走 Icon 组件（图标基元约定），不内联 SVG。
const DEFAULT_ICON_NAME: Record<NotificationType, IconName> = {
  success: 'success',
  info: 'info',
  warning: 'warning',
  error: 'error',
};

export const NotificationView: React.FC<NotificationViewProps> = ({
  item,
  onRemove,
}) => {
  const [leaving, setLeaving] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const removeTimerRef = useRef<number | null>(null);

  const triggerClose = React.useCallback(() => {
    if (leaving) return;
    setLeaving(true);
  }, [leaving]);

  // 倒计时结束 -> 进入退场态
  useEffect(() => {
    if (!item.duration || item.duration <= 0) return;
    closeTimerRef.current = window.setTimeout(() => {
      triggerClose();
    }, item.duration * 1000);
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
  }, [item.duration, triggerClose]);

  // 退场动画结束后从 store 移除 + 触发 onClose
  useEffect(() => {
    if (!leaving) return;
    removeTimerRef.current = window.setTimeout(() => {
      onRemove(item.key);
      item.onClose?.();
    }, LEAVE_MS);
    return () => {
      if (removeTimerRef.current !== null) {
        window.clearTimeout(removeTimerRef.current);
        removeTimerRef.current = null;
      }
    };
    // 故意不依赖 item: leave 定时器只需在 leaving/key/onClose 变化时重置，避免父级任意更新都重启动画
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaving, item.key, item.onClose, onRemove]);

  const handleCloseClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    triggerClose();
  };

  const handleClick = () => {
    if (item.onClick) item.onClick();
  };

  const cls = clsx(
    styles.notification,
    styles[`type-${item.type}`],
    styles[`placement-${item.placement}`],
    leaving && styles.leaving,
    !!item.onClick && styles.clickable,
    item.className,
  );

  // chip 是实心状态色，故默认图标显式取「暗面上的文字」白字（Icon 自带 .icon{color:text-secondary}
  // 会盖过父级 .iconWrap 的 color，须走 Icon 文档的 style 覆盖路径，否则白字失效、深字在饱和底上近隐形）。
  const iconNode = item.icon ?? (
    <Icon
      name={DEFAULT_ICON_NAME[item.type]}
      size="1em"
      style={{ color: 'var(--stitch-text-on-dark)' }}
    />
  );

  return (
    <div
      className={cls}
      style={item.style}
      onClick={handleClick}
      role={item.onClick ? 'button' : undefined}
      tabIndex={item.onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (item.onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          item.onClick();
        }
      }}
      data-notification-key={item.key}
    >
      <div className={styles.iconWrap} aria-hidden>
        {iconNode}
      </div>
      <div className={styles.body}>
        <div className={styles.title}>{item.message}</div>
        {item.description !== undefined && item.description !== null && (
          <div className={styles.description}>{item.description}</div>
        )}
      </div>
      {item.btn && <div className={styles.btnSlot}>{item.btn}</div>}
      <button
        type="button"
        className={styles.close}
        aria-label="关闭"
        onClick={handleCloseClick}
      >
        {item.closeIcon ?? <Icon name="close" size="1em" />}
      </button>
    </div>
  );
};

export const NOTIFICATION_ENTER_MS = ENTER_MS;
export const NOTIFICATION_LEAVE_MS = LEAVE_MS;
