import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Stat } from './Stat';
import { StatGroup } from './StatGroup';

describe('Stat a11y', () => {
  it('含趋势 + 副说明 + 状态点的完整指标块无 axe 违规', async () => {
    const { container } = render(
      <Stat
        title="Unique Visitors"
        value={9600}
        trend={{ value: 12, direction: 'up' }}
        caption="vs previous 30 days"
        status={{ text: '0 online', tone: 'neutral' }}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('一排 StatGroup 指标无 axe 违规', async () => {
    const { container } = render(
      <StatGroup>
        <Stat title="Total Visits" value={1200} />
        <Stat
          title="Bounce Rate"
          value={42}
          suffix="%"
          trend={{ value: 5, direction: 'down' }}
          trendReversed
        />
      </StatGroup>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
