// 1. React 及其生态
import React from 'react';
import { DropdownMenu as RadixDropdownMenu } from 'radix-ui';
import clsx from 'clsx';

// 2. 内部组件（相对路径）
import { Icon, type IconName } from '../Icon';
import { ScrollArea } from '../ScrollArea';

// 3. 样式（永远最后）
import styles from './dropdown-menu.module.less';

/**
 * 动作菜单里的一项。
 */
export interface DropdownMenuItem {
  /** 菜单项文字 */
  label: React.ReactNode;
  /** 选中该项时触发（底层 `onSelect` → 我们的 `onClick`）；有 `children` 的父项忽略此项 */
  onClick?: () => void;
  /** 危险操作（如删除）：文字走 `--stitch-danger`、高亮态软底 `--stitch-danger-bg` */
  danger?: boolean;
  /** 禁用该项（不可选、灰显；键盘导航跳过——由底层保证） */
  disabled?: boolean;
  /** 项前图标（必须是 `<Icon>` 支持的名，图标经 `<Icon>` 渲染、不接受裸 svg） */
  icon?: IconName;
  /** 子菜单项：非空 → 该项渲染为可展开的子菜单入口（底层 `Sub/SubTrigger/SubContent`） */
  children?: DropdownMenuItem[];
}

/**
 * 动作菜单（点按钮弹出的一列动作）：`trigger` 触发按钮 + `items` 动作项数组，点项**触发动作、
 * 无选中态**。受控 `open` / 非受控 `defaultOpen` / `onOpenChange`。内部把 `items` map 成底层
 * 菜单项；某项 `children` 非空即渲染成可展开的子菜单。
 *
 * 跨-prop 注意事项：
 * - **vs Select**：Select 是**选值**（`role="combobox/listbox"`、有受控 `value`、有选中态）；
 *   DropdownMenu 是**触发动作**（`role="menu/menuitem"`、无 `value`、无选中态），点项调 `item.onClick`。
 * - **vs ContextMenu**：同为一列动作，差在触发方式——DropdownMenu 由按钮 click 触发，ContextMenu 由右键触发。
 * - **items 数组 API**（跟库里 Select / Tabs / Accordion 一致）：`{ label, onClick?, danger?, disabled?,
 *   icon?, children? }`。底层 `onSelect` 归一成 `onClick`；`icon` 走 `<Icon>`（禁裸 svg）。
 * - **面 = 浮起层**：菜单面走 `--stitch-bg-elevated` + `--stitch-text-primary`，边 `--stitch-border`、
 *   圆角 `--stitch-radius-card`、阴影 `--stitch-shadow-base`；开合态 / 高亮态 / 禁用态由底层挂的
 *   `data-state` / `data-highlighted` / `data-disabled` 描，组件不自持显隐 state。
 * - **键盘 / 焦点 / ARIA**（方向键走项、Enter 选中、Esc 关、焦点归还、`role="menu"`）由底层保证，
 *   组件不重复实现；无可见标题时用 `aria-label` 给触发的可及名。
 */
export interface DropdownMenuProps {
  /** 触发器：任意可承载 click 与焦点的元素（如 `<Button>`），菜单锚定其上 */
  trigger: React.ReactNode;
  /** 动作项数组（Ant v5 `items` 风格） */
  items: DropdownMenuItem[];
  /** 受控显隐 */
  open?: boolean;
  /** 非受控初始显隐 @default false */
  defaultOpen?: boolean;
  /** 显隐变化回调 */
  onOpenChange?: (open: boolean) => void;
  /** 触发器与菜单的间距（px） @default 8 */
  sideOffset?: number;
  /** 自定义类名（挂到菜单面上） */
  className?: string;
  /** 无可见标题时给触发器的无障碍标签 */
  'aria-label'?: string;
}

// items → 底层菜单项：普通项 → Item（onSelect 归一成 onClick）；有 children → Sub/SubTrigger/SubContent。
// 递归以支持多层子菜单。
function renderItems(
  items: DropdownMenuItem[],
  keyPrefix = '',
): React.ReactNode {
  return items.map((item, index) => {
    const key = `${keyPrefix}${index}`;
    const label = (
      <>
        {item.icon && (
          <Icon name={item.icon} size="1em" className={styles.itemIcon} />
        )}
        <span className={styles.itemLabel}>{item.label}</span>
      </>
    );

    if (item.children && item.children.length > 0) {
      return (
        <RadixDropdownMenu.Sub key={key}>
          <RadixDropdownMenu.SubTrigger
            className={clsx(styles.item, item.danger && styles.danger)}
            disabled={item.disabled}
          >
            {label}
            <Icon name="chevron-right" size="1em" className={styles.subArrow} />
          </RadixDropdownMenu.SubTrigger>
          <RadixDropdownMenu.Portal>
            <RadixDropdownMenu.SubContent
              className={styles.content}
              sideOffset={8}
            >
              <ScrollArea className={styles.scroll}>
                {renderItems(item.children, `${key}-`)}
              </ScrollArea>
            </RadixDropdownMenu.SubContent>
          </RadixDropdownMenu.Portal>
        </RadixDropdownMenu.Sub>
      );
    }

    return (
      <RadixDropdownMenu.Item
        key={key}
        className={clsx(styles.item, item.danger && styles.danger)}
        disabled={item.disabled}
        // 底层 onSelect → 我们的 onClick（动作语义，无选中值）
        onSelect={item.onClick}
      >
        {label}
      </RadixDropdownMenu.Item>
    );
  });
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  trigger,
  items,
  open,
  defaultOpen,
  onOpenChange,
  sideOffset = 8,
  className,
  'aria-label': ariaLabel,
}) => (
  // open/defaultOpen/onOpenChange 与底层同名，直接透传
  <RadixDropdownMenu.Root
    open={open}
    defaultOpen={defaultOpen}
    onOpenChange={onOpenChange}
  >
    <RadixDropdownMenu.Trigger asChild aria-label={ariaLabel}>
      {trigger}
    </RadixDropdownMenu.Trigger>
    <RadixDropdownMenu.Portal>
      <RadixDropdownMenu.Content
        className={clsx(styles.content, className)}
        sideOffset={sideOffset}
      >
        <ScrollArea className={styles.scroll}>{renderItems(items)}</ScrollArea>
      </RadixDropdownMenu.Content>
    </RadixDropdownMenu.Portal>
  </RadixDropdownMenu.Root>
);

DropdownMenu.displayName = 'DropdownMenu';
