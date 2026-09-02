import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Popover } from './Popover';

describe('Popover a11y', () => {
  it('默认（关闭）无 axe 违规', async () => {
    const { container } = render(
      <Popover trigger={<button>打开</button>}>浮层内容</Popover>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('展开态（defaultOpen）无 axe 违规', async () => {
    const { baseElement } = render(
      <Popover
        trigger={<button>打开</button>}
        defaultOpen
        aria-label="账户菜单"
      >
        <a href="#x">可交互链接</a>
      </Popover>,
    );
    // 浮层经 Portal 渲染到 body，取 baseElement 覆盖
    expect(await axe(baseElement)).toHaveNoViolations();
  });
});
