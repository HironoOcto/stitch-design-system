import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatMessage } from './ChatMessage';
import type { ChatMessageVariant } from './ChatMessage';
import { Avatar } from '../Avatar';
import styles from './chat-message.module.less';

describe('ChatMessage', () => {
  describe('基本渲染', () => {
    it('渲染 content 文本', () => {
      render(<ChatMessage content="你好" />);
      expect(screen.getByText('你好')).toBeInTheDocument();
    });

    it('content 缺省时回退到 children', () => {
      render(<ChatMessage>嗨</ChatMessage>);
      expect(screen.getByText('嗨')).toBeInTheDocument();
    });

    it('content 支持 ReactNode', () => {
      render(<ChatMessage content={<a href="/x">链接</a>} />);
      expect(screen.getByRole('link', { name: '链接' })).toBeInTheDocument();
    });

    it('默认 variant=received', () => {
      const { container } = render(<ChatMessage content="x" />);
      expect(container.firstChild).toHaveClass(styles['variant-received']);
    });
  });

  describe('props → class 映射', () => {
    const variants: ChatMessageVariant[] = ['sent', 'received', 'system'];
    for (const variant of variants) {
      it(`variant=${variant} 应用对应类`, () => {
        const { container } = render(
          <ChatMessage variant={variant} content="x" />,
        );
        expect(container.firstChild).toHaveClass(styles[`variant-${variant}`]);
      });
    }

    it('grouped 应用样式钩子类', () => {
      const { container } = render(<ChatMessage grouped content="x" />);
      expect(container.firstChild).toHaveClass(styles['is-grouped']);
    });
  });

  describe('三态布局差异', () => {
    it('system 态不渲染头像位', () => {
      const { container } = render(
        <ChatMessage
          variant="system"
          avatar={<Avatar fallback="A" />}
          content="群已创建"
        />,
      );
      expect(container.querySelector(`.${styles['avatar-slot']}`)).toBeNull();
      // system 走灰条节点
      expect(container.querySelector(`.${styles.system}`)).not.toBeNull();
    });

    it('received 态渲染头像', () => {
      render(
        <ChatMessage
          variant="received"
          avatar={<Avatar fallback="A" />}
          content="x"
        />,
      );
      expect(screen.getByText('A')).toBeInTheDocument();
    });

    it('grouped 时隐藏头像（保留占位）', () => {
      const { container } = render(
        <ChatMessage
          variant="received"
          grouped
          avatar={<Avatar fallback="A" />}
          content="x"
        />,
      );
      // 占位槽仍在，但头像内容不渲染
      expect(
        container.querySelector(`.${styles['avatar-slot']}`),
      ).not.toBeNull();
      expect(screen.queryByText('A')).toBeNull();
    });

    it('无头像且非 grouped 时不占头像列（气泡贴边）', () => {
      const { container } = render(<ChatMessage variant="sent" content="x" />);
      expect(container.querySelector(`.${styles['avatar-slot']}`)).toBeNull();
    });

    it('received 连发续条（grouped 无头像）保留头像列占位', () => {
      const { container } = render(
        <ChatMessage variant="received" grouped content="x" />,
      );
      expect(
        container.querySelector(`.${styles['avatar-slot']}`),
      ).not.toBeNull();
    });

    it('sent 连发续条（grouped 无头像）不占头像列', () => {
      const { container } = render(
        <ChatMessage variant="sent" grouped content="x" />,
      );
      expect(container.querySelector(`.${styles['avatar-slot']}`)).toBeNull();
    });
  });

  describe('纯 emoji 大图无气泡', () => {
    it('纯 emoji 字符串走 emoji 大图（非气泡）', () => {
      const { container } = render(<ChatMessage variant="sent" content="😀" />);
      expect(container.firstChild).toHaveClass(styles['is-emoji']);
      expect(container.querySelector(`.${styles.emoji}`)).not.toBeNull();
      expect(container.querySelector(`.${styles.bubble}`)).toBeNull();
    });

    it('emoji 混文字仍走气泡', () => {
      const { container } = render(<ChatMessage content="好的😀" />);
      expect(container.firstChild).not.toHaveClass(styles['is-emoji']);
      expect(container.querySelector(`.${styles.bubble}`)).not.toBeNull();
    });

    it('超过 3 个 emoji 仍走气泡', () => {
      const { container } = render(<ChatMessage content="😀😀😀😀" />);
      expect(container.firstChild).not.toHaveClass(styles['is-emoji']);
    });
  });

  describe('时间元信息', () => {
    it('渲染 time', () => {
      render(<ChatMessage content="x" time="09:41" />);
      expect(screen.getByText('09:41')).toBeInTheDocument();
    });
  });

  describe('已读回执（仅 sent 侧、走 Icon）', () => {
    it('sent + status=sent 出单勾', () => {
      const { container } = render(
        <ChatMessage variant="sent" content="x" status="sent" />,
      );
      expect(container.querySelectorAll(`.${styles.tick}`)).toHaveLength(1);
    });

    it('sent + status=delivered 出双勾', () => {
      const { container } = render(
        <ChatMessage variant="sent" content="x" status="delivered" />,
      );
      expect(container.querySelectorAll(`.${styles.tick}`)).toHaveLength(2);
    });

    it('sent + status=read 双勾 + 高亮类', () => {
      const { container } = render(
        <ChatMessage variant="sent" content="x" status="read" />,
      );
      expect(container.querySelectorAll(`.${styles.tick}`)).toHaveLength(2);
      expect(container.querySelector(`.${styles.ticks}`)).toHaveClass(
        styles['ticks-read'],
      );
    });

    it('received 侧不出回执（即便传 status）', () => {
      const { container } = render(
        <ChatMessage variant="received" content="x" status="read" />,
      );
      expect(container.querySelector(`.${styles.ticks}`)).toBeNull();
    });
  });

  describe('a11y 契约（可及名 / role）', () => {
    it('已读回执有 role=img + 可访问名', () => {
      render(<ChatMessage variant="sent" content="x" status="read" />);
      expect(screen.getByRole('img', { name: '已读' })).toBeInTheDocument();
    });

    it('status 不同 → 可访问名不同', () => {
      render(<ChatMessage variant="sent" content="x" status="delivered" />);
      expect(screen.getByRole('img', { name: '已送达' })).toBeInTheDocument();
    });
  });

  describe('原生属性透传', () => {
    it('className / style 透传到根', () => {
      const { container } = render(
        <ChatMessage content="x" className="custom" style={{ opacity: 0.5 }} />,
      );
      const root = container.firstChild as HTMLElement;
      expect(root).toHaveClass('custom');
      expect(root.style.opacity).toBe('0.5');
    });
  });
});
