import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PieChart } from './PieChart';

// 最小样例数据——三扇区，够证外壳与公开面，不追求 recharts 在 jsdom 里真出 SVG
// （ResponsiveContainer 无版面尺寸时不绘制；扇区色随主题跟随属 CSS 解析行为，在真实浏览器
//  dry_run 验，不在此伪造）。
const data = [
  { browser: 'Chrome', visitors: 6200 },
  { browser: 'Safari', visitors: 3100 },
  { browser: 'Firefox', visitors: 1400 },
];

describe('PieChart', () => {
  it('整图作一张图对外——role="img" + 传入的 aria-label（第 7 维可及名）', () => {
    render(
      <PieChart
        data={data}
        angleField="visitors"
        colorField="browser"
        ariaLabel="浏览器占比饼图"
      />,
    );
    expect(screen.getByRole('img')).toHaveAccessibleName('浏览器占比饼图');
  });

  it('未传 aria-label 时兜底一个非空可访问名（图表永不裸奔）', () => {
    render(<PieChart data={data} angleField="visitors" colorField="browser" />);
    const img = screen.getByRole('img');
    expect(img.getAttribute('aria-label')?.trim()).toBeTruthy();
  });

  it('环形 + 中心值 + 图例 + 值格式化全开也稳定成图（公开面接线不炸）', () => {
    render(
      <PieChart
        data={data}
        angleField="visitors"
        colorField="browser"
        innerRadius={0.6}
        centerLabel="10,700"
        legend
        height={280}
        valueFormatter={(v) => v.toLocaleString()}
        ariaLabel="浏览器占比环形图"
      />,
    );
    expect(screen.getByRole('img')).toHaveAccessibleName('浏览器占比环形图');
  });
});
