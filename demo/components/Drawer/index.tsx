import { useState, type CSSProperties } from 'react';
import {
  Drawer,
  Button,
  type DrawerPlacement,
} from '@octohirono/stitch-design-system';

export const meta = {
  title: 'Drawer',
  description:
    '抽屉浮层：Portal 挂到 body，遮罩 + 从 placement 边缘（left/right/top/bottom）滑入面板，Esc / 点遮罩 / 关闭按钮关闭；焦点/滚动锁/Esc/焦点陷阱逻辑复用共享原语 _internal/useOverlay（与 Modal 同源）。props 归一为 Ant v5：open / onClose / placement / width / height / footer / maskClosable。源 animal 的「下沉景深」背景缩放（pushBackground：scale(0.94)+blur+14px 写死值、侵入式改兄弟 DOM）为品牌招牌交互，已按去品牌造型丢弃 → 标准贴边浮层，几何随 placement、圆角/阴影/字体随站点。关闭按钮 × Unicode 字符 → <Icon name="close">；奶油底 rgb(247,243,223) → --stitch-bg-elevated、棕字 → --stitch-text-primary/secondary、20px 药丸圆角 → --stitch-radius-card、方向阴影 → --stitch-shadow-base。换肤 seline↔steep 时圆角、阴影、标题字体随之变化。详见根 迁移笔记.md。',
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
  gap: 'var(--stitch-spacing-md)',
  alignItems: 'center',
};

function PlacementDemo() {
  const [placement, setPlacement] = useState<DrawerPlacement | null>(null);
  const options: DrawerPlacement[] = ['left', 'right', 'top', 'bottom'];
  return (
    <div style={grid}>
      {options.map((p) => (
        <Button key={p} onClick={() => setPlacement(p)}>
          {p}
        </Button>
      ))}
      <Drawer
        open={placement !== null}
        placement={placement ?? 'right'}
        title={`${placement ?? ''} 抽屉`}
        onClose={() => setPlacement(null)}
      >
        <p>从 {placement} 边缘滑入。Esc、点遮罩或右上角关闭按钮都能关闭。</p>
        <p>打开时焦点自动进入抽屉，Tab 在内部循环。</p>
      </Drawer>
    </div>
  );
}

function FooterDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div style={grid}>
      <Button type="primary" onClick={() => setOpen(true)}>
        带页脚 + 宽度 480
      </Button>
      <Drawer
        open={open}
        title="编辑资料"
        width={480}
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button onClick={() => setOpen(false)}>取消</Button>
            <Button type="primary" onClick={() => setOpen(false)}>
              保存
            </Button>
          </>
        }
      >
        <p>footer 传节点即渲染底部操作区，右对齐。</p>
      </Drawer>
    </div>
  );
}

function NoMaskCloseDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div style={grid}>
      <Button onClick={() => setOpen(true)}>遮罩不可关（仅 Esc / 按钮）</Button>
      <Drawer
        open={open}
        title="仅内容"
        maskClosable={false}
        onClose={() => setOpen(false)}
      >
        <p>maskClosable=false 时点遮罩不关，只能按 Esc 或关闭按钮。</p>
        <Button type="primary" onClick={() => setOpen(false)}>
          知道了
        </Button>
      </Drawer>
    </div>
  );
}

export default function DrawerDemo() {
  return (
    <div style={section}>
      <div>
        <p style={rowLabel}>四个方向（placement）</p>
        <PlacementDemo />
      </div>
      <div>
        <p style={rowLabel}>页脚 / 宽度</p>
        <FooterDemo />
      </div>
      <div>
        <p style={rowLabel}>遮罩不可关</p>
        <NoMaskCloseDemo />
      </div>
    </div>
  );
}
