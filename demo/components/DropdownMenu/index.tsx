import { useState, type CSSProperties } from 'react';
import { DropdownMenu, Button } from '@octohirono/stitch-design-system';

export const meta = {
  title: 'DropdownMenu',
  description:
    '动作菜单：点按钮弹出一列动作，点项触发动作、无选中态。对外 trigger + items 数组（{ label, onClick?, danger?, disabled?, icon?, children? }）+ 受控 open/onOpenChange。items 映射成菜单项，children 非空即渲染成可展开子菜单；danger 项文字走 --stitch-danger，高亮态用底层 data-highlighted。面走 --stitch-bg-elevated + --stitch-radius-card + --stitch-shadow-base，换肤 seline↔steep 时圆角 / 边框 / 阴影 / 字体随之变化。键盘 / 焦点 / ARIA 由底层原语保证。vs Select：那是选值（有受控 value、有选中态）；vs ContextMenu：同为动作列，差在右键触发。',
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
const grid: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--stitch-spacing-xl)',
  alignItems: 'center',
};

function ControlledDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div style={grid}>
      <DropdownMenu
        open={open}
        onOpenChange={setOpen}
        trigger={<Button>受控菜单</Button>}
        items={[
          { label: '重命名', onClick: () => alert('重命名') },
          { label: '复制', onClick: () => alert('复制') },
        ]}
      />
      <Button type="primary" onClick={() => setOpen((v) => !v)}>
        {open ? '关闭' : '打开'}菜单
      </Button>
    </div>
  );
}

export default function DropdownMenuDemo() {
  return (
    <div style={section}>
      <div>
        <p style={rowLabel}>非受控 · 图标 + 危险项 + 禁用项</p>
        <div style={grid}>
          <DropdownMenu
            trigger={<Button>账户菜单</Button>}
            items={[
              { label: '个人资料', icon: 'eye', onClick: () => {} },
              { label: '搜索', icon: 'search', onClick: () => {} },
              { label: '归档（禁用）', disabled: true },
              { label: '退出登录', danger: true, onClick: () => {} },
            ]}
          />
        </div>
      </div>

      <div>
        <p style={rowLabel}>子菜单（children 非空即可展开）</p>
        <div style={grid}>
          <DropdownMenu
            trigger={<Button>更多操作</Button>}
            items={[
              { label: '编辑', onClick: () => {} },
              {
                label: '分享到',
                icon: 'chevron-right',
                children: [
                  { label: '微信', onClick: () => {} },
                  { label: '微博', onClick: () => {} },
                  { label: '复制链接', icon: 'check', onClick: () => {} },
                ],
              },
              { label: '删除', danger: true, onClick: () => {} },
            ]}
          />
        </div>
      </div>

      <div>
        <p style={rowLabel}>受控（open / onOpenChange）</p>
        <ControlledDemo />
      </div>
    </div>
  );
}
