# 页面尺度层（新增 `--stitch-space-*` / `--stitch-text-*` / layout 四键，从 `variables.css` 确定性生成）

> 状态：**已接受（Accepted，2026-09-13，维护者拍板）** —— 决策见下「决策（已定）」。据此新增 `build:layout` 生成器 + 每站 `sites/<site>/layout.css`、扩 `mergeTokens` 为三输入、`contract.css` 间距旧名退化为别名，并同步正本（[multi-site-theming §9.4.3+](../design-system/multi-site-theming.md)、[design-rules.md](../design-system/design-rules.md)）、机器档（`check:skill` / `check:boundary`）与运行时/demo。落地见 GH issue（见「引用」）。

## 背景与问题

组件只读的角色契约 `contract.css`（插座，见 [ADR 0004](./0004-token-source.md)）明写自己只收「**经真实组件验证的基线字段**」。这对组件是对的，但它把一批**页面级**内容有意识地挡在了 token 层之外，塞进了 `rules.md` 散文：

- **间距**：契约只有 `--stitch-spacing-xs/sm/md/lg/xl`（4–24）；四站 `variables.css` 的真实尺度冲到 128/160px。
- **字阶**：契约只有 `--stitch-font-size-sm/base/lg/display` + 恒定 `--stitch-line-height-base: 1.5`；四站有 `caption/body-sm/body/body-lg/subheading/heading-sm/heading/heading-lg/display`（+saybriefly `micro`）整梯，每档带 size + leading + 可选 tracking。
- **Layout 度量**：`--page-max-width` / `--section-gap` / `--card-padding` / `--element-gap` 契约里**一个槽都没有**，只活在散文里；而 `section-gap` 逐站变化（steep 80 / phantom 64 / seline 96 / saybriefly 64），是真实的风格杠杆。

`steep/adapter.css` 末尾注释自承这一点：「区块留白节奏属构图 → 归 rules.md Layout，不在 token 层」。

**后果**：当 AI 用本 skill 做**页面/布局**（SKILL.md description 明确宣称支持 "a page, dashboard, landing/marketing section"），而手上**没有适用组件**时，它在 `--stitch-*` 里找不到 >24px 的间距、找不到 layout 度量、只有 4 档字号。`react-project.md` 一边要求「never hard-code px」，一边没给这些 token → 自相矛盾。换站时这些写死的布局值也不会随主题重排，破坏多站换肤在页面层的承诺。

**关键证据（可抽象性）**：四站 `variables.css` 是 Refero 输出的**同构 `:root`**。对我们要补的三组，命名规约**统一**：Layout 四键逐字相同；字阶一律 `--text-<角色>`/`--leading-<角色>`/`--tracking-<角色>`（角色取自同一闭合词表，各站填子集）；间距一律 `--spacing-<px>`。而我们**不补**的那几组（原始圆角 `sm/md/…` + `-2` 消歧后缀、逐元素 named radii 集合、阴影 `subtle/-2/-3`、字重 `wNNN`）命名恰好**不统一**——这反向印证了范围切分。

## 决策

新增一层 **页面尺度层（layout-scale）**：仍用 `--stitch-*` 前缀（这才是一套设计系统），承载三组「约定俗成、跨站同构、能 token 化」的值，**从每站 `source/variables.css` 确定性生成**，折入同一份合并 `:root`。

1. **范围（Tier 1 全收）**：
   - Layout 四键：`--stitch-page-max-width` / `--stitch-section-gap` / `--stitch-card-padding` / `--stitch-element-gap`。
   - 全字阶：`--stitch-text-<角色>` + `--stitch-leading-<角色>` + `--stitch-tracking-<角色>`，角色词表 = `micro/caption/body-sm/body/body-lg/subheading/heading-sm/heading/heading-lg/display`（稳定超集，站填子集）。
   - 全间距：`--stitch-space-<n>`（4px 网格超集）+ `--stitch-space-unit`（元数据）。
   - **不收**（留 `rules.md` 散文 / 现契约）：逐元素圆角长尾（nav/tags/links/feature-card…）、字重梯、阴影。

