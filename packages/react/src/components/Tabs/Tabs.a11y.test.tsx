import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Tabs, type TabItem } from './Tabs';

const items: TabItem[] = [
  { key: 'a', label: 'Apple', children: <p>苹果面板内容</p> },
  { key: 'b', label: 'Banana', children: <p>香蕉面板内容</p> },
];

describe('Tabs a11y', () => {
  it('默认态无 axe 违规（含 tablist 可及名）', async () => {
    const { container } = render(<Tabs items={items} aria-label="水果" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('切换激活项后仍无 axe 违规', async () => {
    const { container } = render(
      <Tabs items={items} defaultActiveKey="b" aria-label="水果" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
