// 1. React 及其生态
import React from 'react';
import { Menubar as RadixMenubar } from 'radix-ui';
import clsx from 'clsx';

// 2. 内部组件（相对路径）
import { Icon, type IconName } from '../Icon';

// 3. 样式（永远最后）
import styles from './menubar.module.less';

/**
 * 菜单栏某个菜单里的一项。结构与 `DropdownMenuItem` / `ContextMenuItem` 完全一致
 * （同族，同一心智）。
 */
export interface MenubarMenuItem {
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
  children?: MenubarMenuItem[];
}

/**
 * 菜单栏里的一个顶层菜单：`label` 是栏上的按钮文字，`items` 是点开后的一列动作项。
 */
export interface MenubarMenu {
  /** 顶层菜单按钮文字（如「文件」「编辑」「视图」） */
  label: React.ReactNode;
  /** 该菜单点开后的动作项数组（与 DropdownMenu 同结构） */
  items: MenubarMenuItem[];
}

/**
 * 菜单栏（桌面应用式命令栏）：横排**一组**互相协调的顶层菜单（文件 / 编辑 / 视图…），
 * 打开一个后横向方向键即切到相邻菜单；每个菜单点开是一列动作项，点项**触发动作、无选中态**。
 * 对外 **两层 `items` 数组**（`MenubarMenu[]`，每个 menu 再含一层 `MenubarMenuItem[]`）。
 *
 * 跨-prop 注意事项：
 * - **vs NavigationMenu**：那是**站点导航**（链接为主、`role="navigation"`、跳页面）；Menubar 是
 *   **应用命令栏**（一排动作菜单、`role="menubar"`、触发命令）。
 * - **vs DropdownMenu**：那是**单个**触发按钮弹出的一列动作；Menubar 是**一排互相协调**的菜单——
 *   横向键在菜单间移动、打开态跟随鼠标切换相邻菜单（命令栏心智），并非多个独立 DropdownMenu 并排。
 * - **两层 items API**：外层 `MenubarMenu = { label, items }`（栏上一个菜单）；内层 `MenubarMenuItem`
 *   与 DropdownMenu / ContextMenu 项**同结构**（`{ label, onClick?, danger?, disabled?, icon?, children? }`）。
 *   底层 `onSelect` 归一成 `onClick`；`icon` 走 `<Icon>`（禁裸 svg）；某项 `children` 非空即渲染成可展开子菜单。
 * - **面 = 浮起层**（复用 DropdownMenu 族皮）：菜单面走 `--stitch-bg-elevated` + `--stitch-text-primary`，
 *   边 `--stitch-border`、圆角 `--stitch-radius-card`、阴影 `--stitch-shadow-base`；顶层 Trigger 是菜单栏按钮样式。
 *   开合态 / 高亮态 / 禁用态由底层挂的 `data-state` / `data-highlighted` / `data-disabled` 描，组件不自持显隐 state。
 * - **键盘 / 焦点 / ARIA**（横向键切菜单、纵向键走项、Enter 选中、Esc 关、焦点归还、`role="menubar"`）
 *   由底层保证，组件不重复实现。
 * - **悬停打开（hover 即开）**：鼠标停在某个顶层菜单约 `openDelay` 毫秒即自动展开（含首个、无需点击）；
 *   一旦有菜单开着，移到相邻菜单即切换。Radix 默认要先 click/键盘开首个（之后才 hover 切换），本组件只补
 *   「首个」这一环：保持 Radix **非受控**（切换/关闭全走 Radix 原生，无双主竞态），静息悬停满 `openDelay`
 *   且此刻无菜单开着时，程序化在该 Trigger 派发 `pointerdown` 把首个开出来，之后交给 Radix。短延时防止鼠标
 *   只是扫过工具栏就误弹。点击仍即时打开（延时只作用于悬停）。
 */
export interface MenubarProps {
  /** 两层菜单数据：栏上一排菜单，每个菜单再含一列动作项 */
  items: MenubarMenu[];
  /** 悬停多久（ms）自动展开首个菜单（防误触的意图延时；菜单已开时切换相邻不受此限、即时切换） @default 150 */
  openDelay?: number;
  /** 自定义类名（挂到菜单栏根容器上） */
  className?: string;
  /** 给菜单栏（`role="menubar"`）的无障碍标签 */
  'aria-label'?: string;
}

