// 1. React 及其生态
import React, { useMemo } from 'react';
import clsx from 'clsx';

// 3. 样式（永远最后）
import styles from './progress.module.less';

export type ProgressSize = 'small' | 'middle' | 'large';

/**
 * 百分比文字位置
 *  - inside: 在 bar 内部（fill 段内右对齐，跟随 fill；fill 过窄时退到 track 末端）
 *  - right:  在 bar 右侧
 *  - top:    在 bar 上方
 */
export type ProgressInfoPosition = 'inside' | 'right' | 'top';

export interface ProgressProps {
  /** 当前百分比，0–100 */
  percent: number;
  /**
   * 尺寸
   * @default 'middle'
   */
  size?: ProgressSize;
  /**
   * 是否显示百分比文字
   * @default true
   */
  showInfo?: boolean;
  /**
   * 百分比文字位置
   * @default 'inside'
   */
  infoPosition?: ProgressInfoPosition;
  /** 自定义文字格式化（默认 `${percent}%`；对齐 Ant v5 `format`） */
  format?: (percent: number) => React.ReactNode;
  /**
   * 进度条 fill 宽度动画时长（秒），0 = 不动画；不影响斜纹滚动
   * @default 0.6
   */
  duration?: number;
  /** 透传到根元素 */
  className?: string;
  /** 透传到根元素 */
  style?: React.CSSProperties;
  /** 无可见标题时给 progressbar 一个无障碍标签（WCAG aria-progressbar-name 必需） */
  'aria-label'?: string;
  /** 关联外部可见标题的 id */
  'aria-labelledby'?: string;
}

const SIZE_CLASS: Record<ProgressSize, string> = {
  small: styles['size-small']!,
  middle: styles['size-middle']!,
  large: styles['size-large']!,
};

// fill 末端留出文字宽度的阈值（避免 fill 太窄时文字外溢到 track 上看不清）
const INSIDE_MIN_FILL = 18;

export const Progress: React.FC<ProgressProps> = ({
  percent,
  size = 'middle',
  showInfo = true,
  infoPosition = 'inside',
  format,
  duration = 0.6,
  className,
  style,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}) => {
  const safePercent = useMemo(() => {
    if (typeof percent !== 'number' || Number.isNaN(percent)) return 0;
    return Math.max(0, Math.min(100, percent));
  }, [percent]);

  const renderedInfo = useMemo(() => {
    if (format) return format(safePercent);
    return `${Math.round(safePercent)}%`;
  }, [format, safePercent]);

  const inlineFillStyle: React.CSSProperties = {
    width: `${safePercent}%`,
    transitionDuration: `${duration}s`,
  };

  // inside 模式：fill 过窄时把文字退到 track 末端外侧（改用 track 文字色，不再反白）
  const isInside = showInfo && infoPosition === 'inside';
  const infoInsideVisible = isInside && safePercent >= INSIDE_MIN_FILL;

  const cls = clsx(styles.progress, className);
  const trackCls = clsx(styles.track, SIZE_CLASS[size]);
  const fillCls = clsx(styles.fill, duration === 0 && styles.noTransition);
  const bodyCls = clsx(styles.body, infoPosition === 'top' ? '' : styles.noGap);

  const ariaValueText =
    typeof renderedInfo === 'string' ? renderedInfo : undefined;

  const track = (
    <div className={trackCls}>
      <div className={fillCls} style={inlineFillStyle}>
        {infoInsideVisible && (
          <span className={styles.infoInside}>{renderedInfo}</span>
        )}
      </div>
      {isInside && !infoInsideVisible && (
        <span className={clsx(styles.infoInside, styles.infoOutside)}>
          {renderedInfo}
        </span>
      )}
    </div>
  );

  return (
    <div
      className={cls}
      style={style}
      role="progressbar"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(safePercent)}
      aria-valuetext={ariaValueText}
    >
      {infoPosition === 'top' ? (
        <div className={bodyCls}>
          {showInfo && (
            <div className={clsx(styles.info, styles.top)}>{renderedInfo}</div>
          )}
          {track}
        </div>
      ) : (
        <div className={styles.row}>
          {track}
          {showInfo && infoPosition === 'right' && (
            <div className={clsx(styles.info, styles.right)}>
              {renderedInfo}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

Progress.displayName = 'Progress';
