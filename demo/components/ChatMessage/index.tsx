import type { CSSProperties } from 'react';
import { ChatMessage, Avatar } from '@octohirono/stitch-design-system';

export const meta = {
  title: 'ChatMessage',
  description:
    '单条聊天气泡（照搬 Ant Design X Bubble）：三态 variant（sent 右 / received 左 / system 居中灰条）+ content（纯文本或 ReactNode）+ 复用 <Avatar> + time 时间 + status 已读回执（仅 sent 侧、✓/✓✓ 走 <Icon>，read 高亮）+ 纯 emoji 大图无气泡 + grouped 连发分组样式钩子。只读角色变量随换肤变化。',
};

const thread: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  maxWidth: 520,
  padding: 'var(--stitch-spacing-lg)',
  background: 'var(--stitch-bg-canvas)',
  borderRadius: 'var(--stitch-radius-card)',
  border: 'var(--stitch-border-width) solid var(--stitch-border)',
};

const rowLabel: CSSProperties = {
  fontSize: 'var(--stitch-font-size-sm)',
  color: 'var(--stitch-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  margin: '0 0 var(--stitch-spacing-sm)',
};

const section: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--stitch-spacing-xl)',
};

export default function ChatMessageDemo() {
  return (
    <div style={section}>
      <div>
        <p style={rowLabel}>私聊（1:1 · 不显头像 · 照 Telegram / WhatsApp）</p>
        <div style={thread}>
          <ChatMessage variant="system" content="今天 09:40" />
          <ChatMessage
            variant="received"
            content="在吗？帮我看下设计稿"
            time="09:41"
          />
          <ChatMessage
            variant="received"
            content="换肤那块"
            time="09:41"
            grouped
          />
          <ChatMessage
            variant="sent"
            content="在的，这就看"
            time="09:42"
            status="read"
          />
          <ChatMessage
            variant="sent"
            content="稿子没问题，已读角色变量、跟着站点换"
            time="09:42"
            status="delivered"
            grouped
          />
          <ChatMessage variant="sent" content="👍" time="09:42" status="read" />
          <ChatMessage variant="received" content="🎉" time="09:43" />
        </div>
      </div>

      <div>
        <p style={rowLabel}>
          群聊（多人显头像 · 连发头像只显一次 · 本方不显头像）
        </p>
        <div style={thread}>
          <ChatMessage
            variant="received"
            avatar={<Avatar size="large" fallback="林" />}
            content="设计稿我看过了，换肤那块没问题"
            time="10:01"
          />
          <ChatMessage
            variant="received"
            avatar={<Avatar size="large" fallback="陈" />}
            content="我也 +1，token 映射很清楚"
            time="10:02"
          />
          <ChatMessage
            variant="received"
            avatar={<Avatar size="large" fallback="陈" />}
            content="就等 chat 族补齐了"
            time="10:02"
            grouped
          />
          <ChatMessage
            variant="sent"
            content="好，我来补剩下几个成员"
            time="10:03"
            status="read"
          />
        </div>
      </div>

      <div>
        <p style={rowLabel}>
          长文本 / 多行（换行、气泡自适应，时间落末行末尾）
        </p>
        <div style={thread}>
          <ChatMessage
            variant="received"
            content="这段稿子的换肤逻辑是：组件只读 --stitch-* 角色变量，各站在 adapter.css 里灌不同的值，切 data-site 就整套跟着换，组件代码零改动。"
            time="09:44"
          />
          <ChatMessage
            variant="sent"
            content={
              '收到，我按这个思路补 chat 族剩下几个成员。\n先把 ChatMessage 气泡核心立住，连发分组和列表编排放到下一个 issue，避免一次改太多。'
            }
            time="09:45"
            status="read"
          />
        </div>
      </div>

      <div>
        <p style={rowLabel}>
          已读回执三态（sent ✓ / delivered ✓✓ / read ✓✓ 高亮）
        </p>
        <div style={thread}>
          <ChatMessage
            variant="sent"
            content="已发送"
            time="10:00"
            status="sent"
          />
          <ChatMessage
            variant="sent"
            content="已送达"
            time="10:01"
            status="delivered"
          />
          <ChatMessage
            variant="sent"
            content="已读"
            time="10:02"
            status="read"
          />
        </div>
      </div>

      <div>
        <p style={rowLabel}>链接（URL 消息 · content 传 &lt;a&gt;）</p>
        <div style={thread}>
          <ChatMessage
            variant="received"
            content={
              <a href="https://stitch.design/docs/chat">
                https://stitch.design/docs/chat
              </a>
            }
            time="10:10"
          />
          <ChatMessage
            variant="sent"
            content={
              <a href="https://stitch.design/docs/chat">
                https://stitch.design/docs/chat
              </a>
            }
            time="10:11"
            status="read"
          />
        </div>
      </div>
    </div>
  );
}
