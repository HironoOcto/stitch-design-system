import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Collapse } from '@octohirono/stitch-design-system';

export const meta = {
  title: 'Collapse',
  description:
    '单项披露件（Ant Collapse.Panel 语义）：header 触发 + 面板内容，受控 open / 非受控 defaultOpen / onOpenChange / disabled。源 animal 的圆形强调徽章 + `+`/`−` 字符 + 叶片装饰全丢，改为中立 chevron <Icon>（展开旋转），只读角色变量随换肤变化。',
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

function ControlledCollapse() {
  const [open, setOpen] = useState(true);
  return (
    <div style={stack}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          alignSelf: 'flex-start',
          padding: 'var(--stitch-spacing-sm) var(--stitch-spacing-lg)',
          borderRadius: 'var(--stitch-radius-button)',
          border: 'var(--stitch-border-width) solid var(--stitch-border)',
          background: 'var(--stitch-bg-card)',
          color: 'var(--stitch-text-primary)',
          fontFamily: 'var(--stitch-font-body)',
          cursor: 'pointer',
        }}
      >
        外部切换（当前 {open ? '展开' : '折叠'}）
      </button>
      <Collapse
        header="受控项：状态由上方按钮掌控"
        open={open}
        onOpenChange={setOpen}
      >
        <p>open 由父级 state 驱动；点击头部只回调、不自行改状态。</p>
      </Collapse>
    </div>
  );
}

export default function CollapseDemo() {
  return (
    <div style={section}>
      <div>
        <p style={rowLabel}>非受控 · 默认折叠 / 默认展开</p>
        <div style={stack}>
          <Collapse header="如何退货？">
            <p>下单后 7 天内可无理由退货，商品需保持完好。</p>
          </Collapse>
          <Collapse header="支持哪些支付方式？" defaultOpen>
            <p>
              支持信用卡与银行转账，详见 <a href="#pay">支付说明</a>。
            </p>
            <ul>
              <li>信用卡（Visa / Mastercard）</li>
              <li>银行转账</li>
            </ul>
          </Collapse>
        </div>
      </div>

      <div>
        <p style={rowLabel}>禁用</p>
        <Collapse header="该条目暂不可展开" disabled>
          <p>disabled 时按钮被禁用，不可切换。</p>
        </Collapse>
      </div>

      <div>
        <p style={rowLabel}>受控（open / onOpenChange）</p>
        <ControlledCollapse />
      </div>
    </div>
  );
}
