import { useState, type CSSProperties } from 'react';
import {
  ChatMessageActions,
  ChatMessage,
  ChatInput,
  Button,
  Icon,
  type ChatMessageAction,
} from '@octohirono/stitch-design-system';

export const meta = {
  title: 'ChatMessageActions',
  description:
    '消息操作菜单（照 WhatsApp / Telegram）：把一条 <ChatMessage> 包成「右键（桌面）/ 长按（触屏）出操作」。只出触发 + 菜单壳——复用 ContextMenu（指针主入口，无常驻按钮）+ DropdownMenu（键盘聚焦露钮），两路喂同一份 actions。动作项（回复 / 转发 / 复制 / 撤回）与回调由 app 经 actions 传、图标走 <Icon>。下面是一个可交互的迷你 IM：动作效果照 Telegram——引用回复 = 引用卡片 + 原作者；转发 = 用「转发」子菜单选会话（复用菜单自带的 children 子菜单，点一项即转发、不塞回当前窗口）。只读角色变量随换肤变化。',
};

interface ReplyRef {
  author: string;
  text: string;
}

interface Msg {
  id: number;
  variant: 'sent' | 'received' | 'system';
  text: string;
  time?: string;
  status?: 'sent' | 'delivered' | 'read';
  author?: string;
  /** 引用回复：被回复消息的作者 + 文本（照 Telegram 引用卡片） */
  replyTo?: ReplyRef;
  /** 转发自：原始发送者名（照 Telegram「转发自 X」头） */
  forwardFrom?: string;
}

const now = () =>
  new Date().toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });

// 1:1 对话里的两位：received = 对方「小美」，sent = 「我」。转发 / 引用要显示「谁」，故每条带作者。
const authorOf = (m: Msg) => m.author ?? (m.variant === 'sent' ? '我' : '小美');

// 转发目标（真实项目里来自会话列表）：做成「转发」动作的 children 子菜单，点一项即转发到该会话。
const forwardTargets: { name: string; current?: boolean }[] = [
  { name: '小美（当前对话）', current: true },
  { name: '产品设计群' },
  { name: '前端组' },
  { name: '老板' },
  { name: '客户群 · 蔚来' },
  { name: '客户群 · 理想' },
  { name: '运营周会' },
  { name: '测试同学' },
  { name: '设计评审' },
  { name: '家人群' },
];

const initial: Msg[] = [
  {
    id: 1,
    variant: 'received',
    text: '在吗？帮我看下设计稿',
    time: '09:41',
    author: '小美',
  },
  {
    id: 2,
    variant: 'sent',
    text: '在的，这就看',
    time: '09:42',
    status: 'read',
    author: '我',
  },
];

const section: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--stitch-spacing-xl)',
};

const rowLabel: CSSProperties = {
  fontSize: 'var(--stitch-font-size-sm)',
  color: 'var(--stitch-text-muted)',
  margin: '0 0 var(--stitch-spacing-sm)',
};

const panel: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  maxWidth: 520,
  background: 'var(--stitch-bg-canvas)',
  borderRadius: 'var(--stitch-radius-card)',
  border: 'var(--stitch-border-width) solid var(--stitch-border)',
  overflow: 'hidden',
};

const thread: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--stitch-spacing-sm)',
  padding: 'var(--stitch-spacing-lg)',
  minHeight: 200,
};

// ---- Telegram 式引用回复卡片：色条 + 原作者（accent 强调）+ 原文（muted、截断） ----
const quoteCard: CSSProperties = {
  display: 'block',
  borderLeft: '3px solid var(--stitch-accent)',
  paddingLeft: 'var(--stitch-spacing-sm)',
  margin: '0 0 var(--stitch-spacing-xs)',
};
const quoteAuthor: CSSProperties = {
  display: 'block',
  color: 'var(--stitch-accent)',
  fontWeight: 'var(--stitch-font-weight-medium)',
  fontSize: 'var(--stitch-font-size-sm)',
};
const quoteText: CSSProperties = {
  display: 'block',
  color: 'var(--stitch-text-secondary)',
  fontSize: 'var(--stitch-font-size-sm)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  maxWidth: 240,
};

// ---- Telegram 式转发头：「转发自 X」，X 走 accent ----
const fwdLabel: CSSProperties = {
  display: 'block',
  color: 'var(--stitch-text-muted)',
  fontSize: 'var(--stitch-font-size-sm)',
  margin: '0 0 var(--stitch-spacing-xs)',
};
const fwdName: CSSProperties = {
  color: 'var(--stitch-accent)',
  fontWeight: 'var(--stitch-font-weight-medium)',
};

const replyPreview: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--stitch-spacing-sm)',
  padding: 'var(--stitch-spacing-sm) var(--stitch-spacing-md)',
  borderTop: 'var(--stitch-border-width) solid var(--stitch-border)',
  background: 'var(--stitch-bg-section)',
  color: 'var(--stitch-text-secondary)',
  fontSize: 'var(--stitch-font-size-sm)',
};

const replyPreviewText: CSSProperties = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const toastStyle: CSSProperties = {
  alignSelf: 'center',
  padding: 'var(--stitch-spacing-xs) var(--stitch-spacing-md)',
  borderRadius: 'var(--stitch-radius-button)',
  background: 'var(--stitch-bg-inverted)',
  color: 'var(--stitch-text-on-dark)',
  fontSize: 'var(--stitch-font-size-sm)',
};

