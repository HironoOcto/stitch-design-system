import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Collapse } from './Collapse';

describe('Collapse a11y', () => {
  it('折叠态无 axe 违规', async () => {
    const { container } = render(
      <Collapse header="常见问题：如何退货？">
        <p>7 天内可无理由退货。</p>
      </Collapse>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('展开态无 axe 违规（含面板内链接/列表）', async () => {
    const { container } = render(
      <Collapse header="支持哪些支付方式？" defaultOpen>
        <p>
          支持信用卡与转账，详见 <a href="#pay">支付说明</a>。
        </p>
        <ul>
          <li>信用卡</li>
          <li>银行转账</li>
        </ul>
      </Collapse>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('禁用态无 axe 违规', async () => {
    const { container } = render(
      <Collapse header="暂不可用的条目" disabled>
        内容
      </Collapse>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
