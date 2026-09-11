import { useState, type CSSProperties } from 'react';
import { ContextMenu } from '@octohirono/stitch-design-system';

export const meta = {
  title: 'ContextMenu',
  description:
    '右键菜单：在目标区域右键（触屏长按）弹出一列动作，点项触发动作、无选中态。与 DropdownMenu 同构——同一列动作、同 items 项结构（{ label, onClick?, danger?, disabled?, icon?, children? }）、同 menu/menuitem 语义、同浮起面皮，唯一区别是触发方式（右键 children 目标区 ↔ 点按钮）。对外 children（右键目标区）+ items 数组 + onOpenChange，无 trigger prop（锚在光标处）。items 映射成菜单项，children 非空即渲染成可展开子菜单；danger 项文字走 --stitch-danger。面走 --stitch-bg-elevated + --stitch-radius-card + --stitch-shadow-base，换肤 seline↔steep 时圆角 / 边框 / 阴影 / 字体随之变化。键盘 / 焦点 / ARIA / 定位由底层原语保证。',
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
  margin: '0 0 var(--stitch-spacing-lg)',
};
// 右键目标区：一块看得见的落点，提示用户在此右键。
const dropZone: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 120,
  padding: 'var(--stitch-spacing-xl)',
  border: '1px dashed var(--stitch-border)',
  borderRadius: 'var(--stitch-radius-card)',
  background: 'var(--stitch-bg-section)',
  color: 'var(--stitch-text-muted)',
  fontSize: 'var(--stitch-font-size-sm)',
  userSelect: 'none',
};

export default function ContextMenuDemo() {
  const [last, setLast] = useState<string>('—');
  return (
    <div style={section}>
      <div>
        <p style={rowLabel}>右键目标区 · 图标 + 危险项 + 禁用项 + 子菜单</p>
        <ContextMenu
          items={[
            { label: '打开', icon: 'eye', onClick: () => setLast('打开') },
            {
              label: '重命名',
              icon: 'search',
              onClick: () => setLast('重命名'),
            },
            { label: '归档（禁用）', disabled: true },
            {
              label: '分享到',
              icon: 'chevron-right',
              children: [
                { label: '微信', onClick: () => setLast('分享到微信') },
                { label: '微博', onClick: () => setLast('分享到微博') },
                {
                  label: '复制链接',
                  icon: 'check',
                  onClick: () => setLast('复制链接'),
                },
              ],
            },
            { label: '删除', danger: true, onClick: () => setLast('删除') },
          ]}
        >
          <div style={dropZone}>在此区域右键弹出菜单</div>
        </ContextMenu>
        <p
          style={{
            marginTop: 'var(--stitch-spacing-md)',
            fontSize: 'var(--stitch-font-size-sm)',
            color: 'var(--stitch-text-muted)',
          }}
        >
          最近动作：{last}
        </p>
      </div>

      <div>
        <p style={rowLabel}>
          长列表内滚动（超高度上限即滚，滚动条走 ScrollArea 自绘手柄）
        </p>
        <ContextMenu
          items={Array.from({ length: 20 }, (_, i) => ({
            label: `城市选项 ${i + 1}`,
            onClick: () => setLast(`城市选项 ${i + 1}`),
          }))}
        >
          <div style={dropZone}>在此区域右键弹出 20 项长列表菜单（可滚动）</div>
        </ContextMenu>
      </div>
    </div>
  );
}
