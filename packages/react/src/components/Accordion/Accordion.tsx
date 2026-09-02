// 1. React 及其生态
import React, { useCallback, useState } from 'react';
import clsx from 'clsx';

// 2. 内部组件（相对路径）
import { Collapse } from '../Collapse';

// 3. 样式（永远最后）
import styles from './accordion.module.less';

export interface AccordionItem {
  /** 唯一标识：受控 `value` / 非受控 `defaultValue` 对应此 key */
  key: string;
  /** 触发区标题（可点击的问句 / 标签） */
  header: React.ReactNode;
  /** 展开后显示的面板内容 */
  children?: React.ReactNode;
  /**
   * 是否禁用该项（禁用后不可展开）
   * @default false
   */
  disabled?: boolean;
}

/**
 * 一组披露块 + 「同时只开一个」（互斥单开）：在底件 `Collapse` 之上只加容器互斥联动，
 * 单块的开合动画 / 无障碍全复用 `Collapse`（不重写）。对外取 `items` 数组（Ant v5 风格，
 * 跟库里 Select / Table 一致），容器持「当前展开项 key」，把每个 `Collapse` 的开合受控化
 * （`open = item.key === value`）、点击时切 value。
 *
 * 跨-prop 注意事项：
 * - **受控 / 非受控双模式**：给 `value` 由父管（配 `onChange`，`null` = 全收），只给
 *   `defaultValue` 组件自管。`extends HTMLAttributes<HTMLDivElement>` 但
 *   `Omit<'onChange' | 'defaultValue'>`——原生名与本组件 `(value)=>void` / `string | null`
 *   签名冲突；`...rest` 透传到根 `<div>`（`className` / `style` / `data-*` / `aria-*`）。
 * - **只做互斥单开**：点开一项其余自动收，同一时刻至多一项展开；点已展开项 → 收起（value 回 `null`）。
 *   **不做 multiple**（真要多开直接摆一排独立 `<Collapse>`）。
 * - 展开指示 / 容器表面 / 焦点环等长相全继承 `Collapse`，只读角色变量 `var(--stitch-*)`，随主题换肤变化。
 */
export interface AccordionProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onChange' | 'defaultValue'
> {
  /** 披露项列表（Ant v5 `items` 风格） */
  items: AccordionItem[];
  /**
   * 受控当前展开项 key（`null` = 全部收起；给了即受控，配 `onChange` 用）
   */
  value?: string | null;
  /**
   * 非受控初始展开项 key（`null` / 省略 = 初始全收）
   * @default null
   */
  defaultValue?: string | null;
  /** 当前展开项变化回调（受控 / 非受控都会触发；收起时回 `null`） */
  onChange?: (value: string | null) => void;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  value,
  defaultValue = null,
  onChange,
  className,
  ...rest
}) => {
  const [innerValue, setInnerValue] = useState<string | null>(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : innerValue;

  const handleItemChange = useCallback(
    (key: string, open: boolean) => {
      // open=true → 展开该项（其余因单值自动收）；open=false → 该项收起（value 回 null）。
      const next = open ? key : null;
      if (!isControlled) setInnerValue(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  return (
    <div className={clsx(styles.accordion, className)} {...rest}>
      {items.map((item) => (
        <Collapse
          key={item.key}
          header={item.header}
          disabled={item.disabled}
          open={current === item.key}
          onOpenChange={(open) => handleItemChange(item.key, open)}
        >
          {item.children}
        </Collapse>
      ))}
    </div>
  );
};

Accordion.displayName = 'Accordion';
