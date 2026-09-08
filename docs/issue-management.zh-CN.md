# Issue 执行与验收（[stitch]）

本文件装 **[stitch] issue** 的执行 prompt / 完成小结 + **结构 Hook 登记表**。stitch = 独立设计系统自身的工作（组件、契约、换肤、文档、后期 skill）。**在 `stitch-design-system/` 目录内执行**。**追踪器**：#1–#63（含）在旧 study 仓 `linling9025/design-system-study`；**#63「摘 repo」后**，项目已成独立 repo，此后组件构建 issue 建在**新仓 `HironoOcto/stitch-design-system`**（编号自 #1 重启，见下方「组件构建 issue（新仓）」区块）。两仓靠各段 `Issue:` URL 区分；gh 账号统一 `linling9025`（对两仓皆有写权限），本类一律标 `[stitch]` 前缀。

---

# 通用执行原则

## 🔴 两条铁律（每个 issue 不可破）

**铁律一 · 真实验收，禁糊弄。** 按任务类型选真实证据，**绝不用"我认为/口头/合成数据"顶替**：
- **UI/组件类** → 必须**真 build/render + 真实浏览器查验**，看开篇+结尾。
- **契约/脚本/结构类** → 真实输入跑通、真实文件产物就位为证。
- 缺依赖/环境 → 先调研，标 `blocked` / `needs-info`，不跳过、不合成。

**铁律二 · 必附执行报告（两块表，缺一不算完成）。**
- **① 结构 Hook 表**：逐行列出相关既有 Hook（见下「结构 Hook」）+ 本 issue 新增，须**全 🟢 green**。
- **② 真实 case dry_run**：🟢=开篇+结尾都达预期 / 🔴=未达+附现象 / ⚪=skip 必注原因。

## ⚙️ 本项目要求

- **测试不过度**：**一个 case 跑通即可**，别为一件事跑一堆——耗资源耗时间。目的是流程跑通没问题。
- **构建顺序**：**先把设计系统构建好，skill 是很后面才做的任务**。
- **决策同步**：纯迭代不进 ADR；决策变更须同步 `docs/adr/` / 契约。只动 issue 声明范围内的文件。

## `/implement` 收尾策略（覆盖 skill 默认）

- **不跑全量套件**。回归网 = **结构 Hook + 最小 case**（定向回归）。
- typecheck / 单文件测试：开发中随时跑（廉价，鼓励）。
- 重构 & 质量：红→绿在 `/tdd` 循环内，交给 `/code-review`（judgement call）。
- 收尾：commit 带 `#N` + GH issue 评论登记 close + 执行报告两块表。

## AFK seam 策略

默认 **AFK**（agent 独跑）。`/tdd` 被 `/implement` 内部驱动时，pre-agreed seam = **结构 Hook + 该 issue 正文声明的对外契约**，直接照做、**不停下确认 seam**。仅单独手动 `/tdd` 且人在场才现场确认。

## gh

`GH_CONFIG_DIR=~/.config/gh-linling9025 gh …`（账号 linling9025）。

---

# 结构 Hook（项目级不变量，任何 issue 不能破坏）

每个 Hook 是一条对外可观测的结构/边界断言，由引入它的 issue 写成检查并永久保持；只测 seam，不测私有实现。新结构由引入它的 issue 补 Hook 进本清单。

- **H1 自包含边界**（#59 起脚本永久守护）：本项目自包含——无迁移来源主题的残留痕迹。**定义正本 = [ADR 0003](../../docs/adr/0003-knowledge-boundary.md)**（三层模型 `source`/`agnostic`/`ds-surface` + 「出身测试」判据）；由 [check-boundary.mjs](../scripts/check-boundary.mjs)（`npm run check:boundary`，挂进 `ci`）三层 denylist 守护——`source` 层扫 `packages/react/src/**`（含测试）、禁 `animal`/旧包名/**全部站名（含当下 active）**/源 hex（比外层严，因站会换）；站名一律 `resolveSite` 动态取、脚本零写死站名（H1 自测）；豁免 `sites/*/` + `demo/` + study 侧迁移笔记/历史。
- **H2 角色契约稳定**：`--stitch-*` 角色变量名是公开 API，改名 = 破坏性变更。组件/页面**只读角色变量**，不读长相变量、不硬编码主题值（hex/圆角/字体）。见 [contract.css](../packages/tokens/contract.css) + [design-rules.md](./design-system/design-rules.md)。
- **H3 skill self-contained**（#33 起有脚本永久守护）：skill 内零外链、每个值嵌在 `references/`，换主题散文零改动。由 [check-skill.mjs](../scripts/check-skill.mjs)（`npm run check:skill`，挂进 `ci`）把 [skill-acceptance.md](./contributing/skill-acceptance.md) 的机器档固化成断言并永久守护——自包含 grep（无外链 / 无出 skill `../` / 无外来 `--*-` 前缀 / 无 `refero` 源残留）+ tokens==`mergeTokens`(+H4) + rules/design-rules 逐字节 + SKILL.md 规格（name/desc≤1024/<500行/<5000token/引用一层深）+ props==源 + 幂等 + 换主题 diff 收敛 + `skills-ref validate`。见 [skill-build-pipeline.md](./contributing/skill-build-pipeline.md)。
- **H4 生成 tokens 不变量**（#2 引入）：`mergeTokens` 合并出的 tokens 恒满足——**单一 `:root`** + 首行 **`DO NOT EDIT`** 头 + **派生 `color-mix()` 原样保留**（不求值成 hex）+ **生成物永不手改**（默认落点 `packages/tokens/dist/` 已 gitignore、不进 git，`git check-ignore` 断言）。由 [merge-tokens.mjs](../scripts/lib/merge-tokens.mjs) 保证，[merge-tokens.test.mjs](../scripts/lib/merge-tokens.test.mjs) grep 断言。
- **H5 CI 管线存在性**（#4 引入，#33 起含 `check:skill`，#59 起含 `check:boundary`）：`npm run ci` = `format:check → check:docs → check:skill → check:boundary → lint → test:run → test:a11y → build` 八步齐备，且对**空 `packages/react`** 全绿（退出码 0）——后续每个组件 issue 的「绿」标尺。`npm run ci; echo $?` 断言。管线细节见 [sync-and-ci.md](../contributing/sync-and-ci.md)。

> 未来 Hook（到相应阶段补）：**check:docs 覆盖 teeth**（组件 ↔ skill references 覆盖强制，脚本已随 #4 就位、空库天然过，真组件 + skill 参考到位后见效）等。

---

# 各 issue 的 prompt

> 每段自包含、整段可复制领取。`## 标题` 与 `Issue:/依赖` 行留在围栏外。**新 ready issue 照下方「模板骨架」填空——固定行逐字保留、只改 `<...>` 填空处；别凭记忆重写固定行。**

## 模板骨架（新 ready/AFK issue 照此填空）

真正的执行 prompt = `>` 副标题下面那段 ` ```text ` 围栏（完整自包含 AFK 指令）。**固定行**（先读 issue / 你在…执行 / 红线 / 验收 / 两块表 / 收尾门闸）逐字照抄，只填 `<...>`。完成 issue 时把这段 ` ```text ` 执行 prompt「替为 ✅ 完成小结」（做了什么 / 验收 / 迁移笔记 / 给后续）——所以已完成的段里看不到执行 prompt，别拿完成态当范本。[study] 迁移 issue 用 [根那份](../../docs/issue-management.zh-CN.md) 的模板（执行目录=仓库根、读 repos/animal）。

````text
## #<N>（AFK）：<短标题>

> <一句副标题：做什么 = A + B + C>

```text
先读 issue（规范正本）：GH_CONFIG_DIR=~/.config/gh-linling9025 gh issue view <N> --comments
你在【stitch-design-system/】执行（先 pwd 确认结尾 /stitch-design-system）。gh 一律 GH_CONFIG_DIR=~/.config/gh-linling9025。

目标：<一段：端到端做成什么>。照 <哪份文档 §几> 执行，本段不复述步骤。

<（可选）本 issue 特殊点 —— …>

红线（结构 Hook，须全绿，可 grep）：<H几：一句>；<H几：一句>；<无 emoji/裸 svg/Unicode（如涉 UI）>。

验收（真实验收禁糊弄；测试不过度=一个 case 够证）：
1. <…>
2. <…>
3. 过 #29 skill-acceptance.md 的 <对应节>。
4. 执行报告两块表：① 结构 Hook（<H几…>）全 🟢；② 真实 case dry_run（<一个 case 的开篇+结尾>）🟢。

收尾门：用户验收通过后才 commit(#<N>) + close + GH 评论登记两块表。未验收不 commit、不 close。AFK 独跑不停确认 seam（seam = 结构 Hook + 文档声明的对外契约）。
```

Issue: https://github.com/linling9025/design-system-study/issues/<N>
依赖：<#前置 / 无，可立即领取>。
````

---

## #1（已完成 ✅）：接入新站 seline —— 产出 adapter.css + rules.md

> 首次跑通 onboard-site playbook：`sites/seline/adapter.css` + `sites/seline/rules.md` 就位，H1/H2 结构 Hook 全绿，可复用性成立（无站专属脚本，未来站照 [onboard-site.md](../contributing/onboard-site.md) 再跑）。复核裁决：`--stitch-accent-text` 白 → `#0c0a09`（AA 2.65→7.44:1）。领取/复核 prompt 已收入 [onboard-site.md](../contributing/onboard-site.md) 派发段，本段不再留一次性 prompt。

Issue: https://github.com/linling9025/design-system-study/issues/1（closed）

---

## #2（已完成 ✅）：mergeTokens + stitch.config.json + build-tokens.mjs

> ✅ 已完成并 close（commit 37d6f64，2026-08-22）。构建时切主题的确定性合并核心就位、端到端可验：`mergeTokens(contract, adapter, site)`（[merge-tokens.mjs](../scripts/lib/merge-tokens.mjs)，postcss 插入序 Map + adapter 同名覆盖 + 派生 `color-mix()` 原样 + 单 `:root` + `DO NOT EDIT` 头）、`stitch.config.json`（`activeSite` 唯一真相，ADR 0007）、`build-tokens.mjs`（薄 runnable，`--site`/`--out` 可覆盖，默认落 gitignore 的 `packages/tokens/dist/`）。`node --test` 12/12 绿；新增结构 Hook **H4**（生成 tokens 不变量）。下游解锁：包的 vite 插件与 skill 的 `build:skill` 都直接 `import { mergeTokens }`（见 [skill-build-pipeline.md](../docs/contributing/skill-build-pipeline.md) §6.6）。

Issue: https://github.com/linling9025/design-system-study/issues/2（closed）

---

## #3（已完成 ✅）：立起 demo 可导航平台（工具链 + 换肤外壳 + 族表派生侧栏导航）

> ✅ 已完成并 close（commit 7c39950，2026-08-23）。本地 demo 从「最小渲染台」升级为**可导航平台**：工具链从白纸重装（vite + react + ts + less + @vitejs/plugin-react，`npm run dev`）；**方案 B 换肤外壳**（侧栏 + 顶栏 + 内容区 + hash 路由 `#/xxx`）外壳/侧栏/组件一律只读 `var(--stitch-*)`，切 `activeSite` **整站（含侧栏）换肤**，默认站 seline，引源不引 `dist/` 产物；**站点切换器** `import.meta.glob` 动态扫 `sites/*/adapter.css` 原文 + `:root→[data-site=x]` 作用域化（只在 demo 侧内存，源保持纯 `:root`），挪进顶栏；**族表落成真文件** [scripts/component-families.md](../scripts/component-families.md)（与 `build:refs` 同源），**侧栏 = 族表 ∩ `demo/components/*` 自动派生**（空族不显示、丢文件夹即自动上架、不齐 warn）。同步 [demo-site.md](./contributing/demo-site.md)（升级为可导航平台三节）+ [CONTEXT.md](../CONTEXT.md)（新增「Demo 站（可导航平台）」术语）。真实浏览器验收：seline render / 切 steep 整壳换肤 / 新建 demo 自动上架 / hash 路由全绿；结构 Hook **H1/H2** 全绿；`tsc --noEmit` 0 error、merge-tokens `node --test` 12/12 绿。一次性验证件（button/card）验收后按用户裁决删除；下游解锁 #4 组件基建 bring-up 与 #5+ 真组件在此平台上架。

