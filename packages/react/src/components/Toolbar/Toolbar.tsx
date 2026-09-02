// 1. React 及其生态
import React from 'react';
import { Toolbar as RadixToolbar } from 'radix-ui'; // 全量包，装一次
import clsx from 'clsx';

// 2. 内部组件（相对路径）
import { Icon } from '../Icon';
import { type ToggleGroupItem } from '../ToggleGroup/ToggleGroup';

// 3. 样式（永远最后）—— 工具栏自有安静命令控件皮（非复用 Button/ToggleGroup 药丸皮）
import styles from './toolbar.module.less';

/**
 * 工具栏容器（编排件）：一条横向容器，盛放异构混排的动作控件——按钮 / 链接 / 分隔线 / 分段
 * 切换组，统一键盘（方向键在控件间 roving）+ 给 `role="toolbar"`。组合 Radix
 * `Toolbar.Root/Button/Link/Separator/ToggleGroup/ToggleItem`。**唯一走 children + 静态挂载
 * 子组件**的组件（照 `Form.Item` 先例）：`<Toolbar>` + `Toolbar.Button` / `Toolbar.Link` /
 * `Toolbar.Separator` / `Toolbar.ToggleGroup`，**不用 `items` 数组**（Radix Toolbar 本身就是
 * 异构混排、无统一 item 数据模型，数组化会很别扭）。
 *
 * 跨-prop 注意事项：
 * - **vs 单纯并排放 `<Button>`**：Toolbar 多了 `role="toolbar"` + 方向键 roving 键盘编排
 *   （一次 Tab 进整条栏、方向键在控件间移动，而非每个按钮各占一个 Tab 站）。只想并排几个按钮、
 *   不需要 roving/`role`，直接并排 `<Button>` 即可；需要工具栏语义与键盘编排才用 Toolbar。
 * - **工具栏控件 ≠ 独立 `<Button>`（自有安静命令皮，非复用 Button 药丸皮）**：工具栏控件是
 *   密集条里的紧凑安静控件（透明底 + 中性字 + hover 软底 + **小圆角 `--stitch-radius-input`，非
 *   药丸**），照 `Menubar` 命令栏按钮先例，**不**套独立 Button/ToggleGroup 的填充药丸皮——否则一排
 *   药丸看着像并排的独立 CTA、与工具栏认知冲突。`Toolbar.ToggleGroup` 分段选中态走**软 accent 底**
 *   （`data-state='on'`，同成熟工具栏参照 Radix / Docs 的激活格式钮——软色底 + accent 文字，
 *   非 Tab-Pill 的 ink 重填充），圆角同样收到 `--stitch-radius-input`。
 * - **方向由 `orientation`**：默认 `horizontal`（横排）；`vertical` 时容器纵排、分隔线转横发丝线
 *   （底层在各 part 挂 `[data-orientation]`，皮据此切）。
 * - **键盘 / 焦点 / ARIA / roving**（Tab 进栏、方向键在控件间移动、`role="toolbar"`）由底层
 *   Radix 保证，组件不重复实现。
 */
export interface ToolbarProps {
  /** 工具栏内容：混排 `Toolbar.Button` / `Toolbar.Link` / `Toolbar.Separator` / `Toolbar.ToggleGroup` */
  children?: React.ReactNode;
  /** 排布方向 @default 'horizontal' */
  orientation?: 'horizontal' | 'vertical';
  /** 自定义类名（挂到 `role="toolbar"` 根容器上） */
  className?: string;
  /** 自定义样式（挂根） */
  style?: React.CSSProperties;
  /** 给工具栏（`role="toolbar"`）的无障碍标签 */
  'aria-label'?: string;
  /** 给工具栏的无障碍标签（引用其它元素 id） */
  'aria-labelledby'?: string;
}

/**
 * 工具栏里的动作按钮：组合 Radix `Toolbar.Button`（roving 项），走**安静命令控件皮**（透明底 +
 * 中性字 + hover 软底 + 小圆角，照 `Menubar` 命令按钮先例，**非**独立 Button 的填充药丸皮）。
 * `danger` 危险动作走 `--stitch-danger`；图标一律走 `<Icon>`——**Do NOT** 传 emoji / Unicode
 * 符号 / 裸 `<svg>`。
 */
export interface ToolbarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 危险动作样式（文字走 `--stitch-danger`、hover 软底 `--stitch-danger-bg`） @default false */
  danger?: boolean;
  /** 图标节点（传入自己的 `<Icon>`；不接受裸 svg） */
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  danger = false,
  icon,
  className,
  children,
  ...rest
}) => (
  // 直接给 Radix Toolbar.Button（它内部管 roving ref）挂上工具栏安静命令控件 class。
  <RadixToolbar.Button
    className={clsx(styles.button, danger && styles.buttonDanger, className)}
    {...rest}
  >
    {icon && <span className={styles.buttonIcon}>{icon}</span>}
    {children && <span>{children}</span>}
  </RadixToolbar.Button>
);
ToolbarButton.displayName = 'Toolbar.Button';

/**
 * 工具栏里的文字链接：组合 Radix `Toolbar.Link`（渲染 `<a>`、也是 roving 项），走安静导航
 * 文字皮（同 NavigationMenu Link）。用于「帮助 / 文档」这类跳转，与触发动作的 `Toolbar.Button` 区分。
 */
export interface ToolbarLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children?: React.ReactNode;
}

