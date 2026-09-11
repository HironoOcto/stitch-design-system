import { useState, type CSSProperties } from 'react';
import { ChatInput, Icon } from '@octohirono/stitch-design-system';

export const meta = {
  title: 'ChatInput',
  description:
    '聊天输入器（照搬 antd Input value/onChange/disabled/placeholder/autoSize + Ant Design X Sender onSubmit/loading/submitType/prefix/actions）：多行 textarea 自增高 + 受控/非受控 value + Enter 发送 / Shift+Enter 换行（submitType 可反）+ onSubmit 发送回调 + 发送键走 <Icon name="send"> + prefix/actions 附件按钮插槽（附件逻辑交 app）。IM 无停止态。只读角色变量随换肤变化。',
};

const section: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--stitch-spacing-xl)',
  maxWidth: 560,
};

const rowLabel: CSSProperties = {
  fontSize: 'var(--stitch-font-size-sm)',
  color: 'var(--stitch-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  margin: '0 0 var(--stitch-spacing-sm)',
};

const log: CSSProperties = {
  fontSize: 'var(--stitch-font-size-sm)',
  color: 'var(--stitch-text-secondary)',
  margin: 'var(--stitch-spacing-sm) 0 0',
};

function ControlledExample() {
  const [value, setValue] = useState('');
  const [sent, setSent] = useState<string[]>([]);
  return (
    <div>
      <ChatInput
        aria-label="消息"
        placeholder="输入消息，Enter 发送、Shift+Enter 换行"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onSubmit={(message) => {
          setSent((prev) => [...prev, message]);
          setValue(''); // 受控：清空由父在 onSubmit 里做
        }}
        prefix={<Icon name="menu" size={20} label="附件" />}
      />
      {sent.length > 0 && <p style={log}>已发送：{sent.join(' · ')}</p>}
    </div>
  );
}

export default function ChatInputDemo() {
  return (
    <div style={section}>
      <div>
        <p style={rowLabel}>
          受控 · 多行自增高 · Enter 发送 · 附件插槽（prefix）
        </p>
        <ControlledExample />
      </div>

      <div>
        <p style={rowLabel}>非受控（defaultValue，发送后自动清空）</p>
        <ChatInput
          aria-label="消息"
          defaultValue="拖动多写几行看自增高……"
          placeholder="输入消息"
          onSubmit={(message) => console.log('send:', message)}
        />
      </div>

      <div>
        <p style={rowLabel}>
          submitType=&quot;shiftEnter&quot;（Shift+Enter 发送、Enter 换行）
        </p>
        <ChatInput
          aria-label="消息"
          submitType="shiftEnter"
          placeholder="Enter 换行，Shift+Enter 发送"
        />
      </div>

      <div>
        <p style={rowLabel}>
          autoSize 卡上下界（minRows 2 / maxRows 4，超出内部滚动）
        </p>
        <ChatInput
          aria-label="消息"
          autoSize={{ minRows: 2, maxRows: 4 }}
          placeholder="至少两行高，最多四行后内部滚动"
        />
      </div>

      <div>
        <p style={rowLabel}>
          loading（置发送键忙 / 禁发 · IM 无停止态）与 disabled
        </p>
        <ChatInput aria-label="消息" defaultValue="发送中……" loading />
        <div style={{ height: 'var(--stitch-spacing-md)' }} />
        <ChatInput aria-label="消息" defaultValue="不可编辑" disabled />
      </div>
    </div>
  );
}
