import { useState, type CSSProperties } from 'react';
import { PasswordInput } from '@octohirono/stitch-design-system';

export const meta = {
  title: 'PasswordInput',
  description:
    '密码框（Input 的明暗切换变体）：在底件 Input 之上只加「明暗切换」那层——内部持 visible 态，type 在 password↔text 翻转，suffix 塞一个眼睛按钮（走 <Icon> eye↔eye-off，可 Tab 聚焦、Enter/Space 触发），aria-label 随态切换。值 / 边框 / 校验态 / 圆角全复用 Input，随主题换肤变化。visibilityToggle=false 时恒遮蔽。',
};

const section: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--stitch-spacing-xl)',
  maxWidth: 420,
};
const rowLabel: CSSProperties = {
  fontSize: 'var(--stitch-font-size-sm)',
  color: 'var(--stitch-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  margin: '0 0 var(--stitch-spacing-md)',
};

export default function PasswordInputDemo() {
  const [value, setValue] = useState('');
  return (
    <div style={section}>
      <div>
        <p style={rowLabel}>基础（默认遮蔽，点眼睛钮切明暗）</p>
        <PasswordInput
          aria-label="密码"
          placeholder="请输入密码"
          defaultValue="s3cret-pw"
        />
      </div>
      <div>
        <p style={rowLabel}>尺寸（small / middle / large）</p>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--stitch-spacing-md)',
          }}
        >
          <PasswordInput
            size="small"
            aria-label="小号密码"
            placeholder="small"
            defaultValue="small-pw"
          />
          <PasswordInput
            size="middle"
            aria-label="中号密码"
            placeholder="middle"
            defaultValue="middle-pw"
          />
          <PasswordInput
            size="large"
            aria-label="大号密码"
            placeholder="large"
            defaultValue="large-pw"
          />
        </div>
      </div>
      <div>
        <p style={rowLabel}>受控 + 校验态（error / warning）</p>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--stitch-spacing-md)',
          }}
        >
          <PasswordInput
            aria-label="确认密码"
            placeholder="少于 6 位标 error"
            status={value.length > 0 && value.length < 6 ? 'error' : undefined}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <PasswordInput
            aria-label="弱密码提示"
            placeholder="warning 态"
            status="warning"
            defaultValue="weak"
          />
        </div>
      </div>
      <div>
        <p style={rowLabel}>恒遮蔽（visibilityToggle=false）</p>
        <PasswordInput
          aria-label="一次性密码"
          placeholder="无切换钮"
          visibilityToggle={false}
          defaultValue="masked"
        />
      </div>
      <div>
        <p style={rowLabel}>禁用</p>
        <PasswordInput aria-label="禁用密码" defaultValue="disabled" disabled />
      </div>
    </div>
  );
}
