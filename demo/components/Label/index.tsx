import { type CSSProperties } from 'react';
import { Label, Input } from '@octohirono/stitch-design-system';

export const meta = {
  title: 'Label',
  description:
    '表单标签：为一个表单控件提供文字标签，点标签即聚焦 / 激活该控件。基于原生 <label>，通过 htmlFor 关联控件 id。组合 Radix Label.Root（单 part）。vs Form：Form 会为它的每个 field 自动渲染 label；独立 Label 用于 Form 之外的零散控件关联（如手搭一个 Input 配标签）。极简无状态：文字走 --stitch-text-primary + --stitch-font-body（字族 / 字色随站换肤）。',
};

const section: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--stitch-spacing-xl)',
};
const field: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--stitch-spacing-xs)',
  maxWidth: 280,
};
const inlineField: CSSProperties = {
  display: 'flex',
  gap: 'var(--stitch-spacing-sm)',
  alignItems: 'center',
};
const rowLabel: CSSProperties = {
  fontSize: 'var(--stitch-font-size-sm)',
  color: 'var(--stitch-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  margin: '0 0 var(--stitch-spacing-md)',
};

export default function LabelDemo() {
  return (
    <div style={section}>
      {/* 标签在上 · 点标签即聚焦输入框（原生 <label for> 保证）*/}
      <div>
        <p style={rowLabel}>标签在上 · 点标签即聚焦</p>
        <div style={field}>
          <Label htmlFor="nickname">昵称</Label>
          <Input id="nickname" placeholder="请输入昵称" />
        </div>
      </div>

      {/* 标签在左 · 横排布局 */}
      <div>
        <p style={rowLabel}>标签在左 · 横排</p>
        <div style={inlineField}>
          <Label htmlFor="email">邮箱</Label>
          <Input id="email" placeholder="you@example.com" />
        </div>
      </div>

      {/* 关联禁用控件 · 标签本身无状态色（禁用语义由控件承载）*/}
      <div>
        <p style={rowLabel}>关联禁用控件 · 标签保持中性（禁用态由控件承载）</p>
        <div style={field}>
          <Label htmlFor="locked">锁定字段</Label>
          <Input id="locked" placeholder="不可编辑" disabled />
        </div>
      </div>
    </div>
  );
}
