// 1. React 及其生态
import React from 'react';
import { NavigationMenu as RadixNavigationMenu } from 'radix-ui';
import clsx from 'clsx';

// 2. 内部组件（相对路径）
import { Icon } from '../Icon';

// 3. 样式（永远最后）
import styles from './navigation-menu.module.less';

/**
 * 站点导航里的一项。两种形态由字段组合决定：
 * - **纯链接项**：给 `href`、不给 `content` → 渲染成 `<a>`（`NavigationMenu.Link`），点击跳转。
 * - **带面板项**：给 `content` → 渲染成触发按钮 + 展开面板（`Trigger` + `Content`），
 *   `content` 是自由 `ReactNode`（可放链接列、图文卡片等导航内容）。
 */
export interface NavItem {
  /** 导航项文字（链接文本 / 触发按钮文本 = 可访问名来源） */
  label: React.ReactNode;
  /** 目标地址：给了即渲染为链接（无 `content` 时为纯链接项，透传到底层 `<a>` 的 `href`） */
  href?: string;
  /** 展开面板内容：给了即渲染为可展开项（`Trigger` + `Content`），内容自由 ReactNode */
  content?: React.ReactNode;
  /** 标记为当前项：底层挂 `data-active` + `aria-current="page"`，皮上走激活态（`--stitch-accent`） */
  active?: boolean;
}

/**
 * 站点导航菜单（顶栏一排导航项，部分项 hover/focus 展开一块面板）：对外 `items` 数组，
 * 每项按字段渲染成纯链接（`href`）或带展开面板（`content`）。组合底层
 * `Root/List/Item/Trigger/Content/Link/Viewport`；根渲染 `<nav>` landmark。
 *
 * 跨-prop 注意事项：
 * - **items 分支（= 核心 API）**：`href` 无 `content` → `NavigationMenu.Link`（纯链接、可跳转、
 *   可标 `active`）；有 `content` → `NavigationMenu.Trigger` + `NavigationMenu.Content`（展开面板，
 *   面板内容自由 ReactNode）。与库里 Tabs / Select / DropdownMenu 一致走 `items` 数组心智。
 * - **vs Tabs**：Tabs 是**页内切换面板内容**（tablist/tab、同页多视图、无跳转）；NavigationMenu 是
 *   **站点导航**（链接为主，点击跳转 / 展开导航面板），别混用。
 * - **vs Menubar**：Menubar 是应用式菜单栏，项触发**动作命令**；NavigationMenu 是**导航链接**，
 *   项跳转或展开导航内容。
 * - **面 = 浮起层**：展开面板走 `--stitch-bg-elevated` + `--stitch-text-primary`、边 `--stitch-border`、
 *   圆角 `--stitch-radius-card`、阴影 `--stitch-shadow-base`；开合态 / 当前项由底层挂的
 *   `data-state`（`open`|`closed`）/ `data-active` 描，组件不自持显隐 state。
 * - **键盘 / 焦点 / ARIA**（方向键走项、Enter 触发、Esc 关面板、焦点归还、`<nav>` + `data-active`
 *   → `aria-current`）由底层保证，组件不重复实现。
 */
export interface NavigationMenuProps {
  /** 导航项数组（纯链接 / 带展开面板混排） */
  items: NavItem[];
  /** 显隐变化回调（任一面板开合时触发，回当前展开项的 value；全关时为空串） */
  onValueChange?: (value: string) => void;
  /** 自定义类名（挂到根 `<nav>` 上） */
  className?: string;
  /** 根导航的可访问名（挂到 `<nav>` landmark） */
  'aria-label'?: string;
}

export const NavigationMenu: React.FC<NavigationMenuProps> = ({
  items,
  onValueChange,
  className,
  'aria-label': ariaLabel,
}) => (
  <RadixNavigationMenu.Root
    className={clsx(styles.root, className)}
    aria-label={ariaLabel}
    onValueChange={onValueChange}
  >
    <RadixNavigationMenu.List className={styles.list}>
      {items.map((item, index) => {
        const key = `${index}`;
        // 带面板项：Trigger（含收起箭头）+ Content（自由 ReactNode 面板）
        if (item.content !== undefined) {
          return (
            <RadixNavigationMenu.Item key={key} className={styles.item}>
              <RadixNavigationMenu.Trigger className={styles.trigger}>
                {item.label}
                <Icon
                  name="chevron-down"
                  size="1em"
                  className={styles.caret}
                  aria-hidden
                />
              </RadixNavigationMenu.Trigger>
              <RadixNavigationMenu.Content className={styles.content}>
                {item.content}
              </RadixNavigationMenu.Content>
            </RadixNavigationMenu.Item>
          );
        }
        // 纯链接项：href 透传底层 <a>；active → data-active + aria-current="page"
        return (
          <RadixNavigationMenu.Item key={key} className={styles.item}>
            <RadixNavigationMenu.Link
              className={styles.link}
              href={item.href}
              active={item.active}
            >
              {item.label}
            </RadixNavigationMenu.Link>
          </RadixNavigationMenu.Item>
        );
      })}
    </RadixNavigationMenu.List>

    {/* 展开面板停靠区（浮起层）；带面板项的 Content 渲进这里 */}
    <div className={styles.viewportWrapper}>
      <RadixNavigationMenu.Viewport className={styles.viewport} />
    </div>
  </RadixNavigationMenu.Root>
);

NavigationMenu.displayName = 'NavigationMenu';