Issue: https://github.com/linling9025/design-system-study/issues/3（closed）

---

## #4（已完成 ✅）：组件基建 bring-up —— npm run ci 对空库跑绿

> ✅ 已完成并 close（commit `cf2a65f`，2026-08-23）。为所有组件 issue（#5–#27）立起「绿」标尺：`npm run ci` = `format:check → check:docs → lint → test:run → test:a11y → build` 六步齐备，对**空 `packages/react`** 退出码 0（结构 Hook **H5**）。
>
> **管线**：Prettier（`format:check`，`packages/tokens`/`*.md` 除外——护 H4 单行 `color-mix`）· `check:docs`（[check-docs.mjs](../scripts/check-docs.mjs) 存在性检查，空库天然过）· **oxlint + tsc**（`lint`，非 eslint——本仓库 TS 7 而 typescript-eslint 尚不支持，oxlint 原生解析 TSX）· **Vitest 4 + jsdom**（`test:run`=unit project / `test:a11y`=a11y project + vitest-axe，复用 vite 转译管线）· **Vite Library + preserveModules**（`build`）。空桶 [index.ts](../packages/react/src/index.ts) + [tsconfig](../packages/react/tsconfig.json)；`@stitch/react` 别名双解析（[vite.config](../vite.config.ts) alias + [tsconfig](../tsconfig.json) paths）；[.githooks/pre-commit](../.githooks/pre-commit) 跑完整 ci、禁 `--no-verify`（挂载 `git config core.hooksPath stitch-design-system/.githooks`）。
>
> **真实验收**：`npm run ci` 空库六步全绿（EXIT 0）；`import from '@stitch/react'` 在 tsc + vite build 均解析（临时探针验后删）；unit/a11y project 分离 + `axe()` 真断言（探针）；pre-commit 直跑 ci EXIT 0；H1 grep 自包含全过、H4 单测 12/12 不破。管线细节见 [sync-and-ci.md](../contributing/sync-and-ci.md)。
>
> **发布名已收敛（#56）**：`packages/react/package.json` name + 双别名（vite/tsconfig）+ skill import + [packaging.md](../contributing/packaging.md) 发布名统一为 scope 名 `@octohirono/stitch-design-system`（[ADR 0008](./adr/0008-distribution-and-package-name.md)，占位 `@stitch/react` 废弃）；dts + 主题虚拟模块仍属「人工一次性发布配置」，留未来打包 issue。下游解锁 #5 Icon（首个真组件 + `build:refs`）。

Issue: https://github.com/linling9025/design-system-study/issues/4
依赖：无，可立即领取；但它是 #5–#27 所有组件 issue 的前置。

> **迁移组件 issue（#5–#27）是 [study]**，prompt 在根 `docs/issue-management.zh-CN.md`（要读 `repos/animal`，在根目录执行）。

---

## #28（已完成 ✅）：修复填充控件焦点环与填充同色 → 键盘焦点不可见

> ✅ 已完成并 close（commit `9b873eb`，2026-08-26）。primary Button 及 checked 的 Switch/Checkbox/Radio 用 accent 铺底、focus-ring 派生自 accent → `:focus-visible` 只写 `outline` 会同色隐没（#24 Modal demo 的"聚焦不上去"实为焦点已到、环看不见）。按 [design-rules.md](./design-system/design-rules.md) **规则 7**，填充态改叠内圈 `bg-elevated` 的**间隔环** `box-shadow: 0 0 0 2px var(--stitch-bg-elevated), 0 0 0 4px var(--stitch-focus-ring)` 把 accent 环与 accent 填充隔开；只落 4 处 `:focus-visible`——Button `.btn-primary:not(.btn-ghost)`（排除透明填充 ghost-primary）、Switch `.checked`、Checkbox/Radio `input:checked`；**未动基类 `:focus-visible`**，非填充控件（default/ghost/text 按钮、input）`outline` 原样保留。四组件补 a11y 焦点可见性断言（读编译前 `.module.less` 原文，断言含间隔环 + 非填充态不回退）。规则 7 正本 + 提交前清单项落地。**① 结构 Hook**：H2 只读 `var(--stitch-*)`（4 处 spacer 仅 `bg-elevated`+`focus-ring`，无 hex/圆角/字体/长相变量）🟢、H1 自包含 🟢、无 emoji/裸 svg 🟢、`npm run ci` 全绿（unit 317 / a11y 69 / build）🟢。**② 真实 case dry_run**（真实浏览器切两站、键盘聚焦）：seline primary 焦点环 vs 页面底 **7.91:1**、steep **17.61:1**（两站 ≥3:1）🟢；checked Switch/Checkbox/Radio 两站均渲染间隔环 🟢；非填充 `default` 按钮保留 `outline 2px accent` 不回退 🟢。知情项：seline 内圈 spacer(白) vs 填充(浅蓝 accent) = 2.65:1（略低 3），但焦点环本体对页面底 ≥3:1、肉眼清晰，规则 7 未对内缝单设阈——按写法正本原样实现，经用户 demo 验收接受。

Issue: https://github.com/linling9025/design-system-study/issues/28

---

## #29（已完成 ✅）：立 skill 结构验收标准 `skill-acceptance.md`

> ✅ 已完成并 close（commit `7a35b0f`，2026-08-27）。建 `docs/contributing/skill-acceptance.md` 作 steep skill 结构验收唯一入口——认证「按规格造好、没坏」，不认证「好不好用」（eval 另立）。骨架：runbook（验收 = **只读判断**、零 build/git）+ 逐产物 9 节（每节 4 栏表、**机器档在前**）+「与 check:skill 的关系」。合 pipeline 结构约束 + agentskills 官方规格/最佳实践（联网核对硬数字：name==父目录名、desc≤1024、<500行/<5000token、引用一层深、`skills-ref validate`）。**本轮与用户逐条敲定、推翻部分原 issue 措辞**：① 验收 = 只读裁判——拿产物跟源/规格比（静态 grep/wc + 纯函数 `mergeTokens`/`renderCatalog`/抽 props 算期望再比），**绝不跑 `build:*`、不动 git**；② 「幂等 / 换主题隔离」非跑构建不能验 → 归**构建流水线测试**、移出本验收（原 issue「流程级三条」里这两条被推翻，`skills-ref validate` 留 runbook 步骤 1）；③ 类型三档（机器→check:skill / agent判 / 人签）；④ 自包含——只引仓库内文件、不绑临时 tracker、不写死 `activeSite`。同步：pipeline §五 缩指针、contributing/README 加索引。**经独立评审两轮复核**（找出并修掉约 11 处逻辑错：验收里的 build 调用、空转 diff、grep 假阳/假阴、流程级归属矛盾、tracker 耦合等），判**无逻辑矛盾**。**留给下游的 pipeline 待修项**：#7 catalog 格式（§6.3 `renderCatalog` 输出 vs §3.1 权威 catalog 打架）、#6 blurb 槽标记（frontmatter 里 HTML 注释不可行）——本文机器档已依赖其修正，交 #30/#32 带走。**① 结构 Hook**：H1 自包含（grep 无出 skill 的 `../../../`/父仓库路径/animal/tracker `#N`/写死 `steep`）🟢、`npm run ci` 全绿（pre-commit：format / check:docs / lint / unit 412 / a11y / build）🟢。**② 真实 case**：skill-acceptance.md 就位（166 行、runbook + 9 产物节 + 关系节）🟢、每节四栏齐 + 类型只三档 + 机器档在前 🟢、抽查 §1 SKILL.md 节覆盖 agentskills 全部硬规格 🟢。

Issue: https://github.com/linling9025/design-system-study/issues/29

---

## #30（已完成 ✅）：摘出 3 份主题中立固定文件 ← pipeline §3.1–3.3

> ✅ 已完成并 close（2026-08-27；摘录 = 本 `docs(#30)` 提交，`build:refs` 行闸修复见 commit `6315ea9`）。从 [skill-build-pipeline.md](./contributing/skill-build-pipeline.md) §3.1–3.3 摘出三份主题中立固定文件：[SKILL.md](../skills/stitch-design-system/SKILL.md)（§3.1 骨架——把「steep 填好」示例还原成空槽，`<!-- SLOT:description -->`/`style-paragraph`/`catalog` 三对标记齐、desc/style 槽内空，值留给 #32 `build:skill` 与已有 `build:refs` 填；scenario 表 / Design tokens 说明 / Hard rules 指针照 §3.1 落）、[react-project.md](../skills/stitch-design-system/references/react-project.md)（§3.2 逐字）、[standalone-html.md](../skills/stitch-design-system/references/standalone-html.md)（§3.3 逐字，主题值靠引用不内联）。README 未动。**期间发现并单独修掉 `build:refs` 行闸缺口**（commit `6315ea9`）：大族被物理分片成 `<族>-2.md` 而 catalog 只链 part-1、part-2 够不着 → 改一族一文件、去 200 行闸（见 [sync-and-ci](./contributing/sync-and-ci.md) / [skill-acceptance §5](./contributing/skill-acceptance.md)）。**① 结构 Hook**：H1/H3 自包含（grep 无 raw.githubusercontent/github.com 外链、无出 skill 的 `../..`、无 `--非stitch-*` 前缀、无源主题残留 steep/signifier/peach/refero）🟢、`npm run ci` 全绿（pre-commit：format / check:docs / lint / unit / a11y / build）🟢。**② 真实 case**：三文件就位、SKILL.md 三对 SLOT 齐且 desc/style 槽空（65 行 <500、body ~811 token <5000、引用一层深）🟢；自包含 grep 全过 🟢；重跑 `build:refs`——catalog 槽注入且与 README 同一份、重跑幂等（diff 空）🟢。下游解锁：#31 `build:blurb` 生成两槽文案、#32 `build:skill` 注入 desc/style 两槽 + 生成 `references/theme/*`。

Issue: https://github.com/linling9025/design-system-study/issues/30
依赖：#29。

---

## #31（已完成 ✅）：`build:blurb` + `sites/steep/skill-blurb.md`

> ✅ 已完成并 close（2026-08-27）。实现 `build:blurb`（[scripts/build-blurb.mjs](../scripts/build-blurb.mjs) + `package.json` 脚本）：确定性抽 steep `DESIGN.md` 三段（副标题 / style 段 / Do's & Don'ts）→ 填 §4.4b 固定 prompt → LLM → 解析 + 机检 → 冻盘 [sites/steep/skill-blurb.md](../sites/steep/skill-blurb.md) 两段 `## description` / `## style-paragraph`（§4.4c 格式）。先落 `extractDesignSections`（[scripts/lib/design-sections.mjs](../scripts/lib/design-sections.mjs)，§6.4）+ smoke test。**确定性子函数**（`buildPrompt`/`parseBlurb`/`lintBlurb`/`renderBlurbFile`）单测覆盖、**LLM 那步隔离在 `callLLM`**（默认 `claude -p`；`--from FILE` 走既有 agent 输出、`--prompt-only` 只印 prompt）；产物非确定 → **冻盘 + 人审 + 绝不进 build:skill**（否则每次 build 重掷骰子破坏幂等）。头注 `Status: human-approved`（人签唯一闸），draft 态不带该标记（grep 兜底）。**① 结构 Hook**：H1 自包含（pipeline 脚本 grep 无 peach/hex/Signifier 等主题长相；产物 grep 无 hex）🟢、`node --test` 两套件 16/16 绿、prettier + check:docs 干净 🟢。**② 真实 case**：`build:blurb` 对 steep DESIGN.md 跑出 skill-blurb.md、仅两段顺序对 🟢；机器档 无 hex / description 324 ≤1024 / style-paragraph 一段 🟢；agent判 忠于 DESIGN.md（每句可溯源、无杜撰、无借别站、描述为 THE style）+ 人签定稿 🟢。判断点：description 取单物理行（frontmatter 惯例、硬机器档只 ≤1024 + 无 hex），经用户接受。下游解锁：#32 `build:skill` 读这两段注入 SKILL.md 的 description / style-paragraph 两槽。

Issue: https://github.com/linling9025/design-system-study/issues/31
依赖：#30（SKILL.md 槽就位，明确注入契约）。

---

