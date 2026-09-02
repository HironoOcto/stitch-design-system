import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal';

describe('Modal', () => {
  it('open=false 不渲染', () => {
    render(<Modal open={false}>content</Modal>);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('open=true 通过 portal 渲染到 body 且包含 role="dialog"', () => {
    render(
      <Modal open title="标题">
        <p data-testid="body">body content</p>
      </Modal>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    // portal 挂到 document.body，不在 render 容器里
    expect(document.body.contains(dialog)).toBe(true);
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveRole('dialog');
    expect(dialog).toHaveAccessibleName('标题');
    expect(screen.getByText('标题')).toBeInTheDocument();
    expect(screen.getByTestId('body')).toBeInTheDocument();
  });

  it('点击遮罩触发 onCancel（默认 maskClosable）', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <Modal open onCancel={onCancel}>
        content
      </Modal>,
    );
    // mask 在 portal 里，通过 dialog 父级找
    const mask = screen.getByRole('dialog').parentElement!;
    await user.click(mask);
    expect(onCancel).toHaveBeenCalled();
  });

  it('maskClosable=false 时点击遮罩不触发 onCancel', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <Modal open maskClosable={false} onCancel={onCancel}>
        content
      </Modal>,
    );
    const mask = screen.getByRole('dialog').parentElement!;
    await user.click(mask);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('点击对话框内容不冒泡触发 onCancel', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <Modal open onCancel={onCancel}>
        <p>inside</p>
      </Modal>,
    );
    await user.click(screen.getByText('inside'));
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('Esc 触发 onCancel', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <Modal open onCancel={onCancel}>
        content
      </Modal>,
    );
    await user.keyboard('{Escape}');
    expect(onCancel).toHaveBeenCalled();
  });

  it('默认 footer 渲染取消/确定，回调正确', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const onOk = vi.fn();
    render(
      <Modal open onCancel={onCancel} onOk={onOk}>
        body
      </Modal>,
    );
    await user.click(screen.getByText('取消'));
    expect(onCancel).toHaveBeenCalled();
    await user.click(screen.getByText('确定'));
    expect(onOk).toHaveBeenCalled();
  });

  it('footer={null} 不渲染默认按钮', () => {
    render(
      <Modal open footer={null}>
        body
      </Modal>,
    );
    expect(screen.queryByText('取消')).not.toBeInTheDocument();
    expect(screen.queryByText('确定')).not.toBeInTheDocument();
  });

  it('footer 自定义节点覆盖默认按钮', () => {
    render(
      <Modal open footer={<button>自定义</button>}>
        body
      </Modal>,
    );
    expect(screen.getByText('自定义')).toBeInTheDocument();
    expect(screen.queryByText('确定')).not.toBeInTheDocument();
  });

  it('width 应用到 dialog 节点', () => {
    render(
      <Modal open width={400}>
        body
      </Modal>,
    );
    expect(screen.getByRole('dialog')).toHaveStyle({ width: '400px' });
  });

  it('className 透传到 dialog 节点', () => {
    render(
      <Modal open className="my-modal">
        body
      </Modal>,
    );
    expect(screen.getByRole('dialog')).toHaveClass('my-modal');
  });
});