2. **固定 schema + 缺则不提供**：统一的是**命名/角色词表**（稳定公开清单），不是「每槽必有值」。每站生成文件**只含它真有的档位**；某站缺的角色就是没有——**不发明中性默认、不设带默认的基底契约文件**。理由：换肤是构建时切、一个部署一套主题，AI 针对**当前激活站**写页面、只用该站真有的档（`rules.md` 已写明本站用哪几档），「缺角色」在真实路径不会被触发；为它注入「不属于任何站的默认值」得不偿失。未来新站若冒出**词表外的新角色名**，是一次普通的词表加项（罕见、显式）。

3. **确定性生成，非手写**：`sites/<site>/layout.css` 由新脚本 `build:layout` 从该站 `variables.css` 机械改名映射（`--text-*`→`--stitch-text-*`、`--spacing-<n>`→`--stitch-space-<n>`、四 layout 键加 `--stitch-` 前缀）产出，标 `DO NOT EDIT`、committed。**区别于手写的 `adapter.css`**——adapter 要大量判断（多档灰收敛、accent 角色裁定、对比度复核），而本层几乎零判断（角色名直映、值直搬）。归一化规则仅三条（见下「决策（已定）」）。

4. **P1：全量尺度为唯一真相，组件旧名退化为别名（不改名、不迁组件）**：
   - 间距能干净统一：`contract.css` 的 5 个旧名改成带字面量兜底的别名 `--stitch-spacing-md: var(--stitch-space-12, 12px);`……组件**一字不改**（仍读 `--stitch-spacing-md`），值解析恒等；缺 `space-4` 的站（saybriefly）兜底回 4px（= 今日行为）。
   - 字号/行高**不强行统一**：组件的 `--stitch-font-size-*` 是**控件文字尺寸接口**，与编辑级页面字阶 `--stitch-text-<角色>` 并非 1:1（seline `body-lg`=16 而 `font-size-lg`=20，硬对齐会改值）——二者是**不同层**、非重复，文档讲清分工即可。
   - **给 AI 的心智**：写页面用 `--stitch-space-*` / `--stitch-text-<角色>` / layout 四键这一套完整尺度；`spacing-xs..xl` 与 `font-size-*` 是组件内部接口，写页面不用管 → 对 AI 就是「一套尺度 + 一小块标注的组件内部别名」，不混乱。

5. **三输入合并 + 运行时/demo 一致重排**：`mergeTokens` 从 `(contract, adapter)` 扩成 `(contract, layer, adapter)`，adapter 仍最后胜；包与 skill 仍共用这一份（[ADR 0007](./0007-active-site-single-switch.md) 不破）。因此运行时烤死的 `dist/style.css`（虚拟模块）、skill 预置 `tokens.css`（折入一个文件）**同时**拿到新层。运行时可切 `/themes/<site>`（`scope-theme.mjs`）与 demo（`demo/theme.ts`）也连 layer 一起作用域化，**切主题/切站时 layout 与字阶随之重排**。

## Considered Options

- **A · 什么都不改（只散文）**：页面层继续写死字面量、换站不重排、与 no-hardcode 规则冲突。否。
- **B · 把 layout 塞进 `contract.css` + `adapter.css`**：污染「组件验证」不变量——加入无组件消费的死字段，每个 adapter 被迫填死槽，契约再也无法以「组件是否验证过」守边界。否。
- **C · 另起一套并行数值系统、完全不碰契约**：消费方只看到一份合并 CSS，`--stitch-spacing-md` 与 `--stitch-space-12` 并存被当成重复又矛盾，AI 混乱。否（消费侧可读性优先）。
- **D · 新增生成的页面尺度层（`--stitch-*`）+ 折入一份 `:root` + P1 别名 ← 采用**：契约只含组件角色（守 B 反面），新层承载页面尺度且跨站同构可重排，旧名退化为别名使消费侧是「一套尺度」，生成而非手写使接入零判断、零漂移。

## Consequences

