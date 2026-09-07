import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Calendar } from './Calendar';

const SEP_2026 = new Date(2026, 8, 1);

describe('Calendar a11y', () => {
  it('single 模式无 axe 违规', async () => {
    const { container } = render(
      <Calendar defaultMonth={SEP_2026} defaultValue={new Date(2026, 8, 10)} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('range 模式（选定区间后）无 axe 违规', async () => {
    const { container } = render(
      <Calendar mode="range" defaultMonth={SEP_2026} />,
    );
    await userEvent.click(
      screen.getByRole('button', { name: /September 10th/ }),
    );
    await userEvent.click(
      screen.getByRole('button', { name: /September 14th/ }),
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
