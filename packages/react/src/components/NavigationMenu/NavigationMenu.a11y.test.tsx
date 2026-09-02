import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { NavigationMenu } from './NavigationMenu';

// NavigationMenu.Root 渲染 <nav> landmark（非 menu 系），故无需关 region 规则
// （不同于 DropdownMenu/ContextMenu 的 role="menu" 孤立渲染先例）。
describe('NavigationMenu a11y', () => {
  it('默认（面板关闭）无 axe 违规', async () => {
    const { container } = render(
      <NavigationMenu
        items={[
          { label: '首页', href: '/home', active: true },
          { label: '关于', href: '/about' },
          { label: '产品', content: <a href="/analytics">分析看板</a> },
        ]}
        aria-label="主导航"
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('展开态（面板打开）无 axe 违规', async () => {
    const user = userEvent.setup();
    const { baseElement } = render(
      <NavigationMenu
        items={[
          { label: '首页', href: '/home' },
          {
            label: '产品',
            content: (
              <nav aria-label="产品导航">
                <a href="/analytics">分析看板</a>
                <a href="/reports">报表</a>
              </nav>
            ),
          },
        ]}
        aria-label="主导航"
      />,
    );
    await user.click(screen.getByRole('button', { name: /产品/ }));
    await screen.findByRole('link', { name: '分析看板' });
    expect(await axe(baseElement)).toHaveNoViolations();
  });
});
