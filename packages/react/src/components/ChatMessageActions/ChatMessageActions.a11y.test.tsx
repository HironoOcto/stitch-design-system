import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { ChatMessageActions } from './ChatMessageActions';
import { ChatMessage } from '../ChatMessage';

describe('ChatMessageActions a11y', () => {
  it('默认（菜单关闭）无 axe 违规', async () => {
    const { container } = render(
      <ChatMessageActions actions={[{ label: '回复' }, { label: '转发' }]}>
        <ChatMessage variant="received" content="在吗？" time="09:41" />
      </ChatMessageActions>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('触发钮有可及名（无可见文字时 axe 不报 button-name）', async () => {
    const { container } = render(
      <ChatMessageActions actions={[{ label: '回复' }]}>
        <ChatMessage variant="received" content="在吗？" />
      </ChatMessageActions>,
    );
    // region 关：菜单面经 Portal 渲染成孤立 role="menu"，缺页面 landmark 会误报
    // 「content should be contained by landmarks」——页面级 best-practice、非 WCAG，
    // 与组件无障碍无关（同 DropdownMenu a11y 用例，详见 预建笔记.md）。
    expect(
      await axe(container, { rules: { region: { enabled: false } } }),
    ).toHaveNoViolations();
  });
});
