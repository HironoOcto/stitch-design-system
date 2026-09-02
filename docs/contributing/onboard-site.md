# 接入新站 playbook（可复用）

> 给 agent 的可复用流程：把一个站的 Refero bundle 抽成该站的**两个产物** `adapter.css` + `rules.md`。**每加一个站跑一次**，把 `<site>` 换成站名即可。这是 [multi-site-theming §9.6](../design-system/multi-site-theming.md#96-接入一个新站的流程) 的可执行形式；映射规则 / rules 模板不在此复述，链到正本。

## 何时用

新增一个站的长相时。**前置**：该站 Refero bundle 已放进 `sites/<site>/source/`（主力 `DESIGN.md`，超集）。

## 产出（两份，缺一不可）

见 [§9.2 一个站的风格 = 值 + 规则](../design-system/multi-site-theming.md#92-一个站的风格--值--规则)：只换值不够，还要换规则。

| 产物 | 内容 | 消费路径 | 正本规则 |
|---|---|---|---|
| `sites/<site>/adapter.css` | 该站值填进 `--stitch-*` 角色变量（静态 `:root`） | 渲染（组件 `var()`） | [§9.4.2](../design-system/multi-site-theming.md#942-适配-adaptercss) |
| `sites/<site>/rules.md` | Do/Don't + 组件规格 + 用法 | 生成（AI 生成页面时） | [§9.5.2 模板](../design-system/multi-site-theming.md#952-每站-rulesmd-模板从-designmd-抽) |

## 执行 prompt（复制，把 `<site>` 全部换成站名）

```text
你在 stitch-design-system/ 目录内执行。对 <site> 执行 multi-site-theming §9.6 的抽取步骤，
产出该站【两个产物】——sites/<site>/adapter.css（值）+ sites/<site>/rules.md（规则）。

输入：
- sites/<site>/source/DESIGN.md（主力·超集：Quick Color Reference 已做好语义映射；色表带 Role 列；
  组件像素规格；Do/Don't；Layout/Imagery；Example Prompts）。tokens.json / variables.css 留作值核对。
- packages/tokens/contract.css（角色契约：所有 --stitch-* 名字 + 【每站】/【每站·可选】/【派生】/【恒定】标记。契约是"有哪些变量"的唯一真相——新增变量只落契约，本 playbook 不逐一列）。
- sites/steep/ 的 adapter.css + rules.md（现成样例，照它们的结构/注释风格写）。

产出 1 · sites/<site>/adapter.css（照 §9.4.2）：
- 单段静态 :root，用 --stitch-* 角色名重写 <site> 的值；绝不引用该站原始变量名（--color-*）。
- 覆盖【每站】槽（必填）；【每站·可选】槽（如字阶 / 间距 / 图标描边 --stitch-icon-stroke-width）——**该站有偏好就覆盖、没有就留空继承契约默认**（别漏判：描边 1 vs 2、字阶密度都是真实风格杠杆，逐个想一遍再决定留空）。不写【派生】（契约里已是 color-mix/var 活表达式，自动跟随）、不写【恒定】、不写反馈色。
- 每行标来源 ①抽取 / ②派生 / ③需确认；映射三情况：直接照抄 / 多选一挑并注明 / 缺角色（如 CTA）判断补标 ③。

产出 2 · sites/<site>/rules.md（照 §9.5.2 模板）：
- 一句话风格 / 调色板用法 / 排版规则 / 形状·阴影个性 / 组件规格 / 布局与留白 / 意象·配图 /
  Do·Don't /（可选）示例 Prompt；每节标注来自 <site> DESIGN.md 哪段。

验收（真实产物就位 + 人复核）：
- 两文件都在；adapter 是单段 :root 只含【每站】槽、值可追溯 DESIGN.md；rules.md 各节齐全、可追溯。
- H1/H2：grep 断言无 --color-* 等长相变量、无外来前缀、无写死主题 hex（除 :root 值本身）。
- adapter 的 多选一 / 缺CTA / ③需确认 行 + rules.md 照搬到位，交人复核后算完成。
- 附执行报告两块表（结构 Hook 表含 H1/H2；真实 case = 两产物产出并逐值/逐节对照 DESIGN.md）。
```

## 复核

产物就位后交人/复核 agent 核对：可执行清单见 [onboard-site-review.md](./onboard-site-review.md)（同样 `<site>` 换名即用，靠读 adapter 的 `①/②/③` 内联标记驱动）。

派复核 agent 的 prompt（复制，把 `<site>` 换成站名）：

```text
你在 stitch-design-system/ 目录内复核 <site> 的两个产物 sites/<site>/adapter.css + sites/<site>/rules.md，
执行 docs/contributing/onboard-site-review.md 的清单逐条走，
重点裁 adapter.css 里的 ③（尤其 CTA 文字色冲突，先算对比度再定），
产出「通过/需改动 + 必改项」结论。只出结论，不改产物（除非维护者授权按必改项落地）。
```

## 每个新站 = 一个薄 issue

不必为每站重写一大段 prompt。建一个 GH issue：`[stitch] 接入新站 <site>：执行 onboard-site playbook`，正文指向本文件；[issue-management.zh-CN.md](../issue-management.zh-CN.md) 里那段 AFK prompt 就写「执行 onboard-site playbook，`<site>=…`」+ 该站特有的验收点（如与现有站的可见差异）。规则的单一真相始终是本 playbook + multi-site-theming 正本，站站复用。

> 注：抽取是 **AI 生成 + 人复核**，非确定脚本（[ADR 0004](../adr/0004-token-source.md)：不上 tokens.json 生成器，直到 [§9.7](../design-system/multi-site-theming.md#97-何时升级到-tokensjson-生成方案) 的信号）。
