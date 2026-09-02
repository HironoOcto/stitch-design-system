// 1. React 及其生态
import React, { useState, useCallback } from 'react';
import clsx from 'clsx';

// 2. 内部组件（相对路径）
import { Button, type ButtonProps } from '../Button';

// 3. 样式（永远最后）
import styles from './toggle.module.less';

/**
 * 两态按钮（toggle）：在底件 `Button` 之上只加「按下态」那一层——底 `<button>` / 尺寸 / 图标插槽 /
 * `type`·`danger`·`ghost`·`block` 皮全复用 `Button`（不重写）。相对普通 `Button` 补两点：
 *
 * - 内部持 `pressed` 态（**受控/非受控双模式**：`pressed` / `defaultPressed` / `onPressedChange`）；
 *   渲染 `aria-pressed={pressed}` + 按下选中样式（accent 填充，与 Switch/Checkbox/Radio 选中同源），
 *   点击翻转。底件是原生 `<button>`，Space/Enter 天然触发翻转，无需额外键处理。
 *
 * 与已有 `Switch` 的边界（**别混用**）：
 * - **`Switch`**（`role="switch"` + `aria-checked`）= 改「设置 / 状态」的开关（如「深色模式 开/关」「通知 开/关」）——
 *   语义是「打开或关闭某项功能」，通常带 on/off 视觉隐喻（轨 + 滑块）。
 * - **`Toggle`**（两态按钮 + `aria-pressed`）= 工具栏里「可按住的操作按钮」（如富文本的 加粗 / 斜体，
 *   或视图切换按钮）——语义是「这个动作当前处于激活/按下」，长得就是个高亮起来的按钮。
 *   要「一组互斥」（如对齐 左/中/右）属 `toggle-group`，不在本件范围。
 *
 * 跨-prop 注意事项：
 * - **受控/非受控双模式**：给 `pressed` 由父管、组件不自持；只给 `defaultPressed` 则组件自管。
 *   两种模式下点击都会回调 `onPressedChange(next)`。
 * - **透传底件 `Button`**：`type` / `size` / `danger` / `ghost` / `block` / `icon` / `disabled` /
 *   原生 `<button>` 属性（`onClick` 等）全部透传（`onClick` 会在翻转前先被调用）。默认 `type` 沿用
 *   Button 的 `'default'`（有边框）；工具栏场景可传 `type="text"` 取更安静的底。
 * - **按下选中样式只读 `var(--stitch-accent*)`**——每站个性由 adapter 灌值，组件不硬编码 hex/圆角/字体。
 * - **Accessibility**：纯图标 Toggle 请传 `aria-label`；图标一律走 `<Icon>`，**Do NOT** 传
 *   emoji / Unicode 符号 / 裸 `<svg>`。
 */
export interface ToggleProps extends ButtonProps {
  /** 是否按下（受控） */
  pressed?: boolean;
  /**
   * 默认是否按下（非受控）
   * @default false
   */
  defaultPressed?: boolean;
  /** 按下态变化回调 */
  onPressedChange?: (pressed: boolean) => void;
}

export const Toggle: React.FC<ToggleProps> = ({
  pressed,
  defaultPressed = false,
  onPressedChange,
  disabled = false,
  onClick,
  className,
  ...rest
}) => {
  const [innerPressed, setInnerPressed] = useState(defaultPressed);
  const isControlled = pressed !== undefined;
  const isPressed = isControlled ? pressed : innerPressed;

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (disabled) return;
      const next = !isPressed;
      if (!isControlled) setInnerPressed(next);
      onPressedChange?.(next);
    },
    [onClick, disabled, isPressed, isControlled, onPressedChange],
  );

  return (
    <Button
      {...rest}
      disabled={disabled}
      aria-pressed={isPressed}
      onClick={handleClick}
      className={clsx(styles.toggle, isPressed && styles.pressed, className)}
    />
  );
};

Toggle.displayName = 'Toggle';
