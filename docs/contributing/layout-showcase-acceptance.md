# 版式样例验收清单（每个 `demo/layouts/<slug>/` 都走一遍）

> 给**验收 agent**（也给人）对照用的硬清单：一条版式样例做完，照此逐条核，全过才可关闭。
> 术语正本见 [CONTEXT.md](../../CONTEXT.md)「版式样例」；基准是 `design-rules.md`（全局）+ 该站 `rules.md`（每站长相）**本身**——本清单只指过去、不复述规则。
> 与 [组件页验收](./demo-acceptance.md) 平行：那张看**孤立组件**，本张看**一整个网站页面在各主题下长什么样**。
> 验收站：**seline / steep / phantom** 三站互切（版式样例的价值就在跨主题看**综合换肤**，故三站都要过一眼，不做单站逐条）。

## 第一段 · `npm run ci` 全绿（先决闸）

验收 agent 先复跑 `npm run ci`（pre-commit 已强制，这里再确认一遍）。版式样例是 **demo-only**：不进 `build:refs`/skill、不碰 `component-families.md`、**不新增结构 Hook**；`check:boundary` 的扫描面本就豁免 `demo/`（ADR 0003），故连接件的「只读 `var(--stitch-*)`」由**人眼 + grep** 兜底，不靠 CI。ci 覆盖到的是：

- `tsc`（`tsconfig.json` include 了 `demo`）——版式样例 `.tsx` 必须类型干净（含 `noUnusedLocals`/`noUnusedParameters`）
- `format:check` / `lint`（oxlint）——格式与代码规范
- 组件层与 skill 侧的既有闸不回归、`build` 成功

**ci 不绿 = 直接不通过，无需往下走。**

### grep 兜底（连接件红线，可机检）

`demo/` 不进 `check:boundary`，故这三条对连接件用 grep 自查（源主题残留 / 硬编码主题值）：

```bash
# H2：连接件不得出现硬编码主题值（hex / 硬编码圆角 px / 字体族名）——命中即人工复核是否漏了 var(--stitch-*)
grep -nE "#[0-9a-fA-F]{3,8}|font-family:\s*['\"]|border-radius:\s*[0-9]" demo/layouts/*/index.tsx
# H1：不得出现某站原始变量（源主题残留）
grep -nE "var\(--(color|font|space|radius|shadow)-" demo/layouts/*/index.tsx
# 无 emoji / 裸 <svg> / Unicode 符号（图标一律走真组件 <Icon>）
grep -nE "<svg|[^\x00-\x7F]" demo/layouts/*/index.tsx   # 中文文案是预期命中，逐条确认无 emoji/符号即可
```

前两条应**零命中**；第三条命中的应只是中文文案，无 emoji、无 `<svg>`、无 Unicode 装饰符号（`•→★` 之类）。

## 第二段 · 在 demo 上逐条核（9 维度）

准备：`npm run demo` 起 demo，侧栏 `LAYOUT` 大类下点进该样例，顶栏切站器在 **seline ↔ steep ↔ phantom** 间切。

