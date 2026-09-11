// 1. React 及其生态
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import clsx from 'clsx';

// 2. 内部组件（相对路径）
import { Icon } from '../Icon';

// 3. 样式（永远最后）
import styles from './chat-input.module.less';

export type ChatInputSubmitType = 'enter' | 'shiftEnter';

/** autoSize 精细档：限制自增高的最小 / 最大行数（照搬 antd Input.TextArea / Sender） */
export interface ChatInputAutoSize {
  /** 最小行数（低于此仍占此高） */
  minRows?: number;
  /** 最大行数（超过后内部滚动、不再增高） */
  maxRows?: number;
}

/**
 * 聊天输入器：多行 textarea **自增高**（`autoSize`）+ 受控/非受控 `value` + `submitType`
 * 决定发送键位（Enter 发送 / Shift+Enter 换行）+ `onSubmit` 发送回调 + `prefix` / `actions`
 * 插槽（附件按钮等钩子由 app 填）。对外 props 照搬 antd `Input`（`value` / `onChange` /
 * `disabled` / `placeholder` / `autoSize`）+ 聊天专属补 Ant Design X `Sender`
 * （`onSubmit` / `loading` / `submitType` / `prefix` / `actions`）。
 *
 * 跨-prop 注意事项：
 * - **受控/非受控双模式**：给 `value` 由父管，只给 `defaultValue` 组件自管；非受控时发送后
 *   自动清空，受控时清空由父在 `onSubmit` 里做（组件不擅自改父的值）。
 * - **`autoSize` 自增高**：`true`（默认）随内容行数增高；传 `{ minRows, maxRows }` 卡上下界，
 *   超 `maxRows` 内部滚动。`false` 关自增（固定单行高、可手动拉伸由浏览器定）。
 * - **`submitType` 定发送键位**：`enter`（默认）→ Enter 发送、Shift+Enter 换行；`shiftEnter`
 *   → Shift+Enter 发送、Enter 换行。输入法组词中（IME composing）的 Enter 一律只上屏、不发送。
 * - **`onSubmit` 只在有内容时触发**：纯空白不发送；`disabled` / `loading` 时不发送。发送键是
 *   原生 `<button>`，图标走 `<Icon name="send">`（禁 emoji / Unicode / 裸 svg），`sendAriaLabel`
 *   定其可访问名。
 * - **IM 无停止态**：`loading` 只置发送键忙 / 禁发，**不**把发送键换成「停止」键（那是 AI 生成
 *   语境；IM 是人对人、无生成可停）。
 * - **`prefix` / `actions` 传你自己的元素**（附件按钮走 `<Icon>` 或 `<Button>`）——**Do NOT** 传
 *   emoji / Unicode 符号 / 裸 `<svg>`。附件的选择 / 上传逻辑由 app 实现，组件只留插槽。
 * - **可及名**：其余原生 textarea 属性（`aria-label` / `id` / `name` / `maxLength` …）经 `...rest`
 *   透传到内部 `<textarea>`——给它可访问名（配 `<label htmlFor>` 或 `aria-label`）。
 */
export interface ChatInputProps extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'onSubmit'
  | 'onKeyDown'
  | 'rows'
  | 'prefix'
> {
  /** 输入值（受控）；不传由组件自管（非受控，配 `defaultValue`） */
  value?: string;
  /** 默认值（非受控初始值） */
  defaultValue?: string;
  /** 值变化回调（照搬 antd Input） */
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
  /** 发送回调（照搬 Ant Design X Sender）：参数为当前消息文本 */
  onSubmit?: (message: string) => void;
  /** 占位符（照搬 antd Input） */
  placeholder?: string;
  /** 禁用（照搬 antd Input） */
  disabled?: boolean;
  /**
   * 发送中（照搬 Sender）：置发送键忙 / 禁发；**IM 无停止态**，不换成「停止」键
   * @default false
   */
  loading?: boolean;
  /**
   * 多行自增高（照搬 antd Input.TextArea / Sender）：`true` 随内容增高，`{ minRows, maxRows }`
   * 卡上下界，`false` 关自增
   * @default true
   */
  autoSize?: boolean | ChatInputAutoSize;
  /**
   * 发送键位（照搬 Sender）：`enter` = Enter 发送 / Shift+Enter 换行；`shiftEnter` 反之
   * @default 'enter'
   */
  submitType?: ChatInputSubmitType;
  /** 前缀插槽（附件按钮等钩子，照搬 Sender）；附件逻辑由 app */
  prefix?: React.ReactNode;
  /** 动作区插槽（照搬 Sender）：覆盖默认发送键旁的自定义动作 */
  actions?: React.ReactNode;
  /**
   * 发送键的无障碍标签（纯图标按钮必备可访问名）
   * @default '发送'
   */
  sendAriaLabel?: string;
  /** 自定义类名（挂到根容器） */
  className?: string;
  /** 行内样式（挂到根容器） */
  style?: React.CSSProperties;
}

