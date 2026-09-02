import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toggle } from './Toggle';

describe('Toggle', () => {
  // 1. 基本渲染 —— 默认未按下（aria-pressed=false）
  it('默认渲染为未按下（aria-pressed=false）', () => {
    render(<Toggle>加粗</Toggle>);
    expect(
      screen.getByRole('button', { name: '加粗', pressed: false }),
    ).toBeInTheDocument();
  });

  // 2. 新行为（测试重点）· 点击翻转 aria-pressed + 应用选中样式（非受控）
  it('点击翻转 aria-pressed 并应用选中样式（非受控）', async () => {
    const user = userEvent.setup();
    render(<Toggle defaultPressed={false}>加粗</Toggle>);
    const btn = screen.getByRole('button', { name: '加粗' });
    expect(btn).toHaveAttribute('aria-pressed', 'false');
    const pressedClass = btn.className.match(/\bpressed\b|_pressed_\w+/);

    await user.click(btn);
    expect(btn).toHaveAttribute('aria-pressed', 'true');
    // 选中样式类挂上（css module 哈希名含 "pressed"）
    expect(btn.className).toMatch(/pressed/);
    expect(pressedClass).toBeNull(); // 翻转前不含选中类

    await user.click(btn);
    expect(btn).toHaveAttribute('aria-pressed', 'false');
  });

  // 3. 新行为 · 受控模式：pressed 由父管，点击不自变、只回调
  it('受控模式：aria-pressed 由 pressed 决定，点击只回调不自变', async () => {
    const user = userEvent.setup();
    const onPressedChange = vi.fn();
    const { rerender } = render(
      <Toggle pressed={false} onPressedChange={onPressedChange}>
        加粗
      </Toggle>,
    );
    const btn = screen.getByRole('button', { name: '加粗' });
    expect(btn).toHaveAttribute('aria-pressed', 'false');

    await user.click(btn);
    // 受控：组件不自持，仍为 false（等父回填）
    expect(btn).toHaveAttribute('aria-pressed', 'false');
    expect(onPressedChange).toHaveBeenCalledWith(true);

    // 父回填后才变
    rerender(
      <Toggle pressed={true} onPressedChange={onPressedChange}>
        加粗
      </Toggle>,
    );
    expect(btn).toHaveAttribute('aria-pressed', 'true');
    expect(btn.className).toMatch(/pressed/);
  });

  // 4. 非受控回调 —— onPressedChange 收到下一态
  it('非受控：onPressedChange 收到翻转后的态', async () => {
    const user = userEvent.setup();
    const onPressedChange = vi.fn();
    render(
      <Toggle defaultPressed={false} onPressedChange={onPressedChange}>
        加粗
      </Toggle>,
    );
    await user.click(screen.getByRole('button', { name: '加粗' }));
    expect(onPressedChange).toHaveBeenCalledWith(true);
  });

  // 5. props 透传 —— 底件 Button 的 type/size/icon/原生属性生效
  it('type / size / 原生属性透传到底件 Button', () => {
    render(
      <Toggle type="text" size="small" data-testid="tg" aria-label="斜体" />,
    );
    const btn = screen.getByRole('button', { name: '斜体' });
    expect(btn).toHaveAttribute('data-testid', 'tg');
  });

  // 6. 键盘可达 —— 可 Tab 聚焦 + Space/Enter 翻转（原生 button 天然）
  it('键盘：可聚焦，Space 翻转 aria-pressed', async () => {
    const user = userEvent.setup();
    render(<Toggle>加粗</Toggle>);
    const btn = screen.getByRole('button', { name: '加粗' });
    btn.focus();
    expect(btn).toHaveFocus();
    await user.keyboard(' ');
    expect(btn).toHaveAttribute('aria-pressed', 'true');
    await user.keyboard('{Enter}');
    expect(btn).toHaveAttribute('aria-pressed', 'false');
  });

  // 7. disabled —— 不翻转、不回调
  it('disabled 时点击不翻转、不回调', async () => {
    const user = userEvent.setup();
    const onPressedChange = vi.fn();
    render(
      <Toggle disabled onPressedChange={onPressedChange}>
        加粗
      </Toggle>,
    );
    const btn = screen.getByRole('button', { name: '加粗' });
    await user.click(btn);
    expect(btn).toHaveAttribute('aria-pressed', 'false');
    expect(onPressedChange).not.toHaveBeenCalled();
  });

  // 用户自定 onClick 仍被调用（透传不吞）
  it('透传的 onClick 在翻转前被调用', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Toggle onClick={onClick} defaultPressed={false}>
        加粗
      </Toggle>,
    );
    await user.click(screen.getByRole('button', { name: '加粗' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  // className 透传（与选中类共存）
  it('className 透传到底件 button', () => {
    render(<Toggle className="my-tg">加粗</Toggle>);
    expect(
      screen.getByRole('button', { name: '加粗' }).closest('.my-tg'),
    ).toBeInTheDocument();
  });
});
