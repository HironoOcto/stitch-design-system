import { useState, type CSSProperties } from 'react';
import { Toggle, Icon } from '@octohirono/stitch-design-system';

export const meta = {
  title: 'Toggle',
  description:
    '两态按钮（Button 的按下态变体）：在底件 Button 之上只加「按下态」那层——内部持 pressed 态（受控 pressed / 非受控 defaultPressed / onPressedChange），渲染 aria-pressed + accent 选中样式，点击翻转；原生 button 天然 Space/Enter 触发。尺寸/图标/type 皮全复用 Button，随主题换肤变化。与 Switch（role=switch 改设置/状态）的边界见 JSDoc：工具栏里「可按住的操作按钮」用 Toggle。',
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
  margin: '0 0 var(--stitch-spacing-md)',
};
const row: CSSProperties = {
  display: 'flex',
  gap: 'var(--stitch-spacing-md)',
  alignItems: 'center',
  flexWrap: 'wrap',
};

export default function ToggleDemo() {
  const [bold, setBold] = useState(true);
  const [italic, setItalic] = useState(false);

  return (
    <div style={section}>
      <div>
        <p style={rowLabel}>基础（非受控，defaultPressed，点击翻转按下态）</p>
        <div style={row}>
          <Toggle defaultPressed={false}>加粗</Toggle>
          <Toggle defaultPressed>斜体（默认按下）</Toggle>
        </div>
      </div>

      <div>
        <p style={rowLabel}>受控（pressed 由父管，onPressedChange 回填）</p>
        <div style={row}>
          <Toggle
            pressed={bold}
            onPressedChange={setBold}
            icon={<Icon name="check" size={16} />}
          >
            加粗 {bold ? 'ON' : 'OFF'}
          </Toggle>
          <Toggle pressed={italic} onPressedChange={setItalic}>
            斜体 {italic ? 'ON' : 'OFF'}
          </Toggle>
        </div>
      </div>

      <div>
        <p style={rowLabel}>纯图标（工具栏场景，type=text，传 aria-label）</p>
        <div style={row}>
          <Toggle
            type="text"
            aria-label="加粗"
            icon={<Icon name="check" size={18} />}
          />
          <Toggle
            type="text"
            aria-label="标记完成"
            defaultPressed
            icon={<Icon name="success" size={18} />}
          />
        </div>
      </div>

      <div>
        <p style={rowLabel}>尺寸（small / middle / large）</p>
        <div style={row}>
          <Toggle size="small">small</Toggle>
          <Toggle size="middle" defaultPressed>
            middle
          </Toggle>
          <Toggle size="large">large</Toggle>
        </div>
      </div>

      <div>
        <p style={rowLabel}>type 底皮复用（default / dashed / ghost）</p>
        <div style={row}>
          <Toggle type="default" defaultPressed>
            default
          </Toggle>
          <Toggle type="dashed">dashed</Toggle>
          <Toggle type="primary" ghost defaultPressed>
            ghost
          </Toggle>
        </div>
      </div>

      <div>
        <p style={rowLabel}>禁用（未按下 / 已按下）</p>
        <div style={row}>
          <Toggle disabled>禁用</Toggle>
          <Toggle disabled defaultPressed>
            禁用（按下）
          </Toggle>
        </div>
      </div>
    </div>
  );
}
