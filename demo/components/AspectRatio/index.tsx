import { type CSSProperties } from 'react';
import { AspectRatio } from '@octohirono/stitch-design-system';

export const meta = {
  title: 'AspectRatio',
  description:
    '锁宽高比容器：把 children 约束在固定宽高比（如 16/9、4/3、1）里，宽度自适应、高度按比例算出，避免媒体加载前后的布局抖动（CLS）。纯布局件——无皮无状态、无 --stitch-* 颜色角色可上，圆角/边框/底色等观感由使用者在 children 或 className/style 上定，本组件只撑出比例框。常配 Image / Avatar 等媒体（媒体自身设 width:100%; height:100%; object-fit:cover 填满框）。ratio 直接透传底层（宽 ÷ 高，默认 1）。换肤对布局件无色变（布局与主题正交）。',
};

const section: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--stitch-spacing-xl)',
  alignItems: 'flex-start',
};
const cell: CSSProperties = {
  width: 260,
};
const rowLabel: CSSProperties = {
  fontSize: 'var(--stitch-font-size-sm)',
  color: 'var(--stitch-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  margin: '0 0 var(--stitch-spacing-md)',
};
// 使用者在比例框内容层上定观感（边框/圆角），布局件本身不带皮。
const frame: CSSProperties = {
  border: 'var(--stitch-border-width) solid var(--stitch-border)',
  borderRadius: 'var(--stitch-radius-card)',
  overflow: 'hidden',
};
// 媒体填满比例框：同一张图在不同 ratio 下 object-fit:cover 裁切，凸显「框定比例」而非拉伸。
const mediaImg: CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
};

const PHOTO =
  'https://images.unsplash.com/photo-1535025183041-0991a977e25b?w=300&dpr=2&q=80';

const RATIOS: { label: string; ratio: number }[] = [
  { label: '16 / 9', ratio: 16 / 9 },
  { label: '4 / 3', ratio: 4 / 3 },
  { label: '1 / 1', ratio: 1 },
  { label: '3 / 4', ratio: 3 / 4 },
];

export default function AspectRatioDemo() {
  return (
    <div style={section}>
      {RATIOS.map(({ label, ratio }) => (
        <div key={label} style={cell}>
          <p style={rowLabel}>ratio = {label}</p>
          <AspectRatio ratio={ratio} style={frame}>
            <img src={PHOTO} alt={`比例 ${label} 示意`} style={mediaImg} />
          </AspectRatio>
        </div>
      ))}
    </div>
  );
}
