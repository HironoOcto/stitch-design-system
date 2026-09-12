import { useState, useCallback, useRef } from 'react';
import type { CSSProperties } from 'react';
import { ChatList, Avatar, Button } from '@octohirono/stitch-design-system';
import type { ChatListItem } from '@octohirono/stitch-design-system';

export const meta = {
  title: 'ChatList',
  description:
    '消息流容器（照搬 Ant Design X Bubble.List）：数据驱动 items（每项 = ChatMessage props + id）内部渲染 ChatMessage + roles 角色默认（按 variant 灌共享头像等）+ 连发分组自动编排（相邻同 variant 头像显一次、间距收紧、内容不合并）+ 日期分隔走 system 项（标签由 app 传）+ autoScroll 新消息贴底 / 上滚暂停 / 回底恢复 + onReachTop 向上加载历史（组件不 fetch，传输交 app）+ loadingMore 顶部转圈复用 <Loading>。只读角色变量随换肤变化。',
};

const panel: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--stitch-spacing-md)',
  maxWidth: 560,
};

const frame: CSSProperties = {
  height: 420,
  background: 'var(--stitch-bg-canvas)',
  borderRadius: 'var(--stitch-radius-card)',
  border: 'var(--stitch-border-width) solid var(--stitch-border)',
  overflow: 'hidden',
  display: 'flex',
};

const bar: CSSProperties = {
  display: 'flex',
  gap: 'var(--stitch-spacing-sm)',
  flexWrap: 'wrap',
};

const rowLabel: CSSProperties = {
  fontSize: 'var(--stitch-font-size-sm)',
  color: 'var(--stitch-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  margin: '0 0 var(--stitch-spacing-sm)',
};

// 静态一串消息：含日期分隔（system）+ 连发分组（相邻同 variant）+ 已读回执。
const INITIAL: ChatListItem[] = [
  { id: 'd0', variant: 'system', content: '今天' },
  {
    id: 1,
    variant: 'received',
    content: '在吗？帮我看下设计稿',
    time: '09:41',
  },
  { id: 2, variant: 'received', content: '换肤那块', time: '09:41' },
  {
    id: 3,
    variant: 'sent',
    content: '在的，这就看',
    time: '09:42',
    status: 'read',
  },
  {
    id: 4,
    variant: 'sent',
    content: '稿子没问题，组件只读角色变量、跟着站点换',
    time: '09:42',
    status: 'delivered',
  },
  {
    id: 5,
    variant: 'sent',
    content: '这条刚发出：单勾 = 已发送、还没送达',
    time: '09:42',
    status: 'sent',
  },
];

// 已读回执三态：单勾 = 已发送 / 双勾 = 已送达 / 双勾高亮 = 已读。
const RECEIPTS: ChatListItem[] = [
  {
    id: 'r1',
    variant: 'sent',
    content: '单勾：已发送到服务器、还没送达对方',
    time: '10:00',
    status: 'sent',
  },
  {
    id: 'r2',
    variant: 'sent',
    content: '双勾：已送达对方设备、还没读',
    time: '10:01',
    status: 'delivered',
  },
  {
    id: 'r3',
    variant: 'sent',
    content: '双勾高亮：对方已读',
    time: '10:02',
    status: 'read',
  },
];

const REPLIES = [
  '好的，那我继续',
  '连发第二条，紧接上一条',
  '再补一条，间距收紧、内容不合并',
];

export default function ChatListDemo() {
  const [items, setItems] = useState<ChatListItem[]>(INITIAL);
  const [loadingMore, setLoadingMore] = useState(false);
  const nextId = useRef(100);
  const historyId = useRef(0);

  // 追加一条新消息（received 连发，验证「贴底 / 上滚暂停」）
  const append = useCallback(() => {
    setItems((prev) => {
      const id = nextId.current++;
      const content = REPLIES[id % REPLIES.length];
      return [...prev, { id, variant: 'received', content, time: '09:43' }];
    });
  }, []);

  // 组件不 fetch：onReachTop 只发信号，取历史 / prepend 全由 app（这里 setTimeout 模拟）
  const handleReachTop = useCallback(() => {
    if (loadingMore) return;
    setLoadingMore(true);
    setTimeout(() => {
      setItems((prev) => {
        const older: ChatListItem[] = [
          {
            id: `h${historyId.current++}`,
            variant: 'received',
            content: '（更早的历史消息）',
            time: '昨天',
          },
        ];
        return [...older, ...prev];
      });
      setLoadingMore(false);
    }, 800);
  }, [loadingMore]);

  return (
    <div style={panel}>
      <p style={rowLabel}>
        私聊消息流（连发分组 · 日期分隔 system · 贴底 / 上滚暂停 / 顶部加载）
      </p>

      <div style={bar}>
        <Button type="primary" onClick={append}>
          收到新消息（append）
        </Button>
      </div>

      <div style={frame}>
        <ChatList
          items={items}
          loadingMore={loadingMore}
          onReachTop={handleReachTop}
          style={{ flex: 1 }}
        />
      </div>

      <p style={rowLabel}>
        群聊（roles 按 variant 灌默认头像 · 本方不显头像 · 连发头像只显一次）
      </p>
      <div style={{ ...frame, height: 300 }}>
        <ChatList
          style={{ flex: 1 }}
          roles={{
            received: { avatar: <Avatar size="large" fallback="林" /> },
          }}
          items={[
            {
              id: 1,
              variant: 'received',
              content: '设计稿我看过了，换肤没问题',
              time: '10:01',
            },
            { id: 2, variant: 'received', content: '我也 +1', time: '10:02' },
            {
              id: 3,
              variant: 'received',
              content: '就等 chat 族补齐',
              time: '10:02',
            },
            {
              id: 4,
              variant: 'sent',
              content: '好，我来补列表编排',
              time: '10:03',
              status: 'read',
            },
          ]}
        />
      </div>

      <p style={rowLabel}>
        已读回执三态（本方 sent 侧：单勾 已发送 / 双勾 已送达 / 双勾高亮 已读）
      </p>
      <div style={{ ...frame, height: 220 }}>
        <ChatList style={{ flex: 1 }} items={RECEIPTS} />
      </div>
    </div>
  );
}
