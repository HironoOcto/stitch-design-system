import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Line, LineChart } from 'recharts';
import { ChartFrame } from './ChartFrame';

// 最小图表子节点——ChartFrame 只负责响应式包法 + a11y 外壳，不关心画什么。
const chart = (
  <LineChart data={[{ x: 1, y: 2 }]}>
    <Line dataKey="y" />
  </LineChart>
);

describe('ChartFrame 响应式 + a11y 外壳', () => {
  it('对外暴露 role="img" + 传入的 aria-label（图表整体作一张图读）', () => {
    render(<ChartFrame ariaLabel="季度营收折线图">{chart}</ChartFrame>);
    expect(screen.getByRole('img')).toHaveAccessibleName('季度营收折线图');
  });

  it('未传 aria-label 时兜底一个非空可访问名（外壳保证图表永不裸奔）', () => {
    render(<ChartFrame>{chart}</ChartFrame>);
    const img = screen.getByRole('img');
    expect(img.getAttribute('aria-label')?.trim()).toBeTruthy();
  });
});