## #32（已完成 ✅）：`build:skill` → 生成 `references/theme/*` + 注入风格两槽

> ✅ 已完成并 close（2026-08-27）。实现 `build:skill`（[scripts/build-skill.mjs](../scripts/build-skill.mjs) + `package.json` 脚本）：纯确定/幂等的文件编排——读 `stitch.config.json` `activeSite`（`--site` 可覆盖），做三件事：① `mergeTokens(contract, sites/<site>/adapter.css, site)`（复用 #2 的 [merge-tokens.mjs](../scripts/lib/merge-tokens.mjs)）→ [references/theme/tokens.css](../skills/stitch-design-system/references/theme/tokens.css)；② `copyFileSync` 逐字节拷 [design-rules.md](../docs/design-system/design-rules.md) + `sites/<site>/rules.md` → `references/theme/`；③ `parseBlurb`（复用 #31 的 [build-blurb.mjs](../scripts/build-blurb.mjs)）读 [skill-blurb.md](../sites/steep/skill-blurb.md) 两段 → `replaceSlot` 注入 SKILL.md 的 `SLOT:description` / `SLOT:style-paragraph`。**LLM 那步已隔离在 #31 build:blurb（冻盘），build:skill 只读产物**——这是幂等与「换主题其余 diff 空」立得住的关键。`buildSkill({root,site,skillDir})` 抽成可注入 skillDir 的纯编排、`main` 薄壳（测试进临时 skillDir、不碰正本）。**期间发现并修掉一个真 bug**：`replaceSlot` 丢弃开/闭标记间的空白，导致注入 `description: >` YAML 块标量时闭合标记落到 0 缩进、块标量提前结束 → 给 `replaceSlot` 加可选 `indent` 参数（注入体与闭合标记同缩进 4 空格），[slot.test.mjs](../scripts/lib/slot.test.mjs) 补两 case。**① 结构 Hook**：H4（单 `:root` + 首行 `DO NOT EDIT` + 17 处 `color-mix()` 原样未求值 + 全 `--stitch-*` 前缀）🟢、H3 自包含（`references/theme/` grep 无外链、SKILL.md 无 hex、两槽只招牌尺寸不内联值）🟢、`node --test` 45/45 绿 + prettier 干净 🟢。**② 真实 case**：`build:skill` 跑通、三产物就位 🟢；tokens.css == 复算 `mergeTokens`（EQUAL）+ design-rules/rules 与各自源 `diff` 空 🟢；两槽 == skill-blurb.md 两段逐字（无 `【槽】`残留、YAML 缩进合法）🟢；幂等（重跑 4 文件 shasum 逐字节同）🟢；换主题 diff 收敛（换 seline 重跑仅 `SKILL.md` 两槽 + `theme/tokens.css` + `theme/rules.md` 变，`design-rules.md`/README/`components/*`/固定模板 diff 空；测后还原 steep、无残留）🟢；过 #29 skill-acceptance theme 三节 + 流程级 🟢。这是首份端到端可安装的 steep SKILL.md。下游解锁：#33 `check:skill` 把机器档固化成 CI（要完整 steep 产物才能验）。

Issue: https://github.com/linling9025/design-system-study/issues/32
依赖：#30、#31。

---

## #33：`check:skill` 固化机器档验收 + 挂 CI（守护 H3）

> ✅ 已完成并 close（commit `b991fec`，2026-08-27）。把 #29 [skill-acceptance.md](./contributing/skill-acceptance.md) 九节机器档固化成 [scripts/check-skill.mjs](../scripts/check-skill.mjs)（`npm run check:skill`，挂进 `ci` 第三步、`check:docs` 之后），共 40 条断言、每行带 `[§N]` 标签可回溯某节机器档：skills-ref validate（本地 bin，缺失报清晰错误不静默跳过）· §1 SKILL.md 规格（name==父目录名/字符合法/desc≤1024/<500行/<5000token/引用一层深/自包含 grep/两槽注入·无占位/catalog==renderCatalog）· §2 README catalog 平价+自包含 · §3/§4 主题无关 grep（hex/引号字体族/clip-path/box-shadow/出 skill 链）· §5 一族一文件·无 `<族>-N.md` 分片 + **props==源**（ts-morph 复算、共用 [scripts/lib/props.mjs](../scripts/lib/props.mjs)）+ 生成块无 hex · §6 tokens==`mergeTokens` + `DO NOT EDIT` 头 + 单 `:root` + 全 `--stitch-` + H4 派生 color-mix 逐项未求值 · §7/§8 逐字节拷贝 · §9 blurb 两段+hex+形态 · 幂等 + 换主题 diff 收敛（temp 目录构建、不碰真 skill/git）。**读-only 裁判**：拿产物跟源比，纯函数复算期望、不跑 `build:*` 编排、不动 git。**新 devDep**：`skills-ref@0.1.5`（pinned，官方 frontmatter 校验器）+ `gpt-tokenizer@4.0.0`（<5000token 固定分词器，纯 JS，不进运行时、不破「唯一运行时依赖 radix」）。**props 抽取提到 lib**（build:refs 与 check:skill 共用同一份，#29 §Runbook「别各写一份」防期望值漂移，build:refs 产物逐字节不变、`node --test` 45/45）。**补齐 seline 第二完整主题**（[sites/seline/skill-blurb.md](../sites/seline/skill-blurb.md) 人签定稿）使换主题 diff 收敛可真跑 steep↔seline。**守护脚本上线即抓到并修两处 doc↔现实漂移**：① README 曾有出 skill 的 `../../docs` 外链 → 改自包含；② §5「components 无 hex」限定生成 ```ts/```tsx 块——迁移 Notes 散文合法含源 hex 溯源（`#725d42 → --stitch-text-*`），别对整文件 grep hex（误红）。**① 结构 Hook**：H3 从「阶段激活」转脚本永久守护（登记进本文件顶部清单）、H5 更新为含 check:skill 的七步、H1 自包含（脚本零写死站名，走 `resolveSite`）、H4（§6 单 `:root`+`DO NOT EDIT`+派生 color-mix 逐项未求值）🟢。**② 真实 case**：steep skill **40/40 passed EXIT 0** + `npm run ci` 七步全绿（pre-commit）🟢；四破坏演示各触发对应断言红——外链→`✗[§1]`、改 token→`✗[§6]`、SKILL>500行→`✗[§1]`、props 漂移→`✗[§5] Button.ButtonProps` 🟢；skills-ref 缺失报清晰错误非误红 🟢。**skill 阶段（#29–#33）结构层收官**；「好不好用」的 eval（触发 eval + 装/不装对比）留作后续 issue。

---

## #34（已完成 ✅）：build:refs 抽 interface 级 JSDoc（废 notes.md 机制）+ Card tracer bullet

> ✅ 已完成并 close（commit `c5b95eb`，2026-08-28）。「组件注意事项」的来源从 `notes.md` 旁挂件转向源码 interface 级 JSDoc：**使能改动**——[scripts/lib/props.mjs](../scripts/lib/props.mjs) 的 `extractPropsInterfaces` 每条 `*Props` 多带 `note`（主 interface 头顶 JSDoc，`getCommentText()`），`text` 仍为 verbatim body（ts-morph 排除头顶 trivia）故 **§5「props==源」逐字节不破、note 不重复**；[build-refs.mjs](../scripts/build-refs.mjs) 把 note 渲染到 ```ts``` 块后、**与 notes.md 并存过渡**（已迁组件只出 JSDoc note、未迁只出 notes.md，任一时刻零组件断文档；旁挂读取分支留 #37 删）。共用 lib 一处改、两边期望同步不漂（H3）。**Card 当 tracer bullet 走完全链路**：`CardProps` 头顶写纯 A 类跨-prop JSDoc（文字色/面色分离保证可读 ≥AA、可聚焦焦点环走 `--stitch-focus-ring`、`color`×`variant` 正交）、删 `Card/notes.md`；per-prop 注意事项本已在字段 JSDoc（`iface.getText()` 带出、零改动）；**B 类**（12 长相名 + 13 花纹丢弃、seline 逐字规格、实测 hex 2.29<AA、`--animal-*` 映射、H1 自称）原 #14 已完整落 [`../迁移笔记.md`](../../迁移笔记.md) §Card ①–④，本次核验零丢、未改该文件。**① 结构 Hook**：H1 自包含（Card 源 JSDoc + 渲染 note grep 无 `animal/seline/steep/源hex/--animal-/手册`）🟢、H3 skill 守护（`check:skill` 40/40）🟢、无 emoji/裸 svg/Unicode 🟢、`npm run ci` 全绿（412 tests / 23 files / build ✓，pre-commit）🟢。**② 真实 case dry_run**：真跑 `npm run build:refs`（23 组件 / 8 族文件）→ Card note **来自 JSDoc 且洗净**、`git diff --stat` refs **仅 layout.md 变**且 diff **仅 Card 段**（Divider 等 15 组件仍出各自 notes.md、零回归）、build:refs 两跑 md5 同（幂等）🟢；`check:skill` **40/40 EXIT 0**（含 §5 一族一文件 / props==源 / 无 hex）🟢；`node --test` 47/47（新增 [props.test.mjs](../scripts/lib/props.test.mjs) 2 例：主 interface 头顶 JSDoc→note 且不入 verbatim text / 无 JSDoc→note 为空串）🟢。**给后续**：#35 沿本机制迁其余 12 组件、#37 删 notes.md 读取分支 + §5 边界守护收紧。

---

## #35（AFK）：其余 12 组件 notes.md → 源码 JSDoc 迁移

> ✅ 已完成并 close（commit `2bdba2a`，2026-08-28）。沿 #34 机制把其余 12 组件（Tabs/Select/Tag/Tooltip/Radio/Input/Checkbox/Collapse/Image/Table/Divider/Switch）的**组件注意事项**从 `notes.md` 旁挂件转到源码 `XProps` 头顶 interface 级 JSDoc：**A 类跨-prop 注意事项**（受控/非受控双模式、键盘/a11y role、图标走 `<Icon>`、可读性护栏、纯实现 gotcha 如 Switch `text-box trim-both`、跨-prop 结论如 Table 纯展示无排序 / Select 正下方展开）洗净后写进 JSDoc；**per-prop 注意事项**本已在字段 JSDoc（`iface.getText()` verbatim 带出、零改动）；删该 12 个 `notes.md`（`find packages -name notes.md` 仅剩 Button/Icon/Notification——Notification 归 #36）。**B 类迁移由来**（`animal`/`Animal Crossing`、源写死 hex 及映射、`--animal-*` 映射表、`§9.5.1`/`手册第N步`、去品牌招牌值丢弃清单、`animal-x-→stitch-x-`、H1 自称、跨站枚举）洗出源码 → 落 [`../迁移笔记.md`](../../迁移笔记.md)：**#15 Collapse、#16 Tabs 新建审计段**，其余 9 组件（#7–#13/#17/#18/#23）经签名 hex/关键词逐段核验 B 已在既有段、零丢不重复；另洗净 2 处源码残留 B（`Image.tsx` 注释、`Divider.tsx` 类型别名 JSDoc）。build:refs 经 [props.mjs](../scripts/lib/props.mjs) 的 `note`（`getCommentText()` 去 @tag）把 JSDoc 渲染为 ```ts``` 块后散文，`text` 仍 verbatim（头顶 trivia 排除）故 **§5「props==源」逐字节不破**。**① 结构 Hook**：H1 自包含（12 组件 `*.tsx` grep 无 `animal/--animal-/Animal Crossing/seline/steep/refero`）🟢、H3 skill 守护（`check:skill` **40/40 EXIT 0**，含 §5 一族一文件 / props==源 / 生成块无 hex）🟢、无 emoji/裸 svg/Unicode 🟢、`npm run ci` 全绿（format→check:docs→check:skill→lint→测试→build，**EXIT 0**）🟢。**② 真实 case dry_run（重组件 Tabs）**：真跑 `npm run build:refs`（23 组件 / 8 族文件）→ `## Tabs` note **来自 interface JSDoc**（notes.md 已删）、grep `animal/源 hex/他站名/§9.5/手册/迁移笔记` **CLEAN** 🟢；`check:skill` **40/40** 🟢；12 组件生成段逐一确认 note 已渲染且无 B 泄漏。**给后续**：#37 删 notes.md 读取分支（本片后 build-refs.mjs 的 notes.md 并存分支已无 stitch 组件使用，仅 Button/Icon/Notification 走它）+ §5 边界守护收紧。范围外的 `feedback.md`（Loading #19/Skeleton #20 字段 JSDoc 残留 animal）未动。

