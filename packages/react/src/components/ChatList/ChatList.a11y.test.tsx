import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { ChatList } from './ChatList';
import { Avatar } from '../Avatar';

describe('ChatList a11y', () => {
  it('群聊消息流（连发分组 + 头像 + 已读回执 + 日期分隔）无 axe 违规', async () => {
    const { container } = render(
      <ChatList
        roles={{ received: { avatar: <Avatar fallback="林" /> } }}
        items={[
          { id: 'd1', variant: 'system', content: '今天' },
          { id: 1, variant: 'received', content: '在吗？', time: '09:41' },
          {
            id: 2,
            variant: 'received',
            content: '帮我看下稿子',
            time: '09:41',
          },
          {
            id: 3,
            variant: 'sent',
            content: '在的',
            time: '09:42',
            status: 'read',
          },
        ]}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('顶部加载态（复用 Loading）无 axe 违规', async () => {
    const { container } = render(
      <ChatList
        loadingMore
        items={[{ id: 1, variant: 'received', content: 'x', time: '09:41' }]}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
