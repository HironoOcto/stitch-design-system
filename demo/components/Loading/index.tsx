import { useState, type CSSProperties } from 'react';
import { Loading } from '@octohirono/stitch-design-system';

export const meta = {
  title: 'Loading',
  description:
    '全屏遮罩 + 纯 CSS 环形转圈 + 提示文案；spinning 切换显隐（对齐 Ant v5 Spin.spinning，源 animal 的 active 已归一）。源 animal 是整幅 Animal Crossing 海岛插画（裸 inline SVG + 内置 GSAP/MotionPathPlugin ~178KB + script.js 引擎 + 写死 background:black + 径向遮罩揭幕）——按 H1 零 animal 痕迹 / 唯一运行时依赖 radix / 禁裸 SVG 全丢，保留可复用行为（覆盖内容的忙碌指示 + 收起），转圈复用同源 Table 的纯 CSS 环，遮罩底走 --stitch-mask-bg。转圈弧色随 accent 换肤、圆角随站点、提示字体随站点变化。',
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
  gap: 'var(--stitch-spacing-lg)',
  alignItems: 'flex-start',
};
// Loading 是 position:absolute 的全屏遮罩 —— demo 用相对定位盒子把它框住
const box: CSSProperties = {
  position: 'relative',
  width: 220,
  height: 140,
  border: '1px solid var(--stitch-border)',
  borderRadius: 'var(--stitch-radius-card)',
  background: 'var(--stitch-bg-section)',
  overflow: 'hidden',
};
const boxCaption: CSSProperties = {
  position: 'absolute',
  top: 'var(--stitch-spacing-sm)',
  left: 'var(--stitch-spacing-sm)',
  fontSize: 'var(--stitch-font-size-sm)',
  color: 'var(--stitch-text-secondary)',
};

export default function LoadingDemo() {
  const [spinning, setSpinning] = useState(true);

  return (
    <div style={section}>
      <div>
        <p style={rowLabel}>Sizes</p>
        <div style={grid}>
          {(['small', 'middle', 'large'] as const).map((size) => (
            <div key={size} style={box}>
              <span style={boxCaption}>{size}</span>
              <Loading size={size} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <p style={rowLabel}>带提示文案（tip）</p>
        <div style={grid}>
          <div style={box}>
            <Loading tip="加载中…" />
          </div>
          <div style={box}>
            <Loading size="large" tip="正在保存你的更改" />
          </div>
        </div>
      </div>

      <div>
        <p style={rowLabel}>受控切换（spinning）</p>
        <div style={grid}>
          <div style={box}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--stitch-spacing-sm)',
                padding: 'var(--stitch-spacing-lg)',
                fontSize: 'var(--stitch-font-size-base)',
                color: 'var(--stitch-text-primary)',
              }}
            >
              <strong>内容区</strong>
              <span>数据表 / 图表内容……</span>
            </div>
            <Loading spinning={spinning} tip="加载中…" />
          </div>
          <button
            type="button"
            onClick={() => setSpinning((s) => !s)}
            style={{
              alignSelf: 'flex-start',
              padding: 'var(--stitch-spacing-sm) var(--stitch-spacing-lg)',
              border: '1px solid var(--stitch-border)',
              borderRadius: 'var(--stitch-radius-button)',
              background: 'var(--stitch-bg-elevated)',
              color: 'var(--stitch-text-primary)',
              cursor: 'pointer',
            }}
          >
            {spinning ? '停止加载' : '开始加载'}
          </button>
        </div>
      </div>
    </div>
  );
}
