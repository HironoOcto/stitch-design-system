import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Select } from '@octohirono/stitch-design-system';

export const meta = {
  title: 'Select',
  description:
    '单选下拉（Ant Select 语义，combobox/listbox 模式）：3 尺寸 + 单项/整体 disabled + 受控/非受控 + 方向键导航 + Esc 关闭。箭头/选中勾走 <Icon>，只读角色变量随换肤变化。',
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
  alignItems: 'flex-start',
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
  { label: '葡萄', value: 'grape' },
];

const fruitsWithDisabled = [
  { label: '苹果', value: 'apple' },
  { label: '香蕉（缺货）', value: 'banana', disabled: true },
  { label: '樱桃', value: 'cherry' },
];

// 长列表：超过下拉高度上限即滚，滚动条走 ScrollArea 自绘手柄（非原生粗条）。
const manyCities = Array.from({ length: 20 }, (_, i) => ({
  label: `城市选项 ${i + 1}`,
  value: `city-${i + 1}`,
}));

function ControlledSelect() {
  const [value, setValue] = useState<string | number>('apple');
  return (
    <div style={col}>
      <Select
        options={fruits}
        value={value}
        onChange={setValue}
        aria-label="受控水果选择"
      />
      <p style={{ ...rowLabel, margin: 0 }}>已选：{value}</p>
    </div>
  );
}

export default function SelectDemo() {
  return (
    <div style={section}>
      {/* 尺寸 */}
      <section>
        <p style={rowLabel}>尺寸（size）</p>
        <div style={col}>
          <Select
            size="small"
            options={fruits}
            defaultValue="apple"
            aria-label="小号"
          />
          <Select
            size="middle"
            options={fruits}
            defaultValue="apple"
            aria-label="中号"
          />
          <Select
            size="large"
            options={fruits}
            defaultValue="apple"
            aria-label="大号"
          />
        </div>
      </section>

      {/* 占位 / 已选 */}
      <section>
        <p style={rowLabel}>占位（未选）与已选</p>
        <div style={col}>
          <Select options={fruits} placeholder="请选择水果" aria-label="占位" />
          <Select options={fruits} defaultValue="cherry" aria-label="已选" />
        </div>
      </section>

      {/* 禁用 */}
      <section>
        <p style={rowLabel}>禁用（单项 / 整体）</p>
        <div style={col}>
          <Select
            options={fruitsWithDisabled}
            defaultValue="apple"
            aria-label="单项禁用"
          />
          <Select
            options={fruits}
            disabled
            defaultValue="apple"
            aria-label="整体禁用"
          />
        </div>
      </section>

      {/* 受控 / 非受控 */}
      <section>
        <p style={rowLabel}>受控 / 非受控</p>
        <div style={col}>
          <Select options={fruits} defaultValue="grape" aria-label="非受控" />
          <ControlledSelect />
        </div>
      </section>

      {/* 长列表内滚动 */}
      <section>
        <p style={rowLabel}>长列表内滚动（滚动条走 ScrollArea 自绘手柄）</p>
        <div style={col}>
          <Select
            options={manyCities}
            placeholder="选择城市（20 项，可滚动）"
            aria-label="长列表城市选择"
          />
        </div>
      </section>
    </div>
  );
}
