import { useState, type CSSProperties } from 'react';
import { Slider } from '@octohirono/stitch-design-system';

export const meta = {
  title: 'Slider',
  description:
    '拖动条：拖 thumb 在 min–max 间按 step 取连续/离散值。单值给标量（一个 thumb）、区间给数组（两个 thumb）；value/defaultValue/onChange + min/max/step + disabled + orientation 双模式。标量↔数组归一在组件内一层完成（对外单值回标量、区间回数组）；键盘（←→ 调值、Home/End）/ 焦点 / ARIA 由底层原语保证。track 走 --stitch-border 底槽、range 走 --stitch-accent、thumb 圆点 + focus 环 --stitch-focus-ring，换肤 seline↔steep 时圆角 / 强调色 / 阴影随之变化。vs Progress：那是只读展示进度、无 thumb 不可拖。',
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
  margin: '0 0 var(--stitch-spacing-lg)',
};
const readout: CSSProperties = {
  fontSize: 'var(--stitch-font-size-sm)',
  color: 'var(--stitch-text-secondary)',
  fontFamily: 'var(--stitch-font-mono)',
};

function SingleControlled() {
  const [value, setValue] = useState<number>(40);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Slider
        value={value}
        onChange={(v) => setValue(v as number)}
        aria-label="音量"
      />
      <span style={readout}>value = {value}</span>
    </div>
  );
}

function RangeControlled() {
  const [range, setRange] = useState<number[]>([20, 60]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Slider
        value={range}
        onChange={(v) => setRange(v as number[])}
        aria-label="价格区间"
      />
      <span style={readout}>range = [{range.join(', ')}]</span>
    </div>
  );
}

export default function SliderDemo() {
  return (
    <div style={section}>
      <div>
        <p style={rowLabel}>单值 · 非受控（defaultValue）</p>
        <Slider defaultValue={30} aria-label="亮度" />
      </div>

      <div>
        <p style={rowLabel}>单值 · 受控（value / onChange）</p>
        <SingleControlled />
      </div>

      <div>
        <p style={rowLabel}>区间 · 受控（数组 = 双 thumb）</p>
        <RangeControlled />
      </div>

      <div>
        <p style={rowLabel}>步长 step=10 · min/max</p>
        <Slider
          defaultValue={50}
          min={0}
          max={100}
          step={10}
          aria-label="评分"
        />
      </div>

      <div>
        <p style={rowLabel}>纵向（orientation="vertical"）· 单值 + 区间</p>
        <div style={{ display: 'flex', gap: 'var(--stitch-spacing-xl)' }}>
          <Slider
            orientation="vertical"
            defaultValue={30}
            aria-label="纵向亮度"
          />
          <Slider
            orientation="vertical"
            defaultValue={[20, 60]}
            aria-label="纵向区间"
          />
        </div>
      </div>

      <div>
        <p style={rowLabel}>禁用</p>
        <Slider defaultValue={40} disabled aria-label="已锁定" />
      </div>
    </div>
  );
}
