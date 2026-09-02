import { useState, type CSSProperties } from 'react';
import { Toolbar, Icon } from '@octohirono/stitch-design-system';

export const meta = {
  title: 'Toolbar',
  description:
    '工具栏容器（编排件）：一条横向容器，异构混排按钮 / 链接 / 分隔线 / 分段切换组，给 role="toolbar" + 方向键在控件间 roving。唯一走 children + 静态挂载子组件的组件（照 Form.Item 先例）：<Toolbar> + Toolbar.Button / Toolbar.Link / Toolbar.Separator / Toolbar.ToggleGroup，不用 items 数组（Radix Toolbar 本身异构混排、无统一 item 模型）。控件走安静命令皮（透明底 + 中性字 + hover 软底 + 小圆角），坐在一张浅色浮起面板上；分段选中态走软 accent 底（同成熟工具栏参照），随主题换肤。vs 单纯并排 <Button>——Toolbar 多了 role + roving 键盘编排。',
};

const section: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--stitch-spacing-xl)',
  maxWidth: 720,
};
const rowLabel: CSSProperties = {
  fontSize: 'var(--stitch-font-size-sm)',
  color: 'var(--stitch-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  margin: '0 0 var(--stitch-spacing-md)',
};
const readout: CSSProperties = {
  fontSize: 'var(--stitch-font-size-sm)',
  color: 'var(--stitch-text-secondary)',
  margin: 'var(--stitch-spacing-md) 0 0',
  fontFamily: 'var(--stitch-font-mono, monospace)',
};
const status: CSSProperties = {
  color: 'var(--stitch-text-muted)',
  fontSize: 'var(--stitch-font-size-sm)',
  padding: '0 var(--stitch-spacing-md)',
  whiteSpace: 'nowrap',
};

const FORMAT = [
  { value: 'bold', icon: 'bold' as const },
  { value: 'italic', icon: 'italic' as const },
  { value: 'underline', icon: 'underline' as const },
];
const ALIGN = [
  { value: 'left', icon: 'align-left' as const },
  { value: 'center', icon: 'align-center' as const },
  { value: 'right', icon: 'align-right' as const },
];

export default function ToolbarDemo() {
  const [align, setAlign] = useState('center');
  const [format, setFormat] = useState<string[]>(['bold']);

  return (
    <div style={section}>
      <div>
        <p style={rowLabel}>
          富文本编辑器工具栏（图标格式钮 + 对齐 + 分隔线 + 状态 +
          动作，对齐参考图）
        </p>
        <Toolbar aria-label="富文本编辑">
          <Toolbar.ToggleGroup
            type="multiple"
            aria-label="文本格式"
            value={format}
            onChange={setFormat}
            items={FORMAT}
          />
          <Toolbar.Separator />
          <Toolbar.ToggleGroup
            type="single"
            aria-label="文本对齐"
            value={align}
            onChange={setAlign}
            items={ALIGN}
          />
          <Toolbar.Separator />
          <span style={status}>2 小时前编辑</span>
          <Toolbar.Button
            icon={<Icon name="search" size="1em" />}
            aria-label="查找"
          />
          <Toolbar.Button
            icon={<Icon name="menu" size="1em" />}
            aria-label="更多"
          />
        </Toolbar>
        <p style={readout}>
          对齐 = {JSON.stringify(align)} · 格式 = {JSON.stringify(format)}
        </p>
      </div>

      <div>
        <p style={rowLabel}>文字 + 图标混排动作按钮（安静命令控件 / danger）</p>
        <Toolbar aria-label="文档动作">
          <Toolbar.Button icon={<Icon name="check" size="1em" />}>
            保存
          </Toolbar.Button>
          <Toolbar.Button>另存为</Toolbar.Button>
          <Toolbar.Separator />
          <Toolbar.Button danger icon={<Icon name="close" size="1em" />}>
            删除
          </Toolbar.Button>
          <Toolbar.Separator />
          <Toolbar.Link
            href="https://www.radix-ui.com/primitives/docs/components/toolbar"
            target="_blank"
            rel="noreferrer"
          >
            帮助
          </Toolbar.Link>
        </Toolbar>
      </div>

      <div>
        <p style={rowLabel}>禁用（整组分段 / 单个按钮）</p>
        <Toolbar aria-label="禁用示例">
          <Toolbar.Button
            icon={<Icon name="search" size="1em" />}
            aria-label="查找"
            disabled
          />
          <Toolbar.Separator />
          <Toolbar.ToggleGroup
            type="single"
            aria-label="对齐（整组禁用）"
            defaultValue="center"
            disabled
            items={ALIGN}
          />
        </Toolbar>
      </div>

      <div>
        <p style={rowLabel}>
          纵向工具栏（orientation=&quot;vertical&quot;，方向键上下 roving）
        </p>
        <Toolbar aria-label="纵向工具栏" orientation="vertical">
          <Toolbar.Button
            icon={<Icon name="menu" size="1em" />}
            aria-label="菜单"
          />
          <Toolbar.Button
            icon={<Icon name="search" size="1em" />}
            aria-label="搜索"
          />
          <Toolbar.Separator />
          <Toolbar.Button
            icon={<Icon name="info" size="1em" />}
            aria-label="信息"
          />
        </Toolbar>
      </div>
    </div>
  );
}
