// 1. React 及其生态
import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useId,
} from 'react';
import clsx from 'clsx';

// 2. 内部组件（相对路径）
import { Icon } from '../Icon';

// 3. 样式（永远最后）
import styles from './radio.module.less';

export type RadioSize = 'small' | 'middle' | 'large';

export interface RadioOption {
  /** 选项标签 */
  label: React.ReactNode;
  /** 选项值 */
  value: string | number;
  /** 是否禁用该选项 */
  disabled?: boolean;
}

/**
 * 单选组（Ant `Radio.Group` 语义）：`options` + **标量** `value` / `defaultValue`
 * + `onChange(单个值)`。与 Checkbox（多选、值为数组）成对——单选用圆点标记、多选用勾，
 * 靠**标记**区分而非盒形状。
 *
 * 跨-prop 注意事项：
 * - **受控/非受控双模式**：给 `value` 由父管，只给 `defaultValue` 组件自管。
 * - **radiogroup 键盘（WAI-ARIA 模式）**：容器 `role="radiogroup"`，每个
 *   `<input type="radio">` 共享同一 `name`；整组一个 Tab 停靠点（roving tabindex，焦点落
 *   选中项 / 无选中落首项），方向键 ↑↓←→ 在启用项间移动焦点并**即时选中**，Home/End 跳首尾
 *   启用项（禁用项自动跳过）；`:focus-visible` 焦点环走 `--stitch-focus-ring`。
 * - **选中标记走 `<Icon name="dot">`**（实心圆点，装饰 `aria-hidden`），非裸 `<svg>`；点色随
 *   `--stitch-accent-text`（与填充面成对比）。选中态为纯淡入，无爆闪/勾线动画。
 * - **圆角复用表单控件档 `--stitch-radius-input`**（与 Checkbox 同源，随主题变）——radio 惯常
 *   正圆，但组件禁写死圆角，故交由主题的 input 圆角档决定。
 */
export interface RadioProps {
  /** 选中的值（受控） */
  value?: string | number;
  /** 默认选中的值（非受控） */
  defaultValue?: string | number;
  /** 选项列表 */
  options: RadioOption[];
  /** 尺寸 */
  size?: RadioSize;
  /** 禁用全部 */
  disabled?: boolean;
  /** 布局方向 */
  direction?: 'horizontal' | 'vertical';
  /** 变化回调 */
  onChange?: (value: string | number) => void;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

// 选中标记图标尺寸（按盒子尺寸取，占约 2/3）——与 Checkbox 同源。
const CHECK_SIZE: Record<RadioSize, number> = {
  small: 12,
  middle: 15,
  large: 19,
};

export const Radio: React.FC<RadioProps> = ({
  value,
  defaultValue,
  options,
  size = 'middle',
  disabled = false,
  direction = 'horizontal',
  onChange,
  className,
  style,
}) => {
  const [innerValue, setInnerValue] = useState<string | number | undefined>(
    defaultValue,
  );
  const isControlled = value !== undefined;
  const checkedValue = isControlled ? value : innerValue;

  const reactId = useId();
  const idBase = `stitch-radio-${reactId.replace(/:/g, '')}`;
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // 当前聚焦的索引（用于 roving tabindex：整组只有一个 Tab 停靠点）
  const [focusedIndex, setFocusedIndex] = useState<number>(() => {
    const idx = options.findIndex((o) => o.value === checkedValue);
    return idx >= 0 ? idx : 0;
  });

  // 选中值变化时，把 roving 焦点同步到选中项
  useEffect(() => {
    const idx = options.findIndex((o) => o.value === checkedValue);
    if (idx >= 0) setFocusedIndex(idx);
    // 故意不依赖 options，避免父组件未 memo 时打断键盘导航
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkedValue]);

  // 所有可用（未禁用）选项的索引
  const enabledIndices = useMemo(() => {
    return options
      .map((opt, idx) => ({ opt, idx }))
      .filter(({ opt }) => !disabled && !opt.disabled)
      .map(({ idx }) => idx);
  }, [options, disabled]);

  const currentEnabledPos = useMemo(() => {
    return enabledIndices.indexOf(focusedIndex);
  }, [enabledIndices, focusedIndex]);

  const handleChange = useCallback(
    (optValue: string | number, optDisabled?: boolean) => {
      if (disabled || optDisabled) return;
      if (!isControlled) setInnerValue(optValue);
      onChange?.(optValue);
    },
    [disabled, isControlled, onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (enabledIndices.length === 0) return;

      let nextPos = -1;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          nextPos = (currentEnabledPos + 1) % enabledIndices.length;
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          nextPos =
            (currentEnabledPos - 1 + enabledIndices.length) %
            enabledIndices.length;
          break;
        case 'Home':
          e.preventDefault();
          nextPos = 0;
          break;
        case 'End':
          e.preventDefault();
          nextPos = enabledIndices.length - 1;
          break;
        default:
          return;
      }

      if (nextPos >= 0) {
        const nextIdx = enabledIndices[nextPos];
        setFocusedIndex(nextIdx);
        handleChange(options[nextIdx].value, options[nextIdx].disabled);
        inputRefs.current[nextIdx]?.focus();
      }
    },
    [enabledIndices, currentEnabledPos, options, handleChange],
  );

  return (
    <div
      role="radiogroup"
      className={clsx(
        styles.radioGroup,
        styles[direction],
        disabled && styles.groupDisabled,
        className,
      )}
      style={style}
      onKeyDown={handleKeyDown}
    >
      {options.map((opt, idx) => {
        const isChecked = checkedValue === opt.value;
        const isDisabled = disabled || opt.disabled;
        const isFocusable = idx === focusedIndex && !isDisabled;
        const inputId = `${idBase}-${idx}`;
        return (
          <label
            key={String(opt.value)}
            className={clsx(styles.radioItem, styles[size], {
              [styles.checked]: isChecked,
              [styles.disabled]: isDisabled,
            })}
          >
            <span className={styles.cbx}>
              <input
                id={inputId}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="radio"
                name={idBase}
                checked={isChecked}
                disabled={isDisabled}
                tabIndex={isFocusable ? 0 : -1}
                onChange={() => handleChange(opt.value, opt.disabled)}
                onFocus={() => {
                  if (!isDisabled) setFocusedIndex(idx);
                }}
              />
              {/* 选中标记走 <Icon name="dot">（实心圆点，装饰、aria-hidden）：
                  单选=圆点、多选(Checkbox)=勾，区分单/多选语义；非裸 <svg> */}
              <Icon name="dot" size={CHECK_SIZE[size]} className={styles.dot} />
            </span>
            <span className={styles.label}>{opt.label}</span>
          </label>
        );
      })}
    </div>
  );
};

Radio.displayName = 'Radio';
