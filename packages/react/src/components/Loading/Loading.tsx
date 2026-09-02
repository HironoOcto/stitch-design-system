// 1. React 及其生态
import React, { useEffect, useState } from 'react';
import clsx from 'clsx';

// 3. 样式（永远最后）
import styles from './loading.module.less';

export type LoadingSize = 'small' | 'middle' | 'large';

export interface LoadingProps {
  /**
   * 是否处于加载中：`true` 显示遮罩 + 转圈，`false` 淡出后隐藏
   * （对齐 Ant v5 `Spin.spinning`）
   * @default true
   */
  spinning?: boolean;
  /**
   * 转圈尺寸
   * @default 'middle'
   */
  size?: LoadingSize;
  /** 转圈下方的提示文案；字符串时兼作无障碍名 */
  tip?: React.ReactNode;
  /** 透传到遮罩根元素 */
  className?: string;
  /** 透传到遮罩根元素 */
  style?: React.CSSProperties;
}

// 淡出动效结束后才 display:none —— 用 motion token 上限（0.35s）兜底
const FADE_OUT_MS = 350;

export const Loading: React.FC<LoadingProps> = ({
  spinning = true,
  size = 'middle',
  tip,
  className,
  style,
}) => {
  // hidden：淡出结束后彻底移出布局（display:none）
  const [hidden, setHidden] = useState(!spinning);
  // spinning 转 true 时立刻显示 —— 渲染期派生（React 官方「随 prop 改 state」写法，
  // 用 state 记上一个 spinning、立即 bail-out 重渲染，避免 setState-in-effect 的级联渲染）。
  const [prevSpinning, setPrevSpinning] = useState(spinning);
  if (spinning !== prevSpinning) {
    setPrevSpinning(spinning);
    if (spinning) {
      setHidden(false);
    }
  }

  // 转 false 才需延时：淡出动效结束后再 display:none（外部计时 = 正当的 effect 用途）
  useEffect(() => {
    if (spinning) return;
    const timer = setTimeout(() => setHidden(true), FADE_OUT_MS);
    return () => clearTimeout(timer);
  }, [spinning]);

  // 无障碍名：优先字符串 tip，其次默认「加载中」（非字符串 tip 由可见文本兜底）
  const ariaLabel =
    typeof tip === 'string' && tip ? tip : tip ? undefined : '加载中';

  return (
    <div
      className={clsx(
        styles.overlay,
        !spinning && styles.closing,
        hidden && styles.hidden,
        className,
      )}
      style={style}
      role="status"
      aria-live="polite"
      aria-busy={spinning || undefined}
      aria-label={ariaLabel}
    >
      <span
        className={clsx(styles.spinner, styles[`spinner-${size}`])}
        aria-hidden="true"
      />
      {tip ? <span className={styles.tip}>{tip}</span> : null}
    </div>
  );
};

Loading.displayName = 'Loading';
