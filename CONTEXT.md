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

**页面尺度层（layout-scale）**：
与**角色契约**并列、仍用 `--stitch-*` 前缀的第二层 token，承载**组件之外、页面/布局**才需要的尺度：layout 四键（`--stitch-page-max-width`/`--stitch-section-gap`/`--stitch-card-padding`/`--stitch-element-gap`）、全间距尺度（`--stitch-space-<n>`）、全字阶梯（`--stitch-text-<角色>`/`--stitch-leading-<角色>`/`--stitch-tracking-<角色>`）。**与 adapter 的关系 = 同级、成对的两份「值文件」**：`layout.css` 与 `adapter.css` 平级，永远成对——凡有 `adapter.css` 的站，`build:layout` 就为它生成成对的 `layout.css`（故「可发布站」判据是**四件套** `{adapter.css, layout.css, rules.md, skill-blurb.md}` 齐全）。**与 adapter 的本质区别 = 生成、非手写**：每站 `sites/<站>/layout.css` 由 `build:layout` 从该站 `source/variables.css` 确定性映射产出（标 `DO NOT EDIT`），因这些值在 Refero 输出里已跨站同构、几乎零判断。统一的是**命名/角色词表**（稳定公开清单），不是「每槽必有值」——某站缺的档位就不提供，不发明默认。经三输入 `mergeTokens(contract, layer, adapter)` 折进同一份 `:root`，故组件角色契约与本层对消费方是**一套 `--stitch-*`**；契约里 `--stitch-spacing-xs..xl` 退化为 `var(--stitch-space-N, 旧值)` 别名（组件内部接口，写页面不用管）。见 [ADR 0012](./docs/adr/0012-page-scale-layer.md)。
_Avoid_: 把它和**角色契约**混为一谈（契约=组件验证层·手写 adapter；本层=页面尺度·生成）；用 `layout.css` 指预置文件（预置里它折入 `tokens.css`，不单独成文件）

### 主题输入

**DESIGN.md**：
一个站的风格来源文件（Refero 产物、结构固定），是该站 bundle 的超集。adapter.css 的值、rules.md 的规则都从它抽。存档在 `sites/<站>/source/`。**只覆盖值槽**——合成层它系统性漏/写反，由 **composition.md** 补。
_Avoid_: 设计稿、spec；把它当合成层的真相（合成层看 composition.md）

**composition.md**：
一个站长相的**第二个来源**——**合成层**补充，`sites/<站>/composition.md`（顶层，**不**在 `source/`，因它非下载、是我们产出）。按 [涌现层验收协议](./docs/contributing/emergent-layer-acceptance.md) 用 [emergent-probe](./scripts/emergent-probe.js) 对真站实测产出，记 DESIGN.md 漏掉的氛围铺底 / 明暗幕 / 辉光 / 图像材质 / 字形设备 / 拒绝清单（存档不改，合成层冲突时以本文件为准）。**混合体例源**（一个文件两种受众）：**正文**正向散文随 skill 发给消费方（正向陈述更正后的正确事实、零 `DESIGN.md`、不回指孪生 `adapter.css`/`variables.css`），**DESIGN.md 追溯/勘误/`:行号` diff/归宿**只落可剥维护者位置（`<!-- trace -->` 表 + `←` 尾注）+ 执行报告 / issue / commit。`build:skill` 迁移时 `stripTrace` 剥掉可剥位置 → preset consumer-clean（放错正文即 build 红）。编写体例（正文指向哪些同预置姊妹）见 [onboard-composition.md](./docs/contributing/onboard-composition.md)。**核合成层每站必跑**（漏是静默的，不核不知 DESIGN.md 忠不忠实），**产物按需**——该站有未记合成层才有本文件（忠实站如 seline 无此文件），文件不进「可发布四件套」闸门。
_Avoid_: 改 DESIGN.md 存档来补合成层；把它塞进 `source/`（污染 Refero 存档不变量）；叫它「涌现层.md」（术语统一为合成层）

**design-rules.md**：
全局规则文档，与皮肤无关的工程纪律（用角色 token、图标来源、缓动、对比度、配色比例）。跨站恒定。区别于每站的 **rules.md**（该站的 Do/Don't + 长相 + 组件规格）。
_Avoid_: 设计规范（太泛，两份都叫这个会混）

