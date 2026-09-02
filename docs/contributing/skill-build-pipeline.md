# skill 构建流程（产出唯一的 skill）

> stitch 唯一 skill 的生成流程：三个命令、槽注入、tokens 合并、组件族。换主题重跑，结构不变。

本文描述 stitch 唯一 skill 的生成流程（build:skill / build:refs / build:blurb）。规范细节引用 stitch 内相应文档，不重复。

**前提（别再搞错）**：我们**只有一个 skill**。`sites/*` 是主题库（管理多套候选），同一时刻只有**当前生效那套**被嵌进 skill。换主题 = 重跑 `build:skill`，skill 结构不变。**不存在 per-site skill。**

**核心原则**：主题相关的**值**只存在于嵌入的 `references/theme/` 里；散文文件（SKILL.md / react-project.md / standalone-html.md）一律**引用**它，绝不内联主题值——这既保证自包含（零目录外引用），也保证换主题时散文不用改。

---

## 一、目录结构

```
skills/stitch-design-system/
├── SKILL.md                 【模板 + 生成槽】主入口，AI 读的第一份
├── README.md                【固定】给人的安装说明
└── references/
    ├── react-project.md     【固定】场景 A：装 npm 包
    ├── standalone-html.md   【固定】场景 B：无构建单文件、手搓组件
    ├── components/           【生成 · 随组件源码】逐族 props 参考，主题无关（只生成源码中已有组件的族；
    │   ├── general.md          navigation 等源码尚无对应组件的族不生成文件、也不进 catalog）
    │   ├── layout.md
    │   ├── form-controls.md
    │   ├── overlays.md
    │   ├── feedback.md
    │   ├── data-display.md
    │   ├── Form.md
    │   └── Notification.md
    └── theme/               【生成 · 随主题】当前生效主题的嵌入快照，全部相对引用
        ├── tokens.css        contract.css + 当前 adapter.css 合并出的完整 :root{--stitch-*}
        ├── design-rules.md   全局规则（拷自 docs/design-system/design-rules.md，见 [design-rules.md](../design-system/design-rules.md)）
        └── rules.md          当前主题 Do/Don't + 长相（拷自 sites/<当前>/rules.md，见 sites/<站>/rules.md 与 [多站换肤架构](../design-system/multi-site-theming.md)）
```

**三类文件**：
- **固定**：一次性写好、主题中立（无源主题残留），换主题不动（README、react-project、standalone-html、SKILL.md 骨架）。
- **生成 · 随组件**：`references/components/*.md`，从组件源码抽 props，只在组件变更时重跑。
- **生成 · 随主题**：`references/theme/*`，`build:skill` 每次换主题重生成。

**没有** `SKILL.zh-CN.md`（全中文，无 i18n）。**没有**任何 GitHub raw/blob 外链、无 `../` 出 skill 的引用。

---

## 二、关键规则

几条贯穿全文的硬约束，在这里集中声明：SKILL.md 与散文文件**引用** `references/theme/tokens.css`（嵌入，不外链、不 fetch）；standalone 指向 `references/theme/rules.md` + `references/components/`，不内联主题值（字体 / 阴影 / 字重 / clip-path）；角色变量一律 `--stitch-*` 前缀；hard rules 拆两层——**跨主题通用规则** → `references/theme/design-rules.md`，**当前主题长相** → `references/theme/rules.md`；无 `SKILL.zh-CN.md`、无任何 GitHub 外链。

---

## 三、固定模板（一次性写，主题中立）

四份文件建模板时就清干净，**主题中立、无任何源主题残留**：不出现外来包名、不用 `--<其它>-*` 前缀、不带借来的品牌 / 风格词（配色、字体、圆角、阴影等长相描述）、不引用借来的组件示例。

**语言策略**：给 **AI** 的（SKILL.md / react-project.md / standalone-html.md / `references/`）写**英文**（标识符本就英文、AI 无所谓语言）；给**人**的 **README 写中文**。标识符（包名 / 文件名 / `--stitch-*` / props / 组件名）一律保留原文。每个文件只写一份、按读者的语言，**不做中英翻译对**（不要 `SKILL.zh-CN.md` 镜像）。

> 全程以 **steep 站点**为例。包名用工作名 `stitch-design-system`（未定则回头一处改）。steep 的值取自 `sites/steep/`（源 `sites/steep/source/DESIGN.md`），角色名取自 [contract.css](../../packages/tokens/contract.css)（见 [多站换肤架构](../design-system/multi-site-theming.md)）。

### 3.1 `SKILL.md`（骨架固定 + 生成槽）

**先看它长什么样**（steep 填好后的完整 SKILL.md；`【槽①】`/`【槽②】`是 `build:skill` 填的，其余固定）：

~~~markdown
---
name: stitch-design-system
description: >
    【槽①：当前主题风格词】Build React UIs in the Steep style — editorial serif
    analytics on warm paper: near-monochrome white canvas, a single peach accent,
    oversized Signifier serif headlines, generous whitespace, large 24px soft cards,
    flat pill controls, barely-there shadows.
    Use when (1) building pages/components with the stitch-design-system npm package
    in a React project; (2) generating a standalone single-file HTML page in this
    style with no build step; (3) the user asks for this brand's look.
---

# stitch-design-system style

stitch-design-system is a React + TypeScript component library. Components and any
custom UI use role variables `var(--stitch-*)`; their values live in
`references/theme/tokens.css`. This skill is self-contained: every value it needs is
embedded under `references/` — never fetch anything, never guess a value.

## The style in one paragraph

【槽②：当前主题风格总述】Steep presents analytics as an editorial magazine spread —
serif Signifier headlines (400 weight, up to 90px) float over a near-monochrome white
canvas; a single warm peach (`--stitch-bg-accent`) is the only chromatic surface and
appears at most once per page. Cards are large-radius (24px), flat, shadowless; only
floating product artifacts carry a barely-there shadow. Controls are flat pills. The
page breathes — 80px section gaps, content never crowds the edges.

## Pick your scenario first

| Scenario | Entry |
| --- | --- |
| React project — `@octohirono/stitch-design-system` is (or can be) installed | [references/react-project.md](references/react-project.md) |
| Single self-contained HTML file — no npm, React via CDN | [references/standalone-html.md](references/standalone-html.md) |

## Design tokens

