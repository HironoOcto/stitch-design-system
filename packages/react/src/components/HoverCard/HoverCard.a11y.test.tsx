import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { HoverCard } from './HoverCard';

describe('HoverCard a11y', () => {
  it('默认（关闭）无 axe 违规', async () => {
    const { container } = render(
      <HoverCard trigger={<a href="#u">@lin</a>}>富内容卡</HoverCard>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('展开态（defaultOpen）无 axe 违规', async () => {
    const { baseElement } = render(
      <HoverCard
        trigger={<a href="#u">@lin</a>}
        defaultOpen
        aria-label="用户简介"
      >
        <a href="#profile">查看主页</a>
      </HoverCard>,
    );
    // 卡片经 Portal 渲染到 body，取 baseElement 覆盖。
    // region 关：HoverCard.Content 是普通富内容层（非 dialog、非 landmark、非 menu），孤立渲染缺
    // 页面 landmark 会误报「content should be contained by landmarks」——页面级 best-practice
    // 规则、非 WCAG，与组件本身无障碍无关（真实页面里卡片锚在 app landmark 内）。dialog 系
    // （Popover/Modal）因 dialog 本身豁免故无需此项；同 DropdownMenu/ContextMenu 关 region 先例。
    expect(
      await axe(baseElement, { rules: { region: { enabled: false } } }),
    ).toHaveNoViolations();
  });
});
