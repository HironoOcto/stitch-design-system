import { useState, type CSSProperties } from 'react';
import { Tooltip, Button } from '@octohirono/stitch-design-system';

export const meta = {
  title: 'Tooltip',
  description:
    '文字提示浮层：hover / focus / click 触发，12 向定位，受控（open/onOpenChange）与非受控双模式。源 animal 的品牌招牌造型已清：有机气泡 clip-path + 内联 SVG（island variant）整段丢弃 → 标准矩形浮层，圆角/边框/阴影随站点（--stitch-radius-card / --stitch-shadow-base）；采浅底浮层：奶油底 → --stitch-bg-elevated、深字 → --stitch-text-primary，边/箭头 → --stitch-text-disabled（#c4b89e 按字面表映禁用色）。换肤 seline↔steep 时圆角、边框色、阴影、字体随之变化。详见根 迁移笔记.md。',
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
      <Tooltip
        title="受控显示中"
        open={open}
        onOpenChange={setOpen}
        placement="right"
      >
        <Button>受控目标</Button>
      </Tooltip>
      <Button type="primary" onClick={() => setOpen((v) => !v)}>
        {open ? '隐藏' : '显示'}提示
      </Button>
    </div>
  );
}

export default function TooltipDemo() {
  return (
    <div style={section}>
      <div>
        <p style={rowLabel}>12 向定位（hover）</p>
        <div style={grid}>
          {(
            [
              'top',
              'top-start',
              'top-end',
              'bottom',
              'bottom-start',
              'bottom-end',
              'left',
              'left-start',
              'left-end',
              'right',
              'right-start',
              'right-end',
            ] as const
          ).map((p) => (
            <Tooltip key={p} title={`placement=${p}`} placement={p}>
              <Button>{p}</Button>
            </Tooltip>
          ))}
        </div>
      </div>

      <div>
        <p style={rowLabel}>触发方式</p>
        <div style={grid}>
          <Tooltip title="悬停触发" trigger="hover">
            <Button>hover</Button>
          </Tooltip>
          <Tooltip title="聚焦触发（键盘 Tab 可达）" trigger="focus">
            <Button>focus</Button>
          </Tooltip>
          <Tooltip title="点击切换" trigger="click">
            <Button>click</Button>
          </Tooltip>
        </div>
      </div>

      <div>
        <p style={rowLabel}>多行内容</p>
        <div style={grid}>
          <Tooltip
            title={'第一行说明\n第二行补充\n第三行细节'}
            placement="bottom"
          >
            <Button>多行提示</Button>
          </Tooltip>
        </div>
      </div>

      <div>
        <p style={rowLabel}>受控（open / onOpenChange）</p>
        <ControlledDemo />
      </div>
    </div>
  );
}
