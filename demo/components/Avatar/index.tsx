import { type CSSProperties } from 'react';
import { Avatar } from '@octohirono/stitch-design-system';

export const meta = {
  title: 'Avatar',
  description:
    '头像：展示用户 / 实体的小幅图像，图片加载失败或无 src 时优雅回退到 fallback（首字母 / 占位）。固定尺寸档（small 24 / middle 32 / large 40）+ 圆 / 方两形 + fallback 兜底。组合 Radix Avatar.Root/Image/Fallback。vs Image：Image 是通用图片（任意尺寸 + matte 相框 + 点击预览）；Avatar 是头像语义。换肤：方形圆角随 --stitch-radius-image、兜底面 --stitch-bg-card + 结构边随站变。',
};

const section: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--stitch-spacing-xl)',
};
const row: CSSProperties = {
  display: 'flex',
  gap: 'var(--stitch-spacing-lg)',
  alignItems: 'center',
  flexWrap: 'wrap',
};
const rowLabel: CSSProperties = {
  fontSize: 'var(--stitch-font-size-sm)',
  color: 'var(--stitch-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  margin: '0 0 var(--stitch-spacing-md)',
};

const PHOTO =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&h=160&dpr=2&q=80';
const BROKEN = '/does-not-exist.png';

export default function AvatarDemo() {
  return (
    <div style={section}>
      {/* 有图显图 —— 三尺寸档 */}
      <div>
        <p style={rowLabel}>有图显图 · size = small / middle / large</p>
        <div style={row}>
          <Avatar src={PHOTO} alt="用户头像" fallback="U" size="small" />
          <Avatar src={PHOTO} alt="用户头像" fallback="U" size="middle" />
          <Avatar src={PHOTO} alt="用户头像" fallback="U" size="large" />
        </div>
      </div>

      {/* 无图 / 加载失败 → fallback 兜底 */}
      <div>
        <p style={rowLabel}>无 src / 加载失败 → fallback 首字母兜底</p>
        <div style={row}>
          <Avatar fallback="张" size="small" />
          <Avatar fallback="李" size="middle" />
          <Avatar src={BROKEN} alt="加载失败示意" fallback="王" size="large" />
        </div>
      </div>

      {/* 形状：圆 / 方（方形圆角随 --stitch-radius-image 换肤）*/}
      <div>
        <p style={rowLabel}>shape = circle / square（方形圆角随站换肤）</p>
        <div style={row}>
          <Avatar
            src={PHOTO}
            alt="圆形头像"
            fallback="C"
            size="large"
            shape="circle"
          />
          <Avatar
            src={PHOTO}
            alt="方形头像"
            fallback="S"
            size="large"
            shape="square"
          />
          <Avatar fallback="方" size="large" shape="square" />
        </div>
      </div>
    </div>
  );
}
