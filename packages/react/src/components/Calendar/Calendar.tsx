// 1. React 及其生态
import React, { useState, useCallback } from 'react';
import { DayPicker, type DateRange as RdpDateRange } from 'react-day-picker';
import clsx from 'clsx';

// 2. 内部组件（相对路径）
import { Icon } from '../Icon';
import { Select } from '../Select';

// 3. 样式（永远最后）
import styles from './calendar.module.less';

export type CalendarMode = 'single' | 'range';

/** 顶部年月区形态：`'label'` 静态标题；`'dropdown'` 月/年可点下拉（快速跳月跳年） */
export type CalendarCaptionLayout = 'label' | 'dropdown';

/** 日期范围：`from` 起点、`to` 终点（range 模式的取值形态） */
export interface DateRange {
  from?: Date;
  to?: Date;
}

/**
 * 内联日历网格（react-day-picker 引擎）：一次支持 `mode="single"`（单选）与 `mode="range"`
 * （范围）；月份网格、方向键导航、ARIA grid（`role="grid"`、日按钮可及名、翻月按钮可及名）
 * 全由引擎兜底，上皮只读角色变量随换肤变化。
 *
 * 跨-prop 注意事项：
 * - **取值随 `mode` 变形**：`single` 下 `value`/`defaultValue` 是 `Date`、`onChange` 收
 *   `Date | undefined`；`range` 下它们是 {@link DateRange}（`{from,to}`）、`onChange` 收
 *   `DateRange | undefined`。切 mode 时同步换掉取值形态。
 * - **受控/非受控双模式**：给 `value` 由父管（配 `onChange` 回写），只给 `defaultValue`
 *   组件自管；两者互斥优先取 `value`。
 * - **禁用某些日期**用 `disabledDate(date) => boolean`（Ant 语义），命中的日按钮 `disabled`、
 *   键盘与点击都跳过；整块只读用 `disabled`（把所有日期禁掉）。
 * - **面 = 角色变量**：选中日 `--stitch-accent` + `--stitch-accent-text`，范围中段
 *   `--stitch-bg-accent`（日按钮铺满整格，底色与端点框边到边对齐、不出头），今天描
 *   `--stitch-border-strong`、hover 落 `--stitch-bg-card`、禁用走 `--stitch-text-disabled`；
 *   翻月箭头一律经 `<Icon>`（`chevron-left`/`chevron-right`），无裸 svg / Unicode 符号。
 * - **`captionLayout="dropdown"`（默认）** 顶部月/年为可点下拉，快速跳月跳年（原生 `<select>`
 *   兜键盘与可及名）；传 `'label'` 退回静态标题。年份范围默认「今年往前 100 年」，用
 *   `startMonth`/`endMonth` 收窄。
 */
export interface CalendarProps {
  /** 选择模式：单日或范围 @default 'single' */
  mode?: CalendarMode;
  /** 受控选中值（`single`→`Date`，`range`→`DateRange`） */
  value?: Date | DateRange;
  /** 非受控初始选中值（`single`→`Date`，`range`→`DateRange`） */
  defaultValue?: Date | DateRange;
  /** 选中变化回调（`single`→`Date | undefined`，`range`→`DateRange | undefined`） */
  onChange?: (value: Date | DateRange | undefined) => void;
  /** 逐日禁用判定：返回 `true` 的日期不可选 */
  disabledDate?: (date: Date) => boolean;
  /** 整块禁用（所有日期不可选） @default false */
  disabled?: boolean;
  /** 首屏展示的月份（不给则据选中值 / 当月） */
  defaultMonth?: Date;
  /** 顶部年月区形态：`'dropdown'` 可点选月 / 年，`'label'` 静态标题 @default 'dropdown' */
  captionLayout?: CalendarCaptionLayout;
  /** dropdown 年份下限（不给默认今年往前 100 年） */
  startMonth?: Date;
  /** dropdown 年份上限（不给默认今年年底） */
  endMonth?: Date;
  /** 日历网格的可访问名 */
  'aria-label'?: string;
  /** 自定义类名（挂到日历根节点） */
  className?: string;
}

/** 翻月箭头：走 `<Icon>`，不引入裸 svg。 */
const CalendarChevron = ({
  orientation,
}: {
  orientation?: 'up' | 'down' | 'left' | 'right';
}) => {
  const name =
    orientation === 'left'
      ? 'chevron-left'
      : orientation === 'right'
        ? 'chevron-right'
        : 'chevron-down';
  return <Icon name={name} size={18} />;
};

