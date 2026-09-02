import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Menubar } from './Menubar';

const ITEMS = [
  {
    label: '文件',
    items: [
      { label: '新建', icon: 'search' as const },
      { label: '删除', danger: true },
      { label: '导出', disabled: true },
    ],
  },
  { label: '编辑', items: [{ label: '撤销' }, { label: '重做' }] },
];

describe('Menubar a11y', () => {
  it('默认（菜单未打开）无 axe 违规', async () => {
    const { container } = render(
      <Menubar items={ITEMS} aria-label="主命令栏" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('展开态（打开一个菜单）无 axe 违规', async () => {
    const user = userEvent.setup();
    const { baseElement } = render(
      <Menubar items={ITEMS} aria-label="主命令栏" />,
    );
    await user.click(screen.getByRole('menuitem', { name: '文件' }));
    await screen.findByRole('menuitem', { name: '新建' });
    // 菜单经 Portal 渲染到 body，取 baseElement 覆盖。
    // region 关：菜单面 role="menu"（非 dialog、非 landmark），孤立渲染缺页面 landmark 会误报
    //「content should be contained by landmarks」——页面级 best-practice 规则、非 WCAG，与组件本身
    // 无障碍无关（真实页面里菜单栏在 app landmark 内）。同 DropdownMenu / ContextMenu 先例（menu 系通例）。
    expect(
      await axe(baseElement, { rules: { region: { enabled: false } } }),
    ).toHaveNoViolations();
  });
});
