import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';
import styles from './button.module.less';

describe('Button', () => {
  // 1. 基本渲染
  it('渲染 children 文案', () => {
    render(<Button>OK</Button>);
    expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument();
  });

  // 2. props → class 映射（遍历枚举）
  it('type 全部枚举映射到对应类', () => {
    const types = ['primary', 'default', 'dashed', 'text', 'link'] as const;
    for (const t of types) {
      const { unmount } = render(<Button type={t}>x</Button>);
      expect(screen.getByRole('button')).toHaveClass(styles[`btn-${t}`]);
      unmount();
    }
  });

  it('size 全部枚举映射到对应类', () => {
    const sizes = ['small', 'middle', 'large'] as const;
    for (const s of sizes) {
      const { unmount } = render(<Button size={s}>x</Button>);
      expect(screen.getByRole('button')).toHaveClass(styles[`btn-${s}`]);
      unmount();
    }
  });

  it('danger / ghost / block / loading 布尔态各自加类', () => {
    render(
      <Button danger ghost block loading>
        x
      </Button>,
    );
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass(styles['btn-danger']);
    expect(btn).toHaveClass(styles['btn-ghost']);
    expect(btn).toHaveClass(styles['btn-block']);
    expect(btn).toHaveClass(styles['btn-loading']);
  });

  // 3. 原生属性透传
  it('htmlType 默认 button，可改 submit / reset', () => {
    const { rerender } = render(<Button>x</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    rerender(<Button htmlType="submit">x</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    rerender(<Button htmlType="reset">x</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'reset');
  });

  it('className / style / data-* / aria-* 透传到原生 button', () => {
    render(
      <Button
        className="custom"
        style={{ padding: 10 }}
        data-testid="b"
        aria-label="go"
      >
        x
      </Button>,
    );
    const btn = screen.getByTestId('b');
    expect(btn).toHaveClass('custom');
    expect(btn).toHaveStyle({ padding: '10px' });
    expect(btn).toHaveAttribute('aria-label', 'go');
  });

  // 4. 交互事件
  it('点击触发 onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>x</Button>);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  // 5. 禁用 / 边界态
  it('disabled 禁用且阻止点击回调', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        x
      </Button>,
    );
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    await user.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('loading 时 aria-busy=true 且不渲染传入的 icon', () => {
    const { rerender } = render(
      <Button icon={<i data-testid="ic" />}>x</Button>,
    );
    expect(screen.getByTestId('ic')).toBeInTheDocument();
    rerender(
      <Button icon={<i data-testid="ic" />} loading>
        x
      </Button>,
    );
    expect(screen.queryByTestId('ic')).not.toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
  });

  it('非 loading 时无 aria-busy 属性', () => {
    render(<Button>x</Button>);
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-busy');
  });

  // 6. 键盘操作
  it('键盘 Enter / Space 触发 onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>x</Button>);
    screen.getByRole('button').focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('disabled 时键盘 Enter 不触发', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        x
      </Button>,
    );
    screen.getByRole('button').focus();
    await user.keyboard('{Enter}');
    expect(onClick).not.toHaveBeenCalled();
  });

  // 7. a11y 契约
  it('按钮文本作为可访问名', () => {
    render(<Button>保存</Button>);
    expect(screen.getByRole('button', { name: '保存' })).toHaveAccessibleName();
  });
});