// 气泡正文 = （可选）转发头 / 引用卡片 + 正文。照 Telegram：转发头与引用卡片叠在正文上方。
function renderBody(m: Msg) {
  if (!m.forwardFrom && !m.replyTo) return m.text;
  return (
    <span style={{ display: 'block' }}>
      {m.forwardFrom && (
        <span style={fwdLabel}>
          转发自 <span style={fwdName}>{m.forwardFrom}</span>
        </span>
      )}
      {m.replyTo && (
        <span style={quoteCard}>
          <span style={quoteAuthor}>{m.replyTo.author}</span>
          <span style={quoteText}>{m.replyTo.text}</span>
        </span>
      )}
      <span>{m.text}</span>
    </span>
  );
}

export default function ChatMessageActionsDemo() {
  const [messages, setMessages] = useState<Msg[]>(initial);
  const [replyTo, setReplyTo] = useState<ReplyRef | null>(null);
  const [toast, setToast] = useState('');
  const [nextId, setNextId] = useState(100);

  const flash = (t: string) => {
    setToast(t);
    window.setTimeout(() => setToast(''), 1800);
  };

  const append = (m: Omit<Msg, 'id'>) => {
    setMessages((prev) => [...prev, { ...m, id: nextId }]);
    setNextId((n) => n + 1);
  };

  const send = (text: string) => {
    append({
      variant: 'sent',
      author: '我',
      text,
      time: now(),
      status: 'sent',
      replyTo: replyTo ?? undefined,
    });
    setReplyTo(null);
  };

  // 转发到某会话：目标是当前对话 → 追加「转发自 X」气泡到本窗口；
  // 别的会话 → 消息去了那个会话（本窗口不显示），仅提示。
  const forwardTo = (m: Msg, target: { name: string; current?: boolean }) => {
    if (target.current) {
      append({
        variant: 'sent',
        author: '我',
        text: m.text,
        time: now(),
        status: 'sent',
        forwardFrom: authorOf(m),
      });
      flash('已转发到当前对话');
    } else {
      flash(`已转发给 ${target.name}`);
    }
  };

  // 动作项由 app 配，回调交 app —— 每个都有真实效果（照 Telegram）。
  const actionsFor = (m: Msg): ChatMessageAction[] => {
    if (m.variant === 'system') return [];
    const base: ChatMessageAction[] = [
      {
        label: '回复',
        icon: 'arrow-up-right',
        // 引用回复：记下被回复消息的作者 + 文本，发送时叠成引用卡片。
        onClick: () => setReplyTo({ author: authorOf(m), text: m.text }),
      },
      {
        label: '转发',
        icon: 'send',
        // 转发 = 子菜单：直接复用菜单件自带的 children 子菜单列会话，点一项即转发。
        // 右键路 / 键盘路两条都自动展开同一个子菜单（无需 Modal / 手写列表）。
        children: forwardTargets.map((t) => ({
          label: t.name,
          icon: 'send',
          onClick: () => forwardTo(m, t),
        })),
      },
      {
        label: '复制',
        icon: 'file',
        onClick: () => {
          void navigator.clipboard?.writeText(m.text).catch(() => {});
          flash('已复制到剪贴板');
        },
      },
    ];
    if (m.variant === 'sent') {
      base.push({
        label: '撤回',
        icon: 'close',
        danger: true,
        onClick: () => {
          setMessages((prev) =>
            prev.map((x) =>
              x.id === m.id
                ? { id: x.id, variant: 'system', text: '你撤回了一条消息' }
                : x,
            ),
          );
          flash('已撤回');
        },
      });
    }
    return base;
  };

  return (
    <div style={section}>
      <div>
        <p style={rowLabel}>
          在任意气泡上右键（桌面）或长按（触屏）出操作；键盘用户 Tab
          到气泡尾角的触发钮、Enter 打开。动作效果照
          Telegram：回复→引用卡片（原作者 +
          原文）、转发→展开「转发」子菜单选会话、复制→写剪贴板、撤回→变系统「已撤回」。
        </p>
        <div style={panel}>
          <div style={thread}>
            {messages.map((m) =>
              m.variant === 'system' ? (
                <ChatMessage key={m.id} variant="system" content={m.text} />
              ) : (
                <ChatMessageActions key={m.id} actions={actionsFor(m)}>
                  <ChatMessage
                    variant={m.variant}
                    time={m.time}
                    status={m.status}
                    content={renderBody(m)}
                  />
                </ChatMessageActions>
              ),
            )}
            {toast && <div style={toastStyle}>{toast}</div>}
          </div>

          {replyTo && (
            <div style={replyPreview}>
              <span style={replyPreviewText}>
                回复 <span style={fwdName}>{replyTo.author}</span>：
                {replyTo.text}
              </span>
              <Button
                type="text"
                size="small"
                aria-label="取消回复"
                onClick={() => setReplyTo(null)}
              >
                <Icon name="close" size="1em" aria-hidden />
              </Button>
            </div>
          )}

          <ChatInput
            placeholder="输入消息…（右键上方气泡试试操作菜单）"
            onSubmit={send}
          />
        </div>
      </div>
    </div>
  );
}
