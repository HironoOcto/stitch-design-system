import type { CSSProperties } from 'react';
import { Image } from '@octohirono/stitch-design-system';

export const meta = {
  title: 'Image',
  description:
    '衬板相框（matte frame）+ 加载淡入 + 错误占位 + 点击大图预览（Ant Image preview 语义 · Portal + 焦点陷阱 + ESC + 遮罩关闭）。color matte 从源 animal 的 14 色长相盘改为「语义 + 抽象分类」，与同源 Card 对齐（default/accent/danger/success/warning/info/cat-1…6）。源写死白底 + 8/20px 圆角 + 3D 软影 + 聚焦黄 + 暖色深影 + 裸 CSS 叉号全丢；圆角走 --stitch-radius-image、影随站点强弱、matte 与焦点环随换肤变化。',
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
  maxWidth: 760,
};
const grid: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--stitch-spacing-lg)',
  alignItems: 'flex-start',
};

// 内联 SVG 占位图（demo 无网络依赖）：柔和风景色块。
const photo = (label: string, hue: number) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="160" viewBox="0 0 240 160">
      <rect width="240" height="160" fill="hsl(${hue} 45% 82%)"/>
      <circle cx="188" cy="40" r="22" fill="hsl(${hue} 70% 72%)"/>
      <path d="M0 130 L70 78 L120 118 L180 70 L240 120 L240 160 L0 160 Z" fill="hsl(${hue} 40% 62%)"/>
      <text x="120" y="150" font-family="sans-serif" font-size="13" fill="hsl(${hue} 30% 30%)" text-anchor="middle">${label}</text>
    </svg>`,
  )}`;

const matteColors = [
  'default',
  'accent',
  'danger',
  'success',
  'warning',
  'info',
  'cat-1',
  'cat-2',
  'cat-3',
  'cat-4',
  'cat-5',
  'cat-6',
] as const;

export default function ImageDemo() {
  return (
    <div style={section}>
      <div>
        <p style={rowLabel}>
          默认 · 点击图片开大图预览（真实图片 → 大图按原图尺寸铺开；Enter/Space
          亦可，ESC 关）
        </p>
        <Image
          src="https://images.unsplash.com/photo-1535025183041-0991a977e25b?w=1200&q=80&auto=format"
          alt="风景照"
          width={240}
          height={160}
        />
      </div>

      <div>
        <p style={rowLabel}>
          color matte · 语义 + 抽象分类（default / accent / 语义态 / cat-1…6）
        </p>
        <div style={grid}>
          {matteColors.map((color) => (
            <Image
              key={color}
              src={photo(color, 40)}
              alt={`matte ${color}`}
              color={color}
              width={150}
              height={100}
              preview={false}
            />
          ))}
        </div>
      </div>

      <div>
        <p style={rowLabel}>
          lazy 懒加载（loading="lazy"）· 关闭预览（纯展示）
        </p>
        <Image
          src={photo('Lazy', 260)}
          alt="懒加载图"
          width={240}
          height={160}
          lazy
          preview={false}
        />
      </div>

      <div>
        <p style={rowLabel}>
          加载失败 → 错误占位（&lt;Icon name="error"&gt; + 文案）
        </p>
        <Image
          src="/does-not-exist.png"
          alt="坏掉的图"
          width={200}
          height={140}
        />
      </div>
    </div>
  );
}
