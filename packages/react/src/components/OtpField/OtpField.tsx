// 1. React 及其生态
import React from 'react';
import { unstable_OneTimePasswordField as RadixOtp } from 'radix-ui';
import clsx from 'clsx';

// 3. 样式（永远最后）
import styles from './otp-field.module.less';

/**
 * 一次性验证码分格输入（OTP）：定长的一排单字符输入格，自动跳格、支持整段粘贴分发。
 * 按 `length` 渲染 `length` 个分格（外加隐藏聚合 input 供表单提交），取整串值：
 * `value`/`defaultValue`/`onChange`（整串）+ `disabled` + `autoFocus`。
 *
 * 跨-prop 注意事项：
 * - **length → 格数**：内部按 `length` 渲染 `length` 个分格（底层每个 `Input` = 一个字符位）；
 *   `length` 是渲染数量的唯一来源，不由 children 传入。
 * - **值聚合 → onChange(string)**：每格一字符，底层把各格拼成整串；值变更回调回**整串**
 *   （底层 `onValueChange(string)` → 我们的 `onChange(string)`）。
 * - **受控/非受控双模式**：给 `value` 由父管（配 `onChange`），只给 `defaultValue` 组件自管；
 *   两者均为整串、直接透传底层（不自持 state）。
 * - **vs Input**：Input 是单框自由文本；OtpField 是定长分格验证码（每格一字符、自动跳格）。
 * - **vs PasswordInput**：那是可明暗切换的密码框；OtpField 是分格验证码，二者别混。
 * - **Less 皮**：每格走 `--stitch-radius-input` + `--stitch-border`（focus → `--stitch-accent`
 *   + focus 环 `--stitch-focus-ring`），与表单控件族对齐；禁用态由底层给每格挂 `disabled`。
 * - **键盘 / 焦点 / 跳格 / 粘贴分发 / ARIA** 由底层保证，组件不重复实现。
 */
export interface OtpFieldProps {
  /** 格数（验证码位数）；内部按此渲染 length 个分格 */
  length: number;
  /** 受控值（整串） */
  value?: string;
  /** 非受控初始值（整串） */
  defaultValue?: string;
  /** 值变化回调；回聚合后的整串 */
  onChange?: (value: string) => void;
  /** 禁用 */
  disabled?: boolean;
  /** 挂载即聚焦第一格 */
  autoFocus?: boolean;
  /** 自定义类名（挂到根分格容器） */
  className?: string;
  /** 无障碍标签（给分格组一个可及名） */
  'aria-label'?: string;
  /** 关联外部可见 label 的 id */
  'aria-labelledby'?: string;
}

export const OtpField: React.FC<OtpFieldProps> = ({
  length,
  value,
  defaultValue,
  onChange,
  disabled = false,
  autoFocus,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}) => (
  <RadixOtp.Root
    className={clsx(styles.root, className)}
    value={value}
    defaultValue={defaultValue}
    onValueChange={onChange}
    disabled={disabled}
    autoFocus={autoFocus}
    aria-label={ariaLabel}
    aria-labelledby={ariaLabelledBy}
  >
    {Array.from({ length }, (_, i) => (
      <RadixOtp.Input key={i} className={styles.input} />
    ))}
    <RadixOtp.HiddenInput />
  </RadixOtp.Root>
);

OtpField.displayName = 'OtpField';
