# stitch-design-system

一套 React + TypeScript 组件库 + AI 消费规范。同一套组件绑定一套角色契约，构建时切换成不同网站的风格。本文件是词汇表（glossary），只收本项目特有的领域词，不含实现细节。

## Language

### 换肤架构

**角色契约（contract）**：
一套固定的、按角色命名的 CSS 变量（`--stitch-accent`、`--stitch-bg-canvas` …），组件只读它。是公开 API，改名即破坏性变更。比喻为**插座**。
_Avoid_: 主题变量、design token（太泛）、primitives

**适配（adapter）**：
每个站一份的静态 `:root`，把该站的值填进角色契约的变量名上。换站 = 换 adapter，契约与组件不动。比喻为**转接头**；站自己按长相命名的原始 token 是**插头**。
_Avoid_: theme file、主题覆盖

**长相变量**：
某个站 bundle 里按外观命名的原始变量（如 `blush-peach`）。**永不进应用**——组件只读角色变量，adapter 负责把长相变量的值搬到角色变量上。
_Avoid_: 品牌变量、原始 token

**构建时切（B 方案）**：
本项目采用的换肤方式：一个网站一套风格、各自独立部署，每次构建只烤进一套主题。区别于**运行时切（A 方案）**（同一部署内用户点开关切换，需所有主题共存一份 CSS）。
_Avoid_: 多主题（不区分 A/B 时会混淆）

**值来源标记**：
契约里每个字段标注的三类来源：`【每站】`（adapter 从该站填）、`【恒定】`（跨站不变的功能项）、`【派生】`（用 `color-mix()`/`var()` 从别的 token 活算、自动跟随基值，adapter 不写）。

### 主题输入

**DESIGN.md**：
一个站的风格来源文件（Refero 产物、结构固定），是该站 bundle 的超集。adapter.css 的值、rules.md 的规则都从它抽。存档在 `sites/<站>/source/`。
_Avoid_: 设计稿、spec

**design-rules.md**：
全局规则文档，与皮肤无关的工程纪律（用角色 token、图标来源、缓动、对比度、配色比例）。跨站恒定。区别于每站的 **rules.md**（该站的 Do/Don't + 长相 + 组件规格）。
_Avoid_: 设计规范（太泛，两份都叫这个会混）

**tokens.css**：
skill 里嵌入的、由 contract.css + 当前 adapter.css 合并出的完整 `:root`。是 skill 给 AI 的**主题快照**（编写时用）。运行时渲染契约是包产物 **style.css**（见其条目），非本文件。
_Avoid_: tokens.json（本项目不以 JSON 为源）；"唯一运行时契约"（那是 style.css）

**style.css（包产物）**：
`dist/style.css`，`vite build` 把 contract.css + 当前 adapter.css + 各组件编译样式烤成的一份 CSS。是 `@octohirono/stitch-design-system/style` 导出、终端 app 运行时加载的样式表——**运行时渲染契约**。随 activeSite 变。区别于 skill 的 **tokens.css**（同源、给 AI）。
_Avoid_: 把它和 adapter.css 混谈（adapter 是源，style.css 是产物）

**activeSite（当前主题开关）**：
仓库根 `stitch.config.json` 的字段，"当前生效哪个站"的唯一真相。`vite build`（出 style.css）与 `build:skill`（出 tokens.css）都读它；两条构建共用同一个 `mergeTokens` 合并逻辑。demo 站不受此开关限制（全站都挂）。见 [ADR 0007](./docs/adr/0007-active-site-single-switch.md)。
_Avoid_: 每条构建各设一个开关

### AI 消费

**skill**：
`skills/stitch-design-system/` —— 全系统**唯一**的 skill，嵌入当前生效的那一套主题。换主题 = 重跑 build，skill 结构不变。不存在 per-site skill。
_Avoid_: per-site skill、多个 skill

**组件族（family）**：
把主要功能相近的组件归到同一个 `references/components/<族>.md` 的分组（general / layout / form-controls / overlays / navigation / feedback / data-display …）。既是 AI 的目录分类，也是文件切分单位。判族只看主要功能，不看长相或实现。
_Avoid_: 分类、category（英文文件名用 family）

**catalog 槽**：
SKILL.md / README 里用 HTML 注释圈出的、由 `build:refs` 自动注入"族 → 成员"表的区间。族信息的单一真相是 `component-families.md`。

**Demo 站（可导航平台）**：
`demo/` —— 本地开发预览平台：侧栏按族分组、顶栏切站、内容区渲染当前组件（hash 路由 `#/<X>`）。外壳（侧栏/顶栏/内容）与组件一律只读角色变量，切站**整站换肤**（方案 B）。侧栏 = **族表 ∩ `demo/components/*`** 自动派生（空族不显示；丢一个 `demo/components/<X>/` 即自动上架）。**全站都挂**、引源不引产物、不受 `activeSite` 限制。见 [demo 站文档](./docs/contributing/demo-site.md)。
_Avoid_: 最小渲染台（旧范围，已升级）；把切换器当运行时换肤（那是不做的 A 方案）
