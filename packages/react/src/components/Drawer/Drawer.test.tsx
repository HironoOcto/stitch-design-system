import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Drawer } from './Drawer';
import styles from './drawer.module.less';

describe('Drawer', () => {
  it('open=false 不渲染', () => {
    render(<Drawer open={false}>content</Drawer>);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('open=true 通过 portal 渲染到 body 且含 role="dialog" + aria-modal', () => {
    render(
      <Drawer open title="标题">
        <p data-testid="body">body content</p>
      </Drawer>,
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

  it('点击遮罩触发 onClose（默认 maskClosable）', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Drawer open onClose={onClose}>
        content
      </Drawer>,
    );
    const mask = screen.getByRole('dialog').parentElement!;
    await user.click(mask);
    expect(onClose).toHaveBeenCalled();
  });

  it('maskClosable=false 时点击遮罩不触发 onClose', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Drawer open maskClosable={false} onClose={onClose}>
        content
      </Drawer>,
    );
    const mask = screen.getByRole('dialog').parentElement!;
    await user.click(mask);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('点击抽屉内容不冒泡触发 onClose', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Drawer open onClose={onClose}>
        <p>inside</p>
      </Drawer>,
    );
    await user.click(screen.getByText('inside'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('Esc 触发 onClose', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Drawer open onClose={onClose}>
        content
      </Drawer>,
    );
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  it('placement 应用对应方向类名', () => {
    const { rerender } = render(
      <Drawer open placement="left">
        x
      </Drawer>,
    );
    expect(screen.getByRole('dialog')).toHaveClass(styles.panelLeft);

    rerender(
      <Drawer open placement="top">
        x
      </Drawer>,
    );
    expect(screen.getByRole('dialog')).toHaveClass(styles.panelTop);

    rerender(
      <Drawer open placement="bottom">
        x
      </Drawer>,
    );
    expect(screen.getByRole('dialog')).toHaveClass(styles.panelBottom);
  });

  it('width 应用到面板（left / right placement）', () => {
    render(
      <Drawer open width={400}>
        body
      </Drawer>,
    );
    expect(screen.getByRole('dialog')).toHaveStyle({ width: '400px' });
  });

  it('height 应用到面板（top / bottom placement）', () => {
    render(
      <Drawer open placement="bottom" height={250}>
        body
      </Drawer>,
    );
    expect(screen.getByRole('dialog')).toHaveStyle({ height: '250px' });
  });

  it('footer 传入时渲染', () => {
    render(
      <Drawer open footer={<button>ok</button>}>
        body
      </Drawer>,
    );
    expect(screen.getByText('ok')).toBeInTheDocument();
  });

  it('默认不渲染 footer', () => {
    render(<Drawer open>body</Drawer>);
    expect(
      screen.getByRole('dialog').querySelector(`.${styles.footer}`),
    ).toBeNull();
  });

  it('className 透传到面板节点', () => {
    render(
      <Drawer open className="my-drawer">
        body
      </Drawer>,
    );
    expect(screen.getByRole('dialog')).toHaveClass('my-drawer');
  });
});
