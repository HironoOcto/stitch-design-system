import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Tabs, type TabItem } from '@octohirono/stitch-design-system';

export const meta = {
  title: 'Tabs',
  description:
    '药丸标签组（Ant Tabs items 语义）：items 列表 + 受控 activeKey / 非受控 defaultActiveKey / onChange，键盘方向键 + Home/End roving。源 animal 的 ●/○ 点徽标 + 叶片装饰 + 3D 像素影全丢；激活态按角色映射为反色暗面（bg-inverted + text-on-dark），随换肤变化。',
};

const rowLabel: CSSProperties = {
  fontSize: 'var(--stitch-font-size-sm)',
  color: 'var(--stitch-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  margin: '0 0 var(--stitch-spacing-md)',
};
const section: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--stitch-spacing-xl)',
  maxWidth: 640,
};
const stack: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--stitch-spacing-md)',
};

const fruit: TabItem[] = [
  {
    key: 'apple',
    label: '苹果',
    children: <p>脆甜多汁，秋季当季；富含膳食纤维。</p>,
  },
  {
    key: 'banana',
    label: '香蕉',
    children: <p>软糯即食，补钾快能量；运动后常见选择。</p>,
  },
  {
    key: 'cherry',
    label: '樱桃',
    children: <p>初夏鲜果，酸甜浓郁；抗氧化物含量高。</p>,
  },
];

function ControlledTabs() {
  const [key, setKey] = useState('banana');
  return (
    <div style={stack}>
      <div
        style={{
          display: 'flex',
          gap: 'var(--stitch-spacing-sm)',
          flexWrap: 'wrap',
        }}
      >
        {fruit.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setKey(f.key)}
            style={{
              padding: 'var(--stitch-spacing-xs) var(--stitch-spacing-md)',
              borderRadius: 'var(--stitch-radius-button)',
              border: 'var(--stitch-border-width) solid var(--stitch-border)',
              background:
                key === f.key
                  ? 'var(--stitch-bg-card)'
                  : 'var(--stitch-bg-elevated)',
              color: 'var(--stitch-text-primary)',
              fontFamily: 'var(--stitch-font-body)',
              cursor: 'pointer',
            }}
          >
            跳到 {f.label}
          </button>
        ))}
      </div>
      <Tabs
        items={fruit}
        activeKey={key}
        onChange={setKey}
        aria-label="受控水果标签"
      />
    </div>
  );
}

export default function TabsDemo() {
  return (
    <div style={section}>
      <div>
        <p style={rowLabel}>非受控 · 默认激活首项</p>
        <Tabs items={fruit} aria-label="水果标签" />
      </div>

      <div>
        <p style={rowLabel}>非受控 · defaultActiveKey 指定初始项</p>
        <Tabs items={fruit} defaultActiveKey="cherry" aria-label="水果标签" />
      </div>

      <div>
        <p style={rowLabel}>受控（activeKey / onChange，外部按钮驱动）</p>
        <ControlledTabs />
      </div>
    </div>
  );
}
