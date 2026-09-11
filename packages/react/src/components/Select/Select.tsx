// 1. React 及其生态
import React, {
  useState,
  useRef,
  useEffect,
  useId,
  useCallback,
  useMemo,
} from 'react';
import clsx from 'clsx';

// 2. 内部组件（相对路径）
import { Icon } from '../Icon';
import { ScrollArea } from '../ScrollArea';

// 3. 样式（永远最后）
import styles from './select.module.less';

export type SelectSize = 'small' | 'middle' | 'large';

export interface SelectOption {
  /** 选项标签 */
  label: React.ReactNode;
  /** 选项值 */
  value: string | number;
  /** 是否禁用该选项 */
  disabled?: boolean;
}

/**
 * 单选下拉（Ant `Select` 语义）：`options`（`{label, value, disabled?}`）+ **标量**
 * `value` / `defaultValue`（`string | number`）+ `onChange(单个值)` + `placeholder` +
 * `size` + `disabled`。
 *
 * 跨-prop 注意事项：
 * - **受控/非受控双模式**：给 `value` 由父管，只给 `defaultValue` 组件自管。`size`
 *   （`small`/`middle`/`large`）走 `--stitch-height-*`，与表单控件族对齐。
 * - **a11y 角色链**：trigger `role="combobox"` + `aria-haspopup="listbox"` + `aria-expanded`
 *   + `aria-controls`（展开时指向 listbox）+ `aria-activedescendant`（当前高亮项）；浮层
 *   `role="listbox"`，每项 `role="option"` + `aria-selected`；禁用项 `aria-disabled`。
 * - **键盘**：闭合时 Enter/Space/↑/↓ 打开；展开时 ↑↓ 在**启用项**间移动高亮（禁用项跳过、首尾
 *   wrap），Home/End 跳首尾启用项，Enter/Space 选中当前高亮，Esc 关闭并把焦点还给 trigger；
 *   trigger `:focus-visible` 焦点环走 `--stitch-focus-ring`。
 * - **图标走 `<Icon>` 非裸 `<svg>`**：箭头 `<Icon name="chevron-down">`（`size="1em"` 跟随字号，
 *   展开 `rotate(180deg)` + 转 accent 色），选中项尾随 `<Icon name="check">`。
 * - **标准正下方展开**：浮层在 trigger 正下方展开（`top:100%`，`max-height` + 滚动），非侧向弹出/
 *   视口翻转定位——这是标准化取舍，保证可预期的下拉手感。
 */
