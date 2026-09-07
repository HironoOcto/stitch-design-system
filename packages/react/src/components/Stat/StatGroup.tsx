// 一排指标块，相邻项之间一道发丝线（var(--stitch-border)）分隔——常见于仪表盘顶部那排
// Total Visits / Views per Visit / … 的指标行。子项通常是 <Stat>，但不限死（任意 children）。
//
// 1. React 及其生态
import React from 'react';
import clsx from 'clsx';

// 3. 样式（永远最后）
import styles from './stat.module.less';

/**
 * 一排指标：把每个子项裹进一格，相邻格之间用发丝线 `var(--stitch-border)` 竖线分隔（首项不带）。
 *
 * 跨-prop 注意事项：
 * - **分隔线只走角色变量** `var(--stitch-border)` + `var(--stitch-border-width)`——零硬编码。
 * - 子项各自成格、等高对齐；换行时靠 flex-wrap，格内间距走 `var(--stitch-spacing-*)`。
 */
export interface StatGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 一排指标子项（通常是 `<Stat>`） */
  children?: React.ReactNode;
}

/** 把一排指标横排，相邻项之间以发丝线分隔。 */
export const StatGroup: React.FC<StatGroupProps> = ({
  children,
  className,
  ...rest
}) => {
  return (
    <div className={clsx(styles.group, className)} {...rest}>
      {React.Children.map(children, (child) =>
        child == null || child === false ? (
          child
        ) : (
          <div className={styles['group-item']}>{child}</div>
        ),
      )}
    </div>
  );
};

StatGroup.displayName = 'StatGroup';
