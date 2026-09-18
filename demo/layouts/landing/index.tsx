// demo/layouts/landing/index.tsx —— 落地页**分发管道**（第一个 LAYOUT 条目）
//
// 各站的设计风格（导航形态 / 卡片 / 阴影预算 / 强调手法…）是各自**真实网站**的长相、
// 彼此不同——一套 theme-agnostic 结构无法同时忠实三家。故「Landing」改为**按当前
// active-site 分发到 per-site 落地页**：切主题切换器，「Landing」就呈现该站自己那一版。
//
// 反应式分发：站点由 documentElement 的 data-site 承载（见 demo/theme.ts:setSite）。
// 这里用 useSyncExternalStore 订阅该属性的变化——切站即重取、即切该站 landing，
// 无需 props 下传。「连接件读 data-site」是 demo showcase 的**受控例外**（仅此分发用途）。
//
// 每个真实主题一个**自包含子目录**（steep/：index.tsx 版式 + landing.module.less 滚动动画
// + bg.jpg 位图；seline/、phantom/：纯 index.tsx——静态拼贴无需动画模块），
// 避免主题一多就在本目录平铺成一堆。
// registry 的 glob 只扫**单层** `/demo/layouts/*/index.tsx`，`landing/<主题>/index.tsx` 是两层、
// 不匹配，故子目录不会各自上架成导航条目——只有本分发器上架。
//
// 全部可切换站（phantom/seline/steep）现各有专属版式；「共享 theme-agnostic 兜底页」曾在
// seline/phantom 待补期间用过，如今已耗尽退场（那种通用页正是 per-site 模型要否定的东西）。
// 未注册站只留一个**小占位**（NoLanding）作防崩安全网：万一新站加了 adapter 却漏写 landing +
// 注册，切换器选到它不会白屏，而是明示「暂无专属落地页」——不拿任何一家的长相冒充新站。

import type { ComponentType } from 'react';
import { useSyncExternalStore } from 'react';
import PhantomLanding from './phantom';
import SelineLanding from './seline';
import SteepLanding from './steep';

export const meta = {
  title: 'Landing',
  description:
    '落地页版式样例：按 active-site 分发到该站自己那一版落地页，切站即切结构。',
};

// active-site → 专属版式。未注册站落到 NoLanding 小占位（见文件头）。
const bySite: Record<string, ComponentType> = {
  phantom: PhantomLanding,
  seline: SelineLanding,
  steep: SteepLanding,
};

/** 未注册站的小占位（防崩安全网，非某主题）：只读 var(--stitch-*)，明示该站尚无专属落地页。 */
function NoLanding({ site }: { site: string }) {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--stitch-space-12)',
        padding: 'var(--stitch-space-48)',
        textAlign: 'center',
        background: 'var(--stitch-bg-canvas)',
        color: 'var(--stitch-text-primary)',
        fontFamily: 'var(--stitch-font-body)',
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: 'var(--stitch-font-display)',
          fontSize: 'var(--stitch-font-size-lg)',
          color: 'var(--stitch-text-primary)',
        }}
      >
        {site || '（未指定站点）'} 暂无专属落地页
      </p>
      <p
        style={{
          margin: 0,
          fontSize: 'var(--stitch-font-size-base)',
          color: 'var(--stitch-text-secondary)',
        }}
      >
        为该站在 demo/layouts/landing/&lt;站&gt;/ 下新增一版，并注册进 bySite。
      </p>
    </div>
  );
}

// documentElement 的 data-site 是外部可变源；订阅其属性变化，切站即重渲染分发。
function subscribeSite(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-site'],
  });
  return () => observer.disconnect();
}
const getSiteSnapshot = (): string =>
  document.documentElement.dataset.site ?? '';

function useActiveSite(): string {
  // getServerSnapshot 兜底 ''（demo 纯 CSR，不会走到，但满足 API 契约）。
  return useSyncExternalStore(subscribeSite, getSiteSnapshot, () => '');
}

export default function LandingDispatcher() {
  const site = useActiveSite();
  const Landing = bySite[site];
  return Landing ? <Landing /> : <NoLanding site={site} />;
}
