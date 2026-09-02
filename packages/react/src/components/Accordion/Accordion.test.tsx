import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Accordion } from './Accordion';
import type { AccordionItem } from './Accordion';
import styles from './accordion.module.less';

const items: AccordionItem[] = [
  {
    key: 'a',
    header: '问题一',
    children: <span data-testid="body-a">答案一</span>,
  },
  {
    key: 'b',
    header: '问题二',
    children: <span data-testid="body-b">答案二</span>,
  },
  {
    key: 'c',
    header: '问题三',
    children: <span data-testid="body-c">答案三</span>,
  },
];

// 每个披露头是一个 button，可访问名 = header；用它读展开态。
const headBtn = (name: string) => screen.getByRole('button', { name });

describe('Accordion', () => {
  // 1. 基本渲染 —— 每个 item 的 header 与 children 都在 DOM
  it('渲染全部 item 的 header 与 children', () => {
    render(<Accordion items={items} />);
    expect(headBtn('问题一')).toBeInTheDocument();
    expect(headBtn('问题二')).toBeInTheDocument();
    expect(screen.getByTestId('body-a')).toBeInTheDocument();
    expect(screen.getByTestId('body-c')).toBeInTheDocument();
  });

  // 2. props → 状态映射 + a11y 契约（可访问名 = header）
  it('默认全收：每个 button aria-expanded=false，可访问名为对应 header', () => {
    render(<Accordion items={items} />);
    for (const [name] of [['问题一'], ['问题二'], ['问题三']] as const) {
      const btn = headBtn(name);
      expect(btn).toHaveAttribute('aria-expanded', 'false');
      expect(btn).toHaveAccessibleName(name);
    }
  });

  it('defaultValue 命中项初始展开，其余收起', () => {
    render(<Accordion items={items} defaultValue="b" />);
    expect(headBtn('问题一')).toHaveAttribute('aria-expanded', 'false');
    expect(headBtn('问题二')).toHaveAttribute('aria-expanded', 'true');
    expect(headBtn('问题三')).toHaveAttribute('aria-expanded', 'false');
  });

  // 3. 原生属性透传（className / style / data-* 经 ...rest）
  it('透传 className 与 style 到根节点', () => {
    const { container } = render(
      <Accordion items={items} className="my-acc" style={{ marginTop: 6 }} />,
    );
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass('my-acc');
    expect(root).toHaveStyle({ marginTop: '6px' });
    expect(root).toHaveClass(styles.accordion);
  });

  // 4. 交互事件 —— 点击展开并触发 onChange（带展开项 key）
  it('点击一项展开并以其 key 触发 onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Accordion items={items} onChange={onChange} />);
    await user.click(headBtn('问题一'));
    expect(headBtn('问题一')).toHaveAttribute('aria-expanded', 'true');
    expect(onChange).toHaveBeenLastCalledWith('a');
  });

  it('再次点击已展开项则收起，onChange 回 null', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Accordion items={items} onChange={onChange} />);
    await user.click(headBtn('问题一'));
    await user.click(headBtn('问题一'));
    expect(headBtn('问题一')).toHaveAttribute('aria-expanded', 'false');
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  // 5. 禁用/边界态 —— disabled item 不可展开
  it('disabled 的 item 按钮被禁用，点击无效', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const withDisabled: AccordionItem[] = [
      { key: 'a', header: '可用项', children: '内容' },
      { key: 'b', header: '禁用项', children: '内容', disabled: true },
    ];
    render(<Accordion items={withDisabled} onChange={onChange} />);
    const btn = headBtn('禁用项');
    expect(btn).toBeDisabled();
    await user.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    expect(onChange).not.toHaveBeenCalled();
  });

  // 6. 键盘操作 —— 原生 button，Enter/Space 触发切换
  it('键盘 Enter 触发展开切换', async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} />);
    const btn = headBtn('问题一');
    btn.focus();
    await user.keyboard('{Enter}');
    expect(btn).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard(' ');
    expect(btn).toHaveAttribute('aria-expanded', 'false');
  });

  // 7. 新行为 · 互斥单开 —— 同一时刻至多一项展开
  it('展开一项后点另一项：前一项自动收起（互斥单开）', async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} defaultValue="a" />);
    expect(headBtn('问题一')).toHaveAttribute('aria-expanded', 'true');
    await user.click(headBtn('问题二'));
    // 新项展开，旧项自动收——同一时刻至多一项。
    expect(headBtn('问题二')).toHaveAttribute('aria-expanded', 'true');
    expect(headBtn('问题一')).toHaveAttribute('aria-expanded', 'false');
    const expanded = screen
      .getAllByRole('button')
      .filter((b) => b.getAttribute('aria-expanded') === 'true');
    expect(expanded).toHaveLength(1);
  });

  // 双模式 · 非受控 —— 内部自持展开项
  it('非受控：内部自行切换展开项', async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} />);
    await user.click(headBtn('问题三'));
    expect(headBtn('问题三')).toHaveAttribute('aria-expanded', 'true');
  });

  // 双模式 · 受控 —— value 由父级掌控，父不更新则纹丝不动
  it('受控 value：父级不更新时点击不改状态，只回调', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Accordion items={items} value="a" onChange={onChange} />);
    expect(headBtn('问题一')).toHaveAttribute('aria-expanded', 'true');
    await user.click(headBtn('问题二'));
    // 父级 value 固定为 'a'，未回填 → 展开项不变。
    expect(headBtn('问题二')).toHaveAttribute('aria-expanded', 'false');
    expect(headBtn('问题一')).toHaveAttribute('aria-expanded', 'true');
    expect(onChange).toHaveBeenLastCalledWith('b');
  });

  it('受控 value：父级回填后互斥切换', async () => {
    const user = userEvent.setup();
    const Host = () => {
      const [value, setValue] = useState<string | null>('a');
      return <Accordion items={items} value={value} onChange={setValue} />;
    };
    render(<Host />);
    expect(headBtn('问题一')).toHaveAttribute('aria-expanded', 'true');
    await user.click(headBtn('问题二'));
    expect(headBtn('问题二')).toHaveAttribute('aria-expanded', 'true');
    expect(headBtn('问题一')).toHaveAttribute('aria-expanded', 'false');
  });
});
