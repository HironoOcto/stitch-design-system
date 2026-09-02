// 1. React 及其生态
import React, { useCallback, useId, useRef, useState } from 'react';
import clsx from 'clsx';

// 2. 样式（永远最后）
import styles from './tabs.module.less';

export interface TabItem {
  /** 唯一标识，切换 / 受控回写都用它 */
  key: string;
  /** 标签文本（tab 的可访问名来源） */
  label: React.ReactNode;
  /** 该 tab 激活时显示的面板内容 */
  children: React.ReactNode;
}

/**
 * 药丸标签组（Ant v5 `Tabs` `items` 语义）：`items` 面板列表 + 受控 `activeKey` /
 * 非受控 `defaultActiveKey` + `onChange`。
 *
 * 跨-prop 注意事项：
 * - **受控/非受控双模式**：给 `activeKey` 即受控（配 `onChange` 用），只给
 *   `defaultActiveKey` 组件自管（缺省取首项）。`extends HTMLAttributes<HTMLDivElement>`
 *   但 `Omit<'onChange'>`——原生 form 的 `onChange` 与本组件 `(key)=>void` 签名冲突；
 *   `...rest` 透传到根 `<div>`（`className` / `style` / `data-*`）。
 * - **`aria-label` 路由到 tablist**：显式解构后挂到 `role="tablist"` 而非根 `...rest`——
 *   tablist 才是需要可访问名的元素。每个 tab 与其面板经 `aria-controls` / `aria-labelledby`
 *   双向关联。
 * - **激活指示双通道**：激活 tab 由「反色暗面填充（`--stitch-bg-inverted` +
 *   `--stitch-text-on-dark`）+ `aria-selected`」两通道同时表达，无需额外状态图标；未激活为
 *   透明底 + `--stitch-text-primary` + `--stitch-border` 发丝药丸边。切换时面板内容随
 *   `activeKey` 重挂载令淡入每次都重放（`--stitch-motion-*`），而非仅首次挂载放一次。
 */
export interface TabsProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onChange'
> {
  /** 标签项列表（Ant v5 `items` 语义） */
  items: TabItem[];
  /** 非受控初始激活项 key（缺省取首项） */
  defaultActiveKey?: string;
  /** 受控激活项 key（给了即受控；配 `onChange` 用） */
  activeKey?: string;
  /** 激活项变化回调（受控/非受控都会触发） */
  onChange?: (key: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  defaultActiveKey,
  activeKey,
  onChange,
  className,
  'aria-label': ariaLabel,
  ...rest
}) => {
  const [innerActiveKey, setInnerActiveKey] = useState(
    defaultActiveKey ?? items[0]?.key,
  );
  const isControlled = activeKey !== undefined;
  const currentActiveKey = isControlled ? activeKey : innerActiveKey;

  // tablist 内每个 tab 的稳定 id 前缀，用于 aria-controls / aria-labelledby 双向关联
  const idPrefix = `stitch-tabs-${useId().replace(/:/g, '')}`;
  const tabId = (k: string) => `${idPrefix}-tab-${k}`;
  const panelId = (k: string) => `${idPrefix}-panel-${k}`;

  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const handleTabClick = useCallback(
    (key: string) => {
      if (!isControlled) setInnerActiveKey(key);
      onChange?.(key);
    },
    [isControlled, onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const { key } = e;
      if (
        key !== 'ArrowRight' &&
        key !== 'ArrowLeft' &&
        key !== 'Home' &&
        key !== 'End'
      ) {
        return;
      }
      e.preventDefault();
      const idx = items.findIndex((i) => i.key === currentActiveKey);
      if (idx < 0) return;
      let nextIdx = idx;
      if (key === 'ArrowRight') nextIdx = (idx + 1) % items.length;
      else if (key === 'ArrowLeft')
        nextIdx = (idx - 1 + items.length) % items.length;
      else if (key === 'Home') nextIdx = 0;
      else if (key === 'End') nextIdx = items.length - 1;
      const nextKey = items[nextIdx].key;
      handleTabClick(nextKey);
      tabRefs.current.get(nextKey)?.focus();
    },
    [items, currentActiveKey, handleTabClick],
  );

  const activeItem = items.find((item) => item.key === currentActiveKey);

  return (
    <div className={clsx(styles.tabs, className)} {...rest}>
      <div
        className={styles.tabList}
        role="tablist"
        aria-label={ariaLabel}
        aria-orientation="horizontal"
        onKeyDown={handleKeyDown}
      >
        {items.map((item) => {
          const isActive = item.key === currentActiveKey;
          return (
            <button
              key={item.key}
              ref={(el) => {
                if (el) tabRefs.current.set(item.key, el);
                else tabRefs.current.delete(item.key);
              }}
              id={tabId(item.key)}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={panelId(item.key)}
              tabIndex={isActive ? 0 : -1}
              className={clsx(styles.tabItem, isActive && styles.active)}
              onClick={() => handleTabClick(item.key)}
            >
              <span className={styles.tabLabel}>{item.label}</span>
            </button>
          );
        })}
      </div>
      <div
        className={styles.tabContent}
        role="tabpanel"
        id={activeItem ? panelId(activeItem.key) : undefined}
        aria-labelledby={activeItem ? tabId(activeItem.key) : undefined}
        tabIndex={0}
      >
        <div className={styles.tabContentInner} key={activeItem?.key}>
          {activeItem?.children}
        </div>
      </div>
    </div>
  );
};

Tabs.displayName = 'Tabs';
