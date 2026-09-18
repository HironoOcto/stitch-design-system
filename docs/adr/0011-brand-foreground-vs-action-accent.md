# 品牌前景色 vs 主行动色分离（新增 `--stitch-brand` 前景角色，默认继承 `--stitch-accent`）

> 状态：**已接受（Accepted，2026-09-12，维护者拍板）** —— 决策见下「决策（已定）」。据此落 [contract.css](../../packages/tokens/contract.css)、`sites/phantom/adapter.css` 与相关组件，并同步机器档（`check:skill` / `check:boundary` / skill-acceptance）；落地见 GH #22。

## 背景与问题

契约里与「品牌」相关的槽只有一个：`--stitch-accent`，注释明写「主行动色（CTA 填充，**可为浅色**）」。但组件把这**一个**槽同时当成了**两种**东西用：

1. **填充**（对的）：Button 主钮底、Calendar 选中日底、Progress 填充……
2. **前景强调**（问题所在）：NavigationMenu 当前项文字、Select 选中项文字/勾、品牌图标描边、Form 校验中提示——这些是「画在 canvas 上、要被读的品牌前景色」。

当 `--stitch-accent` 是深/饱和色时，第 2 类用法碰巧也成立；但契约既然允许它「可为浅色」，把它当前景文字就**没有对比度担保**。phantom 把这个矛盾第一次逼了出来。

扫三个站的 `source/DESIGN.md`，品牌模型根本不是一种：

| 站 | 品牌前景（nav 文字 / 标题 / 脊 / 图标描边） | 主行动（CTA 填充） | 是否分家 | 现状 accent-as-foreground |
|---|---|---|---|---|
| **steep** | Ink Black `#17191c`（= 正文 = nav = 填充按钮底） | 同一个 Ink Black | **不分**，一色包打 | 深色，可读 ✅ |
| **seline** | Cyan `#3ba6f1`（DESIGN 明写 "Primary CTA fill, **active links**, brand icon strokes"） | 同一个 Cyan | **不分**，一嗓到底 | 中饱和青，可读、且是本意 ✅ |
| **phantom** | Aubergine `#3c315b`（脊：nav/heading/border/icon strokes） | Ghost Lavender `#e2dffe`（浅填充 CTA） | **只有它分家** | Ghost Lavender 当文字 = **1.27:1，隐形 ❌** |

结论两条：

- **「脊 ≠ 行动」是 phantom 独有**。steep / seline 用**同一个品牌色**兼任前景与行动，且 seline 的 DESIGN **明确要**「active links = 那个 accent 青」——所以「组件用 `--stitch-accent` 当前景强调」对 steep/seline **是正确、且是本意**。
- 只有 phantom 把品牌拆成两色，而契约**只有一个品牌槽**，装不下；phantom 的脊色 Aubergine 在 token 层是**散落**在 `border-strong` / `bg-inverted` / `link` / `cat-5` 里的，**没有一个专门的「品牌前景」角色**。

因此**任何「全局把组件的前景 accent 改成别的角色」的做法都是错的**——那会把 seline 本来想要的「青色当前项/青色链接」也改掉，破坏其设计意图。病因必须收窄到 phantom 独有的「脊/行动分家」上。

## 决策

契约**新增一个前景品牌角色** `--stitch-brand`，作为「品牌前景强调色」（当前项/选中态/品牌图标描边等**要被读**的品牌色），并且：

```css
/* contract.css —— 【派生·默认跟随 accent；站可覆盖为独立品牌前景色】 */
--stitch-brand: var(--stitch-accent);
```

- **默认 `= var(--stitch-accent)`** → steep / seline **零变化**（它们本就想用 accent 当前景，不覆盖即继承）。
- **只有 phantom 在自己的 adapter 覆盖** `--stitch-brand: #3c315b;`（Aubergine 脊色，on canvas 11.52:1，达标）。
- 组件里的**前景品牌强调**（NavigationMenu 当前项、Select 选中项文字 + 勾、Select 展开箭头）改读 `var(--stitch-brand)`；**填充**仍读 `var(--stitch-accent)`。（Form「校验中提示」不在内——见「决策（已定）」第 2 条。）

这样「脊 vs 行动」在契约里正式分家：各站按自己的 DESIGN 决定「要不要分、分成什么」，**没有任何站被误伤**。

## 与 `--stitch-link` 的分工（三者别再混）

| 角色 | 语义 | 谁读 |
|---|---|---|
| `--stitch-accent` | 主行动色 · **填充**（可为浅色，不担保前景可读） | Button 主钮底、选中日底、Progress 填充… |
| `--stitch-brand` | 品牌**前景强调**（当前项/选中态/品牌图标，要被读） | NavigationMenu active、Select selected、品牌图标描边… |
| `--stitch-link` | 内容**超链接**文字色 | 正文里的 `<a>`（Collapse 面板、ChatMessage 气泡…） |

