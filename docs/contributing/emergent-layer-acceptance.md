# 涌现层（合成层）验收协议

> 一个站的 `DESIGN.md` 有没有**忠实、无遗漏地**记下它真站的**合成层**（composition traits）——氛围铺底、明暗幕、辉光、图像材质、字形设备、以及「刻意拒绝」——的可复用验收流程。**每接入/复核一个站跑一次**，把 `<site>` 换成站名。
>
> **为什么需要它**：Refero 抽取把**值槽**（单值、可直接进 `--stitch-*` 契约的：色/字阶/圆角/阴影/间距）抽得准，但**合成层**（要多图层/定位/滤镜/混合才成立、换肤跟不了单个变量的特征）系统性漏、甚至写反——steep 的 `DESIGN.md` 就把满屏的位图渐变 + 颗粒 + 暗区判成了「no abstract graphics」。这类漏是**静默**的（不报错、只是复刻出来变丑），靠人眼逐站抽查必漏，所以要一个机械协议。术语「值槽 vs 合成层」「单槽判据」见 [CONTEXT.md](../../CONTEXT.md)。
>
> 是 [接入新站 playbook](./onboard-site.md) 的一步：抽完 `adapter.css`/`rules.md` 后，用本协议核 `DESIGN.md` 的合成层。

---

## 判据（单槽测试）

> **合成层特征 = 无法用单个 `--stitch-*` 值复现、需「组合」才成立的视觉特征**（多图层 / 定位 / 滤镜 / 混合 / 或刻意拒绝）。能塞进一个单槽 → 值槽（不归本协议）；不能 → 合成层（本协议的猎物）。

**通用性不来自任何「N 轴清单」**——设计意图是开放的，第 N 个站会冒出没见过的花样。通用性来自**浏览器能画出来的东西是封闭的**：CSS 绘制模型成文有限（背景/渐变、`box-shadow`、`filter`、`backdrop-filter`、`mix-blend-mode`、`transform`、`clip-path`、`mask`、伪元素、字形渲染…）。探针扫的是这个**封闭基底**，任何合成特征只要被画出来就一定被 dump 到。下文出现的桶名（`backdrop_*`/`shadow_glow`/`filter`…）**只是可读分组，不是 schema、不是验收闸门**——闸门永远是「探针在真站找到的每一条，`DESIGN.md` 有没有回应」。

## 协议三步

### 1. 跑探针（对**真站**，不是对 demo）

浏览器打开该站真实首页 → 滚到底触发懒加载 → 跑 [`scripts/emergent-probe.js`](../../scripts/emergent-probe.js)：

- **DevTools**：整段粘贴，执行 `copy(emergentProbe())` 拷走 JSON。
- **Playwright/注入式 MCP**：取 `emergentProbe` 函数体交给 `evaluate`（滚动到底后再跑）。

产物 = 该站真站的**合成信号 JSON**（按桶去重，每条带样例选择器 + 幅面/位置）。

### 2. 三类缺陷 diff（探针输出 ↔ `DESIGN.md` 断言）

逐条比对，标一类：

| 缺陷 | 含义 | 例 |
|---|---|---|
| **MISSING** | 站有、`DESIGN.md` 只字未提 | steep 有位图渐变铺底，doc 无氛围章节 |
| **WRONG** | `DESIGN.md` 断言与实况相反 | steep doc 写「no abstract graphics」，实际满屏铺底 |
| **UNGROUNDED** | `DESIGN.md` 断言、真站却没有 | doc 说「有青色辉光」，探针零命中 |

**留白也要显式**：站**刻意没有**某效果（如 seline 真站渐变极平），`DESIGN.md` 必须写成「**刻意无 X**」（Don't 条目），不能空着——空着无法与「漏了」区分。

### 3. 验收判据

> 该站合成层通过 ⟺ **探针输出的每一条**，都能在 `DESIGN.md`（值槽部分）**或**该站 `composition.md`（合成层补充）里找到对应——要么被**反映**（记了这个效果），要么被**显式拒绝**（Don't: 刻意无 X）。零 MISSING / 零 WRONG / 零 UNGROUNDED。
>
> **不改 DESIGN.md**：它是 Refero 下载存档（不动）。合成层的缺、以及 DESIGN.md 的勘误（写反/漏），都落在**新增的 `sites/<site>/composition.md`**（DESIGN.md 的补充，本协议产物；合成层部分冲突时以它为准）。样例见 [`sites/steep/composition.md`](../../sites/steep/composition.md)。

判据锚在「真站实际画了什么」，不是「填满几个框」——所以**扛得住没见过的合成特征**：新花样只要被画出来就进探针输出，就必须被回应。

## 每条信号的归宿（人判，非机械）

探针保证**捕获全**；**每条该落到哪一层**仍是设计判断，不由探针代劳：

| 信号形态 | 归宿 |
|---|---|
| 单值可表达的（铺底纯色/渐变、辉光阴影、图像滤镜） | 契约新槽 `--stitch-backdrop-*` / `--stitch-glow-*` / `--stitch-image-filter`（换肤跟随） |
| 定位/构图/图层编排（拼贴错位、区块原型、明暗幕出现节奏） | 该站 `rules.md`（每站规则） |
| 内容资产（产品截图、插画、mascot） | 纯内容，不 tokenable——`rules.md` 只记「用/不用、怎么处理」 |
| 拒绝（seline 禁渐变、steep 桃色≤1/页） | `rules.md` 的 Don't |

---

## 首个验收样例：steep（真跑）

真站 `https://steep.app`，探针 v1 实测输出（节选，全量见 diff 时重跑）：

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

- 探针保证**捕获全**（封闭基底），**不**替你判每条的归宿（上表是人的设计判断）。
- **动态/进场触发**的效果（滚动视差、hover 态、动画中间帧）需相应交互后再跑；v1 只覆盖静态绘制态 + 滚动懒加载。
- 探针读的是**渲染结果**，不解释**设计意图**（为何这样画）——意图仍要人从真站观感提炼进 `DESIGN.md` 散文。
