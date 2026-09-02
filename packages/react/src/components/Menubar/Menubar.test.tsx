import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Menubar } from './Menubar';
import styles from './menubar.module.less';

// 测试重点 = 我们写的那部分：两层 items（MenubarMenu[] → 栏上菜单 + 每菜单 MenubarMenuItem[] →
// 一列动作项）的映射 + onSelect→onClick + Less 皮。顶层菜单打开用 userEvent.click(trigger)。
// 键盘（横向切菜单）/ 焦点 / ARIA / 定位归底层（radix），冒烟即可、不重测。
const FILE_MENU = {
  label: '文件',
  items: [{ label: '新建' }, { label: '打开' }],
};
const EDIT_MENU = {
  label: '编辑',
  items: [{ label: '撤销' }, { label: '重做' }],
};

describe('Menubar', () => {
  it('外层 items 渲染成一排菜单栏按钮（新行为，未打开也在）', () => {
    render(<Menubar items={[FILE_MENU, EDIT_MENU]} />);
    // 顶层菜单 = menubar 上的 menuitem（含 aria-haspopup=menu），不必打开即在栏上。
    expect(screen.getByRole('menuitem', { name: '文件' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: '编辑' })).toBeInTheDocument();
    // 菜单未打开：内层动作项不在文档。
    expect(screen.queryByText('新建')).not.toBeInTheDocument();
  });

  it('打开一个菜单 → 内层 items 渲染成动作项 + 点项触发 onClick（新行为，核心 case）', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Menubar
        items={[
          { label: '文件', items: [{ label: '保存', onClick }] },
          EDIT_MENU,
        ]}
      />,
    );
    // 打开「文件」菜单，内层项才出现。
    await user.click(screen.getByRole('menuitem', { name: '文件' }));
    const save = await screen.findByRole('menuitem', { name: '保存' });
    expect(save).toBeInTheDocument();
    // 点项：底层 onSelect 归一成我们的 onClick。
    await user.click(save);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('悬停顶层菜单即展开（hover 即开，无需点击，新行为；openDelay=0 去时序）', async () => {
    render(<Menubar openDelay={0} items={[FILE_MENU, EDIT_MENU]} />);
    const file = screen.getByRole('menuitem', { name: '文件' });
    // 未悬停：内层项不在文档
    expect(screen.queryByText('新建')).not.toBeInTheDocument();
    // 悬停 → 延时后自动展开（无需点击）
    fireEvent.pointerEnter(file);
    expect(
      await screen.findByRole('menuitem', { name: '新建' }),
    ).toBeInTheDocument();
  });

  it('悬停后离开整条菜单栏 → 不展开（撤销延时挂在 Root、离开单个按钮不撤销，防误触）', async () => {
    render(<Menubar openDelay={30} items={[FILE_MENU]} />);
    const file = screen.getByRole('menuitem', { name: '文件' });
    const bar = screen.getByRole('menubar');
    fireEvent.pointerEnter(file);
    fireEvent.pointerLeave(bar); // 离开整条栏 → 撤销首个开菜单的延时
    await new Promise((r) => setTimeout(r, 60));
    expect(screen.queryByText('新建')).not.toBeInTheDocument();
  });

  it('延时内在栏内移到相邻按钮 → 重新计时、开最终停留的那个（不会误开途经的）', async () => {
    render(<Menubar openDelay={0} items={[FILE_MENU, EDIT_MENU]} />);
    const file = screen.getByRole('menuitem', { name: '文件' });
    const edit = screen.getByRole('menuitem', { name: '编辑' });
    // 进「文件」起计时 → 未到点就移到「编辑」→ 取消「文件」的计时、重新计到「编辑」→ 开「编辑」。
    fireEvent.pointerEnter(file);
    fireEvent.pointerEnter(edit);
    expect(
      await screen.findByRole('menuitem', { name: '撤销' }),
    ).toBeInTheDocument();
  });

  it('内层某项 children 非空 → 渲染成可展开子菜单入口', async () => {
    const user = userEvent.setup();
    render(
      <Menubar
        items={[
          {
            label: '文件',
            items: [
              {
                label: '最近打开',
                children: [{ label: 'a.txt' }, { label: 'b.txt' }],
              },
            ],
          },
        ]}
      />,
    );
    await user.click(screen.getByRole('menuitem', { name: '文件' }));
    const subTrigger = await screen.findByRole('menuitem', {
      name: /最近打开/,
    });
    expect(subTrigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(screen.queryByRole('menuitem', { name: 'a.txt' })).toBeNull();
    await user.hover(subTrigger);
    expect(
      await screen.findByRole('menuitem', { name: 'a.txt' }),
    ).toBeInTheDocument();
  });

  it('danger 项挂 danger 类（文字走 --stitch-danger）', async () => {
    const user = userEvent.setup();
    render(
      <Menubar
        items={[{ label: '文件', items: [{ label: '删除', danger: true }] }]}
      />,
    );
    await user.click(screen.getByRole('menuitem', { name: '文件' }));
    expect(await screen.findByRole('menuitem', { name: '删除' })).toHaveClass(
      styles.danger,
    );
  });

  it('disabled 项标记为禁用（底层挂 data-disabled）', async () => {
    const user = userEvent.setup();
    render(
      <Menubar
        items={[{ label: '文件', items: [{ label: '导出', disabled: true }] }]}
      />,
    );
    await user.click(screen.getByRole('menuitem', { name: '文件' }));
    expect(
      await screen.findByRole('menuitem', { name: '导出' }),
    ).toHaveAttribute('data-disabled');
  });

  it('icon 经 <Icon> 渲染为项内图标（非裸 svg）', async () => {
    const user = userEvent.setup();
    render(
      <Menubar
        items={[{ label: '文件', items: [{ label: '搜索', icon: 'search' }] }]}
      />,
    );
    await user.click(screen.getByRole('menuitem', { name: '文件' }));
    const item = await screen.findByRole('menuitem', { name: /搜索/ });
    expect(item.querySelector(`.${styles.itemIcon}`)).not.toBeNull();
  });

  it('Less 皮 + data-state：打开的菜单面挂 content 类且 data-state=open', async () => {
    const user = userEvent.setup();
    render(<Menubar items={[FILE_MENU]} />);
    await user.click(screen.getByRole('menuitem', { name: '文件' }));
    await screen.findByRole('menuitem', { name: '新建' });
    const surface = document.querySelector(`.${styles.content}`);
    expect(surface).not.toBeNull();
    expect(surface).toHaveAttribute('data-state', 'open');
  });

  it('顶层菜单按钮挂 trigger 类 + 打开态 data-state=open', async () => {
    const user = userEvent.setup();
    render(<Menubar items={[FILE_MENU]} />);
    const trigger = screen.getByRole('menuitem', { name: '文件' });
    expect(trigger).toHaveClass(styles.trigger);
    await user.click(trigger);
    await screen.findByRole('menuitem', { name: '新建' });
    expect(trigger).toHaveAttribute('data-state', 'open');
  });

  it('className 透传到菜单栏根（与 root 基础类共存）', () => {
    render(<Menubar items={[FILE_MENU]} className="custom-bar" />);
    const bar = screen.getByRole('menubar');
    expect(bar).toHaveClass(styles.root);
    expect(bar).toHaveClass('custom-bar');
  });
});
