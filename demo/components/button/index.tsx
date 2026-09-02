import type { CSSProperties } from 'react';
import { Button, Icon } from '@octohirono/stitch-design-system';

export const meta = {
  title: 'Button',
  description:
    '基础动作按钮：5 种 type（primary 为 accent 填充 CTA）× 3 尺寸，支持 danger / ghost / block / loading / disabled 与传入 <Icon>。只读角色变量，随换肤变化。',
};

// 演示用小标题（只读角色变量，不硬编码）。
const rowLabel: CSSProperties = {
  fontSize: 'var(--stitch-font-size-sm)',
  color: 'var(--stitch-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  margin: '0 0 var(--stitch-spacing-sm)',
};
const row: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--stitch-spacing-md)',
  flexWrap: 'wrap',
};
const section: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--stitch-spacing-xl)',
};

const TYPES = ['primary', 'default', 'dashed', 'text', 'link'] as const;

export default function ButtonDemo() {
  return (
    <div style={section}>
      {/* 全部 type */}
      <section>
        <p style={rowLabel}>类型（type）</p>
        <div style={row}>
          {TYPES.map((t) => (
            <Button key={t} type={t}>
              {t}
            </Button>
          ))}
        </div>
      </section>

      {/* 全部 size */}
      <section>
        <p style={rowLabel}>尺寸（size · primary）</p>
        <div style={row}>
          <Button type="primary" size="small">
            small
          </Button>
          <Button type="primary" size="middle">
            middle
          </Button>
          <Button type="primary" size="large">
            large
          </Button>
        </div>
      </section>

      {/* 语义态：danger */}
      <section>
        <p style={rowLabel}>危险态（danger）</p>
        <div style={row}>
          {TYPES.map((t) => (
            <Button key={t} type={t} danger>
              {t}
            </Button>
          ))}
        </div>
      </section>

      {/* ghost */}
      <section>
        <p style={rowLabel}>幽灵（ghost · primary）</p>
        <div style={row}>
          <Button type="primary" ghost>
            ghost
          </Button>
        </div>
      </section>

      {/* icon（走 <Icon>） */}
      <section>
        <p style={rowLabel}>带图标（icon 走 &lt;Icon&gt;）</p>
        <div style={row}>
          <Button type="primary" icon={<Icon name="search" size={16} />}>
            搜索
          </Button>
          <Button icon={<Icon name="check" size={16} />}>确认</Button>
          <Button
            type="default"
            aria-label="关闭"
            icon={<Icon name="close" size={16} />}
          />
        </div>
      </section>

      {/* loading + disabled */}
      <section>
        <p style={rowLabel}>加载 / 禁用（loading · disabled）</p>
        <div style={row}>
          <Button type="primary" loading>
            提交中
          </Button>
          <Button type="primary" disabled>
            禁用
          </Button>
          <Button disabled>禁用（default）</Button>
        </div>
      </section>

      {/* block */}
      <section>
        <p style={rowLabel}>块级（block）</p>
        <Button type="primary" block>
          block 撑满宽度
        </Button>
      </section>
    </div>
  );
}
