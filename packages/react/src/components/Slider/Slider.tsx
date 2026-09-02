// 1. React 及其生态
import React from 'react';
import { Slider as RadixSlider } from 'radix-ui';
import clsx from 'clsx';

// 3. 样式（永远最后）
import styles from './slider.module.less';

export type SliderOrientation = 'horizontal' | 'vertical';

/**
 * 拖动条（Ant `Slider` 语义）：拖 thumb 在 `min`–`max` 间按 `step` 取连续/离散值。
 * 单值给标量（一个 thumb）、区间给数组（两个 thumb）；`value`/`defaultValue`/`onChange`
 * + `min`/`max`/`step` + `disabled` + `orientation`。
 *
 * 跨-prop 注意事项：
 * - **标量↔数组归一**：底层 `value` 恒为数组（支持多 thumb）；对外单值时接受标量、内部包成
 *   `[v]`，`onValueChange(arr)` → 单值取 `arr[0]`、区间原样传数组。是否区间由 `value ??
 *   defaultValue` 是否为数组判定（数组 = 区间，渲两个 thumb）。
 * - **vs Progress**：Progress 只读展示进度、无 thumb 不可拖；Slider **可拖取值**。
 *   vs Switch：Switch 是布尔两态，Slider 是连续/离散取值。
 * - **受控/非受控双模式**：给 `value` 由父管（配 `onChange`），只给 `defaultValue` 组件自管；
 *   两者内部包成数组后透传底层。
 * - **Less 皮**：`track` 走 `--stitch-border` 底槽、`range` 走 `--stitch-accent`、`thumb`
 *   圆点 + focus 环 `--stitch-focus-ring`；禁用态由底层挂的 `data-disabled` 描，组件不自持 state。
 * - **键盘 / 焦点 / ARIA**（←→ 调值、Home/End、`aria-valuenow`）由底层保证，组件不重复实现；
 *   thumb 是 `role="slider"`，**须有可及名**——用 `aria-label` 或 `aria-labelledby` 指定
 *   （内容相关，由使用者给）。
 */
export interface SliderProps {
  /** 受控值：标量 = 单值（一个 thumb），数组 = 区间（多个 thumb） */
  value?: number | number[];
  /** 非受控初始值：标量 = 单值，数组 = 区间 */
  defaultValue?: number | number[];
  /** 值变化回调；单值回标量、区间回数组（与传入形状一致） */
  onChange?: (value: number | number[]) => void;
  /**
   * 最小值
   * @default 0
   */
  min?: number;
  /**
   * 最大值
   * @default 100
   */
  max?: number;
  /**
   * 步长
   * @default 1
   */
  step?: number;
  /** 禁用 */
  disabled?: boolean;
  /**
   * 朝向
   * @default 'horizontal'
   */
  orientation?: SliderOrientation;
  /** 自定义类名（挂到根轨道容器） */
  className?: string;
  /** 无障碍标签（无可见 label 时给 thumb 一个可及名） */
  'aria-label'?: string;
  /** 关联外部可见 label 的 id */
  'aria-labelledby'?: string;
}

const toArray = (v: number | number[]): number[] =>
  Array.isArray(v) ? v : [v];

export const Slider: React.FC<SliderProps> = ({
  value,
  defaultValue,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  orientation = 'horizontal',
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}) => {
  // 是否区间：由传入形状（value 优先，回退 defaultValue）是否为数组判定
  const isRange = Array.isArray(value ?? defaultValue);

  const radixValue = value !== undefined ? toArray(value) : undefined;
  const radixDefaultValue =
    defaultValue !== undefined ? toArray(defaultValue) : undefined;

  // thumb 数 = 当前值数组长度（单值 1、区间 2+），无值兜底 1
  const thumbCount = (radixValue ?? radixDefaultValue)?.length ?? 1;

  // 底层回调恒回数组：单值取 arr[0]、区间原样传出
  const handleValueChange = (arr: number[]) => {
    onChange?.(isRange ? arr : arr[0]!);
  };

  return (
    <RadixSlider.Root
      className={clsx(styles.root, className)}
      value={radixValue}
      defaultValue={radixDefaultValue}
      onValueChange={onChange ? handleValueChange : undefined}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      orientation={orientation}
    >
      <RadixSlider.Track className={styles.track}>
        <RadixSlider.Range className={styles.range} />
      </RadixSlider.Track>
      {Array.from({ length: thumbCount }, (_, i) => (
        <RadixSlider.Thumb
          key={i}
          className={styles.thumb}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
        />
      ))}
    </RadixSlider.Root>
  );
};

Slider.displayName = 'Slider';
