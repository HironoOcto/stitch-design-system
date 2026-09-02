import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Toggle } from './Toggle';

describe('Toggle a11y', () => {
  it('未按下态无 axe 违规', async () => {
    const { container } = render(<Toggle>加粗</Toggle>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('按下态后仍无 axe 违规', async () => {
    const user = userEvent.setup();
    const { container } = render(<Toggle>加粗</Toggle>);
    await user.click(screen.getByRole('button', { name: '加粗' }));
    expect(await axe(container)).toHaveNoViolations();
  });

  it('纯图标 Toggle 带 aria-label 无 axe 违规', async () => {
    const { container } = render(<Toggle aria-label="斜体" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