export interface SelectProps {
  /** 选项列表 */
  options: SelectOption[];
  /** 选中的值（受控） */
  value?: string | number;
  /** 默认选中的值（非受控） */
  defaultValue?: string | number;
  /** 值变化回调 */
  onChange?: (value: string | number) => void;
  /** 占位提示（未选中时显示） */
  placeholder?: string;
  /** 尺寸 */
  size?: SelectSize;
  /** 禁用整个选择器 */
  disabled?: boolean;
  /** 自定义类名（挂在根节点） */
  className?: string;
  /** 自定义样式（挂在根节点） */
  style?: React.CSSProperties;
  /** 无可见 label 时的无障碍标签 */
  'aria-label'?: string;
  /** 关联外部可见 label 的 id */
  'aria-labelledby'?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  defaultValue,
  onChange,
  placeholder = '请选择',
  size = 'middle',
  disabled = false,
  className,
  style,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}) => {
  // 受控/非受控双模式（Ant Select 取值类：value/defaultValue/onChange）。
  const [innerValue, setInnerValue] = useState<string | number | undefined>(
    defaultValue,
  );
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : innerValue;

  const [open, setOpen] = useState(false);
  const [activeValue, setActiveValue] = useState<string | number | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const reactId = useId();
  const idBase = `stitch-select-${reactId.replace(/:/g, '')}`;
  const listboxId = `${idBase}-listbox`;
  const optionId = (v: string | number) => `${idBase}-option-${v}`;

  const selectedOption = options.find((o) => o.value === currentValue);
  const currentLabel = selectedOption ? selectedOption.label : placeholder;
  const hasValue = selectedOption !== undefined;

  // 所有可用（未禁用）选项的值序列——键盘导航只在其间移动。
  const enabledValues = useMemo(
    () => options.filter((o) => !o.disabled).map((o) => o.value),
    [options],
  );

  // 点击浮层外关闭。
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // 打开时把 activeValue 落到当前选中项，否则第一个可用项。
  useEffect(() => {
    if (open) {
      const fallback = enabledValues[0] ?? null;
      setActiveValue(
        currentValue != null && enabledValues.includes(currentValue)
          ? currentValue
          : fallback,
      );
    } else {
      setActiveValue(null);
    }
    // 打开时快照一次；currentValue 变更由选中逻辑另行同步
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSelect = useCallback(
    (v: string | number) => {
      if (!isControlled) setInnerValue(v);
      onChange?.(v);
      setOpen(false);
      triggerRef.current?.focus();
    },
    [isControlled, onChange],
  );

  const moveActive = (delta: 1 | -1) => {
    if (!enabledValues.length) return;
    const idx = activeValue == null ? -1 : enabledValues.indexOf(activeValue);
    const nextIdx =
      idx < 0
        ? delta === 1
          ? 0
          : enabledValues.length - 1
        : (idx + delta + enabledValues.length) % enabledValues.length;
    setActiveValue(enabledValues[nextIdx]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const { key } = e;
    if (!open) {
      if (
        key === 'Enter' ||
        key === ' ' ||
        key === 'ArrowDown' ||
        key === 'ArrowUp'
      ) {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    switch (key) {
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        moveActive(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        moveActive(-1);
        break;
      case 'Home':
        e.preventDefault();
        if (enabledValues.length) setActiveValue(enabledValues[0]);
        break;
      case 'End':
        e.preventDefault();
        if (enabledValues.length)
          setActiveValue(enabledValues[enabledValues.length - 1]);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (activeValue != null) handleSelect(activeValue);
        break;
      default:
        break;
    }
  };

  return (
    <div
      ref={wrapperRef}
      className={clsx(styles.wrapper, disabled && styles.disabled, className)}
      style={style}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={triggerRef}
        className={clsx(styles.trigger, styles[size], open && styles.open)}
        onClick={() => !disabled && setOpen((o) => !o)}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-activedescendant={
          open && activeValue != null ? optionId(activeValue) : undefined
        }
        aria-disabled={disabled || undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        tabIndex={disabled ? -1 : 0}
      >
        <span className={hasValue ? styles.value : styles.placeholder}>
          {currentLabel}
        </span>
        <Icon
          name="chevron-down"
          size="1em"
          className={clsx(styles.arrow, open && styles.arrowOpen)}
        />
      </div>
      {open && (
        <div
          className={styles.dropdown}
          role="listbox"
          id={listboxId}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-activedescendant={
            activeValue != null ? optionId(activeValue) : undefined
          }
        >
          <ScrollArea className={styles.dropdownScroll}>
            {options.map((option) => {
              const selected = currentValue === option.value;
              const active = activeValue === option.value;
              return (
                <div
                  key={String(option.value)}
                  id={optionId(option.value)}
                  role="option"
                  aria-selected={selected}
                  aria-disabled={option.disabled || undefined}
                  className={clsx(styles.option, {
                    [styles.optionActive]: active,
                    [styles.optionSelected]: selected,
                    [styles.optionDisabled]: option.disabled,
                  })}
                  onClick={() => !option.disabled && handleSelect(option.value)}
                  onMouseEnter={() => {
                    if (!option.disabled) setActiveValue(option.value);
                  }}
                >
                  <span className={styles.optionLabel}>{option.label}</span>
                  {selected && (
                    <Icon
                      name="check"
                      size="1em"
                      className={styles.checkMark}
                    />
                  )}
                </div>
              );
            })}
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

Select.displayName = 'Select';