Components and any custom UI use role variables `var(--stitch-*)` — never raw hex.
The complete, paste-ready `:root` with this theme's exact values is
[references/theme/tokens.css](references/theme/tokens.css). Groups: backgrounds
(`--stitch-bg-*`), text (`--stitch-text-*`), accent/link (`--stitch-accent*`,
`--stitch-link`), borders, radii (`--stitch-radius-*`), shadows, fonts
(`--stitch-font-*`), spacing, motion, control heights, feedback colors
(`danger/success/warning/info`), category slots (`--stitch-cat-1…6`). Exact values
are not restated here — read `tokens.css`.

## Component catalog

Props references under `references/components/` (props, legal values, defaults —
generated verbatim from source):

<!-- SLOT:catalog (build:refs generates from component-families.md — do not hand-edit) -->
| Category | Components | Reference |
| --- | --- | --- |
| General | Button, Icon, Image, Toggle, ToggleGroup | [general.md](references/components/general.md) |
| Layout | Card, Divider, Collapse, Tabs, Accordion, AspectRatio, ScrollArea | [layout.md](references/components/layout.md) |
| Form controls | Input, Switch, Checkbox, Radio, Select, Slider, Label, OtpField, PasswordInput | [form-controls.md](references/components/form-controls.md) |
| Form container | Form (+ FormItem, useForm) | [Form.md](references/components/Form.md) |
| Overlays | Modal, Drawer, Tooltip, Popover, HoverCard, AlertDialog | [overlays.md](references/components/overlays.md) |
| Navigation | DropdownMenu, ContextMenu, Menubar, NavigationMenu, Toolbar | [navigation.md](references/components/navigation.md) |
| Feedback | Loading, Progress, Skeleton | [feedback.md](references/components/feedback.md) |
| Data display | Table, CodeBlock, Tag, Avatar | [data-display.md](references/components/data-display.md) |
| Notification | Notification (imperative API) | [Notification.md](references/components/Notification.md) |
<!-- /SLOT:catalog -->

> 上表是**示意全貌**（7 族 + Form + Notification）。实际 catalog 只列 `<族>.md` 已落盘的族——源码尚无对应组件的族（如 navigation）不出行、不出链，待源码补齐该族组件后 `build:refs` 自动补上（见 §6.1 `builtFamilyRows`）。

## Hard rules (violations are bugs)

- **Global rules** (no-hardcode, icons, motion, accessibility, color proportion): [references/theme/design-rules.md](references/theme/design-rules.md)
- **This style's look rules** (Do/Don't, shapes, colors, when to use the accent):
  [references/theme/rules.md](references/theme/rules.md)

Both apply. Never invent props (component references are ground truth). Import the
stylesheet once at app entry. Icons come from `<Icon name="…" />` — never emoji /
Unicode / hand-rolled SVG. Prefer library components over raw HTML controls.
~~~

**两个生成槽的填法**（`build:skill` 从 `sites/steep/source/DESIGN.md` 抽）：
- **槽①** `description` 风格词 ← DESIGN.md 首段的一句话副标题 + 关键视觉词（颜色克制、字体、圆角、阴影强度）。压到 2–3 行，供 AI 触发匹配。
- **槽②** 风格总述段 ← DESIGN.md 的 style 段落，压成一段"视觉哲学"，让 AI 建立心智模型。**不写 hex；只留几个定义长相的招牌尺寸**（hero 字号、卡片圆角、区块间距），完整值在 tokens.css。

**固定的部分**（换主题一字不改）：scenario 表、Design tokens 段的说明文字、组件目录、Hard rules 的两个指针 + 通用铁律。

### 3.2 `references/react-project.md`（全固定，主题无关）

角色名 `--stitch-*` 与组件 API 跨主题稳定，换 steep→别的主题**一字不改**。照抄下面这份：

~~~markdown
# React project usage

Scenario: a React project where `@octohirono/stitch-design-system` is (or can be) installed.
For a no-build single HTML file, use [standalone-html.md](standalone-html.md).

## Setup (once per project)

```bash
npm install @octohirono/stitch-design-system
```

```ts
// app entry (main.tsx / App.tsx)
import '@octohirono/stitch-design-system/style'; // MUST import before any component renders
```

Peers: `react` / `react-dom` >= 18. The library's runtime dependencies — `radix-ui`
and `clsx` — install with the package; you don't add them yourself (they are not peers).
The build ships per-component modules (`preserveModules`) — import from the package root
only, and tree-shaking drops the rest.

Importing the stylesheet defines the `var(--stitch-*)` role variables that components
resolve at runtime — no extra setup.

## Explore the real API before writing code

The installed package ships complete TypeScript declarations — the ground truth for
props, legal values, and defaults; prefer them over any document.

- Resolve the package's type entry from its `package.json` (`types` / `exports`), then
  read the exported component and prop types.
- The [components/](components/) files mirror the same API (convenient), but the
  declarations win on any conflict.

## Minimal boilerplate

```tsx
import { Button, Card, Input, Table } from '@octohirono/stitch-design-system';

export default function App() {
    return (
        <main style={{ maxWidth: 1200, margin: '0 auto', padding: 32 }}>
            <Card>
                <Input placeholder="Ask anything…" />
                <Button type="primary" style={{ marginTop: 16 }}>Post</Button>
            </Card>
        </main>
    );
}
```

## Styling app-specific UI around the components

- Use role tokens: `color: var(--stitch-text-primary)`,
  `background: var(--stitch-bg-card)`, `border-radius: var(--stitch-radius-card)` —
  so custom UI stays on-palette.
- Exact token values: [theme/tokens.css](theme/tokens.css).
- Do NOT hard-code hex/px; use the `--stitch-*` role variables only.

## Scenario-specific rules

- One `import '@octohirono/stitch-design-system/style'` at the entry — never per file.
- Import types from the package root.
- All hard rules from [SKILL.md](../SKILL.md) apply.
~~~

### 3.3 `references/standalone-html.md`（全固定，主题值靠引用不内联）

保留场景 B 的机制（单文件、CDN、手搓同名组件），但字体/阴影/字重/clip-path 等主题值**一律引用嵌入文件、不内联**——这样换主题它也不用改：

~~~markdown
# Standalone single-file HTML usage

Deliver one self-contained `index.html` the user saves and double-clicks — no npm, no
bundler, non-technical audience. The package ships **ESM only** (no UMD bundle to drop
in via a `<script>` tag), so you hand-roll the components inline while mirroring the real
library API. For a real React project, use [react-project.md](react-project.md) instead.

## Workflow

