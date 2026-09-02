# 多站换肤架构

> 本项目核心目标之一：**框架搭一次，不同网站切换成不同风格**（不能所有站都长一个样）。参考数据来自 Refero（styles.refero.design），本地样例见 `sites/<站>/source/`（steep / phantom / saybriefly / seline 四个站）。本章先讲清架构（9.1–9.5），再给操作流程（9.6–9.7）。

> **正本位置**：本文内联的契约 / 适配 / 全局规则代码块是**带注解的讲解版**；可直接使用的正本文件是
> [`packages/tokens/contract.css`](../../packages/tokens/contract.css)、`sites/<站>/adapter.css`（steep 已有样例）、
> [`docs/design-system/design-rules.md`](./design-rules.md)。三者若与本文不一致，以正本文件为准。

### 9.1 前言

先分清两种"多主题"，否则会过度设计：

| | (A) 运行时切 | (B) 构建时切 ← **我们要的** |
|---|---|---|
| 场景 | 同一个应用里用户点开关切深色/切品牌 | 一个网站一套风格，各自独立部署 |
| 主题共存 | 所有主题同时躺在一份 CSS 里，靠 `[data-theme=x]` 作用域切换 | 每次构建只有一套风格 |
| 源头形状 | 需要 primitives + 语义两层 + 主题矩阵（theme×token 的表） | 每个站一个独立 bundle，**不需要矩阵** |
| 复杂度 | 高 | 低（本质是"单套主题 × N 个站"，一套主题重复 N 次） |