Issue: https://github.com/linling9025/design-system-study/issues/35
依赖：#34（机制 + 迁移手法样板）。

---

## #36（AFK）：命令式 API 统一做法 —— Notification 走 *Config/*Static 抽取

> ✅ 已完成并 close（2026-08-28）。给命令式 API 组件一条统一的路：**拓宽 build:refs 抽取**——[props.mjs](../scripts/lib/props.mjs) 的 `extractPropsInterfaces` 从「单文件读 `*Props`」改为「**扫整个组件目录**（path-sorted 确定性）读 `*Props` + 命令式面 `*Config`/`*Static`、跳 `@internal`」，接受多文件数组；命令式面（无 `<X>Props` 主接口）由 `*Config`/`*Static` 头顶 JSDoc 承载 note，子部件 Props 仍 API-only。**build:refs 与 check:skill §5 共用这一 lib**（各自同样扫目录传入），期望值不漂。TDD 一个 case（tracer red→green）证之：`*Config`/`*Static` 跨文件抽、`@internal` 跳、命令式面带 note、Config 字段 verbatim。**Notification 真身 API 落源码**：`NotificationStatic` 头顶 JSDoc 扩成完整命令式说明（`.success/.info/.warning/.error/.open/.destroy` 调用形态 + string 简写 + 默认 top/4.5s/key 更新 + 图标走 `<Icon>` 无 emoji + 「**不是 JSX 组件、调用不渲染、自挂 Portal + aria-live**」）；`NotificationViewProps` 加 `@internal` 标注（「非公开面，标注清楚」→ 不进参考、仅在散文提及为内部视图）；`NotificationConfig` 本已导出、字段 JSDoc `iface.getText()` verbatim 带出。**删 `Notification/notes.md`**（其内容纯 API、无 B 类迁移由来，无需搬 `../迁移笔记.md`）。**顺带修潜伏 bug**：统一的多文件扫描让 **Form** 的 `FormProps`/`ColProps`/`FormItemProps`（本在 `types.ts`、旧逻辑只读 `Form.tsx` 故一直漏在参考外）补全进 `Form.md`（+99 行 verbatim，§5 已校）——「命令式无小灶、一条统一的路」的正确副产物，非特判。**doc 同步**（权威顺序）：[skill-acceptance.md §5](./skill-acceptance.md)、[skill-build-pipeline.md §4.3](./skill-build-pipeline.md)、build-refs 头注 全部从「只读 `<X>Props`/`<X>.tsx`」更新为「扫目录抽 `*Props`/`*Config`/`*Static`、跳 `@internal`」。**① 结构 Hook**：H1 自包含（`Notification.md` grep 无 animal）🟢、H3 skill 守护（`check:skill` **40/40 EXIT 0**，§5 props==源 覆盖新拓宽的 Config/Static）🟢、无 emoji/裸 svg/Unicode 🟢、`npm run ci` 全绿（**EXIT 0**）🟢。**② 真实 case dry_run**：真跑 `npm run build:refs`（23 组件 / 8 族文件）→ `Notification.md` 含 `NotificationStatic` 真身签名 `success: (config: NotificationConfig | string) => void;` + 用法 `Notification.success(config | string)` + Config 字段块 + 「命令式非 JSX」说明、**无 notes.md 残留、grep 无 animal**、幂等（二次重跑 diff 601/601 不变）🟢。**给后续**：#37 删 build-refs 的 notes.md 并存分支（本片后仅 Button/Icon 走它）+ §5 边界守护整文件 grep 收紧；范围外的 `feedback.md`（Loading/Skeleton 字段 JSDoc pre-existing animal provenance，HEAD 已存在）未动。

Issue: https://github.com/linling9025/design-system-study/issues/36
依赖：#34（机制）。可与 #35 并行。

---

## #37（AFK）：移除 notes.md 读取路径 + §5 边界守护收紧 + doc 同步

> ✅ 已完成并 close（commit `4ba8e53`，2026-08-28）。收口：拆过渡脚手架 + 把边界永久上锁 + 作者规则前摄化。**① 删读取路径**——[build-refs.mjs](../scripts/build-refs.mjs) 删 `notesPath`/`readFileSync(notes)`/`renderComponentSection` 的 notes 分支，组件注意事项**单一来源 = 源码 interface 级 JSDoc**；`find packages -name notes.md` **零命中**（末两个 Button/Icon 的 notes.md → 主接口头顶 JSDoc 后删除；洗净 `Loading`/`Skeleton` 字段 JSDoc 的「源 animal 已归一」溯源——该溯源已存于 [`../迁移笔记.md`](../../迁移笔记.md) #19③/#20④，只删不搬、未动 study 侧）。**② §5 守护收紧**——[check-skill.mjs](../scripts/check-skill.mjs) §5 从「只扫生成 fence 的 hex」改为 `references/components/*.md` **整文件** denylist grep：`animal`/`--animal-`/`Animal Crossing` + 源 hex + 非 active 站名（站名动态取 `sites/` 去 `activeSite=steep`）。这条让「边界越界」下次 CI 直接红。**③ doc 同步（按读者裁剪）**：[skill-acceptance.md §5](./skill-acceptance.md) 只留整文件判据（史/理由不入检查规范）；[skill-build-pipeline.md §4](./skill-build-pipeline.md) 改述为 interface JSDoc 抽取（命令式走 `*Config`/`*Static`）；[component-authoring.md](./component-authoring.md)（Props Interface 段）+ [add-new-component.md](./add-new-component.md)（必备清单）各加**作者硬规则**（JSDoc 只写 stitch 语汇；迁移溯源/主题值/他站对比去 `迁移笔记.md`；skill 的 note 即源自这段 JSDoc），extend/prebuild 因委托 component-authoring.md 自动继承。**① 结构 Hook**：H1/H3 现由 §5 整文件 grep 永久守护（`check:skill` **40/40 EXIT 0**）🟢、无 emoji/裸 svg/Unicode 🟢、`npm run ci` 七步全绿（**EXIT 0**，pre-commit）🟢、`node --test` 48/48 🟢。**② 真实 case dry_run**：注入 `animal`（Button JSDoc）→ `✗[§5] boundary leak: general.md: animal` 🔴→洗掉复绿 🟢；补证另两向:注入源 hex `#19c8b9` → 🔴、注入非 active 站名 `phantom` → 🔴、control 清洁态 → 🟢（三向皆真红，note 全程保留）。**给后续**：管线里再无 notes.md 概念；组件注意事项单一来源 = 源码 JSDoc；animal 痕迹漏进 skill 被 CI 拦；作者从「红了才知道」升级为「指南前摄告知」。

Issue: https://github.com/linling9025/design-system-study/issues/37
依赖：#35、#36（所有 notes.md 先清空）。

---

## #56（已完成 ✅）：scope 改名 prefactor —— @stitch/react → @octohirono/stitch-design-system

✅ 已完成并 close（commit `ff81137`，2026-09-01，用户验收通过）

**做了什么**：占位包名 `@stitch/react` → 发布 scope 名 `@octohirono/stitch-design-system`（npm 强制小写故全小写）——**内部开发别名 = 外部消费名 = skill 教的 import 名，一个名字**，杜绝「源码叫 A、发布叫 B」的漂移（决策见 [ADR 0008](./adr/0008-distribution-and-package-name.md)，随本 issue 落盘）。一次性静态编辑，无模板会重新生成包名。**落点**：`packages/react/package.json` name + 开发双别名（[vite.config](../vite.config.ts) alias + [tsconfig](../tsconfig.json) paths，均解析到 `packages/react/src/index.ts`）；40 个 demo 组件从新名引真组件；源码注释（`index.ts` / `Form/index.ts`）；skill [`references/react-project.md`](../skills/stitch-design-system/references/react-project.md) 教 `@octohirono/stitch-design-system` + `/style` 且 `SKILL.md` 路由同步；文档 [sync-and-ci](./contributing/sync-and-ci.md) / [component-authoring](./contributing/component-authoring.md) / [packaging](./contributing/packaging.md)（发布名收敛）/ [skill-build-pipeline](./contributing/skill-build-pipeline.md)（内嵌 react-project 副本同步）/ [CONTEXT](../CONTEXT.md) / [multi-site-theming](./design-system/multi-site-theming.md)（`/style` 导出名）；本文件 #4 段「发布名待收敛」→「已收敛(#56)」。

**真实验收**：`npm run ci` 全绿 EXIT 0（format:check · check:docs · check:skill **41/41** · lint[oxlint+tsc×2] · test:run **551** · test:a11y **120** · build，pre-commit 复跑亦绿）。**H1 自包含**——`grep -rn '@stitch/react'` 剩项皆非活跃残留（#4 历史完成小结、ADR 决策叙述+denylist、#56/#57 tracker/prompt 描述改名本身），无一处是活的 import/config/别名。**H3 skill 守护**——`check:skill` 41/41 EXIT 0。**不动组件行为**——仅改 demo import 说明符 + 源码注释，组件库逻辑零改，551+120 测试全过。**demo import 新名解析**——tsc（tsconfig paths）+ vite build（alias）双通道均解析，否则 lint/build 报错。两块表见 GH #56 评论。

Issue: https://github.com/linling9025/design-system-study/issues/56（closed）
依赖：无，可立即领取（#57–#62 的 prefactor）。

---

## #57（已完成 ✅）：真打包构建 —— vite dts + 主题虚拟模块 + package.json 发布字段

✅ 已完成并 close（commit `f6b113c`，2026-09-01，用户验收通过）

**做了什么**：让 `npm run build` 产出真可消费的包——两件机器 + 发布字段。① [`vite-plugin-stitch-theme.mjs`](../packages/react/vite-plugin-stitch-theme.mjs)：虚拟模块 `virtual:stitch-theme`（[`src/index.ts`](../packages/react/src/index.ts) 顶部 import），构建时读 `activeSite` + **复用 [`scripts/lib/merge-tokens.mjs`](../scripts/lib/merge-tokens.mjs)**（[ADR 0007](./adr/0007-active-site-single-switch.md) 单一实现共用，包与 skill 不各写一份）把单份 `:root` 灌进 `dist/style.css`；`resolveId` 映射带 `.css` 走 Vite CSS 管线，`cssMinify:false` 保住 `DO NOT EDIT` 头 + 派生 `color-mix()` 不被求值。② [`vite-plugin-stitch-dts.mjs`](../packages/react/vite-plugin-stitch-dts.mjs)：本仓 `typescript@7` 是**原生移植版（tsgo，无 JS 编译器 API）**，`vite-plugin-dts` 用不了 → 直接调原生 `tsc --emitDeclarationOnly`（[`tsconfig.build.json`](../packages/react/tsconfig.build.json)，排除 tests），preserveModules 下逐组件出 `.d.ts`；post-emit 剥掉 `index.d.ts` 里的 `virtual:stitch-theme` import（消费者解析不到，TS2882）。③ [`packages/react/package.json`](../packages/react/package.json)：`exports.[.]` types 排 import 前 + `./style`、`files`、`sideEffects`、`publishConfig.access=public`、`radix-ui`/`clsx` deps、`react`/`react-dom` peer、去 `private`；`main`/`module`/`types` 指 `dist`。**顺带修既有缺陷**：`external` 改子路径感知正则堵住 `react-dom/client` 被打进 dist（原漏 459kB）+ 输出目录回正；根 [tsconfig](../tsconfig.json) include 纳入 `virtual-theme.d.ts`（demo 经 paths 深入 `src/index.ts` 会撞虚拟 import）。dist 不进 git、发布时现烤。

**真实验收**：`npm run build` → dist 出 **91 个逐组件 `.d.ts`**（test 泄漏 0）+ `dist/style.css` **单份真 `:root`** 带值（`--stitch-accent: #17191c`…，空 `var()` 0）。**H4**——`:root` 出现 1 次、首行 `DO NOT EDIT`、派生 `color-mix()` 逐字保留、块内 100% `--stitch-` 前缀。**H2**——未改任何组件源，`:root` 块纯净，局部别名溯源到 `--stitch-*`。**H5**——`npm run ci` 七步全绿 **EXIT 0**（pre-commit 复跑亦绿）。package.json 字段逐条核对通过、合并复用 `merge-tokens.mjs`（插件内零 postcss 重实现）。两块表见 GH #57 评论。