1. **Ask first.** If the page intent is unclear, reply with a short question plus 3–5
   concrete suggestions (blog, product grid, FAQ, login, dashboard). **Generate nothing yet.**
2. **Use the embedded specs — do NOT fetch anything:**
   - `:root` token block (paste-ready, complete): [theme/tokens.css](theme/tokens.css)
   - Global rules: [theme/design-rules.md](theme/design-rules.md)
   - This theme's look rules (fonts, shadow policy, shapes, accent usage):
     [theme/rules.md](theme/rules.md)
   - Per-component props: [components/](components/)
3. **Generate** one complete `index.html` in a single fenced code block, then list any
   spec line you intentionally relaxed and why.

## Output requirements

- Single `index.html`; React + Babel via CDN:

```html
<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
```

- Page code in one `<script type="text/babel" data-presets="react,typescript">` block;
  mount on `<div id="root"></div>` via `ReactDOM.createRoot(...).render(<App />)`.
- All CSS inline in one `<style>` in `<head>`: paste `theme/tokens.css` `:root` first,
  then component classes. **No CSS frameworks; Tailwind is forbidden.**
- Fonts: load exactly the families named in `theme/tokens.css` (`--stitch-font-*`) —
  do not hard-code a font here.
- Shadows / radii / typography weights / any shape (clip-path): take from
  `theme/tokens.css` + `theme/rules.md`; never write literal values in this file.
  Shadow application is the most-misapplied rule — follow `theme/rules.md` exactly.
- If the theme uses an SVG clip-path shape (see `theme/rules.md`), inject its `<defs>`
  once at the top of `<body>` so `clip-path: url(#…)` resolves.

## Hand-roll the library API, then compose with it

- Define inline React components named exactly like the exports (`Button`, `Card`,
  `Input`, `Modal`, `Table`, …) accepting the documented props — see [components/](components/).
  `Notification` is imperative (static methods).
- Compose the page **only** with these components. Raw HTML/JSX allowed only where no
  component fits, then styled with `var(--stitch-*)`, never raw colors.
- Forbidden as visible UI: native `<button>`, `<input>`, `<select>`, checkbox/radio.

## Scenario-specific rules

- Every value comes from the embedded specs — do not round or substitute "close" colors.
- All hard rules from [SKILL.md](../SKILL.md) + [theme/rules.md](theme/rules.md) apply.
~~~

### 3.4 `README.md`（固定骨架 + catalog 槽）

给**人**看的（不是 AI），**用中文写**（我们全中文，给人看的就写中文；文件名 / 包名 / `--stitch-*` 等标识符保留原文）：这是"**怎么装这个 skill**"的说明 + 目录布局 + 组件族清单 + license。精确值不外链任何仓库，改成**自包含**声明。`## 组件` 用 `<!-- SLOT:catalog -->` 槽，`build:refs` 注入**与 SKILL.md 同一份** catalog 片段——族变更时自动同步，不手维护。骨架：

~~~markdown
# stitch-design-system skill

一个可安装的 skill，教 AI 编码 agent（Claude Code、Codex、Cursor 等兼容 SKILL.md 的 agent）
按 **stitch-design-system** 的风格生成 UI —— 一套 React + TypeScript 组件库。

两个场景，各自入口在 `references/` 下：

- **React 项目** —— 用 `stitch-design-system` npm 包：装包、以包的 TS 声明为准探 API、
  常用写法、用 `--stitch-*` 角色 token 给自定义 UI 上色。
- **单文件 HTML** —— 一个自包含的 `index.html`（React 走 CDN + Babel），手搓组件、镜像真实 API。

## 安装

把 `stitch-design-system/` 整个目录拷进你 agent 的 skills 目录
（Claude Code：`~/.claude/skills/` 或 `<项目>/.claude/skills/`）。

## 目录

```
stitch-design-system/
├── SKILL.md                 # 入口：风格总述、tokens、场景路由、hard rules
├── README.md                # 本文件
└── references/
    ├── react-project.md     # 场景：装 npm 包的 React 项目
    ├── standalone-html.md   # 场景：单文件 HTML、无构建
    ├── components/          # 按族的 props 参考（从源码生成）
    └── theme/               # 嵌入的 tokens.css + design-rules.md + rules.md（当前主题）
```

**自包含**：skill 需要的每个值（tokens、规则、组件 props）都嵌在 `references/` 里，不联网 fetch。

## 组件

<!-- SLOT:catalog (build:refs 注入"族 → 成员"表 —— 与 SKILL.md 同一份) -->
<!-- /SLOT:catalog -->

## 许可

待定。
~~~

---

## 四、`build:skill` 生成逻辑（换主题重跑）

`scripts/build-skill.mjs`，挂 `npm run build:skill`。**要点：把"非确定的 LLM 摘要"和"确定的纯文件操作"分开**——摘要每站**一次性**生成并存进 `sites/<站>/`，build:skill 本身只做**确定的合并/拷贝/注入**。这样重跑幂等,"换主题后其余文件 diff 为空"才立得住。

### 4.0 前置：当前主题 + 槽标记

- **当前主题**：仓库根 `stitch.config.json` 一个字段 `{ "activeSite": "steep" }`；`build:skill` 读它，或 `npm run build:skill -- --site steep` 覆盖。
- **槽标记**：固定骨架里用 HTML 注释圈出槽，脚本正则替换**区间内**内容、不碰骨架：
  ```
  SKILL.md:
    <!-- SLOT:description -->…风格词…<!-- /SLOT:description -->          （build:blurb→build:skill）
    <!-- SLOT:style-paragraph -->…风格总述段…<!-- /SLOT:style-paragraph -->（build:blurb→build:skill）
    <!-- SLOT:catalog -->…族→成员表…<!-- /SLOT:catalog -->              （build:refs，主题无关）
  README.md:
    <!-- SLOT:catalog -->…同一份族→成员表…<!-- /SLOT:catalog -->        （build:refs）
  ```
- **产物落点**：`references/theme/*`、`references/components/*`、SKILL.md 的 3 个槽、README 的 catalog 槽。固定模板其余部分不碰。

### 4.1 `references/theme/tokens.css` ← contract + 当前 adapter

合并语义（adapter 同名覆盖 contract、派生值自动跟随）**已在 [多站换肤架构](../design-system/multi-site-theming.md) 讲清**，这里只说脚本怎么落地：

