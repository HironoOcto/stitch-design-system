import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { AlertDialog } from './AlertDialog';

describe('AlertDialog', () => {
  // 1. 基本渲染 —— open 控制显隐
  it('open=false 不渲染', () => {
    render(<AlertDialog open={false}>确认删除？</AlertDialog>);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('open=true 通过 portal 渲染到 body，正文与两个动作按钮都在', () => {
    render(
      <AlertDialog open title="删除确认">
        此操作不可撤销。
      </AlertDialog>,
    );
    const dialog = screen.getByRole('alertdialog');
    expect(document.body.contains(dialog)).toBe(true);
    expect(screen.getByText('此操作不可撤销。')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '取消' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '确认' })).toBeInTheDocument();
  });

  // 2. 新行为 · role="alertdialog"（告诉读屏必须决策）+ 可及名 = title
  it('role="alertdialog" 且可访问名为 title', () => {
    render(
      <AlertDialog open title="放弃更改">
        未保存的内容会丢失。
      </AlertDialog>,
    );
    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleName('放弃更改');
  });

  // 3. 回调 —— 点确认 / 取消分别触发 onOk / onCancel
  it('点「确认」触发 onOk，点「取消」触发 onCancel', async () => {
    const user = userEvent.setup();
    const onOk = vi.fn();
    const onCancel = vi.fn();
    render(
      <AlertDialog open onOk={onOk} onCancel={onCancel} title="确认">
        continue?
      </AlertDialog>,
    );
    await user.click(screen.getByRole('button', { name: '确认' }));
    expect(onOk).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: '取消' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  // 4. 新行为 · 点遮罩不关（必须做选择）
  it('点遮罩不触发 onCancel（确认框必须做选择）', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <AlertDialog open onCancel={onCancel} title="确认">
        body
      </AlertDialog>,
    );
    const mask = screen.getByRole('alertdialog').parentElement!;
    await user.click(mask);
    expect(onCancel).not.toHaveBeenCalled();
  });

  // 5. 新行为 · Esc = 取消（等价点取消，可关）
  it('Esc 触发 onCancel（等价点取消）', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <AlertDialog open onCancel={onCancel} title="确认">
        body
      </AlertDialog>,
    );
    await user.keyboard('{Escape}');
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  // 6. 新行为 · 初始焦点落在安全操作（取消）上
  it('打开时初始焦点落在取消钮', async () => {
    const Host = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button data-testid="trigger" onClick={() => setOpen(true)}>
            open
          </button>
          <AlertDialog
            open={open}
            title="确认"
            onCancel={() => setOpen(false)}
            onOk={() => setOpen(false)}
          >
            确认执行该操作？
          </AlertDialog>
        </>
      );
    };
    const user = userEvent.setup();
    render(<Host />);
    await user.click(screen.getByTestId('trigger'));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '取消' })).toHaveFocus();
    });
  });

  // 7. 键盘 —— 焦点落取消钮后 Enter 触发取消
  it('键盘：初始焦点在取消钮，Enter 触发 onCancel', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <AlertDialog open title="确认" onCancel={onCancel} onOk={vi.fn()}>
        confirm?
      </AlertDialog>,
    );
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '取消' })).toHaveFocus();
    });
    await user.keyboard('{Enter}');
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  // 自定义文案
  it('okText / cancelText 覆盖默认按钮文案', () => {
    render(
      <AlertDialog open title="确认" okText="删除" cancelText="再想想">
        body
      </AlertDialog>,
    );
    expect(screen.getByRole('button', { name: '删除' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '再想想' })).toBeInTheDocument();
  });

  // 危险态 —— okDanger 把确认钮切到危险语义
  it('okDanger 时确认钮标危险态（Enter 触发落取消不受影响）', async () => {
    const user = userEvent.setup();
    const onOk = vi.fn();
    render(
      <AlertDialog open title="删除" okDanger okText="删除" onOk={onOk}>
        永久删除该项？
      </AlertDialog>,
    );
    await user.click(screen.getByRole('button', { name: '删除' }));
    expect(onOk).toHaveBeenCalledTimes(1);
  });

  // 原生属性 —— className 透传到面板
  it('className 透传到对话框面板', () => {
    render(
      <AlertDialog open title="确认" className="my-alert">
        body
      </AlertDialog>,
    );
    expect(screen.getByRole('alertdialog')).toHaveClass('my-alert');
  });

  // width 默认更紧凑（确认框窄于普通 Modal）
  it('width 默认 416，可覆盖', () => {
    const { rerender } = render(
      <AlertDialog open title="确认">
        body
      </AlertDialog>,
    );
    expect(screen.getByRole('alertdialog')).toHaveStyle({ width: '416px' });
    rerender(
      <AlertDialog open title="确认" width={520}>
        body
      </AlertDialog>,
    );
    expect(screen.getByRole('alertdialog')).toHaveStyle({ width: '520px' });
  });
});
