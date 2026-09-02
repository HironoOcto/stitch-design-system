import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { axe } from 'vitest-axe';
import { Drawer } from './Drawer';

describe('Drawer a11y', () => {
  it('打开态无 axe 违规', async () => {
    const { baseElement } = render(
      <Drawer open title="无障碍标题">
        <p>抽屉正文</p>
      </Drawer>,
    );
    // portal 挂到 body，用 baseElement 覆盖整棵含 portal 的树
    expect(await axe(baseElement)).toHaveNoViolations();
  });

  it('aria-labelledby 关联 title', () => {
    render(
      <Drawer open title="嗨标题">
        <p>嗨内容</p>
      </Drawer>,
    );
    const dialog = screen.getByRole('dialog');
    const labelledBy = dialog.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    expect(document.getElementById(labelledBy!)).toHaveTextContent('嗨标题');
    expect(dialog).toHaveAccessibleName('嗨标题');
  });

  it('无 title 时 aria-labelledby 缺省', () => {
    render(<Drawer open>body</Drawer>);
    expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-labelledby');
  });

  it('关闭按钮 aria-label="关闭" 且触发 onClose', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Drawer open title="t" onClose={onClose}>
        body
      </Drawer>,
    );
    const closeBtn = screen.getByLabelText('关闭');
    expect(closeBtn).toBeInTheDocument();
    expect(closeBtn).toHaveRole('button');
    expect(closeBtn).toHaveAccessibleName('关闭');
    await user.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it('打开时焦点送进抽屉（落到第一个可聚焦元素）', async () => {
    const Host = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button data-testid="trigger" onClick={() => setOpen(true)}>
            open
          </button>
          <Drawer open={open} onClose={() => setOpen(false)}>
            <button data-testid="inside">inside</button>
          </Drawer>
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
          <Drawer open={open} onClose={() => setOpen(false)}>
            <button data-testid="inside">inside</button>
          </Drawer>
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

  it('Tab 焦点陷阱：末尾元素 Tab 回到第一个（关闭按钮）', async () => {
    const user = userEvent.setup();
    render(
      <Drawer open title="t">
        <button data-testid="b1">b1</button>
        <button data-testid="b2">b2</button>
      </Drawer>,
    );
    // 关闭按钮是第一个可聚焦元素
    await waitFor(() => {
      expect(screen.getByLabelText('关闭')).toHaveFocus();
    });
    await user.tab();
    expect(screen.getByTestId('b1')).toHaveFocus();
    await user.tab();
    expect(screen.getByTestId('b2')).toHaveFocus();
    await user.tab();
    // 末尾再 Tab 应陷阱回首项（关闭按钮）
    expect(screen.getByLabelText('关闭')).toHaveFocus();
  });

  it('Shift+Tab 焦点陷阱：首项 Shift+Tab 回到末尾', async () => {
    const user = userEvent.setup();
    render(
      <Drawer open title="t">
        <button data-testid="b1">b1</button>
        <button data-testid="b2">b2</button>
      </Drawer>,
    );
    await waitFor(() => {
      expect(screen.getByLabelText('关闭')).toHaveFocus();
    });
    await user.tab({ shift: true });
    expect(screen.getByTestId('b2')).toHaveFocus();
  });
});
