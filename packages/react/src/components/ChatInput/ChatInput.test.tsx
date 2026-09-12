import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatInput } from './ChatInput';
import styles from './chat-input.module.less';

describe('ChatInput', () => {
  describe('基本渲染', () => {
    it('渲染多行 textarea（placeholder）', () => {
      render(<ChatInput placeholder="说点什么" />);
      const ta = screen.getByPlaceholderText('说点什么');
      expect(ta.tagName).toBe('TEXTAREA');
    });

    it('渲染发送键（图标按钮 + 可访问名）', () => {
      render(<ChatInput defaultValue="hi" />);
      expect(screen.getByRole('button', { name: '发送' })).toBeInTheDocument();
    });

    it('prefix 插槽渲染（附件按钮钩子）', () => {
      render(<ChatInput prefix={<span>附件</span>} />);
      expect(screen.getByText('附件')).toBeInTheDocument();
    });
  });

  describe('受控 / 非受控双模式', () => {
    it('非受控：键入更新自身值，发送后清空', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<ChatInput defaultValue="" onSubmit={onSubmit} />);
      const ta = screen.getByRole('textbox') as HTMLTextAreaElement;
      await user.type(ta, '你好');
      expect(ta.value).toBe('你好');
      await user.keyboard('{Enter}');
      expect(onSubmit).toHaveBeenCalledWith('你好');
      expect(ta.value).toBe('');
    });

    it('受控：值由父定，组件不擅自清空', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<ChatInput value="锁定" onSubmit={onSubmit} />);
      const ta = screen.getByRole('textbox') as HTMLTextAreaElement;
      await user.click(ta);
      await user.keyboard('{Enter}');
      expect(onSubmit).toHaveBeenCalledWith('锁定');
      // 受控：组件不改父的值，仍显示父传入的值
      expect(ta.value).toBe('锁定');
    });
  });

  describe('发送键位（submitType）与 Enter 行为', () => {
    it('默认 enter：Enter 发送、Shift+Enter 不发送', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<ChatInput defaultValue="x" onSubmit={onSubmit} />);
      const ta = screen.getByRole('textbox');
      ta.focus();
      await user.keyboard('{Shift>}{Enter}{/Shift}');
      expect(onSubmit).not.toHaveBeenCalled();
      await user.keyboard('{Enter}');
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('shiftEnter：Shift+Enter 发送、裸 Enter 不发送', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(
        <ChatInput
          defaultValue="x"
          submitType="shiftEnter"
          onSubmit={onSubmit}
        />,
      );
      const ta = screen.getByRole('textbox');
      ta.focus();
      await user.keyboard('{Enter}');
      expect(onSubmit).not.toHaveBeenCalled();
      await user.keyboard('{Shift>}{Enter}{/Shift}');
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('纯空白不发送', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<ChatInput defaultValue="   " onSubmit={onSubmit} />);
      screen.getByRole('textbox').focus();
      await user.keyboard('{Enter}');
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('交互事件（点击发送 + onChange）', () => {
    it('点发送键触发 onSubmit', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<ChatInput defaultValue="嗨" onSubmit={onSubmit} />);
      await user.click(screen.getByRole('button', { name: '发送' }));
      expect(onSubmit).toHaveBeenCalledWith('嗨');
    });

    it('onChange 随键入回调', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<ChatInput onChange={onChange} />);
      await user.type(screen.getByRole('textbox'), 'a');
      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('禁用 / 边界态', () => {
    it('disabled：发送键禁用、Enter 不发送', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<ChatInput defaultValue="x" disabled onSubmit={onSubmit} />);
      expect(screen.getByRole('button', { name: '发送' })).toBeDisabled();
      screen.getByRole('textbox').focus();
      await user.keyboard('{Enter}');
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('空值时发送键禁用', () => {
      render(<ChatInput defaultValue="" />);
      expect(screen.getByRole('button', { name: '发送' })).toBeDisabled();
    });

    it('loading：置发送键忙、不发送，且无「停止」键（IM 无停止态）', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<ChatInput defaultValue="x" loading onSubmit={onSubmit} />);
      const send = screen.getByRole('button', { name: '发送' });
      expect(send).toHaveAttribute('aria-busy', 'true');
      expect(send).toBeDisabled();
      // 全组件只有发送键这一个按钮，没有另立的停止键
      expect(screen.getAllByRole('button')).toHaveLength(1);
      await user.click(send);
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('原生属性透传', () => {
    it('className / style 透传到根', () => {
      const { container } = render(
        <ChatInput className="custom" style={{ opacity: 0.5 }} />,
      );
      const root = container.firstChild as HTMLElement;
      expect(root).toHaveClass('custom');
      expect(root).toHaveClass(styles.input);
      expect(root.style.opacity).toBe('0.5');
    });
  });
});
