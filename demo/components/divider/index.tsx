import type { CSSProperties } from 'react';
import { Divider } from '@octohirono/stitch-design-system';

export const meta = {
  title: 'Divider',
  description:
    '分隔线（Ant Divider 语义）：水平 / 垂直 + 实线 / 虚线 + 文字分隔线（left/center/right + plain）。线色走 --stitch-border（主结构分隔角色），随换肤变色；无品牌图片、无长相色。',
};

const label: CSSProperties = {
  fontSize: 'var(--stitch-font-size-sm)',
  color: 'var(--stitch-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  margin: '0 0 var(--stitch-spacing-sm)',
};
const section: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--stitch-spacing-xl)',
};
const para: CSSProperties = {
  color: 'var(--stitch-text-secondary)',
  fontFamily: 'var(--stitch-font-body)',
  fontSize: 'var(--stitch-font-size-base)',
  margin: 0,
};

export default function DividerDemo() {
  return (
    <div style={section}>
      <div>
        <p style={label}>水平 · 实线（默认）</p>
        <p style={para}>上一段内容。</p>
        <Divider />
        <p style={para}>下一段内容。</p>
      </div>

      <div>
        <p style={label}>水平 · 虚线（variant=dashed）</p>
        <p style={para}>上一段内容。</p>
        <Divider variant="dashed" />
        <p style={para}>下一段内容。</p>
      </div>

      <div>
        <p style={label}>垂直（type=vertical · 内联分隔）</p>
        <div style={para}>
          首页
          <Divider type="vertical" />
          文档
          <Divider type="vertical" />
          关于
          <Divider type="vertical" variant="dashed" />
          设置
        </div>
      </div>

      <div>
        <p style={label}>文字分隔线 · 位置（left / center / right）</p>
        <Divider orientation="left">靠左</Divider>
        <Divider orientation="center">居中</Divider>
        <Divider orientation="right">靠右</Divider>
      </div>

      <div>
        <p style={label}>文字分隔线 · 虚线 + plain（常规字重）</p>
        <Divider variant="dashed">强调标题</Divider>
        <Divider plain>普通说明文字</Divider>
      </div>
    </div>
  );
}
