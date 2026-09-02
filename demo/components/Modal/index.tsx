import { useState, type CSSProperties } from 'react';
import { Modal, Button } from '@octohirono/stitch-design-system';

export const meta = {
  title: 'Modal',
  description:
    '对话框浮层：Portal 挂到 body，遮罩 + 居中面板，Esc / 点遮罩关闭；打开时焦点送进对话框并做 Tab 焦点陷阱，关闭时焦点归还触发元素（焦点/滚动锁/Esc 逻辑抽进共享原语 _internal/useOverlay，Drawer 复用）。props 归一为 Ant v5：open / onOk / onCancel / footer / width / maskClosable。源 animal 的品牌招牌造型已整段清除：有机气泡 clip-path + 内联 SVG（objectBoundingBox path）→ 标准矩形浮层，圆角随站点 --stitch-radius-card；打字机 Typewriter + Cursor 品牌装饰 + typewriter/typeSpeed 两 prop 丢弃；奶油底 rgb(247,243,223) → --stitch-bg-elevated、棕字 #725d42 → --stitch-text-primary、正文 #8a7b66 → --stitch-text-secondary、黄药丸页脚按钮 → 标准 Button（accent）。换肤 seline↔steep 时圆角、阴影、标题字体（--stitch-font-display）、正文字体随之变化。详见根 迁移笔记.md。',
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

function BasicDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div style={grid}>
      <Button type="primary" onClick={() => setOpen(true)}>
        打开对话框
      </Button>
      <Modal
        open={open}
        title="确认操作"
        onCancel={() => setOpen(false)}
        onOk={() => setOpen(false)}
      >
        <p>这是一段对话框正文，点「确定 / 取消」、Esc 或遮罩都能关闭。</p>
        <p>打开时焦点自动进入对话框，Tab 在内部循环。</p>
      </Modal>
    </div>
  );
}

function NoFooterDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div style={grid}>
      <Button onClick={() => setOpen(true)}>无页脚 + 不可点遮罩</Button>
      <Modal
        open={open}
        title="仅内容"
        footer={null}
        maskClosable={false}
        onCancel={() => setOpen(false)}
      >
        <p>
          footer={'{'}null{'}'} 隐藏页脚；maskClosable=false 时只能按 Esc 关闭。
        </p>
        <Button type="primary" onClick={() => setOpen(false)}>
          知道了
        </Button>
      </Modal>
    </div>
  );
}

function CustomFooterDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div style={grid}>
      <Button onClick={() => setOpen(true)}>自定义页脚 + 宽度 720</Button>
      <Modal
        open={open}
        title="自定义页脚"
        width={720}
        onCancel={() => setOpen(false)}
        footer={
          <>
            <Button onClick={() => setOpen(false)}>稍后再说</Button>
            <Button type="primary" danger onClick={() => setOpen(false)}>
              删除
            </Button>
          </>
        }
      >
        <p>footer 传自定义节点即覆盖默认「取消/确定」。</p>
      </Modal>
    </div>
  );
}

export default function ModalDemo() {
  return (
    <div style={section}>
      <div>
        <p style={rowLabel}>基础（默认页脚：取消 / 确定）</p>
        <BasicDemo />
      </div>
      <div>
        <p style={rowLabel}>无页脚 / 遮罩不可关</p>
        <NoFooterDemo />
      </div>
      <div>
        <p style={rowLabel}>自定义页脚 / 宽度</p>
        <CustomFooterDemo />
      </div>
    </div>
  );
}
