import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Tabs, type TabItem } from './Tabs';
import styles from './tabs.module.less';

const items: TabItem[] = [
  { key: 'a', label: 'Apple', children: <div data-testid="pane-a">PaneA</div> },
  {
    key: 'b',
    label: 'Banana',
    children: <div data-testid="pane-b">PaneB</div>,
  },
  {
    key: 'c',
    label: 'Cherry',
    children: <div data-testid="pane-c">PaneC</div>,
  },
];

describe('Tabs', () => {
  // 1. 基本渲染 —— 默认渲染首个 tab 的面板
  it('默认渲染第一个 tab 的内容，非激活面板不在 DOM', () => {
    render(<Tabs items={items} />);
    expect(screen.getByTestId('pane-a')).toBeInTheDocument();
    expect(screen.queryByTestId('pane-b')).not.toBeInTheDocument();
  });

  it('defaultActiveKey 设置初始激活项', () => {
    render(<Tabs items={items} defaultActiveKey="b" />);
    expect(screen.getByTestId('pane-b')).toBeInTheDocument();
  });

  // 2. props → class 映射 —— 激活项挂 active 修饰类
  it('激活项添加 active 类，其余不挂', () => {
    render(<Tabs items={items} defaultActiveKey="b" />);
    const active = screen.getByText('Banana').closest('button')!;
    const inactive = screen.getByText('Apple').closest('button')!;
    expect(active).toHaveClass(styles.active);
    expect(inactive).not.toHaveClass(styles.active);
  });

  // 3. 原生属性透传（className / style / data-* 经 ...rest）
  it('透传 className 与 style 到根节点', () => {
    const { container } = render(
      <Tabs items={items} className="my-t" style={{ marginTop: 4 }} />,
    );
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass('my-t');
    expect(root).toHaveClass(styles.tabs);
    expect(root).toHaveStyle({ marginTop: '4px' });
  });

  // 4. 交互事件 —— 点击切换内容并触发 onChange
  it('点击 tab 切换内容并触发 onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Tabs items={items} onChange={onChange} />);
    await user.click(screen.getByText('Banana'));
    expect(onChange).toHaveBeenCalledWith('b');
    expect(screen.getByTestId('pane-b')).toBeInTheDocument();
  });

  // 5. 边界态 —— 受控 activeKey 不自更新（只回调）
  it('受控 activeKey：内部点击只回调、不自行切换', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Tabs items={items} activeKey="a" onChange={onChange} />);
    await user.click(screen.getByText('Banana'));
    expect(onChange).toHaveBeenCalledWith('b');
    expect(screen.getByTestId('pane-a')).toBeInTheDocument();
  });

  // 6. 键盘操作 —— roving：方向键切换 + Home/End
  it('ArrowRight / ArrowLeft 切换 tab 并迁移焦点，两端循环', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Tabs items={items} onChange={onChange} />);
    const tabs = screen.getAllByRole('tab');
    tabs[0].focus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith('b');
    expect(tabs[1]).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(tabs[0]).toHaveFocus();
    // 首项再 ArrowLeft → 循环到末项
    await user.keyboard('{ArrowLeft}');
    expect(tabs[items.length - 1]).toHaveFocus();
  });

  it('Home / End 跳到首尾项', async () => {
    const user = userEvent.setup();
    render(<Tabs items={items} defaultActiveKey="b" />);
    const tabs = screen.getAllByRole('tab');
    tabs[1].focus();
    await user.keyboard('{End}');
    expect(tabs[items.length - 1]).toHaveFocus();
    await user.keyboard('{Home}');
    expect(tabs[0]).toHaveFocus();
  });

  // 7. 受控用法 —— 父级回写驱动 UI 切换
  it('受控：父级回写 activeKey → UI 切换', async () => {
    const user = userEvent.setup();
    const Host = () => {
      const [key, setKey] = useState('a');
      return <Tabs items={items} activeKey={key} onChange={setKey} />;
    };
    render(<Host />);
    await user.click(screen.getByText('Cherry'));
    expect(screen.getByTestId('pane-c')).toBeInTheDocument();
  });

  describe('a11y 关联', () => {
    it('tablist / tab / tabpanel 角色 + aria-selected + 双向关联 + 可访问名', () => {
      render(<Tabs items={items} aria-label="水果" />);
      const tablist = screen.getByRole('tablist');
      expect(tablist).toHaveAttribute('aria-label', '水果');

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(items.length);
      expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
      expect(tabs[1]).toHaveAttribute('aria-selected', 'false');

      const panel = screen.getByRole('tabpanel');
      expect(panel.getAttribute('aria-labelledby')).toBe(tabs[0].id);
      expect(tabs[0].getAttribute('aria-controls')).toBe(panel.id);
      expect(panel.id).toMatch(/^stitch-tabs-/);

      // a11y 契约：tab 的可访问名来自 label 文本
      expect(tabs[0]).toHaveAccessibleName('Apple');
      expect(tabs[2]).toHaveAccessibleName('Cherry');
    });

    it('roving tabindex：仅激活 tab 为 0，其余为 -1', () => {
      render(<Tabs items={items} defaultActiveKey="b" />);
      const tabs = screen.getAllByRole('tab');
      expect(tabs[0]).toHaveAttribute('tabindex', '-1');
      expect(tabs[1]).toHaveAttribute('tabindex', '0');
      expect(tabs[2]).toHaveAttribute('tabindex', '-1');
    });
  });
});
