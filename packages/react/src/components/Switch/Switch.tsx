// 1. React 及其生态
import React, { useState, useCallback } from 'react';
import clsx from 'clsx';

// 2. 样式（永远最后）
import styles from './switch.module.less';

export type SwitchSize = 'small' | 'middle' | 'large';

/**
 * 开关（Ant `Switch` 语义）：`checked` / `defaultChecked` / `onChange(boolean)`，
 * `<button role="switch" aria-checked>` + Space/Enter 键切换。结构 = 轨（button 本体）+
 * `.handle`（滑块）+ `.inner`（轨内小文案，滑块对侧显示 `checkedChildren`/`unCheckedChildren`）。
 *
 * 跨-prop 注意事项：
 * - **受控/非受控双模式**：给 `checked` 由父管，只给 `defaultChecked` 组件自管；原生 button
 *   焦点 + 手动键处理，`aria-label` / `aria-labelledby` 透传。
 * - **形状走 `--stitch-radius-button`（轨 + 滑块同用），非 `--stitch-radius-input`**：开关是
 *   「按钮型动作」而非「取值盒」，取按钮圆角档以保住滑动隐喻（与 Checkbox/Radio 的取值盒不同源）。
 *   ON 态填 `--stitch-accent` + 边 `--stitch-accent-active`（与 Checkbox/Radio 选中同源）；
 *   OFF 轨走中性 `--stitch-border-strong`，滑块填 `--stitch-bg-elevated` + 1px `--stitch-border`。
 * - **轨内文案竖向居中的实现 gotcha**：文案套一层 inline-block `.innerText` 承载
 *   `text-box: trim-both cap alphabetic`（渐进增强）——**`text-box` 只对直接生成行盒的块/行内块
 *   生效，放在 flex 的 `.inner` 上会被静默忽略**（computed 报 trim 但盒高不变、不居中）。裁到真实
 *   cap/基线后按墨迹居中，解决 Latin 全大写（ON/OFF）无降部显偏低、与 CJK 墨位不一致的问题；
 *   fallback（不支持的浏览器）走 `line-height:normal`。带降部的文案（小写 g/y）降部挂在裁剪盒外
 *   略偏高，轨内标签惯常无降部、可接受。
 * - **尺寸 `small`/`middle`/`large`**（默认 `middle`）：控件几何（轨高/宽、滑块直径）为物理像素、
 *   非主题值；圆角/颜色/字体全走 token。`loading` 为**非交互 + `aria-busy` + 变暗**，无内建动画。
 */
export interface SwitchProps {
  /** 是否选中（受控） */
  checked?: boolean;
  /** 默认是否选中（非受控） */
  defaultChecked?: boolean;
  /** 尺寸 */
  size?: SwitchSize;
  /** 禁用 */
  disabled?: boolean;
  /** 加载状态：非交互 + `aria-busy`（无内建 spinner 动画，见 notes） */
  loading?: boolean;
  /** 选中时轨内文案 */
  checkedChildren?: React.ReactNode;
  /** 未选中时轨内文案 */
  unCheckedChildren?: React.ReactNode;
  /** 变化回调 */
  onChange?: (checked: boolean) => void;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 无障碍标签（无可见 label 时使用） */
  'aria-label'?: string;
  /** 关联外部可见 label 的 id */
  'aria-labelledby'?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  defaultChecked = false,
  size = 'middle',
  disabled = false,
  loading = false,
  checkedChildren,
  unCheckedChildren,
  onChange,
  className,
  style,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}) => {
  const [innerChecked, setInnerChecked] = useState(defaultChecked);
  const isControlled = checked !== undefined;
  const isChecked = isControlled ? checked : innerChecked;

  const handleClick = useCallback(() => {
    if (disabled || loading) return;
    const next = !isChecked;
    if (!isControlled) setInnerChecked(next);
    onChange?.(next);
  }, [disabled, loading, isChecked, isControlled, onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick],
  );

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isChecked}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-busy={loading || undefined}
      className={clsx(
        styles.switch,
        styles[size],
        isChecked && styles.checked,
        disabled && styles.disabled,
        loading && styles.loading,
        className,
      )}
      style={style}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
    >
      <span className={styles.handle} />
      <span className={styles.inner}>
        {/* 文案套一层 inline-block .innerText：text-box 只对「直接生成行盒」的块/行内块生效，
            套在 flex 的 .inner 上会被静默忽略（文字落在匿名 flex item 里）。见 switch.module.less */}
        <span className={styles.innerText}>
          {isChecked ? checkedChildren : unCheckedChildren}
        </span>
      </span>
    </button>
  );
};

Switch.displayName = 'Switch';
