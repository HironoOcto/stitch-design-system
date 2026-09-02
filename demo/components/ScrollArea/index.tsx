import { type CSSProperties } from 'react';
import { ScrollArea } from '@octohirono/stitch-design-system';

export const meta = {
  title: 'ScrollArea',
  description:
    '自定义滚动区：给内容区套一层样式统一的滚动条，抹平各浏览器原生滚动条的视觉差异。纯样式增强件——只包滚动条外观、不改 children 语义、不新增交互，使用者仍在 children 里放任意可滚动内容，由 className/style 定容器高度或最大高度。orientation（vertical 默认 / horizontal / both）决定渲哪条滚动条；内容在对应方向溢出时才现条（type="auto"，贴近原生语义）。滚动槽透明、Thumb 走 --stitch-text-muted 中性中灰（近原生手柄）+ hover/拖动加深到 --stitch-text-secondary、圆角走 --stitch-radius-button，换肤 seline↔steep 时 Thumb 色 / 圆角随之变化。键盘 / 焦点 / 滚动 / ARIA 由底层原语保证。',
};

const section: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--stitch-spacing-xl)',
  maxWidth: 560,
};
const rowLabel: CSSProperties = {
  fontSize: 'var(--stitch-font-size-sm)',
  color: 'var(--stitch-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  margin: '0 0 var(--stitch-spacing-lg)',
};
const box: CSSProperties = {
  border: 'var(--stitch-border-width) solid var(--stitch-border)',
  borderRadius: 'var(--stitch-radius-card)',
  background: 'var(--stitch-bg-card)',
  padding: 'var(--stitch-spacing-md)',
};
const para: CSSProperties = {
  color: 'var(--stitch-text-secondary)',
  fontSize: 'var(--stitch-font-size-base)',
  lineHeight: 'var(--stitch-line-height-base)',
  margin: '0 0 var(--stitch-spacing-md)',
};

const LINES = Array.from({ length: 18 }, (_, i) => i + 1);
const WIDE_TAGS = Array.from({ length: 12 }, (_, i) => `标签 ${i + 1}`);

export default function ScrollAreaDemo() {
  return (
    <div style={section}>
      <div>
        <p style={rowLabel}>纵向（默认）· 固定高度 → 内容溢出现条</p>
        <ScrollArea style={{ ...box, height: 180 }}>
          {LINES.map((n) => (
            <p key={n} style={para}>
              第 {n} 行：把滚动条外观统一到设计系统，抹平浏览器原生差异。
            </p>
          ))}
        </ScrollArea>
      </div>

      <div>
        <p style={rowLabel}>横向（orientation="horizontal"）· 定宽不换行</p>
        <ScrollArea orientation="horizontal" style={{ ...box, width: 420 }}>
          <div style={{ display: 'flex', gap: 'var(--stitch-spacing-md)' }}>
            {WIDE_TAGS.map((t) => (
              <span
                key={t}
                style={{
                  flex: '0 0 auto',
                  padding: 'var(--stitch-spacing-sm) var(--stitch-spacing-md)',
                  background: 'var(--stitch-bg-canvas)',
                  border:
                    'var(--stitch-border-width) solid var(--stitch-border-strong)',
                  borderRadius: 'var(--stitch-radius-button)',
                  color: 'var(--stitch-text-secondary)',
                  fontSize: 'var(--stitch-font-size-sm)',
                  whiteSpace: 'nowrap',
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div>
        <p style={rowLabel}>双向（orientation="both"）· 纵横两条 + 角块</p>
        <ScrollArea
          orientation="both"
          style={{ ...box, width: 420, height: 200 }}
        >
          <div style={{ width: 900 }}>
            {LINES.map((n) => (
              <p key={n} style={{ ...para, whiteSpace: 'nowrap' }}>
                第 {n}{' '}
                行：这一行很宽也很长，纵横都溢出——右下角出现角块衔接两条滚动条，
                滚动条的颜色 / 圆角随站点主题切换而变化。
              </p>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
