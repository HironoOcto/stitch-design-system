import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { axe } from 'vitest-axe';
import { Modal } from './Modal';

describe('Modal a11y', () => {
  it('打开态无 axe 违规', async () => {
    const { baseElement } = render(
      <Modal open title="无障碍标题">
        <p>对话框正文</p>
      </Modal>,
    );
    // portal 挂到 body，用 baseElement 覆盖整棵含 portal 的树
    expect(await axe(baseElement)).toHaveNoViolations();
  });

  it('aria-labelledby / aria-describedby 关联 title 与 body', () => {
    render(
      <Modal open title="嗨标题">
        <p>嗨内容</p>
      </Modal>,
    );
    const dialog = screen.getByRole('dialog');
    const labelledBy = dialog.getAttribute('aria-labelledby');
    const describedBy = dialog.getAttribute('aria-describedby');
    expect(labelledBy).toBeTruthy();
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(labelledBy!)).toHaveTextContent('嗨标题');
    expect(document.getElementById(describedBy!)).toHaveTextContent('嗨内容');
    expect(dialog).toHaveAccessibleName('嗨标题');
    expect(dialog).toHaveAccessibleDescription('嗨内容');
  });

  it('无 title 时 aria-labelledby 缺省', () => {
    render(<Modal open>body</Modal>);
    expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-labelledby');
  });

  it('打开时焦点送进对话框（落到第一个可聚焦元素）', async () => {
    const Host = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button data-testid="trigger" onClick={() => setOpen(true)}>
            open
          </button>
          <Modal open={open} onCancel={() => setOpen(false)} footer={null}>
            <button data-testid="inside">inside</button>
          </Modal>
        </>
      );
    };
    const user = userEvent.setup();
    render(<Host />);
    await user.click(screen.getByTestId('trigger'));
    await waitFor(() => {
      expect(screen.getByTestId('inside')).toHaveFocus();
    });
  });

  it('关闭时焦点归还触发元素', async () => {
    const Host = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button data-testid="trigger" onClick={() => setOpen(true)}>
            open
          </button>
          <Modal open={open} onCancel={() => setOpen(false)} footer={null}>
            <button data-testid="inside">inside</button>
          </Modal>
        </>
      );
    };
    const user = userEvent.setup();
    render(<Host />);
    const trigger = screen.getByTestId('trigger');
    await user.click(trigger);
    await waitFor(() => {
      expect(screen.getByTestId('inside')).toHaveFocus();
    });
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });
  });

  it('Tab 焦点陷阱：末尾元素 Tab 回到第一个', async () => {
    const user = userEvent.setup();
    render(
      <Modal open footer={null}>
        <button data-testid="b1">b1</button>
        <button data-testid="b2">b2</button>
      </Modal>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('b1')).toHaveFocus();
    });
    await user.tab();
    expect(screen.getByTestId('b2')).toHaveFocus();
    await user.tab();
    expect(screen.getByTestId('b1')).toHaveFocus();
  });

  it('Shift+Tab 焦点陷阱：首项 Shift+Tab 回到末尾', async () => {
    const user = userEvent.setup();
    render(
      <Modal open footer={null}>
        <button data-testid="b1">b1</button>
        <button data-testid="b2">b2</button>
      </Modal>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('b1')).toHaveFocus();
    });
    await user.tab({ shift: true });
    expect(screen.getByTestId('b2')).toHaveFocus();
  });
});
