import { useEffect, useState, type CSSProperties } from 'react';
import {
  ChatMessage,
  ChatVoice,
  type ChatMessageVariant,
  type ChatMessageStatus,
} from '@octohirono/stitch-design-system';

export const meta = {
  title: 'ChatVoice',
  description:
    '语音消息（手绘静态波形）：作为 <ChatMessage> 的 content 塞入。播放按钮（<Button> + <Icon play/pause>）+ 一排角色变量小条（已播 --stitch-accent / 未播 --stitch-border）+ 时长。组件是「受控视图」——不解码音频，波形 waveform + 进度 percent + 播放态 playing 全由 app 传（真实场景里 percent 跟随 <audio> 播放位置）。本 demo 用计时器模拟 app 驱动播放，可见波形随播放推进染色、play↔pause 切换。',
};

const thread: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--stitch-spacing-md)',
  maxWidth: 520,
  padding: 'var(--stitch-spacing-lg)',
  background: 'var(--stitch-bg-canvas)',
  borderRadius: 'var(--stitch-radius-card)',
  border: 'var(--stitch-border-width) solid var(--stitch-border)',
};

// app 侧提供的振幅数组（0…1），组件只负责画，不解码音频。
const WAVE = [
  0.3, 0.6, 0.9, 0.5, 0.7, 1, 0.8, 0.4, 0.55, 0.85, 0.6, 0.35, 0.5, 0.9, 0.7,
  0.45, 0.65, 0.3, 0.8, 0.5,
];

// 模拟 app：真实 App 里 percent 跟随 <audio>.currentTime；此处用计时器推进，演示播放效果。
function VoiceBubble({
  variant,
  time,
  status,
  duration,
  seconds,
}: {
  variant: ChatMessageVariant;
  time: string;
  status?: ChatMessageStatus;
  duration: string;
  seconds: number;
}) {
  const [playing, setPlaying] = useState(false);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setPercent((p) => {
        const next = Math.min(100, p + (100 / seconds) * 0.1); // 每 100ms 推进
        if (next >= 100) setPlaying(false); // 播完停在末尾
        return next;
      });
    }, 100);
    return () => window.clearInterval(id);
  }, [playing, seconds]);

  const handlePlayingChange = (next: boolean) => {
    if (next && percent >= 100) setPercent(0); // 从头重播
    setPlaying(next);
  };

  return (
    <ChatMessage
      variant={variant}
      time={time}
      status={status}
      content={
        <ChatVoice
          waveform={WAVE}
          duration={duration}
          percent={percent}
          playing={playing}
          onPlayingChange={handlePlayingChange}
        />
      }
    />
  );
}

export default function ChatVoiceDemo() {
  return (
    <div style={thread}>
      <VoiceBubble
        variant="received"
        time="09:12"
        duration="0:12"
        seconds={12}
      />
      <VoiceBubble
        variant="sent"
        time="09:13"
        status="read"
        duration="0:08"
        seconds={8}
      />
    </div>
  );
}
