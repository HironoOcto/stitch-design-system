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
// 不匹配，故子目录不会各自上架成导航条目——只有本分发器上架。尚无专属版式的站回退到
// 共享的 _fallback.tsx（theme-agnostic 版，非某主题，下划线前缀区分）。

import type { ComponentType } from 'react';
import { useSyncExternalStore } from 'react';
import FallbackLanding from './_fallback';
import PhantomLanding from './phantom';
import SelineLanding from './seline';
import SteepLanding from './steep';

export const meta = {
  title: 'Landing',
  description:
    '落地页版式样例：按 active-site 分发到该站自己那一版落地页，切站即切结构。',
};

// active-site → 专属版式。未列的站回退到 _fallback（theme-agnostic）。
const bySite: Record<string, ComponentType> = {
  phantom: PhantomLanding,
  seline: SelineLanding,
  steep: SteepLanding,
};

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
  const Landing = bySite[site] ?? FallbackLanding;
  return <Landing />;
}
