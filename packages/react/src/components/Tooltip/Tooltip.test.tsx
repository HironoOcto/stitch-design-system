import { describe, it, expect, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tooltip } from './Tooltip';
import styles from './tooltip.module.less';

describe('Tooltip', () => {
  it('默认隐藏：role="tooltip" 存在但 aria-hidden=true', () => {
    render(
      <Tooltip title="hi">
        <button>btn</button>
      </Tooltip>,
    );
    const tip = screen.getByRole('tooltip', { hidden: true });
    expect(tip).toHaveAttribute('aria-hidden', 'true');
    expect(tip).not.toHaveClass(styles.visible!);
    expect(tip).toHaveRole('tooltip');
  });

  it('hover 触发显示，离开后（100ms 防抖）隐藏', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip title="hi" trigger="hover">
        <button>btn</button>
      </Tooltip>,
    );
    const trigger = screen.getByText('btn');
    const tip = screen.getByRole('tooltip', { hidden: true });
    await user.hover(trigger);
    expect(tip).toHaveClass(styles.visible!);
    expect(tip).toHaveAttribute('aria-hidden', 'false');
    await user.unhover(trigger);
    await act(async () => {
      await new Promise((r) => setTimeout(r, 150));
    });
    expect(tip).not.toHaveClass(styles.visible!);
  });

  it('focus 触发显示（键盘 Tab 可达）', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip title="hi" trigger="focus">
        <button>btn</button>
      </Tooltip>,
    );
    await user.tab();
    const tip = screen.getByRole('tooltip', { hidden: true });
    expect(tip).toHaveClass(styles.visible!);
  });

  it('click 触发：再次点击关闭', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip title="hi" trigger="click">
        <button>btn</button>
      </Tooltip>,
    );
    const trigger = screen.getByText('btn');
    const tip = screen.getByRole('tooltip', { hidden: true });
    await user.click(trigger);
    expect(tip).toHaveClass(styles.visible!);
    await user.click(trigger);
    expect(tip).not.toHaveClass(styles.visible!);
  });

  it('placement 类按位置应用', () => {
    render(
      <Tooltip title="hi" placement="bottom-start">
        <button>btn</button>
      </Tooltip>,
    );
    expect(screen.getByRole('tooltip', { hidden: true })).toHaveClass(
      styles.bottom_start!,
    );
  });

  it('className / style 透传到包裹层', () => {
    render(
      <Tooltip title="hi" className="my-tip" style={{ marginTop: 8 }}>
        <button>btn</button>
      </Tooltip>,
    );
    const wrapper = document.querySelector('.my-tip') as HTMLElement;
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveStyle({ marginTop: '8px' });
  });

  it('保留子元素自身的事件处理器', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Tooltip title="hi" trigger="click">
        <button onClick={onClick}>btn</button>
      </Tooltip>,
    );
    await user.click(screen.getByText('btn'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  describe('受控 / 非受控', () => {
    it('defaultOpen 初始显示（非受控）', () => {
      render(
        <Tooltip title="hi" defaultOpen>
          <button>btn</button>
        </Tooltip>,
      );
      expect(screen.getByRole('tooltip', { hidden: true })).toHaveClass(
        styles.visible!,
      );
    });

    it('受控 open：显隐由 prop 决定，内部不改状态但 onOpenChange 回调', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      const { rerender } = render(
        <Tooltip
          title="hi"
          trigger="click"
          open={false}
          onOpenChange={onOpenChange}
        >
          <button>btn</button>
        </Tooltip>,
      );
      const trigger = screen.getByText('btn');
      const tip = screen.getByRole('tooltip', { hidden: true });
      await user.click(trigger);
      // 受控：内部不翻转，仍隐藏
      expect(tip).not.toHaveClass(styles.visible!);
      // 回调收到期望的下一个值
      expect(onOpenChange).toHaveBeenCalledWith(true);
      // 外部把 open 提上来才显示
      rerender(
        <Tooltip title="hi" trigger="click" open onOpenChange={onOpenChange}>
          <button>btn</button>
        </Tooltip>,
      );
      expect(tip).toHaveClass(styles.visible!);
    });
  });

  describe('a11y', () => {
    it('显示时 trigger.aria-describedby 指向 tooltip.id', async () => {
      const user = userEvent.setup();
      render(
        <Tooltip title="hi" trigger="click">
          <button>btn</button>
        </Tooltip>,
      );
      const trigger = screen.getByText('btn');
      const tip = screen.getByRole('tooltip', { hidden: true });
      expect(trigger).not.toHaveAttribute('aria-describedby');
      await user.click(trigger);
      expect(trigger.getAttribute('aria-describedby')).toBe(tip.id);
      expect(tip.id).toMatch(/^stitch-tooltip-/);
      expect(trigger).toHaveAccessibleDescription('hi');
    });

    it('隐藏时 trigger 不带 tooltip id（保留子元素原值）', async () => {
      const user = userEvent.setup();
      render(
        <Tooltip title="hi" trigger="click">
          <button aria-describedby="ext-help">btn</button>
        </Tooltip>,
      );
      const trigger = screen.getByText('btn');
      // 隐藏：仅保留外部值
      expect(trigger.getAttribute('aria-describedby')).toBe('ext-help');
      // 显示：拼接外部值与 tooltip id
      await user.click(trigger);
      const tip = screen.getByRole('tooltip', { hidden: true });
      expect(trigger.getAttribute('aria-describedby')).toBe(
        `ext-help ${tip.id}`,
      );
    });
  });
});