- **契约公开面**（H2）：新增 `--stitch-space-*` / `--stitch-text-<角色>` / `--stitch-leading/tracking-*` / layout 四键为新 `--stitch-*` 公开 API；`contract.css` 间距 5 行由字面量改为 `var(--stitch-space-N, 旧值)` 别名（字号/行高不动）。
- **新生成不变量**（H6，本 ADR 引入）：`sites/<site>/layout.css` = `build:layout` 从 `variables.css` 确定性生成（幂等、`DO NOT EDIT` 头、只含 `--stitch-*`、零源 hex/长相名、缺角色不提供）；`mergeTokens` 三输入、adapter 最后胜。由 `build-layout.test` + 扩展的 `check-boundary`/`check-skill` 守护。
- **扩 H4**：三输入合并后仍单一 `:root` + `DO NOT EDIT` + 派生 `var()` 原样保留（别名里的 `var(--stitch-space-N, …)` 亦不求值）。
- **组件零行为变更**：P1 值恒等，但仍须重跑 `ci`（组件单测 + a11y）确认绿——这是**重验**，非改行为。
- **接入新站 +1 步（确定性）**：除手写 `adapter.css` + `rules.md`，加一条 `build:layout <site>` 生成 `layout.css`（无人复核裁值，仅解析 + 命名合规）。
- **运行时/demo**：`scope-theme.mjs` 与 `demo/theme.ts` 纳入 layer → 切主题/切站 layout 重排；包 `/themes/<site>` 层体积随之含新层每站值。
- **与 [ADR 0004](./0004-token-source.md) 的边界**：0004「不上 `tokens.json` 生成器」约束的是**组件 adapter**（值要判断、保持手写，直到 §9.7 信号）。本层是**另一个均质关注点**（layout/间距/字阶在 Refero 输出里已同构、几乎零判断），对它做确定性生成**不违反** 0004——0004 管的是「哪个色是什么角色」这类需裁定的绑定，本层不碰那类。

## 决策（已定，2026-09-13）

1. **命名前缀 = `--stitch-*`**（同一套设计系统）；间距新名 `--stitch-space-<n>`（与旧 `--stitch-spacing-<档>` 区分词干，避免视觉撞名）。
2. **P1**：契约间距旧名退化为 `var(--stitch-space-N, 旧字面量)` 别名（改 `contract.css` 5 行）；字号/行高保持为控件层、与页面字阶分层并存、文档讲清；**否决** P2 全量改名迁移（源码 600+ 处 + 破公开 API + 重验全部）。
3. **缺则不提供**：无基底默认文件、不发明跨站默认；固定的是命名/词表，非「每槽必有值」。
4. **归一化三条**（生成器内）：① phantom `--element-gap: 8-16px` 区间 → 取**下界 8px** 作 token，「8–16 弹性」留散文；② saybriefly 8px 基 → 走 4px 网格超集（8 的倍数天然落格）；③ `--spacing-unit` → `--stitch-space-unit` 作元数据带上。
5. **预置折入一个文件**：skill 预置里新层**折入现有** `references/theme-presets/<站>/tokens.css`（不另开 `layout.css`），使 AI 读一个 token 文件即见完整尺度。
6. **运行时 + demo 纳入本次**：scope-theme / packaging `/themes/<site>` / demo 一并改,保证运行时切主题与 demo 切站 layout 一致重排。

## 引用

- 缺口证据与四站 `variables.css` 同构性：本会话对四站 source 的系统对比。
- 相关 ADR：[0004](./0004-token-source.md)（token 源 = CSS 契约 + adapter；本层的生成边界）、[0007](./0007-active-site-single-switch.md)（单一 `mergeTokens` 共用，三输入后仍成立）、[0010](./0010-consume-time-theme-choice.md)（预置消费时解析）。
- 正本与落地：[multi-site-theming.md](../design-system/multi-site-theming.md) §9.4.3+（值层扩为 手写 adapter + 生成 layer）、[design-rules.md](../design-system/design-rules.md) 规则1、[contract.css](../../packages/tokens/contract.css)、[merge-tokens.mjs](../../scripts/lib/merge-tokens.mjs)；落地分 3 个 GH issue（页面尺度层地基 → 折入预置+校验+消费文档 → 运行时/demo 重排）。