Issue: https://github.com/linling9025/design-system-study/issues/57（closed）
依赖：#56（已完成）。

---

## #58（已完成 ✅）：切生效主题到 seline —— 首跑换主题流程

> ✅ 已完成并 close（commit `2a33743`，2026-09-01）。首次端到端跑通 [ADR 0007](./adr/0007-active-site-single-switch.md) 换主题三步、恰好第一次用上 #57 的主题虚拟模块插件：① `stitch.config.json` `activeSite` steep → **seline**；② `npm run build:skill`（SKILL.md 两槽 + `references/theme/{tokens.css,rules.md}` 换 seline）；③ `npm run build`（插件读 `activeSite` 重烤 `dist/style.css` 的 `:root` = seline）。**未碰 #57 插件**（一次性机器，以后换主题也是这三步）。`design-rules.md` 未变（全局主题中立，符合 [skill-acceptance §7](./contributing/skill-acceptance.md)）。**① 结构 Hook**：H1 无他站残留（`grep -riE steep\|phantom\|saybriefly skills/` = 空；`peach/Signifier` 仅存于 design-rules.md 反例、非活跃残留）🟢、H3 skill 自包含 + 换主题散文隔离（`skills-ref validate` = Valid + 两槽注入 seline）🟢、H4 tokens.css 不变量（单 `:root` / 全 `--stitch-*` / 派生 `color-mix()` 逐项未求值）🟢。**② 真实 case dry_run**：切 seline 后 `npm run ci` 全绿 **EXIT 0**（`check:skill` **41/41** site=seline + 551 unit + 120 a11y + build）🟢；`dist/style.css :root` = seline（canvas `#fafaf9`、accent `#3ba6f1`）且组件编译产物 `diff -r dist/ -x style.css` = **空**、dist `:root` ≡ skill `tokens.css :root`（同 `mergeTokens`）🟢；过 skill-acceptance theme 三节（§6 `tokens==mergeTokens(seline)`、§7/§8 逐字节）🟢；demo 真实浏览器默认 seline 整站（含侧栏）换肤（开篇 + 结尾，cyan `#3ba6f1` CTA / stone-paper canvas）🟢。两块表见 GH #58 评论。

Issue: https://github.com/linling9025/design-system-study/issues/58
依赖：#57。

---

## #59（已完成 ✅）：check:boundary 边界守卫（含源码层）+ 修订 ADR 0003 三层定义 + 清源码迁移注释 + 进 ci

> ✅ 已完成并 close（commit `78f1422`，2026-09-02）。把 H1 自包含边界从「每 issue 手 grep + 仅 skill §5」升级成**全仓永久守卫脚本**，一个 PR 原子落地、一次绿。**四块**：① [ADR 0003](../../docs/adr/0003-knowledge-boundary.md) 加「H1 三层模型 `source`/`agnostic`/`ds-surface` + 出身测试」为**定义正本**（登记表 H1 + 脚本注释降成指针）；② [check-boundary.mjs](../scripts/check-boundary.mjs) 三层 denylist——`source`（扫 `packages/react/src/**` 含测试，禁 animal/旧包名/**全部站名含 active**/源 hex，比外层严）、`agnostic`（禁 animal/hex/非active站名/旧包名）、`ds-surface`（只禁 animal/旧包名，hex+全站枚举合法）；站名 `resolveSite`+`readdirSync(sites)` 动态、**脚本零写死站名**（H1 自测），豁免 `sites/*/`+`demo/`+迁移笔记/历史；③ 清 **24 源文件**注释（A 类由来删、rationale 已在 study `迁移笔记.md`（#34–#37 先例，`build:refs` no-op 证无漂移）/ B① 删 / B② 改主题中立）；④ `check:boundary` 进 ci（八步）+ AGENTS.md 去 hex 措辞 + 手册对齐主闸（`component-authoring`/`add-new-component` 边界扩到整个 src 含 `.less` 注释、`sync-and-ci` 六→八步顺带补回 #33 漏登的 `check:skill`）。**① 结构 Hook**：H1 升级+登记（脚本永久守护、正本在 ADR 0003、零写死站名）🟢、H2 源码零 hex/零站名（`grep animal|hex|站名 packages/react/src` = 0/0/0）🟢、H5 八步 EXIT 0（链含 `check:boundary ✓`）🟢。**② 真实 case dry_run**：清洁树 GREEN → 逐层破坏各 RED（source 6× / agnostic 2× / ds-surface animal RED、裸hex+active站名 GREEN）→ 还原复 GREEN，11/11 符合预期 🟢。两块表见 GH #59 评论。已知边界（未踩）：`steep` 是英文词，source 层暂未误红正常英文注释——不预开豁免。

Issue: https://github.com/linling9025/design-system-study/issues/59
依赖：#56（最终绿在 #58 后）。

---

## #60（已完成 ✅）：打包卫生 + 本地 tarball 冒烟

> ✅ 已完成并 close（commit `c6a074b`，2026-09-02）。发布卫生 + 一次本地端到端冒烟，**不发 registry**。**改动**：① `packages/react/package.json` 加 `prepublishOnly: "npm --prefix ../.. run ci"`（ci 在根，发布前自动跑全链绿才放行；`npm publish --dry-run` 可本地验 H5 而不上传）；② [packaging.md](./contributing/packaging.md) 补该字段到关键字段片段 + 新增「发布前的两道闸」（files 白名单只发 dist 的 `pack --dry-run` 核对 + 一次性 tarball 冒烟）。**① 结构 Hook**：H5——`publish --dry-run` 触发 `prepublishOnly` → 根 ci 全链（551 unit + a11y + build）EXIT 0 🟢；不发布（dry-run，无上传产出）🟢。**② 真实 case dry_run**：`pack --dry-run` = `dist/**` + `package.json` + `README.md`（184 files/88kB），无 `src/`/测试/`.less`/`.tsx`/config（仓库无 LICENSE 故未含）🟢；tarball 装 scratch app → `tsc --noEmit` EXIT 0（`.d.ts` 经 `exports.types` 解析；证伪 bad prop → TS2322/EXIT 2 → 复原 EXIT 0）🟢；`/style` 解析到带 seline `:root` 的 `style.css`（1081 token）🟢。两块表见 GH #60 评论。

Issue: https://github.com/linling9025/design-system-study/issues/60
依赖：#57、#58。

---

## #61（已完成 ✅）：.claude-plugin/ —— Claude 原生安装路径

> ✅ 已完成并 close（commit `9144da6`，2026-09-02）。仓库根加 `.claude-plugin/`，给 Claude Code 用户一条原生 `claude plugin install` 路径，与 `npx skills add`（vercel-labs/skills）并存的第二条路（[ADR 0008](./adr/0008-distribution-and-package-name.md)）。照 mattpocock/skills 结构，指向现有 `skills/stitch-design-system/`。**改动**：① `plugin.json`（name/version/description/author/homepage/repository/keywords + `skills: ["./skills/stitch-design-system"]` 指现有 skill，非新写）；② `marketplace.json`（owner + `plugins[source "./"]`）。真实验收工具 = 厂商自带 `claude plugin validate`。**① 结构 Hook**：H1 `check:boundary` 三层零越界 🟢；H3 `check:skill` 41/41 🟢；新文件纯 ASCII、无 emoji/裸svg/Unicode 🟢。**② 真实 case dry_run**：`claude plugin validate` 两清单均 passed（marketplace 零警告；plugin 仅 repo 根 CLAUDE.md 警告，与清单无关——上下文本就以 skill 承载）🟢；`skills` 路径 validate 无报错（坏路径会红）🟢；`npm run ci` EXIT 0（pre-commit 再跑全绿）🟢。安装说明落 #62 文档。两块表见 GH #61 评论。

Issue: https://github.com/linling9025/design-system-study/issues/61
依赖：#56。

---

## #62（已完成 ✅）：文档收尾 —— 装法/发布/换主题 runbook + 命令速查 + 清漂移

> ✅ 已完成并 close（commit `d2d55a7`，2026-09-02）。把文档对齐「打包+分发已成真」，并给根 README 补 operator runbook + 命令速查。**改动三块**：① **清漂移**——根 README 删「命令现状」build:blurb/build:skill「落地中」过时警告 + 步骤 5 去「编排落地中」；[packaging.md](./contributing/packaging.md) 顶部加「状态：已实现」（#57 虚拟模块 + #60 打包卫生落地）、口吻规范/未来 → 正本记录；「发布名待收敛」#56 已收敛、本次未再改。② **装法**——skill README 安装 `cp -r … ~/.claude/skills/` → `npx skills add HironoOcto/stitch-design-system`（+ `update`/`remove`）+ `.claude-plugin` 原生 `claude plugins install` 路径（自包含：无 github.com URL、无出 skill `../` 链）。③ **runbook + 速查**——根 README 新增「切换当前生效主题」（activeSite → build:skill → build）+「发布新版本包」（npm version → ci/pack --dry-run → `npm publish --access public` → tag）两节；再加「命令速查」表（全 18 scripts + pack/publish，按「改组件 / 改主题·站 / 出发布产物」分维，逐格标读写方向 + 触发文件路径）。**用户逐格抽查纠了速查表 4 处**：`build:blurb`（方向写反·真错——它产出 skill-blurb.md 不是读它）、`build:skill`（拷 vs 算·不准）、`test:units`（漏 lib + 不在 ci·不准）、`build:refs`（catalog 归属含糊——catalog 在 SKILL.md/README 非 `<族>.md`），均已改。**① 结构 Hook**：H1 `check:boundary` 三层零越界 🟢；`check:docs` 41/9 🟢；`check:skill` 41/41 🟢。**② 真实 case dry_run**：`npm run ci` 八步 EXIT 0（pre-commit 全绿）🟢；15 项文档契约 grep ALL GREEN（先 RED 12/15 → 编辑 → GREEN）🟢；README 29 条文件链接全可达、无越界词、format 干净 🟢。下游 #63（摘 repo 后重挂钩子 + npm publish + 验分发，非 AFK）。两块表见 GH #62 评论。

Issue: https://github.com/linling9025/design-system-study/issues/62
依赖：#57、#58、#61。

---

## #63（非 AFK · 摘 repo 后人做）：摘 repo 收尾 —— 重挂钩子 + npm publish + 验分发

> **非 AFK**：需独立 repo 先存在（用户摘取），且含用户手动 `npm publish`。用户把 stitch 树摘进 `git@github.com:HironoOcto/stitch-design-system.git` 后定稿分发。不加任何 GitHub Actions。

```text
先读 issue（规范正本）：GH_CONFIG_DIR=~/.config/gh-linling9025 gh issue view 63 --comments
前提：用户已把 stitch 树摘进独立 repo（stitch-design-system/ 成 repo 根、自包含）。在新 repo 根执行。

步骤：① 重挂 pre-commit 钩子 `git config core.hooksPath .githooks`（继续强制跑 npm run ci 含 check:boundary）；② 确认 repo public（npx skills add 前提）；③ 用户手动 `npm publish --access public`（scope 包首发，凭证用户操作）；④ 验分发两路：`npx skills add HironoOcto/stitch-design-system` 装上 skill、`claude plugins install` 原生路径可用。

验收：
1. 新 repo public、stitch 树在根、`npm run ci` 全绿；pre-commit 钩子重挂生效。
2. `npm publish --access public` 完成；npm 解析为 @octohirono/stitch-design-system。
3. `npx skills add HironoOcto/stitch-design-system` 装上 skill；.claude-plugin 原生路径可用。

注：本 issue 含 Prohibited/权限动作（npm publish 发布）→ 由用户执行，agent 不代发。
```

Issue: https://github.com/linling9025/design-system-study/issues/63
依赖：#56–#62，且用户先完成 repo 摘取。非 AFK、无 ready-for-agent 标签。

---

# 组件构建 issue（新仓 `HironoOcto/stitch-design-system`，编号自 #1 重启）

