import { useState, type CSSProperties } from 'react';
import { Input, Icon } from '@octohirono/stitch-design-system';

export const meta = {
  title: 'Input',
  description:
    '基础文本输入：3 尺寸 × 校验态（error / warning）+ prefix / suffix（走 <Icon>）+ allowClear + disabled + 受控/非受控。只读角色变量，随换肤变化。',
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
const col: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--stitch-spacing-md)',
  maxWidth: 320,
};
const section: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--stitch-spacing-xl)',
};

function ControlledClear() {
  const [value, setValue] = useState('可清除的内容');
  return (
    <Input
      allowClear
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onClear={() => setValue('')}
      placeholder="输入点什么…"
    />
  );
}

export default function InputDemo() {
  return (
    <div style={section}>
      {/* 全部 size */}
      <section>
        <p style={rowLabel}>尺寸（size）</p>
        <div style={col}>
          <Input size="small" placeholder="small" />
          <Input size="middle" placeholder="middle" />
          <Input size="large" placeholder="large" />
        </div>
      </section>

      {/* prefix / suffix（走 <Icon>） */}
      <section>
        <p style={rowLabel}>前后缀（prefix / suffix 走 &lt;Icon&gt;）</p>
        <div style={col}>
          <Input prefix={<Icon name="search" size={16} />} placeholder="搜索" />
          <Input
            suffix={<Icon name="info" size={16} />}
            placeholder="带后缀说明"
          />
        </div>
      </section>

      {/* 校验态 */}
      <section>
        <p style={rowLabel}>校验态（status）</p>
        <div style={col}>
          <Input status="error" defaultValue="错误的输入" />
          <Input status="warning" defaultValue="警告的输入" />
        </div>
      </section>

      {/* allowClear：受控 + 非受控 */}
      <section>
        <p style={rowLabel}>可清除（allowClear · 受控 / 非受控）</p>
        <div style={col}>
          <Input allowClear defaultValue="非受控默认值" />
          <ControlledClear />
        </div>
      </section>

      {/* disabled */}
      <section>
        <p style={rowLabel}>禁用（disabled）</p>
        <div style={col}>
          <Input disabled defaultValue="不可编辑" />
          <Input disabled placeholder="禁用占位符" />
        </div>
      </section>

      {/* 宽度自适应演示 */}
      <section>
        <p style={rowLabel}>行内组合（与其他控件同高对齐）</p>
        <div style={row}>
          <Input
            prefix={<Icon name="search" size={16} />}
            placeholder="关键词"
            style={{ maxWidth: 240 }}
          />
        </div>
      </section>
    </div>
  );
}
