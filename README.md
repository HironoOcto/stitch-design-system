# stitch-design-system

一套 React + TypeScript 组件库，AI 是一等公民：同一套组件、一套 `--stitch-*` 角色契约，构建时切换成不同网站的风格（多站换肤）。

- **仓库规则 / 权威顺序 / 硬红线** → [AGENTS.md](./AGENTS.md)
- **术语**（角色契约 / 插座 / 插头 / adapter…）→ [CONTEXT.md](./CONTEXT.md)
- **维护规范全景**（组件怎么写 / 换肤架构 / 打包 / skill）→ [docs/contributing/](./docs/contributing/README.md)

本文回答几个高频操作：**新增一个主题 site**、**新增 / 修改一个组件**，以及两份 operator runbook——**切换当前生效主题**、**发布新版本包**。每步给执行动作，细节链到正本文档。所有命令的「什么时候用 / 作用」一览见文末 [命令速查](#命令速查)。

---

## 新增一个主题 site

一个站的风格 = **值**（`adapter.css`）+ **规则**（`rules.md`）。加站就是产出这两份、让 demo 认出它，（要生效时）再嵌进 skill。正本：[接入新站 playbook](./docs/contributing/onboard-site.md)、[Demo 站](./docs/contributing/demo-site.md)、[skill 构建流程](./docs/contributing/skill-build-pipeline.md)。

1. **放 bundle**：把该站的 Refero bundle 放进 `sites/<site>/source/`（主力 `DESIGN.md`）。
2. **抽两个产物**：按 [onboard-site playbook](./docs/contributing/onboard-site.md) 从 `DESIGN.md` 生成 `sites/<site>/adapter.css`（值·单段静态 `:root`，只填 `--stitch-*` 角色名）+ `sites/<site>/rules.md`（Do/Don't + 长相规则）。**AI 生成 + 人复核**，非确定脚本；复核清单见 [onboard-site-review.md](./docs/contributing/onboard-site-review.md)。
3. **demo 肉眼验证**：`npm run demo`，顶栏切到 `<site>` 看整站换肤。demo **动态发现**——凡 `sites/*/adapter.css` 存在即自动上架，无需改配置、不受 `activeSite` 限制（见 [demo-site.md](./docs/contributing/demo-site.md)）。
4. **设为生效主题**（仅当要把它嵌进 skill / 发布时）：把 `stitch.config.json` 的 `activeSite` 改成 `<site>`。用 `npm run build:tokens` 自证 `contract + 该站 adapter` 合并结果（产物 gitignore，只作核对）。
5. **嵌进 skill**：按 [skill 构建流程 §4.5](./docs/contributing/skill-build-pipeline.md) 先 `build:blurb <site>`（每站一次，人审风格 blurb）→ 再 `build:skill`（为**每个可发布站**各备一套预置 `references/theme-presets/<站>/{tokens.css,rules.md,style.md}` + 全局 `references/theme/design-rules.md` + 注入 SKILL.md `SLOT:default-site`）。「哪套生效」由消费项目 `.agent/stitch.theme.json` 指针读时解析（[ADR 0010](./docs/adr/0010-consume-time-theme-choice.md)）；本仓库 `activeSite` 定发布默认。
6. **验收**：按 [skill 结构验收标准](./docs/contributing/skill-acceptance.md) 核当前生效主题的 skill（9 产物节；`tokens.css == mergeTokens`、`rules.md == 源逐字`、无他站风格残留）。

> 硬红线：`adapter.css` 只写 `--stitch-*` 角色名、绝不引原始 `--color-*`；`:root → [data-site=x]` 的作用域化只发生在 demo 内存里，源文件永远是纯 `:root`。

---

## 切换当前生效主题

一次只有一个 `activeSite` 生效（**构建时切**，见 [ADR 0007](./docs/adr/0007-active-site-single-switch.md)）。换主题只重算主题产物，**组件产物不变**：

1. **改 activeSite**：把 `stitch.config.json` 的 `activeSite` 改成目标站。该站须已有 `sites/<site>/adapter.css` + `rules.md` + `skill-blurb.md`（还没有就先按上面「新增一个主题 site」加站——`skill-blurb.md` 是该站接入时 `build:blurb` 冻结的产物，缺它 `build:skill` 会直接报错）。
2. **重建 skill 主题**：`npm run build:skill` —— 为每个可发布站重算预置 `references/theme-presets/<站>/*` 并把 SKILL.md 的 `SLOT:default-site` 更新成新默认；`references/components/*` 组件参考 diff 为空（[skill 构建流程](./docs/contributing/skill-build-pipeline.md)）。**注意**：这里换的是**发布默认**；**消费方**换开发主题不必动本仓库——改各自项目 `.agent/stitch.theme.json` 指针即可（[ADR 0010](./docs/adr/0010-consume-time-theme-choice.md)，配合 reset-theme skill）。
3. **重建发布产物**：执行 `npm run build`。构建时虚拟模块**自动**读 `activeSite`，把新主题的 `:root` 写进 `dist/style.css`——你不用手动改任何样式（原理见 [packaging.md](./docs/contributing/packaging.md)）；组件 JS 产物不变。
4. **验收**：执行 `npm run ci`，须全绿（其中 `check:skill` 会断言「换主题只有 theme 产物变，其余 diff 为空」）。

---

## 用 npm 包灵活切换主题

上面的「切换当前生效主题」是**改仓库、重发布**（换 `activeSite` 里烤定的那套默认皮）。使用方 app **零重发布**就想自己选主题、甚至运行时切，用包的 `themes/*` 导出（原理见 [ADR 0009](./docs/adr/0009-themes-preview-export.md)）。

`npm run build` 会为每个[可发布站](./scripts/lib/publishable-sites.mjs)额外 emit 一份 `dist/themes/<site>.css`（该站 `adapter.css` 的每站值作用域化成 `[data-site="<site>"]`；恒定/派生仍留在 `dist/style.css` 的 `:root`，靠 `var()` 自动跟随）。使用方按需引入要用的站、翻 `data-site` 即整站换肤：

```ts
// app entry —— style 必装；themes/* 引入你要提供给用户选的那几套
import '@octohirono/stitch-design-system/style';
import '@octohirono/stitch-design-system/themes/seline';
import '@octohirono/stitch-design-system/themes/steep';
```

```ts
// 运行时翻 data-site 即整站换肤（可做成给终端用户的主题选择器）
document.documentElement.dataset.site = 'steep'; // 或 'seline'
document.documentElement.removeAttribute('data-site'); // 回默认皮
```

> **零配置默认**：只 `import '.../style'`、不引 `themes/*`、不设 `data-site` 的消费方，拿到的就是 `dist/style.css` 里烤死的 `activeSite` 那一套单主题（[ADR 0007](./docs/adr/0007-active-site-single-switch.md)）——不想管多主题的 app 什么都不用做。想让用户灵活选主题，再按上面 opt-in 引入 `themes/*`：一站一份、只搬每站值到 `[data-site]`，不引就不存在、零膨胀。

---

## 用 reset-theme 切换开发主题

上一节的 `themes/*` 是**运行时**给终端用户翻 `data-site` 换皮；这一节换的是另一回事——**你（使用方）开发时，让 AI 照哪套主题写 UI**。发这套 skill 的插件里除了 `stitch-design-system`，还并列一条 [`reset-theme`](./skills/reset-theme/SKILL.md) skill 专管这件事（同插件分发，便于彼此定位、一致更新）。

它做的事极小、也极稳：

1. **列可发布站**：从并列的 `stitch-design-system` skill 附带的 `references/theme-presets/*` **动态取**当前可选主题（零写死站名——跟 [`listPublishableSites`](./scripts/lib/publishable-sites.mjs) 判据同一集合）。
2. **挑一套**：由你选，AI 不替你定、也不会给出列表外的名字。
3. **只写项目指针**：把你选的站名写进**你自己项目**的 `.agent/stitch.theme.json` 的 `activeSite`（其余键原样保留；`.agent/` 是通用 agent 目录，也是本插件安装所在，故指针随之落这里——刻意区别于本仓库开发用的根 `stitch.config.json`）。**只碰这一个文件**——不改任何已装插件的内脏，所以升级插件不丢选择；幂等（再选同一套 = 同结果）；per-project（两个项目可各一套）。

选定后，`stitch-design-system` skill 就**读时解析**这枚指针决定照哪套主题写 UI（[ADR 0010](./docs/adr/0010-consume-time-theme-choice.md)），无指针则回落到发布默认（= npm 包默认皮）。

> **两边对齐，不漂移**：上一节的**预览**认 `data-site="<站>"`，这一节的**开发**认指针 `activeSite="<站>"`——**同一个站名**即两边说的是同一套皮。给终端用户预览的那套，和 AI 开发时照的那套，从结构上锁成一致。

---

## 新增 / 修改组件

组件**只读角色变量** `var(--stitch-*)`，长相由 adapter 灌值、自动换肤。正本：[手写新增一个组件](./docs/contributing/add-new-component.md)、[组件源代码规范](./docs/contributing/component-authoring.md)、[同步机制与 CI](./docs/contributing/sync-and-ci.md)。

**新增一个组件 `X`：**

1. **四件套 + 实现**：`packages/react/src/components/X/` 建 `X.tsx` / `x.module.less` / `X.test.tsx` / `index.ts`，按 [组件源代码规范](./docs/contributing/component-authoring.md) 的固定骨架实现；props 来源见 [add-new-component.md](./docs/contributing/add-new-component.md)（Ant 有对应件借 props、业务件据功能自定）。
2. **a11y**：非原生控件自己补 `role` / `aria-*` / 键盘 / focus 管理；有状态件写受控 + 非受控双模式。
3. **上皮**：`x.module.less` 只写 `var(--stitch-*)`，禁硬编码 hex / 圆角 / 阴影；长相守两套规则——全局 [design-rules.md](./docs/design-system/design-rules.md) + 站点 `sites/<站>/rules.md`。
4. **桶导出**：在 `packages/react/src/index.ts` 加 `export { X }` + `export type { XProps }`。
5. **demo 页**：建 `demo/components/X/index.tsx` 并注册，`npm run demo` 看效果（demo 侧注册齐才可达）。
6. **族归类**：把 `X` 加进 `scripts/component-families.md` 对应族的成员列（**族的单一真相**）；放不进现有族才按 [pipeline 决策 prompt](./docs/contributing/skill-build-pipeline.md) 开新族。文件夹名须与族表成员名对齐。
7. **重生成 skill 参考**：`npm run build:refs` —— ts-morph 抽 `XProps` + demo 用例，重写 `references/components/<族>.md` 并注入 catalog 槽（SKILL.md / README 同步、零手 sync）。
8. **测试**：按 [组件源代码规范 · 测试](./docs/contributing/component-authoring.md) 的 7 维度，重点第 6（键盘）+ 第 7（可及名）。
9. **绿灯**：`npm run ci`（format + check:docs + lint + 单测 + a11y + build）全绿；文档同一 PR 更新（[同步机制与 CI](./docs/contributing/sync-and-ci.md)）。

**修改一个已有组件：**

1. 改 `packages/react/src/components/X/`（源码是唯一真相；改动同一 PR 同步文档）。
2. **动了公开 props 或族归属** → `npm run build:refs` 重生成参考 + catalog；只改内部实现 / 样式则不必。
3. **动了 `stitch.config.json` 的 token 语义** → `npm run build:tokens` 核对。
4. `npm run ci` 全绿。

> 验收基线：每个组件对照 [add-new-component.md《每个组件必备清单》](./docs/contributing/add-new-component.md)（源码 / demo / skill 三侧）逐条勾，再照 [demo 平台验收清单](./docs/contributing/demo-acceptance.md) 在 demo 上核。

---

## 发布新版本包

发布是**人工操作**（npm 凭证在维护者手上），不走 agent 流程。每次发版按序执行下面四步：

1. **改版本号**：在 `packages/react/` 执行 `npm version <patch|minor|major>`——它把 `packages/react/package.json` 的 `version` 递增，**并经 `version` 生命周期钩子（[scripts/sync-plugin-version.mjs](./scripts/sync-plugin-version.mjs)）把 `.claude-plugin/plugin.json` 的版本就地同步成同一个值**（组件库版本 = skill 插件版本，永不漂移），再在 git 里建一个 `v<版本号>` 的 commit + tag——**两份改动都在这同一个 commit 里**。
2. **本地自证**（两条命令，都不联网、不发布）：
   - 执行 `npm run ci`——八步须**全绿**（格式 / 边界 / lint / 单测 / a11y / build）才算过。
   - 在 `packages/react/` 执行 `npm pack --dry-run`——它不真打包，只**打印"这次会打进 tarball 的文件清单"**。核对该清单：**只应有** `dist/**` + `package.json` + `README.md`，**绝不能**出现 `src/`、`*.test.*`、`*.less` 等源文件（`files` 白名单闸，原理见 [packaging.md](./docs/contributing/packaging.md)）。
3. **发布**：执行 `npm publish --access public`（scope 包首发必须带 `--access public`，否则 npm 报错；发布前 `prepublishOnly` 钩子会**自动再跑一遍**根 `npm run ci`，不绿就不发）。
4. **推送 tag**：执行 `git push --follow-tags`，把第 1 步的 commit 和 `v<版本号>` tag 一起推上远端，标记本次发布点。

> 分发装法（`npx skills add` / `.claude-plugin` 原生路径）见 skill 侧 [安装说明](./skills/stitch-design-system/README.md#安装) 与 [ADR 0008](./docs/adr/0008-distribution-and-package-name.md)。

### 本地重装验证 skill 插件（`.claude-plugin` 路径）

换了插件版本、`git push` 之后，Claude 会**缓存旧的 marketplace**——不先刷新就还是旧版本。测试 / 重装按这个来（GitHub owner=`HironoOcto`，marketplace 名=`hironoocto`）：

```bash
# scope 四条命令必须一致：装/卸都用同一个 scope，否则去别的 scope 找会落空。
# 下面统一用 project（只在当前项目生效）；想全局就把四处 --scope project 都换成 --scope user（或都去掉，默认 user）。

# 1. 清掉旧安装（含缓存的 marketplace）
claude plugins uninstall stitch-design-system --scope project
claude plugins marketplace remove hironoocto --scope project

# 2. 重新拉最新 + 装
claude plugins marketplace add HironoOcto/stitch-design-system --scope project
claude plugins install stitch-design-system@hironoocto --scope project

# 3. 确认版本 / scope
claude plugins list | grep -i stitch     # 应显示当前 plugin.json 版本、project
```

> 卸载测试痕迹 = 只跑第 1 步那两条。`npx skills add` 那条路的卸载是 `npx skills remove stitch-design-system`。

---

## 命令速查

项目里所有命令（`package.json` 的 `scripts`）按场景分组。**记不住时看这张表**：想干什么 → 用哪条 → 它做什么。

### 看效果 / 本地开发

| 命令 | 什么时候用 | 作用 |
| --- | --- | --- |
| `npm run demo` | 想在浏览器里肉眼看组件 / 整站换肤 | 起 Demo 站（Vite）。顶栏可切到**任意** `sites/*`（动态发现，不受 `activeSite` 限制） |

### 生成 / 重建产物

改完东西后要重跑对应的生成命令，让**衍生产物**（skill 参考 / 主题 / dist）跟上源码。按「你改了哪一维」选：

**A. 改了「组件」**（碰了 `packages/react/src/` 里的组件代码）

| 命令 | 什么触发它（你改了什么） | 作用 |
| --- | --- | --- |
| `npm run build:refs` | 改了组件的**公开 props**（`packages/react/src/components/<X>/<X>.tsx` 里导出的 `<X>Props` 接口）或**族归属**（`scripts/component-families.md` 的成员列——族的单一真相）；只改内部实现 / `<x>.module.less` 样式则不用跑 | ts-morph 从源码抽 `XProps` + demo 用例，产**两类**：① 重写各族明细页 `references/components/<族>.md`（props 原文 + 用例，**这里没有 catalog**）；② 把「族 → 成员」目录表注入 `SKILL.md` 和 skill 的 `README.md` 的 `<!-- SLOT:catalog -->` 区间（两份自动同步、平价） |

**B. 改了「主题 / 站」**（碰了 token 值、切了 `activeSite`、或新增一个站）

| 命令 | 什么触发它（你改了什么） | 作用 |
| --- | --- | --- |
| `npm run build:tokens` | 改了 `contract.css` / 某站 `adapter.css` 的值，想**肉眼核对**「合并出的变量表」对不对 | 把契约占位 + 当前 `activeSite` 的 adapter 值合并成一份最终 `:root`，写到 `packages/tokens/dist/tokens.css`。**纯派生、谁都不 import**（发布靠 `build`、skill 靠 `build:skill` 各自当场重算），所以 gitignore、不发布、看完可删 |
| `npm run build:blurb <site>` | **加 / 换一个站**，要给它写风格招牌（每站一次；该站 `DESIGN.md` 变了也重跑） | **读** `sites/<site>/source/DESIGN.md` 抽三段 → 组固定 prompt → **调 LLM**（`claude -p`，非确定）**生成** `sites/<site>/skill-blurb.md` 草稿（description + style-paragraph 两段），等人复核签字冻盘。整条链唯一「非确定 / LLM」的一步就隔离在这，下游 `build:skill` 只**读**这份冻结草稿、不再 re-roll（保幂等）——**注意方向：本命令产出 `skill-blurb.md`，不是读它** |
| `npm run build:skill` | **切了 `activeSite`**（换发布默认），或任一可发布站的 token/rules/blurb 变了 | 纯确定编排（无 LLM）：对**每个可发布站** `mergeTokens` **算出** `theme-presets/<站>/tokens.css`、**逐字拷** `rules.md`、**读** `skill-blurb.md` 两段写 `style.md`；**逐字拷**全局 `design-rules.md` 进 `references/theme/`；把发布默认站名注入 `SKILL.md` 的 `SLOT:default-site`（[ADR 0010](./docs/adr/0010-consume-time-theme-choice.md)）。（消费 `build:blurb` + `build:refs` 的产物，故这俩要先备好） |

**C. 出发布产物**（组件维度 + 主题维度都会烤进 `dist/`）

| 命令 | 什么触发它 | 作用 |
| --- | --- | --- |
| `npm run build` | **发布前**，或改了组件 / 切了主题后想核对 `dist/` | Vite 出发布产物 `dist/`：既编译组件 JS，又靠虚拟模块把当前 `activeSite` 的 `:root` 写进 `dist/style.css` |

### 校验闸（`ci` 的组成，也能单跑定位问题）

| 命令 | 什么时候用 | 作用 |
| --- | --- | --- |
| `npm run format:check` | 提交前 / CI | Prettier 只检查不改（不合规则报错） |
| `npm run format` | 格式没过想一键修 | Prettier `--write` 直接改文件 |
| `npm run check:docs` | 改了组件目录 / skill 参考后 | 校验每个组件在 skill `references/components/*.md` 都有 `## <Name>` 条目（防文档漂移） |
| `npm run check:skill` | 改了 skill 产物 / 切主题后 | 把 [skill 验收标准](./docs/contributing/skill-acceptance.md) 固化成断言：自包含无外链、`tokens.css == mergeTokens`、`props == 源`、幂等、换主题 diff 收敛… |
| `npm run check:boundary` | 任何改动后（尤其碰源码 / 文档） | **H1 知识边界**守卫：三层 denylist 扫「非本系统痕迹 / 源 hex / 站名越界 / 旧包名」，零越界才过 |
| `npm run lint` | 提交前 / CI | oxlint + 两处 `tsc --noEmit` 类型检查（根 + `packages/react`） |

### 测试

| 命令 | 什么时候用 | 作用 |
| --- | --- | --- |
| `npm run test:run` | 改了组件后 | 跑组件**单元测试**（Vitest `unit` 项目） |
| `npm run test:a11y` | 改了组件的 role / aria / 键盘 / 焦点后 | 跑**无障碍测试**（Vitest `a11y` 项目） |
| `npm run test:units` | 改了 `scripts/` 下的构建 / 校验脚本后 | 跑**脚本层测试**（`node --test`，覆盖 `scripts/` 与 `scripts/lib/` 下的 `*.test.mjs`）。注意：**不在** `ci` 八步里，改脚本后需手动跑 |

### 总闸 / 发布

| 命令 | 什么时候用 | 作用 |
| --- | --- | --- |
| `npm run ci` | **每次提交前 / 发布前**（也是 pre-commit 钩子跑的） | 八步串联总闸：`format:check → check:docs → check:skill → check:boundary → lint → test:run → test:a11y → build`，全绿才放行 |
| `npm pack --dry-run` | 发布前（在 `packages/react/`） | 只打印「会打进 tarball 的文件清单」，核对只含 `dist/**` + `package.json` + `README.md` |
| `npm publish --access public` | 发布新版本（人工，凭证在维护者手上） | 发到 npm registry；`prepublishOnly` 会先自动跑一遍根 `npm run ci`（不绿不发） |
