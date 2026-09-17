# 合成层（composition trait）作为第二风格源 —— 从真站探测生成、落 `sites/<site>/composition.md`

> 状态：**已接受（Accepted，2026-09-15，维护者拍板）** —— 决策见下「决策（已定）」。据此确立 `sites/<site>/composition.md` 为一个站长相的**第二个来源**（`source/DESIGN.md` 之外），由 [`scripts/emergent-probe.js`](../../scripts/emergent-probe.js) 对真站探测 + [涌现层验收协议](../contributing/emergent-layer-acceptance.md) 验收产出，并同步正本（[multi-site-theming §9.9](../design-system/multi-site-theming.md#99-合成层-compositionmd第二风格源探测生成)、[CONTEXT.md](../../CONTEXT.md)）。生成/复核流程落 [onboard-composition.md](../contributing/onboard-composition.md)。落地见 GH issue（见「引用」）。

## 背景与问题

一个站的长相在本系统里有**唯一下载来源** `sites/<site>/source/DESIGN.md`（Refero 存档，见 [multi-site-theming §9.3](../design-system/multi-site-theming.md#93-输入refero-bundle5-文件消费映射)）。它把值抽得准——色 / 字阶 / 圆角 / 阴影 / 间距这些**能塞进单个 `--stitch-*` 槽**的字段，`adapter.css` 与页面尺度层 `layout.css` 各取所需（后者见 [ADR 0012](./0012-page-scale-layer.md)）。

但一个站真正「亮眼」的部分，往往**不是单值**：满屏的位图 mesh 渐变铺底、SVG 颗粒叠层、`mix-blend-mode: overlay`、一幕 `rgb(18,18,18)` 暗区、浮动卡的 `backdrop-filter: blur(16px)` 毛玻璃、标题里一处 `<em>` 斜体设备、以及「刻意拒绝」（steep 桃色一页 ≤1 次、绝不当背景）。这些要**多图层 / 定位 / 滤镜 / 混合 / 或否定**才成立，换肤跟不了单个变量——本仓库术语叫**合成层（composition trait）**（[CONTEXT.md](../../CONTEXT.md#长相的两层捕获--验收用)）。

**问题**：`DESIGN.md` 对合成层**系统性漏、甚至写反**。实证——`sites/steep/source/DESIGN.md`:200 写死「No photography, no illustration, **no abstract graphics**」，而真站 `https://steep.app` 满屏是位图渐变铺底 + `feTurbulence` 颗粒 + 一幕暗区（探针实测，见 [验收协议样例](../contributing/emergent-layer-acceptance.md#首个验收样例steep真跑)）。这类漏是**静默**的：不报错、不 lint 红，只是照 `DESIGN.md` 复刻出来「变丑」（丢掉全部高级感）。靠人眼逐站抽查必漏——四站里 steep 是「错」的那个，seline 才验证过忠实。

**为什么不能改 `DESIGN.md` 补**：它是 Refero **下载存档**，享有「存档不变量」（不手改，改了就无法与源核对、失去回溯锚）——同 `source/` 里其它 bundle 文件。合成层的缺、以及 `DESIGN.md` 的勘误（写反/漏），需要一个**不污染存档**的落点。

**类比 [ADR 0012](./0012-page-scale-layer.md)**：0012 面对的是「`DESIGN.md`/`variables.css` 有一批**值**（页面尺度）没进 token 层」，答案是新增一个**从 `variables.css` 确定性生成**的第二值文件 `layout.css`。本 ADR 面对的是「`DESIGN.md` 有一整层**长相描述**（合成层）漏了/反了」，答案同构：新增一个**从真站探测产出**的第二风格文件 `composition.md`。差别只在生成方式——尺度层近似零判断（机械改名），合成层是探针**捕获全** + 人**判归宿**（探针不解释设计意图）。

## 决策

确立 **合成层第二风格源** `sites/<site>/composition.md`：`source/DESIGN.md` 之外，一个站长相的**第二个来源**，专记合成层。

1. **单槽判据（值槽 vs 合成层的唯一分界）**：
   - **能塞进一个 `--stitch-*` 单槽 → 值槽**：归 `adapter.css`（角色契约值）或 `layout.css`（页面尺度值）。`DESIGN.md` 抽取的强项，不归本层。
   - **需多图层 / 定位 / 滤镜 / 混合 / 否定 → 合成层**：归 `composition.md`。判据不是「填满几个轴」——设计意图开放，第 N 个站会冒新花样；通用性来自**浏览器能画的东西是封闭的**（CSS 绘制模型成文有限），探针扫这个封闭基底，任何合成特征被画出来就一定被捕获（[emergent-probe.js](../../scripts/emergent-probe.js) 头注、[判据](../contributing/emergent-layer-acceptance.md#判据单槽测试)）。

2. **探测生成，非手写想象**：`composition.md` 由 AI **对真站**跑 `emergent-probe.js`（滚到底触发懒加载）→ 拿真站合成信号 JSON → 按 [涌现层验收协议](../contributing/emergent-layer-acceptance.md) 三步（跑探针 / 三类缺陷 diff / 验收判据）产出。**锚在「真站实际画了什么」**，不是「照 DESIGN 散文想象」。区别于 `layout.css` 的确定性生成——本层探针**只保证捕获全**，每条信号**该落哪一层**（契约新槽 / `rules.md` / 纯内容 / Don't）仍是设计判断（运动员 agent 做、裁判 agent 复核，非探针代劳；判断≠真人，全程可 AFK，真人只在收尾门验收）。

3. **存档不改，勘误由 composition.md 覆盖（混合体例：正文发布 + 可剥追溯）**：`source/DESIGN.md` 一字不动（存档不变量）。`DESIGN.md` 写反/漏的地方由 `composition.md` 更正、**合成层部分冲突时以 `composition.md` 为准**（它是本站合成层的**唯一真相**；值槽仍以 `DESIGN.md`/adapter 为准，两层不重叠）。**`composition.md` 采「正文正向散文 + 可剥维护者追溯表」混合体例（复用全仓的 `stripTrace` 可剥追溯机制，见 [strip-trace.mjs](../../scripts/lib/strip-trace.mjs)）**：**正文自由句**是随 skill 发给消费方的发布正文——正向陈述更正后的正确事实（「真实满屏铺底」），**零 `DESIGN.md`、不回指孪生**（`见 adapter`/`adapter.css`/`variables.css`）；**DESIGN.md 追溯、勘误、`:行号` diff、归宿建议**只落**可剥维护者位置**（顶部 `<!-- trace: … -->` 表 + 小节 `←` 尾注）+ 执行报告 / GH issue / commit。`build:skill` 迁移时走 `stripTrace` 剥掉可剥位置 → preset 只留正向散文（consumer-clean）；追溯放错到正文自由句 → `stripTrace` 零残留自检抛错、`build:skill` 失败指行（机器强制）。两个受众分离 + 生成/复核 prompt 见 [onboard-composition.md](../contributing/onboard-composition.md)。

4. **流程必跑，产物按需，不进「可发布四件套」闸门**：区分**核合成层这件事**（必跑）与**`composition.md` 这个文件**（按需）——合成层的漏/写反是**静默**的（不核就不知道 `DESIGN.md` 忠不忠实），所以**接入每个站都必跑一遍**探针 + 验收协议；跑完，该站有未记的合成层就产出 `composition.md`，`DESIGN.md` 已忠实覆盖（零 MISSING/WRONG/UNGROUNDED）就通过、无此文件（四站里 seline 即如此）。而**文件本身不进发布闸门**：可发布站判据是四件套 `{adapter.css, layout.css, rules.md, skill-blurb.md}`（[listPublishableSites](../../scripts/lib/publishable-sites.mjs)，[ADR 0012](./0012-page-scale-layer.md) 决策），`composition.md` **不在其中**——`build:skill` / `check:skill` / `build:layout` **都不读它**，缺它一个站照常可发布、构建照常绿。它服务的是复刻 / 出图消费下游（#31/#32）。这与 0012 的 `layout.css`（**是**四件套之一、缺则不可发布）**刻意相反**——尺度值是渲染必需（必产文件），合成层描述是按需产出（该站有才产）。

5. **运动员 / 裁判分离（生成 ≠ 验收）**：产出与验收是**两个 agent、两份独立 prompt**——运动员跑探针写 `composition.md`，裁判照验收协议逐条判「通过 / 需改动」、**不改产物**。同 `adapter.css` 的 onboard-site 生成 + onboard-site-review 复核（[onboard-composition.md](../contributing/onboard-composition.md) 对齐 [onboard-site.md](../contributing/onboard-site.md)）。理由：自己判自己的产出会漏（既当运动员又当裁判，验收失去独立性）。

## Considered Options

- **A · 什么都不改（合成层只活在人脑 / 复刻时临场看真站）**：每次复刻都重新肉眼抠一遍，漏得不一致；`DESIGN.md` 的写反（no abstract graphics）无处更正，误导每一个读它的 agent。否。
- **B · 改 `source/DESIGN.md` 补合成层 + 更正写反处**：污染 Refero 存档不变量——`DESIGN.md` 再也无法与下载源核对，失去回溯锚；且把「我们的判断」与「Refero 的抽取」搅在一份文件里，来源不可分。否。
- **C · 把合成层塞进 `adapter.css` / 契约**：合成层多数**不是单值**（要图层/混合/否定），塞不进 `--stitch-*` 单槽；强塞会污染「组件验证过的角色契约」不变量（同 [ADR 0012](./0012-page-scale-layer.md) Considered B 的理由）。少数能单值化的（铺底纯色、辉光阴影、图像滤镜）**将来**可提为契约新槽 `--stitch-backdrop-*`/`--stitch-glow-*`/`--stitch-image-filter`——但那是**出图消费 slice（#31/#32）**的事，本 ADR 只立「第二风格源怎么生成+验证」，不预先造槽。否（本 issue 范围）。
- **D · 靠一张「氛围/明暗/辉光/…N 轴清单」逐轴填**：清单不通用——第 N 个站的新花样落在清单外就漏，把开放的设计意图当成了封闭 schema。否（判据改用「扫封闭 CSS 绘制基底」）。
- **E · 新增探测生成的第二风格源 `composition.md`（核必跑·产物按需、不改存档、勘误覆盖、运动员/裁判分离）← 采用**：不碰存档（守 B 反面）、不污染契约（守 C 反面）、判据锚真站封闭基底（守 D 反面），且与 0012「第二值文件」同构、与 onboard-site「生成+复核」同构，复用已有心智。

## Consequences

- **新增第二风格源**（本 ADR 引入）：`sites/<site>/composition.md`——顶层（**不**在 `source/`，因它非下载、是我们产出）、按需产出（该站有合成层才有此文件）、Markdown（非 CSS，不进 `:root`、不被 `mergeTokens` 读）、**混合体例源**：正文正向散文随 skill 发给消费方（迁移时 `stripTrace` 剥掉可剥追溯 → preset consumer-clean），DESIGN.md 追溯/勘误落可剥 `<!-- trace -->` 表 + `←` 尾注。合成层冲突时压过 `DESIGN.md`。
- **`source/DESIGN.md` 零改动**：存档不变量保持；勘误全部走 `composition.md` 登记。
- **发布闸门零变化**（H 面）：四件套判据不动，`composition.md` 不入闸；`build:skill`/`check:skill`/`build:layout` 不读它，缺它不红（本 issue 验收 4 实测）。
- **新增生成 + 验收协议**：探针 [`scripts/emergent-probe.js`](../../scripts/emergent-probe.js)（浏览器端、`<site>` 无关、零写死站名）+ [涌现层验收协议](../contributing/emergent-layer-acceptance.md) + 生成 playbook [onboard-composition.md](../contributing/onboard-composition.md)。接入新站**必跑 +1 步**：跑 onboard-composition 核合成层（抽完 adapter/rules 后）；**产出 `composition.md` 仅当该站有未记的合成层**，忠实站跑完即通过、无此文件。
- **与 [ADR 0004](./0004-token-source.md) 的边界**：0004「不上 `tokens.json` 生成器」约束的是**组件 adapter 值绑定**（要判断、保持手写）。本层不生成任何 token 值——它产出的是**长相描述 + 勘误 + 归宿建议**（散文），探针只捕获、agent 判归宿，不自动写契约。不违反 0004。
- **与 [ADR 0012](./0012-page-scale-layer.md) 的对照**：0012 的 `layout.css` 是**第二值文件**（确定性生成、**每站必产**、四件套之一、缺则不可发布）；本层 `composition.md` 是**第二风格文件**（探测+判断生成、**按需产出**、不进闸门、该站有合成层才产）。两者都是「`DESIGN.md`/`source` 覆盖不到、需另立文件」的答案，方向相反地落在「每站必产的值文件 vs 按需产出的风格文件」两端——但**核合成层这步对两者都不是可选的**（layout 靠 `build:layout` 机械跑、合成层靠本协议核）。

## 决策（已定，2026-09-15）

1. **文件名/位置 = `sites/<site>/composition.md`**（顶层，与 `adapter.css`/`layout.css`/`rules.md` 平级；**不**进 `source/`）。术语统一叫**合成层**——旧词「涌现层」是早期造词，指同物，除脚本/协议历史标题外不再新用（[CONTEXT.md](../../CONTEXT.md) `_Avoid_`）。
2. **判据 = 单槽测试**：能单值 → 值槽（不归本层）；不能（要位置/图层/多值/否定）→ 合成层。捕获靠扫封闭 CSS 绘制基底（探针），**不靠 N 轴清单**。
3. **流程必跑·产物按需·不进四件套**：核合成层每站必跑（漏是静默的）；`composition.md` 该站有合成层才产、非发布前置，构建/校验都不读它。
4. **存档不改 + 勘误覆盖**：`source/DESIGN.md` 不动；合成层冲突以 `composition.md` 为准。
5. **运动员/裁判分离**：生成（跑探针+写 composition.md）与验收（照协议出结论、不改产物）是两份 prompt、两个 agent。
6. **归宿=判断（agent 做，非真人）**：探针保证捕获全；每条信号落哪层（契约新槽 / `rules.md` / 纯内容 / Don't）是设计判断，由运动员 agent 做、裁判 agent 复核，不由探针代劳——全程可 AFK，真人只在收尾门验收。将来把能单值化的合成信号提为契约新槽，是**出图消费 slice（#31/#32）**的事，不在本 ADR。

## 引用

- 缺口实证：本会话对 `https://steep.app` 真站跑 `emergent-probe.js`（2026-09-15, 1440px），实测位图铺底 `bg-home.jpg`/`bg-ai-section.jpg` + oklab 渐变 + `feTurbulence` 颗粒 + `overlay`/`multiply` 混合 + `rgb(18,18,18)` 暗区 + `blur(16px)` 毛玻璃 + `<em>` 斜体，与 `DESIGN.md`:200「no abstract graphics」相反。
- 相关 ADR：[0004](./0004-token-source.md)（token 源边界，本层不生成 token）、[0012](./0012-page-scale-layer.md)（第二**值**文件 `layout.css`，每站必产；本层是第二**风格**文件、按需产出、方向相反落在「不进闸门」端）。
- 正本与落地：[multi-site-theming §9.9](../design-system/multi-site-theming.md#99-合成层-compositionmd第二风格源探测生成)、[CONTEXT.md](../../CONTEXT.md)（术语「值槽 vs 合成层 / 单槽判据 / composition.md」）、[涌现层验收协议](../contributing/emergent-layer-acceptance.md)、[onboard-composition.md](../contributing/onboard-composition.md)（生成+复核 playbook）、[emergent-probe.js](../../scripts/emergent-probe.js)（探针）、样例 [sites/steep/composition.md](../../sites/steep/composition.md)。落地 GH issue #30（本 ADR + playbook + §9.9 + steep 定稿）；出图消费 #31/#32。
