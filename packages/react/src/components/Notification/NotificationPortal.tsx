// ============================================
// Notification 命令式 API + 内部 store + 容器
// 用法: Notification.success({ message: '...', description: '...' })
// 内部维护一个全局 items 数组，首次调用时挂一个 React 根到 body，
// 通过 useSyncExternalStore 让 React 组件订阅到 store 变化。
// 拆分原因：同时包含 JSX(容器渲染)与 TS(命令式 API)，统一为 .tsx。
// ============================================

import React, { useCallback, useSyncExternalStore } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import clsx from 'clsx';

import { NotificationView } from './Notification';
import type {
  NotificationConfig,
  NotificationItem,
  NotificationPosition,
  NotificationType,
} from './types';
import styles from './notification.module.less';

const DEFAULT_DURATION = 4.5;

const POSITION_PLACEMENT: Record<NotificationPosition, 'top' | 'bottom'> = {
  top: 'top',
  topLeft: 'top',
  topRight: 'top',
  bottom: 'bottom',
  bottomLeft: 'bottom',
  bottomRight: 'bottom',
};

const POSITION_GROUPS: NotificationPosition[] = [
  'top',
  'topLeft',
  'topRight',
  'bottom',
  'bottomLeft',
  'bottomRight',
];

// ---- Module-level store ----
let storeItems: NotificationItem[] = [];
let counter = 0;
const listeners = new Set<() => void>();
let container: HTMLDivElement | null = null;
let root: Root | null = null;

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = (): NotificationItem[] => storeItems;
const getServerSnapshot = (): NotificationItem[] => [];

const mount = (): void => {
  if (root || typeof document === 'undefined') return;
  const el = document.createElement('div');
  el.setAttribute('data-stitch-notification-root', '');
  el.className = styles.notificationRoot;
  document.body.appendChild(el);
  container = el;
  root = createRoot(container);
  root.render(<Bridge />);
};

const ensureMounted = (): void => {
  // 同步触发 mount；createRoot + render 是幂等且内部异步调度，
  // 即使在事件回调最外层同步调用也不会有副作用泄漏。
  if (root || typeof document === 'undefined') return;
  mount();
};

const Bridge: React.FC = () => {
  const list = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return <NotificationContainer items={list} />;
};

const NotificationContainer: React.FC<{ items: NotificationItem[] }> = ({
  items: list,
}) => {
  const handleRemove = useCallback((key: string) => {
    const next = storeItems.filter((it) => it.key !== key);
    if (next.length === storeItems.length) return;
    storeItems = next;
    listeners.forEach((l) => l());
  }, []);

  return (
    <>
      {POSITION_GROUPS.map((position) => {
        const groupItems = list.filter((it) => it.position === position);
        if (groupItems.length === 0) return null;
        return (
          <div
            key={position}
            className={clsx(styles[`position-${position}`])}
            data-position={position}
            // 通知堆 = 有名的 live region：既满足 landmark（axe region 规则），
            // 又让动态插入的通知被屏幕阅读器朗读（polite，仅播报新增项）。
            role="region"
            aria-label={`通知（${position}）`}
            aria-live="polite"
            aria-relevant="additions"
          >
            {groupItems.map((it) => (
              <NotificationView
                key={it.key}
                item={it}
                onRemove={handleRemove}
              />
            ))}
          </div>
        );
      })}
    </>
  );
};

// ---- Public API ----
const buildItem = (
  config: NotificationConfig | string,
  type: NotificationType,
): NotificationItem => {
  const normalized: NotificationConfig =
    typeof config === 'string' ? { message: config } : { ...config };
  const position: NotificationPosition = normalized.position ?? 'top';
  counter += 1;
  return {
    ...normalized,
    type,
    key: normalized.key ?? `stitch-notification-${Date.now()}-${counter}`,
    position,
    placement: POSITION_PLACEMENT[position],
    duration: normalized.duration ?? DEFAULT_DURATION,
    createdAt: Date.now(),
  };
};

