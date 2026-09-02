import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NavigationMenu } from './NavigationMenu';
import styles from './navigation-menu.module.less';

// 测试重点 = 我们写的那部分：items → Link（纯链接项）/ Trigger+Content（带面板项）分支
// + Less 皮 + data-state 选态。键盘 / 焦点 / ARIA / 定位归底层（radix），冒烟即可、不重测。
describe('NavigationMenu', () => {
  it('纯链接项（href 无 content）渲染成 <a>，href 透传、挂 link 皮（新行为）', () => {
    render(
      <NavigationMenu
        items={[{ label: '首页', href: '/home' }]}
        aria-label="主导航"
      />,
    );
    const link = screen.getByRole('link', { name: '首页' });
    expect(link).toHaveAttribute('href', '/home');
    expect(link).toHaveClass(styles.link);
  });

  it('带面板项（有 content）渲染成 Trigger 按钮，点击展开面板（新行为）', async () => {
    const user = userEvent.setup();
    render(
      <NavigationMenu
        items={[
          {
            label: '产品',
            content: <a href="/analytics">分析看板</a>,
          },
        ]}
        aria-label="主导航"
      />,
    );
    // Trigger 是按钮（非链接），面板内容默认未展开。
    const trigger = screen.getByRole('button', { name: /产品/ });
    expect(trigger).toHaveAttribute('data-state', 'closed');
    expect(screen.queryByRole('link', { name: '分析看板' })).toBeNull();
    // 点击 Trigger 展开面板 → 面板内容出现，Trigger data-state=open。
    await user.click(trigger);
    expect(
      await screen.findByRole('link', { name: '分析看板' }),
    ).toBeInTheDocument();
    expect(trigger).toHaveAttribute('data-state', 'open');
  });

  it('active 链接项挂 data-active + aria-current=page（当前项，新行为）', () => {
    render(
      <NavigationMenu
        items={[
          { label: '首页', href: '/home', active: true },
          { label: '关于', href: '/about' },
        ]}
        aria-label="主导航"
      />,
    );
    const current = screen.getByRole('link', { name: '首页' });
    expect(current).toHaveAttribute('data-active');
    expect(current).toHaveAttribute('aria-current', 'page');
    // 非当前项无这些标记
    const other = screen.getByRole('link', { name: '关于' });
    expect(other).not.toHaveAttribute('data-active');
    expect(other).not.toHaveAttribute('aria-current');
  });

  it('items 混排：纯链接项与带面板项各按分支渲染', () => {
    render(
      <NavigationMenu
        items={[
          { label: '首页', href: '/home' },
          { label: '产品', content: <div>面板</div> },
        ]}
        aria-label="主导航"
      />,
    );
    // 纯链接 → <a>；带面板 → <button>
    expect(screen.getByRole('link', { name: '首页' })).toHaveClass(styles.link);
    expect(screen.getByRole('button', { name: /产品/ })).toHaveClass(
      styles.trigger,
    );
  });

  it('Less 皮 + data-state：面板展开后停靠区挂 viewport 类且 data-state=open', async () => {
    const user = userEvent.setup();
    render(
      <NavigationMenu
        items={[{ label: '产品', content: <div>面板内容</div> }]}
        aria-label="主导航"
      />,
    );
    await user.click(screen.getByRole('button', { name: /产品/ }));
    const viewport = document.querySelector(`.${styles.viewport}`);
    expect(viewport).not.toBeNull();
    expect(viewport).toHaveAttribute('data-state', 'open');
    // 单个面板挂 content 类
    expect(document.querySelector(`.${styles.content}`)).not.toBeNull();
  });

  it('className 透传到根 <nav>（与 root 基础类共存）', () => {
    render(
      <NavigationMenu
        items={[{ label: '首页', href: '/home' }]}
        className="custom-nav"
        aria-label="主导航"
      />,
    );
    const nav = screen.getByRole('navigation', { name: '主导航' });
    expect(nav).toHaveClass(styles.root);
    expect(nav).toHaveClass('custom-nav');
  });

  it('onValueChange 在面板展开时透传回调（底层 onValueChange 同名直传）', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <NavigationMenu
        items={[{ label: '产品', content: <div>面板</div> }]}
        onValueChange={onValueChange}
        aria-label="主导航"
      />,
    );
    await user.click(screen.getByRole('button', { name: /产品/ }));
    // 展开某项 → 回调收到非空 value（该项 value）
    expect(onValueChange).toHaveBeenCalled();
    expect(onValueChange.mock.calls.at(-1)?.[0]).toBeTruthy();
  });
});
