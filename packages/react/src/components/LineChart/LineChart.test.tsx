import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LineChart } from './LineChart';

// 最小样例数据——两点一系列，够证外壳与公开面，不追求 recharts 在 jsdom 里真出 SVG
// （ResponsiveContainer 无版面尺寸时不绘制；系列色随主题跟随属 CSS 解析行为，在真实浏览器
//  dry_run 验，不在此伪造）。
const data = [
  { month: '一月', revenue: 120 },
  { month: '二月', revenue: 180 },
];

describe('LineChart', () => {
  it('整图作一张图对外——role="img" + 传入的 aria-label（第 7 维可及名）', () => {
    render(
      <LineChart
        data={data}
        xField="month"
        series={[{ dataKey: 'revenue', name: '营收' }]}
        ariaLabel="月度营收折线图"
      />,
    );
    expect(screen.getByRole('img')).toHaveAccessibleName('月度营收折线图');
  });

  it('未传 aria-label 时兜底一个非空可访问名（图表永不裸奔）', () => {
    render(
      <LineChart
        data={data}
        xField="month"
        series={[{ dataKey: 'revenue' }]}
      />,
    );
    const img = screen.getByRole('img');
    expect(img.getAttribute('aria-label')?.trim()).toBeTruthy();
  });

  it('面积 + 平滑 + 多系列 + 值格式化全开也稳定成图（公开面接线不炸）', () => {
    const multi = [
      { month: '一月', revenue: 120, cost: 80 },
      { month: '二月', revenue: 180, cost: 90 },
    ];
    render(
      <LineChart
        data={multi}
        xField="month"
        series={[
          { dataKey: 'revenue', name: '营收' },
          { dataKey: 'cost', name: '成本' },
        ]}
        area
        smooth
        height={240}
        valueFormatter={(v) => `$${v.toLocaleString()}`}
        ariaLabel="营收与成本面积图"
      />,
    );
    expect(screen.getByRole('img')).toHaveAccessibleName('营收与成本面积图');
  });
});
