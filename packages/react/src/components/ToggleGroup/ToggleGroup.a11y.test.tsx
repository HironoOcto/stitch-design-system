import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { ToggleGroup, type ToggleGroupItem } from './ToggleGroup';

const ALIGN: ToggleGroupItem[] = [
  { value: 'left', label: '左对齐' },
  { value: 'center', label: '居中' },
  { value: 'right', label: '右对齐' },
];

describe('ToggleGroup a11y', () => {
  it('默认（全 off）态无 axe 违规', async () => {
    const { container } = render(
      <ToggleGroup type="single" items={ALIGN} aria-label="文本对齐" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('有选中项后仍无 axe 违规', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ToggleGroup type="single" items={ALIGN} aria-label="文本对齐" />,
    );
    await user.click(screen.getByRole('radio', { name: '居中' }));
    expect(await axe(container)).toHaveNoViolations();
  });

  it('纯图标项（以 value 作可访问名）无 axe 违规', async () => {
    const { container } = render(
      <ToggleGroup
        type="multiple"
        items={[
          { value: 'bold', icon: 'menu' },
          { value: 'italic', icon: 'search' },
        ]}
        aria-label="文本格式"
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
