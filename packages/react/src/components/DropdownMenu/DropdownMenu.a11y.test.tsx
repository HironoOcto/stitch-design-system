import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { DropdownMenu } from './DropdownMenu';

describe('DropdownMenu a11y', () => {
  it('默认（关闭）无 axe 违规', async () => {
    const { container } = render(
      <DropdownMenu
        trigger={<button>菜单</button>}
        items={[{ label: '个人资料' }, { label: '设置' }]}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('展开态（defaultOpen）无 axe 违规', async () => {
    const { baseElement } = render(
      <DropdownMenu
        defaultOpen
        trigger={<button>菜单</button>}
        items={[
          { label: '个人资料', icon: 'search' },
          { label: '删除', danger: true },
          { label: '归档', disabled: true },
        ]}
      />,
    );
    // 菜单经 Portal 渲染到 body，取 baseElement 覆盖。
    // region 关：菜单面 role="menu"（非 dialog、非 landmark），孤立渲染缺页面 landmark 会误报
    //「content should be contained by landmarks」——这是页面级 best-practice 规则、非 WCAG，
    // 与组件本身无障碍无关（真实页面里菜单在 app landmark 内）。dialog 系（Popover/Modal）因 dialog
    // 本身豁免故无需此项；menu 系是本批首例，记 预建笔记.md。
    expect(
      await axe(baseElement, { rules: { region: { enabled: false } } }),
    ).toHaveNoViolations();
  });
});
