// 1. React 及其生态
import React, { useCallback, useLayoutEffect, useRef } from 'react';
import clsx from 'clsx';

// 2. 内部组件（相对路径）
import { ChatMessage } from '../ChatMessage';
import type { ChatMessageProps, ChatMessageVariant } from '../ChatMessage';
import { Loading } from '../Loading';

// 3. 样式（永远最后）
import styles from './chat-list.module.less';

/** 单条消息数据 = 一条 `ChatMessage` 的 props + 稳定 `id`（React key + append 判定） */
export interface ChatListItem extends ChatMessageProps {
  /** 唯一标识：作 React key，并驱动「新消息 append」判定 */
  id: string | number;
}

/**
 * 消息流容器：**数据驱动**——吃 `items`（每项 = 一条 `ChatMessage` 的 props + `id`），内部
 * 渲染 `ChatMessage`（`ChatMessage` 仍可单独使用，列表场景走 `items`）。负责连发分组编排、
 * 贴底滚动与向上加载历史的接缝。对外 props 照搬 Ant Design X `Bubble.List`（`items` / `roles` /
 * `autoScroll`），加载更多接缝取 Ant `on*` 惯例。
 *
 * 跨-prop 注意事项：
 * - **数据驱动、组件不算业务**：消息内容 / 时间 / 头像 / 已读态全由 `items` 每项自带（就是
 *   `ChatMessageProps`）；组件只按数组顺序渲染，不排序、不去重、不算时间。
 * - **`roles` 灌角色默认**：按 `variant` 给同类消息灌共享默认（如 received 统一头像），`item`
 *   显式字段优先覆盖 `roles` 默认（照 Ant X `roles`）。
 * - **连发分组自动编排**：相邻同 `variant`（非 system）的续条自动置 `ChatMessage` 的 `grouped`
 *   ——头像只在组内首条显示、组内间距收紧（**不合并内容，仍是多个独立气泡**）。`system` 项
 *   （如日期分隔）断组。`item` 显式传 `grouped` 时以其为准。
 * - **日期分隔 = `system` 项**：日期分隔线作为一条 `variant="system"` 的 `item` 承载居中灰条，
 *   **标签文字（今天 / 昨天 / 某月某日）由 app 放进该项的 `content`，组件不算日期**。
 * - **`autoScroll` 贴底 + 上滚暂停**：`items` 追加时若用户仍在底部则自动滚到底；用户手动上滚
 *   离底即暂停自动贴底、滚回底部恢复。`autoScroll={false}` 整体关闭。
 * - **`onReachTop` 只发信号、组件不 fetch**：滚到顶发一次 `onReachTop`，去哪取历史、怎么
 *   prepend 全交 app；`loadingMore` 由 app 控制，为真时顶部显示转圈（复用 `<Loading>`）。组件
 *   不拥有传输（接缝原则同 `ChatMessage`）。
 * - **根节点 `role="log"` + 键盘可聚焦**：消息流作实时日志区（`aria-live="polite"` + 增量播报），
 *   新消息由辅助技术增量读出；容器 `tabIndex={0}` 使纯键盘用户 Tab 进本区后用方向键 /
 *   PageUp/Down 翻历史（滚到顶即触 `onReachTop`），聚焦环走 `:focus-visible`（WCAG 2.1.1）。
 */
export interface ChatListProps {
  /** 消息数据（数据驱动，内部渲染 `ChatMessage`）；每项 = `ChatMessageProps` + `id` */
  items: ChatListItem[];
  /** 按 `variant` 的角色默认配置（照 Ant X `roles`）；合并进同 variant 的每项，item 显式值优先 */
  roles?: Partial<Record<ChatMessageVariant, Partial<ChatMessageProps>>>;
  /**
   * 新消息自动贴底（照 Ant X `autoScroll`）：用户手动上滚时暂停、滚回底部恢复
   * @default true
   */
  autoScroll?: boolean;
  /**
   * 滚到顶时触发（加载更多历史）：**组件不 fetch**，去哪拿数据、拿到怎么 prepend 全交 app；
   * 组件只发信号并等 app 回灌 `items`（接缝原则同 `ChatMessage` 不拥有传输）
   */
  onReachTop?: () => void;
  /**
   * 顶部加载中（**由 app 控制**，配合 `onReachTop`）：为真在顶部显示转圈（复用 `<Loading>`）
   * @default false
   */
  loadingMore?: boolean;
  /** 自定义类名（挂到根容器） */
  className?: string;
  /** 行内样式（挂到根容器） */
  style?: React.CSSProperties;
}