**tokens.css**：
skill 里嵌入的、由 contract.css + 某站 adapter.css 合并出的完整 `:root`。是 skill 给 AI 的**主题快照**（编写时用）。每套**主题预置**各一份，落在 `references/theme-presets/<站>/tokens.css`。运行时渲染契约是包产物 **style.css**（见其条目），非本文件。
_Avoid_: tokens.json（本项目不以 JSON 为源）；"唯一运行时契约"（那是 style.css）

**主题预置（preset）**：
skill 里 `references/theme-presets/<站>/` 下的一套主题产物 = `{tokens.css, rules.md, style.md}`（该站的角色变量值 / 长相规则 / 招牌风格散文两段）。`build:skill` 为**每个可发布站**（见 **activeSite** / [listPublishableSites](./scripts/lib/publishable-sites.mjs)）各备一套，全备但任一时刻只有一套被读时解析选中。区别于全局、单份、跨主题不变的 `references/theme/design-rules.md`（不进预置）。见 [ADR 0010](./docs/adr/0010-consume-time-theme-choice.md)。
_Avoid_: 主题快照（那是单份 tokens.css 的旧说法）；把 design-rules.md 也叫预置（它是全局件）

**style.css（包产物）**：
`dist/style.css`，`vite build` 把 contract.css + 当前 adapter.css + 各组件编译样式烤成的一份 CSS。是 `@octohirono/stitch-design-system/style` 导出、终端 app 运行时加载的样式表——**运行时渲染契约**。随 activeSite 变。区别于 skill 的 **tokens.css**（同源、给 AI）。
_Avoid_: 把它和 adapter.css 混谈（adapter 是源，style.css 是产物）

**activeSite（当前主题开关 / 消费侧指针）**：
`activeSite` 是个**两层指针，落在两个不同文件**（不同角色，别混）：
- **本仓库根 `stitch.config.json`** 的 `activeSite` = **发布默认**——"当前生效哪个站"的唯一真相，是**开发本设计系统时的构建配置**，`vite build`（出 style.css）与 `build:skill`（定发布默认、注入 SKILL.md `SLOT:default-site`）都读它，两条构建共用同一个 `mergeTokens`。demo 站不受此开关限制（全站都挂）。
- **消费项目 `.agent/stitch.theme.json`** 的 `activeSite` = **消费侧指针**——装了插件的使用方选主题的指针（reset-theme 写、`.agent/` 是通用 agent 目录也是插件安装所在），skill 被读时解析（[resolve-preset.mjs](./scripts/lib/resolve-preset.mjs)）选中对应**主题预置**；无文件 / 无该键 → 回落发布默认（= npm 默认皮）。**刻意区别于本仓库的 `stitch.config.json`**：不同名、不同位、不同角色。对齐的是 `activeSite` 的**值（站名）**——与预览侧 `data-site`（[ADR 0009](./docs/adr/0009-themes-preview-export.md)）填同一站名即整体对齐。

见 [ADR 0007](./docs/adr/0007-active-site-single-switch.md)（发布默认）+ [ADR 0010](./docs/adr/0010-consume-time-theme-choice.md)（消费侧指针 + 读时解析）。
_Avoid_: 每条构建各设一个开关；把两层指针当成一处（本仓库定默认、消费项目可覆盖）

### 长相的两层（捕获 / 验收用）

**值槽（token slot）**：
可用**单个** `--stitch-*` 值表达的长相（色 / 字阶 / 圆角 / 阴影 / 间距）。Refero 抽取的强项，直接进**角色契约** / **页面尺度层**。
_Avoid_: 原子 token（太泛）

**合成层（composition trait）**：
需要「**组合**」才成立、单个变量换肤跟不了的长相：多图层 / 定位 / 滤镜 / 混合 / 或**刻意拒绝**（氛围铺底、明暗幕、辉光、图像材质处理、字形设备、拒绝清单…）。是「亮眼」的主要来源，也是 Refero 抽取**系统性漏或写反**的地方。**归宿分流**：能单值表达的进契约新槽；编排/构图的进每站 `rules.md`；内容资产（截图/插画）不 tokenable。
_Avoid_: 涌现层（早期造词，指同物；统一叫「合成层」）；把它当成一张固定「N 轴清单」（清单不通用——见下判据）

