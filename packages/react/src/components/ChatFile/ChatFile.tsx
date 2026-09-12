// 1. React 及其生态
import React from 'react';
import clsx from 'clsx';

// 2. 内部组件（相对路径）
import { Card } from '../Card';
import { Button } from '../Button';
import { Icon } from '../Icon';

// 3. 样式（永远最后）
import styles from './chat-file.module.less';

// 字节数 → 人类可读（二进制单位，与桌面端文件管理器惯例一致）。
const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const;
function formatSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '';
  if (bytes < 1) return '0 B';
  const i = Math.min(
    UNITS.length - 1,
    Math.floor(Math.log(bytes) / Math.log(1024)),
  );
  const value = bytes / 1024 ** i;
  // 整字节不带小数，其余保留一位。
  const text = i === 0 ? String(Math.round(value)) : value.toFixed(1);
  return `${text} ${UNITS[i]}`;
}

/**
 * 文件附件卡：复用 `<Card>` 承载——类型图标（`<Icon name="file">`）+ 文件名 + 大小 /
 * 副文本；作为 `<ChatMessage>` 的 `content` 塞入（sent / received 两侧皆可）。点击 / 下载
 * 均为**回调交 app**（组件不导航、不发起下载）。对外 props 取 Ant Design X `Attachments`
 * 附件项最近惯例（`name` / `size` / `description`）+ Ant v5 回调命名。
 *
 * 跨-prop 注意事项：
 * - **下载键是文件卡固有部件、常驻**（文件默认可下载）：右侧复用 `<Button type="text">`，点击走
 *   `onDownload` 回调、由 app 落地下载。
 * - **两个独立可聚焦控件、互不嵌套**：给 `onClick` 时文件名区升格为整行透明按钮（打开），与下载
 *   键平级，无按钮套按钮。
 * - **`size` 是字节数**，组件内格式化为人类可读（`1.2 MB`）；`description` 为副文本（如类型），
 *   与已格式化的大小同排、`·` 分隔。
 * - **图标走 `<Icon>`**：类型图标 `<Icon name="file">`（装饰性）、下载 `<Icon name="download">`
 *   （其按钮带可访问名 `下载 {name}`），非 emoji / 裸 `<svg>`。
 */
export interface ChatFileProps {
  /** 文件名（必填） */
  name: string;
  /** 文件大小（字节数）；组件内格式化为人类可读 */
  size?: number;
  /** 副文本（如文件类型说明），与大小同排 `·` 分隔 */
  description?: React.ReactNode;
  /** 点击文件卡的回调（打开 / 预览交 app）；给出时文件名区可聚焦、可键盘触发 */
  onClick?: () => void;
  /** 点击下载键的回调（下载交 app）；下载键常驻，点击走此回调 */
  onDownload?: () => void;
  /** 自定义类名（挂到根 Card） */
  className?: string;
  /** 行内样式（挂到根 Card） */
  style?: React.CSSProperties;
}

export const ChatFile: React.FC<ChatFileProps> = ({
  name,
  size,
  description,
  onClick,
  onDownload,
  className,
  style,
}) => {
  const sizeText = typeof size === 'number' ? formatSize(size) : '';
  const meta = (
    <span className={styles.meta}>
      {sizeText && <span>{sizeText}</span>}
      {sizeText && description != null && <span aria-hidden="true"> · </span>}
      {description != null && <span>{description}</span>}
    </span>
  );

  const inner = (
    <>
      <Icon name="file" className={styles.type} size="1.5em" />
      <span className={styles.text}>
        <span className={styles.name}>{name}</span>
        {(sizeText || description != null) && meta}
      </span>
    </>
  );

  return (
    <Card
      variant="outlined"
      className={clsx(styles.file, className)}
      style={style}
    >
      {onClick ? (
        <button
          type="button"
          className={styles.trigger}
          onClick={onClick}
          aria-label={`打开文件 ${name}`}
        >
          {inner}
        </button>
      ) : (
        <div className={styles.trigger}>{inner}</div>
      )}
      <Button
        type="text"
        className={styles.download}
        onClick={onDownload}
        aria-label={`下载 ${name}`}
      >
        <Icon name="download" size="1.25em" />
      </Button>
    </Card>
  );
};

ChatFile.displayName = 'ChatFile';
