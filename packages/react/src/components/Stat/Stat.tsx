// 主状态 / 指标块（data-viz 族；纯 markup + CSS + <Icon>，不走 recharts）。
//
// 借 Ant `Statistic` 的展示 props（title / value / precision / prefix / suffix / formatter /
// groupSeparator）覆盖 `$695`、`9m 13s`、`42%` 等格式；在此之上加 data-viz 指标常用的三件：
//   · trend 涨/跌——方向经 <Icon> 对角箭头出，好/坏语义色只走 var(--stitch-success) /
//     var(--stitch-danger)（角色变量、非硬编码绿红）；`trendReversed` 反转开关给「跌是好事」
//     的指标（如 Bounce Rate）翻转好坏配色。
//   · caption 副说明（如 vs previous 30 days）。
//   · status 状态点——<Icon name="dot"> 点色走角色变量 + 文案（如 ○ 0 online）。
// 趋势箭头一律经受认证的 <Icon>（内置 arrow-up-right / arrow-down-right path），不内联 svg、
// 不用 emoji / Unicode 符号。
//
// 1. React 及其生态
import React, { useId } from 'react';
import clsx from 'clsx';

// 2. 内部组件（相对路径）
import { Icon } from '../Icon';

// 3. 样式（永远最后）
import styles from './stat.module.less';

/** 趋势方向：值往哪走（好/坏由 direction + trendReversed 共同决定，不等于方向本身）。 */
export type StatTrendDirection = 'up' | 'down';

/** 趋势描述：一个变化量 + 方向。方向缺省时按 value 正负推断（≥0 视为 up）。 */
export interface StatTrend {
  /** 变化量（展示为绝对值，方向由箭头/配色承载） */
  value: number;
  /** 方向；缺省按 value 正负推断 */
  direction?: StatTrendDirection;
}

/** 状态点语义色调（点色走对应角色变量，缺省 neutral = 弱化中性）。 */
export type StatStatusTone =
  'neutral' | 'success' | 'danger' | 'warning' | 'info';

/** 状态点：一枚 <Icon name="dot"> + 文案（如 ○ 0 online）。 */
export interface StatStatus {
  /** 状态文案 */
  text: React.ReactNode;
  /**
   * 点的语义色调（走角色变量）
   * @default 'neutral'
   */
  tone?: StatStatusTone;
}

/**
 * 单个指标块：标签 + 大值（可带 prefix/suffix/精度/千分位/自定义 formatter）+ 可选趋势 /
 * 副说明 / 状态点。展示 props 借 Ant `Statistic` 语义。
 *
 * 跨-prop 注意事项：
 * - **只读角色变量**：趋势好/坏色只走 `var(--stitch-success)` / `var(--stitch-danger)`，
 *   状态点色 / 分隔线走 `var(--stitch-*)`——组件内零硬编码绿红、零主题值。
 * - **趋势方向经 `<Icon>`**（内置 `arrow-up-right` / `arrow-down-right`），**禁**内联 svg /
 *   emoji / Unicode 箭头。方向（箭头形状）是不依赖颜色的区分通道，配色只叠加好/坏语义。
 * - **`trendReversed`**：给「跌是好事」的指标（Bounce Rate 等）翻转好/坏配色——方向不变、
 *   语义色对调。
 * - **`formatter` 优先**：给出时接管全部数值格式化，`precision` / `groupSeparator` 不再生效。
 * - **Accessibility**：有 `title` 时整块为 `role="group"` + `aria-labelledby`（可访问名 =
 *   标签文案）；趋势箭头为装饰（`aria-hidden`），语义由数值文案与箭头形状承载。
 */
