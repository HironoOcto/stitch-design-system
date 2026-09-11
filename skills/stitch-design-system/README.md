# stitch-design-system skill

全系统唯一的 skill：让 AI 按 `stitch-design-system` 组件库的规范、以**当前生效主题**的长相搭
React 界面。整个 skill 自包含——需要的每个值都嵌在 `references/` 下，运行时不外链、不联网取数。

## 安装

从公开仓库一键装进你的 agent 技能目录，用通用 CLI `vercel-labs/skills`（交互选 skill + 选目标
agent，76+ agent 各写入自己的技能目录，无需手拷）：

```bash
npx skills add HironoOcto/stitch-design-system
```

> ⚠️ 本仓库发了**两个 skill**：`stitch-design-system` + `reset-theme`。`add` 按**仓库**装（默认两个一起进来），而下面的 `remove` 按 **skill 名**卸——所以卸载要把两个都点名，没有「按仓库一键卸」。

之后更新到最新、或移除：

```bash
npx skills update HironoOcto/stitch-design-system
npx skills remove stitch-design-system reset-theme   # 两个 skill 一并卸；别用 --all（那会清掉机器上所有 skill）
```

Claude Code 用户另有一条**原生路径**——仓库根的 `.claude-plugin/`（`plugin.json` +
`marketplace.json`）可走 `claude plugins install`：

```bash
claude plugins install stitch-design-system@HironoOcto/stitch-design-system
```

两条路径并存（`npx skills add` 通吃多 agent、`.claude-plugin` 是 Claude 原生），装法决策见
源仓库 `docs/adr/0008-distribution-and-package-name.md`。装好后 AI 会先读 `SKILL.md`（主入口），
再按需展开 `references/` 下的分册。无需额外配置；skill 自身不需要 npm——组件库怎么装用见下面
「两种使用场景」。

## 目录布局

| 路径 | 是什么 |
| --- | --- |
| `SKILL.md` | 主入口：风格一段话 + 场景选择 + 组件目录 + 硬规则（AI 最先读） |
| `references/react-project.md` | 场景一：React 项目里用组件库 |
| `references/standalone-html.md` | 场景二：单文件 HTML、无构建、React 走 CDN |
| `references/components/` | 逐族组件参考（props、合法值、默认值，从源码逐字生成） |
| `references/theme-presets/<站>/tokens.css` | 该主题预置的完整 `:root`（`--stitch-*` 角色变量的确切值） |
| `references/theme-presets/<站>/rules.md` | 该主题预置的长相规则（字体、阴影、形状、强调色用法） |
| `references/theme-presets/<站>/style.md` | 该主题预置的招牌风格散文（一段话视觉心智模型） |
| `references/theme/design-rules.md` | 全局设计法则（禁写死、图标、动效、无障碍、配色比例；跨主题单份） |

主题**预置全备**：每个可发布站各一套 `theme-presets/<站>/`。「哪套生效」由消费项目 `.agent/stitch.theme.json` 的 `activeSite` 指针在读时决定（无则回落发布默认）——见 `SKILL.md` 的「Active theme」节。

## 两种使用场景

先认场景，再读对应分册（两者互斥，`SKILL.md` 里也是同一张表）：

- **React 项目**——`stitch-design-system` 已装或可装：装包、入口 import 一次样式、以 `.d.ts`
  为准写代码。见 [references/react-project.md](references/react-project.md)。
- **单文件 HTML**——无 npm、React 经 CDN：内联手搓与真实导出同名的组件，值全取自
  当前生效的 `references/theme-presets/<active>/*`。见 [references/standalone-html.md](references/standalone-html.md)。

> 生成/构建逻辑记在源仓库 `docs/contributing/skill-build-pipeline.md`；此 skill 摘出后为自包含
> 产物，不外链源仓库。`SKILL.md`、`references/theme-presets/*`、`references/theme/design-rules.md`、
> `references/components/*` 与下方组件表均由流水线生成，勿手改。

## 组件

<!-- SLOT:catalog (build:refs 注入"族 → 成员"表 —— 与 SKILL.md 同一份；勿手改) -->
| Category | Components | Reference |
| --- | --- | --- |
| general | Button, Icon, Image, Toggle, ToggleGroup | [general.md](references/components/general.md) |
| layout | Card, Divider, Collapse, Tabs, Accordion, AspectRatio, ScrollArea | [layout.md](references/components/layout.md) |
| form-controls | Input, Switch, Checkbox, Radio, Select, Slider, Label, OtpField, PasswordInput, Calendar, DatePicker | [form-controls.md](references/components/form-controls.md) |
| overlays | Modal, Drawer, Tooltip, Popover, HoverCard, AlertDialog | [overlays.md](references/components/overlays.md) |
| navigation | DropdownMenu, ContextMenu, Menubar, NavigationMenu, Toolbar | [navigation.md](references/components/navigation.md) |
| feedback | Loading, Progress, Skeleton | [feedback.md](references/components/feedback.md) |
| data-display | Table, CodeBlock, Tag, Avatar | [data-display.md](references/components/data-display.md) |
| chat | ChatMessage, ChatMessageActions, ChatList, ChatInput, TypingIndicator, ChatImage, ChatFile, ChatVoice | [chat.md](references/components/chat.md) |
| data-viz | LineChart, BarChart, PieChart, Stat | [data-viz.md](references/components/data-viz.md) |
| Form | Form | [Form.md](references/components/Form.md) |
| Notification | Notification | [Notification.md](references/components/Notification.md) |
<!-- /SLOT:catalog -->
