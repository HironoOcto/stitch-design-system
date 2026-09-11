import type { CSSProperties } from 'react';
import {
  TypingIndicator,
  ChatMessage,
  Avatar,
} from '@octohirono/stitch-design-system';

export const meta = {
  title: 'TypingIndicator',
  description:
    '「对方正在输入」指示：三点循环动画（IM 语境是对方的态）+ 点色走 --stitch-text-muted + 动效走 --stitch-motion-*（不超设计动效窗，尊重 prefers-reduced-motion）+ role="status" 可访问名（label 覆盖）。点是角色变量小元素（非 emoji / svg / Unicode）。只读角色变量随换肤变化。',
};

const section: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--stitch-spacing-xl)',
  maxWidth: 520,
};

const rowLabel: CSSProperties = {
  fontSize: 'var(--stitch-font-size-sm)',
  color: 'var(--stitch-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  margin: '0 0 var(--stitch-spacing-sm)',
};

const thread: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  padding: 'var(--stitch-spacing-lg)',
  background: 'var(--stitch-bg-canvas)',
  borderRadius: 'var(--stitch-radius-card)',
  border: 'var(--stitch-border-width) solid var(--stitch-border)',
};

export default function TypingIndicatorDemo() {
  return (
    <div style={section}>
      <div>
        <p style={rowLabel}>独立三点动画（默认可访问名「对方正在输入」）</p>
        <TypingIndicator />
      </div>

      <div>
        <p style={rowLabel}>自定义可访问名（label）</p>
        <TypingIndicator label="张三正在输入" />
      </div>

      <div>
        <p style={rowLabel}>会话中：接在对方气泡下方（左侧、对齐头像列）</p>
        <div style={thread}>
          <ChatMessage
            variant="received"
            avatar={<Avatar size="large" fallback="陈" />}
            content="稿子我看下，稍等"
            time="10:20"
          />
          {/* 缩进 = 头像列宽（large 40px）+ 气泡间距，让「正在输入」气泡与上方 received 气泡左缘对齐 */}
          <div style={{ paddingLeft: 'calc(40px + var(--stitch-spacing-sm))' }}>
            <TypingIndicator label="陈正在输入" />
          </div>
        </div>
      </div>
    </div>
  );
}
