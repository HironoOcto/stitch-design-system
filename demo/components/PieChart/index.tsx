import type { CSSProperties } from 'react';
import { PieChart } from '@octohirono/stitch-design-system';

export const meta = {
  title: 'PieChart',
  description:
    '饼 / 环图（data-viz 族，recharts 饼图引擎）：data + angleField + colorField 画一圈扇区；innerRadius 挖空中心成环形（donut），centerLabel 在中心放一个汇总值，valueFormatter 格式化 tooltip 值。扇区色一律走换肤桥读 var(--stitch-cat-*)、按序号循环，切站时整图跟随；默认出图例（分类名 → 色块）作不依赖颜色的区分通道。tooltip 复用 Card 表面，外壳 role="img" + aria-label。',
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

const browsers = [
  { browser: 'Chrome', visitors: 6200 },
  { browser: 'Safari', visitors: 3100 },
  { browser: 'Firefox', visitors: 1400 },
  { browser: 'Edge', visitors: 900 },
  { browser: '其他', visitors: 700 },
];

const total = browsers.reduce((sum, b) => sum + b.visitors, 0);
const compact = (v: number) => v.toLocaleString('en-US');

export default function PieChartDemo() {
  return (
    <div style={section}>
      <div>
        <p style={rowLabel}>实心饼 · 浏览器占比（扇区色走换肤桥，图例区分）</p>
        <PieChart
          data={browsers}
          angleField="visitors"
          colorField="browser"
          height={300}
          valueFormatter={compact}
          ariaLabel="浏览器访客占比饼图"
        />
      </div>

      <div>
        <p style={rowLabel}>
          环形 donut · 中心放总量（innerRadius 挖空中心，centerLabel 放汇总值）
        </p>
        <PieChart
          data={browsers}
          angleField="visitors"
          colorField="browser"
          innerRadius={0.6}
          centerLabel={compact(total)}
          height={300}
          valueFormatter={compact}
          ariaLabel="浏览器访客占比环形图"
        />
      </div>
    </div>
  );
}