// 单行文本高度的兜底行数：autoSize=true（无 minRows）时的起始行数。
const DEFAULT_MIN_ROWS = 1;

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  defaultValue,
  onChange,
  onSubmit,
  placeholder,
  disabled = false,
  loading = false,
  autoSize = true,
  submitType = 'enter',
  prefix,
  actions,
  sendAriaLabel = '发送',
  className,
  style,
  ...rest
}) => {
  const [innerValue, setInnerValue] = useState(defaultValue ?? '');
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : innerValue;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自增高：先把高度归 auto 量出内容真实 scrollHeight（textarea 无边框无内边距 → scrollHeight
  // 即内容高），再按行高换算的上下界夹住。textarea 用 border-box，行高来自角色变量。
  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (el == null || autoSize === false) return;
    const cfg: ChatInputAutoSize = autoSize === true ? {} : autoSize;
    const lineHeight = parseFloat(window.getComputedStyle(el).lineHeight) || 0;
    el.style.height = 'auto';
    let next = el.scrollHeight;
    if (lineHeight > 0) {
      const minRows = cfg.minRows ?? DEFAULT_MIN_ROWS;
      next = Math.max(next, minRows * lineHeight);
      if (cfg.maxRows != null) {
        const maxH = cfg.maxRows * lineHeight;
        // 超 maxRows：卡高 + 内部滚动；未超：随内容、不出滚动条。
        el.style.overflowY = next > maxH ? 'auto' : 'hidden';
        next = Math.min(next, maxH);
      } else {
        el.style.overflowY = 'hidden';
      }
    }
    el.style.height = `${next}px`;
  }, [autoSize]);

  // 值变化后立即量高，用 layout effect 避免闪一帧旧高。
  useLayoutEffect(() => {
    resize();
  }, [currentValue, resize]);

  // 宽度变化才重量（响应式 / 首帧宽度未定→复位到正确行高，避免用错误宽度量出的高度被卡死）。
  // 只认宽度变化：本函数会写 height，若也响应高度变化就自触发死循环。
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (
      el == null ||
      autoSize === false ||
      typeof ResizeObserver === 'undefined'
    )
      return;
    let lastWidth = -1;
    const ro = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      if (width !== lastWidth) {
        lastWidth = width;
        resize();
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [autoSize, resize]);

  const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> =
    useCallback(
      (e) => {
        if (!isControlled) setInnerValue(e.target.value);
        onChange?.(e);
      },
      [isControlled, onChange],
    );

  const submit = useCallback(() => {
    if (disabled || loading) return;
    const message = currentValue;
    if (message.trim() === '') return;
    onSubmit?.(message);
    // 非受控：发送后清空自管值；受控交父在 onSubmit 里清（组件不擅改父的值）。
    if (!isControlled) setInnerValue('');
  }, [disabled, loading, currentValue, onSubmit, isControlled]);

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> =
    useCallback(
      (e) => {
        if (e.key !== 'Enter') return;
        // 输入法组词中的 Enter 只用于上屏候选词，一律不触发发送。
        if (e.nativeEvent.isComposing) return;
        // submitType 决定「哪种 Enter 组合发送」：enter → 裸 Enter 发送、Shift+Enter 换行；
        // shiftEnter → Shift+Enter 发送、裸 Enter 换行。命中发送组合即拦默认换行并发送。
        const isSubmitCombo = submitType === 'enter' ? !e.shiftKey : e.shiftKey;
        if (!isSubmitCombo) return;
        e.preventDefault();
        submit();
      },
      [submitType, submit],
    );

  const canSend = !disabled && !loading && currentValue.trim() !== '';

  return (
    <div
      className={clsx(
        styles.input,
        disabled && styles['is-disabled'],
        className,
      )}
      style={style}
    >
      {prefix != null && <div className={styles.prefix}>{prefix}</div>}
      <textarea
        ref={textareaRef}
        className={styles.textarea}
        value={currentValue}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        {...rest}
      />
      <div className={styles.actions}>
        {actions}
        <button
          type="button"
          className={styles.send}
          onClick={submit}
          disabled={!canSend}
          aria-label={sendAriaLabel}
          aria-busy={loading || undefined}
        >
          <Icon name="send" size={20} />
        </button>
      </div>
    </div>
  );
};

ChatInput.displayName = 'ChatInput';
