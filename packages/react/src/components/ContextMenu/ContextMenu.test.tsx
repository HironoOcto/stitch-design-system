import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContextMenu } from './ContextMenu';
import styles from './context-menu.module.less';

// 测试重点 = 我们写的那部分：右键触发打开 + items→Item 映射 + onSelect→onClick + Less 皮。
// 键盘 / 焦点 / ARIA / 定位归底层（radix），冒烟即可、不重测。
// 右键触发用 fireEvent.contextMenu（底层 Trigger 监听 contextmenu 事件开菜单）。
describe('ContextMenu', () => {
  it('右键目标区打开菜单：items 渲染成 menuitem（新行为）', () => {
    render(
      <ContextMenu items={[{ label: '个人资料' }, { label: '设置' }]}>
        <div>右键这里</div>
      </ContextMenu>,
    );
    // 未右键：项不在文档
    expect(screen.queryByText('个人资料')).not.toBeInTheDocument();
    fireEvent.contextMenu(screen.getByText('右键这里'));
    expect(
      screen.getByRole('menuitem', { name: '个人资料' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: '设置' })).toBeInTheDocument();
  });

  it('点项触发 onClick（底层 onSelect 归一成 onClick，新行为）', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <ContextMenu items={[{ label: '退出登录', onClick }]}>
        <div>右键这里</div>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByText('右键这里'));
    await user.click(screen.getByRole('menuitem', { name: '退出登录' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('children 非空的项渲染成子菜单入口，展开后显示子项', async () => {
    const user = userEvent.setup();
    render(
      <ContextMenu
        items={[
          { label: '分享到', children: [{ label: '微信' }, { label: '微博' }] },
        ]}
      >
        <div>右键这里</div>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByText('右键这里'));
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

  it('danger 项挂 danger 类（文字走 --stitch-danger）', () => {
    render(
      <ContextMenu items={[{ label: '删除', danger: true }]}>
        <div>右键这里</div>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByText('右键这里'));
    expect(screen.getByRole('menuitem', { name: '删除' })).toHaveClass(
      styles.danger,
    );
  });

  it('disabled 项标记为禁用（不可选、底层挂 data-disabled）', () => {
    render(
      <ContextMenu items={[{ label: '归档', disabled: true }]}>
        <div>右键这里</div>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByText('右键这里'));
    expect(screen.getByRole('menuitem', { name: '归档' })).toHaveAttribute(
      'data-disabled',
    );
  });

  it('icon 经 <Icon> 渲染为项内图标（非裸 svg）', () => {
    render(
      <ContextMenu items={[{ label: '搜索', icon: 'search' }]}>
        <div>右键这里</div>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByText('右键这里'));
    const item = screen.getByRole('menuitem', { name: /搜索/ });
    expect(item.querySelector(`.${styles.itemIcon}`)).not.toBeNull();
  });

  it('Less 皮 + data-state：菜单面挂 content 类且 data-state=open', () => {
    render(
      <ContextMenu items={[{ label: '项' }]}>
        <div>右键这里</div>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByText('右键这里'));
    const surface = document.querySelector(`.${styles.content}`);
    expect(surface).not.toBeNull();
    expect(surface).toHaveAttribute('data-state', 'open');
  });

  it('className 透传到菜单面（与 content 基础类共存）', () => {
    render(
      <ContextMenu items={[{ label: '项' }]} className="custom-surface">
        <div>右键这里</div>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByText('右键这里'));
    const surface = document.querySelector(`.${styles.content}`);
    expect(surface).toHaveClass('custom-surface');
  });

  it('onOpenChange 在右键打开时透传回调', () => {
    const onOpenChange = vi.fn();
    render(
      <ContextMenu items={[{ label: '项' }]} onOpenChange={onOpenChange}>
        <div>右键这里</div>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByText('右键这里'));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });
});
