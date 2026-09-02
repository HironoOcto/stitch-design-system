import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Label } from './Label';

describe('Label a11y', () => {
  // 关联控件（htmlFor → 控件 id）：标签为控件提供可及名 → 无 axe 违规
  it('关联控件时无 axe 违规', async () => {
    const { container } = render(
      <>
        <Label htmlFor="email">邮箱</Label>
        <input id="email" type="email" />
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
