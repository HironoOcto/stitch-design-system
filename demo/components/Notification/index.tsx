import { type CSSProperties } from 'react';
import {
  Notification,
  Button,
  type NotificationType,
  type NotificationPosition,
} from '@octohirono/stitch-design-system';

export const meta = {
  title: 'Notification',
  description:
    '命令式（antd 风格静态方法）通知：Notification.success / info / warning / error / open / destroy，非受控、自挂 Portal 到 body。四类型中性卡底，靠状态色边框 --stitch-<状态> + 实心状态色图标 chip（白字）区分；6 个 position、默认 top / duration 4.5s / 传 0 不自动关。默认图标走内置具名 <Icon>（success/info/warning/error），关闭 × 走 <Icon name="close">。源 animal 招牌值已按手册去品牌：奶油底 rgb(247,243,223)→--stitch-bg-elevated、棕字→--stitch-text-primary、18px 药丸卡角→--stitch-radius-card、方向暖影→--stitch-shadow-base/-lg、聚焦黄→--stitch-focus-ring。整卡软底（-bg）弃用——它在 seline 把描述压到 <AA 4.5，故文字坐中性面、类型靠边框+chip。换肤 seline↔steep 时圆角/阴影/标题字体随之变。详见根 迁移笔记.md。',
};

const section: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--stitch-spacing-xl)',
  maxWidth: 760,
};
const rowLabel: CSSProperties = {
  fontSize: 'var(--stitch-font-size-sm)',
  color: 'var(--stitch-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  margin: '0 0 var(--stitch-spacing-lg)',
};
const grid: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--stitch-spacing-md)',
  alignItems: 'center',
};

const TYPES: { type: NotificationType; label: string }[] = [
  { type: 'success', label: 'Success' },
  { type: 'info', label: 'Info' },
  { type: 'warning', label: 'Warning' },
  { type: 'error', label: 'Error' },
];

function TypesDemo() {
  return (
    <div style={grid}>
      {TYPES.map(({ type, label }) => (
        <Button
          key={type}
          onClick={() =>
            Notification[type]({
              message: `${label} 通知`,
              description: `这是一条 ${type} 类型的通知，展示 message + description 两行结构。`,
            })
          }
        >
          {label}
        </Button>
      ))}
    </div>
  );
}

const POSITIONS: NotificationPosition[] = [
  'top',
  'topLeft',
  'topRight',
  'bottom',
  'bottomLeft',
  'bottomRight',
];

function PositionDemo() {
  return (
    <div style={grid}>
      {POSITIONS.map((position) => (
        <Button
          key={position}
          onClick={() =>
            Notification.info({
              message: `位置：${position}`,
              position,
            })
          }
        >
          {position}
        </Button>
      ))}
    </div>
  );
}

function BehaviorDemo() {
  return (
    <div style={grid}>
      <Button
        type="primary"
        onClick={() =>
          Notification.info({
            message: '不自动关闭',
            description: 'duration: 0 时只能手动点关闭按钮。',
            duration: 0,
          })
        }
      >
        duration 0（常驻）
      </Button>
      <Button
        onClick={() =>
          Notification.success({
            message: '带操作按钮',
            description: '点右侧「撤销」，或右上角关闭。',
            duration: 0,
            btn: (
              <Button size="small" onClick={() => Notification.destroy()}>
                撤销
              </Button>
            ),
          })
        }
      >
        带操作按钮
      </Button>
      <Button
        onClick={() =>
          Notification.warning({
            message: '点我整条可点击',
            description: 'onClick 后本体获得 role=button、可键盘 Enter 触发。',
            onClick: () => Notification.success('触发了 onClick'),
          })
        }
      >
        可点击通知
      </Button>
      <Button danger onClick={() => Notification.destroy()}>
        destroy 关闭全部
      </Button>
    </div>
  );
}

export default function NotificationDemo() {
  return (
    <div style={section}>
      <div>
        <p style={rowLabel}>四种类型</p>
        <TypesDemo />
      </div>
      <div>
        <p style={rowLabel}>六个位置</p>
        <PositionDemo />
      </div>
      <div>
        <p style={rowLabel}>行为（常驻 / 操作按钮 / 可点击 / destroy）</p>
        <BehaviorDemo />
      </div>
    </div>
  );
}