1. 用 **postcss** 解析 `packages/tokens/contract.css` 与 `sites/<站>/adapter.css` 两个 `:root`。
2. 建 `Map<自定义属性名, 值>`：先灌 contract，再用 adapter 覆盖同名项（`【每站】`槽被覆盖；`【恒定】`/`【派生】`保留 contract 的）。
3. 输出**单个 `:root{}`**（比两个 `:root` 拼接更适合粘贴）。**派生值保留 `color-mix()` 原样**——现代浏览器原生支持，standalone 也能跑；不引色彩引擎、不求值成静态 hex（除非要兼容老浏览器，那是可选项）。

steep 的产物长这样（节选，值取自 `sites/steep/adapter.css` 覆盖后）：

```css
/* references/theme/tokens.css — generated for site: steep. DO NOT EDIT. */
:root {
  /* backgrounds */
  --stitch-bg-canvas:   #ffffff;
  --stitch-bg-section:  #fafafb;
  --stitch-bg-card:     #f2f2f3;
  --stitch-bg-accent:   #fbe1d1;
  /* text */
  --stitch-text-primary:   #17191c;
  --stitch-text-secondary: #777b86;
  --stitch-text-muted:     #a3a6af;
  --stitch-text-on-accent: #5d2a1a;
  /* accent / link（派生保留 color-mix）*/
  --stitch-accent:        #17191c;
  --stitch-accent-hover:  color-mix(in srgb, var(--stitch-accent), black 12%);
  --stitch-accent-text:   #ffffff;
  --stitch-link:          #777b86;
  /* fonts / radii / shadow */
  --stitch-font-display:  'Signifier', serif;
  --stitch-font-body:     'Sohne', sans-serif;
  --stitch-radius-button: 9999px;
  --stitch-radius-card:   24px;
  --stitch-radius-input:  16px;
  /* …其余角色变量同 contract.css 契约… */
}
```

顶部写死一行"generated, DO NOT EDIT"，给验收 grep 用。

### 4.2 `references/theme/design-rules.md` + `rules.md` ← 拷贝

纯文件复制，无加工：
- `docs/design-system/design-rules.md` → `references/theme/design-rules.md`
- `sites/<站>/rules.md` → `references/theme/rules.md`

"拷贝"就是自包含的代价——skill 里是副本、`docs/`/`sites/` 是源，靠 build:skill 保持同步，不手动同步。

### 4.3 `references/components/*.md` ← 组件源码抽 props（主题无关）

主题无关,可拆成独立 `build:refs`、只在组件增改时跑。**组件无论是 radix 封装、手写、还是在既有件上扩展，抽法完全一样**——公开面都按 [组件源代码规范](./component-authoring.md) 归一成统一约定、落在 `src/components/<X>/` 目录（`<X>Props`，或命令式件的 `*Config` / `*Static`）；radix 的内部实现不影响抽取（只抽公开面）。**用 ts-morph 直接读源码**（自带 TS 类型检查器，不用先 `tsc` 出 `.d.ts`）：

1. **加载工程**：`new Project({ tsConfigFilePath: 'packages/react/tsconfig.json' })` —— ts-morph 拿到全部源文件 + 类型信息。
2. **抽公开面接口（全自动）**：对每个组件 `src/components/<X>/`，**扫整个目录的源文件**（不止 `<X>.tsx`——复合件 Form、命令式件 Notification 把接口拆进 `types.ts` / 兄弟文件），找导出的**公开面** interface，`.getText()` 取**原文**（verbatim，含 `// default …` 注释、每个 optional 支 / 联合支、`extends …`）。公开面 = `<X>Props`（普通件）+ 命令式件的 `*Config` / `*Static`（如 `NotificationConfig` / `NotificationStatic`）；`@internal` 标注的接口（如内部视图 `NotificationViewProps`）跳过。这就是 `general.md` 里那种 ts interface 代码块。**复合件**（Form / DropdownMenu / Menubar 等有子部件）导出多个接口 → 全抽。**命令式 API 无小灶**：同一条路，靠命名约定 + `@internal`，不为 Notification 特判。
3. **配 tsx 用例**：从该组件的 **demo 页**（`demo/components/<X>/`，§3.7 已有真实用法）挑 1–3 段代表性 JSX；没有就写一两个最小例子。
4. **（可选）Notes / Do NOT**：像"Select 仅受控"这种**跨-prop 短注**写成 **interface 级 JSDoc**——主接口头顶（普通件 `<X>Props`；命令式件写在 `*Config` / `*Static` 头顶，承载「非 JSX 组件、静态方法、调用不渲染」等真身说明）。脚本用 `props.mjs` 的 `getCommentText()` 抽出来渲染在 interface 块后；`text` 仍 verbatim（不含头顶 trivia），故 §5「props==源」逐字节不破。子部件 Props 不带 note。note 内容受边界约束（只写 stitch 语汇、迁移由来 / 主题值 / 他站对比不进）——见 [组件源代码规范 · Props Interface](./component-authoring.md)。
5. **按族写文件**：用下面的 **FAMILIES 表**（`component-families.md`）把上面拼成 `references/components/<族>.md`，格式：`## Name` 标题 → 一段 ts interface → 一段 tsx 用例 →（可选）Notes。
6. **一族一文件·不分片**：每族恰一个 `references/components/<族>.md`，含该族全部成员段。**不设物理行闸、不物理切片**——这些是按需读取的生成物（DO NOT EDIT），大文件只在 agent 真查那一族时才载入，几百行 props 参考代价可忽略；而物理分片会把 catalog 的「一族一链」拆坏（part-2 够不着）。族真大到该拆，是 FAMILIES 表该拆成两个**逻辑**族的信号（各有正经族名，见下方决策 prompt），而非切成 `<族>-2.md`。行/预算闸只管**常驻入口 SKILL.md**（`check:skill`）与手写文档，不管这里（见 [同步机制与 CI](./sync-and-ci.md)）。
7. **生成 catalog 片段**：从 FAMILIES 表生成"族 → 成员"表，注入 SKILL.md 与 README 的 `<!-- SLOT:catalog -->` 槽（见下「族/组件变更的同步」）。



**族的单一真相 = 一张 markdown 表**（族名 · 主要功能 fn · 成员），存成 `scripts/component-families.md`。`build:refs` **解析这张表**，派生三样（都不手维护）：① 组件→族归类；② 决策 prompt 的 `EXISTING FAMILIES`（族名 + fn 两列）；③ catalog（族 + 成员两列，注入 SKILL.md/README）。**加/删组件** = 改某行成员；**加新族** = 加一行（依据 = 下方决策 prompt 的结果）。整块就是那个文件，将来直接摘出去：

