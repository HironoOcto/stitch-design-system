import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatMessageActions } from './ChatMessageActions';
import { ChatMessage } from '../ChatMessage';
import styles from './chat-message-actions.module.less';

// 测试重点 = 我们写的那部分：指针路右键/长按开 ContextMenu、键盘路聚焦露触发钮 → Enter 开
// DropdownMenu、点项把动作回调交 app（actions[].onClick）。菜单壳的键盘 / 焦点 / ARIA 归复用件
// （ContextMenu / DropdownMenu → radix），此处不重测、只验触发 + 回调 + 可配置 + 可及名。
describe('ChatMessageActions', () => {
  it('渲染被包裹的消息内容', () => {
    render(
      <ChatMessageActions actions={[{ label: '回复' }]}>
        <ChatMessage variant="received" content="在吗？" />
      </ChatMessageActions>,
    );
    expect(screen.getByText('在吗？')).toBeInTheDocument();
  });

  it('键盘路：点触发钮开 DropdownMenu，actions 渲染成菜单项', async () => {
    const user = userEvent.setup();
    render(
      <ChatMessageActions actions={[{ label: '回复' }, { label: '转发' }]}>
        <ChatMessage variant="received" content="在吗？" />
      </ChatMessageActions>,
    );
    // 未开：动作项不在文档
    expect(screen.queryByRole('menuitem', { name: '回复' })).toBeNull();
    await user.click(screen.getByRole('button', { name: '消息操作' }));
    expect(screen.getByRole('menuitem', { name: '回复' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: '转发' })).toBeInTheDocument();
  });

  it('点菜单项把动作回调交 app（actions[].onClick）', async () => {
    const user = userEvent.setup();
    const onReply = vi.fn();
    render(
      <ChatMessageActions actions={[{ label: '回复', onClick: onReply }]}>
        <ChatMessage variant="received" content="在吗？" />
      </ChatMessageActions>,
    );
    await user.click(screen.getByRole('button', { name: '消息操作' }));
    await user.click(screen.getByRole('menuitem', { name: '回复' }));
    expect(onReply).toHaveBeenCalledTimes(1);
  });

  it('指针路（右键 / 长按）：右键目标区开 ContextMenu，点项触发回调', async () => {
    const user = userEvent.setup();
    const onUndo = vi.fn();
    render(
      <ChatMessageActions actions={[{ label: '撤回', onClick: onUndo }]}>
        <ChatMessage variant="sent" content="刚发的" />
      </ChatMessageActions>,
    );
    // 右键消息区 → ContextMenu 弹出（radix 同一入口也接触屏长按）
    fireEvent.contextMenu(screen.getByText('刚发的'));
    await user.click(await screen.findByRole('menuitem', { name: '撤回' }));
    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  it('动作项可配置：icon 经 <Icon> 渲染为项内图标（非裸 svg）', async () => {
    const user = userEvent.setup();
    render(
      <ChatMessageActions actions={[{ label: '转发', icon: 'send' }]}>
        <ChatMessage variant="received" content="在吗？" />
      </ChatMessageActions>,
    );
    await user.click(screen.getByRole('button', { name: '消息操作' }));
    const item = screen.getByRole('menuitem', { name: /转发/ });
    expect(item.querySelector('svg')).not.toBeNull();
  });

  it('danger 项走危险态（如撤回）', async () => {
    const user = userEvent.setup();
    render(
      <ChatMessageActions actions={[{ label: '撤回', danger: true }]}>
        <ChatMessage variant="sent" content="刚发的" />
      </ChatMessageActions>,
    );
    await user.click(screen.getByRole('button', { name: '消息操作' }));
    // danger 态由复用件 DropdownMenu 的 less 描（此处只验它收到并渲染了该项）
    expect(screen.getByRole('menuitem', { name: '撤回' })).toBeInTheDocument();
  });

  it('触发钮有可及名（无可见文字 → triggerLabel）', () => {
    render(
      <ChatMessageActions actions={[{ label: '回复' }]} triggerLabel="更多操作">
        <ChatMessage variant="received" content="在吗？" />
      </ChatMessageActions>,
    );
    expect(
      screen.getByRole('button', { name: '更多操作' }),
    ).toHaveAccessibleName('更多操作');
  });

  it('键盘可达：聚焦触发钮后 Enter 开菜单', async () => {
    const user = userEvent.setup();
    render(
      <ChatMessageActions actions={[{ label: '回复' }]}>
        <ChatMessage variant="received" content="在吗？" />
      </ChatMessageActions>,
    );
    screen.getByRole('button', { name: '消息操作' }).focus();
    await user.keyboard('{Enter}');
    expect(
      await screen.findByRole('menuitem', { name: '回复' }),
    ).toBeInTheDocument();
  });

  it('className / style 透传到根容器', () => {
    render(
      <ChatMessageActions
        actions={[{ label: '回复' }]}
        className="custom"
        style={{ maxWidth: 300 }}
      >
        <ChatMessage variant="received" content="在吗？" />
      </ChatMessageActions>,
    );
    const wrap = document.querySelector(`.${styles.wrap}`);
    expect(wrap).toHaveClass('custom');
    expect(wrap).toHaveStyle({ maxWidth: '300px' });
  });
});
