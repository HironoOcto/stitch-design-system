import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tag } from './Tag';
import type { TagSize, TagVariant, TagColor } from './Tag';
import styles from './tag.module.less';

describe('Tag', () => {
  describe('基本渲染', () => {
    it('渲染 children 文本', () => {
      render(<Tag>hello</Tag>);
      expect(screen.getByText('hello')).toBeInTheDocument();
    });

    it('默认应用基础 tag 类 + middle/soft', () => {
      const { container } = render(<Tag>x</Tag>);
      const root = container.firstChild as HTMLElement;
      expect(root).toHaveClass(styles.tag);
      expect(root).toHaveClass(styles['size-middle']);
      expect(root).toHaveClass(styles['variant-soft']);
    });
  });

  describe('props → class 映射', () => {
    const sizes: TagSize[] = ['small', 'middle', 'large'];
    for (const size of sizes) {
      it(`size=${size} 应用对应类`, () => {
        const { container } = render(<Tag size={size}>x</Tag>);
        expect(container.firstChild).toHaveClass(styles[`size-${size}`]);
      });
    }

    const variants: TagVariant[] = [
      'solid',
      'outlined',
      'dashed',
      'soft',
      'text',
    ];
    for (const variant of variants) {
      it(`variant=${variant} 应用对应类`, () => {
        const { container } = render(<Tag variant={variant}>x</Tag>);
        expect(container.firstChild).toHaveClass(styles[`variant-${variant}`]);
      });
    }

    it('color=default 不应用任何 color 类', () => {
      const { container } = render(<Tag color="default">x</Tag>);
      expect((container.firstChild as HTMLElement).className).not.toMatch(
        /color-/,
      );
    });

    const colors: TagColor[] = [
      'danger',
      'success',
      'warning',
      'info',
      'cat-1',
      'cat-2',
      'cat-3',
      'cat-4',
      'cat-5',
      'cat-6',
    ];
    for (const color of colors) {
      it(`color=${color} 应用 color-${color} 类`, () => {
        const { container } = render(<Tag color={color}>x</Tag>);
        expect(container.firstChild).toHaveClass(styles[`color-${color}`]);
      });
    }
  });

  describe('原生属性透传', () => {
    it('支持 className 与 style', () => {
      const { container } = render(
        <Tag className="x" style={{ marginLeft: 4 }}>
          t
        </Tag>,
      );
      const root = container.firstChild as HTMLElement;
      expect(root).toHaveClass('x');
      expect(root).toHaveStyle({ marginLeft: '4px' });
    });
  });

  describe('closable', () => {
    it('closable=true 渲染有可访问名的关闭按钮', () => {
      render(<Tag closable>x</Tag>);
      const btn = screen.getByRole('button', { name: 'close' });
      expect(btn).toBeInTheDocument();
      expect(btn).toHaveAccessibleName('close');
    });

    it('未开启 closable 时不渲染关闭按钮', () => {
      render(<Tag>x</Tag>);
      expect(screen.queryByRole('button', { name: 'close' })).toBeNull();
    });

    it('点击关闭按钮触发 onClose', () => {
      const onClose = vi.fn();
      render(
        <Tag closable onClose={onClose}>
          x
        </Tag>,
      );
      fireEvent.click(screen.getByRole('button', { name: 'close' }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('disabled 状态下点击关闭按钮不触发 onClose', () => {
      const onClose = vi.fn();
      render(
        <Tag closable disabled onClose={onClose}>
          x
        </Tag>,
      );
      const btn = screen.getByRole('button', { name: 'close' });
      expect(btn).toBeDisabled();
      fireEvent.click(btn);
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('clickable', () => {
    it('提供 onClick 后渲染为 role=button，可访问名取 children，可点击', () => {
      const onClick = vi.fn();
      render(<Tag onClick={onClick}>x</Tag>);
      const tag = screen.getByRole('button');
      expect(tag).toHaveClass(styles['is-clickable']);
      expect(tag).toHaveAccessibleName('x');
      fireEvent.click(tag);
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('未提供 onClick 时不渲染为 button', () => {
      const { container } = render(<Tag>x</Tag>);
      expect(
        (container.firstChild as HTMLElement).getAttribute('role'),
      ).toBeNull();
    });

    it('disabled 状态下不响应 onClick', () => {
      const onClick = vi.fn();
      const { container } = render(
        <Tag disabled onClick={onClick}>
          x
        </Tag>,
      );
      const root = container.firstChild as HTMLElement;
      expect(root).toHaveClass(styles['is-disabled']);
      fireEvent.click(root);
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('键盘操作', () => {
    it('键盘 Enter 触发 onClick', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<Tag onClick={onClick}>x</Tag>);
      screen.getByRole('button').focus();
      await user.keyboard('{Enter}');
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('键盘 Space 触发 onClick', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<Tag onClick={onClick}>x</Tag>);
      screen.getByRole('button').focus();
      await user.keyboard(' ');
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('禁用/边界态', () => {
    it('disabled 应用 is-disabled 类', () => {
      const { container } = render(<Tag disabled>x</Tag>);
      expect(container.firstChild).toHaveClass(styles['is-disabled']);
    });
  });

  describe('事件隔离', () => {
    it('点击关闭按钮不冒泡触发 onClick', () => {
      const onClick = vi.fn();
      const onClose = vi.fn();
      render(
        <Tag closable onClose={onClose} onClick={onClick}>
          x
        </Tag>,
      );
      fireEvent.click(screen.getByRole('button', { name: 'close' }));
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onClick).not.toHaveBeenCalled();
    });
  });
});
