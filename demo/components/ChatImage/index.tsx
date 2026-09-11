import type { CSSProperties } from 'react';
import { ChatMessage, ChatImage } from '@octohirono/stitch-design-system';

export const meta = {
  title: 'ChatImage',
  description:
    '图片消息（气泡内缩略图 + 大图查看器）：缩略图与大图都复用通用 <Image>（大图即 Image 自带相框），本组件只加遮罩 + 把下载 / 关闭工具键叠在大图框上。width 控缩略图宽、点击看原图；时间落缩略图下方（同文件卡）。作为 <ChatMessage> 的 content 塞入。',
};

// 真实图片（Unsplash）：缩略图由 width 收小、点击大图看原图尺寸。
const PHOTO_1 =
  'https://images.unsplash.com/photo-1535025183041-0991a977e25b?w=1200&q=80&auto=format';
const PHOTO_2 =
  'https://images.unsplash.com/photo-1535025183041-0991a977e25b?w=1200&h=900&fit=crop&q=80&auto=format';

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

export default function ChatImageDemo() {
  return (
    <div style={thread}>
      <ChatMessage
        variant="received"
        time="10:20"
        content={<ChatImage src={PHOTO_1} alt="风景照" width={200} />}
      />
      <ChatMessage
        variant="sent"
        time="10:21"
        status="read"
        content={<ChatImage src={PHOTO_2} alt="风景照（裁剪）" width={200} />}
      />
    </div>
  );
}
