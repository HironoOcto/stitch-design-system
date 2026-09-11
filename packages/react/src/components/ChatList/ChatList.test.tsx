import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatList } from './ChatList';
import { Avatar } from '../Avatar';
import chatMessageStyles from '../ChatMessage/chat-message.module.less';
import styles from './chat-list.module.less';

// jsdom 不做布局：手动喂滚动几何，模拟「滚到顶 / 停在中段 / 贴底」。
// scrollTop 装成带存储的读写属性（jsdom 原生恒返回 0），让组件的贴底写入可被读回断言。
function setScrollGeom(
  el: HTMLElement,
  { scrollTop, scrollHeight, clientHeight }: Record<string, number>,
) {
  Object.defineProperty(el, 'scrollHeight', {
    configurable: true,
    value: scrollHeight,
  });
  Object.defineProperty(el, 'clientHeight', {
    configurable: true,
    value: clientHeight,
  });
  let top = scrollTop;
  Object.defineProperty(el, 'scrollTop', {
    configurable: true,
    get: () => top,
    set: (v: number) => {
      top = v;
    },
  });
}

describe('ChatList', () => {
  describe('a11y 契约 / 透传', () => {
    it('根容器 role=log（消息流、增量播报）', () => {
      render(
        <ChatList items={[{ id: 1, variant: 'received', content: 'x' }]} />,
      );
      expect(screen.getByRole('log')).toBeInTheDocument();
    });

    it('日志区键盘可聚焦（tabIndex=0，可用方向键滚历史）', () => {
      render(
        <ChatList items={[{ id: 1, variant: 'received', content: 'x' }]} />,
      );
      expect(screen.getByRole('log')).toHaveAttribute('tabindex', '0');
    });

    it('className / style 透传到根', () => {
      render(
        <ChatList
          className="custom"
          style={{ maxHeight: 400 }}
          items={[{ id: 1, variant: 'received', content: 'x' }]}
        />,
      );
      const root = screen.getByRole('log');
      expect(root).toHaveClass('custom');
      expect(root.style.maxHeight).toBe('400px');
    });
  });

  describe('数据驱动渲染', () => {
    it('按 items 渲染每条消息（内部走 ChatMessage）', () => {
      render(
        <ChatList
          items={[
            { id: 1, variant: 'received', content: '在吗？' },
            { id: 2, variant: 'sent', content: '在的' },
          ]}
        />,
      );
      expect(screen.getByText('在吗？')).toBeInTheDocument();
      expect(screen.getByText('在的')).toBeInTheDocument();
    });
  });

  describe('顶部加载（复用 Loading；组件不 fetch）', () => {
    it('loadingMore 时顶部显示转圈（复用 Loading）', () => {
      render(
        <ChatList
          loadingMore
          items={[{ id: 1, variant: 'received', content: 'x' }]}
        />,
      );
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('未加载时不显示顶部转圈', () => {
      render(
        <ChatList items={[{ id: 1, variant: 'received', content: 'x' }]} />,
      );
      expect(screen.queryByRole('status')).toBeNull();
    });
  });

  describe('贴底 / 上滚暂停 / 回底恢复（autoScroll）', () => {
    const base = [{ id: 1, variant: 'received' as const, content: '第一条' }];
    const appended = [
      ...base,
      { id: 2, variant: 'received' as const, content: '新消息' },
    ];

    it('贴底时 append 新消息自动滚到底', () => {
      const { container, rerender } = render(<ChatList items={base} />);
      const list = container.querySelector(`.${styles.list}`) as HTMLElement;
      setScrollGeom(list, {
        scrollTop: 0,
        scrollHeight: 1000,
        clientHeight: 300,
      });
      rerender(<ChatList items={appended} />);
      expect(list.scrollTop).toBe(1000);
    });

    it('用户上滚后 append 不再自动贴底（暂停）', () => {
      const { container, rerender } = render(<ChatList items={base} />);
      const list = container.querySelector(`.${styles.list}`) as HTMLElement;
      // 停在中段：距底 600px，判为已离底
      setScrollGeom(list, {
        scrollTop: 100,
        scrollHeight: 1000,
        clientHeight: 300,
      });
      fireEvent.scroll(list);
      rerender(<ChatList items={appended} />);
      expect(list.scrollTop).toBe(100);
    });

    it('滚回底部后恢复自动贴底', () => {
      const { container, rerender } = render(<ChatList items={base} />);
      const list = container.querySelector(`.${styles.list}`) as HTMLElement;
      // 先离底
      setScrollGeom(list, {
        scrollTop: 100,
        scrollHeight: 1000,
        clientHeight: 300,
      });
      fireEvent.scroll(list);
      // 再滚回底（距底 0）
      list.scrollTop = 700;
      fireEvent.scroll(list);
      rerender(<ChatList items={appended} />);
      expect(list.scrollTop).toBe(1000);
    });

    it('autoScroll=false 关闭自动贴底', () => {
      const { container, rerender } = render(
        <ChatList autoScroll={false} items={base} />,
      );
      const list = container.querySelector(`.${styles.list}`) as HTMLElement;
      setScrollGeom(list, {
        scrollTop: 0,
        scrollHeight: 1000,
        clientHeight: 300,
      });
      rerender(<ChatList autoScroll={false} items={appended} />);
      expect(list.scrollTop).toBe(0);
    });
  });

  describe('向上加载历史（onReachTop；组件不 fetch）', () => {
    it('滚到顶触发 onReachTop', () => {
      const onReachTop = vi.fn();
      const { container } = render(
        <ChatList
          onReachTop={onReachTop}
          items={[{ id: 1, variant: 'received', content: 'x' }]}
        />,
      );
      const list = container.querySelector(`.${styles.list}`) as HTMLElement;
      setScrollGeom(list, {
        scrollTop: 0,
        scrollHeight: 1000,
        clientHeight: 300,
      });
      fireEvent.scroll(list);
      expect(onReachTop).toHaveBeenCalledTimes(1);
    });

    it('内容不溢出（开屏无可滚空间）不触发 onReachTop', () => {
      const onReachTop = vi.fn();
      const { container } = render(
        <ChatList
          onReachTop={onReachTop}
          items={[{ id: 1, variant: 'received', content: 'x' }]}
        />,
      );
      const list = container.querySelector(`.${styles.list}`) as HTMLElement;
      // scrollTop 在顶，但内容高 = 视口高（无溢出）→ 非真触顶
      setScrollGeom(list, {
        scrollTop: 0,
        scrollHeight: 300,
        clientHeight: 300,
      });
      fireEvent.scroll(list);
      expect(onReachTop).not.toHaveBeenCalled();
    });

    it('停在中段不触发 onReachTop', () => {
      const onReachTop = vi.fn();
      const { container } = render(
        <ChatList
          onReachTop={onReachTop}
          items={[{ id: 1, variant: 'received', content: 'x' }]}
        />,
      );
      const list = container.querySelector(`.${styles.list}`) as HTMLElement;
      setScrollGeom(list, {
        scrollTop: 500,
        scrollHeight: 1000,
        clientHeight: 300,
      });
      fireEvent.scroll(list);
      expect(onReachTop).not.toHaveBeenCalled();
    });
  });

  describe('roles 角色默认配置（照 Ant X）', () => {
    it('roles 按 variant 灌默认 avatar；item 未给时生效', () => {
      render(
        <ChatList
          roles={{ received: { avatar: <Avatar fallback="客" /> } }}
          items={[{ id: 1, variant: 'received', content: 'hi' }]}
        />,
      );
      expect(screen.getByText('客')).toBeInTheDocument();
    });

    it('item 显式值覆盖 roles 默认', () => {
      render(
        <ChatList
          roles={{ received: { avatar: <Avatar fallback="默认" /> } }}
          items={[
            {
              id: 1,
              variant: 'received',
              avatar: <Avatar fallback="本人" />,
              content: 'hi',
            },
          ]}
        />,
      );
      expect(screen.getByText('本人')).toBeInTheDocument();
      expect(screen.queryByText('默认')).toBeNull();
    });
  });

  describe('连发分组（相邻同 variant）', () => {
    it('相邻同 variant 的续条置 grouped（头像只显一次）', () => {
      render(
        <ChatList
          items={[
            {
              id: 1,
              variant: 'received',
              avatar: <Avatar fallback="林" />,
              content: '第一条',
            },
            {
              id: 2,
              variant: 'received',
              avatar: <Avatar fallback="林" />,
              content: '第二条',
            },
          ]}
        />,
      );
      // 组内头像只渲染一次
      expect(screen.getAllByText('林')).toHaveLength(1);
      // 续条根节点带 grouped 钩子类
      const second = screen
        .getByText('第二条')
        .closest(`.${chatMessageStyles.message}`);
      expect(second).toHaveClass(chatMessageStyles['is-grouped']);
    });

    it('system 项（日期分隔）断组：其后同 variant 不续组', () => {
      render(
        <ChatList
          items={[
            { id: 1, variant: 'received', content: '昨天的消息' },
            { id: 2, variant: 'system', content: '今天' },
            { id: 3, variant: 'received', content: '今天的消息' },
          ]}
        />,
      );
      const third = screen
        .getByText('今天的消息')
        .closest(`.${chatMessageStyles.message}`);
      expect(third).not.toHaveClass(chatMessageStyles['is-grouped']);
    });

    it('相邻不同 variant 不分组（各自显头像）', () => {
      render(
        <ChatList
          items={[
            {
              id: 1,
              variant: 'received',
              avatar: <Avatar fallback="林" />,
              content: 'a',
            },
            {
              id: 2,
              variant: 'sent',
              content: 'b',
            },
          ]}
        />,
      );
      const first = screen
        .getByText('a')
        .closest(`.${chatMessageStyles.message}`);
      expect(first).not.toHaveClass(chatMessageStyles['is-grouped']);
    });
  });
});
