import { useState, type CSSProperties } from 'react';
import { Menubar } from '@octohirono/stitch-design-system';

export const meta = {
  title: 'Menubar',
  description:
    '菜单栏（桌面应用式命令栏）：横排一组互相协调的顶层菜单（文件 / 编辑 / 视图…），鼠标停在某个菜单约 150ms（openDelay）即自动展开（含首个、无需点击），移到相邻菜单立即切换；点击也即时打开。每个菜单点开是一列动作项，点项触发动作、无选中态。对外两层 items 数组——外层 MenubarMenu（{ label, items }）是栏上一个菜单，内层 MenubarMenuItem 与 DropdownMenu / ContextMenu 项同结构（{ label, onClick?, danger?, disabled?, icon?, children? }）。vs NavigationMenu：那是站点导航（链接为主、跳页面）；vs DropdownMenu：那是单个按钮的菜单，Menubar 是一排协调的菜单。菜单面复用 DropdownMenu 族浮起面皮（--stitch-bg-elevated + --stitch-radius-card + --stitch-shadow-base），顶层 Trigger 是菜单栏按钮样式，换肤 seline↔steep 时圆角 / 边框 / 阴影 / 字体随之变化。键盘 / 焦点 / ARIA / 定位由底层原语保证。',
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
// 菜单栏落在一条应用工具条上，贴近真实命令栏语境。
const appBar: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: 'var(--stitch-spacing-xs) var(--stitch-spacing-sm)',
  border: '1px solid var(--stitch-border)',
  borderRadius: 'var(--stitch-radius-card)',
  background: 'var(--stitch-bg-elevated)',
};

export default function MenubarDemo() {
  const [last, setLast] = useState<string>('—');
  const act = (name: string) => () => setLast(name);
  return (
    <div style={section}>
      <div>
        <p style={rowLabel}>
          应用命令栏 · 一排菜单 + 图标 / 危险项 / 禁用项 / 子菜单
        </p>
        <div style={appBar}>
          <Menubar
            aria-label="演示命令栏"
            items={[
              {
                label: '文件',
                items: [
                  { label: '新建', onClick: act('文件 · 新建') },
                  { label: '打开…', icon: 'eye', onClick: act('文件 · 打开') },
                  {
                    label: '最近打开',
                    icon: 'chevron-right',
                    children: [
                      {
                        label: 'report.pdf',
                        onClick: act('最近 · report.pdf'),
                      },
                      { label: 'notes.md', onClick: act('最近 · notes.md') },
                    ],
                  },
                  { label: '保存', icon: 'check', onClick: act('文件 · 保存') },
                  { label: '关闭窗口（禁用）', disabled: true },
                ],
              },
              {
                label: '编辑',
                items: [
                  { label: '撤销', onClick: act('编辑 · 撤销') },
                  { label: '重做', onClick: act('编辑 · 重做') },
                  {
                    label: '查找',
                    icon: 'search',
                    onClick: act('编辑 · 查找'),
                  },
                  { label: '删除', danger: true, onClick: act('编辑 · 删除') },
                ],
              },
              {
                label: '视图',
                items: [
                  { label: '放大', onClick: act('视图 · 放大') },
                  { label: '缩小', onClick: act('视图 · 缩小') },
                  { label: '实际大小', onClick: act('视图 · 实际大小') },
                ],
              },
            ]}
          />
        </div>
        <p
          style={{
            marginTop: 'var(--stitch-spacing-md)',
            fontSize: 'var(--stitch-font-size-sm)',
            color: 'var(--stitch-text-muted)',
          }}
        >
          最近动作：{last}
        </p>
      </div>
    </div>
  );
}
