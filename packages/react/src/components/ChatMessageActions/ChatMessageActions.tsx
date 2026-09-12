// 1. React 及其生态
import React from 'react';
import clsx from 'clsx';

// 2. 内部组件（相对路径）
import { Icon } from '../Icon';
import { DropdownMenu, type DropdownMenuItem } from '../DropdownMenu';
import { ContextMenu } from '../ContextMenu';

// 3. 样式（永远最后）
import styles from './chat-message-actions.module.less';

/**
 * 一条消息操作项。结构与 `DropdownMenuItem` / `ContextMenuItem` 完全一致（同一心智，
 * 同 Ant v5 `items` 形态），因为它原样喂给这两个复用件。
 */
export type ChatMessageAction = DropdownMenuItem;

/**
 * 消息操作菜单：把一条消息（`children`，通常是 `<ChatMessage>`）包成「右键 / 长按出操作」。
 * 本组件只出**触发 + 菜单壳**——动作项（回复 / 撤回 / 转发…）与回调全由 app 经 `actions` 传入。
 * 不另造浮层：**指针路**用 `ContextMenu`——桌面右键、触屏长按目标区弹出（即时通讯惯例，无常驻按钮）；
 * **键盘路**用 `DropdownMenu`——尾角触发钮仅在键盘聚焦时显形、Enter 打开。两路喂同一份 `actions`。
 *
 * 跨-prop 注意事项：
 * - **两路触发、一份动作**：`actions` 同时喂给 `ContextMenu`（右键 / 长按，指针主入口）与
 *   `DropdownMenu`（键盘聚焦露钮点开）；app 只需配一份。每项 `{ label, icon?, onClick?, danger?,
 *   disabled?, children? }` 取 Ant v5 `items` 惯例，点项触发 `item.onClick`（动作语义、无选中态）。
 * - **组件只出壳**：不持菜单开合 state、不判相邻、不接业务——回调交 app（`actions[].onClick`）；
 *   图标走 `<Icon>`（项 `icon` 由底层复用件经 `<Icon>` 渲染，禁裸 svg / emoji / Unicode 符号）。
 * - **无常驻 hover 按钮**：指针用户走右键 / 长按，尾角触发钮**只在键盘聚焦（`:focus-visible`）**时显形、
 *   不随 hover 出现（避免气泡上常驻钮），仅为保证键盘可达；无可见文字 → 走 `triggerLabel` 给可及名
 *   （默认「消息操作」）。
 * - **键盘 / 焦点 / ARIA**（方向键走项、Enter 选中、Esc 关、焦点归还、`role="menu"`）由复用件
 *   （ContextMenu / DropdownMenu → 底层）保证，本组件不重复实现。
 */
export interface ChatMessageActionsProps {
  /** 被包裹的消息（通常是 `<ChatMessage>`）：hover / 长按此区出操作入口 */
  children: React.ReactNode;
  /** 动作项数组（Ant v5 `items` 风格，原样喂给 DropdownMenu / ContextMenu） */
  actions: ChatMessageAction[];
  /** 触发钮的无障碍标签（无可见文字时的可及名） @default '消息操作' */
  triggerLabel?: string;
  /** 菜单显隐变化回调（两路共用） */
  onOpenChange?: (open: boolean) => void;
  /** 自定义类名（挂到根容器） */
  className?: string;
  /** 行内样式（挂到根容器） */
  style?: React.CSSProperties;
}

export const ChatMessageActions: React.FC<ChatMessageActionsProps> = ({
  children,
  actions,
  triggerLabel = '消息操作',
  onOpenChange,
  className,
  style,
}) => (
  // 指针主入口：右键（桌面）/ 长按（触屏）目标区 = 整条消息。
  <ContextMenu items={actions} onOpenChange={onOpenChange}>
    <div className={clsx(styles.wrap, className)} style={style}>
      {children}
      {/* 键盘路：尾角触发钮，仅键盘聚焦时显形（不随 hover），Enter 点开 DropdownMenu。 */}
      <DropdownMenu
        items={actions}
        onOpenChange={onOpenChange}
        aria-label={triggerLabel}
        trigger={
          <button
            type="button"
            className={styles.trigger}
            aria-label={triggerLabel}
          >
            <Icon name="chevron-down" size="1em" aria-hidden />
          </button>
        }
      />
    </div>
  </ContextMenu>
);

ChatMessageActions.displayName = 'ChatMessageActions';
