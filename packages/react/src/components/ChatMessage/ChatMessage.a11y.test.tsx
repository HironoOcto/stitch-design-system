import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { ChatMessage } from './ChatMessage';
import { Avatar } from '../Avatar';

describe('ChatMessage a11y', () => {
  it('received 气泡（带头像 + 时间）无 axe 违规', async () => {
    const { container } = render(
      <ChatMessage
        variant="received"
        avatar={<Avatar fallback="张" />}
        content="在吗？"
        time="09:41"
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('sent 气泡（已读回执有可访问名）无 axe 违规', async () => {
    const { container } = render(
      <ChatMessage variant="sent" content="到了" time="09:42" status="read" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('system 灰条无 axe 违规', async () => {
    const { container } = render(
      <ChatMessage variant="system" content="群聊已创建" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('纯 emoji 大图无 axe 违规', async () => {
    const { container } = render(<ChatMessage variant="sent" content="😀" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
