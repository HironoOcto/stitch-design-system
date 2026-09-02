import type { CSSProperties } from 'react';
import { Icon, ICON_LIST } from '@octohirono/stitch-design-system';

export const meta = {
  title: 'Icon',
  description:
    '通用 UI 图标基元：内置具名图标（内联 svg，描边走 currentColor 随换肤变色）或自定义 src；label 提供可访问名，缺省则纯装饰。',
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
  gap: 'var(--stitch-spacing-lg)',
  flexWrap: 'wrap',
};
const cell: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 'var(--stitch-spacing-xs)',
  fontSize: 'var(--stitch-font-size-sm)',
  color: 'var(--stitch-text-secondary)',
};

export default function IconDemo() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--stitch-spacing-xl)',
      }}
    >
      {/* 全部内置具名图标 */}
      <section>
        <p style={rowLabel}>内置图标（name）</p>
        <div style={row}>
          {ICON_LIST.map(({ name, label }) => (
            <div key={name} style={cell}>
              <Icon name={name} label={label} size={28} />
              <code>{name}</code>
            </div>
          ))}
        </div>
      </section>

      {/* 尺寸 */}
      <section>
        <p style={rowLabel}>尺寸（size）</p>
        <div style={row}>
          {[16, 20, 24, 32, 48].map((s) => (
            <div key={s} style={cell}>
              <Icon name="search" label={`搜索 ${s}`} size={s} />
              <code>{s}</code>
            </div>
          ))}
          <div style={cell}>
            <Icon name="search" label="搜索 2em" size="2em" />
            <code>2em</code>
          </div>
        </div>
      </section>

      {/* 语义色：用角色变量上色，随换肤变化（accent 在 seline=青 / steep=近黑）*/}
      <section>
        <p style={rowLabel}>语义色（角色变量上色 · 随换肤变化）</p>
        <div style={row}>
          <div style={cell}>
            <Icon
              name="chevron-right"
              label="强调"
              size={28}
              style={{ color: 'var(--stitch-accent)' }}
            />
            <code>accent</code>
          </div>
          <div style={cell}>
            <Icon
              name="error"
              label="错误"
              size={28}
              style={{ color: 'var(--stitch-danger)' }}
            />
            <code>danger</code>
          </div>
          <div style={cell}>
            <Icon
              name="success"
              label="成功"
              size={28}
              style={{ color: 'var(--stitch-success)' }}
            />
            <code>success</code>
          </div>
          <div style={cell}>
            <Icon
              name="warning"
              label="警告"
              size={28}
              style={{ color: 'var(--stitch-warning)' }}
            />
            <code>warning</code>
          </div>
          <div style={cell}>
            <Icon
              name="info"
              label="信息"
              size={28}
              style={{ color: 'var(--stitch-info)' }}
            />
            <code>info</code>
          </div>
        </div>
      </section>

      {/* 自定义 src（品牌中立占位图） */}
      <section>
        <p style={rowLabel}>自定义资源（src）</p>
        <div style={row}>
          <Icon
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%233ba6f1'/%3E%3C/svg%3E"
            label="自定义资源"
            size={32}
          />
          <code style={{ color: 'var(--stitch-text-secondary)' }}>
            &lt;Icon src=… /&gt;
          </code>
        </div>
      </section>

      {/* a11y：有意义 vs 装饰性 */}
      <section>
        <p style={rowLabel}>可访问性（label 有意义 / 缺省装饰）</p>
        <div style={row}>
          <div style={cell}>
            <Icon name="info" label="更多信息" size={28} />
            <code>role=img · aria-label</code>
          </div>
          <div style={cell}>
            <Icon name="menu" size={28} />
            <code>aria-hidden（装饰）</code>
          </div>
        </div>
      </section>
    </div>
  );
}
