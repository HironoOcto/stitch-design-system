import { useState, type CSSProperties } from 'react';
import { HoverCard, Button } from '@octohirono/stitch-design-system';

export const meta = {
  title: 'HoverCard',
  description:
    '悬浮富信息卡：hover 触发、延时弹出的富内容卡（头像 / 简介 / 链接 / 预览），不抢焦点、鼠标移走即收。openDelay（默认 700ms）避误触、closeDelay（默认 300ms）容指针移到卡上；受控（open/onOpenChange）与非受控（defaultOpen）双模式。面走 --stitch-bg-elevated + --stitch-radius-card + --stitch-shadow-base（同 Popover 浮层族），换肤 seline↔steep 时圆角 / 边框 / 阴影 / 字体随之变化。触发器传真元素（链接 / 按钮，asChild 透传）。三件浮层划清：vs Tooltip = 短文字提示、role=tooltip、不含交互；vs Popover = click 触发、role=dialog、抢焦点的可交互浮层。',
};

const section: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--stitch-spacing-xl)',
  maxWidth: 760,
};
const rowLabel: CSSProperties = {
  fontSize: 'var(--stitch-font-size-sm)',
  color: 'var(--stitch-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  margin: '0 0 var(--stitch-spacing-lg)',
};
const grid: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--stitch-spacing-xl)',
  alignItems: 'center',
};

// 触发器：可 hover / focus 的用户名。用 Button type="link"（复用件）——链接长相 +
// 自带 focus-visible 焦点环（裸 <a> 内联样式写不了伪类、键盘态不可见），渲染 <button>
// 不带 href、不碰 hash 路由。
const inlineRow: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--stitch-spacing-sm)',
};

// 卡内富内容：头像块 + 姓名 + 简介 + 计数。
const avatar: CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 'var(--stitch-radius-card)',
  background: 'var(--stitch-bg-section)',
  border: 'var(--stitch-border-width) solid var(--stitch-border)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'var(--stitch-font-weight-medium)' as CSSProperties['fontWeight'],
  color: 'var(--stitch-text-secondary)',
};

function ProfileCardContent() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={avatar}>林</div>
        <div>
          <div
            style={{
              fontWeight:
                'var(--stitch-font-weight-medium)' as CSSProperties['fontWeight'],
            }}
          >
            Lin Ling
          </div>
          <div
            style={{
              fontSize: 'var(--stitch-font-size-sm)',
              color: 'var(--stitch-text-muted)',
            }}
          >
            @linling · 设计系统
          </div>
        </div>
      </div>
      <p style={{ margin: 0, color: 'var(--stitch-text-secondary)' }}>
        构建多站换肤的 React 组件库，AI
        是一等公民。悬停查看，不打断你手上的操作。
      </p>
      <div
        style={{
          display: 'flex',
          gap: 16,
          fontSize: 'var(--stitch-font-size-sm)',
          color: 'var(--stitch-text-muted)',
        }}
      >
        <span>
          <strong style={{ color: 'var(--stitch-text-primary)' }}>128</strong>{' '}
          关注中
        </span>
        <span>
          <strong style={{ color: 'var(--stitch-text-primary)' }}>1.2k</strong>{' '}
          关注者
        </span>
      </div>
    </div>
  );
}

function ControlledDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div style={grid}>
      <HoverCard
        open={open}
        onOpenChange={setOpen}
        aria-label="受控用户卡"
        trigger={<Button type="link">@linling</Button>}
      >
        <ProfileCardContent />
      </HoverCard>
      <Button type="primary" onClick={() => setOpen((v) => !v)}>
        {open ? '收起' : '展开'}卡片
      </Button>
    </div>
  );
}

export default function HoverCardDemo() {
  return (
    <div style={section}>
      <div>
        <p style={rowLabel}>hover 触发 · 富内容用户卡（默认延时）</p>
        <div style={inlineRow}>
          <span style={{ color: 'var(--stitch-text-secondary)' }}>
            本次提交由
          </span>
          <HoverCard
            aria-label="用户简介"
            trigger={<Button type="link">@linling</Button>}
          >
            <ProfileCardContent />
          </HoverCard>
          <span style={{ color: 'var(--stitch-text-secondary)' }}>推送</span>
        </div>
      </div>

      <div>
        <p style={rowLabel}>更短延时（openDelay=200）· 触发器为按钮</p>
        <div style={grid}>
          <HoverCard
            openDelay={200}
            aria-label="项目预览"
            trigger={<Button>项目预览</Button>}
          >
            <ProfileCardContent />
          </HoverCard>
        </div>
      </div>

      <div>
        <p style={rowLabel}>受控（open / onOpenChange）</p>
        <ControlledDemo />
      </div>
    </div>
  );
}
