import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { ContextMenu } from './ContextMenu';

describe('ContextMenu a11y', () => {
  it('默认（关闭）无 axe 违规', async () => {
    const { container } = render(
      <ContextMenu items={[{ label: '个人资料' }, { label: '设置' }]}>
        <div>右键目标区</div>
      </ContextMenu>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('展开态（右键打开）无 axe 违规', async () => {
    const { baseElement } = render(
      <ContextMenu
        items={[
          { label: '个人资料', icon: 'search' },
          { label: '删除', danger: true },
          { label: '归档', disabled: true },
        ]}
      >
        <div>右键目标区</div>
      </ContextMenu>,
    );
    // ContextMenu 无 defaultOpen（右键触发），用 contextmenu 事件开菜单再测。
    fireEvent.contextMenu(screen.getByText('右键目标区'));
    // 菜单经 Portal 渲染到 body，取 baseElement 覆盖。
    // region 关：菜单面 role="menu"（非 dialog、非 landmark），孤立渲染缺页面 landmark 会误报
    //「content should be contained by landmarks」——页面级 best-practice 规则、非 WCAG，与组件本身
    // 无障碍无关（真实页面里菜单在 app landmark 内）。同 DropdownMenu 先例（menu 系通例）。
    expect(
      await axe(baseElement, { rules: { region: { enabled: false } } }),
    ).toHaveNoViolations();
  });
});