const open = (
  config: NotificationConfig | string,
  type: NotificationType = 'info',
): void => {
  if (typeof document === 'undefined') return;
  const item = buildItem(config, type);

  // 显式 key 时，先尝试更新现有通知（react: 若 key 已存在则替换，否则追加）
  if (item.key) {
    const idx = storeItems.findIndex((it) => it.key === item.key);
    if (idx !== -1) {
      const next = storeItems.slice();
      next[idx] = item;
      storeItems = next;
      listeners.forEach((l) => l());
      return;
    }
  }

  storeItems = [...storeItems, item];
  listeners.forEach((l) => l());
  ensureMounted();
};

const destroy = (key?: string): void => {
  let removed: NotificationItem[] = [];
  if (key) {
    removed = storeItems.filter((it) => it.key === key);
    const next = storeItems.filter((it) => it.key !== key);
    if (next.length === storeItems.length) return;
    storeItems = next;
  } else if (storeItems.length === 0) {
    return;
  } else {
    removed = storeItems.slice();
    storeItems = [];
  }
  listeners.forEach((l) => l());
  // 关闭契约对齐「用户点 × / duration 到期」：无论哪种路径，onClose 都该同步触发。
  // 调用方常在 onClose 里设置 dismissed / abort 等闭包标志位（见 upload 进度场景），
  // 如果 destroy 路径不走 onClose，这些标志位就收不到信号，后续同 key open 仍会「复活」。
  // 顺序：先通知 listeners(让 React unmount)再触发 onClose，与 setLeaving → 250ms → onRemove+onClose 一致。
  removed.forEach((it) => it.onClose?.());
};

/**
 * **命令式 API，不是 JSX 组件** —— 导出的 `Notification` 是一组 antd 风格静态方法；
 * 你调用它们弹通知，而不是渲染 `<Notification />`。调用本身不返回节点、不挂载到你的树里
 * （首次调用会自挂一个 Portal 到 `document.body`，每个 position 栈是 `aria-live="polite"`
 * 区域，新通知会被读屏播报）。`NotificationViewProps` 是内部单条视图、非公开面。
 *
 * - `Notification.success(config | string)` / `.info` / `.warning` / `.error`
 * - `Notification.open(config | string)` —— 等价 `.info`
 * - `Notification.destroy()` 关闭全部；`Notification.destroy(key)` 关闭指定 key
 * - `config` 可传字符串（仅 `message`）或完整 `NotificationConfig` 对象
 * - 默认位置 `top`（顶部居中）；默认 `duration: 4.5` 秒，传 `0` 不自动关闭
 * - 显式指定 `key` 后再次 `open` 同 key 会更新现有通知而不是新增一条
 * - 4 类型默认图标与关闭图标都走内置具名 `<Icon>`（品牌中立、随 currentColor 换肤，无 emoji / 裸 SVG / Unicode 符号）
 */
export interface NotificationStatic {
  (config: NotificationConfig | string): void;
  open: (config: NotificationConfig | string) => void;
  success: (config: NotificationConfig | string) => void;
  info: (config: NotificationConfig | string) => void;
  warning: (config: NotificationConfig | string) => void;
  error: (config: NotificationConfig | string) => void;
  destroy: (key?: string) => void;
}

// 用 notificationApi 避免与浏览器全局 Notification 构造器同名冲突
const notificationApi = ((config: NotificationConfig | string) =>
  open(config, 'info')) as NotificationStatic;
notificationApi.open = (config) => open(config, 'info');
notificationApi.success = (config) => open(config, 'success');
notificationApi.info = (config) => open(config, 'info');
notificationApi.warning = (config) => open(config, 'warning');
notificationApi.error = (config) => open(config, 'error');
notificationApi.destroy = destroy;

export const Notification = notificationApi;
// 内部命令式 API 工具函数必须与组件同文件以便共享模块级 store，fast refresh 不适用
// eslint-disable-next-line react-refresh/only-export-components
export { open as notificationOpen, destroy as notificationDestroy };
export const NOTIFICATION_DEFAULT_DURATION = DEFAULT_DURATION;