> 项目已摘出为独立 repo **`HironoOcto/stitch-design-system`**（见旧仓 #63）；此后组件构建 issue 建在**新仓**、编号自 **#1** 重启（与上方旧 study 仓 `linling9025/design-system-study` 的 #1–#63 撞号，靠 `Issue:` URL 区分）。gh 账号仍 `linling9025`（对新仓有 admin/push），`gh` 命令须带 `--repo HironoOcto/stitch-design-system`。
>
> **本批规划**（参考 seline dashboard 长相，`/grill-with-docs` 对齐）：日历 · 主状态 · 折线 · 柱状 · 饼。锚点决策——图表引擎 **recharts**、日历引擎 **react-day-picker + date-fns**（均按 [add-new-component §3.3](./contributing/add-new-component.md) 显式例外依赖）；**零新增契约 token**（复用 `--stitch-cat-*` + `color-mix()`）；趋势色走 `--stitch-success`/`--stitch-danger` 角色变量；图表 svg 由 recharts 出、**零手写内联 svg**；族归属 = 图表 + Stat 归新族 **data-viz**、日历归 **form-controls**、地基住 `_internal`。依赖：**#1 地基**先行，#2–#5 可在 #1 merge 后并行。

## #1（已完成 ✅）：data-viz 基建 —— recharts 换肤地基 + 依赖政策落地 + 立族

> ✅ 已完成并 close（2026-09-07）。引入 **recharts** 作图表引擎，在 `packages/react/src/components/_internal/dataviz/` 立起「图表换肤地基」三件套（私有原语，`_` 前缀 → 不进桶导出/族表/demo，供 #2–#5 复用）：**换肤桥** [`chartColors`](../packages/react/src/components/_internal/dataviz/chartColors.ts)（`catColor`/`seriesColors` → `var(--stitch-cat-1..6)`，超 6 循环，杜绝 recharts 落默认 hex）、**响应式 + a11y 壳** [`ChartFrame`](../packages/react/src/components/_internal/dataviz/ChartFrame.tsx)（`ResponsiveContainer` + `role="img"`/`aria-label` 兜底）、**统一 tooltip** [`ChartTooltip`](../packages/react/src/components/_internal/dataviz/ChartTooltip.tsx)（内容改由现有 `Card`（elevated）承载、复用其边/影/圆角/底角色变量；系列色块只吃传入的 `var(--stitch-cat-*)`）。**零新增契约 token**（复用 `--stitch-cat-*` + Card 角色变量 + `color-mix()`）。**四处宪法级文档一次做完**：[ADR 0002](adr/0002-runtime-deps.md) 补「显式例外依赖」段点名 recharts + react-day-picker + date-fns；[packaging.md](./contributing/packaging.md) external 前缀匹配加三库、recharts 入 `dependencies`（后两者随日历 #6 入）；[design-rules §3](./design-system/design-rules.md) 加「svg 数据几何受认证例外、图标仍走 `<Icon>`、颜色只读 `var(--stitch-*)`」一行；[component-families.md](../scripts/component-families.md) 新增 `data-viz` 族行（成员留 #2–#5）。**① 结构 Hook**：H1 自包含（`check:boundary ✓ 三层零越界`；dataviz 源零 hex/站名/animal）🟢、H2 只读角色变量（系列色接 `--stitch-cat-*`、tooltip 复用 Card、tooltip less 11× `var(--stitch-*)`）🟢、H4 契约不动（`contract.css` 零 diff、零新 token）🟢、H5 CI 齐备（`npm run ci` 八步 **EXIT 0**）🟢。**② 真实 case dry_run**：三件地基各一最小样例（`chartColors.test` / `ChartFrame.test` / `ChartTooltip.test`，**3 文件 8 例全过**，开篇+结尾达预期）🟢；打包核验 recharts external（**无 `.js` 打入 recharts**）、dataviz 未进 dist 的 `.js`（未被入口引用，正确——它是 #2–#5 地基）🟢；浏览器一次性预览实测双系列折线读 cat 色、tooltip 为 Card 表面、切 seline→steep 换肤整图重着色（看后即删）🟢。两块表见 GH #1 评论。**给后续**：#2–#5 从 `_internal/dataviz` 复用三件地基（`seriesColors` 取系列色、`ChartFrame` 包响应式/a11y、`content={<ChartTooltip/>}` 接 tooltip），填 `data-viz` 族成员；#6 日历落地时把 react-day-picker + date-fns 入 `dependencies`（external 已预登记）。

Issue: https://github.com/HironoOcto/stitch-design-system/issues/1
依赖：无，可立即领取。

---

## #2（AFK）：LineChart（折线 / 面积图）

> 在 #1 地基上新增对外组件 LineChart，归 data-viz 族。四件套 + demo + references + 测试；系列色读 --stitch-cat-*、面积 color-mix、tooltip 走地基。

> ✅ 已完成并 close（commit `c6c8b12`，2026-09-07）。在 #1 地基上新增对外组件 **LineChart**（折线 / 面积图），归 `data-viz` 族。端到端垂直切片（TDD tracer→增量）：四件套（[LineChart.tsx](../packages/react/src/components/LineChart/LineChart.tsx) / less / test / a11y.test / index）+ demo + `build:refs` 生成 [references/components/data-viz.md](../skills/stitch-design-system/references/components/data-viz.md) 的 `## LineChart`。**系列色**一律走 #1 换肤桥 `catColor`/`seriesColors` 读 `var(--stitch-cat-*)`（零硬编码、切站整图跟随）；**面积软填充**由同系列色经 `color-mix()` 派生；**复用** #1 `ChartFrame`（`ResponsiveContainer` + `role="img"`/`aria-label`）与 `ChartTooltip`（Card 表面，值经 `valueFormatter`）。props 借 Ant charts 能力项、命名遵 Ant v5（`data`/`xField`/`series`/`smooth`/`area`/`valueFormatter`/`height`/`ariaLabel`）。**验收中加固两项**：① 关掉 recharts 越窗 JS 入场动画（`isAnimationActive={false}`，接不到 `--stitch-motion-*` 且超 design-rules 动效窗）；② **方案 X**——多系列区分补两条**不依赖颜色**的通道（守 WCAG 1.4.1）：线型 `strokeDasharray` 按序循环（单系列恒实线、外观零变化）+ 末端标名（末点旁标系列名，文字走 `var(--stitch-text-primary)`）。**steep 淡线定调**：`--stitch-cat-1` 近白作单线偏淡 = 接受为主题固有质感、非 bug（颜色源/色板不动，多系列靠线型+标名分）；「每主题线都醒目」的方案 Y（线色源换 `accent`）另立、不在 #2 内。**① 结构 Hook**：H2 只读 `var(--stitch-*)`（系列色接 `--stitch-cat-*`、面积 `color-mix`、源零 hex）🟢、无 emoji/裸 svg/Unicode（svg 全由 recharts 出）🟢、H5 CI 齐备（`npm run ci` 八步 **EXIT 0**，pre-commit 复跑亦绿）🟢。**② 真实 case dry_run**（浏览器实测）：`role="img"`+`aria-label`（「上半年月度营收面积图」）🟢、Y 轴/tooltip 货币格式化（`$36,400`）🟢、切 seline→steep 换肤整图跟随 🟢、tooltip 为 Card 表面 🟢、方案 X 在 steep 淡色板下仍凭实线/虚线+末端标名分得开 🟢、demo 上架 data-viz 族 console 无 warn 🟢；过 #29 skill-acceptance §5 相关节 🟢。两块表见 GH #2 评论。**给后续**：#3–#5 沿同法复用 `_internal/dataviz` 三件地基 + 本件的线型/末端标名区分范式填 data-viz 族；原创长相取舍已录本地 `预建笔记.md`（构建期台账、不入库）并经人拍板。

Issue: https://github.com/HironoOcto/stitch-design-system/issues/2
依赖：#1（图表地基 + data-viz 族）。

---

## #3（AFK）：BarChart（柱状图）

> ✅ 已完成并 close（commit `6642184`，2026-09-07）。在 #1 地基上新增对外组件 **BarChart**（柱状图），归 `data-viz` 族。端到端垂直切片（TDD tracer→增量五循环）：四件套（[BarChart.tsx](../packages/react/src/components/BarChart/BarChart.tsx) / less / test / a11y.test / index）+ demo + `build:refs` 生成 [references/components/data-viz.md](../skills/stitch-design-system/references/components/data-viz.md) 的 `## BarChart`。**系列色**一律走 #1 换肤桥 `catColor` 读 `var(--stitch-cat-*)`（零硬编码、切站整图跟随）；**复用** #1 `ChartFrame`（`ResponsiveContainer` + `role="img"`/`aria-label` 兜底）与 `ChartTooltip`（Card 表面，值经 `valueFormatter`）。props 借 Ant charts 能力项、命名遵 Ant v5（`data`/`xField`/`series`/`stack`/`valueFormatter`/`height`/`ariaLabel`）——`stack` 取 Ant `isStack` 语义（关=多系列**默认分组并排**、开=堆叠成一柱）。**长相**取扁平实心矩形（`radius=0`、不描边，克制），hover 柱背景由墨色 `color-mix()` 派生（不落 hex）。**多系列区分**补一条**不依赖颜色**的通道（守 WCAG 1.4.1）：`Legend` 只在多系列时出，把「系列名 → 色块」显式列出。**同 #2 加固**：关掉 recharts 越窗 JS 入场动画（`isAnimationActive={false}`）。**验收中补例**：用户逐条抽查 demo「示例够全」判不通过——缺 `stack=false 且 series>1` 的默认分组分支（docstring 核心路径），已在 [demo](../demo/components/BarChart/index.tsx) 补「多系列分组并排」例（单系列 → 分组 → 堆叠三例齐），`build:refs` 重跑后 data-viz.md 含 3 个 tsx 用例。**① 结构 Hook**：H2 只读 `var(--stitch-*)`（系列色接 `--stitch-cat-*`、hover 柱背景 `color-mix`、源零 hex）🟢、无 emoji/裸 svg/Unicode（svg 全由 recharts 出；`→` 仅在中文注释，同 LineChart 惯例）🟢、H5 CI 齐备（`npm run ci` 八步 **EXIT 0**，pre-commit 复跑亦绿）🟢。**② 真实 case dry_run**（浏览器实测）：`fill="var(--stitch-cat-1)"` 实解析 seline `#3ba6f1`、切 steep 同属性重解析 `#fbe1d1`（换肤整图跟随、组件零改动）🟢、分组例两系列首柱 x `75≠120`（并排）/ 堆叠例 `75=75`（同柱）🟢、Legend 出系列名（`独立访客`/`页面浏览`）🟢、demo 上架 data-viz 族 console 无 warn 🟢；过 #29 skill-acceptance §5 相关节（`check:skill` 41/41）🟢。两块表见 GH #3 评论。**给后续**：#4/#5 沿同法复用 `_internal/dataviz` 三件地基 + 本件的 `stack` 分组/堆叠 + Legend 区分范式填 data-viz 族。

Issue: https://github.com/HironoOcto/stitch-design-system/issues/3
依赖：#1（图表地基 + data-viz 族）。可与 #2/#4 并行。

---

## #4（AFK）：PieChart（饼 / 环图）