**我们走 (B)。** 别被"多主题必须搞 primitives/语义矩阵"吓到——那是 (A) 的要求。(B) 里"多套"就是"单套重复"，单套能跑多套就能跑。什么时候才升级到 (A)？见 [9.7](#97-何时升级到-tokensjson-生成方案)。

### 9.2 一个站的风格 = 值 + 规则（两条路径）

**核心认知**：切成某个站的风格**不是只换色值**。一个站的风格 = **值**（颜色/圆角/字体）+ **规则**（Do/Don't、组件用法、构图克制）。只换值，组件变色了，但 AI 生成页面仍会给卡片乱加阴影、把强调色铺成背景——**颜色对了，风格没到**。

所以每站从它的 bundle（见 [9.3](#93-输入refero-bundle5-文件消费映射)）劈出**两个产物**，喂**两条消费路径**：

| 产物 | 内容 | 消费路径 | 谁读 |
|---|---|---|---|
| `adapter.css` | 该站的值填进角色变量（静态 `:root`） | **渲染路径** | React 组件（`var()` 求值） |
| `rules.md` | Do/Don't + 组件规格 + 用法 | **生成路径** | AI 生成页面/模板时 |

- 渲染路径只需 `adapter.css`——组件读 `var(--stitch-*)` 即渲染成该站颜色。
- 生成路径需 `adapter.css`（让 `var()` 有值）**+ `rules.md`**（让构图和用法守规矩）。

#### 9.2.1 模型：插座 / 插头 / 转接头

- **角色契约 = 插座**（一次性定死）：框架定义一套固定的**角色 CSS 变量**，组件只往插座里插，写一次永不改。
- **每站 bundle = 插头**（各不相同）：每个站的 token 按"长相"命名（steep 是 `blush-peach`/`ink-black`），命名各异。
- **适配层 = 转接头**（每站一小段）：把该站的值**映射**到角色插座上。换站 = 换转接头，插座和电器（组件）一动不动。

```
组件(写一次)                 角色契约(插座,固定)             每站适配(转接头,可换)              某站bundle(插头)
var(--stitch-accent) ──读─▶ --stitch-accent ◀─绑定─ --stitch-accent: #fbe1d1; ◀─取自─ blush-peach
```

**两条铁律**：
1. 组件、页面模板**只准读角色变量**（`var(--stitch-accent)`），**禁止**直接读某站长相变量（`var(--color-blush-peach)`）或写死 hex。全部 `--stitch-` 前缀。
2. 角色契约是**公开 API**，改名 = 破坏性变更（所有站适配都要跟改）。当稳定接口维护。

#### 9.2.2 目录全景

换肤就**两层四件**：值层（`contract.css` + 每站 `adapter.css`）、规则层（`design-rules.md` + 每站 `rules.md`）。

```
packages/tokens/         ← 只放代码/产物
├── contract.css      角色契约(插座+默认值+反馈稳定层),框架唯一,稳定   【值·全局】
└── contract.d.ts     (可选)角色变量名 TS 类型,防止组件读错名

docs/design-system/      ← 文档(不是代码,故不放 packages/)
└── design-rules.md   全局规则(与皮肤无关的跨主题工程纪律)              【规则·全局】

sites/                   ← 每站一个文件夹,该站所有产物聚在一起
├── steep/
│   ├── source/       原始 bundle 存档(见 9.3)
│   ├── adapter.css   把该站值填进 --stitch-* 角色变量的静态:root(非脚本)  【值·每站】
│   └── rules.md      从 DESIGN.md 抽的 Do/Don't + 组件规格            【规则·每站】
└── <other-site>/
    ├── source/
    ├── adapter.css
    └── rules.md
```

> **为什么值/规则的全局件不在同一目录**：`contract.css` 是要发布的代码(归 `packages/`)，`design-rules.md` 是文档(归 `docs/`)——按**性质**分家。每站的 `adapter.css`+`rules.md` 则按**站**聚在 `sites/<站>/`(一个站的东西放一起，方便)。

构建/选定某站：渲染引 `contract.css` + 该站 `adapter.css`（见 [9.4](#94-值层契约全局-适配每站)）；AI 生成页面额外加载全局 `design-rules.md` + 该站 `rules.md`（见 [9.5](#95-规则层全局规则--每站规则)）。组件库只依赖角色名，不感知站。

### 9.3 输入：Refero bundle（5 文件消费映射）

后面的 adapter 和 rules 都从这个 bundle 来，先讲清它长什么样。一个站的 bundle 有 5 个文件，**东西全在 `DESIGN.md`（超集）**，其余是同源换格式，别被数量吓到：

| 文件 | 是什么 | 我们怎么用 |
|---|---|---|
| `DESIGN.md` | **超集**：带 Role 列的色表、字体规格、**组件像素规格**、**Do/Don't**、**Quick Color Reference（语义映射已做好）**、Example Prompts；末尾还内嵌 variables.css + theme.css | **主力**：抽值→`adapter.css`，抽规则→`rules.md` |
| `tokens.json` | 值的结构化版（DTCG，带 `$description`=Role） | 值来源之一（跑生成器/工具时用） |
| `variables.css` | 值的即用 CSS 版（`:root`） | 值来源之一（手写 adapter 时对照） |
| `theme.css` | 值的 Tailwind `@theme` 版（variables.css 子集） | **除非上 Tailwind，否则忽略** |
| `README.md` | 站名 + 首页 URL | 忽略 |

> 手写 adapter 以 `DESIGN.md` 为输入（映射已列好、顺带出 rules.md）；`tokens.json` 留作值核对，或**将来上生成器**（那条路的 DTCG 源，见 [9.7](#97-何时升级到-tokensjson-生成方案)）。语义绑定不用猜——`DESIGN.md` 的 **Quick Color Reference**（`text/background/border/muted/accent/primary action → hex`）+ 色表 **Role 列**，已把"哪个色是什么角色"写好。

### 9.4 值层：契约（全局）+ 适配（每站）

**先讲清两者关系——同一批变量名，两套值：**

- `contract.css`（全局）：定义**全部** `--stitch-*` 变量名 + 一套默认值（兜底）。
- `adapter.css`（每站）：**同名**重声明其中的 `【每站】` 变量，填上**这个站的值**。

```
contract.css (全局:定义所有名字+默认值)        sites/seline/adapter.css (同名,只覆盖值)
:root {                                        :root {
  --stitch-accent:    #17191c;  /* 默认 */       --stitch-accent:    #3ba6f1;  /* seline cyan */
  --stitch-bg-canvas: #ffffff;                   --stitch-bg-canvas: #fafaf9;
  ...(全部 --stitch-*)...                        ...(只覆盖【每站】那几个)...
}                                              }
```

- 两个都是 `:root`；**adapter 后加载 → 同名变量覆盖 contract**。
- 组件永远读 `var(--stitch-accent)`；引哪个站的 adapter，就显示哪个站的值。没被覆盖的槽自动用 contract 的定义：`【恒定】` 用默认值；`【派生】` 用契约里的 `color-mix`/`var()` 表达式，会按 adapter 覆盖后的**新基值重算**（所以改了 accent，accent-hover 自动跟着变）。

> **一句话**：`adapter.css` = `contract.css` 的变量名 + 某站的值。名字一模一样，只是值不同——这就是"插座固定、转接头换"的代码形态。

#### 9.4.1 契约 `contract.css`

**字段从哪来**：不能拍脑袋，要**由组件决定**。契约的字段集是一份**经过真实组件验证的基线**（交互/组件层，48 个），再叠一层**品牌/表面层**以覆盖四站需要：

- **交互/组件层**（`primary` 家族、`success/warning/error` 各 base/hover/active、`text-*`、`border-*`、`mask-bg`、`spacing`、`shadow`、`motion`、`height` 等）→ **字段沿用这套经过验证的基线**（统一 `--stitch-` 前缀）。其中 `success/warning` 基线里定义了但暂未用——你的 D（中后台）会用，照留别删。
- **品牌/表面层**（基线太薄，按四站扩）：

  | 缺口 | 基线 | 四站需要 → 扩成 |
  |---|---|---|
  | 表面层级 | 只有 bg/-secondary/-disabled | `bg-canvas/section/card/elevated/accent/inverted` |
  | 强调色可浅 | primary 假设深色 | `accent` + `accent-text` + `text-on-accent` |
  | 暗色区块 | 无 | `bg-inverted` + `text-on-dark` |
  | 字体 | 1 个 font-family | `font-display/body/mono` |
  | 圆角 | sm/base/lg 笼统 | **按元素** `radius-button/card/input/image` |
  | 链接 | 无（混用 primary） | `link` |

**每个字段标「值来源」——决定它会不会串风格**：

| 标记 | 含义 | 会不会串风格/带来源站味 |
|---|---|---|
| `【每站】` | 每站 adapter 从该站 DESIGN.md 填 | 否——值是该站自己的 |
| `【恒定】` | 契约默认，跨站不变 | 否——功能/隐形型，恒定=对 |
| `【派生】` | 契约里用 CSS 活表达式（`color-mix`/`var()`）从别的 token 算，**自动跟随基值**（基值随站，它也随站变）——**adapter 不用写它** | 否 |

> **关键**：字段沿用基线**不会串风格**——串风格的是「值」。按值来源分三类：
> - `【每站】`：风格承载型（surface/text/accent/link/font/radius/shadow）+ 可选间距/字阶——每站填，不带来源站味。
> - `【派生】`：上面这些的 hover/active、text-disabled、focus——契约里是 `color-mix`/`var()` 活表达式，自动跟随基值，adapter 不用写。
> - `【恒定】`：既不承载风格、Refero 又不提供的功能项（反馈色**基值** danger/success/warning、bg-disabled、border-width、line-height、mask、控件高度、motion）——跨站不变，恒定反而正确（红色错误每站都该红）。
>
> **判据**：风格承载 + Refero 是否提供，两者都满足才 `【每站】`（如 spacing）；Refero 不提供的（motion/height/mask）即便略带风格也只能用默认。

```css
/* packages/tokens/contract.css */
:root {
  /* ═══════ 品牌 / 表面层（扩展自四站，值几乎全每站换）═══════ */

  /* 背景 / 表面（按层级）*/
  --stitch-bg-canvas:      #ffffff;  /* 【每站】页面底板 */
  --stitch-bg-section:     #fafafb;  /* 【每站】交替区块背景 */
  --stitch-bg-card:        #f2f2f3;  /* 【每站】卡片/嵌套内容 */
  --stitch-bg-elevated:    #ffffff;  /* 【每站】浮层/悬浮产品 UI */
  --stitch-bg-accent:      #fbe1d1;  /* 【每站】强调卡片背景 */
  --stitch-bg-inverted:    #17191c;  /* 【每站】暗色区块(有则填,无则=text-primary) */

  /* 文字（按角色；含站的中性色调,暖/冷灰随站）*/
  --stitch-text-primary:   #17191c;  /* 【每站】正文/标题主色 */
  --stitch-text-secondary: #777b86;  /* 【每站】次要说明 */
  --stitch-text-muted:     #a3a6af;  /* 【每站】占位符/弱化 */
  --stitch-text-on-accent: #5d2a1a;  /* 【每站】强调面上的文字 */
  --stitch-text-on-dark:   #ffffff;  /* 【每站】暗色面上的文字 */

  /* 强调 / 链接 */
  --stitch-accent:         #17191c;  /* 【每站】主行动色(CTA 填充,可为浅色) */
  --stitch-accent-hover:   color-mix(in srgb, var(--stitch-accent), black 12%);  /* 【派生·自动跟随 accent】 */
  --stitch-accent-active:  color-mix(in srgb, var(--stitch-accent), black 22%);  /* 【派生·自动跟随 accent】 */
  --stitch-accent-text:    #ffffff;  /* 【每站】CTA 上的文字(phantom 为深色) */
  --stitch-link:           #777b86;  /* 【每站】链接色 */

  /* 分类色槽（只为"互相区分"的分类,如 Tag 分类用法;N=6 固定,可移植;每站填可区分色:色多鲜艳/色少调子。语义色不走这套,用 danger/success/warning/info）*/
  --stitch-cat-1: #5b8def;  /* 【每站】占位,每站必填 */
  --stitch-cat-2: #52a373;  /* 【每站】 */
  --stitch-cat-3: #d9a441;  /* 【每站】 */
  --stitch-cat-4: #c9605f;  /* 【每站】 */
  --stitch-cat-5: #9a6cb0;  /* 【每站】 */
  --stitch-cat-6: #4aa5a5;  /* 【每站】 */

  /* 字体 */
  --stitch-font-display:   'Signifier', serif;       /* 【每站】标题 */
  --stitch-font-body:      'Sohne', sans-serif;      /* 【每站】正文/UI */
  --stitch-font-mono:      ui-monospace, monospace;  /* 【每站】等宽(仅个别站,如 saybriefly) */

  /* 圆角（按元素 button/card/input/image，而非 sm/base/lg，因站内按元素差异极大）*/
  --stitch-radius-button:  9999px;  /* 【每站】 */
  --stitch-radius-card:    24px;    /* 【每站】 */
  --stitch-radius-input:   16px;    /* 【每站】 */
  --stitch-radius-image:   12px;    /* 【每站】 */

  /* 阴影（强风格承载：steep 几乎无影 vs seline 四层）*/
  --stitch-shadow-sm:   0 0 0 1px rgba(0,0,0,.05), 0 4px 24px rgba(0,0,0,.08);       /* 【每站】 */
  --stitch-shadow-base: 0 0 0 1px rgba(0,0,0,.05), 0 8px 40px rgba(0,0,0,.10);       /* 【每站】 */
  --stitch-shadow-lg:   0 0 0 1px rgba(0,0,0,.05), 0 20px 25px -5px rgba(0,0,0,.1);  /* 【每站】 */

  /* 线条 */
  --stitch-border:         #e6e6e8;  /* 【每站】 */
  --stitch-border-strong:  #cfcfd3;  /* 【每站】 */
  --stitch-border-width:   1px;      /* 【恒定】 */

  /* 字阶（可选每站覆盖：hero 尺寸是大风格杠杆，steep 90px vs seline 52px）*/
  --stitch-font-size-sm:      14px;  /* 【每站·可选】 */
  --stitch-font-size-base:    16px;  /* 【每站·可选】 */
  --stitch-font-size-lg:      20px;  /* 【每站·可选】 */
  --stitch-font-size-display: 64px;  /* 【每站·可选】 */
  --stitch-line-height-base:  1.5;   /* 【恒定】 */

  /* ═══════ 交互 / 组件层（字段沿用经过验证的基线，值多为恒定）═══════ */

  /* 反馈色【稳定默认层】= 功能色,恒定;唯一允许 AI 按站冷暖微调色相且标"需确认"(见 9.4.2) */
  /* 四状态各 base(恒定)+ hover/active(派生·混黑)+ bg 软底(派生·混 canvas,给 Notification/Alert 浅底) */
  --stitch-danger:          #c0392b;  /* 【恒定】 */
  --stitch-danger-hover:    color-mix(in srgb, var(--stitch-danger), black 12%);              /* 【派生·跟随 danger】 */
  --stitch-danger-active:   color-mix(in srgb, var(--stitch-danger), black 22%);              /* 【派生·跟随 danger】 */
  --stitch-danger-bg:       color-mix(in srgb, var(--stitch-danger), var(--stitch-bg-canvas) 88%);  /* 【派生】软底 */
  --stitch-success:         #2e7d32;  /* 【恒定】 */
  --stitch-success-hover:   color-mix(in srgb, var(--stitch-success), black 12%);             /* 【派生·跟随 success】 */
  --stitch-success-active:  color-mix(in srgb, var(--stitch-success), black 22%);             /* 【派生·跟随 success】 */
  --stitch-success-bg:      color-mix(in srgb, var(--stitch-success), var(--stitch-bg-canvas) 88%); /* 【派生】软底 */
  --stitch-warning:         #b8860b;  /* 【恒定】 */
  --stitch-warning-hover:   color-mix(in srgb, var(--stitch-warning), black 12%);             /* 【派生·跟随 warning】 */
  --stitch-warning-active:  color-mix(in srgb, var(--stitch-warning), black 22%);             /* 【派生·跟随 warning】 */
  --stitch-warning-bg:      color-mix(in srgb, var(--stitch-warning), var(--stitch-bg-canvas) 88%); /* 【派生】软底 */
  --stitch-info:            #2b7fd8;  /* 【恒定】 */
  --stitch-info-hover:      color-mix(in srgb, var(--stitch-info), black 12%);                /* 【派生·跟随 info】 */
  --stitch-info-active:     color-mix(in srgb, var(--stitch-info), black 22%);                /* 【派生·跟随 info】 */
  --stitch-info-bg:         color-mix(in srgb, var(--stitch-info), var(--stitch-bg-canvas) 88%);    /* 【派生】软底 */

  /* 禁用 / 聚焦 */
  --stitch-text-disabled:  color-mix(in srgb, var(--stitch-text-muted), var(--stitch-bg-canvas) 45%);  /* 【派生·跟随 text-muted】 */
  --stitch-bg-disabled:    #f0f0f0;  /* 【恒定】 */
  --stitch-focus-ring:     var(--stitch-accent);  /* 【派生·跟随 accent】 */

  /* 间距（Refero 有此类目;4px 基准格通常不动,但密度是风格杠杆 → 可每站覆盖。
     "区块留白用多少"属构图,归 rules.md 的 Layout,不在 token 层）*/
  --stitch-spacing-xs: 4px;  --stitch-spacing-sm: 8px;  --stitch-spacing-md: 12px;   /* 【每站·可选】 */
  --stitch-spacing-lg: 16px; --stitch-spacing-xl: 24px;                              /* 【每站·可选】 */

  /* 遮罩 / 控件高度 / 动效（Refero 都不提供 → 只能用契约默认;低风格信号,恒定）*/
  --stitch-mask-bg:        rgba(0,0,0,.45);         /* 【恒定】弹窗蒙层,可每站微调色调 */
  /* 控件高度:表单控件(Button/Input/Select…)按 size 取同一高度,保证同 size 控件在一行严丝对齐(如搜索框+按钮)。
     恒定原因:控件高度是组件库的人机工程决定(够大的点击区、够高的可读性),不是品牌风格——steep/seline 的中号按钮都该 40 上下,不因风格变 20 或 60;且 Refero 不提供 → 敦实/紧凑站才在 adapter 覆盖 */
  --stitch-height-sm:   32px; --stitch-height-base: 40px; --stitch-height-lg: 48px;  /* 【恒定】 */
  --stitch-motion-duration-fast: 120ms;  --stitch-motion-duration-base: 200ms;       /* 【恒定】 */
  --stitch-motion-ease: cubic-bezier(.4,0,.2,1);                                     /* 【恒定】 */
}
```

> **默认值哪来的**：契约里现填的值取自 steep（纯占位），只在某站 adapter **没提供**某个 `【每站】` 槽时兜底。
> **圆角为何按元素**：圆角不用 `sm/base/lg`，改为**按元素**（button/card/input/image）——站内不同元素圆角差异极大（按钮药丸、卡片 24、输入 16），"大中小"表达不了。
>
> **分类色槽 `--stitch-cat-1 … -6`**：给"任意分类各配一个色、只为互相区分"的组件用（如 Tag 分类用法）。**数量固定 6**（组件可移植的前提：任何组件都能安全用到第 6 类，在任何主题上都在）；每站 adapter 填满 6 个**可区分**色，**值一律取自该站自己的调色板 + 从中 `color-mix` 派生，不外部手挑任意 hex**（色多的站用它的真实多色、色少的站在自有色上做色阶/混合）。契约里现填的是占位值，每站必填。**语义色（成功/危险/警告/信息）不走这套**——用 `danger/success/warning/info` 状态角色。**绝不用长相名**（`--stitch-blue` 之类）。



#### 9.4.2 适配 `adapter.css`

每站一个文件，如 `sites/steep/adapter.css`。**它是一段静态 `:root`，不是会跑的转换脚本**——"转换"发生在编写时（AI 读 DESIGN.md + 人确认），文件只是**冻结下来的结果**：把该站的值，用**我们的角色名**（`--stitch-*`）重写一遍，**不引用站的原始变量名**（`--color-blush-peach` 永不进你的应用）。

它覆盖哪些槽：

- **`【每站】`**：全部覆盖（这是主体）。
- **`【每站·可选】`**（间距）：站的密度不同才覆盖。
- **`【派生】`**：**不写**——契约里已是 `color-mix`/`var()` 活表达式，adapter 一改基值（如 `accent`）它自动重算跟随。
- **`【恒定】`**：不动（含反馈色 danger/success/warning——稳定默认层，不在这里设）。

**映射三情况**（不总是 1:1）：
1. **直接对应**（多数）：`paper-white → --stitch-bg-canvas`，照抄。
2. **多选一**（收敛）：steep 有 9 档灰，契约只要 3 档 → 从中挑 `ink-black / slate-gray / smoke-gray` 绑到 `text-primary/secondary/muted`。
3. **缺角色**：
   - **品牌/表面类**（如 CTA）：按判断补。steep 无彩色主行动色 → 判为"黑填充按钮"（`accent = ink-black`）。
   - **反馈色**（danger/success/warning）：DESIGN.md 基本都没有 → **别在这个站的 adapter 里自己编一版**，adapter 里根本不写这几行，直接沿用**契约的稳定默认**（一次性设计好、对比度达标的全局值，不是"编"）。仅当站的冷暖极明显时，AI 才微调色相并标 `需确认`。
     > 注意它和 CTA 缺失**处理不同**：accent/CTA 缺了要**判断补**（③），因为品牌色本就每站不同；反馈色是功能色，缺了**不补**、用全局默认（红色错误在哪个站都该是红）。

**每个值标来源**（AI 生成时自动打标，你一眼知道复核哪些）：

| 层 | 做法 | 可靠度 | 谁定 |
|---|---|---|---|
| **① 抽取** | DESIGN.md/tokens **明写了**就读出来填 | 高 | AI 自动 |
| **② 派生** | 站里没写，**按公式从品牌色算**（`accent-hover=darken(accent)`、`focus=accent`） | 高（确定性） | AI 自动 |
| **③ 需确认** | 站里**根本没有**（多为反馈色），只能凭调性给 | 低（是发明） | 规则兜底 + 人确认 |

> 依据：四站里三个**没有** danger/warning；seline 明写 `Focus ring 2px #3ba6f1`（可抽取）。可抽取的抽、抽不到的派生，别硬编。

#### 9.4.3 示例：以 Steep 为例

> 下面这份对照 `sites/steep/source/` 源文件**逐值核对过**（颜色/圆角/字体/阴影均取自 steep 真实 token；阴影 verbatim 抄 `variables.css`）。标 `②`（多选一）/ `③`（判断补）的仍需人确认；**没列的槽**（border-strong、font-mono、text-on-dark、反馈色、派生、恒定）不写，自动用 contract 定义。

```css
/* sites/steep/adapter.css —— 只覆盖【每站】槽 */
:root {
  /* 背景 / 表面 */
  --stitch-bg-canvas:      #ffffff;  /* ① canvas / paper-white */
  --stitch-bg-section:     #fafafb;  /* ① section-fog / fog-white */
  --stitch-bg-card:        #f2f2f3;  /* ① card-mist / mist-gray */
  --stitch-bg-elevated:    #ffffff;  /* ① elevated-white */
  --stitch-bg-accent:      #fbe1d1;  /* ① accent-blush / blush-peach */
  --stitch-bg-inverted:    #17191c;  /* ② steep 无暗区 → 用 ink-black 兜底 */

  /* 文字（steep 4 档灰 → 收敛到契约 3 档）*/
  --stitch-text-primary:   #17191c;  /* ① ink-black（Quick Ref: text）*/
  --stitch-text-secondary: #777b86;  /* ① slate-gray（secondary/helper）*/
  --stitch-text-muted:     #979799;  /* ② 多选一: 取 ash-gray 作更弱的 muted（smoke #a3a6af 归 disabled）*/
  --stitch-text-on-accent: #5d2a1a;  /* ① sienna-brown（桃色面上的字/描边）*/

  /* 强调 / 链接 */
  --stitch-accent:      #17191c;  /* ③ 需确认: steep 无彩色 CTA,主按钮=黑填充 → ink-black */
  --stitch-accent-text: #ffffff;  /* ① 填充按钮文字 */
  --stitch-link:        #777b86;  /* ① slate-gray（Role: link color）*/

  /* 分类色槽（steep 近单色 → 全部取自它自己的调色板 + 从中 color-mix 派生,不外部手挑;禁鲜艳彩虹以守 97% achromatic）*/
  --stitch-cat-1: #fbe1d1;  /* ① blush-peach（bundle）*/
  --stitch-cat-2: #5d2a1a;  /* ① sienna-brown（bundle）*/
  --stitch-cat-3: #777b86;  /* ① slate-gray（bundle）*/
  --stitch-cat-4: #a3a6af;  /* ① smoke-gray（bundle）*/
  --stitch-cat-5: color-mix(in srgb, #fbe1d1, #5d2a1a 45%);  /* ② 派生: peach↔sienna 混 */
  --stitch-cat-6: color-mix(in srgb, #777b86, #ffffff 45%);   /* ② 派生: slate 提亮 */

  /* 字体（substitute 见 DESIGN.md）*/
  --stitch-font-display: 'Signifier', ui-serif, Georgia, serif;          /* ① 标题衬线 */
  --stitch-font-body:    'Sohne', ui-sans-serif, system-ui, sans-serif;  /* ① 正文/UI */

  /* 圆角（DESIGN.md Border Radius）*/
  --stitch-radius-button: 9999px;  /* ① buttons */
  --stitch-radius-card:   24px;    /* ① cards */
  --stitch-radius-input:  16px;    /* ① inputs */
  --stitch-radius-image:  12px;    /* ① images */

  /* 线条 */
  --stitch-border: #ececec;  /* ① Input 规格 / Quick Ref: border #ececec */

  /* 阴影（verbatim from variables.css: subtle / subtle-2 / subtle-3）*/
  --stitch-shadow-sm:   oklab(0 0 0 / 0.05) 0px 0px 0px 1px, rgba(0,0,0,0.08) 0px 4px 24px 0px;   /* ① --shadow-subtle */
  --stitch-shadow-base: oklab(0 0 0 / 0.05) 0px 0px 0px 1px, rgba(0,0,0,0.1) 0px 8px 40px 0px;    /* ① --shadow-subtle-2 */
  --stitch-shadow-lg:   rgba(4,23,43,0.05) 0px 0px 0px 1px, rgba(0,0,0,0.1) 0px 20px 25px -5px, rgba(0,0,0,0.1) 0px 8px 10px -6px;  /* ① --shadow-subtle-3 */

  /* 字阶（可选; steep 招牌是 17 正文 + 90 display）*/
  --stitch-font-size-base:    17px;  /* ② steep body */
  --stitch-font-size-display: 90px;  /* ② steep display（招牌尺寸）*/

  /* 未列: border-strong / font-mono / text-on-dark / 反馈色 / 派生 / 恒定 → 不写,用 contract 定义 */
}
```

### 9.5 规则层：全局规则 + 每站规则

和值层对称：规则也分**全局一份**（框架级、跟站无关）+ **每站一份**（该站风格）。AI 生成某站页面时加载**两者**。

**判据**：凡规定"具体长什么样（颜色/圆角/字重/阴影/组件形状）"的，是某站的**皮**，不进全局（由每站 rules.md 定）；凡规定"工程纪律（用 token、图标怎么来、缓动、对比度）"的，**放全局，跨站恒定**。

#### 9.5.1 全局 `design-rules.md`

**全局规则 = 与皮肤无关的工程纪律**：用角色 token（不硬编码、不读某站长相变量）、图标来源统一、缓动统一、对比度达 AA、配色比例。这些跟具体品牌长什么样无关，跨站恒定。

**品牌长相不进全局**：具体颜色、圆角、字重、阴影、组件形状因站而异，一律交给每站 `rules.md`——把它们塞进全局只会锁死某一种皮、和别的站冲突。

**`design-rules.md` 内容（定稿，跨站恒定）**：

```markdown
# Stitch 全局设计规则（与皮肤无关，所有站通用）

> 这些是与皮肤无关的跨主题通用规则。品牌长相（颜色/圆角/字重/阴影）不在这里——那在每站 rules.md。

## 硬规则

1. 只用角色变量，不硬编码主题值
   - ❌ `color:#17191c;` / `border-radius:24px;` / `font-family:'Signifier';`
   - ✅ `color:var(--stitch-text-primary);` / `var(--stitch-radius-card)` / `var(--stitch-font-display)`
   - 例外：非主题的结构值（`z-index`、`1px` 发丝线、布局 `%`）可写字面量。

2. 不读某站的长相变量（换站即失效）
   - ❌ `var(--color-blush-peach)`
   - ✅ `var(--stitch-bg-accent)`

3. 图标用 `<Icon>`；不用 emoji、不内联 `<svg>`、不写 Unicode 符号
   - ❌ `<span>🌊 Beach</span>` / 裸 `✓ ✕ →` / 手写 `<svg>` / 第三方图标库
   - ✅ `<Icon name="..." />`；纯装饰用 CSS/HTML

4. 动效缓动统一
   - ❌ `transition:all .3s ease;` / 时长 >0.35s 或 <0.15s
   - ✅ `transition:<prop> var(--stitch-motion-duration-base) var(--stitch-motion-ease);`

5. 无障碍对比达 AA
   - 正文 ≥4.5:1，大字/图标 ≥3:1；反馈色是稳定层已达标，别在某站覆盖成不达标值。

6. 配色比例 60-30-10
   - 一个版面里：主色约 60% + 次色约 30% + 强调/点缀约 10%（点缀永远是点缀，不喧宾夺主）。
   - 这是"怎么用主题的几个色去铺版面"的**比例**规则，跟具体色值无关；用主题的 `--stitch-*` 角色去分配这三档，别引入主题外的新色。

## 提交前检查清单
- [ ] 无硬编码主题色/圆角/字体（全走 `var(--stitch-*)`）
- [ ] 无 `var(--color-*)` 等某站原始变量
- [ ] 图标全 `<Icon>`；无 emoji / 裸 SVG / Unicode 符号
- [ ] 过渡用 `--stitch-motion-*`，时长 0.15–0.35s
- [ ] 关键文字对比 ≥ AA
```

#### 9.5.2 每站 `rules.md` 模板（从 DESIGN.md 抽）

每节标注**从该站 DESIGN.md 哪段来**，全部 `【来自站 DESIGN.md】`：

```markdown
# <站名> — 风格规则

## 一句话风格        ← DESIGN.md 顶部 tagline + 概览散文
> 例:serif analytics on warm paper;编辑感、近单色、桃色点缀

## 调色板用法        ← Colors 表(Role 列) + Do/Don't 颜色条
- 角色→站里哪个色;用量规则(如"peach 一页最多一次,当点缀不当背景")

## 排版规则          ← Tokens—Typography + Do/Don't 字体条
- 字体搭配(display/body)、字重策略、字距;禁忌(如"Signifier 永远 400,不许加粗")

## 形状 / 阴影个性    ← Spacing & Shapes(Radius/Shadows) + Do/Don't
- 圆角个性(按钮药丸/卡片24)、阴影克制度(如"内容卡片不许加阴影,只有浮层有")

## 组件规格          ← Components 段(逐组件像素规格)
- 每个组件:背景/边框/圆角/内距/字号,verbatim 抄 DESIGN.md

## 布局与留白        ← Layout
- 栅格、max-width、区块间距节奏、导航形态

## 意象 / 配图        ← Imagery
- 用什么图、禁什么(如"产品截图浮块,无摄影无插画")

## Do / Don't        ← Do's and Don'ts(原样搬,最硬的约束)

## 示例 Prompt(可选) ← Example Component Prompts(给 AI 直接参考)
```

#### 9.5.3 示例：Steep 的 `rules.md`

> 对照 `sites/steep/source/DESIGN.md` 抽取，仅摘关键条（组件规格/Prompt 从略）：

```markdown
# Steep — 风格规则

## 一句话风格
> serif analytics on warm paper——编辑感、近单色(97% achromatic)、桃色点缀;
> 杂志式排版、超大衬线标题、大量留白、24px 软边大卡片、扁平药丸控件。

## 调色板用法
- accent(桃 #fbe1d1):编辑强调卡,**一页最多一次**,当稀有点缀不当背景;须坐在白/浅灰面上。
- text-on-accent(sienna #5d2a1a):只用在桃色面(字/描边/图表线),**绝不**当白底正文。
- 除桃/棕外**不引入任何彩色**(蓝/绿/紫都破坏编辑克制)。

## 排版规则
- 标题 Signifier 衬线,44/64/90px,**永远 weight 400**,不许 500/600(加粗即破功)。
- 正文/UI Sohne,用半步字重 430/450/480 做层级,别跳到 700。
- 字距越大越紧(90px:-2.25px,64/44px 负字距)。

## 形状 / 阴影个性
- 圆角:按钮 9999(药丸)、内容卡 24;卡片不低于 16、按钮必 9999。
- 阴影:**内容卡不许加阴影**;只有浮动产品卡片有,且仅 ~10% 淡影。

## 组件规格
- 主按钮:黑填充 #17191c 药丸+白字,Sohne 16/400,无阴影;配同形幽灵按钮(透明底+#17191c 描边)。
- 文字链接:无底无框,末尾 `→` 携带链接语义,**静止态不加下划线**,hover 才加。
- 中性卡:#f2f2f3 底、24px、无阴影无边框。桃色卡:#fbe1d1 底、#5d2a1a 字、只放白底区、一页一次。

## 布局与留白
- 页宽 max 1200px 居中;区块 80px 纵向间距;导航透明顶栏(无底/无边/无阴影)。
- Hero:居中超大衬线标题+药丸按钮对,四周环绕浮动产品卡片(负边距重叠)。
- 区块在 白 / 浅灰(Card Mist) 间交替。

## 意象 / 配图
- 产品优先:真实 UI 碎片(表格/折线/雷达环/AI 输入框)当浮动截图;**无摄影、无插画、无抽象图形**。

## Do / Don't
- Do:Signifier 400 只用于标题;peach 一页一次;按钮 9999 / 卡片 24。
- Don't:引入蓝绿紫;Signifier 用 500/600;内容卡加阴影;链接静止态加下划线;桃色卡放非白底。
```

### 9.6 接入一个新站的流程

1. 从 Refero 拿到该站 bundle，丢进 `sites/<name>/source/`（主力 `DESIGN.md`）。
2. **AI 读 `DESIGN.md`，劈成两个产物**：
   - **`adapter.css`（值→契约）**：Quick Color Reference + Role 列做语义绑定；每行标 ①/②/③ 来源（见 9.4.2）；反馈色不设（走契约稳定层）。
   - **`rules.md`（规则）**：按 9.5.2 模板抽 Do/Don't + 组件规格 + Layout/Imagery + Example Prompts。
3. **人复核**：adapter 里多选一 / 缺 CTA / 标 `需确认` 的行；rules.md 是否照搬到位。
4. **上线**：渲染引 `contract.css` + 该站 `adapter.css`（组件零改动变脸）；AI 生成页面额外加载全局 `design-rules.md` + 该站 `rules.md`。

> **一句话**：换站 = 从该站 `DESIGN.md` 劈出 `adapter.css`（值）+ `rules.md`（规则）→ 人复核 →（渲染引 adapter、生成加载 rules）。契约不变，反馈色恒定。不必所有站都 steep 风。

### 9.7 何时升级到 `tokens.json` 生成方案

当前 (B) 方案**手写 adapter/rules 就够**，不必上 `tokens.json` + 生成器。仅当出现下列信号再升级：

- **同一部署内要运行时切风格**（站内深色开关 / 后台切多品牌）→ 需要所有主题共存一份 CSS 的 (A) 方案（primitives + 语义矩阵 + Style Dictionary 生成多作用域 CSS）。
- **站数量爆炸、手工维护变负担**，或要接 Figma Token Studio / Style Dictionary（它们吃 DTCG JSON，而 Refero 的 `tokens.json` 正是 DTCG，可直接进）。

在那之前，"角色契约 + 每站 adapter/rules"是成本最低且完全够用的做法。

### 9.8 产出与对接：adapter 之后去哪了

前面 9.1–9.6 讲的是"怎么劈出 `adapter.css` + `rules.md`"。本节回答**它们之后去哪**——因为一个常见误解是"adapter 要拷进 package"。**不。`adapter.css` / `rules.md` 全程是源，进 git、被读多次、从不手动拷贝。** 组件**对站零感知**：只写 `var(--stitch-*)`，永不 import 任何 adapter；主题永远靠"当前页面加载了一份 `:root` CSS"提供（谁加载是"页面"的事，不是"组件"的事）。

同一批源，被**三条构建**各读各的、各烤各的产物：

```
源（进 git，从不手动拷贝）
  packages/tokens/contract.css ──┐
  sites/<站>/adapter.css       ──┤  合并逻辑单一实现 mergeTokens(contract, adapter[activeSite])
  sites/<站>/rules.md            │  ← 包与 skill 两条构建【共用同一个 mergeTokens】
  stitch.config.json{activeSite}─┘
                    │
     ┌──────────────┼───────────────────────┐
     ▼              ▼                        ▼
  Vite 虚拟模块   build:skill              demo (dev)
  virtual:        → references/theme/       扫 sites/*/adapter.css（动态）
   stitch-theme      tokens.css             每份 :root→[data-site=x]（demo 侧转）
     │               + design-rules.md      多站切换器
     ▼               + rules.md               │
  dist/style.css       │                      ▼
 【运行时·终端app用】  skill【编写时·AI 用】  本地多站预览
```

| 消费方 | 构建 | 产物 | 谁读产物 | 何时 | 取哪些站 |
|---|---|---|---|---|---|
| **npm 包** | `vite build`（虚拟模块插件） | `dist/style.css`（= `@octohirono/stitch-design-system/style`） | React 组件（`var()` 求值） | **运行时** | 仅 `activeSite` 一份 |
| **skill** | `build:skill` | `references/theme/tokens.css` + `design-rules.md` + `rules.md` | AI 生成页面 | **编写时** | 仅 `activeSite` 一份 |
| **demo** | dev（`import.meta.glob`） | 本地预览（不落盘产物） | 维护者肉眼 | **dev** | **全部**（有 adapter 的站） |

**开关**：`stitch.config.json { "activeSite": "steep" }` 是"当前生效哪个站"的唯一真相，前两条构建都读它——翻一个字段，`style.css` 与 skill 两份产物一起重烤。demo 不受此开关限制（动态扫 `sites/*/adapter.css` 全挂，源保持纯 `:root`、作用域化只在 demo 侧做）。合并语义（adapter 覆盖 contract、派生自动跟随）由 `mergeTokens` 一份实现，包与 skill 共用。详见 [ADR 0007](../adr/0007-active-site-single-switch.md)、[打包发布](../contributing/packaging.md)、[skill 构建流程](../contributing/skill-build-pipeline.md)。

> **一句话**：`multi-site-theming` 的产出就是 `adapter.css`（值）+ `rules.md`（规则）两份**源**；它们不搬家，由三条构建按 `activeSite` 各烤各的——运行时那份是 `dist/style.css`，skill 那份是 `tokens.css`，demo 那份不落盘。
