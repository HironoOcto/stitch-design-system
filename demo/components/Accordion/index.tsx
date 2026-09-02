import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Accordion } from '@octohirono/stitch-design-system';
import type { AccordionItem } from '@octohirono/stitch-design-system';

export const meta = {
  title: 'Accordion',
  description:
    '一组披露块 + 互斥单开（同一时刻至多一项展开）：在底件 Collapse 之上只加容器联动，开合动画 / 无障碍全复用 Collapse。对外取 items 数组（Ant v5 风格），当前展开项走受控 value / 非受控 defaultValue / onChange，只读角色变量随换肤变化。',
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

const faqItems: AccordionItem[] = [
  {
    key: 'return',
    header: '如何退货？',
    children: <p>下单后 7 天内可无理由退货，商品需保持完好。</p>,
  },
  {
    key: 'pay',
    header: '支持哪些支付方式？',
    children: (
      <>
        <p>
          支持信用卡与银行转账，详见 <a href="#pay">支付说明</a>。
        </p>
        <ul>
          <li>信用卡（Visa / Mastercard）</li>
          <li>银行转账</li>
        </ul>
      </>
    ),
  },
  {
    key: 'ship',
    header: '多久发货？',
    children: <p>工作日 24 小时内发货，节假日顺延。</p>,
  },
  {
    key: 'soon',
    header: '该条目暂不可展开',
    children: <p>disabled 项按钮被禁用，不可切换。</p>,
    disabled: true,
  },
];

function ControlledAccordion() {
  const [value, setValue] = useState<string | null>('pay');
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--stitch-spacing-md)',
      }}
    >
      <button
        type="button"
        onClick={() => setValue('return')}
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
        外部展开「如何退货」（当前 {value ?? '全收'}）
      </button>
      <Accordion
        items={faqItems.filter((i) => !i.disabled)}
        value={value}
        onChange={setValue}
      />
    </div>
  );
}

export default function AccordionDemo() {
  return (
    <div style={section}>
      <div>
        <p style={rowLabel}>非受控 · 默认全收（含禁用项）</p>
        <Accordion items={faqItems} />
      </div>

      <div>
        <p style={rowLabel}>非受控 · defaultValue 初始展开一项</p>
        <Accordion
          items={faqItems.filter((i) => !i.disabled)}
          defaultValue="ship"
        />
      </div>

      <div>
        <p style={rowLabel}>受控（value / onChange）· 互斥单开</p>
        <ControlledAccordion />
      </div>
    </div>
  );
}
