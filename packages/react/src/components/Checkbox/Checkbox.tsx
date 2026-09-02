// 1. React 及其生态
import React, { useState, useCallback, useId } from 'react';
import clsx from 'clsx';

// 2. 内部组件（相对路径）
import { Icon } from '../Icon';

// 3. 样式（永远最后）
import styles from './checkbox.module.less';

export type CheckboxSize = 'small' | 'middle' | 'large';

export interface CheckboxOption {
  /** 选项标签 */
  label: React.ReactNode;
  /** 选项值 */
  value: string | number;
  /** 是否禁用该选项 */
  disabled?: boolean;
}

/**
 * 多选组（Ant `Checkbox.Group` 语义）：`options` + `value` / `defaultValue` 为**数组**、
 * `onChange` 收整组选中值数组。与 Radio（单选、标量）成对——多选用勾标记、单选用圆点。
 *
 * 跨-prop 注意事项：
 * - **受控/非受控双模式**：给 `value` 由父管，只给 `defaultValue` 组件自管。
 * - **勾选标记走 `<Icon name="check">`**（装饰 `aria-hidden`），非裸 `<svg>`；勾色随
 *   `--stitch-accent-text`（与填充面成对比）。选中态为纯淡入，无爆闪/勾线动画。
 * - **键盘**：原生 `<input type="checkbox">`，Tab 可聚焦、Space 切换；聚焦环
 *   `:focus-visible` + `--stitch-focus-ring`。
 * - **盒子结构**：1px 边框（`--stitch-border`，hover 未选中项 → `--stitch-border-strong`），
 *   填充白面 `--stitch-bg-elevated`；选中填 `--stitch-accent` + 边 `--stitch-accent-active`。
 *   圆角走表单控件档 `--stitch-radius-input`（随主题变）。
 */
export interface CheckboxProps {
  /** 选中的值列表（受控） */
  value?: Array<string | number>;
  /** 默认选中的值列表（非受控） */
  defaultValue?: Array<string | number>;
  /** 选项列表 */
  options: CheckboxOption[];
  /** 尺寸 */
  size?: CheckboxSize;
  /** 禁用全部 */
  disabled?: boolean;
  /** 布局方向 */
  direction?: 'horizontal' | 'vertical';
  /** 变化回调 */
  onChange?: (values: Array<string | number>) => void;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

// 勾选标记图标尺寸（按盒子尺寸取，占约 2/3）。
const CHECK_SIZE: Record<CheckboxSize, number> = {
  small: 12,
  middle: 15,
  large: 19,
};

export const Checkbox: React.FC<CheckboxProps> = ({
  value,
  defaultValue = [],
  options,
  size = 'middle',
  disabled = false,
  direction = 'horizontal',
  onChange,
  className,
  style,
}) => {
  const [innerValue, setInnerValue] =
    useState<Array<string | number>>(defaultValue);
  const isControlled = value !== undefined;
  const checkedValues = isControlled ? value! : innerValue;
  const reactId = useId();
  const idBase = `stitch-cbx-${reactId.replace(/:/g, '')}`;

  const handleChange = useCallback(
    (optValue: string | number, optDisabled?: boolean) => {
      if (disabled || optDisabled) return;
      const next = checkedValues.includes(optValue)
        ? checkedValues.filter((v) => v !== optValue)
        : [...checkedValues, optValue];
      if (!isControlled) setInnerValue(next);
      onChange?.(next);
    },
    [disabled, checkedValues, isControlled, onChange],
  );

  return (
    <div
      role="group"
      className={clsx(
        styles.checkboxGroup,
        styles[direction],
        disabled && styles.groupDisabled,
        className,
      )}
      style={style}
    >
      {options.map((opt, idx) => {
        const isChecked = checkedValues.includes(opt.value);
        const isDisabled = disabled || opt.disabled;
        const inputId = `${idBase}-${idx}`;
        return (
          <label
            key={String(opt.value)}
            className={clsx(styles.checkboxItem, styles[size], {
              [styles.checked]: isChecked,
              [styles.disabled]: isDisabled,
            })}
          >
            <span className={styles.cbx}>
              <input
                id={inputId}
                type="checkbox"
                checked={isChecked}
                disabled={isDisabled}
                onChange={() => handleChange(opt.value, opt.disabled)}
              />
              {/* 勾选标记走 <Icon name="check">（装饰、aria-hidden），非裸 <svg> */}
              <Icon
                name="check"
                size={CHECK_SIZE[size]}
                className={styles.check}
              />
            </span>
            <span className={styles.label}>{opt.label}</span>
          </label>
        );
      })}
    </div>
  );
};

Checkbox.displayName = 'Checkbox';
