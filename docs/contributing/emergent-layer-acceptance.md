# 涌现层（合成层）验收协议

> 一个站的 `DESIGN.md` 有没有**忠实、无遗漏地**记下它真站的**合成层**（composition traits）——氛围铺底、明暗幕、辉光、图像材质、字形设备、以及「刻意拒绝」——的可复用验收流程。**每接入/复核一个站跑一次**，把 `<site>` 换成站名。
>
> **为什么需要它**：Refero 抽取把**值槽**（单值、可直接进 `--stitch-*` 契约的：色/字阶/圆角/阴影/间距）抽得准，但**合成层**（要多图层/定位/滤镜/混合才成立、换肤跟不了单个变量的特征）系统性漏、甚至写反——steep 的 `DESIGN.md` 就把满屏的位图渐变 + 颗粒 + 暗区判成了「no abstract graphics」。这类漏是**静默**的（不报错、只是复刻出来变丑），靠人眼逐站抽查必漏，所以要一个机械协议。术语「值槽 vs 合成层」「单槽判据」见 [CONTEXT.md](../../CONTEXT.md)。
>
> 本协议是**裁判**清单（验收）；生成侧（运动员）+ 运动员/裁判分离见 [onboard-composition.md](./onboard-composition.md)，决策依据见 [ADR 0013](../adr/0013-composition-layer.md)、正本见 [multi-site-theming §9.9](../design-system/multi-site-theming.md#99-合成层-compositionmd第二风格源探测生成)。是 [接入新站 playbook](./onboard-site.md) 抽完 `adapter.css`/`rules.md` 后的**必跑**一步：用本协议核该站合成层——合成层的漏/写反是**静默**的（不核就不知道 `DESIGN.md` 忠不忠实）。**该站有未记的合成层才产出 `composition.md`**；`DESIGN.md` 已忠实覆盖（零 MISSING/WRONG/UNGROUNDED）的站，跑完协议即通过、无须此文件。

---

## 判据（单槽测试）

> **合成层特征 = 无法用单个 `--stitch-*` 值复现、需「组合」才成立的视觉特征**（多图层 / 定位 / 滤镜 / 混合 / 或刻意拒绝）。能塞进一个单槽 → 值槽（不归本协议）；不能 → 合成层（本协议的猎物）。

**通用性不来自任何「N 轴清单」**——设计意图是开放的，第 N 个站会冒出没见过的花样。通用性来自**浏览器能画出来的东西是封闭的**：CSS 绘制模型成文有限（背景/渐变、`box-shadow`、`filter`、`backdrop-filter`、`mix-blend-mode`、`transform`、`clip-path`、`mask`、伪元素、字形渲染…）。探针扫的是这个**封闭基底**，任何合成特征只要被画出来就一定被 dump 到。下文出现的桶名（`backdrop_*`/`shadow_glow`/`filter`…）**只是可读分组，不是 schema、不是验收闸门**——闸门永远是「探针在真站找到的每一条，`DESIGN.md` 有没有回应」。

## 协议三步

### 1. 跑探针（对**真站**，不是对 demo；覆盖代表性页面，**不止首页**）

探针是**单页**工具——读「当前页画了什么」。所以要在**一组代表性页面**上各跑一遍、取信号**并集**：首页必跑，外加 `DESIGN.md` 断言点到的每一个面（产品 / 定价 / AI 区 / 博客……凡 doc 说「某处有某效果」的那一处都要覆盖到）。每页：浏览器打开 → 滚到底触发懒加载 → 跑 [`scripts/emergent-probe.js`](../../scripts/emergent-probe.js)：

- **DevTools**：整段粘贴，执行 `copy(emergentProbe())` 拷走 JSON。
- **Playwright/注入式 MCP**：取 `emergentProbe` 函数体交给 `evaluate`（滚动到底后再跑）。

产物 = 该站真站的**合成信号 JSON**（**多页并集**，按桶去重，每条带样例选择器 + 幅面/位置 + **来自哪页**）。

> **为什么不止首页**：一个 doc 断言的效果可能只活在子页（定价的辉光、产品页的位图）。只扫首页会把它误判成「真站没有」→ 错标 UNGROUNDED → 甚至误删一个**真**效果。**零命中 ≠ 不存在——除非该效果所在的面确实被你扫过**（见下 UNGROUNDED 前提）。记下**你实际扫了哪几页**（覆盖面），它是 UNGROUNDED 能否成立的依据。

### 2. 三类缺陷 diff（探针输出 ↔ `DESIGN.md` 断言）

逐条比对，标一类：

| 缺陷 | 含义 | 例 |
|---|---|---|
| **MISSING** | 站有、`DESIGN.md` 只字未提 | steep 有位图渐变铺底，doc 无氛围章节 |
| **WRONG** | `DESIGN.md` 断言与实况相反 | steep doc 写「no abstract graphics」，实际满屏铺底 |
| **UNGROUNDED** | `DESIGN.md` 断言、**且该断言所指的面已被探针扫过**、真站却零命中 | doc 说「首页有青色辉光」，首页（已扫）探针零命中 |

> **UNGROUNDED 前提 = 扫过那个面**：探针零命中只在「你确实扫了该断言指向的页」时才算 UNGROUNDED。doc 断言指向一个**没跑过探针的面**（如「定价页有辉光」而你只扫了首页）→ **不是 UNGROUNDED，是「未覆盖」**：去那页补跑探针再判。宁可多跑一页，也不可把「没扫到」当「不存在」而误删真效果——这是 UNGROUNDED 与 MISSING/WRONG 的关键不对称（后两者：探针有命中 = 铁证；UNGROUNDED：探针零命中 = 只有在扫过该面时才是证据）。

**留白也要显式**：站**刻意没有**某效果（如 seline 真站渐变极平），`DESIGN.md` 必须写成「**刻意无 X**」（Don't 条目），不能空着——空着无法与「漏了」区分。

### 3. 验收判据

> 该站合成层通过 ⟺ **探针输出的每一条**，都能在 `DESIGN.md`（值槽部分）**或**该站 `composition.md`（合成层补充）里找到对应——要么被**反映**（记了这个效果），要么被**显式拒绝**（Don't: 刻意无 X）。零 MISSING / 零 WRONG / 零 UNGROUNDED。
>
> **不改 DESIGN.md**：它是 Refero 下载存档（不动）。合成层的缺、以及 DESIGN.md 的勘误（写反/漏），落在**新增的 `sites/<site>/composition.md`**。**注意 `composition.md` 一个文件承载两种受众**：**正文自由句**是 consumer-clean 发布正文（随 skill 发给消费方——正向散文、零 `DESIGN.md`、不回指孪生 `adapter.css`/`variables.css`），**DESIGN.md 追溯/勘误**只落**可剥维护者位置**（顶部 `<!-- trace: … -->` 表 + 小节 `←` 尾注，`build:skill` 迁移时 `stripTrace` 剥掉）。所以本协议下面的**探针输出 / 三类缺陷 diff / `:行号` 勘误 / 归宿表**进的是那张**可剥 trace 表**（build:skill `stripTrace` 迁移时剥离、不入发货预置）+ 执行报告 / issue / commit，**不进正文自由句**（正文只写更正后的正确设计事实，放错即 build:skill `stripTrace` 零残留自检报红）。样例源见 [`sites/steep/composition.md`](../../sites/steep/composition.md)。

判据锚在「真站实际画了什么」，不是「填满几个框」——所以**扛得住没见过的合成特征**：新花样只要被画出来就进探针输出，就必须被回应。

## 每条信号的归宿（判断层，非探针机械代劳）

探针保证**捕获全**（机械·确定）；**每条该落到哪一层是判断**，不由探针代劳——AFK 流程里由**运动员 agent** 判、**裁判 agent** 复核（**都不是真人**，全程可 AFK；真人只在**收尾门**做最终验收）：

| 信号形态 | 归宿 |
|---|---|
| 单值可表达的（铺底纯色/渐变、辉光阴影、图像滤镜） | 契约新槽 `--stitch-backdrop-*` / `--stitch-glow-*` / `--stitch-image-filter`（换肤跟随） |
| 定位/构图/图层编排（拼贴错位、区块原型、明暗幕出现节奏） | 该站 `rules.md`（每站规则） |
| 内容资产（产品截图、插画、mascot） | 纯内容，不 tokenable——`rules.md` 只记「用/不用、怎么处理」 |
| 拒绝（seline 禁渐变、steep 桃色≤1/页） | `rules.md` 的 Don't |

---

## 首个验收样例：steep（真跑）

**覆盖面 = 首页**（`https://steep.app`，2026-09-15, 视口 1440px）。steep 真站**有子页**（nav: Product / Resources / Customers / Pricing），但本样例只扫首页——为什么这对 steep 仍是**完整覆盖**：① `sites/steep/source/DESIGN.md` 是**首页 style reference**（Refero 抓首页、开篇即写 "The page…"），**对子页零合成层断言** → 首页覆盖 = 覆盖了 DESIGN.md 的**全部断言面**；② 下面 diff 结论**全是 MISSING/WRONG**（探针在首页有**正命中**做铁证），**零 UNGROUNDED** → 完全不碰「多页零命中误判」的雷区（见上 `步骤 1` / UNGROUNDED 前提）。**换一个 DESIGN.md 点到子页效果的站，就必须按步骤 1 逐面补扫**。

探针 v1 实测输出（节选，全量见 diff 时重跑）：

```
backdrop_raster    : bg-home.jpg (1440×1440, top 0), bg-ai-section.jpg (1400×1217, top 7780)
backdrop_gradient  : linear-gradient(in oklab, #f7f7f8 → #fff)  ×2
overlay_texture    : data:image/svg+xml …feTurbulence 噪声 (1440×1480, top 0)
blend              : overlay (1440×1480), multiply (480×480)
dark_region        : rgb(18,18,18) L=0.07 (1440×1517, top 6024)
backdrop_filter    : blur(16px)  ——浮动 composer 卡
shadow_glow        : oklab(…/.3) 0 1px 1px inset  ——同上（毛玻璃）
filter             : drop-shadow(…) ——产品图；transform: scale(0.8) ——缩放拼贴
type_italic        : <em> in H2: "zero chaos"
_counts            : { imgs: 96, svgs: 35 }
```

对照 `sites/steep/source/DESIGN.md` 的 diff 结论：

| 探针信号 | `DESIGN.md` 现状 | 缺陷 |
|---|---|---|
| 位图铺底 `bg-home.jpg`/`bg-ai-section.jpg` + 渐变 + `overlay` 混合 | :200「No photography, no illustration, **no abstract graphics**」 | 🔴 **WRONG** + MISSING（无氛围铺底章节） |
| SVG `feTurbulence` 颗粒叠层 | 无 | 🔴 **MISSING**（颗粒/纹理未记） |
| `dark_region` rgb(18,18,18) 1440×1517 | 头部写死 `Theme: light`，无暗幕规格 | 🔴 **WRONG** + MISSING |
| `backdrop-filter: blur(16px)` + inset glow（浮动卡毛玻璃） | Floating Artifact 只写「subtle shadow」 | 🟠 **MISSING**（毛玻璃/背景滤镜） |
| `<em> "zero chaos"` 斜体设备 | 仅示例 prompt :217 顺带提「one italicized phrase」，无 Do/pattern/token | 🟠 **UNDER**（未立为设备） |
| 产品图 `drop-shadow` + `scale(0.8)` 拼贴 | Floating Artifact 有 10% 影，缩放/错位未记 | 🟡 PARTIAL |

**结论**：steep `DESIGN.md` 合成层**不通过**（2×WRONG + 多处 MISSING）——它把 steep 建模成了平涂 token 表，漏掉了「位图渐变铺底 + 颗粒 + 暗幕 + 毛玻璃 + 斜体设备」整个合成层。这是四站里唯一「错」的（seline 真站验证过为忠实）。**补正落在 [`sites/steep/composition.md`](../../sites/steep/composition.md)**（不改 DESIGN.md 存档），本协议负责**判定 + 产出补充**。

## 局限（诚实边界）

- 探针保证**在它跑的那一页上捕获全**（封闭基底），**不**替你判每条的归宿（上表是设计判断，由运动员 agent 做、裁判 agent 复核，非探针代劳——判断≠真人，可 AFK）。
- **单页工具 → 多页覆盖是运动员的责任**：探针读「当前页」。MISSING/WRONG 靠「探针有命中」立证，扫哪页都是铁证；但 **UNGROUNDED 靠「零命中」，只在扫过该断言指向的面后才成立**——跨页断言要逐页跑、取并集。漏扫一个面 → 顶多把该面的效果误判 MISSING/UNGROUNDED，靠补跑那页消除（`步骤 1` 已要求覆盖 doc 点到的每个面）。**DESIGN.md 只描述首页 + 结论全是 MISSING/WRONG（正命中）的站**（如 steep——它有子页，但 DESIGN.md 只断言首页、零 UNGROUNDED）不碰此雷区；**只要 DESIGN.md 点到某子页的效果，就必须扫那页**。
- **动态/进场触发**的效果（滚动视差、hover 态、动画中间帧）需相应交互后再跑；v1 只覆盖静态绘制态 + 滚动懒加载。
- 探针读的是**渲染结果**，不解释**设计意图**（为何这样画）——意图仍要人从真站观感提炼进 `DESIGN.md` 散文。