export interface StatProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'title' | 'prefix'
> {
  /** 指标标签（如 Unique Visitors） */
  title?: React.ReactNode;
  /** 指标值。number 走内置格式化；string 原样展示 */
  value: string | number;
  /** 小数精度（仅 number 值、未给 formatter 时生效） */
  precision?: number;
  /** 值前缀（如 `$`） */
  prefix?: React.ReactNode;
  /** 值后缀（如 `%`） */
  suffix?: React.ReactNode;
  /** 自定义格式化；给出时接管数值格式化，precision / groupSeparator 失效 */
  formatter?: (value: string | number) => React.ReactNode;
  /**
   * 千分位分隔符（仅 number 值、未给 formatter 时生效）
   * @default ','
   */
  groupSeparator?: string;
  /** 趋势涨/跌 */
  trend?: StatTrend;
  /**
   * 反转趋势好坏（「跌是好事」的指标，如 Bounce Rate）
   * @default false
   */
  trendReversed?: boolean;
  /** 副说明（如 vs previous 30 days） */
  caption?: React.ReactNode;
  /** 状态点 + 文案 */
  status?: StatStatus;
}

/** 按 precision / groupSeparator 把 number 值格式化为字符串（Ant Statistic 语义）。 */
function formatNumber(
  value: number,
  precision: number | undefined,
  groupSeparator: string,
): string {
  const fixed = precision != null ? value.toFixed(precision) : String(value);
  const [intPart, decPart] = fixed.split('.');
  const sign = intPart.startsWith('-') ? '-' : '';
  const digits = sign ? intPart.slice(1) : intPart;
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, groupSeparator);
  return decPart != null ? `${sign}${grouped}.${decPart}` : `${sign}${grouped}`;
}

/**
 * 把一个指标画成「标签 + 大值 + 趋势 + 副说明 + 状态点」，趋势色走语义角色变量、方向经 <Icon>。
 */
export const Stat: React.FC<StatProps> = ({
  title,
  value,
  precision,
  prefix,
  suffix,
  formatter,
  groupSeparator = ',',
  trend,
  trendReversed = false,
  caption,
  status,
  className,
  ...rest
}) => {
  const titleId = useId();

  const displayValue = formatter
    ? formatter(value)
    : typeof value === 'number'
      ? formatNumber(value, precision, groupSeparator)
      : value;

  // 方向：缺省按 value 正负推断（≥0 → up）。
  const direction: StatTrendDirection =
    trend?.direction ?? ((trend?.value ?? 0) >= 0 ? 'up' : 'down');
  // 好/坏：方向叠加反转开关——reversed 下「跌是好事」。
  const isPositive = trendReversed ? direction === 'down' : direction === 'up';

  return (
    <div
      className={clsx(styles.stat, className)}
      {...(title != null
        ? { role: 'group', 'aria-labelledby': titleId }
        : null)}
      {...rest}
    >
      {title != null && (
        <div id={titleId} className={styles['stat-title']}>
          {title}
        </div>
      )}

      <div className={styles['stat-value-row']}>
        <div className={styles['stat-value']}>
          {prefix != null && (
            <span className={styles['stat-prefix']}>{prefix}</span>
          )}
          <span>{displayValue}</span>
          {suffix != null && (
            <span className={styles['stat-suffix']}>{suffix}</span>
          )}
        </div>

        {trend != null && (
          <span
            className={clsx(
              styles['stat-trend'],
              isPositive
                ? styles['stat-trend-positive']
                : styles['stat-trend-negative'],
            )}
          >
            <Icon
              name={direction === 'up' ? 'arrow-up-right' : 'arrow-down-right'}
              size="1em"
            />
            {Math.abs(trend.value)}
          </span>
        )}
      </div>

      {caption != null && (
        <div className={styles['stat-caption']}>{caption}</div>
      )}

      {status != null && (
        <div className={styles['stat-status']}>
          <Icon
            name="dot"
            size="0.6em"
            className={styles[`stat-dot-${status.tone ?? 'neutral'}`]}
          />
          {status.text}
        </div>
      )}
    </div>
  );
};

Stat.displayName = 'Stat';
