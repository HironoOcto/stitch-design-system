import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatVoice } from './ChatVoice';
import styles from './chat-voice.module.less';

const WAVE = [0.2, 0.5, 0.9, 0.4, 0.7, 1, 0.3, 0.6, 0.8, 0.5]; // 10 根

describe('ChatVoice', () => {
  // 1. 基本渲染：时长文本
  it('渲染时长文本', () => {
    render(<ChatVoice waveform={WAVE} duration="0:12" />);
    expect(screen.getByText('0:12')).toBeInTheDocument();
  });

  // 2. waveform → 柱数与数组长度一致
  it('波形柱数量等于 waveform 长度', () => {
    const { container } = render(<ChatVoice waveform={WAVE} />);
    expect(container.querySelectorAll(`.${styles.bar}`)).toHaveLength(
      WAVE.length,
    );
  });

  // 3. percent → 已播段 accent（bar-played）、未播段 border（bar-idle）
  it('percent 按柱序划已播 / 未播', () => {
    const { container } = render(<ChatVoice waveform={WAVE} percent={40} />);
    // 10 根 * 40% = 4 根已播
    expect(container.querySelectorAll(`.${styles['bar-played']}`)).toHaveLength(
      4,
    );
    expect(container.querySelectorAll(`.${styles['bar-idle']}`)).toHaveLength(
      6,
    );
  });

  it('percent=100 全部已播、percent=0 全部未播', () => {
    const { container, rerender } = render(
      <ChatVoice waveform={WAVE} percent={100} />,
    );
    expect(container.querySelectorAll(`.${styles['bar-played']}`)).toHaveLength(
      WAVE.length,
    );
    rerender(<ChatVoice waveform={WAVE} percent={0} />);
    expect(container.querySelectorAll(`.${styles['bar-idle']}`)).toHaveLength(
      WAVE.length,
    );
  });

  // 4. playing → 播放 / 暂停图标切换
  it('playing 切换 play / pause 图标', () => {
    const { container, rerender } = render(
      <ChatVoice waveform={WAVE} playing={false} />,
    );
    expect(container.querySelector('[data-icon="play"]')).toBeTruthy();
    rerender(<ChatVoice waveform={WAVE} playing />);
    expect(container.querySelector('[data-icon="pause"]')).toBeTruthy();
  });

  // 5. onPlayingChange：点击播放按钮以取反值回调
  it('点击播放按钮以取反 playing 回调', async () => {
    const user = userEvent.setup();
    const onPlayingChange = vi.fn();
    render(
      <ChatVoice
        waveform={WAVE}
        playing={false}
        onPlayingChange={onPlayingChange}
      />,
    );
    await user.click(screen.getByRole('button', { name: '播放语音' }));
    expect(onPlayingChange).toHaveBeenCalledWith(true);
  });

  // 6. 键盘：播放按钮为原生 button，Enter 触发
  it('键盘 Enter 触发播放按钮', async () => {
    const user = userEvent.setup();
    const onPlayingChange = vi.fn();
    render(
      <ChatVoice waveform={WAVE} playing onPlayingChange={onPlayingChange} />,
    );
    screen.getByRole('button', { name: '暂停语音' }).focus();
    await user.keyboard('{Enter}');
    expect(onPlayingChange).toHaveBeenCalledWith(false);
  });

  // 7. a11y 契约：播放按钮有可访问名（随播放态变化）
  it('播放按钮有可访问名', () => {
    const { rerender } = render(<ChatVoice waveform={WAVE} playing={false} />);
    expect(screen.getByRole('button')).toHaveAccessibleName('播放语音');
    rerender(<ChatVoice waveform={WAVE} playing />);
    expect(screen.getByRole('button')).toHaveAccessibleName('暂停语音');
  });
});
