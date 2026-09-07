import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { PieChart } from './PieChart';

const data = [
  { browser: 'Chrome', visitors: 6200 },
  { browser: 'Safari', visitors: 3100 },
  { browser: 'Firefox', visitors: 1400 },
];

describe('PieChart a11y', () => {
  it('实心饼无 axe 违规', async () => {
    const { container } = render(
      <PieChart
        data={data}
        angleField="visitors"
        colorField="browser"
        ariaLabel="浏览器占比饼图"
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('环形 + 中心值无 axe 违规', async () => {
    const { container } = render(
      <PieChart
        data={data}
        angleField="visitors"
        colorField="browser"
        innerRadius={0.6}
        centerLabel="10,700"
        ariaLabel="浏览器占比环形图"
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