之前的错误正是把这三者当成一个：组件拿 `--stitch-accent`（填充角色）去当前景强调，我又一度用 `--stitch-link`（链接角色）去顶前景强调——两者语义都不对，只是在 phantom 里值恰好都 `#3c315b`。本 ADR 把三者拆清：**内容链接归 `--stitch-link`（各站已各自填对，属独立 bugfix）；品牌前景强调归新 `--stitch-brand`；填充留 `--stitch-accent`。**

## Considered Options

- **A · 什么都不改**：phantom 前景强调持续隐形（1.27:1），且是 WCAG 硬伤。否。
- **B · 全局把组件前景 `--stitch-accent` 改成 `--stitch-link`（或某固定角色）**：破坏 seline 本意（它要 active links = 青 = accent），steep 也被无谓改动。**否**（这正是本 ADR 要防的「草率改」）。
- **C · 只在 phantom adapter 里改**：做不到——adapter 只能改**值**，改不了「组件读哪个变量」；组件读的是 `--stitch-accent`，adapter 无法让某组件在某站转读别的槽。否。
- **D · 新增 `--stitch-brand`，默认 `= var(--stitch-accent)`，phantom 覆盖 ← 采用**：脊/行动在契约正式分家；默认继承 accent 保证 steep/seline 零迁移、零回退；只有真正分家的站（phantom）付出「adapter 多一行」的代价；组件把「前景强调」这一类从填充槽迁到前景槽，语义就位。

## Consequences

- **契约公开面 +1 角色**（H2）：`--stitch-brand`，标 `【派生·默认跟随 accent；站可覆盖】`。因默认是 `var(--stitch-accent)` 活表达式，经 `mergeTokens` 合并时**原样保留、不求值**（H4 不变量不破）。
- **零迁移**：steep / seline 不写 `--stitch-brand` → 继承 accent，观感与行为完全不变；仅 phantom adapter 加一行 `--stitch-brand: #3c315b`。
- **组件改动**：把「前景品牌强调」用法（nav 当前项 / select 选中项·勾 / 品牌图标 / 校验中提示）从 `var(--stitch-accent)` 迁到 `var(--stitch-brand)`；`border-color` 之类填充/描边语义与 Button 家族**不迁**。
- **机器档**：`check:skill` / skill-acceptance 的 tokens 断言纳入新槽（合并出的 tokens 含 `--stitch-brand` 且为未求值 `var()`）；`check:boundary` 无新增豁免。`design-rules.md` 角色清单补 `--stitch-brand` 一行、讲清与 `--stitch-accent` / `--stitch-link` 的分工。
- **相关但不在本 ADR 内**：`--stitch-focus-ring`（= accent）在 phantom 上同样浅到不可见（1.27:1）——那是**另一条**「派生自 accent 的角色在浅 accent 站失效」的线，留作后续（可能同样受益于「默认跟随 accent 但站可覆盖」的手法）。本 ADR 只解「品牌前景强调」。

## 决策（已定，2026-09-12）

1. **角色命名 = `--stitch-brand`**（语义清晰；否决 `--stitch-accent-fg`）。
2. **迁移范围 = nav 当前项 / Select 选中项 + 勾 / Select 展开箭头**。**Form「校验中提示」剔除**——它是「进行中/状态」语义，本就该走**语义色【恒定】层**（`--stitch-info` 等，跟主题无关），不属「品牌前景强调」。本批不动它（保持现状 = 仍 `--stitch-accent`）；若要把它从 accent 挪到语义色，另开 issue，与本 ADR 无关。
3. **hover：不需要 `--stitch-brand-hover`**——上述迁移的三处经核实**均无 hover 变色态**（静态色），故无伴生 hover 槽。（有 hover 的只有内容链接，归 #19、已用内联 `color-mix` 处理。）
4. **`--stitch-focus-ring` 不并入本 ADR**——维持现状（`= var(--stitch-accent)`）。phantom 聚焦环偏淡是已知项，如需治另开 issue，不在本次范围。

## 引用

- 现状病灶与三站证据：本会话对 phantom 复核的延伸发现。
- 相关 issue：内容链接 bugfix（`<a>` → `--stitch-link`）见 GH #19；本 ADR 落地（新增 `--stitch-brand` + phantom 覆盖 + 组件前景强调迁移）见 GH #22。
- 相关角色定义：[contract.css](../../packages/tokens/contract.css)、[design-rules.md](../design-system/design-rules.md)。
