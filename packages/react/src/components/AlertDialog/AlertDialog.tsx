// 1. React 及其生态
import React from 'react';

// 2. 内部组件（相对路径）
import { Modal } from '../Modal';
import { Button } from '../Button';

// 3. 样式（永远最后）
import styles from './alert-dialog.module.less';

/**
 * 确认框：在底件 `Modal` 之上只加「必须做一个选择」那一层，浮层底座 / 焦点陷阱 / Esc /
 * 焦点归还全复用 `Modal` + 共享 `_internal/useOverlay`（不重写）。相对普通 `Modal` 补四点：
 *
 * 1. **两个动作按钮**——取消（安全）+ 确认；均由库内 `Button` 渲染，随主题换肤。
 * 2. **`role="alertdialog"`**——告诉读屏这是不可忽略、必须决策的对话框（传给 Modal 的 role）。
 * 3. **点遮罩不关**（`maskClosable` 恒 `false`，不开放为 prop——确认框必须选一个）；**Esc = 取消**
 *    （等价点「取消」，可关，逻辑同 Modal 的 `onCancel`）。
 * 4. **初始焦点落在安全操作（取消）上**——取消钮在 footer 里渲染在确认钮之前，`useOverlay`
 *    打开时聚焦第一个可聚焦元素，故正文为纯文案时焦点自动落取消。
 *
 * 跨-prop 注意事项：
 * - **无受控 open 之外的状态**：显隐由父级 `open` 掌控，`onOk` / `onCancel` 回调决策结果；组件
 *   自身不持状态（确认框是一次性问答，非双模式表单件）。
 * - **确认可标危险态**：`okDanger` 把确认钮切到危险语义（删除类不可逆操作），仅改 `Button` 语义色，
 *   仍只读角色变量 `var(--stitch-*)`。
 * - 面 / 圆角 / 阴影 / 按钮长相全继承 `Modal` + `Button`，随主题换肤变化，本件不硬编码任何主题值。
 */
export interface AlertDialogProps {
  /** 是否可见 */
  open: boolean;
  /** 标题（问句 / 决策提示） */
  title?: React.ReactNode;
  /** 宽度 @default 416 */
  width?: number | string;
  /** 确认回调（点「确认」按钮触发） */
  onOk?: () => void;
  /** 取消回调（点「取消」按钮 / Esc 触发；确认框的安全出口） */
  onCancel?: () => void;
  /** 确认按钮文案 @default '确认' */
  okText?: React.ReactNode;
  /** 取消按钮文案 @default '取消' */
  cancelText?: React.ReactNode;
  /**
   * 确认是否为危险（不可逆）操作，确认钮切到危险语义
   * @default false
   */
  okDanger?: boolean;
  /** 确认框正文（要用户确认的说明文案） */
  children?: React.ReactNode;
  /** 自定义类名（透传到对话框面板） */
  className?: string;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
  open,
  title,
  width = 416,
  onOk,
  onCancel,
  okText = '确认',
  cancelText = '取消',
  okDanger = false,
  children,
  className,
}) => {
  return (
    <Modal
      open={open}
      title={title}
      width={width}
      role="alertdialog"
      // 确认框必须做选择：遮罩不可关（不开放为 prop），Esc 等价「取消」。
      maskClosable={false}
      onCancel={onCancel}
      className={className}
      footer={
        <>
          {/* 取消（安全操作）在前：打开时 useOverlay 聚焦首个可聚焦元素，故落在取消上。 */}
          <Button type="default" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button type="primary" danger={okDanger} onClick={onOk}>
            {okText}
          </Button>
        </>
      }
    >
      <div className={styles.message}>{children}</div>
    </Modal>
  );
};

AlertDialog.displayName = 'AlertDialog';