// 一个菜单里的 items → 底层菜单项：普通项 → Item（onSelect 归一成 onClick）；有 children →
// Sub/SubTrigger/SubContent。递归以支持多层子菜单。（与 DropdownMenu / ContextMenu 同构，
// 仅底层原语命名空间不同。）
function renderItems(
  items: MenubarMenuItem[],
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
        <RadixMenubar.Sub key={key}>
          <RadixMenubar.SubTrigger
            className={clsx(styles.item, item.danger && styles.danger)}
            disabled={item.disabled}
          >
            {label}
            <Icon name="chevron-right" size="1em" className={styles.subArrow} />
          </RadixMenubar.SubTrigger>
          <RadixMenubar.Portal>
            <RadixMenubar.SubContent className={styles.content} sideOffset={8}>
              {renderItems(item.children, `${key}-`)}
            </RadixMenubar.SubContent>
          </RadixMenubar.Portal>
        </RadixMenubar.Sub>
      );
    }

    return (
      <RadixMenubar.Item
        key={key}
        className={clsx(styles.item, item.danger && styles.danger)}
        disabled={item.disabled}
        // 底层 onSelect → 我们的 onClick（动作语义，无选中值）
        onSelect={item.onClick}
      >
        {label}
      </RadixMenubar.Item>
    );
  });
}

export const Menubar: React.FC<MenubarProps> = ({
  items,
  openDelay = 150,
  className,
  'aria-label': ariaLabel,
}) => {
  // 「hover 即开」只需补 Radix 缺的**首个菜单**——Radix Menubar 原生已支持「已有菜单开着时 hover 相邻即切换」，
  // 但首个必须 click/键盘开。做法：保持 Radix **非受控**（不接管 value，切换/关闭全走 Radix 原生、无双主竞态），
  // 静息悬停某 Trigger 满 openDelay 后，若此刻整条栏还没有菜单开着，就**在该 Trigger 派发 pointerdown** 把首个
  // 开出来（Radix 监听 pointerdown 开菜单），之后一切交给 Radix。延时防止鼠标只是扫过工具栏就误弹；已有菜单
  // 开着时不再派发（交给 Radix 原生 hover 切换）。
  const rootRef = React.useRef<HTMLDivElement>(null);
  const openTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const clearOpenTimer = () => {
    if (openTimer.current !== undefined) {
      clearTimeout(openTimer.current);
      openTimer.current = undefined;
    }
  };
  React.useEffect(() => clearOpenTimer, []);

  const handleTriggerEnter = (triggerEl: HTMLElement) => {
    clearOpenTimer();
    openTimer.current = setTimeout(() => {
      // 已有菜单开着 → 不动（交给 Radix 原生 hover 切换）；仅在全关时开首个。
      // 用 pointerdown 触发 Radix 打开（Radix MenubarTrigger 监听 onPointerDown 开菜单，button 0）——
      // 不用 .click()：Radix 不监听 click，click() 开不了。
      const anyOpen = rootRef.current?.querySelector('[data-state="open"]');
      if (!anyOpen) {
        // 用 type='pointerdown' 的 MouseEvent（带 button:0）：React 照样映射到 onPointerDown，
        // 且 jsdom / 老环境都有 MouseEvent（PointerEvent 未必），比 new PointerEvent 稳。
        triggerEl.dispatchEvent(
          new MouseEvent('pointerdown', { bubbles: true, button: 0 }),
        );
      }
    }, openDelay);
  };

  return (
    <RadixMenubar.Root
      ref={rootRef}
      className={clsx(styles.root, className)}
      aria-label={ariaLabel}
      onPointerLeave={clearOpenTimer}
    >
      {items.map((menu, index) => {
        return (
          <RadixMenubar.Menu key={index}>
            <RadixMenubar.Trigger
              className={styles.trigger}
              onPointerEnter={(e) => handleTriggerEnter(e.currentTarget)}
            >
              {menu.label}
            </RadixMenubar.Trigger>
            <RadixMenubar.Portal>
              <RadixMenubar.Content
                className={styles.content}
                align="start"
                sideOffset={4}
              >
                {renderItems(menu.items)}
              </RadixMenubar.Content>
            </RadixMenubar.Portal>
          </RadixMenubar.Menu>
        );
      })}
    </RadixMenubar.Root>
  );
};

Menubar.displayName = 'Menubar';