> ✅ 已完成并 close（commit `455e525`，2026-09-07）。在 #1 地基上新增对外组件 **PieChart**（饼 / 环图），归 `data-viz` 族。端到端垂直切片（TDD tracer→增量）：四件套（[PieChart.tsx](../packages/react/src/components/PieChart/PieChart.tsx) / less / test / a11y.test / index）+ demo + `build:refs` 生成 [references/components/data-viz.md](../skills/stitch-design-system/references/components/data-viz.md) 的 `## PieChart`。**扇区色**一律走 #1 换肤桥 `catColor` 读 `var(--stitch-cat-*)`、按序号循环（多扇区循环取槽，零硬编码、切站整图跟随）；**复用** #1 `ChartFrame`（`ResponsiveContainer` + `role="img"`/`aria-label` 兜底）与 `ChartTooltip`（Card 表面，值经 `valueFormatter`）。props 借 Ant charts 能力项、命名遵 Ant v5（`data`/`angleField`/`colorField`/`innerRadius`/`centerLabel`/`legend`/`height`/`valueFormatter`/`ariaLabel`）——`innerRadius` 取 Ant charts 语义（对外 0–1 占比→内部转 `%`，`0`=实心饼、`>0`=环形 donut）。**环形中心值** `centerLabel` 由 recharts `<Label position="center">` 出（svg 由库出、**非手写**，守裸 svg 红线），排版走角色变量 `.center`（`font-size-lg` + `weight-medium` + `text-primary`）；**扇区间细缝**取 `var(--stitch-bg-elevated)`（随换肤跟随、不落 hex）；**图例**默认恒出（与 #3「仅多系列出」分歧——饼每扇区即一分类），作**不依赖颜色**的区分通道（守 WCAG 1.4.1）；**同 #2/#3 加固**：关掉 recharts 越窗 JS 入场动画（`isAnimationActive={false}`）。**原创长相取舍**（饼独有、#2/#3 先例未覆盖的 5 项：扇区缝 / 外半径档 / donut 语义 / 中心值排版·范围 / 图例默认策略）经用户**逐条拍板通过**，已登记 `预建笔记.md`（#4 段 ✅ 已定夺）。**① 结构 Hook**：H2 只读 `var(--stitch-*)`（扇区色接 `--stitch-cat-*`、源零 hex）🟢、无 emoji/裸 svg/Unicode（svg 全由 recharts 出；`→` 仅在中文注释，同 #2/#3 惯例）🟢、H5 CI 齐备（`npm run ci` 八步 **EXIT 0**，pre-commit 复跑亦绿）🟢。**② 真实 case dry_run**（seline 站浏览器实测）：扇区 `fill="var(--stitch-cat-1)"` 实解析 `rgb(59,166,241)`（换肤桥成立、切站整图跟随）🟢、donut 中心 `<text>`=`12,300`（computed `fill=#0c0a09`=text-primary / `20px`=font-size-lg / `weight 500`=medium，三项全走角色变量）🟢、图例 5 项（Chrome/Edge/Firefox/Safari/其他）🟢、demo 上架 data-viz 族 console 无 warn 🟢；过 #29 skill-acceptance §1/§5 相关节（`check:skill` 全绿，`props==源码` + catalog 派生含 PieChart）🟢。两块表见 GH #4 评论。**给后续**：#5 沿同法复用 `_internal/dataviz` 三件地基 + 本件的 donut/中心值/图例恒出范式填 data-viz 族。

Issue: https://github.com/HironoOcto/stitch-design-system/issues/4
依赖：#1（图表地基 + data-viz 族）。可与 #2/#3 并行。

---

## #5（AFK）：Stat + StatGroup（主状态 / 指标块）

> ✅ 已完成并 close（commit `c0aa987`，2026-09-07）。在 #1 地基上新增对外组件 **Stat + StatGroup**（主状态 / 指标块），归 `data-viz` 族、**不走 recharts**（纯 markup + CSS + `<Icon>`，族内首个非图表引擎件）。端到端垂直切片（TDD tracer→增量）：四件套（[Stat.tsx](../packages/react/src/components/Stat/Stat.tsx) / [StatGroup.tsx](../packages/react/src/components/Stat/StatGroup.tsx) / [stat.module.less](../packages/react/src/components/Stat/stat.module.less) / test / a11y.test / index）+ demo + `build:refs` 生成 [references/components/data-viz.md](../skills/stitch-design-system/references/components/data-viz.md) 的 `## Stat`（含 `StatGroupProps`）。**展示 props** 借 Ant `Statistic`、命名遵 Ant v5（`title`/`value`/`precision`/`prefix`/`suffix`/`formatter`/`groupSeparator`，覆盖 `$695,432.50`/`9m 13s`/`42%`）。**趋势 `trend`**：方向经 `<Icon>` 对角箭头（本件往内置图标集加 `arrow-up-right`/`arrow-down-right` 两枚 path，受认证 `<Icon>` 路径、不内联 svg），涨/跌好坏色**只走语义角色变量** `var(--stitch-success)`/`var(--stitch-danger)`（非硬编码绿红）；**`trendReversed` 反转开关**给「跌是好事」指标（Bounce Rate）翻转好坏配色、方向不变；方向缺省按 `value` 正负推断。**`caption`** 副说明 + **`status`** 状态点（`<Icon name="dot">` 点色走 5 语义色调角色变量 + 文案，非 Unicode `○`）。**StatGroup** 一排指标用发丝线 `var(--stitch-border)` 分隔。**原创长相取舍**（指标块独有、#2–#4 图表先例未覆盖的 5 项：大值排版档 / 前后缀降级 / 发丝线分隔+内距 / 趋势语义色通道 / 状态点色调）经用户**逐条拍板通过**，已登记 `预建笔记.md`（#5 段 ✅ 已定夺）。**验收中补两项**（reviewer demo-acceptance 建议）：① demo 补 `status` 的 `warning`/`info` 两色调例（现覆盖全 5 色调）；② `预建笔记.md` 补 #5 原创取舍条目（与 #4 记账先例一致）。**① 结构 Hook**：H2 只读 `var(--stitch-*)`（趋势走 success/danger、状态点/发丝线走角色变量、源零 hex/零硬编码绿红）🟢、无 emoji/裸 svg/Unicode（箭头/点经 `<Icon>`；`→` 仅在中文注释，同 #2–#4 惯例）🟢、H5 CI 齐备（`npm run ci` 八步 **EXIT 0**，pre-commit 复跑亦绿）🟢。**② 真实 case dry_run**（seline 站浏览器实测）：trend computed color 涨 `rgb(46,125,50)`=success / 跌 `rgb(192,57,43)`=danger、`trendReversed` 的 Bounce Rate = success 绿 + `arrow-down-right`（反转生效）🟢、status 五色调各解析到角色变量（warning `#b8860b` / info `#2b7fd8` / success / danger / neutral=text-muted）🟢、StatGroup 分隔 `border-left`=`1px solid rgb(232,230,229)`=`--stitch-border`🟢、demo 上架 data-viz 族 console 无 warn 🟢；过 #29 skill-acceptance §1/§5 相关节（`check:skill` **41/41**，`props==源` + catalog 派生含 Stat）🟢。两块表见 GH #5 评论。**给后续**：data-viz 族图表 4 件（#2–#4）+ 指标块（#5）齐；#6 Calendar 走 form-controls 族。

Issue: https://github.com/HironoOcto/stitch-design-system/issues/5
依赖：#1（仅 data-viz 族已建；与图表无代码耦合）。

---

## #6（AFK）：Calendar + DatePicker（日历）

> ✅ 已完成并 close（commit `6898853`，2026-09-07）。在 #1 依赖政策上新增 **form-controls 族首个「包三方引擎」件 Calendar + DatePicker**（日历），引擎 `react-day-picker@10` + `date-fns@4`（类比 #2–#5 的 recharts 包装件）。端到端垂直切片（TDD tracer→增量）：两组四件套（[Calendar](../packages/react/src/components/Calendar/) / [DatePicker](../packages/react/src/components/DatePicker/)）+ demo + `build:refs` 生成 [references/components/form-controls.md](../skills/stitch-design-system/references/components/form-controls.md) 的 `## Calendar` / `## DatePicker`。**Calendar**：react-day-picker 引擎，`mode="single"` + `mode="range"` 一套支持、键盘导航 + ARIA grid（库兜底 + 补齐）；上皮只读 `var(--stitch-*)`（选中日 `--stitch-accent` + `--stitch-accent-text`、range 中段 `--stitch-bg-accent`、今天 `--stitch-border-strong` 描环、hover `--stitch-bg-card`、禁用 `--stitch-text-disabled`）；日按钮铺满整格使 range 底色与端点框边到边对齐（端点只圆外侧角）；翻月/下拉箭头经 `<Icon>`（往内置集加 `chevron-left`/`calendar` 两枚 path）；`captionLayout` 默认 `dropdown`，月/年**复用 `Select`**（换肤一致、非原生弹窗），年份范围今年 ±(100/10)。**DatePicker**：字段触发器 + **复用现有 `Popover`** 装 Calendar（不另造浮层），props 借 Ant DatePicker/RangePicker、命名遵 Ant v5（`value`/`defaultValue`/`onChange`/`disabled`/`allowClear`/`placeholder`/`format`/`status`/`size`/`open`/`onOpenChange`/`defaultPickerValue`）；range 数点击第二下收浮层、`from – to` 展示串、`allowClear` 走 `<Icon name="close">`。`react-day-picker` + `date-fns` 入 dependencies 且打包 external（沿 #1 ADR 0002，不进 dist）。**原创长相取舍**（日历独有、无规格可依：日格铺满+range 边到边 / 今天描环非填充 / 年月复用 Select 下拉+年份范围 / 箭头经 Icon / 引擎 external）经用户**逐条拍板通过**，已登记 `预建笔记.md`（#6 段 ✅ 已定夺）。**验收中三轮修订**（用户反馈）：① range 底色与端点框改「铺满整格」边到边对齐（早期按钮内缩 32/格 36 → 出头）；② 顶部年月改**复用 Select** 下拉（非系统原生弹窗）+ 年份含未来（今年 +10）；③ demo 补 Calendar 整块 `disabled` / `captionLayout="label"` + DatePicker `status="warning"`，`预建笔记.md` 补 #6 原创取舍段（与 #4/#5 记账先例一致）。**① 结构 Hook**：H2 只读 `var(--stitch-*)`（源零 hex/零硬编码主题值）🟢、无 emoji/裸 svg/Unicode（箭头经 `<Icon>`、rdp 自带 `rdp-chevron` 已覆盖；`–` 为范围展示标点非图标替身）🟢、`react-day-picker`+`date-fns` external 不进 dist（dist 内裸 import、无内联引擎源）🟢、H5 CI 齐备（`npm run ci` 八步 **EXIT 0**）🟢。**② 真实 case dry_run**（seline 站浏览器实测）：range 10–16 端点 `rgb(59,166,241)`=accent / 中段 `rgb(193,225,247)`=bg-accent、格与按钮均 36×36 边到边对齐（`buttonFillsCell:true`）🟢、年/月 Select 弹层为主题面（白底 + `--stitch-border` 1px + `--stitch-radius-card` 10px + 主题阴影）非原生、年份 1926–2036 含未来 🟢、DatePicker 实点 range 触发器 → `role="dialog"`（有可及名）内含 `role="grid"`（复用 Popover）、日按钮全日期可及名 + 翻月可及名 🟢、demo 上架 form-controls 族 console 无 warn 🟢；过 #29 skill-acceptance §1/§5（`check:skill` **41/41**、`props==源` + catalog 派生含 Calendar/DatePicker）🟢、受控/非受控双模式（取值 `value`/`defaultValue` + 浮层 `open`/`defaultOpen` 各双模式）🟢。两块表见 GH #6 评论。**给后续**：form-controls 族日历件齐；引擎件（含 external 例外依赖）第二类落地（recharts 之后 react-day-picker + date-fns）。

Issue: https://github.com/HironoOcto/stitch-design-system/issues/6
依赖：#1（仅依赖政策已落；与图表无代码耦合）。

---

> **本批规划（主题切换 · `/grill-with-docs` 对齐）**：预览侧（npm）与开发侧（skill）双向可切主题，且不切也有一致默认。锚点决策——两个发布面（`themes/*` 导出 + skill presets）**同一「可发布站」判据**（#7 `listPublishableSites`，三件套齐全）；预览走**一站一文件** `themes/<站>` opt-in 导出（生产仍单套 `/style`，B 方案不破）；skill 主题**发布时定默认 → 消费时可切**（预置全备 + 消费项目 `stitch.config.json` 指针 + SKILL.md 读时解析 + `description` 转主题中性），reset-theme skill 只写项目指针（幂等、不改已装插件、per-project）；两侧读**同一站名指针**即对齐。新增 2 条 ADR（预览导出 · 消费时选主题，后者修订 0005/0007）。依赖：**#7 地基**先行，#8/#9 可并行，#10 依赖 #9。

## #7（AFK）：可发布站单一判据 `listPublishableSites`

