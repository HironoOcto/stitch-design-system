import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Tooltip } from './Tooltip';

describe('Tooltip a11y', () => {
  it('默认（隐藏）无 axe 违规', async () => {
    const { container } = render(
      <Tooltip title="提示内容">
        <button>触发</button>
      </Tooltip>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('显示态（defaultOpen）无 axe 违规', async () => {
    const { container } = render(
      <Tooltip title="提示内容" defaultOpen>
        <button>触发</button>
      </Tooltip>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
