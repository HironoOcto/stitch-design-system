import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Collapse } from './Collapse';
import styles from './collapse.module.less';

describe('Collapse', () => {
  // 1. 基本渲染 —— header 与 children 始终在 DOM
  it('始终渲染 header 与 children 内容', () => {
    render(
      <Collapse header="我的问题">
        <span data-testid="ans">答案内容</span>
      </Collapse>,
    );
    expect(screen.getByText('我的问题')).toBeInTheDocument();
    expect(screen.getByTestId('ans')).toBeInTheDocument();
  });

  // 2. props → 状态映射 + a11y 契约（可访问名 = header）
  it('默认折叠：button aria-expanded=false，可访问名为 header', () => {
    render(<Collapse header="Q">A</Collapse>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    expect(btn).toHaveAccessibleName('Q');
  });

  it('defaultOpen 初始展开', () => {
    render(
      <Collapse header="Q" defaultOpen>
        A
      </Collapse>,
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
  });

  // 3. 原生属性透传（className / style / data-* 经 ...rest）
  it('透传 className 与 style 到根节点', () => {
    const { container } = render(
      <Collapse header="Q" className="my-c" style={{ marginTop: 4 }}>
        A
      </Collapse>,
    );
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass('my-c');
    expect(root).toHaveStyle({ marginTop: '4px' });
    expect(root).toHaveClass(styles.collapse);
  });

  // 4. 交互事件 —— 点击切换 + onOpenChange 回调
  it('点击切换展开状态并触发 onOpenChange', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Collapse header="Q" onOpenChange={onOpenChange}>
        A
      </Collapse>,
    );
    const btn = screen.getByRole('button');
    await user.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'true');
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    await user.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  // 5. 禁用/边界态 —— disabled 阻止切换
  it('disabled 时按钮被禁用，点击无效', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Collapse header="Q" disabled onOpenChange={onOpenChange}>
        A
      </Collapse>,
    );
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    await user.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  // 6. 键盘操作 —— 原生 button，Enter/Space 触发切换
  it('键盘 Enter 触发展开切换', async () => {
    const user = userEvent.setup();
    render(<Collapse header="Q">A</Collapse>);
    const btn = screen.getByRole('button');
    btn.focus();
    await user.keyboard('{Enter}');
    expect(btn).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard(' ');
    expect(btn).toHaveAttribute('aria-expanded', 'false');
  });

  // 7. 受控用法 —— open 由父级掌控，内部不自行改状态
  it('受控 open：内部点击不改状态，只回调；父级更新才切换', async () => {
    const user = userEvent.setup();
    const Host = () => {
      const [open, setOpen] = useState(false);
      return (
        <Collapse header="Q" open={open} onOpenChange={setOpen}>
          A
        </Collapse>
      );
    };
    render(<Host />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    await user.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'true');
  });

  it('受控 open 固定为 true 时，点击不会翻转（父级未更新）', async () => {
    const user = userEvent.setup();
    render(
      <Collapse header="Q" open>
        A
      </Collapse>,
    );
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-expanded', 'true');
    await user.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'true');
  });

  describe('a11y 关联', () => {
    it('header.aria-controls 与 panel.id 双向关联，panel 暴露 region 角色', () => {
      render(<Collapse header="Q">A</Collapse>);
      const btn = screen.getByRole('button');
      const panel = screen.getByRole('region');
      expect(btn.getAttribute('aria-controls')).toBe(panel.id);
      expect(panel.getAttribute('aria-labelledby')).toBe(btn.id);
      expect(panel.id).toMatch(/^stitch-collapse-/);
      expect(panel).toHaveRole('region');
    });
  });
});
