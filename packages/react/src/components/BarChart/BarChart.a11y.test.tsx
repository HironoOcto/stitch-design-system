import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { BarChart } from './BarChart';

const data = [
  { month: '一月', visitors: 1200, views: 3400 },
  { month: '二月', visitors: 1800, views: 4100 },
];

describe('BarChart a11y', () => {
  it('柱状（单系列）无 axe 违规', async () => {
    const { container } = render(
      <BarChart
        data={data}
        xField="month"
        series={[{ dataKey: 'visitors', name: '独立访客' }]}
        ariaLabel="月度独立访客柱状图"
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('堆叠（多系列）无 axe 违规', async () => {
    const { container } = render(
      <BarChart
        data={data}
        xField="month"
        series={[
          { dataKey: 'visitors', name: '独立访客' },
          { dataKey: 'views', name: '页面浏览' },
        ]}
        stack
        ariaLabel="访客与浏览堆叠柱状图"
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
