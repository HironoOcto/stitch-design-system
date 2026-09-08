# skill 结构验收标准

> skill「**按规格造好、没坏**」的结构验收标准。认证结构，**不**认证「好不好用」——触发/产出质量的 eval 另立、晚一步做。
>
> **主题模型（[ADR 0010](../adr/0010-consume-time-theme-choice.md)）**：skill **预置全备**——`build:skill` 为**每个可发布站**（#7 [listPublishableSites](../../scripts/lib/publishable-sites.mjs)）各备一套主题预置 `references/theme-presets/<站>/{tokens.css, rules.md, style.md}`；「哪套生效」由消费项目 `stitch.config.json.activeSite` 指针**读时解析**，无指针回落**发布默认**（= 本仓库 `activeSite`，注入 SKILL.md `SLOT:default-site`）。验收因此按「每个可发布站的预置逐份核 + description 主题中性 + 读时解析/换主题隔离」跑，不再核「单套 `references/theme/*`」。`design-rules.md` 是全局、单份、跨主题不变的例外，仍在 `references/theme/`（不进预置）。
> 本文与 `check:skill`（CI 脚本）是同一套标准的**人读面 / 机读面**：本文用文字列出查什么、怎么算过，`check:skill` 是同一批检查的代码实现。两者都**不是规则的源头**——规则在上游（见下），上游变、两者都跟；两者若彼此不符是漂移，靠单源派生消除，别靠谁压谁。

面向接手 agent 与 `check:skill` 实现者。规则来源两套合一：① [skill 构建流程](./skill-build-pipeline.md) 的结构约束；② agentskills.io 官方规格与最佳实践（Specification / Best practices / Optimizing descriptions / Using scripts / Evaluating skills）。

---

## 类型三档（全文只用这三档）

| 档 | 含义 | 谁来判 | 归宿 |
|---|---|---|---|
| **机器** | 确定性判据（命令/grep/diff/计数），人不用看 | `check:skill` CI | 每条对应 `check:skill` 一条或一组断言 |
| **agent判** | 需 LLM 读两份文件比对（忠实度、导向、是否给默认不给菜单） | LLM 评审步 | 不进 CI 硬门，出偏差报人 |
| **人签** | 人最后一眼签字，几乎只剩 blurb 忠实度 | 维护者 | 发布前唯一人工闸 |

---

## Runbook（验收怎么跑）

给零上下文接手的 agent 领路。**验收 = 只读判断**：拿产物跟它的**源**和**规格**比，判过没过。**不跑 `build:*`、不动 git**——验收是裁判，不下场重造产物。产物缺失即对应产物节失败（不存在 = 不合格）。

判据两种形态，都**只读、无副作用**：
- **静态**：grep / wc（名字、长度、无残留、无 hex…）。
- **从源算期望再比**（针对生成物）：用**纯函数**从源算出「本该长这样」，跟产物比——`mergeTokens(contract, adapter, 当前站)` 之于 tokens.css、`renderCatalog(builtFamilyRows(parseFamilies(…), 组件参考目录))` 之于 catalog（**只列已落盘的族**，族表里列了、但源码尚无对应组件的族不出链）、抽 `<X>Props` 之于组件参考、`diff 拷贝 vs 源` 之于 rules/design-rules。**调纯函数算期望，不是跑 `build:*` 编排**（那会写文件、要还原 git）。这些纯函数**必须复用 `build:*` 用的同一份 lib**（别各写一份，否则期望值自己就漂）。

> **`<发布默认>` = 本仓库 `stitch.config.json` 的 `activeSite`**；**`<可发布站>` = `listPublishableSites()`**（三件套齐全，判据里的占位符）。全程**不写死某站**——预置逐站核时对 `<可发布站>` 每一站跑同一组判据。
>
> **本验收在源仓库内跑**：判据要读上游源（`contract.css`/adapter/组件源码/`component-families.md`/`docs/`/`sites/`）。验一份已拷进 `~/.claude/skills/` 的**脱源副本**不在本文范围。

