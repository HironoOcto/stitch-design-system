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
| `sites/<site>/composition.md`（**源**：正文发布 + 可剥追溯） | 合成层**设计指南**：氛围铺底 / 明暗幕 / 辉光·毛玻璃 / 字形设备 / 刻意拒绝——「是什么 + 怎么复刻」。**混合体例**（一个文件两种受众）：正文**正向散文**（零 `DESIGN.md`、零孪生横指 `adapter.css`/`variables.css`）；DESIGN.md 追溯/勘误落**可剥 `<!-- trace -->` 维护者表 + 小节 `←` 尾注**；顶部 consumer-clean 指引 | 对真站跑探针 + 按 [验收协议](./emergent-layer-acceptance.md) diff → **正文写成消费者读的设计语言**、**勘误进可剥表**（探针**捕获全**、归宿由 **agent 判**） | build:skill 走 `stripTrace` 剥可剥位置 → preset 只留正向散文，随 skill 发布、下游复刻 / 出图消费（#31/#32）；且作 `build:blurb` 的**可选融合输入**（#36：`stripTrace(源)` 正文进 prompt，真站修正压过 austere 的 DESIGN 基线 → style-paragraph 忠于真站；故次序 **composition 先于 blurb**）；**不进**渲染、**不进**四件套闸门 | [ADR 0013](../adr/0013-composition-layer.md)、[§9.9](../design-system/multi-site-theming.md#99-合成层-compositionmd第二风格源探测生成) |
| 执行报告（**维护者记录**，进 issue / commit，**不进发布件**） | 探针真跑证据：日期/视口/覆盖面/counts + 三类缺陷 diff（探针桶名 + 值 + 幅面 + `DESIGN.md:行号` 勘误）+ 归宿建议 + 两块 Hook 表 | 同一次跑的副产 | 维护者审计 / 复现 | 本 playbook「执行报告」段 |

> **发布正文 vs 维护者追溯，一个文件两处，靠 `stripTrace` 迁移剥离分开**：源 `composition.md` 的**正文自由句**是发给**消费方**（装了 skill 的项目，拿不到 `source/DESIGN.md`）的——必须**正向散文、零 `DESIGN.md`、零孪生横指**（`见 adapter`/`adapter.css`/`variables.css`）。**DESIGN.md 追溯、勘误（写反/漏）、探针行号**是**维护者**的事 → 只落两处**可剥位置**：小节标题的 `← <来源>` 尾注、专用 `<!-- trace: … -->` 追溯表容器。build:skill 迁移时 `stripTrace` 剥掉这两处 → preset consumer-clean；放错到正文自由句 → `stripTrace` 零残留自检抛错、build:skill 失败指行（机器强制，不靠自觉）。**探针怎么跑的、开哪个 `--stitch-*` 槽**进执行报告 / issue / commit。**不改 `source/DESIGN.md`**（存档不变量）。样例见 [sites/steep/composition.md](../../sites/steep/composition.md)（源，含可剥 trace 表）。

## 执行 prompt（运动员·生成 —— 复制，把 `<site>` 全部换成站名）

