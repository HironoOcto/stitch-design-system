// 1. React 及其生态
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { format as formatDate } from 'date-fns';
import clsx from 'clsx';

// 2. 内部组件（相对路径）
import { Popover } from '../Popover';
import {
  Calendar,
  type CalendarMode,
  type CalendarCaptionLayout,
  type DateRange,
} from '../Calendar';
import { Icon } from '../Icon';

// 3. 样式（永远最后）
import styles from './datepicker.module.less';

export type DatePickerSize = 'small' | 'middle' | 'large';

/**
 * 日期选择器（Ant `DatePicker` / `RangePicker` 语义）：字段触发器 + 复用现有
 * {@link Popover} 弹出内联 {@link Calendar}（不另造浮层）。`mode="single"` 单日、
 * `mode="range"` 范围（`Jul 28 – Aug 26` 的范围触发器）。
 *
 * 跨-prop 注意事项：
 * - **取值随 `mode` 变形**（同 Calendar）：`single`→`Date`；`range`→{@link DateRange}
 *   （`{from,to}`）。`onChange` 同步收对应形态或 `undefined`（清除时）。
 * - **受控/非受控双开关**：取值 `value`/`defaultValue`/`onChange`（Ant v5 取值约定）与浮层
 *   `open`/`onOpenChange`（Ant v5 气泡约定）各自独立支持受控与非受控。
 * - **`allowClear`（默认开）** 有值且未禁用时在字段尾部显示清除按钮（走 `<Icon name="close">`、
 *   原生 `<button>`、`clearAriaLabel` 定可及名）；点击清空且不冒泡打开浮层。
 * - **`disabledDate(date)`** 透传给内层 Calendar 逐日禁用；`disabled` 禁用整个触发器。
 * - **面 = 角色变量**：字段结构靠 `--stitch-border` + `--stitch-radius-input`，选中态与范围底色
 *   由 Calendar 上皮（accent / bg-accent）承载；日历图标与翻月箭头一律经 `<Icon>`，无裸 svg。
 */
export interface DatePickerProps {
  /** 选择模式：单日或范围 @default 'single' */
  mode?: CalendarMode;
  /** 受控选中值（`single`→`Date`，`range`→`DateRange`） */
  value?: Date | DateRange;
  /** 非受控初始选中值（`single`→`Date`，`range`→`DateRange`） */
  defaultValue?: Date | DateRange;
  /** 选中变化回调（含清除时的 `undefined`） */
  onChange?: (value: Date | DateRange | undefined) => void;
  /** 逐日禁用判定：返回 `true` 的日期不可选 */
  disabledDate?: (date: Date) => boolean;
  /** 首屏展示的月份（Ant `defaultPickerValue`）；不给则据选中值 / 当月 */
  defaultPickerValue?: Date;
  /** 弹出日历顶部年月区形态：`'dropdown'` 可点选月 / 年，`'label'` 静态标题 @default 'dropdown' */
  captionLayout?: CalendarCaptionLayout;
  /** 禁用整个触发器 @default false */
  disabled?: boolean;
  /** 允许一键清除 @default true */
  allowClear?: boolean;
  /** 清除按钮的无障碍标签 @default '清除' */
  clearAriaLabel?: string;
  /** 占位符（`range` 可传 `[起, 止]` 两段） */
  placeholder?: string | [string, string];
  /** 日期展示格式（date-fns 格式串） @default 'yyyy-MM-dd' */
  format?: string;
  /** 触发器尺寸 @default 'middle' */
  size?: DatePickerSize;
  /** 校验态（error 同时置 `aria-invalid`） */
  status?: 'error' | 'warning';
  /** 受控浮层显隐（Ant v5 `open`） */
  open?: boolean;
  /** 非受控初始显隐 @default false */
  defaultOpen?: boolean;
  /** 显隐变化回调（Ant v5 `onOpenChange`） */
  onOpenChange?: (open: boolean) => void;
  /** 触发器的可访问名 */
  'aria-label'?: string;
  /** 自定义类名（挂到字段包裹上） */
  className?: string;
}

const isRange = (v: unknown): v is DateRange =>
  typeof v === 'object' && v !== null && !(v instanceof Date);

