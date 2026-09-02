// 1. React 及其生态
import React from 'react';
import clsx from 'clsx';

// 3. 样式（永远最后）
import styles from './icon.module.less';

// 内置具名图标 —— stitch 自有的一套通用 UI 图标（品牌中立，自绘）。
// 图标数据 = 24×24 viewBox 下的 path `d`，描边走 currentColor（跟随 color，可换肤）。
const ICON_PATHS = {
  check: ['M4 12.5l5 5 11-11'],
  close: ['M6 6l12 12', 'M18 6L6 18'],
  'chevron-down': ['M5 9l7 7 7-7'],
  'chevron-right': ['M9 5l7 7-7 7'],
  search: ['M4 11a7 7 0 1 0 14 0a7 7 0 1 0 -14 0z', 'M16.5 16.5L21 21'],
  menu: ['M4 7h16', 'M4 12h16', 'M4 17h16'],
  info: ['M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0z', 'M12 11v5', 'M12 7.5h0.01'],
  success: ['M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0z', 'M8 12l3 3 5-6'],
  warning: ['M12 3.5L21.5 20H2.5z', 'M12 10v4', 'M12 17.5h0.01'],
  error: ['M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0z', 'M9 9l6 6', 'M15 9l-6 6'],
  // 实心圆点（radio 选中标记）：区别于 check 的描边勾——这是唯一「填充」而非「描边」的图标。
  dot: ['M12 6a6 6 0 1 0 0 12a6 6 0 1 0 0-12z'],
  // 眼睛（密码可见）：轮廓杏仁 + 瞳孔，描边。
  eye: [
    'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z',
    'M15 12a3 3 0 1 1-6 0a3 3 0 1 1 6 0z',
  ],
  // 眼睛划掉（密码隐藏）：断裂的眼睛轮廓 + 瞳孔弧 + 一道斜杠。
  'eye-off': [
    'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94',
    'M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19',
    'M14.12 14.12a3 3 0 1 1-4.24-4.24',
    'M1 1l22 22',
  ],
  // ---- 富文本格式图标（工具栏用；描边字形，品牌中立自绘）----
  // 加粗：两段堆叠的 D 形拼成一个「B」。
  bold: ['M7 5h6a3.5 3.5 0 0 1 0 7H7z', 'M7 12h7a3.5 3.5 0 0 1 0 7H7z'],
  // 斜体：上横 + 下横 + 中间斜杆。
  italic: ['M10 5h8', 'M6 19h8', 'M15 5l-6 14'],
  // 下划线：U 形 + 底部横线。
  underline: ['M7 5v6a5 5 0 0 0 10 0V5', 'M6 20h12'],
  // 左对齐：整行 + 短行靠左。
  'align-left': ['M4 6h16', 'M4 12h10', 'M4 18h13'],
  // 居中对齐：整行 + 短行居中。
  'align-center': ['M4 6h16', 'M7 12h10', 'M6 18h12'],
  // 右对齐：整行 + 短行靠右。
  'align-right': ['M4 6h16', 'M10 12h10', 'M7 18h13'],
} as const satisfies Record<string, readonly string[]>;

export type IconName = keyof typeof ICON_PATHS;

// 「填充」型图标：整块 fill=currentColor、无描边（其余图标皆描边、fill=none）。
const FILLED_ICONS = new Set<IconName>(['dot']);

/**
 * 图标基元：内置具名图标 `name`（或自定义 `src`）+ `size` + `label`（可访问名）+
 * `strokeWidth`。`extends HTMLAttributes<span>`，`...rest` 透传到根 `<span>`。
 *
 * 跨-prop 注意事项：
 * - **纯呈现基元**——不是交互控件（要当按钮用请自挂 handler/role）。
 * - **`name` 与 `src` 二选一**：同时给出时 `name`（内置字形）优先。
 * - **内置字形**是内联 `<svg>`、描边走 `currentColor`，随 `color` 换色——设
 *   `style={{ color: 'var(--stitch-accent)' }}`（或任一角色变量）换肤；默认
 *   `var(--stitch-text-secondary)`。
 * - **Accessibility**：有意义图标传 `label`（`role="img"` + `aria-label`）；纯装饰图标省略
 *   （`aria-hidden`）。
 * - **Do NOT** 在消费代码里传 emoji / Unicode 符号 / 手搓 `<svg>`——一律经 `<Icon>`。
 */
export interface IconProps extends Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  'children'
> {
  /** 内置具名图标。与 src 二选一（同时给以 name 优先） */
  name?: IconName;
  /** 自定义图标资源 URL（大图 / 光栅）。与 name 二选一 */
  src?: string;
  /**
   * 尺寸：数字按 px，字符串原样（如 '1em' / '100%'）。
   * @default 24
   */
  size?: number | string;
  /**
   * 可访问名。给出 → `role="img"` + `aria-label`（有意义图标，被屏幕阅读器读出）；
   * 缺省 → `aria-hidden`（纯装饰，不进可及性树）。
   */
  label?: string;
  /**
   * 一次性覆盖描边粗细（仅 name 内联图标）。默认走角色变量
   * `--stitch-icon-stroke-width`（每站 adapter 定，non-scaling 恒定像素）。
   */
  strokeWidth?: number | string;
}

export const Icon: React.FC<IconProps> = ({
  name,
  src,
  size = 24,
  label,
  strokeWidth,
  className,
  style,
  ...rest
}) => {
  const cls = clsx(styles.icon, className);

  // a11y：有 label = 有意义图标；无 label = 纯装饰。
  const a11y: React.HTMLAttributes<HTMLSpanElement> =
    label != null
      ? { role: 'img', 'aria-label': label }
      : { 'aria-hidden': true };

  const paths = name ? ICON_PATHS[name] : undefined;
  const isFilled = name != null && FILLED_ICONS.has(name);

  return (
    <span
      className={cls}
      data-icon={name}
      style={{
        width: size,
        height: size,
        ...(paths ? null : src ? { backgroundImage: `url(${src})` } : null),
        ...style,
      }}
      {...a11y}
      {...rest}
    >
      {paths ? (
        <svg
          className={styles['icon-svg']}
          viewBox="0 0 24 24"
          fill={isFilled ? 'currentColor' : 'none'}
          stroke={isFilled ? 'none' : 'currentColor'}
          strokeWidth={2} // fallback：无样式表时兜底；有样式表时被 --stitch-icon-stroke-width 覆盖
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
          style={strokeWidth != null ? { strokeWidth } : undefined}
        >
          {paths.map((d) => (
            <path key={d} d={d} />
          ))}
        </svg>
      ) : null}
    </span>
  );
};

Icon.displayName = 'Icon';

export const ICON_LIST = [
  { name: 'check', label: 'Check' },
  { name: 'close', label: 'Close' },
  { name: 'chevron-down', label: 'Chevron down' },
  { name: 'chevron-right', label: 'Chevron right' },
  { name: 'search', label: 'Search' },
  { name: 'menu', label: 'Menu' },
  { name: 'info', label: 'Info' },
  { name: 'success', label: 'Success' },
  { name: 'warning', label: 'Warning' },
  { name: 'error', label: 'Error' },
  { name: 'dot', label: 'Dot' },
  { name: 'eye', label: 'Eye' },
  { name: 'eye-off', label: 'Eye off' },
] as const satisfies ReadonlyArray<{ name: IconName; label: string }>;
