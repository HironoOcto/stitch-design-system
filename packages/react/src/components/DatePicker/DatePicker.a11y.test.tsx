import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { DatePicker } from './DatePicker';

describe('DatePicker a11y', () => {
  it('闭合态（含清除按钮）无 axe 违规', async () => {
    const { container } = render(
      <DatePicker aria-label="预约日期" defaultValue={new Date(2026, 8, 15)} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('展开态（浮层内 Calendar）无 axe 违规', async () => {
    render(
      <DatePicker aria-label="预约日期" defaultValue={new Date(2026, 8, 1)} />,
    );
    await userEvent.click(screen.getByRole('button', { name: '预约日期' }));
    // 浮层是 role="dialog"，取它做扫描根
    const dialog = screen.getByRole('dialog');
    expect(await axe(dialog)).toHaveNoViolations();
  });
});
