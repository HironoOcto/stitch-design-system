// 1. React 及其生态
import React from 'react';
import { Label as RadixLabel } from 'radix-ui';
import clsx from 'clsx';

// 3. 样式（永远最后）
import styles from './label.module.less';

/**
 * 表单标签：为一个表单控件（Input / Switch / Checkbox…）提供文字标签，点标签即
 * 聚焦 / 激活该控件。基于原生 `<label>`，通过 `htmlFor` 关联控件 id。组合 Radix
 * `Label.Root`（单 part）。
 *
 * 跨-prop 注意事项：
 * - **vs Form（表单容器）**：Form 会为它的每个 field **自动渲染** label（含必填星号 /
 *   冒号 / 对齐），无需手挂本组件；独立 `Label` 用于 **Form 之外**的零散控件关联——
 *   如手搭一个 `Input` 配文字标签时，用 `htmlFor` 指向控件 id。**不是**替代 Form 的
 *   label 体系。
 * - **`htmlFor` = 关联控件 id**：透传成原生 `<label for>`，浏览器据此把标签绑到同 id 的
 *   控件；点标签聚焦 / 激活控件由原生保证（无需自写点击逻辑）。控件用 `id`、标签用同值
 *   `htmlFor`。
 * - **极简无状态**：文字走 `--stitch-text-primary` + `--stitch-font-body`，无
 *   hover / disabled 等状态色（禁用语义由被关联的控件承载，非标签）。
 */
export interface LabelProps {
  /** 关联控件的 id：透传成原生 `<label for>`，点标签即聚焦 / 激活该控件 */
  htmlFor?: string;
  /** 标签文字内容 */
  children?: React.ReactNode;
  /** 自定义类名（挂到 `<label>` 上） */
  className?: string;
  /** 行内样式（挂到 `<label>` 上） */
  style?: React.CSSProperties;
}

export const Label: React.FC<LabelProps> = ({
  htmlFor,
  children,
  className,
  style,
}) => (
  <RadixLabel.Root
    htmlFor={htmlFor}
    className={clsx(styles.root, className)}
    style={style}
  >
    {children}
  </RadixLabel.Root>
);

Label.displayName = 'Label';