/**
 * 顶部月/年下拉：**复用设计系统的 `Select`**（换肤一致、非系统原生弹窗）。
 * rdp 的 `Dropdown` 契约是原生 `<select>`（`onChange` 收事件、读 `target.value`），
 * 这里把它接到 `Select` 的 `onChange(值)` 上——合成一个 `{target:{value}}` 回传。
 */
const CalendarDropdown = ({
  options,
  value,
  onChange,
  disabled,
  'aria-label': ariaLabel,
}: {
  options?: { value: number; label: string; disabled: boolean }[];
  value?: string | number | readonly string[];
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
  disabled?: boolean;
  'aria-label'?: string;
}) => {
  const isYear = typeof ariaLabel === 'string' && /year/i.test(ariaLabel);
  return (
    <Select
      size="small"
      className={clsx(styles.captionSelect, isYear && styles.captionYear)}
      options={(options ?? []).map((o) => ({
        label: o.label,
        value: o.value,
        disabled: o.disabled,
      }))}
      value={value != null ? Number(value) : undefined}
      onChange={(v) =>
        onChange?.({
          target: { value: String(v) },
        } as unknown as React.ChangeEvent<HTMLSelectElement>)
      }
      disabled={disabled}
      aria-label={typeof ariaLabel === 'string' ? ariaLabel : undefined}
    />
  );
};

/** react-day-picker 元素 → stitch 角色变量样式的映射（不引入库自带 CSS）。 */
const classNames = {
  root: styles.root,
  months: styles.months,
  month: styles.month,
  month_caption: styles.caption,
  caption_label: styles.captionLabel,
  nav: styles.nav,
  button_previous: styles.navButton,
  button_next: styles.navButton,
  dropdowns: styles.dropdowns,
  month_grid: styles.grid,
  weekdays: styles.weekdays,
  weekday: styles.weekday,
  week: styles.week,
  day: styles.day,
  day_button: styles.dayButton,
  today: styles.today,
  selected: styles.selected,
  range_start: styles.rangeStart,
  range_middle: styles.rangeMiddle,
  range_end: styles.rangeEnd,
  outside: styles.outside,
  disabled: styles.disabled,
  hidden: styles.hidden,
  focused: styles.focused,
};

export const Calendar: React.FC<CalendarProps> = ({
  mode = 'single',
  value,
  defaultValue,
  onChange,
  disabledDate,
  disabled = false,
  defaultMonth,
  captionLayout = 'dropdown',
  startMonth,
  endMonth,
  className,
  'aria-label': ariaLabel,
}) => {
  const isControlled = value !== undefined;
  const [innerValue, setInnerValue] = useState<Date | DateRange | undefined>(
    defaultValue,
  );
  const current = isControlled ? value : innerValue;

  const handleSelect = useCallback(
    (next: Date | DateRange | undefined) => {
      if (!isControlled) setInnerValue(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  // dropdown 年份范围：默认「今年往前 100 年 ~ 今年后 10 年」（未来年份也可选），
  // 用 startMonth / endMonth 收窄。label 模式不强加范围。
  const thisYear = new Date().getFullYear();
  const dropdownStart =
    captionLayout === 'dropdown'
      ? (startMonth ?? new Date(thisYear - 100, 0, 1))
      : startMonth;
  const dropdownEnd =
    captionLayout === 'dropdown'
      ? (endMonth ?? new Date(thisYear + 10, 11, 31))
      : endMonth;

  const common = {
    classNames,
    components: { Chevron: CalendarChevron, Dropdown: CalendarDropdown },
    disabled: disabled ? true : disabledDate,
    defaultMonth,
    captionLayout,
    startMonth: dropdownStart,
    endMonth: dropdownEnd,
    'aria-label': ariaLabel,
    className: clsx(className),
  };

  if (mode === 'range') {
    return (
      <DayPicker
        mode="range"
        selected={current as RdpDateRange | undefined}
        onSelect={(range) => handleSelect(range ?? undefined)}
        {...common}
      />
    );
  }

  return (
    <DayPicker
      mode="single"
      selected={current as Date | undefined}
      onSelect={(date) => handleSelect(date ?? undefined)}
      {...common}
    />
  );
};

Calendar.displayName = 'Calendar';
