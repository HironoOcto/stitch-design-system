// 1. React 及其生态
import React from 'react';
import clsx from 'clsx';
import { ToggleGroup as RadixToggleGroup } from 'radix-ui'; // 全量包，装一次

// 2. 内部组件（相对路径）
import { Icon, type IconName } from '../Icon';

// 3. 样式（永远最后）
import styles from './toggle-group.module.less';

/** 分段组里的一项 */
export interface ToggleGroupItem {
  /** 该项的值（组内唯一） */
  value: string;
  /** 文本标签（纯图标项可省，此时以 value 作可访问名） */
  label?: React.ReactNode;
  /** 图标（走 <Icon>，禁裸 svg / emoji） */
  icon?: IconName;
  /** 单独禁用该项 */
  disabled?: boolean;
}

/**
 * 分段切换组（toolbar segmented control）：一排相邻拼接的两态按钮，`single` 单选
 * （如文本对齐 左/中/右）或 `multiple` 多选（如富文本 加粗/斜体/下划线）。组合
 * Radix `ToggleGroup.Root/Item`，每项按下态用 Radix `data-state`（`on`/`off`）——
 * 按下选中皮 = **软 accent 底**（`--stitch-bg-accent` + `--stitch-text-on-accent`，与
 * `Toolbar` 内分段选中态同源，紧凑小圆角）；**不**走 CTA 填充青，也**不**走 ink 重填充
 * （那是胶囊 Tab 的语言、归 `Tabs`）——同一个分段开关独立用或嵌进 `Toolbar` 都长一样。
 *
 * 精确 props 分 `type` 两支：单选见 `ToggleGroupSingleProps`（值为**标量**），多选见
 * `ToggleGroupMultipleProps`（值为**数组**）；本接口是两支共有的基座（`items` / `disabled`
 * / 命名 / 样式）。
 *
 * ARIA（Radix 按 `type` 自动挂，非本层控制）：`single` → 根 `role="radiogroup"` + 项
 * `role="radio"`（`aria-checked`）；`multiple` → 根 `role="toolbar"` + 项为普通 `<button>`
 * （`aria-pressed`）。
 *
 * 与相邻件的边界（**别混用**）：
 * - **vs Toggle**——那是**单个**两态按钮；ToggleGroup 是**一组**拼接的分段。
 * - **vs Radio**——两者单选态 ARIA 同为 radiogroup/radio，但 **Radio 是表单控件**（真
 *   `<input type=radio>` + `name`、随表单提交、纵向选项列表）；ToggleGroup 是**工具栏视觉分段**
 *   （一排 `<button>` 拼接、表达「当前视图 / 格式激活哪几段」），**不进表单、不提交**。选表单字段用
 *   Radio，选工具栏分段用 ToggleGroup。
 * - **vs Tabs**——Tabs 切换页内**面板内容**、长相是**胶囊 Tab（ink 药丸）**；ToggleGroup 不关联
 *   面板、只表达选中态，长相是**紧凑分段开关（软 accent 底）**。要「一排药丸切视图/切页」用 Tabs，
 *   要「一簇格式/对齐开关」用 ToggleGroup。
 * - **vs Toolbar**——Toolbar 是**容器**（一整条工具条，混排按钮/链接/分隔/分段）；ToggleGroup 是
 *   **一簇分段控件**，可独立用、也可作为 `Toolbar.ToggleGroup` 嵌进 Toolbar。两处选中皮一致。
 *
 * 跨-prop 注意事项：
 * - **值按 `type` 归一**：`type="single"` 时 `value`/`defaultValue`/`onChange` 全走**标量**
 *   （取消选中回 `''`）；`type="multiple"` 时全走**数组**。底层 Radix `onValueChange` 已按
 *   `type` 回对应形状，本层直接映射成我们的 `onChange`。
 * - **受控/非受控双模式**：给 `value` 由父管、只给 `defaultValue` 组件自管（透传底层，
 *   不自持 state）。
 * - **按下选中皮只读 `var(--stitch-bg-accent)` / `var(--stitch-text-on-accent)`**——每站个性由
 *   adapter 灌值，组件不硬编码 hex / 圆角 / 字体。
 * - **Accessibility**：整组传 `aria-label` / `aria-labelledby` 命名；纯图标项（只给 `icon`
 *   不给 `label`）自动以 `value` 作可访问名。图标一律走 `<Icon>`，**Do NOT** 传 emoji /
 *   Unicode 符号 / 裸 `<svg>`。键盘（方向键在项间漫游 + Space/Enter 翻转）/ 焦点 / ARIA 归 Radix。
 */
export interface ToggleGroupProps {
  /** 一排分段项 */
  items: ToggleGroupItem[];
  /** 禁用整组 */
  disabled?: boolean;
  /** 自定义类名（挂到根上） */
  className?: string;
  /** 自定义样式（挂根） */
  style?: React.CSSProperties;
  /** 整组可访问名 */
  'aria-label'?: string;
  /** 整组可访问名（引用其它元素 id） */
  'aria-labelledby'?: string;
}

/** 单选分段：值为**标量**，同一时刻至多一项按下（如对齐 左/中/右） */
export interface ToggleGroupSingleProps extends ToggleGroupProps {
  type: 'single';
  /** 当前按下项的值（受控）；未按下为 `''` */
  value?: string;
  /** 默认按下项的值（非受控） */
  defaultValue?: string;
  /** 变化回调，回**标量**（取消选中时回 `''`） */
  onChange?: (value: string) => void;
}

/** 多选分段：值为**数组**，可多项同时按下（如 加粗/斜体/下划线） */
export interface ToggleGroupMultipleProps extends ToggleGroupProps {
  type: 'multiple';
  /** 当前按下项的值集合（受控） */
  value?: string[];
  /** 默认按下项的值集合（非受控） */
  defaultValue?: string[];
  /** 变化回调，回**数组** */
  onChange?: (value: string[]) => void;
}

export const ToggleGroup: React.FC<
  ToggleGroupSingleProps | ToggleGroupMultipleProps
> = (props) => {
  const {
    items,
    disabled,
    className,
    style,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
  } = props;

  // 按 type 组装底层 Root 的取值 props（value/defaultValue/onValueChange 形状随 type 变）。
  // Radix onValueChange 已按 type 回标量 / 数组，直接映射我们的 onChange。
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
    <RadixToggleGroup.Root
      {...valueProps}
      disabled={disabled}
      className={clsx(styles.group, className)}
      style={style}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
    >
      {items.map((item) => (
        <RadixToggleGroup.Item
          key={item.value}
          value={item.value}
          disabled={item.disabled}
          className={styles.item}
          // 纯图标项（无文本标签）以 value 作可访问名，避免无名按钮
          aria-label={item.label == null ? item.value : undefined}
        >
          {item.icon && (
            <Icon name={item.icon} size="1em" className={styles.itemIcon} />
          )}
          {item.label}
        </RadixToggleGroup.Item>
      ))}
    </RadixToggleGroup.Root>
  );
};

ToggleGroup.displayName = 'ToggleGroup';
