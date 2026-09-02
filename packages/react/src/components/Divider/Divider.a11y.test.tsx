import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Divider } from './Divider';

describe('Divider a11y', () => {
  it('水平实线分隔线无 axe 违规', async () => {
    const { container } = render(
      <div>
        <p>上段</p>
        <Divider />
        <p>下段</p>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('垂直分隔线（aria-orientation=vertical）无 axe 违规', async () => {
    const { container } = render(
      <div>
        <span>甲</span>
        <Divider type="vertical" />
        <span>乙</span>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('文字分隔线（可访问名）无 axe 违规', async () => {
    const { container } = render(<Divider variant="dashed">章节标题</Divider>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
