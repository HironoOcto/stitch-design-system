# 补合成层 playbook（可复用）

> 给 agent 的可复用流程：核一个已接入的站的**合成层**、按需产出**第二风格源** `sites/<site>/composition.md`——`source/DESIGN.md` 覆盖不到的那层（氛围铺底 / 明暗幕 / 辉光 / 图像材质 / 字形设备 / 拒绝清单）。**接入每个站都必跑一次**（合成层的漏/写反是静默的，不核就不知道 `DESIGN.md` 忠不忠实），把 `<site>` 换成站名即可。**流程必跑，产物按需**：跑完探针 + 验收协议，该站有未记的合成层 → 写 `composition.md`；`DESIGN.md` 已忠实覆盖（零 MISSING/WRONG/UNGROUNDED）→ 通过、无此文件（四站里 seline 就是这样验证过为忠实的）。这是 [ADR 0013](../adr/0013-composition-layer.md) + [multi-site-theming §9.9](../design-system/multi-site-theming.md#99-合成层-compositionmd第二风格源探测生成) 的可执行形式；判据 / 探针实现 / 验收三步不在此复述，链到正本。
>
> **运动员 / 裁判分离**：下面「## 执行 prompt」是**运动员**（跑探针 + 写 `composition.md`），「## 复核」是**另派**的**裁判**（照验收协议出结论、不改产物）。**两份独立 prompt、两个 agent**——同一个 agent 不得既生成又验收（自己判自己必漏）。对齐 [onboard-site.md](./onboard-site.md) 的「执行 prompt」+「复核」。
>
> **两方都读同一份[验收协议](./emergent-layer-acceptance.md)，不算作弊——防作弊靠的不是"藏考题"，是"裁判独立从真站重新求证"**：① 验收判据锚在**真站探针输出（ground truth）**，运动员「照标准写」= 「把真站每条信号回应到」，正是目标本身，没有可刷的代理缝隙（藏标准只会让运动员漏记覆盖面/漏守 UNGROUNDED 前提，更差不更诚实）；② 有牙齿的是**裁判不信运动员交付的 JSON / 归宿 / 勘误，而是自己重跑探针 + 重读 `DESIGN.md` 从头求证**——JSON 可伪造、归宿可用「听起来对」的话糊弄，唯一能拆穿的是**独立复现真站**。所以裁判 prompt 里「独立重跑」是**必须**、不是建议；裁判环境若无法驱动浏览器，只能查内部自洽 + 勘误真实（读 `DESIGN.md`），**必须显式声明"未做真站重跑"并把真站复现交回浏览器能力的裁判 / 维护者**，不得凭运动员自报判「通过」。

## 何时用

**接入每个站，抽完 `adapter.css`/`rules.md` 后必跑一次**（合成层的漏/写反静默——不核无法判断 `DESIGN.md` 忠不忠实）。跑的是**核合成层**这件事，不是「产不产文件」的选择：核完，该站有未记合成层就写 `composition.md`，没有（`DESIGN.md` 已忠实）就通过、无此文件——**流程必跑，产物按需**。产出的 `composition.md` 不进「可发布四件套」闸门（缺它照常可发布，见 [ADR 0013](../adr/0013-composition-layer.md) 决策 3/4），它服务下游复刻 / 出图消费——让复刻拿得到「位图铺底 + 颗粒 + 暗幕 + 毛玻璃 + 斜体设备」这类高级感来源。**前置**：该站已接入（`sites/<site>/source/DESIGN.md` 在、`adapter.css`/`rules.md` 已产出，见 [onboard-site.md](./onboard-site.md)），且**真站可访问**（探针对真站跑，不是对 demo）。

## 产出（一份发布件 + 一份维护者报告）

| 产物 | 内容 | 生成方式 | 消费路径 | 正本规则 |
|---|---|---|---|---|
| `sites/<site>/composition.md`（**发布件**） | 合成层**设计指南**：氛围铺底 / 明暗幕 / 辉光·毛玻璃 / 字形设备 / 刻意拒绝——「是什么 + 怎么复刻」。**自包含**（体例照 `rules.md`）：无内部维护链接、无探针术语、无 :行号；勘误表达成**设计事实** | 对真站跑探针 + 按 [验收协议](./emergent-layer-acceptance.md) diff → **把结论写成消费者读的设计语言**（探针**捕获全**、归宿由 **agent 判**） | 随 skill 发布、下游复刻 / 出图消费（#31/#32）；**不进**渲染、**不进**四件套闸门 | [ADR 0013](../adr/0013-composition-layer.md)、[§9.9](../design-system/multi-site-theming.md#99-合成层-compositionmd第二风格源探测生成) |
| 执行报告（**维护者记录**，进 issue / commit，**不进发布件**） | 探针真跑证据：日期/视口/覆盖面/counts + 三类缺陷 diff（探针桶名 + 值 + 幅面 + `DESIGN.md:行号` 勘误）+ 归宿建议 + 两块 Hook 表 | 同一次跑的副产 | 维护者审计 / 复现 | 本 playbook「执行报告」段 |

> **两个受众别混**：`composition.md` 发给**消费方**（装了 skill 的项目，拿不到 `docs/`/`scripts/`/`source/DESIGN.md`）→ 必须自包含、无内部引用、无术语，像 `rules.md`。**探针怎么跑的、DESIGN.md 第几行错了、开哪个 `--stitch-*` 槽**是**维护者**的事 → 进执行报告 / issue / commit。**不改 `source/DESIGN.md`**（存档不变量）；合成层与它冲突时以 `composition.md` 为准。样例见 [sites/steep/composition.md](../../sites/steep/composition.md)（发布件）。

## 执行 prompt（运动员·生成 —— 复制，把 `<site>` 全部换成站名）

```text
你在本仓库根目录执行。你是【运动员】——给 <site> 产出合成层补充 sites/<site>/composition.md。
先读 docs/contributing/emergent-layer-acceptance.md（验收协议·三步）+ docs/adr/0013-composition-layer.md
（第二风格源 + 单槽判据）+ CONTEXT.md「值槽 vs 合成层」，再动手。你只生成，不自我验收（验收另派裁判）。

输入：
- <site> 真站 URL（从 sites/<site>/source/DESIGN.md 头部或 rules.md 找；找不到就问维护者）。探针对【真站】跑，不是 demo。
- scripts/emergent-probe.js（浏览器端探针，<site> 无关：扫封闭 CSS 绘制基底，任何合成特征被画出来就被捕获）。
- sites/<site>/source/DESIGN.md（值槽真相 + 待核勘误对象：它对合成层系统性漏/写反）。
- sites/steep/composition.md（现成样例——【consumer-clean 发布件】范本，照它的小节结构 + 设计语言 + 自包含体例写，别加内部链接/探针术语/:行号）。
- sites/steep/rules.md（姊妹发布件，体例基准：自包含、`← DESIGN.md <段>` 轻量标源、零内部 markdown 链接）。

步骤（照验收协议三步）：
1. 跑探针（探针是【单页】工具，覆盖代表性页面、不止首页）：先列出要扫的面——首页必扫，外加
   DESIGN.md 断言点到的【每一个】面（产品/定价/AI 区/博客……凡 doc 说「某处有某效果」的那处）。
   逐页：浏览器打开 → 【滚到底】触发懒加载（暗区/位图/毛玻璃才出现）→ 跑 emergent-probe.js
   （DevTools 整段粘贴执行 copy(emergentProbe())；或注入式 MCP 取函数体交 evaluate）。取【多页并集】。
   拿到真站合成信号 JSON（按桶去重，每条带样例选择器 + 幅面/位置 + 来自哪页）。
   **记下探针实测日期 + 版本 + 视口宽 + 【实际扫了哪几页】（覆盖面，UNGROUNDED 的成立依据）**。
2. 三类缺陷 diff（探针输出 ↔ DESIGN.md 断言）：逐条标 MISSING（站有 doc 没提）/ WRONG（doc 断言与实况相反）/
   UNGROUNDED（doc 说有、【且该断言所指的面已被你扫过】、真站却零命中）。
   【UNGROUNDED 前提=扫过那面】：doc 断言指向一个你【没扫的面】→ 不是 UNGROUNDED，是「未覆盖」，
   回步骤 1 去那页补跑再判——零命中≠不存在，除非你确实扫过那面（别把没扫到当不存在而误删真效果）。
   留白也要显式——站【刻意没有】某效果，必须写成「刻意无 X」（Don't），不能空着。
3. 写 sites/<site>/composition.md —— 【这是随 skill 发布、给消费方复刻用的文件，体例照发布件 rules.md：自包含、面向消费者的设计指南；探针证据/勘误行号/覆盖面/验证链全部【不进本文件】，进下面的执行报告】：
   - **消费者读得到什么**：<site> 的合成层长什么样、怎么复刻。**读不到**：探针怎么跑的、covered 哪几页、DESIGN.md 第几行错了、我们打算开哪个 --stitch-* 槽（那些是维护者的事，进报告/issue）。
   - 顶部一行 blockquote（照 rules.md 头）：说「DESIGN.md 的合成层补充；值层见 adapter.css/rules.md；合成层冲突以本文件为准」。**不写**探针日期/视口/覆盖面，**不放** docs//scripts//ADR/CONTEXT 的 markdown 链接，**不写**验证链。
   - 分小节记合成层（氛围铺底 / 明暗幕 / 辉光·毛玻璃·浮动拼贴 / 字形设备 / 刻意拒绝），每节用**设计语言**写「是什么 + 怎么复刻」——**不用探针桶名**（backdrop_raster 等是内部术语）、**不引 :行号**、**不带 🔴/🟠 探针标记**、**不写归宿建议**。可像 rules.md 那样用轻量 `← DESIGN.md <段>` 标来源。
   - 勘误**表达成设计事实**：写「更正：DESIGN.md 说无抽象图形，真实满屏氛围铺底」这类**消费者能直接用**的更正，不写「:200 🔴WRONG」这种维护者记账（消费方拿不到 DESIGN.md，行号对它无意义）。
   - **不附**探针实测代码块（那是维护者证据，进报告）。

红线（可 grep，须全绿）：
- H1 自包含（发布件标准，像 rules.md）：composition.md 无外来 --var 前缀（引用变量只写 --stitch-*）；且**无内部维护链接**——不含 docs//scripts//CONTEXT/ADR 的 markdown 链接、不含探针桶名（backdrop_raster 等）、不含 DESIGN.md :行号 引用。它随 skill 发到消费方，这些在消费语境里断链/是噪声。
- H2 只读 --stitch-*：本产物是文档，不引入任何组件/CSS 改动；提到的契约新槽一律 --stitch-* 命名。
- 探针零写死站名：你跑的是 scripts/emergent-probe.js 原样（<site> 参数化），不得改脚本注入站名。
- 存档不改：git status 里 sites/<site>/source/** 必须零改动。

产出后附执行报告两块表（**报告写在这里/交给维护者、进 issue 或 commit——不是写进 composition.md**）：① 结构 Hook（H1 含"无内部链接/无探针术语" + H2 + 存档不改 + 探针零写死站名）🟢/🔴；
② 真实 case（探针真跑：日期/视口/counts/【覆盖面=扫了哪几页】 + 三类缺陷 diff（带探针桶名/值/幅面/:行号勘误，这些证据留在报告里）+ 每条信号被反映或显式拒绝、零未回应；每条 UNGROUNDED 都在已扫的面上）🟢/🔴。报告里可附探针实测 JSON 节选供复跑。
【不要自我判「通过」——把 composition.md 交给复核 agent（下节）出验收结论。】
```

## 复核（裁判·验收 —— 另派一个 agent，不得与运动员同体）

产物就位后**另派**一个复核 agent，照 [涌现层验收协议](./emergent-layer-acceptance.md) 逐条走（它扮演 [onboard-site-review.md](./onboard-site-review.md) 之于 adapter 的裁判角色）。裁判**只出结论、不改产物**（除非维护者授权按必改项落地）。

派复核 agent 的 prompt（复制，把 `<site>` 换成站名）：

```text
你在本仓库根目录复核 <site> 的合成层产物 sites/<site>/composition.md。你是【裁判】，不是运动员——
不改产物，只判对不对、把必改项挑出来。执行 docs/contributing/emergent-layer-acceptance.md 的三步协议逐条走。
【防作弊铁律】不信运动员交付的探针 JSON / 归宿 / 勘误——那些可伪造、可用「听起来对」的话糊弄。你的结论必须
建立在【你自己独立从真站重新求证】上（重跑探针 + 重读 DESIGN.md），不是核运动员自报是否自洽。

输入（全部打开）：
- sites/<site>/composition.md（被复核产物）
- sites/<site>/source/DESIGN.md（勘误核对对象：composition.md 引的 :行号断言是否真在 DESIGN.md 里、是否真写反）
- scripts/emergent-probe.js + 验收协议（判据 + 三步 + 归宿表）
- 本站 GH issue（站特有验收点）

复核清单：
1. 结构 Hook（先跑，不绿直接打回）：
   cd stitch-design-system
   f=sites/<site>/composition.md
   echo "H1 无外来 --var 前缀:"; grep -oE 'var\(--[a-z-]+' "$f" | grep -v 'var(--stitch-' && echo FAIL || echo PASS
   echo "H1 提到的槽名全 --stitch-*:"; grep -oE '`--[a-z][a-z0-9-]+`' "$f" | grep -v 'stitch-' && echo 见上需查 || echo PASS
   echo "consumer-clean 无内部维护链接:"; grep -nE '\]\((\.\.?/)?(docs|scripts|CONTEXT|sites/[^)]*source)' "$f" && echo FAIL || echo PASS
   echo "consumer-clean 无探针桶名:"; grep -nE 'backdrop_raster|overlay_texture|dark_region|backdrop_gradient|_counts|_imgTreatment|shadow_glow' "$f" && echo FAIL || echo PASS
   echo "consumer-clean 无 DESIGN.md :行号:"; grep -nE 'DESIGN\.md:[0-9]|:[0-9]+.*(WRONG|MISSING|🔴|🟠)' "$f" && echo FAIL || echo PASS
   echo "存档不改:"; git status --porcelain sites/<site>/source/ | grep . && echo FAIL || echo PASS
   （探针零写死站名：grep -n '<site 的真名>' scripts/emergent-probe.js 应为空——脚本必须 <site> 无关）
   —— composition.md 是【发布件】，体例照 sites/<site>/rules.md：自包含、无内部链接/术语/行号；探针证据在【运动员执行报告】里，不在本文件。
2. 真跑验证（防作弊核心，【必须】独立做，不是建议）：从【运动员执行报告】读它声称的覆盖面/日期/视口/counts（**不在 composition.md 里，在报告里**）。
   【你自己对真站重跑探针】——扫报告记的覆盖面（首页 + DESIGN.md 点到的每个子页），核对报告列的信号确在真站、幅面/位置对得上，
   且 composition.md 的设计描述与你重跑所见一致（至少抽 3 条：铺底 / 暗区或辉光 / 字形设备）——证「不是照 DESIGN 散文想象、也不是伪造的 JSON」。
   ▲ 若你所处环境【无法驱动浏览器】：不得凭运动员自报判「通过」——只做内部自洽 + 勘误真实（读 DESIGN.md 文件），
     并在结论里【显式声明"未做真站重跑，需浏览器能力的裁判/维护者补验"】，判定最多给「待真站复现」，不给「通过」。
3. 验收判据（协议第 3 步·核心）：你重跑 + 报告 diff 里探针输出的【每一条】，在 composition.md 里是否都被【反映】（用**设计语言**记了这个效果、消费者可复刻）
   或【显式拒绝】（Don't: 刻意无 X）？逐条核，标 零 MISSING / 零 WRONG / 零 UNGROUNDED 是否成立。有一条未回应 = 需改动。
   ★ UNGROUNDED 必核【覆盖面】：报告里每条被标 UNGROUNDED（doc 说有、判真站没有）的断言，它指向的面是否在覆盖面里？
   若 doc 断言指向一个【没扫的面】却被标 UNGROUNDED 或据此在 composition.md 里「说没有」→ 必改（那是「未覆盖」不是
   「不存在」，误删真效果的高危点）。DESIGN.md 断言点到的面若有一个没进覆盖面 → 判需改动（回去补扫那页）。
4. 勘误真实性：报告的 diff 每条「DESIGN.md 勘误」，回 DESIGN.md 对应行核——引的断言是否真存在、是否真与实况相反（别把没写反的说成写反）；
   且 composition.md 里把它**表达成设计事实**的那句（如「更正：DESIGN.md 说无抽象图形，真实满屏铺底」）是否与 diff 一致、无内部行号泄漏。
   尤其【判「真站没有」的勘误】必须有「扫过该面仍零命中」支撑，不能只凭没扫到。
5. 归宿合理性（在报告里核，不在发布件）：报告每条信号的归宿建议（契约新槽 / rules.md / 纯内容 / Don't）是否合单槽判据；
   且这些**维护者归宿不应泄漏进 composition.md**（发布件只讲怎么复刻，不讲我们要开哪个 --stitch-* 槽）。

输出（复核结论）：
1. 判定：通过 / 需改动 / 待真站复现（若你没能重跑）。
2. 必改项：逐条「小节/行 → 现状 → 建议 → 理由（哪条探针信号未回应 / 哪条勘误引错行 / 哪处内部术语泄漏进发布件）」。
3. 已认可项：一行带过，让维护者知道你逐条看过。
4. 抽查记录：你【是否真的重跑了浏览器】、扫了哪几页、核了哪几条信号哪几条勘误、composition.md 是否 consumer-clean、是否一致。
只出结论，不改 composition.md（除非维护者授权按必改项落地）。
```

## 怎么跑（直接用 prompt；issue 只是可选台账）

**最直接**：把上面「## 执行 prompt」复制、`<site>` 换成站名，交给一个 agent 跑；产物就位后把「## 复核」复制、换名，交给**另一个** agent 跑。**不必经过任何 issue**——那两段 prompt 就是完整的活。

**（可选）想给 AFK 独跑留个追踪台账时**，再把它包成一个薄 GH issue：`[stitch] 核合成层 <site>：执行 onboard-composition playbook`（或直接折进该站的接入新站 issue，作抽完 adapter/rules 后的必跑一步），正文指向本文件；[issue-management.zh-CN.md](../issue-management.zh-CN.md) 的 AFK prompt 就写「执行 onboard-composition playbook，`<site>=…`」+ 该站特有验收点（如「真站有几幕暗区」）。issue 纯为记账/可追溯，**不是完成这项工作的前提**。

无论走哪条，**必跑的是"核"这件事、不是"产文件"**——核完忠实就通过、无 `composition.md`。规则单一真相始终是本 playbook + [ADR 0013](../adr/0013-composition-layer.md) + [验收协议](./emergent-layer-acceptance.md)，站站复用。

> 注：合成层是 **AI 探测 + agent 判归宿 + 另派裁判 agent 验收**，非确定脚本——探针只保证「捕获全」（封闭 CSS 基底），每条落哪层、设计意图是什么仍是判断（运动员 agent 做、裁判 agent 复核，非探针代劳）。**「判断」不等于「要真人」**：全程可 AFK，真人只在收尾门做最终验收（[验收协议·局限](./emergent-layer-acceptance.md#局限诚实边界)）。
