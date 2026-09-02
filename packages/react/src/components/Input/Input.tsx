// 1. React 及其生态
import React, { useState, useCallback, useRef } from 'react';
import clsx from 'clsx';

// 2. 内部组件（相对路径）
import { Icon } from '../Icon';

// 3. 样式（永远最后）
import styles from './input.module.less';

export type InputSize = 'small' | 'middle' | 'large';

/**
 * 文本输入框：结构靠 1px 边框（`--stitch-border`）而非 3D 影；圆角由 `--stitch-radius-input`
 * 决定（随主题变）。只做插槽包裹，不发明取值逻辑。
 *
 * 跨-prop 注意事项：
 * - **受控/非受控双模式**：给 `value` 由父管，只给 `defaultValue` 组件自管；`allowClear` 的
 *   清除经 native setter + `dispatchEvent` 派发真实 `change`（`onChange` 收到的是完整
 *   SyntheticEvent，与用户键入一致）。
 * - **`prefix` / `suffix` 传你自己的 `<Icon>` 或文本**——**Do NOT** 传 emoji / Unicode 符号 /
 *   裸 `<svg>`。`allowClear` 的清除按钮内部走 `<Icon name="close">`（非 Unicode `×`），是原生
 *   `<button>`：可 Tab 聚焦、Enter/Space 触发，`clearAriaLabel` 定其可访问名。
 * - **`status="error"` 同时置 `aria-invalid="true"`**；聚焦环走 `:focus-within` +
 *   `--stitch-focus-ring`（含 prefix/suffix 整框）。
 */
export interface InputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'size' | 'prefix'
> {
  /** 输入框尺寸 */
  size?: InputSize;
  /** 前缀节点（传你自己的 `<Icon>` 或文本） */
  prefix?: React.ReactNode;
  /** 后缀节点（传你自己的 `<Icon>` 或文本） */
  suffix?: React.ReactNode;
  /**
   * 允许一键清除（有值且非禁用时显示清除按钮）
   * @default false
   */
  allowClear?: boolean;
  /** 校验态（error 同时置 `aria-invalid`） */
  status?: 'error' | 'warning';
  /** 值变化回调 */
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  /** 清除回调 */
  onClear?: () => void;
  /**
   * 清除按钮的无障碍标签
   * @default '清除'
   */
  clearAriaLabel?: string;
}

export const Input: React.FC<InputProps> = ({
  size = 'middle',
  prefix,
  suffix,
  allowClear = false,
  status,
  disabled = false,
  className,
  value,
  defaultValue,
  onChange,
  onClear,
  clearAriaLabel = '清除',
  ...rest
}) => {
  const [innerValue, setInnerValue] = useState(defaultValue ?? '');
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : innerValue;
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      if (!isControlled) setInnerValue(e.target.value);
      onChange?.(e);
    },
    [isControlled, onChange],
  );

  // 浏览器 autofill 不触发 React onChange：命中 :-webkit-autofill 时 CSS 会跑一个
  // 空动画（keyframes stitch-onautofillstart），这里侦测到就把 DOM 里的自动填充值
  // 经原生 setter + input 事件补发一次真实 SyntheticEvent，让受控层（如 Form）拿到值。
  const handleAnimationStart: React.AnimationEventHandler<HTMLInputElement> =
    useCallback(
      (e) => {
        if (e.animationName !== 'stitch-onautofillstart') return;
        const input = e.currentTarget;
        if (input.value === currentValue) return;
        // autofill 不触发 onChange：以 input 为 target 合成一次 change，
        // 复用 handleChange 分发（受控/非受控都同步到自动填充值）。
        handleChange({
          target: input,
          currentTarget: input,
        } as React.ChangeEvent<HTMLInputElement>);
      },
      [currentValue, handleChange],
    );

  const handleClear = useCallback(() => {
    if (!isControlled) setInnerValue('');
    onClear?.();
    // 通过 dispatchEvent 产生真实的 React SyntheticEvent，
    // 避免手搓假事件导致的 preventDefault/stopPropagation 缺失和 target 属性残缺。
    const input = inputRef.current;
    if (input) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value',
      )?.set;
      nativeInputValueSetter?.call(input, '');
      const event = new Event('input', { bubbles: true });
      input.dispatchEvent(event);
    }
  }, [isControlled, onClear]);

  const wrapperCls = clsx(
    styles.wrapper,
    styles[`wrapper-${size}`],
    status && styles[`wrapper-${status}`],
    disabled && styles['wrapper-disabled'],
    className,
  );

  return (
    <span className={wrapperCls}>
      {prefix && <span className={styles.prefix}>{prefix}</span>}
      <input
        ref={inputRef}
        className={styles.input}
        disabled={disabled}
        value={currentValue}
        onChange={handleChange}
        onAnimationStart={handleAnimationStart}
        aria-invalid={status === 'error' ? 'true' : undefined}
        {...rest}
      />
      {allowClear && currentValue && !disabled && (
        <button
          type="button"
          className={styles.clear}
          onClick={handleClear}
          aria-label={clearAriaLabel}
        >
          <Icon name="close" size={14} />
        </button>
      )}
      {suffix && <span className={styles.suffix}>{suffix}</span>}
    </span>
  );
};

Input.displayName = 'Input';