**单槽判据**：
区分上两者的测试——「**能不能塞进一个 `--stitch-*` 单槽？能 → 值槽；不能（要位置 / 图层 / 多值 / 否定）→ 合成层**」。合成层的**捕获与验收**不靠枚举轴，靠扫**封闭的 CSS 绘制基底**（`scripts/emergent-probe.js` 探针）——通用性来自「浏览器能画的东西有限」，不来自轴表完整。流程见 [涌现层验收协议](./docs/contributing/emergent-layer-acceptance.md)。
_Avoid_: 用固定轴清单当 schema（第 N 个站的新花样会漏）

### AI 消费

**skill**：
`skills/stitch-design-system/` —— 全系统**唯一**的 skill，任一时刻只呈现一套主题。预置全备（每个可发布站一套**主题预置**），「哪套」由消费项目 `activeSite` 指针读时解析、无则回落发布默认。换主题 = 改消费项目指针（skill 本身不重发布），结构不变。不存在 per-site skill。见 [ADR 0005](./docs/adr/0005-single-skill.md) + [ADR 0010](./docs/adr/0010-consume-time-theme-choice.md)。
_Avoid_: per-site skill、多个 skill；"嵌入发布时烤死的单套"（0010 起改消费时解析）

**组件族（family）**：
把主要功能相近的组件归到同一个 `references/components/<族>.md` 的分组（general / layout / form-controls / overlays / navigation / feedback / data-display …）。既是 AI 的目录分类，也是文件切分单位。判族只看主要功能，不看长相或实现。
_Avoid_: 分类、category（英文文件名用 family）

**catalog 槽**：
SKILL.md / README 里用 HTML 注释圈出的、由 `build:refs` 自动注入"族 → 成员"表的区间。族信息的单一真相是 `component-families.md`。

**Demo 站（可导航平台）**：
`demo/` —— 本地开发预览平台：侧栏按**二级大类**分组（`COMPONENTS` / `LAYOUT`）、顶栏切站、内容区渲染当前条目（hash 路由 `#/<X>`）。外壳（侧栏/顶栏/内容）与组件一律只读角色变量，切站**整站换肤**（方案 B）。`COMPONENTS` 大类 = **族表 ∩ `demo/components/*`** 自动派生（空族不显示；丢一个 `demo/components/<X>/` 即自动上架）；`LAYOUT` 大类 = **`demo/layouts/*` 直接列**（独立发现支路，不经族表，见 **版式样例**）。**全站都挂**、引源不引产物、不受 `activeSite` 限制。见 [demo 站文档](./docs/contributing/demo-site.md)。
_Avoid_: 最小渲染台（旧范围，已升级）；把切换器当运行时换肤（那是不做的 A 方案）；把 `LAYOUT` 大类混进族表（版式样例不是组件、不属于任何族）

**版式样例（layout showcase）**：
demo `LAYOUT` 大类下的一条条目：把**真组件**（从 `@octohirono/stitch-design-system` import，非手写重写）组合成一个**整页**，压满**页面尺度层**四键 + 整条字阶，跨主题切站看**综合换肤效果**。区别于展示**孤立组件**的组件页——版式样例看的是「一整个网站页面在各主题下长什么样」。落 `demo/layouts/<slug>/index.tsx`（`default` 示例 + 具名 `meta`，与组件页对称），走 **full-bleed**（内容区不套 `.page` 框、不注入标题、贴边全宽，样例自己收 `page-max-width` 居中）。**demo-only**：不进 `build:refs`/skill、不碰族表、不新增结构 Hook；验收走独立文档 [layout-showcase-acceptance.md](./docs/contributing/layout-showcase-acceptance.md)。首个样例 = **落地页（landing）**。连接件（hero 外壳 / section 网格）可手写但**只读 `var(--stitch-*)`**。
_Avoid_: 把它当组件页（那是孤立组件 + `.page` 框）；塞进 `demo/components/` 或族表；连接件里硬编码主题值
