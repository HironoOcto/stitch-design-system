import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Switch } from '@octohirono/stitch-design-system';

export const meta = {
  title: 'Switch',
  description:
    '开关（Ant Switch 语义）：3 尺寸 + 轨内文案 + disabled / loading + 受控/非受控 + Space/Enter 键切换。ON 态填 accent、药丸/滑块随站点按钮圆角，只读角色变量随换肤变化。',
};

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
const section: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--stitch-spacing-xl)',
};

function ControlledSwitch() {
  const [on, setOn] = useState(false);
  return (
    <div style={row}>
      <Switch checked={on} onChange={setOn} aria-label="受控开关" />
      <span style={{ ...rowLabel, margin: 0 }}>状态：{on ? 'ON' : 'OFF'}</span>
    </div>
  );
}

export default function SwitchDemo() {
  return (
    <div style={section}>
      {/* 尺寸 */}
      <section>
        <p style={rowLabel}>尺寸（size）</p>
        <div style={row}>
          <Switch size="small" defaultChecked aria-label="小号开关" />
          <Switch size="middle" defaultChecked aria-label="中号开关" />
          <Switch size="large" defaultChecked aria-label="大号开关" />
        </div>
      </section>

      {/* 开 / 关 */}
      <section>
        <p style={rowLabel}>开 / 关（default）</p>
        <div style={row}>
          <Switch aria-label="默认关" />
          <Switch defaultChecked aria-label="默认开" />
        </div>
      </section>

      {/* 轨内文案 */}
      <section>
        <p style={rowLabel}>轨内文案（checkedChildren / unCheckedChildren）</p>
        <div style={row}>
          <Switch
            defaultChecked
            checkedChildren="开"
            unCheckedChildren="关"
            aria-label="中文文案开关"
          />
          <Switch
            checkedChildren="ON"
            unCheckedChildren="OFF"
            aria-label="英文文案开关"
          />
        </div>
      </section>

      {/* 禁用 / 加载 */}
      <section>
        <p style={rowLabel}>禁用 / 加载（disabled / loading）</p>
        <div style={row}>
          <Switch disabled aria-label="禁用关" />
          <Switch disabled defaultChecked aria-label="禁用开" />
          <Switch loading aria-label="加载关" />
          <Switch loading defaultChecked aria-label="加载开" />
        </div>
      </section>

      {/* 受控 / 非受控 */}
      <section>
        <p style={rowLabel}>受控 / 非受控</p>
        <div style={row}>
          <Switch defaultChecked aria-label="非受控开关" />
          <ControlledSwitch />
        </div>
      </section>
    </div>
  );
}
