import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TypingIndicator } from './TypingIndicator';
import styles from './typing-indicator.module.less';

describe('TypingIndicator', () => {
  describe('基本渲染', () => {
    it('渲染三点动画元素', () => {
      const { container } = render(<TypingIndicator />);
      expect(container.querySelectorAll(`.${styles.dot}`)).toHaveLength(3);
    });
  });

  describe('a11y 契约（可及名 / role）', () => {
    it('默认可访问名「对方正在输入」+ role=status', () => {
      render(<TypingIndicator />);
      expect(
        screen.getByRole('status', { name: '对方正在输入' }),
      ).toBeInTheDocument();
    });

    it('label 覆盖可访问名', () => {
      render(<TypingIndicator label="张三正在输入" />);
      expect(
        screen.getByRole('status', { name: '张三正在输入' }),
      ).toBeInTheDocument();
    });

    it('三点为纯装饰（aria-hidden）', () => {
      const { container } = render(<TypingIndicator />);
      for (const dot of container.querySelectorAll(`.${styles.dot}`)) {
        expect(dot).toHaveAttribute('aria-hidden', 'true');
      }
    });
  });

  describe('原生属性透传', () => {
    it('className / style 透传到根', () => {
      const { container } = render(
        <TypingIndicator className="custom" style={{ opacity: 0.5 }} />,
      );
      const root = container.firstChild as HTMLElement;
      expect(root).toHaveClass('custom');
      expect(root).toHaveClass(styles.indicator);
      expect(root.style.opacity).toBe('0.5');
    });
  });
});
