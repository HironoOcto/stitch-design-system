import { useState, type CSSProperties } from 'react';
import {
  ToggleGroup,
  type ToggleGroupItem,
} from '@octohirono/stitch-design-system';

export const meta = {
  title: 'ToggleGroup',
  description:
    '分段切换组：一排相邻拼接的两态按钮，工具栏里最常见的用法是图标项——single 单选（文本对齐 align-left/center/right，值为标量）或 multiple 多选（富文本 bold/italic/underline，值为数组）。组合 Radix ToggleGroup.Root/Item，按下态用 data-state=on 上软 accent 底皮（同 Toolbar 分段选中态；紧凑小圆角、不沾 CTA 青、也非 Tabs 的 ink 药丸），随主题换肤。single→radiogroup/radio、multiple→toolbar/button（ARIA 归 Radix）。与 Toggle（单个按钮）/ Radio（表单单选）/ Tabs（胶囊切面板）/ Toolbar（装它的容器）的边界见 JSDoc。',
};

const section: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--stitch-spacing-xl)',
  maxWidth: 560,
};
const rowLabel: CSSProperties = {
  fontSize: 'var(--stitch-font-size-sm)',
  color: 'var(--stitch-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  margin: '0 0 var(--stitch-spacing-md)',
};
const readout: CSSProperties = {
  fontSize: 'var(--stitch-font-size-sm)',
  color: 'var(--stitch-text-secondary)',
  margin: 'var(--stitch-spacing-md) 0 0',
  fontFamily: 'var(--stitch-font-mono, monospace)',
};
const row: CSSProperties = {
  display: 'flex',
  gap: 'var(--stitch-spacing-lg)',
  alignItems: 'center',
  flexWrap: 'wrap',
};

// 图标优先（照 Radix rich-text 工具栏参考图）：对齐 = 三档对齐图标；格式 = B/I/U。
// 纯图标项（无 label）自动以 value 作可访问名，无障碍不丢。
const ALIGN: ToggleGroupItem[] = [
  { value: 'left', icon: 'align-left' },
  { value: 'center', icon: 'align-center' },
  { value: 'right', icon: 'align-right' },
];
const FORMAT: ToggleGroupItem[] = [
  { value: 'bold', icon: 'bold' },
  { value: 'italic', icon: 'italic' },
  { value: 'underline', icon: 'underline' },
];

export default function ToggleGroupDemo() {
  // single 受控（文本对齐）
  const [align, setAlign] = useState('center');
  // multiple 受控（富文本格式）
  const [format, setFormat] = useState<string[]>(['bold']);

  return (
    <div style={section}>
      <div>
        <p style={rowLabel}>
          single · 文本对齐（单选，非受控 defaultValue，值为标量）
        </p>
        <div style={row}>
          <ToggleGroup
            type="single"
            aria-label="文本对齐（非受控）"
            defaultValue="left"
            items={ALIGN}
          />
        </div>
      </div>

      <div>
        <p style={rowLabel}>
          single · 文本对齐（受控，onChange 回标量；取消选中回空串）
        </p>
        <div style={row}>
          <ToggleGroup
            type="single"
            aria-label="文本对齐（受控）"
            value={align}
            onChange={setAlign}
            items={ALIGN}
          />
        </div>
        <p style={readout}>value = {JSON.stringify(align)}</p>
      </div>

      <div>
        <p style={rowLabel}>
          multiple · 富文本格式（多选，受控，onChange 回数组）
        </p>
        <div style={row}>
          <ToggleGroup
            type="multiple"
            aria-label="富文本格式（受控）"
            value={format}
            onChange={setFormat}
            items={FORMAT}
          />
        </div>
        <p style={readout}>value = {JSON.stringify(format)}</p>
      </div>

      <div>
        <p style={rowLabel}>multiple · 富文本格式（非受控 defaultValue）</p>
        <div style={row}>
          <ToggleGroup
            type="multiple"
            aria-label="富文本格式（非受控）"
            defaultValue={['italic']}
            items={FORMAT}
          />
        </div>
      </div>

      <div>
        <p style={rowLabel}>禁用（整组 / 单项）</p>
        <div style={row}>
          <ToggleGroup
            type="single"
            aria-label="对齐（整组禁用）"
            defaultValue="center"
            disabled
            items={ALIGN}
          />
          <ToggleGroup
            type="single"
            aria-label="对齐（单项禁用）"
            defaultValue="left"
            items={[
              { value: 'left', icon: 'align-left' },
              { value: 'center', icon: 'align-center', disabled: true },
              { value: 'right', icon: 'align-right' },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
