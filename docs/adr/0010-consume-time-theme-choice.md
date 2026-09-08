# skill 主题：发布时定默认 → 消费时可切（预置全备 + 消费侧指针 + 读时解析）

skill 不再在 `build:skill` 时把 `activeSite` 那**单套**主题烤进 `references/theme/*`。改为：`build:skill` 为**每个可发布站**（[listPublishableSites](../../scripts/lib/publishable-sites.mjs)，#7 三件套判据）各生成一套预置 `references/theme-presets/<站>/{tokens.css, rules.md, style.md}`；「哪套生效」的决定权从**发布时**搬到**消费时**——消费项目根 `stitch.config.json` 的 `activeSite` 指针在 skill **被读时**解析，选中对应预置；无指针则回落**发布默认**（= `build:skill` 当时的 `activeSite` = npm 包默认皮，[ADR 0007](./0007-active-site-single-switch.md)），两侧默认同名对齐。

**不变式不破**（[ADR 0005](./0005-single-skill.md)）：skill 仍是全系统唯一的 skill，任一时刻仍只呈现**一套**主题——变的只是「哪套」的决定权归属（发布时 → 消费时），不是「同时呈现多套」。预置全备是让「可切」有得选，读时解析 + 单指针保证「任一时刻仍单套」。

三处落点：

1. **预置全备**（`build:skill`）：`references/theme-presets/<站>/tokens.css` = `mergeTokens(contract, sites/<站>/adapter.css, 站)`（仍走同一 [mergeTokens](../../scripts/lib/merge-tokens.mjs)，H4 不变量逐份持有）、`rules.md` = `sites/<站>/rules.md` 逐字节、`style.md` = 该站 `skill-blurb.md` 的 `## description` / `## style-paragraph` 两段逐字。站集合 == #7 判据（与 #8 `themes/*` 导出面同一集合，两发布面永不劈叉）。
2. **读时解析**（SKILL.md「Current style」节 + [resolve-preset.mjs](../../scripts/lib/resolve-preset.mjs)）：先读消费项目 `stitch.config.json.activeSite`（无文件 / 无该键 / 文件损坏 → 回落发布默认，从不抛错），据此读 `references/theme-presets/<active>/*`。发布默认站名由 `build:skill` 注入 SKILL.md 的 `SLOT:default-site`（生成物，非手写写死）。
3. **description 主题中性**：frontmatter `description` 改为讲**设计系统本身**（可换肤 `--stitch-*` 角色契约 + 组件库），不讲某套皮、无站名、无招牌风格词；原招牌风格散文下沉到各预置的 `style.md`，随 active 解析后在 body「Current style」节呈现。全局 `references/theme/design-rules.md` 仍主题中立、单份、不动。

## 修订/引用的既有决策

- **[ADR 0005](./0005-single-skill.md)（单一 skill 嵌当前主题）**：不变式仍持——唯一 skill、任一时刻单套。**细化**：「当前主题」不再是发布时烤死的那一套，而是消费侧指针在读时选中的那一套；换主题从「重跑 `build:skill` 换烤入快照」变为「改消费项目指针」（skill 本身不重发布）。skill 里主题相关的值仍只存在于 `references/`（现为 `theme-presets/<站>/`），散文仍引用不内联。
- **[ADR 0007](./0007-active-site-single-switch.md)（`activeSite` 单一开关）**：`stitch.config.json.activeSite` **细化为两层同名指针**——① 本仓库 `activeSite` = **发布默认**，驱动 `vite build` 的 `dist/style.css` 与 `build:skill` 注入的 SKILL.md `SLOT:default-site`（两条构建仍读同一字段、仍共用 `mergeTokens`）；② 消费项目 `activeSite` = **消费侧指针**，读时解析选预置。两处**同名语义**：预览侧（`data-site`，[ADR 0009](./0009-themes-preview-export.md)）与开发侧（指针）填同一站名即整体对齐。「一个字段翻转两产物一致」在本仓库内仍成立；对外多了一层「消费项目可自定」。
- **#7 单判据不变式**：两个发布面——A（`themes/*` emit，[ADR 0009](./0009-themes-preview-export.md)）与 B1（skill presets，本 ADR）——收录**同一「可发布站」集合**（[listPublishableSites](../../scripts/lib/publishable-sites.mjs)，三件套齐全）。判据单点定义、两面都调它、脚本零写死站名——能预览的站必定能用 skill 开发，永不劈叉。

## Considered Options

- **维持「发布时烤死单套」**：skill 结构最简、任一时刻单套天然成立；但换主题必须重跑 `build:skill` + 重发布 skill，消费方无法自选，与 #8 `themes/*` 的「消费侧零重发布切主题」能力不对称（预览可切、开发不可切 → 劈叉）。
- **每个站各发一个 skill（per-site skill）**：直接违反 [ADR 0005](./0005-single-skill.md)。
- **预置全备 + 消费侧指针 + 读时解析 ← 采用**：唯一 skill、任一时刻单套（不变式不破），换主题只改消费项目指针（skill 不重发布、per-project、与 #8 预览侧同名对齐），发布默认保证零配置消费方与 npm 默认一致。代价是 skill 体积多带 N-1 套预置 CSS——可接受（预置是按需读取的 `references/`，非常驻 SKILL.md 预算）。

## Consequences

- `build:skill` 产物从「单套 `references/theme/{tokens.css,rules.md}` + SKILL.md 两槽（description/style-paragraph）」变为「`references/theme-presets/<站>/{tokens.css,rules.md,style.md}` 全备 + 全局 `references/theme/design-rules.md` + SKILL.md `SLOT:default-site` 一槽」。幂等与「零随机」性质不变。
- 「换主题隔离」从**构建期**（换 `activeSite` 重跑，仅 `theme/*` + 槽变）转为**读时**语义：所有预置共存于 skill，切消费指针只改「AI 读哪套预置」，skill 文件本身零变化；全局 `design-rules.md` 单份、不随主题。
- 机器档随之更新：[check-skill.mjs](../../scripts/check-skill.mjs) / [skill-acceptance.md](../contributing/skill-acceptance.md) 从「单套 `references/theme/*`」改为「`presets/<站>/*` 全备（站集合==#7）+ description 主题中性 + `SLOT:default-site` + 读时解析/换主题隔离」；[check-boundary.mjs](../../scripts/check-boundary.mjs) 的 ds-surface 面纳入 `references/theme-presets/**`（主题值合法、只禁 animal/旧包名）。
- 与 [ADR 0009](./0009-themes-preview-export.md) 合起来给出完整回路：**预览侧** `import themes/<站>` + 翻 `data-site`，**开发侧** 改 `stitch.config.json` 指针 + skill 读时解析——两侧同一站名即对齐（写指针的 reset-theme skill 见 #10）。
