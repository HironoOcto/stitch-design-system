import { useState, type CSSProperties } from 'react';
import { OtpField } from '@octohirono/stitch-design-system';

export const meta = {
  title: 'OtpField',
  description:
    '一次性验证码分格输入（OTP）：定长的一排单字符输入格，自动跳格、支持整段粘贴分发。按 length 渲染 length 个分格（外加隐藏聚合 input 供表单提交），取整串值：value/defaultValue/onChange（整串）+ disabled + autoFocus。受控/非受控双模式：给 value 由父管、只给 defaultValue 组件自管（均直接透传底层，不自持 state）。每格走 --stitch-radius-input + --stitch-border（focus → --stitch-accent + focus 环 --stitch-focus-ring），与表单控件族对齐，换肤 seline↔steep 时圆角 / 强调色 / 焦点环随之变化。键盘 / 焦点 / 跳格 / 粘贴分发 / ARIA 由底层原语保证。vs Input：那是单框自由文本。vs PasswordInput：那是可明暗切换的密码框。',
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

function Controlled() {
  const [code, setCode] = useState<string>('');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <OtpField
        length={6}
        value={code}
        onChange={setCode}
        aria-label="验证码"
      />
      <span style={readout}>value = &quot;{code}&quot;</span>
    </div>
  );
}

export default function OtpFieldDemo() {
  return (
    <div style={section}>
      <div>
        <p style={rowLabel}>6 位 · 受控（值聚合成整串）</p>
        <Controlled />
      </div>

      <div>
        <p style={rowLabel}>4 位 · 非受控（defaultValue 铺入）</p>
        <OtpField length={4} defaultValue="12" aria-label="4 位验证码" />
      </div>

      <div>
        <p style={rowLabel}>禁用</p>
        <OtpField
          length={6}
          disabled
          defaultValue="123456"
          aria-label="已锁定"
        />
      </div>
    </div>
  );
}