export const DatePicker: React.FC<DatePickerProps> = ({
  mode = 'single',
  value,
  defaultValue,
  onChange,
  disabledDate,
  defaultPickerValue,
  captionLayout,
  disabled = false,
  allowClear = true,
  clearAriaLabel = '清除',
  placeholder,
  format = 'yyyy-MM-dd',
  size = 'middle',
  status,
  open,
  defaultOpen,
  onOpenChange,
  className,
  'aria-label': ariaLabel,
}) => {
  // 取值：受控 / 非受控
  const isValueControlled = value !== undefined;
  const [innerValue, setInnerValue] = useState<Date | DateRange | undefined>(
    defaultValue,
  );
  const current = isValueControlled ? value : innerValue;

  // 浮层：受控 / 非受控
  const isOpenControlled = open !== undefined;
  const [innerOpen, setInnerOpen] = useState(defaultOpen ?? false);
  const currentOpen = isOpenControlled ? open : innerOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isOpenControlled) setInnerOpen(next);
      onOpenChange?.(next);
    },
    [isOpenControlled, onOpenChange],
  );

  // range 模式按「本次开合内点了几次」判闭合：rdp 首点给 {from,to} 同日，
  // 光看形态无法区分「刚起点」与「起止同一天」，故数点击——第二点才收起。
  const rangeClicksRef = useRef(0);
  useEffect(() => {
    if (currentOpen) rangeClicksRef.current = 0;
  }, [currentOpen]);

  const commitValue = useCallback(
    (next: Date | DateRange | undefined) => {
      if (!isValueControlled) setInnerValue(next);
      onChange?.(next);
    },
    [isValueControlled, onChange],
  );

  const handleCalendarChange = useCallback(
    (next: Date | DateRange | undefined) => {
      commitValue(next);
      // single：选一天即关；range：第二次点击（起止齐）才关。
      if (mode === 'range') {
        rangeClicksRef.current += 1;
        if (
          rangeClicksRef.current >= 2 &&
          isRange(next) &&
          next.from &&
          next.to
        )
          setOpen(false);
      } else if (next) {
        setOpen(false);
      }
    },
    [commitValue, mode, setOpen],
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      // 不冒泡到字段按钮（否则会打开浮层）
      e.stopPropagation();
      commitValue(undefined);
    },
    [commitValue],
  );

  // 展示文本
  const fmt = (d?: Date) => (d ? formatDate(d, format) : '');
  let displayText = '';
  let hasValue = false;
  if (mode === 'range' && isRange(current)) {
    hasValue = Boolean(current.from || current.to);
    if (hasValue) displayText = `${fmt(current.from)} – ${fmt(current.to)}`;
  } else if (mode === 'single' && current instanceof Date) {
    hasValue = true;
    displayText = fmt(current);
  }

  const [phStart, phEnd] = Array.isArray(placeholder)
    ? placeholder
    : [placeholder, placeholder];
  const placeholderText =
    mode === 'range'
      ? `${phStart ?? '开始日期'} – ${phEnd ?? '结束日期'}`
      : (phStart ?? '请选择日期');

  const showClear = allowClear && hasValue && !disabled;

  const fieldCls = clsx(
    styles.field,
    styles[size],
    status && styles[`status-${status}`],
    disabled && styles.disabled,
    className,
  );

  const trigger = (
    <button
      type="button"
      className={styles.trigger}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-invalid={status === 'error' ? 'true' : undefined}
      aria-haspopup="dialog"
    >
      <Icon name="calendar" size={16} className={styles.calendarIcon} />
      <span className={clsx(styles.text, !hasValue && styles.placeholder)}>
        {hasValue ? displayText : placeholderText}
      </span>
    </button>
  );

  return (
    <span className={fieldCls}>
      <Popover
        open={currentOpen}
        onOpenChange={setOpen}
        aria-label={ariaLabel ?? placeholderText}
        trigger={trigger}
        className={styles.panel}
      >
        <Calendar
          mode={mode}
          value={current}
          onChange={handleCalendarChange}
          disabledDate={disabledDate}
          defaultMonth={defaultPickerValue}
          captionLayout={captionLayout}
        />
      </Popover>
      {showClear && (
        <button
          type="button"
          className={styles.clear}
          aria-label={clearAriaLabel}
          onClick={handleClear}
        >
          <Icon name="close" size={14} />
        </button>
      )}
    </span>
  );
};

DatePicker.displayName = 'DatePicker';
