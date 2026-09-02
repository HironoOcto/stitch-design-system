import { useState, type CSSProperties } from 'react';
import { AlertDialog, Button } from '@octohirono/stitch-design-system';

export const meta = {
  title: 'AlertDialog',
  description:
    '确认框（Modal 的确认框变体）：在底件 Modal 之上只加「必须做一个选择」那层——两个动作按钮（取消 + 确认）、role="alertdialog"（读屏提示不可忽略）、点遮罩不关（maskClosable 恒 false）、Esc = 取消、初始焦点落在安全操作（取消）上。浮层底座 / 焦点陷阱 / 焦点归还全复用 Modal + 共享 _internal/useOverlay，okDanger 把确认切到危险语义。面 / 圆角 / 阴影 / 按钮长相随主题换肤变化。',
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
        打开确认框
      </Button>
      <AlertDialog
        open={open}
        title="确认提交？"
        onCancel={() => setOpen(false)}
        onOk={() => setOpen(false)}
      >
        提交后将进入审核流程，确认继续吗？打开时焦点自动落在「取消」上，Esc
        等价点取消，点遮罩不关闭。
      </AlertDialog>
    </div>
  );
}

function DangerDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div style={grid}>
      <Button danger onClick={() => setOpen(true)}>
        删除（危险确认）
      </Button>
      <AlertDialog
        open={open}
        title="删除该项？"
        okText="删除"
        cancelText="再想想"
        okDanger
        onCancel={() => setOpen(false)}
        onOk={() => setOpen(false)}
      >
        此操作不可撤销，删除后无法恢复。确认钮标为危险语义。
      </AlertDialog>
    </div>
  );
}

export default function AlertDialogDemo() {
  return (
    <div style={section}>
      <div>
        <p style={rowLabel}>基础（取消 / 确认，初始焦点落取消）</p>
        <BasicDemo />
      </div>
      <div>
        <p style={rowLabel}>危险确认（okDanger + 自定义文案）</p>
        <DangerDemo />
      </div>
    </div>
  );
}
