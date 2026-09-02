import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HoverCard } from './HoverCard';
import styles from './hover-card.module.less';

// 测试重点 = 我们写的那部分：props 透传 + Less 皮 + data-state 选态 + 新行为（hover 延时弹出）。
// 键盘 / 焦点 / ARIA / 延时时序归底层（radix），冒烟即可、不重测。
describe('HoverCard', () => {
  it('trigger 渲染为触发器，卡片默认不在文档中', () => {
    render(<HoverCard trigger={<a href="#u">@lin</a>}>富内容卡</HoverCard>);
    expect(screen.getByRole('link', { name: '@lin' })).toBeInTheDocument();
    expect(screen.queryByText('富内容卡')).not.toBeInTheDocument();
  });

  it('新行为：hover 触发弹出富内容卡（openDelay=0 去时序，渲染 children）', async () => {
    const user = userEvent.setup();
    render(
      <HoverCard openDelay={0} trigger={<a href="#u">@lin</a>}>
        <a href="#profile">查看主页</a>
      </HoverCard>,
    );
    await user.hover(screen.getByRole('link', { name: '@lin' }));
    expect(
      await screen.findByRole('link', { name: '查看主页' }),
    ).toBeInTheDocument();
  });

  it('Less 皮 + data-state 选态：卡面挂 content 类且 data-state=open（受控透传底层）', () => {
    render(
      <HoverCard open trigger={<a href="#u">@lin</a>}>
        富内容
      </HoverCard>,
    );
    const surface = document.querySelector(`.${styles.content}`);
    expect(surface).not.toBeNull();
    // data-state 是底层自动挂的（.less 靠它选开合态），核准其确实为 open
    expect(surface).toHaveAttribute('data-state', 'open');
  });

  it('onOpenChange 在开合时透传回调', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <HoverCard
        openDelay={0}
        onOpenChange={onOpenChange}
        trigger={<a href="#u">@lin</a>}
      >
        富内容
      </HoverCard>,
    );
    await user.hover(screen.getByRole('link', { name: '@lin' }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('className 透传到卡面（与 content 基础类共存）', () => {
    render(
      <HoverCard
        open
        className="custom-surface"
        trigger={<a href="#u">@lin</a>}
      >
        富内容
      </HoverCard>,
    );
    const surface = document.querySelector(`.${styles.content}`);
    expect(surface).toHaveClass('custom-surface');
  });
});
