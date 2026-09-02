import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Checkbox } from '@octohirono/stitch-design-system';

export const meta = {
  title: 'Checkbox',
  description:
    '多选组（Ant Checkbox.Group 语义）：3 尺寸 × 水平/垂直方向 + 单项/整组 disabled + 受控/非受控。勾标走 <Icon>，只读角色变量随换肤变化。',
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
  const [value, setValue] = useState<Array<string | number>>(['apple']);
  return (
    <div style={col}>
      <Checkbox options={fruits} value={value} onChange={setValue} />
      <p style={{ ...rowLabel, margin: 0 }}>
        已选：{value.length ? value.join(' / ') : '（空）'}
      </p>
    </div>
  );
}

export default function CheckboxDemo() {
  return (
    <div style={section}>
      {/* 尺寸 */}
      <section>
        <p style={rowLabel}>尺寸（size）</p>
        <div style={col}>
          <Checkbox size="small" options={fruits} defaultValue={['apple']} />
          <Checkbox size="middle" options={fruits} defaultValue={['apple']} />
          <Checkbox size="large" options={fruits} defaultValue={['apple']} />
        </div>
      </section>

      {/* 方向 */}
      <section>
        <p style={rowLabel}>方向（direction）</p>
        <div style={col}>
          <Checkbox
            direction="horizontal"
            options={fruits}
            defaultValue={['banana']}
          />
          <Checkbox
            direction="vertical"
            options={fruits}
            defaultValue={['banana']}
          />
        </div>
      </section>

      {/* 禁用 */}
      <section>
        <p style={rowLabel}>禁用（单项 / 整组）</p>
        <div style={col}>
          <Checkbox options={fruitsWithDisabled} defaultValue={['apple']} />
          <Checkbox options={fruits} disabled defaultValue={['apple']} />
        </div>
      </section>

      {/* 受控 / 非受控 */}
      <section>
        <p style={rowLabel}>受控 / 非受控</p>
        <div style={col}>
          <Checkbox options={fruits} defaultValue={['cherry']} />
          <ControlledGroup />
        </div>
      </section>
    </div>
  );
}