~~~markdown
# component families — 族的单一真相（族名 · 主要功能 · 成员）
<!-- build:refs 解析此表；成员列只放组件名（逗号分隔），别加别的字 -->

| 族名 | 主要功能 fn | 成员 |
|---|---|---|
| general | base atoms & actions | Button, Icon, Image, Toggle, ToggleGroup |
| layout | containers & structure | Card, Divider, Collapse, Tabs, Accordion, AspectRatio, ScrollArea |
| form-controls | value entry & selection | Input, Switch, Checkbox, Radio, Select, Slider, Label, OtpField, PasswordInput |
| overlays | transient floating layers | Modal, Drawer, Tooltip, Popover, HoverCard, AlertDialog |
| navigation | menus & nav bars | DropdownMenu, ContextMenu, Menubar, NavigationMenu, Toolbar |
| feedback | status & progress | Loading, Progress, Skeleton |
| data-display | presenting data | Table, CodeBlock, Tag, Avatar |
| Form | form container (has a hook) | Form |
| Notification | imperative (static-method) API | Notification |
~~~

> 组件名以最终源码为准（如 `OtpField` = radix `one-time-password-field`）；`fn` / 族归类可调。`Form` / `Notification` 是**单成员族**（各自独立文件）。

#### 族的定义与归类规则

**族 = 把功能相近的组件归到同一个 `references/components/<族>.md` 的分组**：既是给 AI 的目录分类，也是文件单位——**一族恒等一文件**（不物理分片）。