```text
你在本仓库根目录执行。你是【运动员】——给 <site> 产出合成层源 sites/<site>/composition.md。
先读 docs/contributing/emergent-layer-acceptance.md（验收协议·三步）+ docs/adr/0013-composition-layer.md
（第二风格源 + 单槽判据）+ CONTEXT.md「值槽 vs 合成层」，再动手。你只生成，不自我验收（验收另派裁判）。

输入（下列即**全部**输入——`sites/<site>/adapter.css` / `variables.css` 刻意不给、也别去打开：它们不随 skill 发货，正文回指只会给消费方留断链）：
- <site> 真站 URL（从 sites/<site>/README.md 的「首页」条目找；找不到就问维护者）。探针对【真站】跑，不是 demo。
- scripts/emergent-probe.js（浏览器端探针，<site> 无关：扫封闭 CSS 绘制基底，任何合成特征被画出来就被捕获）。
- sites/<site>/source/DESIGN.md（值槽真相 + 待核勘误对象：它对合成层系统性漏/写反。**只用来填可剥 trace 表/做勘误，不进正文自由句**）。
- sites/steep/composition.md（现成样例——混合体例范本：正文正向散文 + 顶部 <!-- trace --> 维护者表 + 小节 `←` 尾注，照它的结构写）。

步骤（照验收协议三步）：
1. 跑探针（探针是【单页】工具，覆盖代表性页面、不止首页）：先列出要扫的面——首页必扫，外加
   DESIGN.md 断言点到的【每一个】面（产品/定价/AI 区/博客……凡 doc 说「某处有某效果」的那处）。
   逐页：浏览器打开 → 【滚到底】触发懒加载（暗区/位图/毛玻璃才出现）→ 跑 emergent-probe.js
   （DevTools 整段粘贴执行 copy(emergentProbe())；或注入式 MCP 取函数体交 evaluate）。取【多页并集】。
   拿到真站合成信号 JSON（按桶去重，每条带样例选择器 + 幅面/位置 + 来自哪页）。
   **记下探针实测日期 + 版本 + 视口宽 + 【实际扫了哪几页】（覆盖面，UNGROUNDED 的成立依据）**。
   注意探针桶阈值局限（如 dark_region L<0.2 会漏掉略抬的深紫）——桶零命中但肉眼有暗色时，直查该元素 bg 复核。
2. 三类缺陷 diff（探针输出 ↔ DESIGN.md 断言）：逐条标 MISSING（站有 doc 没提）/ WRONG（doc 断言与实况相反）/
   UNGROUNDED（doc 说有、【且该断言所指的面已被你扫过】、真站却零命中）。
   【UNGROUNDED 前提=扫过那面】：doc 断言指向一个你【没扫的面】→ 不是 UNGROUNDED，是「未覆盖」，
   回步骤 1 去那页补跑再判——零命中≠不存在，除非你确实扫过那面（别把没扫到当不存在而误删真效果）。
   留白也要显式——站【刻意没有】某效果，必须写成「刻意无 X」（Don't），不能空着。
3. 写 sites/<site>/composition.md —— 混合体例（照样例 steep）：正文=发布正文（随 skill 发给消费方复刻用）、追溯=可剥维护者位置。**放错位置 build 红**（build:skill 的 stripTrace 剥后若正文还剩 DESIGN.md → 抛错指行）：
   - 顶部**可剥 `<!-- trace: … -->` 维护者追溯表**（build:skill stripTrace 会整块剥掉，不入发货预置）：一行说明（探针日期/视口/覆盖面）+ 表，列 = `合成层特征 | 探针实测 | DESIGN.md 现状 | 缺陷(MISSING/WRONG/UNGROUNDED) | 判断依据·归宿`。探针桶名/值/幅面/`DESIGN.md` 勘误/归宿建议**全落这张表**，不进正文。
   - 紧接一行**顶部 consumer-clean 指引 blockquote**（会保留进发布）：说本层记什么 + 「值层见同目录 `tokens.css`；组件规格见同预置 `rules.md`」。**不写** DESIGN.md、**不回指** adapter.css/variables.css、**不写**探针日期/covered/验证链、**不放** docs//scripts//ADR/CONTEXT 的 markdown 链接。
   - 分小节记合成层（氛围铺底 / 明暗幕 / 辉光·毛玻璃·浮动拼贴 / 字形设备 / 刻意拒绝），小节标题可挂**轻量 `← <来源>` 尾注**标源（如 `← 真站探针实测` 或 `← DESIGN.md <段>`——`←` 后整段会被 stripTrace 剥掉，故这里提 DESIGN.md 安全）。**正文自由句用设计语言写「是什么 + 怎么复刻」**——正向陈述，**零 DESIGN.md**（勘误已进上面的 trace 表，正文只写更正后的正确事实：写「真实 steep 满屏氛围铺底」而非「更正：DESIGN.md 说无抽象图形」）、**零探针桶名**（backdrop_raster 等是内部术语，进 trace 表）、**零 :行号**、**零 🔴/🟠 标记**、**零归宿建议**、**零孪生横指**（不写「见 adapter.css」，值层只指同目录 tokens.css）。
   - **不附**探针实测代码块（那是维护者证据，进报告）。

红线（可 grep，须全绿——正文自由句里的追溯/横指放错 = build:skill stripTrace/check:boundary 直接红）：
- 正文零 DESIGN.md：stripTrace 剥掉可剥位置（<!-- trace --> + `←` 尾注）后须零 `DESIGN.md` 残留（build:skill 自检强制）。
- 正文零孪生横指：正文与 trace 表皆不出现 `见 adapter` / `adapter.css` / `variables.css`（check:boundary 发货面扫描拦截）。值层→同目录 `tokens.css`；组件规格→同预置 `rules.md`（合法 shipped sibling）。
- H1 自包含：composition.md 无外来 --var 前缀（引用变量只写 --stitch-*）；正文无内部维护链接（docs//scripts//CONTEXT/ADR 的 markdown 链接）、无探针桶名、无 DESIGN.md :行号（这些进 trace 表或报告）。
- H2 只读 --stitch-*：本产物是文档，不引入任何组件/CSS 改动；提到的契约新槽一律 --stitch-* 命名。
- 探针零写死站名：你跑的是 scripts/emergent-probe.js 原样（<site> 参数化），不得改脚本注入站名。
- 存档不改：git status 里 sites/<site>/source/** 必须零改动。

产出后附执行报告两块表（**报告写在这里/交给维护者、进 issue 或 commit——不是写进 composition.md 正文**；trace 表已在源文件里承载探针/勘误，报告可再展开证据）：① 结构 Hook（正文零 DESIGN.md + 零孪生横指 + H1 无内部链接/无探针术语 + H2 + 存档不改 + 探针零写死站名）🟢/🔴；
② 真实 case（探针真跑：日期/视口/counts/【覆盖面=扫了哪几页】 + 三类缺陷 diff（带探针桶名/值/幅面/:行号勘误）+ 每条信号被反映或显式拒绝、零未回应；每条 UNGROUNDED 都在已扫的面上）🟢/🔴。报告里可附探针实测 JSON 节选供复跑。
【不要自我判「通过」——把 composition.md 交给复核 agent（下节）出验收结论。】
```

