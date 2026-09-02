// 1. React 及其生态
import React, { HTMLAttributes } from 'react';
import clsx from 'clsx';

// 2. 内部组件（相对路径）
import { Icon } from '../Icon';

// 3. 样式（永远最后）
import styles from './table.module.less';

export interface TableColumn<T = Record<string, unknown>> {
  /** 列头（表头单元格内容，也是该列的可访问名来源） */
  title: React.ReactNode;
  /** 取值字段名；缺省时靠 `render` 自定义单元格 */
  dataIndex?: keyof T;
  /** 自定义单元格渲染，优先于 `dataIndex` 取值 */
  render?: (value: unknown, record: T, index: number) => React.ReactNode;
  /** 列宽（数字按 px，字符串原样） */
  width?: string | number;
  /** 单元格水平对齐 */
  align?: 'left' | 'center' | 'right';
  /** 额外内联样式，合并到该列每个单元格 */
  style?: React.CSSProperties;
}

/**
 * 数据表（Ant v5 `Table` 语义）：`columns` + `dataSource` + `rowKey`（字段名或函数）+
 * `striped` / `showHeader` / `rowClassName` / `onRow` / `loading` / `emptyText` / `scroll`。
 *
 * 跨-prop 注意事项：
 * - **纯展示件，无内部 state，未提供排序 / 选择**：源为纯展示语义，源码为权威、不臆造 API。
 *   `extends HTMLAttributes<HTMLDivElement>`（`Omit<'onChange'>`），`...rest` 透传到卡面容器
 *   （`className` / `style` / `data-*` / `aria-*`）。
 * - **键盘维度**：表格本体无交互键盘行为；`scroll` 给定时容器成**可聚焦滚动区**（`tabIndex=0`，
 *   WCAG 2.1.1 可滚动内容须键盘可达），有 `aria-label` 时才挂 `role="region"`（无名 region 是
 *   a11y 噪声）。
 * - **图标走 `<Icon>` 非裸 `<svg>`**：空态 `<Icon name="info">`（装饰 `aria-hidden`）；加载态为纯
 *   CSS 环（中性描边 + `--stitch-accent` 高亮弧），loading overlay 挂 `role="status"` +
 *   `aria-label`。
 */
export interface TableProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onChange'
> {
  /** 列定义（Ant v5 `columns` 语义） */
  columns?: TableColumn[];
  /** 数据源（Ant v5 `dataSource` 语义） */
  dataSource?: Record<string, unknown>[];
  /** 行 key：字段名或从记录派生的函数（缺省取 `key` 字段，再退化为下标） */
  rowKey?: string | ((record: Record<string, unknown>) => string);
  /**
   * 斑马纹（偶数行加浅底）
   * @default true
   */
  striped?: boolean;
  /**
   * 是否显示表头
   * @default true
   */
  showHeader?: boolean;
  /** 自定义行类名：静态字符串或从记录派生的函数 */
  rowClassName?:
    string | ((record: Record<string, unknown>, index: number) => string);
  /** 逐行透传原生属性（如 onClick），Ant v5 `onRow` 语义 */
  onRow?: (
    record: Record<string, unknown>,
    index: number,
  ) => HTMLAttributes<HTMLTableRowElement>;
  /**
   * 加载态（叠加半透明遮罩 + spinner，屏蔽指针）
   * @default false
   */
  loading?: boolean;
  /** 空数据提示 */
  emptyText?: React.ReactNode;
  /** 溢出滚动（给定即让容器成为可键盘聚焦的滚动区，Ant v5 `scroll` 语义） */
  scroll?: {
    x?: number | string;
    y?: number | string;
  };
}

export const Table: React.FC<TableProps> = ({
  columns = [],
  dataSource = [],
  rowKey = 'key',
  striped = true,
  showHeader = true,
  rowClassName,
  onRow,
  loading = false,
  emptyText = '暂无数据',
  scroll,
  className,
  style,
  'aria-label': ariaLabel,
  ...rest
}) => {
  const getRowKey = (
    record: Record<string, unknown>,
    index: number,
  ): string => {
    if (typeof rowKey === 'function') return rowKey(record);
    return (record[rowKey] as string) || String(index);
  };

  const getRowClassName = (
    record: Record<string, unknown>,
    index: number,
  ): string => {
    const extra =
      typeof rowClassName === 'function'
        ? rowClassName(record, index)
        : rowClassName;
    return clsx(
      styles.row,
      striped && index % 2 === 1 && styles.striped,
      extra,
    );
  };

  const renderCell = (
    column: TableColumn,
    record: Record<string, unknown>,
    index: number,
  ) => {
    const value = column.dataIndex
      ? record[column.dataIndex as string]
      : undefined;
    if (column.render) return column.render(value, record, index);
    return value as React.ReactNode;
  };

  // scroll 给定 → 容器成为可聚焦滚动区（WCAG 2.1.1：可滚动内容须键盘可达）。
  // 有可访问名时才挂 role="region"（无名 region 反成 a11y 噪声）。
  const scrollable = scroll != null;
  const regionRole = scrollable && ariaLabel != null ? 'region' : undefined;

  return (
    <div
      className={clsx(
        styles.wrapper,
        scrollable && styles.scrollable,
        className,
      )}
      style={style}
      tabIndex={scrollable ? 0 : undefined}
      role={regionRole}
      aria-label={ariaLabel}
      {...rest}
    >
      <table className={clsx(styles.table, loading && styles.loading)}>
        {showHeader && (
          <thead className={styles.thead}>
            <tr className={styles.headerRow}>
              {columns.map((column, index) => (
                <th
                  key={index}
                  scope="col"
                  className={styles.headerCell}
                  style={{
                    width: column.width,
                    textAlign: column.align || 'left',
                    ...column.style,
                  }}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className={styles.tbody}>
          {dataSource.length === 0 ? (
            <tr>
              <td colSpan={columns.length || 1} className={styles.emptyCell}>
                <div className={styles.emptyContent}>
                  <Icon name="info" size={40} className={styles.emptyIcon} />
                  <span>{emptyText}</span>
                </div>
              </td>
            </tr>
          ) : (
            dataSource.map((record, index) => (
              <tr
                key={getRowKey(record, index)}
                className={getRowClassName(record, index)}
                {...onRow?.(record, index)}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={styles.cell}
                    style={{
                      textAlign: column.align || 'left',
                      ...column.style,
                    }}
                  >
                    {renderCell(column, record, index)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      {loading && (
        <div
          className={styles.loadingOverlay}
          role="status"
          aria-label="加载中"
        >
          <span className={styles.loadingSpinner} />
        </div>
      )}
    </div>
  );
};

Table.displayName = 'Table';
