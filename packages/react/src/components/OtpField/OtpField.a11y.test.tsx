import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { OtpField } from './OtpField';

describe('OtpField a11y', () => {
  it('默认（空）+ aria-label 无 axe 违规', async () => {
    const { container } = render(<OtpField length={6} aria-label="验证码" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('有值态 + aria-label 无 axe 违规', async () => {
    const { container } = render(
      <OtpField length={6} defaultValue="123" aria-label="验证码" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('禁用态无 axe 违规', async () => {
    const { container } = render(
      <OtpField length={6} disabled aria-label="验证码" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
