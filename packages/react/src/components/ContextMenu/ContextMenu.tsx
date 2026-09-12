// 1. React 及其生态
import React from 'react';
import { ContextMenu as RadixContextMenu } from 'radix-ui';
import clsx from 'clsx';

// 2. 内部组件（相对路径）
import { Icon, type IconName } from '../Icon';
import { ScrollArea } from '../ScrollArea';

// 3. 样式（永远最后）
import styles from './context-menu.module.less';

/**
 * 右键菜单里的一项。结构与 `DropdownMenuItem` 完全一致（同族，同一心智）。
 */
export interface ContextMenuItem {
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
  children?: ContextMenuItem[];
}

/**
 * 右键菜单（在目标区域右键弹出的一列动作）：`children` 是右键目标区、`items` 是动作项数组，
 * 点项**触发动作、无选中态**。`onOpenChange` 观察开合。
 *
 * 跨-prop 注意事项：
 * - **vs DropdownMenu**：二者**同构**——同一列动作、同 `items` 项结构（`{ label, onClick?, danger?,
 *   disabled?, icon?, children? }`）、同 `menu/menuitem` 语义、同浮起面皮；**唯一区别是触发方式**：
 *   DropdownMenu 由按钮 click 触发（有 `trigger` prop、锚在按钮上），ContextMenu 由**右键 `children`
 *   目标区**触发（无 `trigger`、锚在光标处）。当作同一心智，别学两套。
 * - **items 数组 API**（跟库里 Select / Tabs / Accordion / DropdownMenu 一致）：底层 `onSelect` 归一成
 *   `onClick`；`icon` 走 `<Icon>`（禁裸 svg）；某项 `children` 非空即渲染成可展开的子菜单。
 * - **面 = 浮起层**：菜单面走 `--stitch-bg-elevated` + `--stitch-text-primary`，边 `--stitch-border`、
 *   圆角 `--stitch-radius-card`、阴影 `--stitch-shadow-base`；开合态 / 高亮态 / 禁用态由底层挂的
 *   `data-state` / `data-highlighted` / `data-disabled` 描，组件不自持显隐 state。
 * - **键盘 / 焦点 / ARIA**（右键 / 长按开、方向键走项、Enter 选中、Esc 关、焦点归还、`role="menu"`）
 *   由底层保证，组件不重复实现。
 */
export interface ContextMenuProps {
  /** 右键目标区：在这块区域内右键（触屏长按）弹出菜单 */
  children: React.ReactNode;
  /** 动作项数组（Ant v5 `items` 风格，与 DropdownMenu 同结构） */
  items: ContextMenuItem[];
  /** 显隐变化回调 */
  onOpenChange?: (open: boolean) => void;
  /** 自定义类名（挂到菜单面上） */
  className?: string;
}

// items → 底层菜单项：普通项 → Item（onSelect 归一成 onClick）；有 children → Sub/SubTrigger/SubContent。
// 递归以支持多层子菜单。（与 DropdownMenu 同构，仅底层原语命名空间不同。）
function renderItems(
  items: ContextMenuItem[],
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
        <RadixContextMenu.Sub key={key}>
          <RadixContextMenu.SubTrigger
            className={clsx(styles.item, item.danger && styles.danger)}
            disabled={item.disabled}
          >
            {label}
            <Icon name="chevron-right" size="1em" className={styles.subArrow} />
          </RadixContextMenu.SubTrigger>
          <RadixContextMenu.Portal>
            <RadixContextMenu.SubContent
              className={styles.content}
              sideOffset={8}
            >
              <ScrollArea className={styles.scroll}>
                {renderItems(item.children, `${key}-`)}
              </ScrollArea>
            </RadixContextMenu.SubContent>
          </RadixContextMenu.Portal>
        </RadixContextMenu.Sub>
      );
    }

    return (
      <RadixContextMenu.Item
        key={key}
        className={clsx(styles.item, item.danger && styles.danger)}
        disabled={item.disabled}
        // 底层 onSelect → 我们的 onClick（动作语义，无选中值）
        onSelect={item.onClick}
      >
        {label}
      </RadixContextMenu.Item>
    );
  });
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  children,
  items,
  onOpenChange,
  className,
}) => (
  <RadixContextMenu.Root onOpenChange={onOpenChange}>
    {/* Trigger 包住右键目标区；右键（触屏长按）此区弹出菜单 */}
    <RadixContextMenu.Trigger asChild>{children}</RadixContextMenu.Trigger>
    <RadixContextMenu.Portal>
      {/* ContextMenu 锚在光标处，无 sideOffset（那是按钮锚定的 DropdownMenu 才有） */}
      <RadixContextMenu.Content className={clsx(styles.content, className)}>
        <ScrollArea className={styles.scroll}>{renderItems(items)}</ScrollArea>
      </RadixContextMenu.Content>
    </RadixContextMenu.Portal>
  </RadixContextMenu.Root>
);

ContextMenu.displayName = 'ContextMenu';
