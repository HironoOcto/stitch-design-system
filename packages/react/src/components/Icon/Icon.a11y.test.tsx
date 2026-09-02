import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Icon } from './Icon';

describe('Icon a11y', () => {
  it('有意义图标（label → role=img）无 axe 违规', async () => {
    const { container } = render(<Icon name="search" label="搜索" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('装饰性图标（aria-hidden）无 axe 违规', async () => {
    const { container } = render(<Icon name="menu" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
