# Demo 站（本地可导航平台 + 用例来源）

> 组件库的本地 Demo 站：一个**可导航平台**——侧栏按族分组、顶栏切站、内容区渲染当前组件，且它是 skill 用例的来源。维护者写一个组件就在这里看效果、随手切站看换肤。本节讲它**怎么加载主题**（方案 B 换肤外壳）、**侧栏怎么从族表派生**、**怎么路由**，以及**怎么和三条构建对接**。

Demo 站有两个职责：

1. **看效果 + 导航**：写/改一个组件，本地跑 demo 肉眼验证它在真实主题下的样子；左侧栏按族导航、顶栏一键切站整站换肤。
2. **供 `build:refs` 抽用例**：每个组件在 `demo/components/<X>/` 有真实用法，`build:refs` 从这里挑 1–3 段 JSX 写进 skill 的 `references/components/`（见 [skill 构建流程](./skill-build-pipeline.md) §4.3）。

## 工具链与启动

`npm run demo` 起 [Vite](https://vitejs.dev)（React + TypeScript + Less）。root = 仓库根，入口 `demo/main.tsx`，`index.html` 在根。`import.meta.glob` 用**从 root 起的绝对路径**（`/demo/…`、`/sites/…`、`/packages/…`、`/scripts/…`）。

> 范围：本地开发预览，**不含**测试栈（vitest）、真组件构建流程、npm 包产物 `dist/style.css`。纯 Node 的 `merge-tokens` 测试仍走 `node --test`（`npm test`），不动。

## 方案 B 换肤外壳：整站只读角色变量

外壳（**侧栏 + 顶栏 + 内容区**）与组件一样，**只读角色变量** `var(--stitch-*)`，禁硬编码 hex / 圆角 / 字体。切 `activeSite` 时**整站换肤——含侧栏本身**（不是只换预览区）。默认站 seline。

- 落地：`demo/App.tsx`（外壳结构）+ `demo/shell.less`（外壳样式，全 `var(--stitch-*)`）。
- 这条是硬红线 **H2**：外壳尤其不许像旧品牌站那样写死品牌色。可 grep 断言：`demo/` 下无 hex / rgb/oklab 等裸颜色。

## Demo 与三条构建的关系：它不受 `activeSite` 限制

换肤有三条消费路径（见 [多站换肤架构](../design-system/multi-site-theming.md) §9.8）。包与 skill 两条**只烤 `activeSite` 一份**；**demo 是第三条，全站都挂**，专为本地同屏对比多个站——它不受 `stitch.config.json` 的 `activeSite` 限制。

两条边界，记牢：

- **引源，不引产物**：demo 直接 import `packages/tokens/contract.css` 和 `sites/*/adapter.css` 这些**源文件**（改一下立刻热更新），**不**引 `dist/style.css`（那是发布产物，改主题得先 `build` 才变，dev 体验差）。
- **源保持纯 `:root`，作用域化只在 demo 侧做**：`adapter.css` 的正式形状是"静态 `:root`"（§9.4.2），包与 skill 都依赖这个纯 `:root` 才能无脑合并。demo 要同屏多站，就得把每份 `:root` 作用域化成 `[data-site=x]`——**这个改写只发生在 demo 这一侧的内存里，源文件一个字不动**。

## 多站切换器怎么工作

三步：**动态发现 → 作用域化 → 切换**（落地：`demo/theme.ts`，切换器 UI 在 `demo/App.tsx` 顶栏）。

1. **动态发现**：用 `import.meta.glob('/sites/*/adapter.css', { query: '?raw', eager: true })` 扫目录拿到每份 adapter 的**原文**。站点列表 = **有 `adapter.css` 的目录**（不是有 `source/` 的——目前只有 steep + seline 有 adapter；只有 `source/` 的站切过去会是空白）。站名取目录名。
2. **作用域化**：把每份原文里的 `:root` 选择器替换成 `[data-site="<目录名>"]`，拼成一份、注入 `<head>` 的 `<style>`。contract.css 的 `:root` 默认值原样保留在最前（作全局兜底）。
3. **切换**：在 `<html>`（`documentElement`）上设 `data-site="seline"`，顶栏切换器改这个属性即换站。因为每站变量已被 `[data-site=x]` 作用域化，改属性就换整套值，外壳与组件零改动跟着变。

```ts
// demo/theme.ts —— dev 期动态挂全部站、作用域化、暴露切换
import contract from '/packages/tokens/contract.css?raw';

const adapters = import.meta.glob('/sites/*/adapter.css', {
    query: '?raw', import: 'default', eager: true,
}) as Record<string, string>;

export const sites = Object.entries(adapters).map(([path, css]) => {
    const name = path.match(/sites\/([^/]+)\/adapter\.css$/)![1];
    const scoped = css.replace(/:root\b/g, `[data-site="${name}"]`);
    return { name, scoped };
});

// contract 的 :root 默认值在前作兜底，随后拼上每站作用域块
const themeCss = [contract, ...sites.map(s => s.scoped)].join('\n');
// 注入 <head><style>，再 document.documentElement.dataset.site = 'seline'
```

> 切换器 UI（顶栏下拉）遍历 `sites` 生成选项、`onChange` 改 `documentElement.dataset.site`——纯 dev 便利，不属于组件库、不发布。**别把它误当运行时换肤**（那是我们明确不做的 A 方案，见 [ADR 0001](../adr/0001-multi-site-reskin.md)）。

## 族表派生的侧栏导航：族表 ∩ `demo/components/*`

侧栏分组**不手维护**，从两处**自动合成**：

- **分组权威 = 族表**：`scripts/component-families.md`（那张「族名 · 主要功能 · 成员」表，与 `build:refs` 同源，见 §4.3）。落地 `demo/families.ts` 解析它。
- **实际成员 = 已建 demo**：`import.meta.glob('/demo/components/*/index.tsx')` 扫出真建了页的组件。落地 `demo/registry.ts`。

合成规则（`deriveNav`）：遍历族表，**某族有 ≥1 个已建 demo 成员才显示该组 + 其已建成员；空族不显示**。成员匹配大小写不敏感（族表 `Button` ↔ 文件夹 `button`）。

- **加组件 = 丢一个 `demo/components/<X>/` 文件夹即自动上架，导航零改动。**
- **文件夹名须与族表成员名对齐**，不齐则 `console.warn`（该 demo 不上架，避免静默漏掉）——去族表加成员名，或改文件夹名。

## 每组件页 + `demo/components/` 结构 + hash 路由

- **结构**：每个组件在 `demo/components/<X>/index.tsx`，`export const meta = { title, description }` + `export default` 一个示例组件（= `build:refs` §4.3 采集用例的来源）。
- **组件页** = 标题 + 描述 + 示例；分组来自族表。
- **hash 路由**：`#/<X>`（`X` = 文件夹名），无新依赖——`hashchange` 事件驱动。路由无效或缺省时落到第一个已建组件。

## 硬约束速查

- 外壳/侧栏/组件一律只读 `var(--stitch-*)`（红线 **H2**）；自包含、不引父目录/外部路径（红线 **H1**）。
- 站点列表按 `sites/*/adapter.css` **动态**，不写死；判据是"有 adapter"而非"有 source"。
- `:root → [data-site=x]` 的作用域化**只在 demo 侧**；`sites/<站>/adapter.css` 源永远是纯 `:root`。
- demo 引**源文件**（`?raw` / 直接 import），不引 `dist/` 产物。
- 侧栏分组读 `scripts/component-families.md`，与 `build:refs` 同源，别另搞一套。
- demo 不读、不受 `stitch.config.json` 的 `activeSite` 影响。
