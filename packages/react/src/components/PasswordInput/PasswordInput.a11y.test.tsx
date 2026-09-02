import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { PasswordInput } from './PasswordInput';

describe('PasswordInput a11y', () => {
  it('带 label 关联的密码框（遮蔽态）无 axe 违规', async () => {
    const { container } = render(
      <>
        <label htmlFor="pwd">密码</label>
        <PasswordInput id="pwd" defaultValue="secret" />
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('切到可见态后仍无 axe 违规', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <>
        <label htmlFor="pwd">密码</label>
        <PasswordInput id="pwd" defaultValue="secret" />
      </>,
    );
    await user.click(screen.getByRole('button', { name: '显示密码' }));
    expect(await axe(container)).toHaveNoViolations();
  });
});