## 复核（裁判·验收 —— 另派一个 agent，不得与运动员同体）

产物就位后**另派**一个复核 agent，照 [涌现层验收协议](./emergent-layer-acceptance.md) 逐条走（它扮演 [onboard-site-review.md](./onboard-site-review.md) 之于 adapter 的裁判角色）。裁判**只出结论、不改产物**（除非维护者授权按必改项落地）。

派复核 agent 的 prompt（复制，把 `<site>` 换成站名）：

```text
你在本仓库根目录复核 <site> 的合成层源 sites/<site>/composition.md。你是【裁判】，不是运动员——
不改产物，只判对不对、把必改项挑出来。执行 docs/contributing/emergent-layer-acceptance.md 的三步协议逐条走。
【防作弊铁律】不信运动员交付的探针 JSON / 归宿 / 勘误——那些可伪造、可用「听起来对」的话糊弄。你的结论必须
建立在【你自己独立从真站重新求证】上（重跑探针 + 重读 DESIGN.md），不是核运动员自报是否自洽。

体例背景（混合规范）：源 composition.md 一个文件两处——正文自由句是【发布正文】（随 skill 发给消费方），
DESIGN.md 追溯/勘误落【可剥位置】（顶部 `<!-- trace: … -->` 表 + 小节 `← 尾注`）。build:skill 用 stripTrace 剥掉
可剥位置 → 发货预置只留正文。所以 consumer-clean 检查针对的是【stripTrace 后的发布正文】（= preset），不是原始源
（源里 trace 表/`←` 尾注出现 DESIGN.md 是合法的）。

输入（全部打开）：
- sites/<site>/composition.md（被复核源：正文 + 可剥 trace 表 + `←` 尾注）
- sites/<site>/source/DESIGN.md（勘误核对对象：trace 表引的 :行号断言是否真在 DESIGN.md 里、是否真写反）
- scripts/emergent-probe.js + 验收协议（判据 + 三步 + 归宿表）
- 本站 GH issue（站特有验收点）

复核清单：
1. 结构 Hook（先跑，不绿直接打回）：
   cd stitch-design-system
   f=sites/<site>/composition.md
   # 机器闸门直接跑（可剥格式 + 发货边界的正本强制，最权威）：
   npm run build:skill            # stripTrace 剥后若正文残留 DESIGN.md → 抛错指行、直接红
   npm run check:skill            # §9.5 preset == stripTrace(源)
   npm run check:boundary         # 发货面：composition 已纳入扫描，横指/DESIGN.md 泄漏即红
   # 发布正文 = stripTrace(源)，把它算出来单独 grep：
   node -e 'import("./scripts/lib/strip-trace.mjs").then(({stripTrace})=>{const fs=require("fs");const o=stripTrace(fs.readFileSync(process.argv[1],"utf8"),{label:process.argv[1]});process.stdout.write(o);})' "$f" > /tmp/comp.body
   echo "正文零 DESIGN.md:"; grep -n 'DESIGN\.md' /tmp/comp.body && echo FAIL || echo PASS
   echo "正文零孪生横指:"; grep -nE '见\s*adapter|adapter\.css|variables\.css' /tmp/comp.body && echo FAIL || echo PASS
   echo "正文 consumer-clean 指引在:"; grep -q '同目录 `tokens.css`' /tmp/comp.body && grep -q '同预置 `rules.md`' /tmp/comp.body && echo PASS || echo FAIL
   echo "H1 无外来 --var 前缀:"; grep -oE 'var\(--[a-z-]+' "$f" | grep -v 'var(--stitch-' && echo FAIL || echo PASS
   echo "正文无内部维护链接:"; grep -nE '\]\((\.\.?/)?(docs|scripts|CONTEXT|sites/[^)]*source)' /tmp/comp.body && echo FAIL || echo PASS
   echo "正文无探针桶名:"; grep -nE 'backdrop_raster|overlay_texture|dark_region|backdrop_gradient|_counts|_imgTreatment|shadow_glow' /tmp/comp.body && echo FAIL || echo PASS
   echo "存档不改:"; git status --porcelain sites/<site>/source/ | grep . && echo FAIL || echo PASS
   （探针零写死站名：grep -n '<site 的真名>' scripts/emergent-probe.js 应为空——脚本必须 <site> 无关）
   —— 源体例：正文正向散文、追溯只在 <!-- trace --> 表 + `←` 尾注、不回指 adapter.css / variables.css。
2. 真跑验证（防作弊核心，【必须】独立做，不是建议）：从源的 trace 表 + 运动员执行报告读它声称的覆盖面/日期/视口/counts。
   【你自己对真站重跑探针】——扫记录的覆盖面（首页 + DESIGN.md 点到的每个子页），核对 trace 表列的信号确在真站、幅面/位置对得上，
   且 composition.md 正文的设计描述与你重跑所见一致（至少抽 3 条：铺底 / 暗区或辉光 / 字形设备）——证「不是照 DESIGN 散文想象、也不是伪造的 JSON」。
   注意探针桶阈值局限（如 dark_region L<0.2 漏略抬的深紫）——桶零命中但肉眼有暗色时直查 bg 复核，别据桶零命中误判 UNGROUNDED。
   ▲ 若你所处环境【无法驱动浏览器】：不得凭运动员自报判「通过」——只做内部自洽 + 勘误真实（读 DESIGN.md 文件），
     并在结论里【显式声明"未做真站重跑，需浏览器能力的裁判/维护者补验"】，判定最多给「待真站复现」，不给「通过」。
3. 验收判据（协议第 3 步·核心）：你重跑 + trace 表里探针输出的【每一条】，在 composition.md 正文里是否都被【反映】（用**设计语言**记了这个效果、消费者可复刻）
   或【显式拒绝】（Don't: 刻意无 X）？逐条核，标 零 MISSING / 零 WRONG / 零 UNGROUNDED 是否成立。有一条未回应 = 需改动。
   ★ UNGROUNDED 必核【覆盖面】：trace 表里每条被标 UNGROUNDED（doc 说有、判真站没有）的断言，它指向的面是否在覆盖面里？
   若 doc 断言指向一个【没扫的面】却被标 UNGROUNDED 或据此在正文里「说没有」→ 必改（那是「未覆盖」不是
   「不存在」，误删真效果的高危点）。DESIGN.md 断言点到的面若有一个没进覆盖面 → 判需改动（回去补扫那页）。
4. 勘误真实性（在 trace 表里核）：trace 表每条「DESIGN.md 现状/缺陷」，回 DESIGN.md 对应行核——引的断言是否真存在、是否真与实况相反（别把没写反的说成写反）；
   且正文里把它**表达成正确设计事实**的那句（如正文写「真实 steep 满屏氛围铺底」、勘误细节留 trace 表）是否与 trace 表一致、正文无 DESIGN.md 泄漏。
   尤其【判「真站没有」的勘误】必须有「扫过该面仍零命中」支撑，不能只凭没扫到。
5. 归宿合理性（在 trace 表里核，不在正文）：trace 表每条信号的「判断依据·归宿」（契约新槽 / rules.md / 纯内容 / Don't）是否合单槽判据；
   且这些**维护者归宿不应泄漏进正文**（正文只讲怎么复刻，不讲我们要开哪个 --stitch-* 槽）。

输出（复核结论）：
1. 判定：通过 / 需改动 / 待真站复现（若你没能重跑）。
2. 必改项：逐条「小节/行 → 现状 → 建议 → 理由（哪条探针信号未回应 / 哪条勘误引错行 / 哪处追溯泄漏进正文 / 哪处横指回指孪生）」。
3. 已认可项：一行带过，让维护者知道你逐条看过。
4. 抽查记录：你【是否真的重跑了浏览器】、扫了哪几页、核了哪几条信号哪几条勘误、发布正文（stripTrace 后）是否 consumer-clean、是否一致。
只出结论，不改 composition.md（除非维护者授权按必改项落地）。
```