const ToolbarLink: React.FC<ToolbarLinkProps> = ({
  className,
  children,
  ...rest
}) => (
  <RadixToolbar.Link className={clsx(styles.link, className)} {...rest}>
    {children}
  </RadixToolbar.Link>
);
ToolbarLink.displayName = 'Toolbar.Link';

/**
 * 工具栏分隔线：组合 Radix `Toolbar.Separator`（`role="separator"`），横排工具栏里渲染成一条
 * 竖发丝线、把相邻控件分组。
 */
export type ToolbarSeparatorProps = React.HTMLAttributes<HTMLDivElement>;

const ToolbarSeparator: React.FC<ToolbarSeparatorProps> = ({
  className,
  ...rest
}) => (
  <RadixToolbar.Separator
    className={clsx(styles.separator, className)}
    {...rest}
  />
);
ToolbarSeparator.displayName = 'Toolbar.Separator';

/**
 * 工具栏里的分段切换组：组合 Radix `Toolbar.ToggleGroup`/`Toolbar.ToggleItem`（工具栏内建的
 * roving 分段），走工具栏安静命令控件皮，选中态（`data-state='on'`）= 软 accent 底 + accent 文字
 * （同成熟工具栏参照 Radix / Docs 激活格式钮，圆角同样收到 `--stitch-radius-input` 与整条栏协调）。`type` 分单选
 * （值为标量，如对齐 左/中/右）/ 多选（值为数组，如 加粗/斜体/下划线）；底层 `onValueChange`
 * 已按 `type` 回对应形状，本层直接映射我们的 `onChange`。
 */
interface ToolbarToggleGroupBaseProps {
  /** 一排分段项（复用 ToggleGroup 的 item 结构：`{ value, label?, icon?, disabled? }`） */
  items: ToggleGroupItem[];
  /** 禁用整组 */
  disabled?: boolean;
  /** 自定义类名（挂到分段组根上） */
  className?: string;
  /** 整组可访问名 */
  'aria-label'?: string;
  /** 整组可访问名（引用其它元素 id） */
  'aria-labelledby'?: string;
}

/** 单选分段：值为**标量**，同一时刻至多一项按下 */
export interface ToolbarToggleGroupSingleProps extends ToolbarToggleGroupBaseProps {
  type: 'single';
  /** 当前按下项的值（受控）；未按下为 `''` */
  value?: string;
  /** 默认按下项的值（非受控） */
  defaultValue?: string;
  /** 变化回调，回**标量**（取消选中时回 `''`） */
  onChange?: (value: string) => void;
}

/** 多选分段：值为**数组**，可多项同时按下 */
export interface ToolbarToggleGroupMultipleProps extends ToolbarToggleGroupBaseProps {
  type: 'multiple';
  /** 当前按下项的值集合（受控） */
  value?: string[];
  /** 默认按下项的值集合（非受控） */
  defaultValue?: string[];
  /** 变化回调，回**数组** */
  onChange?: (value: string[]) => void;
}

export type ToolbarToggleGroupProps =
  ToolbarToggleGroupSingleProps | ToolbarToggleGroupMultipleProps;

const ToolbarToggleGroup: React.FC<ToolbarToggleGroupProps> = (props) => {
  const {
    items,
    disabled,
    className,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
  } = props;

  // 按 type 组装底层取值 props（形状随 type 变）；Radix onValueChange 已按 type 回标量 / 数组，
  // 直接映射我们的 onChange（与独立 ToggleGroup 同范式）。
  const valueProps =
    props.type === 'single'
      ? {
          type: 'single' as const,
          value: props.value,
          defaultValue: props.defaultValue,
          onValueChange: props.onChange,
        }
      : {
          type: 'multiple' as const,
          value: props.value,
          defaultValue: props.defaultValue,
          onValueChange: props.onChange,
        };

  return (
    <RadixToolbar.ToggleGroup
      {...valueProps}
      disabled={disabled}
      className={clsx(styles.toggleGroup, className)}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
    >
      {items.map((item) => (
        <RadixToolbar.ToggleItem
          key={item.value}
          value={item.value}
          disabled={item.disabled}
          className={styles.toggleItem}
          // 纯图标项（无文本标签）以 value 作可访问名，避免无名按钮
          aria-label={item.label == null ? item.value : undefined}
        >
          {item.icon && (
            <Icon name={item.icon} size="1em" className={styles.itemIcon} />
          )}
          {item.label}
        </RadixToolbar.ToggleItem>
      ))}
    </RadixToolbar.ToggleGroup>
  );
};
ToolbarToggleGroup.displayName = 'Toolbar.ToggleGroup';

// 复合组件：容器 + 静态挂载子组件（照 Form.Item 先例）
interface ToolbarComponent extends React.FC<ToolbarProps> {
  Button: typeof ToolbarButton;
  Link: typeof ToolbarLink;
  Separator: typeof ToolbarSeparator;
  ToggleGroup: typeof ToolbarToggleGroup;
}

const ToolbarRoot: React.FC<ToolbarProps> = ({
  children,
  orientation = 'horizontal',
  className,
  style,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
}) => (
  <RadixToolbar.Root
    orientation={orientation}
    className={clsx(styles.root, className)}
    style={style}
    aria-label={ariaLabel}
    aria-labelledby={ariaLabelledby}
  >
    {children}
  </RadixToolbar.Root>
);
ToolbarRoot.displayName = 'Toolbar';

export const Toolbar = ToolbarRoot as ToolbarComponent;
Toolbar.Button = ToolbarButton;
Toolbar.Link = ToolbarLink;
Toolbar.Separator = ToolbarSeparator;
Toolbar.ToggleGroup = ToolbarToggleGroup;
