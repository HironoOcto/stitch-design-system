// 图表响应式 + a11y 外壳（dataviz 私有原语——不进桶导出、不进族表/demo）。
//
// 统一两件事，避免每个图表族成员各写一套：
//   1. 响应式包法：recharts 的 `ResponsiveContainer` 让 SVG 跟着容器宽高自适应；
//      所有图表统一从这里包，宽度默认铺满、高度由消费者给（图表无内在高度）。
//   2. a11y 外壳：整张图对辅助技术是「一张图」——外层 `role="img"` + `aria-label`
//      作文本替代；消费者漏传时兜底一个非空名，保证图表永不裸奔（守 design-rules a11y）。
//
// 1. React 及其生态
import React from 'react';
import { ResponsiveContainer } from 'recharts';

// 3. 样式（永远最后）
import styles from './chart-frame.module.less';

export interface ChartFrameProps {
  /**
   * 图表整体的可访问名（文本替代）。漏传时兜底 `'图表'`，保证 `role="img"` 永远有名。
   */
  ariaLabel?: string;
  /**
   * 图表高度（px）。图表无内在高度，须由消费者给；宽度恒铺满容器。
   * @default 300
   */
  height?: number;
  /** 单个 recharts 图表元素（LineChart / BarChart / PieChart…）。 */
  children: React.ReactElement;
  /** 透传到外层容器 */
  className?: string;
}

/**
 * 把单个 recharts 图表包进响应式容器 + `role="img"` a11y 外壳。
 */
export const ChartFrame: React.FC<ChartFrameProps> = ({
  ariaLabel = '图表',
  height = 300,
  children,
  className,
}) => (
  <div
    role="img"
    aria-label={ariaLabel}
    className={className ? `${styles.frame} ${className}` : styles.frame}
  >
    <ResponsiveContainer width="100%" height={height}>
      {children}
    </ResponsiveContainer>
  </div>
);

ChartFrame.displayName = 'ChartFrame';
