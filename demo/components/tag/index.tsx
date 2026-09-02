import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Tag } from '@octohirono/stitch-design-system';
import type { TagColor, TagVariant } from '@octohirono/stitch-design-system';

export const meta = {
  title: 'Tag',
  description:
    '标签 / 徽章（Ant Tag 语义）：3 尺寸 + 5 变体（solid/outlined/dashed/soft/text 无底无框 ghost）+ 语义色（default/danger/success/warning/info）+ 抽象分类槽（cat-1…6）+ 可关闭 + 可点击（键盘可达）+ disabled。关闭图标走 <Icon>，只读角色变量随换肤变化。',
};

const rowLabel: CSSProperties = {
  fontSize: 'var(--stitch-font-size-sm)',
  color: 'var(--stitch-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  margin: '0 0 var(--stitch-spacing-sm)',
};
const row: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--stitch-spacing-sm)',
  alignItems: 'center',
};
const section: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--stitch-spacing-xl)',
};

const variants: TagVariant[] = ['solid', 'outlined', 'dashed', 'soft', 'text'];
const semantics: TagColor[] = [
  'default',
  'danger',
  'success',
  'warning',
  'info',
];
const cats: TagColor[] = ['cat-1', 'cat-2', 'cat-3', 'cat-4', 'cat-5', 'cat-6'];

function ClosableTags() {
  const [tags, setTags] = useState(['设计', '前端', '换肤', '可关闭']);
  return (
    <div style={row}>
      {tags.map((t) => (
        <Tag
          key={t}
          color="cat-3"
          variant="soft"
          closable
          onClose={() => setTags((prev) => prev.filter((x) => x !== t))}
        >
          {t}
        </Tag>
      ))}
      {tags.length === 0 && (
        <button
          type="button"
          onClick={() => setTags(['设计', '前端', '换肤', '可关闭'])}
          style={{
            border: 'var(--stitch-border-width) solid var(--stitch-border)',
            background: 'transparent',
            color: 'var(--stitch-text-secondary)',
            borderRadius: 'var(--stitch-radius-button)',
            padding: 'var(--stitch-spacing-xs) var(--stitch-spacing-md)',
            cursor: 'pointer',
          }}
        >
          重置
        </button>
      )}
    </div>
  );
}

function ClickableTag() {
  const [count, setCount] = useState(0);
  return (
    <div style={row}>
      <Tag
        color="info"
        variant="outlined"
        onClick={() => setCount((c) => c + 1)}
      >
        点我 +1
      </Tag>
      <span
        style={{
          fontSize: 'var(--stitch-font-size-sm)',
          color: 'var(--stitch-text-muted)',
        }}
      >
        已点击 {count} 次
      </span>
    </div>
  );
}

export default function TagDemo() {
  return (
    <div style={section}>
      <div>
        <p style={rowLabel}>Size（small / middle / large）</p>
        <div style={row}>
          <Tag size="small" color="cat-1">
            small
          </Tag>
          <Tag size="middle" color="cat-1">
            middle
          </Tag>
          <Tag size="large" color="cat-1">
            large
          </Tag>
        </div>
      </div>

      {variants.map((variant) => (
        <div key={variant}>
          <p style={rowLabel}>Variant = {variant} · 语义色</p>
          <div style={row}>
            {semantics.map((color) => (
              <Tag key={color} variant={variant} color={color}>
                {color}
              </Tag>
            ))}
          </div>
        </div>
      ))}

      <div>
        <p style={rowLabel}>抽象分类槽（cat-1…6 · soft）</p>
        <div style={row}>
          {cats.map((color) => (
            <Tag key={color} variant="soft" color={color}>
              {color}
            </Tag>
          ))}
        </div>
      </div>

      <div>
        <p style={rowLabel}>可关闭</p>
        <ClosableTags />
      </div>

      <div>
        <p style={rowLabel}>可点击（键盘 Tab/Enter/Space 可达）</p>
        <ClickableTag />
      </div>

      <div>
        <p style={rowLabel}>Disabled</p>
        <div style={row}>
          <Tag disabled color="danger" variant="solid">
            禁用
          </Tag>
          <Tag disabled closable color="cat-4">
            禁用可关闭
          </Tag>
          <Tag disabled onClick={() => {}}>
            禁用可点击
          </Tag>
        </div>
      </div>
    </div>
  );
}