## 怎么跑（直接用 prompt；issue 只是可选台账）

**最直接**：把上面「## 执行 prompt」复制、`<site>` 换成站名，交给一个 agent 跑；产物就位后把「## 复核」复制、换名，交给**另一个** agent 跑。**不必经过任何 issue**——那两段 prompt 就是完整的活。

**（可选）想给 AFK 独跑留个追踪台账时**，再把它包成一个薄 GH issue：`[stitch] 核合成层 <site>：执行 onboard-composition playbook`（或直接折进该站的接入新站 issue，作抽完 adapter/rules 后的必跑一步），正文指向本文件；[issue-management.zh-CN.md](../issue-management.zh-CN.md) 的 AFK prompt 就写「执行 onboard-composition playbook，`<site>=…`」+ 该站特有验收点（如「真站有几幕暗区」）。issue 纯为记账/可追溯，**不是完成这项工作的前提**。

无论走哪条，**必跑的是"核"这件事、不是"产文件"**——核完忠实就通过、无 `composition.md`。规则单一真相始终是本 playbook + [ADR 0013](../adr/0013-composition-layer.md) + [验收协议](./emergent-layer-acceptance.md)，站站复用。

> 注：合成层是 **AI 探测 + agent 判归宿 + 另派裁判 agent 验收**，非确定脚本——探针只保证「捕获全」（封闭 CSS 基底），每条落哪层、设计意图是什么仍是判断（运动员 agent 做、裁判 agent 复核，非探针代劳）。**「判断」不等于「要真人」**：全程可 AFK，真人只在收尾门做最终验收（[验收协议·局限](./emergent-layer-acceptance.md#局限诚实边界)）。
