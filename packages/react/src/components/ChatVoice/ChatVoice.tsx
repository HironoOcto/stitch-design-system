// 1. React 及其生态
import React from 'react';
import clsx from 'clsx';

// 2. 内部组件（相对路径）
import { Button } from '../Button';
import { Icon } from '../Icon';

// 3. 样式（永远最后）
import styles from './chat-voice.module.less';

/**
 * 语音消息（手绘静态波形）：播放按钮（`<Button>` + `<Icon play/pause>`）+ 一排高低不等的
 * 波形小条 + 时长；作为 `<ChatMessage>` 的 `content` 塞入（sent / received 两侧皆可）。
 * 组件**不解码音频**——波形振幅数组 `waveform` 由 app 传入。无 Ant 对应件 → 播放态取
 * Ant v5 `open` / `onOpenChange` 惯例（`playing` / `onPlayingChange`）、播放进度取 Ant
 * `percent` 惯例，均不自创。
 *
 * 跨-prop 注意事项：
 * - **波形柱是角色变量小元素、非内联 `<svg>`**：每根柱一个 `<div>`，高度按 `waveform` 振幅
 *   （`0…1`）由内联 `height` 百分比驱动（几何数据、非颜色）；颜色只走角色变量类——已播段
 *   `--stitch-accent`、未播段 `--stitch-border`，切站换肤跟随。
 * - **`percent` 划已播 / 未播**：`0…100`，按柱序比例染色（前 `percent%` 的柱 = 已播 accent）。
 * - **`playing` 切图标、`onPlayingChange` 交 app**：受控播放态（app 翻转 `playing`）；播放按钮
 *   带可访问名（播放语音 / 暂停语音），波形本体装饰性 `aria-hidden`。
 */
export interface ChatVoiceProps {
  /** 波形振幅数组（`0…1`，由 app 传入；组件不解码音频） */
  waveform: number[];
  /** 时长文本（如 `0:12`） */
  duration?: React.ReactNode;
  /**
   * 已播进度（`0…100`）：前 `percent%` 的波形柱染为已播色（accent）
   * @default 0
   */
  percent?: number;
  /**
   * 是否播放中：切换播放 / 暂停图标
   * @default false
   */
  playing?: boolean;
  /** 点击播放按钮的回调（播放 / 暂停交 app） */
  onPlayingChange?: (playing: boolean) => void;
  /** 自定义类名（挂到根容器） */
  className?: string;
  /** 行内样式（挂到根容器） */
  style?: React.CSSProperties;
}

export const ChatVoice: React.FC<ChatVoiceProps> = ({
  waveform,
  duration,
  percent = 0,
  playing = false,
  onPlayingChange,
  className,
  style,
}) => {
  const total = waveform.length;
  // 已播柱数：前 percent% 的柱 = 已播色。
  const playedCount = Math.round(
    (Math.min(100, Math.max(0, percent)) / 100) * total,
  );

  return (
    <div className={clsx(styles.voice, className)} style={style}>
      <Button
        type="primary"
        className={styles.play}
        onClick={() => onPlayingChange?.(!playing)}
        aria-label={playing ? '暂停语音' : '播放语音'}
        icon={<Icon name={playing ? 'pause' : 'play'} size="1.125em" />}
      />
      <div className={styles.wave} aria-hidden="true">
        {waveform.map((amp, i) => {
          const height = Math.max(0.15, Math.min(1, amp)) * 100;
          return (
            <div
              key={i}
              className={clsx(
                styles.bar,
                i < playedCount ? styles['bar-played'] : styles['bar-idle'],
              )}
              style={{ height: `${height}%` }}
            />
          );
        })}
      </div>
      {duration != null && <span className={styles.duration}>{duration}</span>}
    </div>
  );
};

ChatVoice.displayName = 'ChatVoice';
