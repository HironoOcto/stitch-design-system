# Token 源 = CSS 角色契约 + 每站 adapter，主题意图源 = DESIGN.md

设计 token 以 **CSS** 为源，不以 `tokens.json`、也不以散落手写的 Less 变量为源：全局 `packages/tokens/contract.css` 定义全部 `--stitch-*` 角色变量 + 默认值，每站 `sites/<站>/adapter.css` 同名覆盖填该站的值，postcss 合并出单个 `:root` 的 `tokens.css`。主题的设计意图来自每站 Refero 产出的 `DESIGN.md`（结构固定），adapter 的值与 rules.md 的规则都从它抽。

## Considered Options

- **散落手写 Less 变量**：意图贴身、工具链简单，但一套主题装得下、多套主题装不好（Less 变量是单值的）。
- **`tokens.json` + 生成器**：自动同步、可接设计工具，但多一层间接 + 工具链；只有运行时切/站数爆炸/接 Figma 才需要（见 [0001](./0001-multi-site-reskin.md)）。
- **CSS 契约 + 每站 adapter ← 采用**：多站换肤下角色不变、每站只换 adapter；派生值用 `color-mix()`/`var()` 现代浏览器原生可跑（standalone 也行），零色彩引擎。

## Consequences

四产物里只有 `tokens.css`（CSS 变量）必生成（唯一能渲染的**那一类**产物，`.less`/`.md`/`.d.ts` 都不能渲染）；<br>_注：合并出的 `:root` 有两个落点——包的 `dist/style.css`（**运行时契约**）与 skill 的 `tokens.css`（给 AI 的同源快照）。"唯一运行时契约"指前者，[ADR 0007](./0007-active-site-single-switch.md) 已精确化。_ `.less`（断点）/`.md`（给 AI）/`.d.ts`（JS 按名取值）都是按需补丁，不是标配。派生值保留 `color-mix()` 原样、不求值成静态 hex。
