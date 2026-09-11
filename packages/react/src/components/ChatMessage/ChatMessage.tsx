// 1. React 及其生态
import React from 'react';
import clsx from 'clsx';

// 2. 内部组件（相对路径）
import { Icon } from '../Icon';

// 3. 样式（永远最后）
import styles from './chat-message.module.less';

export type ChatMessageVariant = 'sent' | 'received' | 'system';
export type ChatMessageStatus = 'sent' | 'delivered' | 'read';

const STATUS_LABEL: Record<ChatMessageStatus, string> = {
  sent: '已发送',
  delivered: '已送达',
  read: '已读',
};

/**
 * 单条聊天气泡：三态 `variant`（sent 右 / received 左 / system 居中灰条）+ `content`
 * 消息体（纯文本或 ReactNode）+ `avatar`（复用 `<Avatar>`）+ `time` 时间元信息 +
 * `status` 已读回执（仅 sent 侧）+ `grouped` 连发分组样式钩子。对外 props 照搬 Ant
 * Design X `Bubble`（`content`/`variant`/`avatar`），已读回执 `status` 取 Ant 命名惯例。
 *
 * 跨-prop 注意事项：
 * - **`variant` 驱动 placement**：sent 靠右、received 靠左、system 居中——不另立
 *   `placement` prop（三态已定方位）。system 态无头像、无 status。
 * - **`content` 优先，`children` 兜底**：两者皆可传消息体，`content` 存在时取 `content`。
 * - **纯 emoji 自动大图无气泡**：`content`（或 `children`）为纯 emoji 字符串（≤3 个、无其它
 *   可见字符）时自动渲成大图、去掉气泡底色与内边距（照即时通讯惯例），不需额外 prop。
 * - **`status` 仅 sent 侧出现**：sent → 单勾、delivered → 双勾（均 `--stitch-text-muted`）、
 *   read → 双勾 `--stitch-info`；勾走 `<Icon name="check">`（禁 emoji / Unicode `✓` / 裸
 *   svg），回执整体挂 `role="img"` + 可访问名（已发送 / 已送达 / 已读），内层 Icon 纯装饰。
 * - **`grouped` 只出样式钩子**：为真时隐藏头像、收紧下间距（相邻同 variant 连发），由上层
 *   编排决定何时置真，组件本身不判断相邻。头像列占位随「该条是否带 `avatar`」：带头像的续条
 *   （grouped 隐藏头像但保留列，同串气泡左缘对齐成一列，群聊）；无头像的消息不占列、气泡贴边
 *   （1:1 私聊首尾条都无头像 → 整串贴边对齐）。要对齐成列 = 给每条都灌头像（列表走 `roles` /
 *   每项 `avatar`），不靠「续条自动占空列」。
 */
export interface ChatMessageProps {
  /**
   * 气泡三态：sent（本方，右）/ received（对方，左）/ system（系统居中灰条）
   * @default 'received'
   */
  variant?: ChatMessageVariant;
  /** 消息内容（纯文本或 ReactNode）；纯 emoji 字符串自动大图无气泡。与 children 二选一（优先 content） */
  content?: React.ReactNode;
  /** 消息内容（content 的兜底写法） */
  children?: React.ReactNode;
  /** 头像（复用 `<Avatar>`）；system 态不显示 */
  avatar?: React.ReactNode;
  /** 时间 / 元信息（如发送时间） */
  time?: React.ReactNode;
  /** 已读回执：sent 单勾 / delivered 双勾 / read 双勾高亮；仅 sent 侧渲染 */
  status?: ChatMessageStatus;
  /**
   * 连发分组样式钩子：为真时隐藏头像但保留头像列缩进（气泡对齐成列）、收紧下间距
   * （相邻同 variant 时由上层置真）
   * @default false
   */
  grouped?: boolean;
  /** 自定义类名（挂到根容器） */
  className?: string;
  /** 行内样式（挂到根容器） */
  style?: React.CSSProperties;
}

// 纯 emoji 判定：去掉 emoji 相关码点（图形符 + 变体选择符 + 零宽连接 + 肤色 + 空白）后为空，
// 且 emoji 个数 ≤ 3 → 大图无气泡。仅对字符串内容判定（ReactNode 一律走气泡）。
const EMOJI_SEQ = /(\p{Extended_Pictographic}(️|‍|[\u{1F3FB}-\u{1F3FF}])*)/gu;
function isEmojiOnly(node: React.ReactNode): node is string {
  if (typeof node !== 'string') return false;
  const trimmed = node.trim();
  if (!trimmed) return false;
  const matches = trimmed.match(EMOJI_SEQ);
  if (!matches) return false;
  const stripped = trimmed.replace(EMOJI_SEQ, '').trim();
  return stripped === '' && matches.length <= 3;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  variant = 'received',
  content,
  children,
  avatar,
  time,
  status,
  grouped = false,
  className,
  style,
}) => {
  const body = content ?? children;
  const isSystem = variant === 'system';
  const emojiOnly = !isSystem && isEmojiOnly(body);

  const cls = clsx(
    styles.message,
    styles[`variant-${variant}`],
    grouped && styles['is-grouped'],
    emojiOnly && styles['is-emoji'],
    className,
  );

  // system：居中灰条，无头像 / 无 status。
  if (isSystem) {
    return (
      <div className={cls} style={style}>
        <div className={styles.system}>{body}</div>
        {time != null && <div className={styles.time}>{time}</div>}
      </div>
    );
  }

  const showStatus = variant === 'sent' && status != null;
  const tickCount = status === 'sent' ? 1 : 2;

  // 头像列：**有头像才占**（含 grouped 续条——头像虽被隐藏，只要该条带 avatar 仍保留列，让同串
  // 气泡左缘对齐成一列，群聊场景）。无头像的消息不占列、气泡贴边：1:1 私聊（首尾条都无头像）由此
  // 整串贴边对齐，不会把续条从贴边处内缩、与首条错位。对齐成列的编排 = 给每条都灌头像（ChatList
  // 走 roles / 每项 avatar），非靠「续条自动占空列」。
  const reserveAvatar = avatar != null;

  // 时间 + 已读回执：文本气泡内作行内末尾元素、与正文共用基线（照 Telegram，`.meta`
  // vertical-align:baseline）；纯 emoji / system 无气泡 → 落在下方（`.meta-below`）。两处复用同一内容。
  const metaInner =
    time != null || showStatus ? (
      <>
        {time != null && <span className={styles.time}>{time}</span>}
        {showStatus && status != null && (
          <span
            className={clsx(
              styles.ticks,
              status === 'read' && styles['ticks-read'],
            )}
            role="img"
            aria-label={STATUS_LABEL[status]}
          >
            {Array.from({ length: tickCount }).map((_, i) => (
              <Icon key={i} name="check" size="1em" className={styles.tick} />
            ))}
          </span>
        )}
      </>
    ) : null;

  return (
    <div className={cls} style={style}>
      {reserveAvatar && (
        <div className={styles['avatar-slot']}>{!grouped && avatar}</div>
      )}
      <div className={styles.body}>
        {emojiOnly ? (
          <>
            <div className={styles.emoji}>{body}</div>
            {metaInner && (
              <div className={styles['meta-below']}>{metaInner}</div>
            )}
          </>
        ) : (
          <div className={styles.bubble}>
            {body}
            {metaInner && <span className={styles.meta}>{metaInner}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

ChatMessage.displayName = 'ChatMessage';