| # | 维度 | 方法 | 通过标准 |
|---|---|---|---|
| 1 | **真组件非手写** | 通读 `index.tsx` import + 页面逐块 | 每个交互 / 展示元素都 `import` 自 `@octohirono/stitch-design-system`（Button / Card / Avatar / Stat / LineChart / BarChart / Accordion / Tag / Icon / Divider…）；**只有连接件**（hero 外壳 / section 网格 / 通栏底色带）手写，且手写处**只读 `var(--stitch-*)`**。发现把某个真组件手搓重写一遍 = **不通过** |
| 2 | **四键显形** | 在页面上指认页面尺度层四键 | `--stitch-page-max-width`（正文列被收窄居中，通栏底色带更宽）、`--stitch-section-gap`（区块间竖向节奏）、`--stitch-card-padding`（真 Card 内边距）、`--stitch-element-gap`（元素间小间距）——**四键都能在页面指出来一处**，切站时随之变。指不出某一键 = **不通过** |
| 3 | **字阶压满（且不倒挂）** | 逐块核字号角色 **+ 目测层级** | `display`（Hero 大标题 `--stitch-text-display`）→ `heading`（区块标题 `--stitch-text-heading-sm`）→ `subheading`（列/卡标题 `--stitch-text-subheading`）→ `body`（正文/链接 `--stitch-font-size-base`）→ `caption`（**仅**脚注/版权/职衔等细则 `--stitch-text-caption`）**整条阶都在页面出现**，且每一档切站**尺寸随之变**。**并且**：① **层级不倒挂**——任一区块内标题档 **≥** 其正文/链接档；**caption 绝不当标题或眉标用**（眉标 kicker 该走 body 档，caption 在 seline 仅 10px，比正文还小 = 倒挂）；② **每档落在语义正确的元素**（列标题≠正文、眉标≠脚注）。缺一档 / 某档纹丝不动 / **层级倒挂**（如列标题比其链接还小）= **不通过** |
| 4 | **换肤综合（含图表色跟随 + 逐站对比可读）** | seline ↔ steep ↔ phantom 逐站扫全页 | 整页**每一处**（背景 / 文字 / 圆角 / 阴影 / 字体 / 间距 / accent）随切站变；**图表分类色随切站跟随**（`var(--stitch-cat-*)`，三站差异明显）。**并且逐站验对比可读**：连接件的图标 / 文字在**每一站**都看得清——**尤其站的 accent 是浅色时（phantom `accent≈#e2dffe`），禁止用 `var(--stitch-accent)` 直接给图标/文字上色**（浅 accent 落白底几乎隐形），要走 `accent` 底 + `accent-text`（契约成对）或 `text-primary`。任一处纹丝不动 → 有硬编码漏网；**任一站有图标/文字近乎隐形 → 判用错角色色** → 都**不通过** |
| 5 | **full-bleed** | 看通栏底色带与正文列 | 内容区**不套 `.page` 框、无注入标题 / 描述**；通栏底色带（Hero / 交替区块 / CTA accent 带）左右**贴到内容区边缘**（贴侧栏右缘、贴视口右缘）；正文本身**收进 `--stitch-page-max-width` 居中**。底色带留白框、或正文顶满不居中 = **不通过** |
| 6 | **fluid-graceful** | 把窗口**适度收窄** | 多列区块（Feature / 定价 / Stat 带）靠 `flex-wrap` / `auto-fit` **折行不破版**；**无横向溢出**（页面不出横向滚动条）。**不做移动端逐档**（页面尺度层无断点档，另立后续 issue）——本条只验「折行优雅」，不验断点。破版 / 横向溢出 = **不通过** |
| 7 | **键盘可达** | 只用键盘走一遍 | `Tab` 能走到导航链接 / Buttons / Accordion 头 / 定价 CTA；**焦点环可见**（focus-visible，组件自带）；Accordion 头 `Enter` / `Space` 可展开。任一缺失 = **不通过**（本条兜的是真组件的无障碍在整页组合里没被连接件破坏） |
| 8 | **60-30-10 + 动效 + 整页协调** | 整页配色比例 + 交互手感 **+ 通读目测** | 主导中性面（canvas / section）占大面（~60/30），**accent 只在少数几处发声**（CTA 带 / 高亮定价卡 / primary Button / 链接，~10）；动效**手感自然**（组件自带 `--stitch-motion-*`，连接件不另造刺眼动效）。**并且整页目测协调**：① **区块节奏均衡**——相邻区块竖向留白 ≈ **一个** `section-gap`（两带各出整段 section-gap 叠成 2×、整页松垮 = 不通过）；骨架带（导航 / 页脚）**不吃整段 section-gap**、收成紧凑条；② **骨架件成型**——导航条是紧凑 bar 非撑高区块、页脚是**多列**非孤零一行、品牌是**成型 logo** 非裸字；③ 无明显失衡（大片空洞 / 元素孤悬 / 标题正文粘连）。accent 铺太满 / 动效突兀 / **节奏失衡 / 骨架件寒酸** = **不通过** |
| 9 | **遵循各站 theme-preset 结构法则** | 对每个验收站，打开 `skills/stitch-design-system/references/theme-presets/<站>/`（`style.md` + `rules.md`）逐条比对 | 版式样例是 theme-agnostic 一套结构、切站换值——**但结构选择（组件 variant / 骨架形态 / accent 配给）不得与任一站的 DESIGN 法则冲突**。逐站核该 preset 的**硬约束**：① **卡片语义**——内容卡 vs 浮动产品卡用对 variant（如 steep「内容卡扁平无影、只有图表/产品卡浮动带影」→ 内容卡走 `filled`、图表卡走 `elevated`，别反）；② **导航/骨架形态**（如 steep「透明顶栏无底无边无影」）；③ **accent / 强调面配给**（如 steep「桃 `bg-accent` 一页最多一次、`sienna` 只在桃面、除桃棕外不引色」→ 眉标 tag 避开该站桃/棕槽，强调面全页只留一处）；④ 字族/字重/圆角/阴影**由 token 承载**、连接件不覆写。发现结构选择违反某站 preset 的 Do/Don't（如内容卡在 steep 带阴影、导航在 steep 有边、桃色在 steep 出现两次）= **不通过**，记明是哪站哪条 |

## 结论

- **全部通过**（9 维度 × 三站均无硬伤）→ 该版式样例 issue 可关。
- **任一不通过** → 退回，注明是哪一维度、哪一站、哪一处（第 4 条要具体到「哪个属性在哪两站间没变」）。
