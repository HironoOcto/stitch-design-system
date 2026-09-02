import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Card } from '@octohirono/stitch-design-system';
import type { CardVariant, CardColor } from '@octohirono/stitch-design-system';

export const meta = {
  title: 'Card',
  description:
    '容器卡片（Ant Card 语义）：4 种表面（outlined 描边+淡影 / elevated 无边有影 / filled 填充无边无影 / dashed 虚线）+ 颜色（default / accent 强调面 / 语义 danger·success·warning·info / 抽象分类槽 cat-1…6）+ hoverable 抬起。源 animal 的长相色与花纹背景全丢，只读角色变量随换肤变化。',
};

const rowLabel: CSSProperties = {
  fontSize: 'var(--stitch-font-size-sm)',
  color: 'var(--stitch-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  margin: '0 0 var(--stitch-spacing-md)',
};
const grid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: 'var(--stitch-spacing-lg)',
};
const section: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--stitch-spacing-xl)',
};
const cardTitle: CSSProperties = {
  margin: '0 0 var(--stitch-spacing-sm)',
  fontFamily: 'var(--stitch-font-display)',
  fontSize: 'var(--stitch-font-size-lg)',
};
const cardBody: CSSProperties = {
  margin: 0,
  fontSize: 'var(--stitch-font-size-sm)',
};

const variants: CardVariant[] = ['outlined', 'elevated', 'filled', 'dashed'];
const semantics: CardColor[] = [
  'accent',
  'danger',
  'success',
  'warning',
  'info',
];
const cats: CardColor[] = [
  'cat-1',
  'cat-2',
  'cat-3',
  'cat-4',
  'cat-5',
  'cat-6',
];

function CardBlock({ label }: { label: string }) {
  return (
    <>
      <h3 style={cardTitle}>{label}</h3>
      <p style={cardBody}>卡片正文示例，展示面色与文字对比。</p>
    </>
  );
}

function HoverableCard() {
  const [count, setCount] = useState(0);
  return (
    <Card
      hoverable
      role="button"
      tabIndex={0}
      aria-label="可点击卡片"
      onClick={() => setCount((c) => c + 1)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setCount((c) => c + 1);
        }
      }}
    >
      <h3 style={cardTitle}>可点击卡片</h3>
      <p style={cardBody}>已点击 {count} 次（Tab 可达 · Enter/Space 触发）。</p>
    </Card>
  );
}

export default function CardDemo() {
  return (
    <div style={section}>
      <div>
        <p style={rowLabel}>Variant（表面处理 · color=default）</p>
        <div style={grid}>
          {variants.map((v) => (
            <Card key={v} variant={v}>
              <CardBlock label={v} />
            </Card>
          ))}
        </div>
      </div>

      <div>
        <p style={rowLabel}>颜色 · 强调面 + 语义状态（软底深字）</p>
        <div style={grid}>
          {semantics.map((c) => (
            <Card key={c} variant="filled" color={c}>
              <CardBlock label={c} />
            </Card>
          ))}
        </div>
      </div>

      <div>
        <p style={rowLabel}>抽象分类槽（cat-1…6 · filled）</p>
        <div style={grid}>
          {cats.map((c) => (
            <Card key={c} variant="filled" color={c}>
              <CardBlock label={c} />
            </Card>
          ))}
        </div>
      </div>

      <div>
        <p style={rowLabel}>语义色 · outlined（彩色描边）</p>
        <div style={grid}>
          {semantics.map((c) => (
            <Card key={c} variant="outlined" color={c}>
              <CardBlock label={c} />
            </Card>
          ))}
        </div>
      </div>

      <div>
        <p style={rowLabel}>Hoverable（键盘可达）</p>
        <div style={grid}>
          <HoverableCard />
          <Card variant="dashed" hoverable>
            <h3 style={cardTitle}>虚线 + hoverable</h3>
            <p style={cardBody}>hover 不位移，只加深虚线描边。</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
