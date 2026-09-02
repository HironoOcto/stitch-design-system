import { useState, type CSSProperties } from 'react';
import { Skeleton } from '@octohirono/stitch-design-system';

export const meta = {
  title: 'Skeleton',
  description:
    '加载占位骨架：中性底块 + 扫光高光；variant 覆盖 text/circle/rect/paragraph，另有 Skeleton.Button / .Input / .Avatar 三个便捷占位。loading=false 时渲染真实 children。源 animal 的品牌招牌（写死暖灰底 #eae5db/#dfd9ce + 银白流光 + 药丸 50px 圆角）已全丢：底走 --stitch-bg-disabled 中性占位面、扫光走半透明 --stitch-bg-elevated、圆角按元素取 --stitch-radius-*（迁移后随站点换肤，不再固定药丸）。扫光是持续加载动画（同 Loading 转圈的豁免），prefers-reduced-motion 下停。',
};

const section: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--stitch-spacing-xl)',
  maxWidth: 760,
};
const rowLabel: CSSProperties = {
  fontSize: 'var(--stitch-font-size-sm)',
  color: 'var(--stitch-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  margin: '0 0 var(--stitch-spacing-md)',
};
const grid: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--stitch-spacing-xl)',
  alignItems: 'flex-start',
};
const card: CSSProperties = {
  padding: 'var(--stitch-spacing-lg)',
  border: '1px solid var(--stitch-border)',
  borderRadius: 'var(--stitch-radius-card)',
  background: 'var(--stitch-bg-section)',
};

export default function SkeletonDemo() {
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(true);

  return (
    <div style={section}>
      <div>
        <p style={rowLabel}>Variants</p>
        <div style={grid}>
          <div style={{ ...card, width: 240 }}>
            <Skeleton variant="text" active={active} />
            <Skeleton variant="text" width="60%" active={active} />
          </div>
          <div style={card}>
            <Skeleton variant="circle" active={active} />
          </div>
          <div style={card}>
            <Skeleton variant="rect" width={200} height={120} active={active} />
          </div>
          <div style={{ ...card, width: 260 }}>
            <Skeleton variant="paragraph" rows={4} active={active} />
          </div>
        </div>
      </div>

      <div>
        <p style={rowLabel}>便捷占位（Button / Input / Avatar）</p>
        <div style={grid}>
          {(['small', 'middle', 'large'] as const).map((size) => (
            <div
              key={size}
              style={{
                ...card,
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--stitch-spacing-md)',
              }}
            >
              <Skeleton.Avatar size={size} active={active} />
              <Skeleton.Button size={size} active={active} />
              <Skeleton.Input size={size} active={active} />
            </div>
          ))}
          <div style={card}>
            <Skeleton.Avatar shape="square" active={active} />
          </div>
        </div>
      </div>

      <div>
        <p style={rowLabel}>组合示例（头像 + 段落）</p>
        <div
          style={{
            ...card,
            width: 360,
            display: 'flex',
            gap: 'var(--stitch-spacing-lg)',
          }}
        >
          <Skeleton.Avatar size="large" active={active} />
          <div style={{ flex: 1 }}>
            <Skeleton variant="paragraph" rows={3} active={active} />
          </div>
        </div>
      </div>

      <div>
        <p style={rowLabel}>受控切换（loading / active）</p>
        <div style={{ ...card, width: 360 }}>
          <Skeleton
            variant="paragraph"
            rows={3}
            loading={loading}
            active={active}
          >
            <div
              style={{
                fontSize: 'var(--stitch-font-size-base)',
                color: 'var(--stitch-text-primary)',
                lineHeight: 'var(--stitch-line-height-base)',
              }}
            >
              真实内容：加载完成后骨架被替换为这段文字。
            </div>
          </Skeleton>
        </div>
        <div
          style={{
            display: 'flex',
            gap: 'var(--stitch-spacing-md)',
            marginTop: 'var(--stitch-spacing-lg)',
          }}
        >
          <button
            type="button"
            onClick={() => setLoading((v) => !v)}
            style={btn}
          >
            {loading ? '加载完成' : '重新加载'}
          </button>
          <button
            type="button"
            onClick={() => setActive((v) => !v)}
            style={btn}
          >
            {active ? '关闭扫光' : '开启扫光'}
          </button>
        </div>
      </div>
    </div>
  );
}

const btn: CSSProperties = {
  padding: 'var(--stitch-spacing-sm) var(--stitch-spacing-lg)',
  border: '1px solid var(--stitch-border)',
  borderRadius: 'var(--stitch-radius-button)',
  background: 'var(--stitch-bg-elevated)',
  color: 'var(--stitch-text-primary)',
  cursor: 'pointer',
};
