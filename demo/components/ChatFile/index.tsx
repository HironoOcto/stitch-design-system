import type { CSSProperties } from 'react';
import { ChatMessage, ChatFile } from '@octohirono/stitch-design-system';

export const meta = {
  title: 'ChatFile',
  description:
    '文件附件卡（复用 <Card> 承载 + <Icon> 类型/下载图标）：作为 <ChatMessage> 的 content 塞入。文件名 / 大小（字节自动格式化）/ 副文本；点击与下载均回调交 app。props 取 Ant Attachments 附件项惯例（name / size / description）。',
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

export default function ChatFileDemo() {
  return (
    <div style={thread}>
      <ChatMessage
        variant="received"
        time="10:02"
        content={
          <ChatFile
            name="需求评审纪要.pdf"
            size={2_411_724}
            description="PDF"
            onClick={() => {}}
            onDownload={() => {}}
          />
        }
      />
      <ChatMessage
        variant="sent"
        time="10:03"
        status="read"
        content={
          <ChatFile
            name="设计稿-v3-final-换肤对齐-really-final.sketch"
            size={51_200}
            description="Sketch"
            onClick={() => {}}
            onDownload={() => {}}
          />
        }
      />
      <ChatMessage
        variant="received"
        time="10:05"
        content={<ChatFile name="README.md" size={840} onDownload={() => {}} />}
      />
    </div>
  );
}
