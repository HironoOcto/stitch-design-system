// demo/theme.ts —— 换肤外壳的主题加载（方案 B 的 dev 便利版）
//
// 三步：动态发现 → 作用域化 → 切换（见 docs/contributing/demo-site.md）。
// - 引【源文件】不引 dist/ 产物（改一下即热更新）。
// - 源永远纯 :root；:root→[data-site=x] 的作用域化只在这一侧的内存里做。
// - 不读 stitch.config.json 的 activeSite —— demo 全站都挂，同屏可切。

// 契约默认值（全局兜底，作用域块之前）
import contract from '/packages/tokens/contract.css?raw';

// 扫每站的两份【成对值文件】原文（键=路径，值=CSS 文本）。
// - adapter.css：手写值（颜色/字体/圆角/阴影…）
// - layout.css：页面尺度层（build:layout 产物，adapter 的成对值文件，ADR 0012）
const adapters = import.meta.glob('/sites/*/adapter.css', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;
const layoutRaw = import.meta.glob('/sites/*/layout.css', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;
const layouts: Record<string, string> = {};
for (const [path, css] of Object.entries(layoutRaw)) {
  layouts[path.match(/sites\/([^/]+)\/layout\.css$/)![1]] = css;
}

export interface Site {
  name: string;
  scoped: string;
}

// 站点列表判据 = 【有 adapter.css ∩ 有 layout.css】（两份值文件成对）。二者本就成对，
// 交集只在建站途中（写了 adapter 尚未 build:layout）短暂不等；缺 layout 的站不进
// demo（切过去会缺页面尺度层）。目录名 → 作用域化后的 CSS：每站块 = layout + adapter
// 依次拼接，adapter 排后 → 同名键 adapter 覆盖 layer（与 scopeAdapter / mergeTokens
// 同序）；两份 :root 一起改写成 [data-site="<name>"]，切站时 layout/间距/字阶随每站值
// 一并重排。按目录名排序稳定。
export const sites: Site[] = Object.entries(adapters)
  .filter(([path]) => {
    const name = path.match(/sites\/([^/]+)\/adapter\.css$/)![1];
    return name in layouts;
  })
  .map(([path, adapterCss]) => {
    const name = path.match(/sites\/([^/]+)\/adapter\.css$/)![1];
    const scoped = `${layouts[name]}\n${adapterCss}`.replace(
      /:root\b/g,
      `[data-site="${name}"]`,
    );
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
