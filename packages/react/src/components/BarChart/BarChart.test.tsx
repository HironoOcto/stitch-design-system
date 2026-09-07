import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BarChart } from './BarChart';

// 最小样例数据——两点一系列，够证外壳与公开面，不追求 recharts 在 jsdom 里真出 SVG
// （ResponsiveContainer 无版面尺寸时不绘制；系列色随主题跟随属 CSS 解析行为，在真实浏览器
//  dry_run 验，不在此伪造）。
const data = [
  { month: '一月', visitors: 1200 },
  { month: '二月', visitors: 1800 },
];

describe('BarChart', () => {
  it('整图作一张图对外——role="img" + 传入的 aria-label（第 7 维可及名）', () => {
    render(
      <BarChart
        data={data}
        xField="month"
        series={[{ dataKey: 'visitors', name: '访客' }]}
        ariaLabel="月度访客柱状图"
      />,
    );
    expect(screen.getByRole('img')).toHaveAccessibleName('月度访客柱状图');
  });

  it('未传 aria-label 时兜底一个非空可访问名（图表永不裸奔）', () => {
    render(
      <BarChart
        data={data}
        xField="month"
        series={[{ dataKey: 'visitors' }]}
      />,
    );
    const img = screen.getByRole('img');
    expect(img.getAttribute('aria-label')?.trim()).toBeTruthy();
  });

  it('堆叠 + 多系列 + 值格式化全开也稳定成图（公开面接线不炸）', () => {
    const multi = [
      { month: '一月', visitors: 1200, views: 3400 },
      { month: '二月', visitors: 1800, views: 4100 },
    ];
    render(
      <BarChart
        data={multi}
        xField="month"
        series={[
          { dataKey: 'visitors', name: '独立访客' },
          { dataKey: 'views', name: '页面浏览' },
        ]}
        stack
        height={240}
        valueFormatter={(v) => v.toLocaleString()}
        ariaLabel="访客与浏览堆叠柱状图"
      />,
    );
    expect(screen.getByRole('img')).toHaveAccessibleName(
      '访客与浏览堆叠柱状图',
    );
  });
});
