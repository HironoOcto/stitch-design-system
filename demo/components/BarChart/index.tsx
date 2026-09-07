import type { CSSProperties } from 'react';
import { BarChart } from '@octohirono/stitch-design-system';

export const meta = {
  title: 'BarChart',
  description:
    '柱状图（data-viz 族，recharts 柱状引擎）：data + xField + series 画一排或多排柱；stack 把多系列堆叠成一柱、valueFormatter 格式化坐标轴与 tooltip 值。参考 seline 的扁平蓝柱（克制实心矩形）：系列色一律走换肤桥读 var(--stitch-cat-*)，切站时整图跟随；多系列另出图例（系列名 → 色块）作不依赖颜色的区分通道。tooltip 复用 Card 表面，外壳 role="img" + aria-label。',
};

const rowLabel: CSSProperties = {
  fontSize: 'var(--stitch-font-size-sm)',
  color: 'var(--stitch-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  margin: '0 0 var(--stitch-spacing-md)',
};
const section: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--stitch-spacing-xl)',
  maxWidth: 720,
};

const visitors = [
  { month: '一月', visitors: 3200 },
  { month: '二月', visitors: 4100 },
  { month: '三月', visitors: 3800 },
  { month: '四月', visitors: 5200 },
  { month: '五月', visitors: 4900 },
  { month: '六月', visitors: 6100 },
];

const traffic = [
  { month: '一月', visitors: 3200, views: 9800 },
  { month: '二月', visitors: 4100, views: 12400 },
  { month: '三月', visitors: 3800, views: 11200 },
  { month: '四月', visitors: 5200, views: 15600 },
  { month: '五月', visitors: 4900, views: 14800 },
  { month: '六月', visitors: 6100, views: 18900 },
];

const compact = (v: number) => v.toLocaleString('en-US');

export default function BarChartDemo() {
  return (
    <div style={section}>
      <div>
        <p style={rowLabel}>
          单系列 · 独立访客（seline 扁平蓝柱，克制实心矩形）
        </p>
        <BarChart
          data={visitors}
          xField="month"
          series={[{ dataKey: 'visitors', name: '独立访客' }]}
          height={260}
          valueFormatter={compact}
          ariaLabel="上半年月度独立访客柱状图"
        />
      </div>

      <div>
        <p style={rowLabel}>
          多系列分组并排 · 访客 vs 浏览（默认布局，不传
          stack；每组两柱并排，图例区分）
        </p>
        <BarChart
          data={traffic}
          xField="month"
          series={[
            { dataKey: 'visitors', name: '独立访客' },
            { dataKey: 'views', name: '页面浏览' },
          ]}
          height={260}
          valueFormatter={compact}
          ariaLabel="上半年访客与浏览分组柱状图"
        />
      </div>

      <div>
        <p style={rowLabel}>
          堆叠 · 访客 vs 浏览（stack
          把多系列堆成一柱，图例作不靠颜色的区分通道）
        </p>
        <BarChart
          data={traffic}
          xField="month"
          series={[
            { dataKey: 'visitors', name: '独立访客' },
            { dataKey: 'views', name: '页面浏览' },
          ]}
          stack
          height={260}
          valueFormatter={compact}
          ariaLabel="上半年访客与浏览堆叠柱状图"
        />
      </div>
    </div>
  );
}