**产物哪来的（背景，验收不碰）**：`build:refs`/`build:skill`/`build:blurb` 产出，编排见 [pipeline §4.5](./skill-build-pipeline.md)。**幂等、换主题隔离**这类「非跑构建不能验」的性质，是**构建流水线自己的测试**、**不属本验收**（归 [pipeline §4.5](./skill-build-pipeline.md)，本文不列）。

### 每次验收的步骤

0. **产物存在**：固定产物（SKILL.md / README.md / react-project.md / standalone-html.md / components/* / 全局 design-rules.md）+ **每个可发布站的预置三件**（`theme-presets/<站>/{tokens.css,rules.md,style.md}`）都在各自路径——缺任一 = 该产物节直接失败（验收不为补齐而跑 build）。
1. **官方校验器先过**：`skills-ref validate ./skills/stitch-design-system`（frontmatter 硬规格，最快的一票否决）。
2. **逐产物 9 节**：每节先跑机器档（grep / wc / 从源算期望比对）→ 再跑 agent判（LLM 比对）。

就这三步。**幂等 / 换主题隔离不是验收步骤**——它们非真跑构建不能验，归**流水线测试**（[pipeline §4.5](./skill-build-pipeline.md)），不在这里跑。

### 全绿判据

- **机器档全过** = `check:skill` 退出 0（每条机器行 → 一条或一组断言）。
- **agent判无偏差** = LLM 比对无「不忠实/给菜单/塞常识」标记。
- **人签已定稿** = `skill-blurb.md` 顶部标注 human-approved。

三者齐 → skill **结构验收通过**（仍不代表「好用」，那是另立的 eval）。

### 修复往哪改 · 怎么重验

构建命令各有节奏（[pipeline §4.5](./skill-build-pipeline.md)），**不是每次都全量重建**：`build:refs` 仅组件/族变更时、`build:blurb` 仅每站一次或 DESIGN.md 变更时、`build:skill` 换主题/发布前。改源后**只重跑受影响那条**（都幂等），再验。

**验收挂了 → 改源、别改生成物**（否则重跑覆盖你的改；且「手改与源漂移」本身就是失败项）：

| 产物 | 修复改哪 | 重验 |
|---|---|---|
| **生成物**：`references/components/*`、`theme-presets/<站>/*`、全局 `theme/design-rules.md`、SKILL.md 的槽、README catalog 槽 | 改**源**（组件源码 / adapter / rules / DESIGN.md / `component-families.md`） | 重跑对应命令（`build:refs` 或 `build:skill`）再验；幂等，修复在源里、不会被覆盖 |
| **手写 / 手审件**：SKILL.md 骨架(非槽，含主题中性 description)、README 骨架(非槽)、`react-project.md`、`standalone-html.md`、`skill-blurb.md` | **直接改**该文件 | 直接重验；`build:skill` 只替换槽区（`default-site`）/ 只读 blurb，碰不到你改的部分 |

**「重验覆盖修改」只在你改错地方（手改了生成物）时发生——那正是验收要拦的。** 改对地方，重验永远安全。

---

## 逐产物 9 节

> 路径简写：`SKILL_DIR = skills/stitch-design-system/`。所有相对链接以本文（`docs/contributing/`）为基。

### 1. `SKILL.md`（AI 读的第一份；骨架固定 + 生成槽）

机器档含两类（[Specification](https://agentskills.io/specification)）：**agentskills 硬规格**（`name`/`description`，`skills-ref validate` 校）+ **项目强制的建议闸**（行数/token——agentskills **建议值**、非硬校、`skills-ref` 不查，由 `check:skill` 自己卡）。

| 查什么(白话) | 怎么算过(命令/grep/diff 或判据) | 类型 | 不过长啥样(失败例子) |
|---|---|---|---|
| `name` == 父目录名 | frontmatter `name:` 的值 === skill 目录名（`basename SKILL_DIR`，现为 `stitch-design-system`；随包改名一起变，不焊死） | 机器 | `name` 与目录名不符；或含大写 |
| `name` 字符合法 | 1–64 字符、只 `[a-z0-9-]`、不以 `-` 开头/结尾、无 `--` | 机器 | `name: -stitch` / `stitch--ds` |
| `description` 长度合法 | frontmatter 静态 `description:` 值非空且 ≤ 1024 字符（不再从某站 blurb 注入） | 机器 | 空 description；或 1500 字长文 |
| SKILL.md < 500 行 | `wc -l SKILL_DIR/SKILL.md` < 500（**整文件**的可读性粗闸；frontmatter 才十来行、忽略不计）。agentskills **建议值**、非硬校，`check:skill` 强制 | 机器 | 塞进逐组件 props → 700 行 |
| SKILL.md body < 5000 token | 用固定分词器（如 `tiktoken` `cl100k_base`）数 frontmatter **后**正文 < 5000（body 才是**激活时**载入的预算；`description` 已计入启动期 metadata，不重复算）。agentskills **建议值**、非硬校 | 机器 | 内联整张 token 表 → 超 5000 |
| 文件引用只一层深 | 所有**链接**目标匹配 `references/[^/]+(/[^/]+)?`，无 `references/a/b/c` 深链。预置文件（`theme-presets/<active>/*`）在 body 用**行内 code 路径 + 读时解析**给出、非静态链接，故不计入本闸 | 机器 | `references/theme/sub/deep.md` 深链 |
| 自包含·无结构残留 | grep 无 `raw.githubusercontent`/`github.com`/出 skill 的 `../`/外来包名/`--(?!stitch)[a-z]+-` 前缀 | 机器 | 出现 GitHub raw 链、`--ant-*`、外来包名 |
| `default-site` 槽已注入 | `SLOT:default-site` 区间非空、值 == 发布默认站（本仓库 `activeSite`），无占位残留（占位形如 `【槽…】`） | 机器 | 槽空 / 值非发布默认 / 还留 `【槽…】` 占位 |
| `description` 主题中性 | grep frontmatter `description`：无任何站名（denylist = `sites/` 目录名）、不含任何站 blurb 的 description 段（未把招牌散文烤回）、含 `--stitch-`（讲角色契约本身） | 机器 | description 里出现站名 / 烤入某站招牌散文 |
| catalog 槽 == README 同一份 | 抽两文件 `SLOT:catalog` 区间做 diff == 空（catalog 9 行 = 7 族 + Form + Notification） | 机器 | README 漏了 Form/Notification 两行、与 SKILL 不一致 |
| 骨架主题隔离（词汇层） | LLM 读 SKILL.md 骨架（非槽、非预置）：无**任何**站的品牌·字体·风格词——骨架现主题中立，招牌散文全部下沉到 `theme-presets/<站>/style.md`（denylist = 全部站 vocab + 来源名如 refero） | agent判 | 骨架里混进某站字体名 / 风格词 |
| description 是「何时用」导向 | LLM 读 description：讲设计系统本身（可换肤 `--stitch-*` 契约 + 组件库）、含 what+when、第三人称、无营销形容词、不讲某套皮（[Optimizing descriptions](https://agentskills.io/skill-creation/optimizing-descriptions)） | agent判 | `description: Helps with UI.`（无 when、无关键词）；或讲死某套皮 |
| 骨架给默认不给菜单、有该有的 gotchas、没塞常识 | LLM 读固定骨架 vs [best-practices](https://agentskills.io/skill-creation/best-practices)：hard rules 是具体纠偏非泛泛「handle errors」；不解释「什么是 React」 | agent判 | 骨架罗列 4 种可选写法无默认；或大段科普常识 |

### 2. `README.md`（给人；中文）

| 查什么(白话) | 怎么算过(命令/grep/diff 或判据) | 类型 | 不过长啥样(失败例子) |
|---|---|---|---|
| catalog 槽 == SKILL.md 同一份 | 抽两文件 `SLOT:catalog` diff == 空 | 机器 | README catalog 手维护、与 SKILL 不一致 |
| 自包含·不外链任何仓库 | grep 无 `raw.githubusercontent`/`github.com`/出 skill 的 `../` | 机器 | 精确值链回某仓库 raw 地址 |
| 无结构残留 | grep 无外来包名/`--(?!stitch)[a-z]+-` 前缀（外链已上一行查） | 机器 | 目录说明里出现外来包名、`--ant-*` |
| 无主题词汇残留 | LLM 读 README（**主题中立**件）：无**任何**站的品牌·字体·风格词（denylist = 全部站 vocab + 已知来源名如 refero） | agent判 | 目录说明里出现 `refero` / 借来字体名 |
| 讲清「怎么装 + 目录 + 两场景」、面向人的中文、无臆造 | LLM 读 README：安装步、目录布局、React/HTML 两场景齐；标识符保留原文 | agent判 | 漏安装步；或把 AI 文档的英文照搬当人读 |

### 3. `references/react-project.md`（固定 · 主题无关）

| 查什么(白话) | 怎么算过(命令/grep/diff 或判据) | 类型 | 不过长啥样(失败例子) |
|---|---|---|---|
| 主题无关·无主题值内联 | grep 无 `#[0-9a-fA-F]{3,8}`、无字体族字面量、无写死圆角/阴影 px（固定件、不被任何 `build:*` 写，主题无关靠此 grep） | 机器 | 写死 `border-radius: 24px` |
| 引用一层深·`../SKILL.md` 只上跳到 skill root | grep 链接无出 skill 的 `../../` | 机器 | `../../docs/...` 出 skill |
| 场景 A 指引完整准确、以 .d.ts 为准 | LLM 读：装包、import style、从 package.json 探类型、最小样板齐 | agent判 | 教人直接改 node_modules；或漏 import style |

### 4. `references/standalone-html.md`（固定 · 主题值靠引用不内联）

> 这里的 CDN（React/Babel via unpkg）是**生成页面的运行时**，不违反自包含——自包含铁律管的是「skill 不 fetch 自己的规格数据」，不是「生成的 HTML 不许用 CDN 跑 React」。

| 查什么(白话) | 怎么算过(命令/grep/diff 或判据) | 类型 | 不过长啥样(失败例子) |
|---|---|---|---|
| 主题值零内联（字体/阴影/字重/clip-path） | grep 无 `#[0-9a-fA-F]{3,8}`、无字面 `box-shadow` 值、无字体族字面量、无 `clip-path: polygon(...)` 字面（此文件是固定件、不被任何 `build:*` 写，主题无关全靠「无主题值」兜） | 机器 | 直接写 `box-shadow: 0 2px 8px #...` |
| 机制完整（CDN + 手搓同名组件 + 禁 Tailwind + 指向 theme/rules.md） | LLM 读：React/Babel via CDN、组件命名镜像真实导出、禁原生控件、值全取自 `theme/*` | agent判 | 允许 Tailwind；或教人 fetch 远程 token |

### 5. `references/components/*`（生成 · 随组件 · 主题无关）

| 查什么(白话) | 怎么算过(命令/grep/diff 或判据) | 类型 | 不过长啥样(失败例子) |
|---|---|---|---|
| 一族一文件·不分片 | `references/components/` 无 `<族>-N.md` 分片；每族恰一个 `<族>.md`。**不设行闸**（按需读取的生成物，行/预算闸只管常驻入口 SKILL.md——见 [同步机制与 CI](./sync-and-ci.md)）。注：现管线一族恒写一文件、每次先清旧 `.md`，结构上产不出分片——此条是防历史遗留的空转闸，真正拦死链的是下一条 | 机器 | 出现 `general-2.md` 分片 |
| catalog 每条链接指向存在的族文件 | 抽 SKILL.md `SLOT:catalog` 区间里所有 `references/components/*.md` 链接，逐一 `existsSync` == 真存在（独立于下方 renderCatalog 不变式：无论 catalog 列了谁，它带的链接都不许够不着）| 机器 | 路线图族（如 navigation）漏出一条 `navigation.md` 死链 |
| props == 源码 | 用**抽取逻辑**（ts-morph 扫组件目录，读导出的 `*Props` / 命令式面 `*Config`·`*Static`，跳 `@internal`）从组件源码算出期望的接口块 == 产物里的接口（读源比对，**不跑 build:refs、不动 git**） | 机器 | 手改了 props、与源码漂移 |
| catalog 派生自 families 表·只列已建族·非手维护 | `renderCatalog(builtFamilyRows(parseFamilies(component-families.md), 组件参考目录))` == SKILL.md 的 `SLOT:catalog` 区间（§1 已保证 SKILL == README，比一处即可）。`builtFamilyRows` 把族表过滤到「`<族>.md` 已落盘」的族——与 build:refs 注入时同一份判据，路线图族不出链 | 机器 | 手加了族、没进 FAMILIES 表；或族表列了源码尚无对应组件的族、catalog 却仍为其出链 |
| 主题无关·整文件无越界痕迹 | **整文件** grep（不止 ```fences```）无：`animal` / `--animal-` / `Animal Crossing`、源 hex `#[0-9a-fA-F]{3,8}`、非 active 站名（denylist = `sites/` 目录名去掉当前 `activeSite`）。components/ 主题无关，不该出现任何主题值 / 迁移由来 / 他站名 | 机器 | 组件文件混进 hex / `animal` 溯源 / 他站名 |
| 用例/Notes 真实可用、非编造 | LLM 抽查一族：tsx 用例引用真实 props、Notes 是真约束（如「Select 仅受控」） | agent判 | 用例用了不存在的 prop |

### 5.5 `references/theme-presets/`（预置全备 · 站集合 == #7）

| 查什么(白话) | 怎么算过(命令/grep/diff 或判据) | 类型 | 不过长啥样(失败例子) |
|---|---|---|---|
| 预置站集合 == 可发布站 | `theme-presets/` 下的子目录名（排序）== `listPublishableSites()`（#7 三件套判据）——不多一站、不缺一站 | 机器 | 某可发布站漏出预置；或多出个残留站目录 |
| 发布默认站有预置 | 发布默认（本仓库 `activeSite`）∈ 预置站集合 | 机器 | 默认站三件套不全、却被当默认 |

> §6 / §8 / §9 对 **`<可发布站>` 每一站的预置** 各跑一遍（占位符即 `theme-presets/<站>/…`），全站全绿才算过。§7 design-rules 是全局单份、不进预置。

### 6. `references/theme-presets/<站>/tokens.css`（生成 · 每可发布站一份）

| 查什么(白话) | 怎么算过(命令/grep/diff 或判据) | 类型 | 不过长啥样(失败例子) |
|---|---|---|---|
| == contract + 该站 adapter 合并 | `mergeTokens(contract, sites/<站>/adapter, 站)` 的输出（含头部 `generated for site: … DO NOT EDIT` 行 + `:root` 体）== 该站预置 `tokens.css`（纯函数算期望、比对；**不跑 build:skill、不动 git**） | 机器 | 手改 hex、与合并结果不符 |
| 顶部 DO NOT EDIT 行 | grep 首行含 `generated`+`DO NOT EDIT` | 机器 | 缺标记 → 验收 grep 兜不住 |
| 单个 `:root` | `grep -c '^:root'` == 1 | 机器 | contract/adapter 两个 `:root` 直接拼 |
| 全 `--stitch-*` 前缀 | 所有自定义属性名匹配 `^--stitch-` | 机器 | 混进 `--refero-*`/`--ant-*` |
| 派生 `color-mix()` 未被求值 | contract 里以 `color-mix()` 定义的派生 token，合并输出里**逐一仍是 `color-mix()`**（对派生集合**逐项**核，非「全文含 `color-mix` 即过」；某主题若 adapter 把某派生 token 覆盖成静态值，则该 token 不参与此检查） | 机器 | 派生被算成静态 `#...` → 换主题不跟随 |

### 7. `references/theme/design-rules.md`（生成 · 拷贝 · 全局单份）

| 查什么(白话) | 怎么算过(命令/grep/diff 或判据) | 类型 | 不过长啥样(失败例子) |
|---|---|---|---|
| == 源逐字（全局源、拷贝无加工） | `diff SKILL_DIR/references/theme/design-rules.md docs/design-system/design-rules.md` == 空（源是全局的、与主题无关，故这份拷贝天然主题无关；单份、不进任何预置） | 机器 | 副本被手改、与源漂移；或被复制进某预置目录 |

### 8. `references/theme-presets/<站>/rules.md`（生成 · 拷贝 · 每可发布站一份）

| 查什么(白话) | 怎么算过(命令/grep/diff 或判据) | 类型 | 不过长啥样(失败例子) |
|---|---|---|---|
| == 该站 rules 逐字 | 对每个可发布站，`diff theme-presets/<站>/rules.md sites/<站>/rules.md` == 空 | 机器 | 副本手改、与 `sites/<站>/rules.md` 不符 |

### 9. `references/theme-presets/<站>/style.md`（生成 · 每站招牌散文 · 源为 skill-blurb.md）

> 预置的 `style.md` = 该站 `sites/<站>/skill-blurb.md` 的两段（`## description` / `## style-paragraph`）逐字。原本烤进 SKILL.md frontmatter 的招牌散文下沉到此，随 active 读时解析后在 body 呈现。`skill-blurb.md` 仍是人审源（顶部 human-approved）。

| 查什么(白话) | 怎么算过(命令/grep/diff 或判据) | 类型 | 不过长啥样(失败例子) |
|---|---|---|---|
| 两段结构齐 | grep 含 `## description` 与 `## style-paragraph` | 机器 | 只有一段、或标题拼错 |
| == 该站 skill-blurb.md 两段 | `parseBlurb(style.md)` 两段 == `parseBlurb(sites/<站>/skill-blurb.md)` 两段（逐字） | 机器 | style.md 手改、与源 blurb 漂移 |
| description ≤ 1024·无 hex / style 一段·无 hex·只招牌尺寸 | `lintBlurb`：`## description` ≤ 1024 且无 hex；`## style-paragraph` 一段、无 hex、只留 hero 字号/卡片圆角/区块间距几个尺寸 | 机器 | 段里写死 `#fbe1d1`；或复述整张 token 表 |
| 忠实 DESIGN.md、无编造 | LLM 读该站 blurb vs `sites/<站>/source/DESIGN.md`：每句可溯源、没借别站 | agent判 | blurb 编了 DESIGN.md 没有的视觉词 |
| 人最后定稿签字 | `sites/<站>/skill-blurb.md` 顶部注释含 human-approved；维护者一眼过（唯一人工闸） | 人签 | 未审直接发布 |

---

## 与 `check:skill` 的关系

**都是下游，规则在上游。** 本文与 `check:skill` 是同一套验收标准的人读面 / 机读面，谁都不是规则的出生地——机器档的规则**来源**是 ① agentskills.io 官方规格、② pipeline 源码/设计（[skill 构建流程](./skill-build-pipeline.md) + 各 build 脚本）。**规则在上游改，本文与 `check:skill` 一起跟**；真冲突时以上游为准（AGENTS.md：源代码 > 文档）。

**落地对应**：上表**每条机器行 ↔ `check:skill` 一条或一组断言**（grep/diff/wc/token 计数/`skills-ref validate` 封装），退出码即「机器档全过」；agent判、人签不进 CI 硬门，由评审步与发布前人工闸兜。

**别手写两份**：实现 `check:skill` 时，本文机器档与脚本应共用**单一断言源**——一份带「白话标签 + 可执行判据」的清单，文档表格与脚本都从它派生/读它（同 `component-families.md → catalog` 的单源做法），否则两份手工副本必漂。若过渡期先手写脚本，则本文为人读正本、脚本与本文不符即修脚本。
