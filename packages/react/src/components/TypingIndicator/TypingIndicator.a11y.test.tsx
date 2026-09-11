import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { TypingIndicator } from './TypingIndicator';

describe('TypingIndicator a11y', () => {
  it('三点指示（role=status + 可访问名）无 axe 违规', async () => {
    const { container } = render(<TypingIndicator label="对方正在输入" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