// 距顶 / 距底 ≤ 此像素分别判为触顶 / 贴底（行为几何常量，非主题值）：触顶留提前量给 app
// prepend 历史；贴底留容差让「基本在底」也算贴底、不因几像素误差误判为已离底。
const EDGE_THRESHOLD = 48;

export const ChatList: React.FC<ChatListProps> = ({
  items,
  roles,
  onReachTop,
  autoScroll = true,
  loadingMore = false,
  className,
  style,
}) => {
  const listRef = useRef<HTMLDivElement>(null);
  // 是否已在触顶区：跨入时发一次 onReachTop，离开后复位，避免停在顶部反复触发。
  const atTopRef = useRef(false);
  // 是否贴底：用户上滚离底则置 false（暂停自动贴底），滚回底恢复 true。初始视为贴底。
  const stickBottomRef = useRef(true);

  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (el == null) return;
    // 内容不溢出（无可滚空间）时不算「滚到顶」——否则挂载时贴底 effect 写 scrollTop 触发的
    // scroll 事件会在 scrollTop=0 处误判触顶、开屏即拉历史。真能上滚才发信号。
    const canScroll = el.scrollHeight - el.clientHeight > EDGE_THRESHOLD;
    const nearTop = canScroll && el.scrollTop <= EDGE_THRESHOLD;
    if (nearTop && !atTopRef.current && !loadingMore) {
      onReachTop?.();
    }
    atTopRef.current = nearTop;
    // 距底 = 内容总高 - 视口高 - 已滚距离；≤ 容差即视为贴底。
    const distanceToBottom = el.scrollHeight - el.clientHeight - el.scrollTop;
    stickBottomRef.current = distanceToBottom <= EDGE_THRESHOLD;
  }, [onReachTop, loadingMore]);

  // 贴底编排：items 变化后（append 新消息 / 初次挂载），仍贴底且开启 autoScroll 时滚到底。
  // 用户已上滚（stickBottom=false）则不动——即暂停自动贴底。DOM 改完立即量高，用 layout effect。
  useLayoutEffect(() => {
    const el = listRef.current;
    if (el == null || !autoScroll || !stickBottomRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [items, autoScroll]);

  return (
    <div
      className={clsx(styles.list, className)}
      style={style}
      ref={listRef}
      onScroll={handleScroll}
      role="log"
      aria-live="polite"
      aria-relevant="additions"
      // 可滚动的日志区须键盘可聚焦（WCAG 2.1.1）：纯键盘用户 Tab 进本区后用方向键 /
      // PageUp/Down 翻历史（也是顶部加载的起点）。role="log" 是展示型 live 区、非 listbox，
      // 只需容器本身可聚焦。
      tabIndex={0}
    >
      {loadingMore && (
        <div className={styles['top-loader']}>
          <Loading spinning size="small" />
        </div>
      )}
      {items.map((item, i) => {
        const { id, ...own } = item;
        // roles：按 variant 灌角色默认（照 Ant X）；item 显式值优先（own 后展开覆盖）。
        const roleDefault = roles?.[own.variant ?? 'received'];
        const rest = roleDefault ? { ...roleDefault, ...own } : own;
        // 连发分组：相邻同 variant（非 system）→ 续条置 grouped（隐藏头像、收紧间距）。
        // 组内头像只在首条显示；system 项（如日期分隔）断组。item 显式 grouped 优先。
        const prev = items[i - 1];
        const grouped =
          rest.grouped ??
          (prev != null &&
            prev.variant === rest.variant &&
            rest.variant !== 'system');
        return <ChatMessage key={id} {...rest} grouped={grouped} />;
      })}
    </div>
  );
};

ChatList.displayName = 'ChatList';
