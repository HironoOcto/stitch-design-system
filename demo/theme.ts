// demo/theme.ts —— 换肤外壳的主题加载（方案 B 的 dev 便利版）
//
// 三步：动态发现 → 作用域化 → 切换（见 docs/contributing/demo-site.md）。
// - 引【源文件】不引 dist/ 产物（改一下即热更新）。
// - 源永远纯 :root；:root→[data-site=x] 的作用域化只在这一侧的内存里做。
// - 不读 stitch.config.json 的 activeSite —— demo 全站都挂，同屏可切。

// 契约默认值（全局兜底，作用域块之前）
import contract from '/packages/tokens/contract.css?raw';

// 扫 sites/*/adapter.css 原文（键=路径，值=CSS 文本）。站点列表判据 = 有 adapter.css。
const adapters = import.meta.glob('/sites/*/adapter.css', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export interface Site {
  name: string;
  scoped: string;
}

// 目录名 → 作用域化后的 CSS（:root 改写为 [data-site="<name>"]），按目录名排序稳定。
export const sites: Site[] = Object.entries(adapters)
  .map(([path, css]) => {
    const name = path.match(/sites\/([^/]+)\/adapter\.css$/)![1];
    const scoped = css.replace(/:root\b/g, `[data-site="${name}"]`);
    return { name, scoped };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

// contract 的 :root 默认值在前作兜底，随后拼上每站作用域块。
const themeCss = [contract, ...sites.map((s) => s.scoped)].join('\n');

const STYLE_ID = 'stitch-theme';

/** 注入合并后的主题 CSS 到 <head>（幂等）。 */
export function installTheme(): void {
  let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement('style');
    el.id = STYLE_ID;
    document.head.appendChild(el);
  }
  el.textContent = themeCss;
}

/** 切当前站 = 改 documentElement 的 data-site 属性，整站（含外壳）跟着换肤。 */
export function setSite(name: string): void {
  document.documentElement.dataset.site = name;
}

export function getSite(): string {
  return document.documentElement.dataset.site ?? '';
}
