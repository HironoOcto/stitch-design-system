# activeSite 单一开关驱动两条构建，合并逻辑单一实现共用

仓库根 `stitch.config.json` 的 `{ "activeSite": "steep" }` 是"当前生效哪个站"的**唯一真相**。两条构建都读它：包的 `vite build`（经虚拟模块插件）产出 `dist/style.css`（终端 app 运行时加载），skill 的 `build:skill` 产出 `references/theme/tokens.css`（AI 编写时参考）。二者把 `contract.css` + `sites/<active>/adapter.css` **合并成单份 `:root`** 的逻辑是**同一个 `mergeTokens`**（[skill 构建流程](../contributing/skill-build-pipeline.md) §6.2），包与 skill 共用一份，杜绝两处合并漂移。`adapter.css` 全程是源，被读多次、从不手动拷贝。

demo 站**不受此开关限制**：它动态扫描 `sites/*/adapter.css` 全部挂上、在 demo 侧把每份 `:root` 作用域化成 `[data-site=<目录名>]`，仅用于本地多站预览（源文件保持纯 `:root` 不变）。

## Considered Options

- **两个独立开关**（包一个、skill 一个）：能让包发 steep、skill 发 phantom，更灵活；但两者会漂移不同步、没东西强制一致，且合并逻辑两处各写一份易分叉。
- **单一 `activeSite` + 共用 `mergeTokens` ← 采用**：一个字段翻转，两产物一致；合并逻辑只一份，源真相单一。

## Consequences

- 三个"当前主题"消费方的落点固定：`dist/style.css`（**运行时**·终端 app）、`references/theme/tokens.css`（**编写时**·skill·AI）、demo 多站预览（**dev**·全挂、不受开关限制）。
- **精确化了 [0004](./0004-token-source.md)** 里"`tokens.css` 是唯一运行时契约"的表述——运行时渲染契约其实是 `dist/style.css`；`tokens.css` 是 skill 内嵌、给 AI 的**同源快照**。0004 的核心决策（token 以 CSS 契约 + 每站 adapter 为源）不变。
- `vite.config.ts` 不再只编译组件：`src/index.ts` 顶部 `import 'virtual:stitch-theme'`，插件读 `activeSite` + `mergeTokens` 把合并出的 `:root` 灌进 `dist/style.css`（见 [打包发布](../contributing/packaging.md)）。
- 换 `activeSite` 重跑：只有 `dist/style.css` 与 skill 的 `references/theme/*` 变，组件编译产物 diff 为空。