- **应该有哪些族 / 锚在哪**：族没有强制国际标准，但有可锚的权威——**组件名**对齐 [W3C ARIA APG](https://www.w3.org/WAI/ARIA/apg/)（a11y 权威，Radix 也遵循）；**族名**锚 **Ant Design** 的分类（我们 props 本就按 Ant v5 命名，见 [组件源代码规范](./component-authoring.md)，一致）。我们的 7 族 + 2 独立文件：`general` / `layout` / `form-controls` / `navigation` / `overlays` / `feedback` / `data-display`（+ Form 有 hook、Notification 命令式）——其中 5 个与 Ant 逐字一致；两处有意偏离：`form-controls`（Ant 叫 Data Entry，但这是 HTML 规范术语、更标准）、`overlays`（Ant 拆进 Feedback/Data Display，我们单开便于 AI 查）。
- **判一个组件进哪族**：只看**主要功能**（给用户干的主活），**不看长相、不看实现**（radix 做的还是手写的都一样）。录入值→`form-controls`；容器/结构→`layout`；临时浮层→`overlays`；菜单/导航→`navigation`；状态/进度→`feedback`；展示数据→`data-display`；基础动作→`general`。歧义按主导功能、一致性优先。
- **大小**：**下限没硬性**——真是独立功能类别，1 个成员也给一个文件（Form/Notification 就是单成员文件）；只是别为"其实属于某桶"的组件单开。**上限没有物理行闸**——族文件按需读取、想多大多大；但族大到臃肿（成员塞太多、AI 一次读进太多不相关件）时，那是**逻辑该拆成两个族**的信号（各起正经族名、走上面的决策 prompt），**绝不物理切成 `<族>-2.md`**（会把 catalog 的一族一链拆坏、让分片够不着）。

**新增组件时，先判"进现有族还是开新族"**（大多数组件的主活天然属于某个宽桶 = 归类、不是硬塞；真放不进的才开新文件）。用这个 prompt：

```
You are placing a new component into the design-system's reference families.

EXISTING FAMILIES (auto-filled from component-families.md — current value):
- general: base atoms / actions
- layout: containers / structure
- form-controls: value entry & selection
- overlays: transient floating layers
- navigation: menus & nav bars
- feedback: status / progress
- data-display: presenting data
- (standalone files: Form — has a hook; Notification — imperative API)

NEW COMPONENT: <Name> — <one line: the job it does for the user>

Decide by PRIMARY user-facing function (never by look or implementation):
1. Fits an existing family? Put it there — prefer this.
2. Fits NO existing bucket (its job matches none above)? Give it its OWN file — a single
   member is fine (Form and Notification are one-component files). Being able to name
   future members makes it a clearer case but is NOT required. Never force a genuine
   non-fit into a bucket where it distorts that bucket's meaning.
3. New family NAME — pick in this order: (a) a category name from Ant Design
   (General/Layout/Navigation/Data Entry/Data Display/Feedback) if one fits; (b) else a
   common category term from another mainstream system (Material/MUI, Carbon, Fluent).
   Lowercase kebab-case. NEVER a look-based name, a component name, or an implementation
   name (radix/…). Not sure it's a real category? Don't invent one — use the nearest
   existing family or a standalone file.

Output:
  family: <existing-name | NEW: new-name>
  reason: <one line tied to the primary function>
  if NEW: why no existing family fits (+ future members if you can name them)
```

#### 族/组件变更的同步（单一真相 → 自动传播）

`scripts/component-families.md`（FAMILIES 表）+ 组件源码 = **单一真相**。族变更（成员增减、或族本身增减）**只改这里**，`build:refs` 自动传播——**catalog 不手维护**：

| 依赖族信息处 | 谁生成 | 变更时 |
|---|---|---|
| `references/components/<族>.md` | `build:refs` | 自动重生成 |
| SKILL.md 的 `## Component catalog`（`<!-- SLOT:catalog -->` 槽） | `build:refs` 注入 | 自动 |
| README.md 的组件族清单（同一 catalog 片段） | `build:refs` 注入 | 自动 |

加 / 删组件或族 = 改 FAMILIES 表（+ 组件源码）→ 跑 `build:refs` → 三处一起更新，**零手 sync**。catalog 是"组件相关、主题无关"，所以归 `build:refs`（不是 build:skill）；换主题它 diff 为空。

**自动 vs 人工**：**props 接口 = 全自动**（ts-morph 抽，永远跟源码一致、漂移不了）；用例 = demo 拉或手写；Notes = 人工短注。`.d.ts` 仍是**消费者侧**的 ground truth（[组件源代码规范](./component-authoring.md)、react-project.md），但我们这边有源码，直接读源更简单且保留 `// default` 注释。

### 4.4 `SKILL.md` 2 个 blurb 槽 ← 主题 blurb 注入

**关键设计：blurb 每站生成一次、存盘，build:skill 只注入**——不在 build:skill 里现调 LLM，否则每次重跑输出漂移、破坏"diff 为空"。

**① 生成 blurb（`build:blurb <site>`，每站 / DESIGN.md 变更时跑一次；与 build:skill 分开）**

DESIGN.md 是 Refero 产物、**结构固定**，所以**输入抽取能脚本化，不用手挑**。`build:blurb` 三步：

**a. 自动抽三段**（markdown 结构解析，确定性）：
- **副标题** = H1 之后第一个 `>` 引用行（steep：`serif analytics on warm paper`）
- **style 段** = 副标题 / `**Theme:**` 行之后、第一个 `## ` 之前的正文段
- **Do's & Don'ts** = `## Do's and Don'ts` 整节（连同 `### Do` / `### Don't`）

**b. 填进固定 prompt 调 LLM**（可脚本化，但**非确定**——同输入重跑输出可能变，所以产物要缓存、**绝不进 build:skill**）：

```
You are writing two blurbs for an AI coding-skill, from a UI theme's style spec.
INPUT (bottom) = the theme's subtitle line, its style paragraph, and its do's & don'ts.

Output EXACTLY these two sections, nothing else:

## description
2–3 lines for the skill's frontmatter `description`. Form:
"Build React UIs in the <Name> style — <the concrete visual signals that let an AI
recognize and trigger this look>." Name: dominant palette feel, typography, radius/shape,
shadow intensity, spacing rhythm. No marketing adjectives.

## style-paragraph
One paragraph (~4–6 sentences) for the skill's "The style in one paragraph": a visual
mental model of how a page feels and composes — canvas/background, the accent and how
sparingly it is used, typography's role, card/shape treatment, shadow/elevation policy,
spacing and rhythm.

Value rule: NO hex. Keep only a few signature sizes that define the look (hero type size,
card radius, section rhythm); do NOT restate the token table — exact values live in
tokens.css. Be faithful to the spec, invent nothing. Write in English, concrete not
flowery. Describe this as THE style — never say it is one of several or can be switched.

Before output, verify each — fix any that fail:
[ ] description is 2–3 lines and uses the "Build … in the <Name> style — …" form
[ ] style-paragraph is ONE paragraph (~4–6 sentences), a visual mental model
[ ] NO hex anywhere; only a few signature sizes, never the full token table
[ ] no marketing adjectives, no flowery language
[ ] every claim traces to the INPUT — nothing invented or borrowed from another style
[ ] described as THE style — no mention of other themes, variants, or switching
[ ] output is EXACTLY the two ## sections — nothing before, between-labels, or after

INPUT:
<paste the three DESIGN.md sections here>
```

**c. 写出 `sites/<站>/skill-blurb.md` 草稿 → 人过一眼定稿**（唯一的人工步，质量闸；可选，不审也能跑）。steep 的产物，与 [3.1](#31-skillmd骨架固定--生成槽) 注入进 SKILL.md 的两段**逐字一致**：

```markdown
<!-- sites/steep/skill-blurb.md — generated once from source/DESIGN.md, human-approved.
     build:skill injects these two sections into SKILL.md's SLOT markers. -->

## description
Build React UIs in the Steep style — editorial serif analytics on warm paper:
near-monochrome white canvas, a single peach accent, oversized Signifier serif
headlines, generous whitespace, large 24px soft cards, flat pill controls, barely-there
shadows.

## style-paragraph
Steep presents analytics as an editorial magazine spread — serif Signifier headlines
(400 weight, up to 90px) float over a near-monochrome white canvas; a single warm peach
(`--stitch-bg-accent`) is the only chromatic surface and appears at most once per page.
Cards are large-radius (24px), flat, shadowless; only floating product artifacts carry a
barely-there shadow. Controls are flat pills. The page breathes — 80px section gaps,
content never crowds the edges.
```

**② build:skill 注入（确定、幂等）**

读 `sites/<站>/skill-blurb.md` 的两段（`## description` / `## style-paragraph`），正则替换 SKILL.md 的 `<!-- SLOT:description -->…<!-- /SLOT:description -->` 与 `<!-- SLOT:style-paragraph -->…<!-- /SLOT:style-paragraph -->` 区间。[3.1](#31-skillmd骨架固定--生成槽) 那份 steep SKILL.md 就是注入后的样子。

换主题：该站 `skill-blurb.md` 已存在 → build:skill 纯注入；没存 → 先跑 ①。

### 4.5 三个命令、编排与幂等

按"确定性"拆三个命令——**会漂移的（LLM）隔离出去、结果冻盘，`build:skill` 保持纯确定**：

| 命令 | 干什么（对应节） | 确定性 | 何时跑 |
|---|---|---|---|
| **`build:blurb <site>`** | 自动抽 DESIGN.md 三段 → LLM → 写 `sites/<site>/skill-blurb.md`（§4.4①） | ❌ 非确定（含 LLM） | 每站一次 / DESIGN.md 变更时 |
| **`build:refs`** | 组件源码 + FAMILIES 表 → `references/components/*.md` + 注入 catalog 片段到 SKILL.md/README 的 `<!-- SLOT:catalog -->`（§4.3） | ✅ 确定 | 组件 / 族增改时（主题无关） |
| **`build:skill <site>`** | tokens.css（§4.1）+ 拷 design-rules/rules（§4.2）+ 注入 blurb 到 SKILL.md 两槽（§4.4②） | ✅ 确定，纯文件操作 | 换主题 / 发布前 |

**依赖关系**：`build:skill` 消费前两者的产物（`skill-blurb.md` 已存在、`references/components/` 已生成）。典型顺序——首次 `build:blurb` + `build:refs` 备好料 → 之后换主题只跑 `build:skill`。

**为什么不合成一个命令**：`build:blurb` 有 LLM、非确定；塞进 `build:skill` 会让每次 build 重掷骰子、破坏下面的幂等。

**保证**（针对 `build:skill`）：
- **幂等**：同 site + 同源重跑，产物逐字节相同（用存盘 blurb 而非现调 LLM 是关键）。
- **换主题 diff 收敛**：换 `activeSite` 重跑，只有 `references/theme/*` + SKILL.md 2 槽变化；`references/components/*`、固定模板、README **diff 为空**（[skill 结构验收标准](./skill-acceptance.md) 流程级节）。
- **源真相不变**：contract/adapter/rules/组件源码/DESIGN.md 是源；`skills/**/references/` 全是生成物，**永不手改**（顶部 DO NOT EDIT 标记 + 验收 grep 兜底）。

---

## 五、验收清单

验收标准（runbook + 逐产物 9 节 + 流程级）已抽成独立标准文档，见 [skill 结构验收标准](./skill-acceptance.md)——本节不再各自维护。

---

## 六、现在可落地的脚本（确定性叶子函数，可摘出）

> **本节状态（给接手的 agent）**：下面 4 个函数是**文档内草稿**——代码写完了，但**尚未落成 `scripts/lib/*.mjs` 文件、尚未测**。接手第一步 = 把每个 `~~~js` 块摘成对应文件 + 加最小 smoke test（§6.5）。本节只覆盖**现在就能写的确定性子集**；**完整脚本清单以 [§4.5 三个命令表](#45-三个命令编排与幂等)为准**，本节是它的一部分零件。

**全景（要哪些脚本 / 各自状态）**：

| 交付物 | 属于哪条命令 | 现在状态 | 阻塞在什么 |
|---|---|---|---|
| `lib/slot.mjs` `replaceSlot`（§4.0） | build:skill + build:refs 共用 | 📝 草稿就绪·未落文件·未测 | 无（纯函数，可立即落地） |
| `lib/merge-tokens.mjs` `mergeTokens`（§4.1） | build:skill | 📝 草稿就绪·未落文件·未测 | 无（可用 fixture 测） |
| `lib/families.mjs` `parseFamilies`/`renderCatalog`（§4.3.7） | build:refs | 📝 草稿就绪·未落文件·未测 | 无（输入 FAMILIES 表已定稿） |
| `lib/design-sections.mjs` `extractDesignSections`（§4.4a） | build:blurb | 📝 草稿就绪·未落文件·未测 | 无（可对 `sites/steep/source/DESIGN.md` 测） |
| build:refs ts-morph 抽 props（§4.3.1–5） | build:refs | ⛔ 未写 | 需 `packages/react/src/components/*` 真源码 |
| build:refs 编排（拼文件+注入 catalog）（§4.3.6–7） | build:refs | ⛔ 未写 | 需上一行 + `skills/` 目录骨架 |
| build:blurb LLM 步（§4.4b–c） | build:blurb | ⛔ 未写（非确定，不追求可复现） | 需 LLM 调用；只有 §4.4a 抽取（=design-sections）可先写 |
| build:skill 编排（合并/拷贝/注入）（§4.1–4.4②、§4.5） | build:skill | ⛔ 未写 | 需 contract/adapter/rules/skill-blurb 真文件才能跑 |

落点：`scripts/lib/`，编排脚本 import 它们。下面 4 个函数与其对应节：`replaceSlot`（§4.0 槽标记）、`mergeTokens`（§4.1）、`parseFamilies`+`renderCatalog`（§4.3.7）、`extractDesignSections`（§4.4a）。

### 6.1 `scripts/lib/slot.mjs` —— 槽替换（build:skill 与 build:refs 共用）

替换 `<!-- SLOT:x -->…<!-- /SLOT:x -->` 区间内的内容、不碰骨架。开标记允许带尾注（如 `<!-- SLOT:catalog (build:refs …) -->`）。同 body 重跑逐字节相同（幂等）。

~~~js
// scripts/lib/slot.mjs
// Replace the body between <!-- SLOT:name … --> and <!-- /SLOT:name -->.
// Pure string op. Idempotent: same body in → same output. The open marker
// may carry a trailing note before its "-->".
export function replaceSlot(source, name, body) {
  const openIdx = source.indexOf(`<!-- SLOT:${name}`);
  if (openIdx === -1) throw new Error(`slot not found: SLOT:${name}`);
  const openEnd = source.indexOf('-->', openIdx);
  if (openEnd === -1) throw new Error(`unterminated open marker: SLOT:${name}`);
  const closeIdx = source.indexOf(`<!-- /SLOT:${name} -->`, openEnd);
  if (closeIdx === -1) throw new Error(`close marker not found: /SLOT:${name}`);
  const head = source.slice(0, openEnd + 3); // through the open "-->"
  const tail = source.slice(closeIdx);       // from the close marker on
  return `${head}\n${body.trim()}\n${tail}`;
}
~~~

### 6.2 `scripts/lib/merge-tokens.mjs` —— contract + adapter 合并成单个 `:root`（§4.1）

adapter 同名覆盖 contract、contract 的插入顺序保留；派生 `color-mix()` 原样保留不求值。顶部写死 DO NOT EDIT 行给验收 grep 用。

~~~js
// scripts/lib/merge-tokens.mjs
// Merge contract.css + adapter.css into ONE :root. adapter overrides contract
// on same custom-property name; contract order kept for pre-existing props;
// derived color-mix() values are copied verbatim (not evaluated to static hex).
import postcss from 'postcss';
import { readFileSync } from 'node:fs';

function collectRootDecls(css) {
  const map = new Map(); // insertion-ordered
  postcss.parse(css).walkRules(':root', rule => {
    rule.walkDecls(/^--/, decl => map.set(decl.prop, decl.value));
  });
  return map;
}

export function mergeTokens(contractPath, adapterPath, site) {
  const map = collectRootDecls(readFileSync(contractPath, 'utf8'));
  for (const [prop, val] of collectRootDecls(readFileSync(adapterPath, 'utf8'))) {
    map.set(prop, val); // adapter wins
  }
  const body = [...map].map(([p, v]) => `  ${p}: ${v};`).join('\n');
  return `/* references/theme/tokens.css — generated for site: ${site}. DO NOT EDIT. */\n` +
         `:root {\n${body}\n}\n`;
}
~~~

### 6.3 `scripts/lib/families.mjs` —— 解析 FAMILIES 表 → 派生三样（§4.3.7）

输入 = §4.3 那张 `scripts/component-families.md`（已定稿）。派生：① 组件→族分类；② 决策 prompt 的 `EXISTING FAMILIES` 块；③ 注入 SKILL.md/README `<!-- SLOT:catalog -->` 的 catalog 片段。都不手维护。

~~~js
// scripts/lib/families.mjs
// component-families.md is the single source of truth for families.
import { readFileSync } from 'node:fs';

// -> [{ family, fn, members: [...] }]
export function parseFamilies(path) {
  const rows = [];
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^\|(.+)\|(.+)\|(.+)\|\s*$/);
    if (!m) continue;
    const [family, fn, members] = m.slice(1).map(s => s.trim());
    if (family === '族名' || /^-+$/.test(family)) continue; // header / separator
    rows.push({ family, fn, members: members.split(',').map(s => s.trim()).filter(Boolean) });
  }
  return rows;
}

// component name -> family (placement / validation)
export function classification(rows) {
  const map = new Map();
  for (const { family, members } of rows) for (const c of members) map.set(c, family);
  return map;
}

// the EXISTING FAMILIES block for the placement prompt (§4.3)
export function existingFamiliesBlock(rows) {
  return rows.map(r => `- ${r.family}: ${r.fn}`).join('\n');
}

// catalog snippet for SKILL.md + README <!-- SLOT:catalog --> (same snippet, both files)
export function renderCatalog(rows) {
  const head = '| Category | Components | Reference |\n| --- | --- | --- |';
  const body = rows.map(r =>
    `| ${r.family} | ${r.members.join(', ')} | [${r.family}.md](references/components/${r.family}.md) |`
  ).join('\n');
  return `${head}\n${body}`;
}

// A family is "built" iff its `<family>.md` exists under refsDir. renderCatalog links
// every row it is handed, so callers narrow to built families first — roadmap families
// in the table with no components in source yet (e.g. navigation) are dropped instead of
// emitting a dead catalog link. Same definition build:refs (post-write) and check:skill share.
export function builtFamilyRows(rows, refsDir) {
  return rows.filter(r => existsSync(join(refsDir, `${r.family}.md`)));
}
~~~

### 6.4 `scripts/lib/design-sections.mjs` —— 抽 DESIGN.md 三段（§4.4a）

DESIGN.md 是 Refero 产物、结构固定（已对 `sites/steep/source/DESIGN.md` 核对：H1 → `>` 副标题 → `**Theme:**` → style 段 → 首个 `## `；`## Do's and Don'ts` 独立节）。确定性抽取，无 LLM。输出喂给 §4.4b 的 prompt。

~~~js
// scripts/lib/design-sections.mjs
// Deterministic extraction of the 3 blurb inputs from a Refero DESIGN.md.
import { readFileSync } from 'node:fs';

export function extractDesignSections(path) {
  const lines = readFileSync(path, 'utf8').split('\n');

  // subtitle: first "> …" quote line (sits right under the H1)
  const subtitle = (lines.find(l => l.startsWith('> ')) || '').replace(/^>\s*/, '').trim();

  // style paragraph: prose after "**Theme:**" (fallback: after the subtitle),
  // collected until the next blank line or first "## ".
  let i = lines.findIndex(l => /^\*\*Theme:\*\*/.test(l));
  if (i === -1) i = lines.findIndex(l => l.startsWith('> '));
  const para = [];
  for (let j = i + 1; j < lines.length; j++) {
    const l = lines[j];
    if (l.startsWith('## ')) break;
    if (l.trim() === '') { if (para.length) break; else continue; }
    para.push(l.trim());
  }
  const styleParagraph = para.join(' ');

  // do's & don'ts: the whole "## Do's and Don'ts" section, until the next "## "
  const dosIdx = lines.findIndex(l => /^##\s+Do'?s and Don'?ts/i.test(l));
  let dosDonts = '';
  if (dosIdx !== -1) {
    const end = lines.findIndex((l, k) => k > dosIdx && l.startsWith('## '));
    dosDonts = lines.slice(dosIdx, end === -1 ? undefined : end).join('\n').trim();
  }
  return { subtitle, styleParagraph, dosDonts };
}
~~~

**为什么只写这 4 个**：它们依赖的输入要么是**已拍板的格式**（槽标记、tokens 合并语义、FAMILIES 表），要么是**现存文件**（DESIGN.md），所以现在能写、能测。

### 6.5 落地这 4 个 + 最小验证（接手第一步）

1. 把 §6.1–6.4 每个 `~~~js` 块摘成对应 `scripts/lib/*.mjs`。
2. 依赖：`merge-tokens` 需 `postcss`（`npm i -D postcss`）；其余零依赖。
3. smoke test（对现存输入直接验证，不用等骨架）：
   - `extractDesignSections('sites/steep/source/DESIGN.md')` → 应得 subtitle=`serif analytics on warm paper`、styleParagraph 非空、dosDonts 以 `## Do's and Don'ts` 开头。
   - `renderCatalog(builtFamilyRows(parseFamilies('<FAMILIES 表路径>'), '<组件参考目录>'))` → 每族一行、只列 `<族>.md` 已落盘的族（源码尚无对应组件的族如 navigation 不出现），成员与 §4.3 表逐字一致。
   - `replaceSlot` / `mergeTokens` 用两三行 fixture 断言（幂等：同输入跑两次输出相同）。

### 6.6 依赖解锁后怎么续（每个阻塞项：解锁条件 → 下一步）

| 阻塞项 | 解锁条件（何时能继续） | 续做（把这 4 个当零件用，不重写） |
|---|---|---|
| build:refs ts-morph 抽 props | `packages/react/src/components/<X>/<X>.tsx` + `packages/react/tsconfig.json` 就绪 | 按 §4.3.1–5 写 ts-morph 抽取；产物按族拼文件时用 `parseFamilies`（分族/顺序）。 |
| build:refs 编排 | 上一行完成 + `skills/stitch-design-system/` 骨架就绪 | 写 `scripts/build-refs.mjs`：抽 props→按族写 `references/components/*.md`；`renderCatalog(builtFamilyRows(rows, refsDir))` 出片段（只列已落盘族），`replaceSlot(skillMd,'catalog',snippet)` 注入 SKILL.md 与 README。 |
| build:blurb LLM 步 | 确定 LLM 调用方式（API/CLI） | 写 `scripts/build-blurb.mjs`：`extractDesignSections(DESIGN.md)`→填 §4.4b prompt→调 LLM→写 `sites/<site>/skill-blurb.md`。非确定，产物冻盘、绝不进 build:skill。 |
| build:skill 编排 | `packages/tokens/contract.css`、`sites/<site>/{adapter.css,rules.md,skill-blurb.md}`、`docs/design-system/design-rules.md`、SKILL.md 骨架（带槽）全就绪 | 写 `scripts/build-skill.mjs`：`mergeTokens(contract,adapter,site)`→写 `theme/tokens.css`；拷 design-rules/rules（§4.2）；读 skill-blurb 两段→`replaceSlot` 注入 SKILL.md 的 description/style-paragraph 两槽。纯确定、幂等。 |

**依赖顺序**（同 §4.5）：`build:blurb`+`build:refs` 先备料（skill-blurb.md、references/components/ 生成好）→ 之后换主题只跑 `build:skill`。
