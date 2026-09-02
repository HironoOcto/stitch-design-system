// 1. React 及其生态
import React, { useState, useCallback } from 'react';

// 2. 内部组件（相对路径）
import { Input, type InputProps } from '../Input';
import { Icon } from '../Icon';

// 3. 样式（永远最后）
import styles from './password-input.module.less';

/**
 * 密码框：在底件 `Input` 之上只加「明暗切换」那一层——`suffix` 槽 / `type` 透传 / 受控·非受控
 * 值范式 / 边框 / 校验态全复用 `Input`（不重写）。相对普通 `Input` 补一点：
 *
 * - 内部持 `visible` 态，`type = visible ? 'text' : 'password'` 透给底件（对外不暴露 `type`）；
 *   `suffix` 塞一个眼睛按钮，点击翻 `visible`，按钮的 `aria-label` 与 `<Icon>`（eye ↔ eye-off）
 *   随态切换。切换钮是原生 `<button type="button">`：可 Tab 聚焦、Enter/Space 触发。
 *
 * 跨-prop 注意事项：
 * - **省去 `type` / `suffix`**——由本件内部管；`type` 恒为 password/text 二态，`suffix` 恒为切换钮。
 * - **值仍走底件的受控/非受控双模式**：给 `value` 由父管，只给 `defaultValue` 组件自管
 *   （`onChange` 收到的与底件一致）。可见态只影响遮蔽显示，不改值。
 * - **切换钮图标走 `<Icon name="eye"/"eye-off">`**（描边、随 `--stitch-*` 换肤）——**Do NOT** 传
 *   emoji / Unicode / 裸 `<svg>`。可访问名由 `showAriaLabel` / `hideAriaLabel` 定。
 * - `visibilityToggle={false}` 时不渲染切换钮、恒遮蔽（`suffix` 留空，值仍可键入）。
 */
export interface PasswordInputProps extends Omit<
  InputProps,
  'type' | 'suffix'
> {
  /**
   * 是否显示明暗切换按钮（关掉则恒遮蔽）
   * @default true
   */
  visibilityToggle?: boolean;
  /**
   * 遮蔽态下切换钮的可访问名（点击将显示密码）
   * @default '显示密码'
   */
  showAriaLabel?: string;
  /**
   * 可见态下切换钮的可访问名（点击将隐藏密码）
   * @default '隐藏密码'
   */
  hideAriaLabel?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  visibilityToggle = true,
  showAriaLabel = '显示密码',
  hideAriaLabel = '隐藏密码',
  disabled = false,
  ...rest
}) => {
  const [visible, setVisible] = useState(false);
  const toggle = useCallback(() => setVisible((v) => !v), []);

  const suffix =
    visibilityToggle && !disabled ? (
      <button
        type="button"
        className={styles.toggle}
        onClick={toggle}
        aria-label={visible ? hideAriaLabel : showAriaLabel}
        aria-pressed={visible}
      >
        <Icon name={visible ? 'eye-off' : 'eye'} size={16} />
      </button>
    ) : undefined;

  return (
    <Input
      {...rest}
      type={visible ? 'text' : 'password'}
      disabled={disabled}
      suffix={suffix}
    />
  );
};

PasswordInput.displayName = 'PasswordInput';