> 落共享 helper：扫 `sites/` 收「三件套齐全」（adapter.css + rules.md + skill-blurb.md）的站、零写死站名，作 A(#8 themes/*)/B1(#9 skill presets) 的**同一集合来源**。纯 prefactor，不改发布产物。

> ✅ 已完成并 close（commit `7017d01`，2026-09-08，用户验收通过）。落共享 helper [scripts/lib/publishable-sites.mjs](../scripts/lib/publishable-sites.mjs) `listPublishableSites(root)`：`readdirSync(sites)` 动态扫、`TRIAD.every(existsSync)` 判「三件套齐全」（`{adapter.css, rules.md, skill-blurb.md}`）、`.sort()` 稳定字典序、**零写死站名**（`TRIAD` 只列文件名，延续 `resolveSite`/`check-boundary` 动态解析风格）。作 A(#8 `themes/*` emit)/B1(#9 skill presets) 的**同一「可发布站」集合来源** —— 更严的「三件套齐全」而非「有 adapter.css 就算」，正是为让两发布面收录同一集合、能预览必能开发。纯 prefactor，**零发布产物改动**（`git status` 仅两个新文件）。TDD 三轮 vertical red→green：tracer 真实 `sites/`→`[seline,steep]`、缺件矩阵（throwaway `mkdtemp` fixture、`finally` 清理，不碰真 `sites/`）、乱序建目录→稳定排序。**① 结构 Hook**：**H1** 自包含（helper grep `seline|steep|phantom|saybriefly` 零命中；`check:boundary ✓ 三层零越界`）🟢、**H5** `npm run ci` 八步 EXIT 0（format:check→check:docs→check:skill→check:boundary→lint→test:run→test:a11y→build，pre-commit 复跑亦绿）🟢。**② 真实 case dry_run**：`listPublishableSites(realRoot)` 实跑 `["seline","steep"]`、on-disk `[phantom,saybriefly,seline,steep]`→excluded `[phantom,saybriefly]` 🟢；活跑 throwaway root 造 `missing-blurb`/`bare` 缺件站→kept `[full]`、cleanup ok 🟢；`node --test` 3/3 绿。两块表见 GH #7 评论。下游解锁：#8 `themes/*` 预览导出、#9 skill presets 均调此单判据。

Issue: https://github.com/HironoOcto/stitch-design-system/issues/7
依赖：无，可立即领取（#8/#9 的前置）。

---

## #8（AFK）：themes/\* 预览导出（npm 零重发布切主题）

> 给包加预览专用导出：build emit dist/themes/<站>.css（各站 adapter :root→[data-site]，用 #7 判据）+ package.json "./themes/*" 通配导出；生产仍只 /style 兜 activeSite。含改根 README + react-project.md 讲 npm 切主题用法 + 新 ADR。

> ✅ 已完成并 close（commit `c5897e9`，用户验收通过）。`npm run build` 为每个可发布站（#7 [listPublishableSites](../scripts/lib/publishable-sites.mjs)）额外 emit `dist/themes/<站>.css`：该站 `adapter.css` 每站值作用域化成 `[data-site="<站>"]`（新 [scope-theme.mjs](../scripts/lib/scope-theme.mjs) 纯函数 seam、TDD 4/4；恒定/派生留 `style.css` 的 `:root` 靠 `var()` 跟随），emit 挂进既有 `vite-plugin-stitch-theme` 的 `generateBundle`/`emitFile`、与 `style.css` 原子产出；`package.json` 加 `"./themes/*": "./dist/themes/*.css"`。**定位（用户验收裁定，修订了原 prompt 的「dev 预览、非生产 A 方案」表述）**：`themes/* + data-site` 是**使用方灵活选主题的一等常规用法**（可做用户主题选择器），不引 `themes/*`/不设 `data-site` = 零配置默认单套（烤定 `activeSite`，B 方案不破）。新增 [ADR 0009](./adr/0009-themes-preview-export.md)（一站一文件 / opt-in / 零配置默认单套 / 与 [ADR 0001](./adr/0001-multi-site-reskin.md) B 方案关系）；README 新增「用 npm 包灵活切换主题」节；`react-project.md` 顺带提（`<site>` 占位、boundary-safe）。**① 结构 Hook**：**H2** themes 全 `--stitch-*`（seline 36/36、steep 34/34、`:root {` 选择器 0）、**H4** `style.css` 首行仍 seline / 单 `:root` / `color-mix` ×68 未求值 / 生产 diff（除 themes/）空、**H1** emit 走 `listPublishableSites` 零写死站名（`check:boundary ✓`）、**H5** `npm run ci` EXIT 0（pre-commit）🟢。**② 真实切站 dry_run**：build 产 `{seline,steep}.css`、站集合 `==#7`（phantom/saybriefly 不产）；`npm pack --dry-run` 含 `dist/themes/*.css`、`import.meta.resolve` 三路解析；真实浏览器装 tarball 探针经公开 exports import，翻 `data-site` 时 `--stitch-accent` 在 `#3ba6f1`↔`#17191c` 实际切换（flips true）、派生 `--stitch-accent-hover` 靠 `var()` 跟随 🟢。两块表见 GH #8 评论。顺带修既存 `node --test` 腐化（不在 ci）：families 族数硬编码 9→动态族名清单、build-skill/build-tokens 三个 stale `activeSite` 断言改为动态读 `stitch.config.json`。下游：#9 skill presets 与本导出同调 #7 判据、同一站名对齐。

Issue: https://github.com/HironoOcto/stitch-design-system/issues/8
依赖：#7（判据就位）。

---

## #9（AFK）：skill 主题 发布时定→消费时可切

> build:skill 出全部可发布站 presets（#7 判据）+ SKILL.md 读消费项目 stitch.config.json.activeSite 读时解析 presets/<active> + description 转主题中性、seline 散文下沉 body。默认（无指针）= npm 默认。新 ADR（修订 0005/0007）+ CONTEXT 新词 + 随之更新 check:skill/skill-acceptance。

```text
先读 issue（规范正本）：GH_CONFIG_DIR=~/.config/gh-linling9025 gh issue view 9 --repo HironoOcto/stitch-design-system --comments
你在【stitch-design-system/】执行（先 pwd 确认结尾 /stitch-design-system）。gh 一律 GH_CONFIG_DIR=~/.config/gh-linling9025 + --repo HironoOcto/stitch-design-system。

目标：把 skill 主题从「发布时 activeSite 烤死单套」改为「发布时定默认、消费时可切、任一时刻仍单套」（不变式不破）。三处：① build:skill 为全部可发布站（#7）生成 references/theme-presets/<站>/{tokens.css==mergeTokens, rules.md 逐字节, 风格散文}，默认套=activeSite=npm 默认；② SKILL.md 读时解析——先读消费项目 stitch.config.json.activeSite（无则回落发布默认）→ 读 presets/<active>/*；③ description 转主题中性（讲系统不讲皮），seline 招牌散文下沉 body 的「当前风格」节随 active 解析。design-rules.md 不动。同步更新 check-skill.mjs / skill-acceptance.md 对应机器档（从「单套 references/theme/*」→「presets/<站>/* 全备 + 读时解析 + 换主题散文隔离」）。新增 ADR「消费时选主题」修订 0005/0007；CONTEXT 补 主题预置(preset) / activeSite（消费侧指针）；#7 单判据不变式在此 ADR 收录。

红线（结构 Hook）：H3 skill self-contained（预置全在 references/、零外链、换主题散文隔离，check:skill 更新后全绿）；H4 每份 preset tokens 不变量（单 :root + DO NOT EDIT + 派生 color-mix 未求值）；H1 自包含·零写死站名；H5 ci EXIT 0。

验收（真实验收禁糊弄；一个 case 够证）：
1. build:skill 产 references/theme-presets/{seline,steep}/*（tokens==mergeTokens、rules 逐字节、散文两段），站集合==#7。
2. SKILL.md 读时解析：消费项目 activeSite=steep → 解析到 steep presets；无该文件 → 回落发布默认(=npm 默认)。
3. description 主题中性（grep 无 seline 招牌词/站名）；seline 风格散文在 body、随 active。
4. 换主题隔离：切消费侧指针 seline↔steep，AI 得对应 presets、其余 diff 收敛。
5. 执行报告两块表：① Hook（H3/H4/H1/H5）全 🟢；② 真实 case dry_run（读时解析 + 换主题 diff 收敛）🟢。

收尾门：用户验收通过后才 commit(#9) + close + GH 评论登记两块表 + ADR/CONTEXT/check:skill 同 PR。未验收不 commit、不 close。AFK 独跑不停确认 seam。
```

Issue: https://github.com/HironoOcto/stitch-design-system/issues/9
依赖：#7（presets 站集合以判据为准）。与 #8 可并行。

---

## #10（AFK）：reset-theme skill（使用方切开发主题·写项目指针）

> 新增 reset-theme skill（并入 plugin.json skills 数组）：从可发布站挑一套 → 只写使用方项目 stitch.config.json 指针（幂等、不改已装插件、per-project）；与 #9 读时解析对齐。含改根 README 讲 reset-theme 切主题用法。

```text
先读 issue（规范正本）：GH_CONFIG_DIR=~/.config/gh-linling9025 gh issue view 10 --repo HironoOcto/stitch-design-system --comments
你在【stitch-design-system/】执行（先 pwd 确认结尾 /stitch-design-system）。gh 一律 GH_CONFIG_DIR=~/.config/gh-linling9025 + --repo HironoOcto/stitch-design-system。

目标：新增 skill reset-theme，并入 .claude-plugin/plugin.json 的 skills 数组（与 stitch-design-system 并列，同插件便于定位彼此）。功能：列出可发布站（#7 判据 / 或 stitch-design-system skill 的 theme-presets/ 目录动态取，零写死站名），使用方挑一套 → 只往使用方项目根写/更新 stitch.config.json 的 activeSite 指针。性质：幂等（再选同一套同结果）、不改任何已装插件内脏（升级不丢）、per-project。选定后 #9 skill 读时解析 + #8 预览默认站都对齐同一站名——预览(data-site) 与 开发(指针) 同名即对齐。改根 README 补「reset-theme 切换开发主题」节，与 #8「npm 预览切换」节呼应、点明对齐。

红线（结构 Hook）：H1 自包含（reset-theme 零外链、零写死站名·动态取）；H3 不破 stitch-design-system skill 自包含；无 emoji/裸 svg/Unicode；H5 ci EXIT 0。

验收（真实验收禁糊弄；一个 case 够证）：
1. reset-theme skill 就位、并入 plugin.json skills；claude plugin validate 两清单通过。
2. 选 steep → 使用方项目 stitch.config.json.activeSite=steep（幂等：再跑同结果）；不写任何已装插件目录（stitch-design-system skill 文件零改动）。
3. 与 #9 联动：写指针后 stitch-design-system skill 读时解析得 steep presets（串一次开篇+结尾）。
4. 执行报告两块表：① Hook（H1/H3/H5）全 🟢；② 真实 case dry_run（选站→指针写入→skill 解析到位）🟢。

收尾门：用户验收通过后才 commit(#10) + close + GH 评论登记两块表 + README 同 PR。未验收不 commit、不 close。AFK 独跑不停确认 seam。
```

Issue: https://github.com/HironoOcto/stitch-design-system/issues/10
依赖：#9（预置 + 读时解析就位，指针要有被解析的一端）。

---

# 待建 issue（依赖未就位，暂不领取）

> 依赖到位后补建 GH issue（`[stitch]` 前缀 + `ready-for-agent`），并把 AFK prompt 挪到上面「各 issue 的 prompt」。

- ~~**Vite 虚拟模块插件 → `dist/style.css`**~~ → 已建为 **#57**（`virtual:stitch-theme` + dts + package.json 发布字段）。发布/分发阶段（打包 + scope 改名 + 切 seline + 边界守卫 + skill 装法 + 摘 repo）已拆成 **#56–#63**，prompt 见上「各 issue 的 prompt」，决策见 [ADR 0008](./adr/0008-distribution-and-package-name.md)。

> **skill 打包 / 可安装性已激活**（animal 迁移完成后开工）：拆成 **#29–#33**（验收标准 → 摘固定文件 → build:blurb → build:skill → check:skill），prompt 见上「各 issue 的 prompt」。H3 由 #33 的 `check:skill` 永久守护。build:refs 早随 #5 Icon 落地。「好不好用」的 eval（触发 eval + 装/不装对比）留作后续 issue。

