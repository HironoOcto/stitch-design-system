import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PasswordInput } from './PasswordInput';

describe('PasswordInput', () => {
  // 1. 基本渲染 —— 默认遮蔽（type=password）+ 明暗切换钮在
  it('默认渲染为 password 且带明暗切换钮', () => {
    render(<PasswordInput defaultValue="secret" aria-label="密码" />);
    expect(screen.getByLabelText('密码')).toHaveAttribute('type', 'password');
    expect(
      screen.getByRole('button', { name: '显示密码' }),
    ).toBeInTheDocument();
  });

  // 2. 新行为（测试重点）· 点眼睛钮 → type 在 password↔text 翻转
  it('点切换钮：type 在 password↔text 翻转', async () => {
    const user = userEvent.setup();
    render(<PasswordInput defaultValue="secret" aria-label="密码" />);
    const field = screen.getByLabelText('密码');
    expect(field).toHaveAttribute('type', 'password');
    await user.click(screen.getByRole('button', { name: '显示密码' }));
    expect(field).toHaveAttribute('type', 'text');
    await user.click(screen.getByRole('button', { name: '隐藏密码' }));
    expect(field).toHaveAttribute('type', 'password');
  });

  // 3. 新行为 · 按钮 aria-label / 图标随状态切换
  it('切换钮的 aria-label 与图标随可见态切换', async () => {
    const user = userEvent.setup();
    render(<PasswordInput defaultValue="x" aria-label="密码" />);
    // 遮蔽态：可访问名「显示密码」、图标 eye
    const toggle = screen.getByRole('button', { name: '显示密码' });
    expect(toggle.querySelector('[data-icon="eye"]')).toBeInTheDocument();
    await user.click(toggle);
    // 可见态：可访问名「隐藏密码」、图标 eye-off
    const toggled = screen.getByRole('button', { name: '隐藏密码' });
    expect(toggled.querySelector('[data-icon="eye-off"]')).toBeInTheDocument();
  });

  // 4. props 透传 —— 尺寸 / 校验态 / 原生属性经底件 Input 生效
  it('size / status / 原生属性透传到底件 Input', () => {
    render(
      <PasswordInput
        defaultValue="x"
        aria-label="密码"
        status="error"
        placeholder="请输入密码"
        data-testid="pwd"
      />,
    );
    const field = screen.getByLabelText('密码');
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(field).toHaveAttribute('placeholder', '请输入密码');
    expect(field).toHaveAttribute('data-testid', 'pwd');
  });

  // 5. 受控 value —— onChange 拿到键入值
  it('onChange 收到键入值（透传底件受控范式）', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PasswordInput aria-label="密码" onChange={onChange} />);
    await user.type(screen.getByLabelText('密码'), 'ab');
    expect(onChange).toHaveBeenCalled();
    expect(screen.getByLabelText('密码')).toHaveValue('ab');
  });

  // 6. 键盘可达 —— 切换钮可 Tab 聚焦 + Enter 触发
  it('键盘：切换钮可聚焦，Enter 翻转可见态', async () => {
    const user = userEvent.setup();
    render(<PasswordInput defaultValue="x" aria-label="密码" />);
    const toggle = screen.getByRole('button', { name: '显示密码' });
    toggle.focus();
    expect(toggle).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.getByLabelText('密码')).toHaveAttribute('type', 'text');
  });

  // 7. visibilityToggle=false —— 不渲染切换钮（恒遮蔽）
  it('visibilityToggle=false 时不渲染切换钮', () => {
    render(
      <PasswordInput
        defaultValue="x"
        aria-label="密码"
        visibilityToggle={false}
      />,
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByLabelText('密码')).toHaveAttribute('type', 'password');
  });

  // 自定义可访问名
  it('showAriaLabel / hideAriaLabel 覆盖默认切换钮可访问名', async () => {
    const user = userEvent.setup();
    render(
      <PasswordInput
        defaultValue="x"
        aria-label="密码"
        showAriaLabel="show pw"
        hideAriaLabel="hide pw"
      />,
    );
    const toggle = screen.getByRole('button', { name: 'show pw' });
    await user.click(toggle);
    expect(screen.getByRole('button', { name: 'hide pw' })).toBeInTheDocument();
  });

  // className 透传
  it('className 透传到底件 wrapper', () => {
    render(
      <PasswordInput defaultValue="x" aria-label="密码" className="my-pwd" />,
    );
    expect(
      screen.getByLabelText('密码').closest('.my-pwd'),
    ).toBeInTheDocument();
  });
});
