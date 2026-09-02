import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DropdownMenu } from './DropdownMenu';
import styles from './dropdown-menu.module.less';

// 测试重点 = 我们写的那部分：items→Item 映射 + onSelect→onClick + 子菜单 + Less 皮。
// 键盘 / 焦点 / ARIA 归底层（radix），冒烟即可、不重测。
describe('DropdownMenu', () => {
  it('items 渲染成菜单项：每个 label 出现为 menuitem', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu
        trigger={<button>菜单</button>}
        items={[{ label: '个人资料' }, { label: '设置' }]}
      />,
    );
    // 未开：项不在文档
    expect(screen.queryByText('个人资料')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '菜单' }));
    expect(
      screen.getByRole('menuitem', { name: '个人资料' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: '设置' })).toBeInTheDocument();
  });

  it('点项触发 onClick（底层 onSelect 归一成 onClick）', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <DropdownMenu
        trigger={<button>菜单</button>}
        items={[{ label: '退出登录', onClick }]}
      />,
    );
    await user.click(screen.getByRole('button', { name: '菜单' }));
    await user.click(screen.getByRole('menuitem', { name: '退出登录' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('children 非空的项渲染成子菜单入口，展开后显示子项', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu
        trigger={<button>菜单</button>}
        items={[
          {
            label: '分享到',
            children: [{ label: '微信' }, { label: '微博' }],
          },
        ]}
      />,
    );
    await user.click(screen.getByRole('button', { name: '菜单' }));
    // 父项是子菜单入口（role=menuitem，aria-haspopup=menu），子项默认未展开
    const subTrigger = screen.getByRole('menuitem', { name: /分享到/ });
    expect(subTrigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(screen.queryByRole('menuitem', { name: '微信' })).toBeNull();
    // hover / 键盘展开子菜单 → 子项出现
    await user.hover(subTrigger);
    expect(
      await screen.findByRole('menuitem', { name: '微信' }),
    ).toBeInTheDocument();
  });

  it('danger 项挂 danger 类（文字走 --stitch-danger）', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu
        trigger={<button>菜单</button>}
        items={[{ label: '删除', danger: true }]}
      />,
    );
    await user.click(screen.getByRole('button', { name: '菜单' }));
    const item = screen.getByRole('menuitem', { name: '删除' });
    expect(item).toHaveClass(styles.danger);
  });

  it('disabled 项标记为禁用（不可选、底层挂 data-disabled）', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <DropdownMenu
        trigger={<button>菜单</button>}
        items={[{ label: '归档', disabled: true, onClick }]}
      />,
    );
    await user.click(screen.getByRole('button', { name: '菜单' }));
    const item = screen.getByRole('menuitem', { name: '归档' });
    expect(item).toHaveAttribute('data-disabled');
  });

  it('icon 经 <Icon> 渲染为项内图标（非裸 svg）', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu
        trigger={<button>菜单</button>}
        items={[{ label: '搜索', icon: 'search' }]}
      />,
    );
    await user.click(screen.getByRole('button', { name: '菜单' }));
    const item = screen.getByRole('menuitem', { name: /搜索/ });
    expect(item.querySelector(`.${styles.itemIcon}`)).not.toBeNull();
  });

  it('Less 皮 + data-state：菜单面挂 content 类且 data-state=open', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu
        trigger={<button>菜单</button>}
        items={[{ label: '项' }]}
      />,
    );
    await user.click(screen.getByRole('button', { name: '菜单' }));
    const surface = document.querySelector(`.${styles.content}`);
    expect(surface).not.toBeNull();
    expect(surface).toHaveAttribute('data-state', 'open');
  });

  it('className 透传到菜单面（与 content 基础类共存）', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu
        trigger={<button>菜单</button>}
        items={[{ label: '项' }]}
        className="custom-surface"
      />,
    );
    await user.click(screen.getByRole('button', { name: '菜单' }));
    const surface = document.querySelector(`.${styles.content}`);
    expect(surface).toHaveClass('custom-surface');
  });

  it('onOpenChange 在开合时透传回调', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <DropdownMenu
        trigger={<button>菜单</button>}
        items={[{ label: '项' }]}
        onOpenChange={onOpenChange}
      />,
    );
    await user.click(screen.getByRole('button', { name: '菜单' }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });
});
