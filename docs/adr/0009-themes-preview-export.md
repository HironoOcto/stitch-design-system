# themes/\* 导出：使用方灵活选主题（一站一文件、opt-in、零配置默认单套）

`npm run build` 除了烤当前 `activeSite` 的单份 `:root` 进 `dist/style.css`（[ADR 0007](./0007-active-site-single-switch.md)），再为**每个可发布站**（[listPublishableSites](../../scripts/lib/publishable-sites.mjs)，三件套齐全）emit 一份 `dist/themes/<站>.css`。内容 = 该站 `adapter.css` 的每站值作用域化成 `[data-site="<站>"]`（[scopeAdapter](../../scripts/lib/scope-theme.mjs)）；恒定/派生仍只留在 `style.css` 的 `:root`，靠 `var()` 自动跟随。emit 挂进既有 `vite-plugin-stitch-theme` 的 `generateBundle`/`emitFile`，与 `style.css` 原子产出、dist 清空不受影响。`packages/react/package.json` 加通配子路径导出 `"./themes/*": "./dist/themes/*.css"`。

**目的**：让使用方 app **零重发布**就能自己选主题——按需 `import '@octohirono/stitch-design-system/themes/<站>'` + 翻 `document.documentElement.dataset.site` 即整站换肤，可直接做成给终端用户的主题选择器。这是本包对外的一等能力。

**零配置默认单套**：只 `import '.../style'`、不引 `themes/*`、不设 `data-site` 的消费方，拿到的就是 `style.css` 里烤死的 `activeSite` 那一套——不想管多主题的 app 什么都不用做，也不背任何多主题 CSS。`themes/*` 是**按需 opt-in 覆盖层**：引一站多一份、只搬该站每站值，不引就不存在、零膨胀。

## 与 [ADR 0001](./0001-multi-site-reskin.md)（B 方案）的关系

ADR 0001 定「库核心走构建时切、不搞 A 方案那套 primitives+语义两层+theme×token 矩阵+生成器」。本 ADR 不推翻它：库核心仍是**角色契约 + 每站 adapter**，`style.css` 仍是构建时烤定的单份默认皮。`themes/*` 是在这套地基上、用**已有的每站 adapter 值**低成本 emit 的一层薄覆盖——给「使用方想运行时选/切主题」这个真实信号一个轻量答复，而**不引入** A 方案的矩阵与生成器复杂度。要选/切几套由使用方按需 import 决定，未 import 的站零成本。

## Considered Options

- **不导出、要换主题就各切 `activeSite` 重 build/republish**：零新 API，生产干净单套；但使用方无法自选、更做不出运行时主题选择器，多主题诉求全压回维护者重发布。
- **一个大文件含所有站的 `[data-site]` 块**：一次 import 覆盖全部；但所有主题值挤进一份、无法按站 tree-shake，站变多即膨胀（用不到的主题也得下载）。
- **一站一文件 + opt-in ← 采用**：一次 emit 一站、使用方按需 import 单站，避免爆炸、只为用到的主题付 CSS 成本；`ship-from-package` 单一真相（值仍源自 `sites/<站>/adapter.css`，构建当场作用域化，无本地拷贝会漂移）；不引 `themes/*` 的零配置默认单套不被触碰。

## Consequences

- 公开 API 新增一个通配子路径导出 `./themes/*`；`files: ["dist"]` 已覆盖，`npm pack` 自动含 `dist/themes/*.css`。
- 「可发布站」集合单点取自 [listPublishableSites](../../scripts/lib/publishable-sites.mjs)（#7）——`themes/*` 面与 skill preset 面永不劈叉；emit 脚本零写死站名（H1）。
- `themes/<站>.css` 只搬每站值到 `--stitch-*` 角色名、无越界、不写死非角色值（H2）；`style.css` 的单份 `:root` 不变量（`DO NOT EDIT` 头 / 单 `:root` / 派生 `color-mix` 未求值）不被触碰（H4）。
- 换 `activeSite` 重 build：`style.css` 默认皮随之变，`dist/themes/*` 内容不随 `activeSite` 变（每站各自恒定），组件编译产物 diff 为空。
