import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Accordion } from './Accordion';
import type { AccordionItem } from './Accordion';

const items: AccordionItem[] = [
  {
    key: 'return',
    header: '常见问题：如何退货？',
    children: <p>7 天内可无理由退货。</p>,
  },
  {
    key: 'pay',
    header: '支持哪些支付方式？',
    children: (
      <p>
        支持信用卡与转账，详见 <a href="#pay">支付说明</a>。
      </p>
    ),
  },
];

describe('Accordion a11y', () => {
  it('全收态无 axe 违规', async () => {
    const { container } = render(<Accordion items={items} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('展开一项态无 axe 违规', async () => {
    const { container } = render(
      <Accordion items={items} defaultValue="pay" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('含禁用项态无 axe 违规', async () => {
    const { container } = render(
      <Accordion
        items={[
          ...items,
          {
            key: 'soon',
            header: '暂不可用的条目',
            children: '内容',
            disabled: true,
          },
        ]}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
