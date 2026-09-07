import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { LineChart } from './LineChart';

const data = [
  { month: '一月', revenue: 120, cost: 80 },
  { month: '二月', revenue: 180, cost: 90 },
];

describe('LineChart a11y', () => {
  it('折线（单系列）无 axe 违规', async () => {
    const { container } = render(
      <LineChart
        data={data}
        xField="month"
        series={[{ dataKey: 'revenue', name: '营收' }]}
        ariaLabel="月度营收折线图"
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('面积（多系列）无 axe 违规', async () => {
    const { container } = render(
      <LineChart
        data={data}
        xField="month"
        series={[
          { dataKey: 'revenue', name: '营收' },
          { dataKey: 'cost', name: '成本' },
        ]}
        area
        smooth
        ariaLabel="营收与成本面积图"
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
