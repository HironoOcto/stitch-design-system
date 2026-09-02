import type { CSSProperties } from 'react';
import { NavigationMenu } from '@octohirono/stitch-design-system';

export const meta = {
  title: 'NavigationMenu',
  description:
    '站点导航菜单：顶栏一排导航项，部分项 hover/focus 展开一块面板。对外 items 数组，每项按字段渲染成纯链接（href 无 content → NavigationMenu.Link，可跳转、可标 active=当前项）或带展开面板（content → Trigger + Content，面板内容自由 ReactNode）。组合底层 Root/List/Item/Trigger/Content/Link/Viewport，根渲染 <nav> landmark。vs Tabs：Tabs 页内切换面板内容（同页多视图、无跳转）；NavigationMenu 站点导航（链接为主，跳转/展开导航面板）。vs Menubar：Menubar 触发动作命令，NavigationMenu 导航链接。链接项 = 一行安静导航文字（中性字，hover 深字，当前项走 --stitch-accent）；展开面板 = 浮起层（--stitch-bg-elevated + --stitch-radius-card + --stitch-shadow-base），换肤 seline↔steep 时颜色/圆角/字体/阴影随之变化。开合态用底层 data-state，键盘/焦点/ARIA/定位由底层原语保证。',
};

// Demo 平台是 hash 路由（页面在 #/NavigationMenu）。真实站点里导航项的 href 是各自页面地址；
// 这里为不劫持 demo 路由（点了会跳到别的组件页），统一指向当前 demo 路由 = 点击留在本页。
const DEMO_HREF = '#/NavigationMenu';

const section: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--stitch-spacing-xl)',
  maxWidth: 860,
};
const rowLabel: CSSProperties = {
  fontSize: 'var(--stitch-font-size-sm)',
  color: 'var(--stitch-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  margin: '0 0 var(--stitch-spacing-lg)',
};
// 顶栏容器：一块看得见的落点，托住导航条。
const bar: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: 'var(--stitch-spacing-md) var(--stitch-spacing-lg)',
  border: '1px solid var(--stitch-border)',
  borderRadius: 'var(--stitch-radius-card)',
  background: 'var(--stitch-bg-card)',
};

// 面板内容：一列导航链接（自由 ReactNode 心智——可放链接列 / 图文卡片）。
const panel: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 'var(--stitch-spacing-md)',
  minWidth: 420,
};
const panelLink: CSSProperties = {
  display: 'block',
  padding: 'var(--stitch-spacing-sm) var(--stitch-spacing-md)',
  borderRadius: 'var(--stitch-radius-input)',
  color: 'var(--stitch-text-primary)',
  textDecoration: 'none',
  fontSize: 'var(--stitch-font-size-sm)',
};
const panelTitle: CSSProperties = {
  gridColumn: '1 / -1',
  margin: 0,
  color: 'var(--stitch-text-muted)',
  fontSize: 'var(--stitch-font-size-sm)',
};

function ProductPanel() {
  return (
    <div style={panel}>
      <p style={panelTitle}>按团队</p>
      <a href={DEMO_HREF} style={panelLink}>
        分析看板
      </a>
      <a href={DEMO_HREF} style={panelLink}>
        报表中心
      </a>
      <a href={DEMO_HREF} style={panelLink}>
        自动化流程
      </a>
      <a href={DEMO_HREF} style={panelLink}>
        集成市场
      </a>
    </div>
  );
}

function ResourcesPanel() {
  return (
    <div style={{ ...panel, gridTemplateColumns: '1fr' }}>
      <p style={panelTitle}>学习</p>
      <a href={DEMO_HREF} style={panelLink}>
        开发文档
      </a>
      <a href={DEMO_HREF} style={panelLink}>
        上手指南
      </a>
      <a href={DEMO_HREF} style={panelLink}>
        更新日志
      </a>
    </div>
  );
}

export default function NavigationMenuDemo() {
  return (
    <div style={section}>
      <div>
        <p style={rowLabel}>顶栏导航 · 纯链接项 + 带面板项 + 当前项</p>
        <div style={bar}>
          <NavigationMenu
            aria-label="站点主导航"
            items={[
              { label: '首页', href: DEMO_HREF, active: true },
              { label: '产品', content: <ProductPanel /> },
              { label: '资源', content: <ResourcesPanel /> },
              { label: '定价', href: DEMO_HREF },
              { label: '关于', href: DEMO_HREF },
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
          「首页」标为当前项（走 --stitch-accent）；「产品 / 资源」hover 或
          focus 后展开面板；「定价 / 关于」为纯跳转链接。
        </p>
      </div>
    </div>
  );
}
