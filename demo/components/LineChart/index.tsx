import type { CSSProperties } from 'react';
import { LineChart } from '@octohirono/stitch-design-system';

export const meta = {
  title: 'LineChart',
  description:
    '折线 / 面积图（data-viz 族，recharts 折线引擎）：data + xField + series 画一条或多条线；smooth 平滑、area 在线下渲染由系列色 color-mix 派生的软填充、valueFormatter 格式化坐标轴与 tooltip 值。系列色一律走换肤桥读 var(--stitch-cat-*)，切站时整图跟随；多系列不只靠颜色分——另加线型（虚实点划）与末端标名两条不依赖颜色的通道。tooltip 复用 Card 表面，外壳 role="img" + aria-label。',
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

const revenue = [
  { month: '一月', revenue: 28200 },
  { month: '二月', revenue: 31500 },
  { month: '三月', revenue: 29800 },
  { month: '四月', revenue: 36400 },
  { month: '五月', revenue: 39100 },
  { month: '六月', revenue: 42076 },
];

const compare = [
  { month: '一月', revenue: 28200, cost: 18400 },
  { month: '二月', revenue: 31500, cost: 19100 },
  { month: '三月', revenue: 29800, cost: 20200 },
  { month: '四月', revenue: 36400, cost: 21800 },
  { month: '五月', revenue: 39100, cost: 22500 },
  { month: '六月', revenue: 42076, cost: 24300 },
];

const usd = (v: number) => `$${v.toLocaleString('en-US')}`;

export default function LineChartDemo() {
  return (
    <div style={section}>
      <div>
        <p style={rowLabel}>
          面积 · 单系列营收（细单线 + 派生软填充 + 货币格式化）
        </p>
        <LineChart
          data={revenue}
          xField="month"
          series={[{ dataKey: 'revenue', name: '营收' }]}
          area
          height={260}
          valueFormatter={usd}
          ariaLabel="上半年月度营收面积图"
        />
      </div>

      <div>
        <p style={rowLabel}>
          多系列折线 · 营收 vs 成本（平滑曲线，线型 + 末端标名区分，不靠颜色）
        </p>
        <LineChart
          data={compare}
          xField="month"
          series={[
            { dataKey: 'revenue', name: '营收' },
            { dataKey: 'cost', name: '成本' },
          ]}
          smooth
          height={260}
          valueFormatter={usd}
          ariaLabel="上半年营收与成本折线图"
        />
      </div>
    </div>
  );
}
