import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { ChatInput } from './ChatInput';

describe('ChatInput a11y', () => {
  it('label 关联的输入器（发送键有可访问名）无 axe 违规', async () => {
    const { container } = render(
      <>
        <label htmlFor="msg">消息</label>
        <ChatInput id="msg" placeholder="输入消息" defaultValue="hi" />
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('aria-label 直接命名的输入器无 axe 违规', async () => {
    const { container } = render(
      <ChatInput aria-label="消息" defaultValue="hi" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
