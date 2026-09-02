import { useState, type CSSProperties } from 'react';
import { Popover, Button } from '@octohirono/stitch-design-system';

export const meta = {
  title: 'Popover',
  description:
    '可交互浮层：click 触发，点外部 / Esc 关闭，内容可放按钮 / 表单 / 链接。受控（open/onOpenChange）与非受控（defaultOpen）双模式；键盘 / 焦点 / ARIA 由底层原语保证，浮层是 role="dialog"、须给 aria-label。面走 --stitch-bg-elevated + --stitch-radius-card + --stitch-shadow-base，换肤 seline↔steep 时圆角 / 边框 / 阴影 / 字体随之变化。触发器传真的 <Button>（长相 + 按下手感一体，asChild 透传），别手搓假按钮。vs Tooltip：那是短文字 hover 提示、不含交互。',
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

const menuItem: CSSProperties = {
  display: 'block',
  width: '100%',
  padding: 'var(--stitch-spacing-sm) var(--stitch-spacing-md)',
  border: 'none',
  borderRadius: 'var(--stitch-radius-input)',
  background: 'transparent',
  color: 'var(--stitch-text-primary)',
  font: 'inherit',
  textAlign: 'left',
  cursor: 'pointer',
};

function ControlledDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div style={grid}>
      <Popover
        open={open}
        onOpenChange={setOpen}
        aria-label="受控浮层"
        trigger={<Button>受控目标</Button>}
      >
        <p style={{ margin: 0 }}>由父组件控制显隐。</p>
      </Popover>
      <Button type="primary" onClick={() => setOpen((v) => !v)}>
        {open ? '关闭' : '打开'}浮层
      </Button>
    </div>
  );
}

export default function PopoverDemo() {
  return (
    <div style={section}>
      <div>
        <p style={rowLabel}>非受控（defaultOpen）· 可交互内容</p>
        <div style={grid}>
          <Popover
            defaultOpen
            aria-label="账户操作"
            trigger={<Button>账户菜单</Button>}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <button type="button" style={menuItem}>
                个人资料
              </button>
              <button type="button" style={menuItem}>
                设置
              </button>
              <button type="button" style={menuItem}>
                退出登录
              </button>
            </div>
          </Popover>
        </div>
      </div>

      <div>
        <p style={rowLabel}>点击触发 · 表单内容</p>
        <div style={grid}>
          <Popover aria-label="快速反馈" trigger={<Button>留言</Button>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 'var(--stitch-font-size-sm)' }}>
                你的想法
              </label>
              <textarea
                rows={3}
                style={{
                  font: 'inherit',
                  borderRadius: 'var(--stitch-radius-input)',
                  border:
                    'var(--stitch-border-width) solid var(--stitch-border)',
                  padding: 'var(--stitch-spacing-sm)',
                }}
              />
              <Button type="primary" size="small">
                提交
              </Button>
            </div>
          </Popover>
        </div>
      </div>

      <div>
        <p style={rowLabel}>受控（open / onOpenChange）</p>
        <ControlledDemo />
      </div>
    </div>
  );
}
