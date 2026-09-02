import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Radio } from '@octohirono/stitch-design-system';

export const meta = {
  title: 'Radio',
  description:
    '单选组（Ant Radio.Group 语义）：3 尺寸 × 水平/垂直方向 + 单项/整组 disabled + 受控/非受控 + 方向键 roving 导航。选中标记走 <Icon>，只读角色变量随换肤变化。',
};

const rowLabel: CSSProperties = {
  fontSize: 'var(--stitch-font-size-sm)',
  color: 'var(--stitch-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  margin: '0 0 var(--stitch-spacing-sm)',
};
const col: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--stitch-spacing-md)',
};
const section: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--stitch-spacing-xl)',
};

const fruits = [
  { label: '苹果', value: 'apple' },
  { label: '香蕉', value: 'banana' },
  { label: '樱桃', value: 'cherry' },
];

const fruitsWithDisabled = [
  { label: '苹果', value: 'apple' },
  { label: '香蕉（禁用）', value: 'banana', disabled: true },
  { label: '樱桃', value: 'cherry' },
];

function ControlledGroup() {
  const [value, setValue] = useState<string | number>('apple');
  return (
    <div style={col}>
      <Radio options={fruits} value={value} onChange={setValue} />
      <p style={{ ...rowLabel, margin: 0 }}>已选：{value}</p>
    </div>
  );
}

export default function RadioDemo() {
  return (
    <div style={section}>
      {/* 尺寸 */}
      <section>
        <p style={rowLabel}>尺寸（size）</p>
        <div style={col}>
          <Radio size="small" options={fruits} defaultValue="apple" />
          <Radio size="middle" options={fruits} defaultValue="apple" />
          <Radio size="large" options={fruits} defaultValue="apple" />
        </div>
      </section>

      {/* 方向 */}
      <section>
        <p style={rowLabel}>方向（direction）</p>
        <div style={col}>
          <Radio
            direction="horizontal"
            options={fruits}
            defaultValue="banana"
          />
          <Radio direction="vertical" options={fruits} defaultValue="banana" />
        </div>
      </section>

      {/* 禁用 */}
      <section>
        <p style={rowLabel}>禁用（单项 / 整组）</p>
        <div style={col}>
          <Radio options={fruitsWithDisabled} defaultValue="apple" />
          <Radio options={fruits} disabled defaultValue="apple" />
        </div>
      </section>

      {/* 受控 / 非受控 */}
      <section>
        <p style={rowLabel}>受控 / 非受控</p>
        <div style={col}>
          <Radio options={fruits} defaultValue="cherry" />
          <ControlledGroup />
        </div>
      </section>
    </div>
  );
}
