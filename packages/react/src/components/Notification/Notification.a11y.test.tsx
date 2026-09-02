import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, act } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Notification, notificationDestroy } from './NotificationPortal';

const wait = (ms = 0) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

describe('Notification a11y', () => {
  beforeEach(async () => {
    notificationDestroy();
    await wait(300);
  });

  afterEach(async () => {
    notificationDestroy();
    await wait(300);
  });

  it('渲染态无 axe 违规', async () => {
    act(() => {
      Notification.info({ message: '无障碍标题', description: '一段说明文字' });
      Notification.error('出错了');
    });
    await waitFor(() => {
      expect(screen.getByText('无障碍标题')).toBeInTheDocument();
    });
    // notification 根挂在 body，用 body 覆盖整棵含 portal 的树
    expect(await axe(document.body)).toHaveNoViolations();
  });

  it('关闭按钮有 role=button 与可访问名「关闭」', async () => {
    act(() => {
      Notification.info('close me');
    });
    const closeBtn = await screen.findByLabelText('关闭');
    expect(closeBtn).toHaveRole('button');
    expect(closeBtn).toHaveAccessibleName('关闭');
  });

  it('onClick 通知本体成为可聚焦 button（role + tabindex）', async () => {
    act(() => {
      Notification.info({ message: '可点击通知', onClick: () => {} });
    });
    const card = (await screen.findByText('可点击通知')).closest(
      '[data-notification-key]',
    ) as HTMLElement;
    expect(card).toHaveAttribute('role', 'button');
    expect(card).toHaveAttribute('tabindex', '0');
  });
});
