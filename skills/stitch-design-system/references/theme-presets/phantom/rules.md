# Phantom — 风格规则

> 从 `sites/phantom/source/DESIGN.md` 抽取。每节标注来源段落。值层见 `sites/phantom/adapter.css`；工程纪律见全局 `docs/design-system/design-rules.md`（跨站恒定，不在此复述）。

## 一句话风格 ← DESIGN.md 顶部 tagline + 概览散文
> lavender candy shop at dusk —— 单色紫世界：近白底板上万物皆软药丸，被淘气 ghost 与糖果色点缀打断。
> 加密钱包语汇，aubergine 深紫与 lavender 淡紫；界面在近白 canvas 与深紫区块间摆荡（airy ↔ intimate）。通体 whisper-weight 350 + 激进负字距，让 80-96px 巨标优雅漂浮。招牌是**药丸几何**（nav/按钮/卡片全化作 24-100px 胶囊）；一只 ghost 吉祥物替换标题里的元音，俏皮破格。调色刻意窄：单一主紫扛全部结构活，糖果按钮色（lavender/butter/blush）在克制底色上打出糖果店节奏。

## 调色板用法 ← Tokens—Colors 表(Role 列) + Do/Don't 颜色条 + Quick Color Reference
- **accent（Ghost Lavender #e2dffe）**：主 CTA 填充色，是"light-on-light"按钮——只靠 `rgb(226,223,254) 0 0 4px` violet glow 显形；面上文字用 Aubergine #3c315b。
- **bg-accent（= #e2dffe）**：phantom 的强调面即淡紫 CTA 面（Surfaces L4），与 accent 同色。
- **Aubergine #3c315b（结构脊）**：系统的结构骨架——nav 文字/描边、hero 与 dark-section 标题、暗区背景（`bg-inverted`）、强描边（`border-strong`）、icon 描边。单一主紫扛全部结构活。
- **Periwinkle #ab9ff2（accent 装饰）**：更亮的淡紫——ghost 吉祥物、次级 CTA、装饰填充、icon accent；给淡紫世界加饱和度。**不当小字文字色**（对白底 <AA）。
- **糖果点缀集（Cornflower #4a87f2 / Buttercream #ffffc4 / Blush Mist #ffdadc）**：多动作场景里成组出现打糖果节奏；**只此三色**，Don't 引入此集之外的饱和色。
- **中性文字 3 值**：Obsidian #1c1c1c（正文 + 内容卡标题）、Aubergine #3c315b（结构脊：nav/hero/暗区）、Fog #86848d（muted/次要/icon 描边）。
- **表面层级**：Paper White #fdfcfe（canvas + 卡面）、Bone #f4f2f4（浅区块面板）、Ash #e9e8ea（次级按钮/安静容器 + 细边框）、Ghost Lavender #e2dffe（CTA 面）、Aubergine #3c315b（暗区）。
- **on dark**：深紫区块上文字用 Paper White #fdfcfe。
- **Mint Signal #2ec08b**：仅作 success 徽章的装饰色（见组件规格）；语义"成功"状态走契约稳定层 `--stitch-success`，不用 mint 覆盖（mint 白字对底不达 AA）。
- **Do**：亮/暗（Aubergine）区块交替制造节奏，两种模式同等原生。**Don't**：引入糖果集之外的饱和色（调色刻意窄）。

## 排版规则 ← Tokens—Typography + Do/Don't 字体条
- 单一定制体 **Phantom**（display 与 body 同一 face；substitute Inter / Söhne / DM Sans @ weight 300/400）。
- **通体 weight 350**（默认正文与 display 皆 350——非常规轻盈=anti-bold 品牌嗓音）；**weight 400 只留给**需要更多存在感的正文；**Don't** 用 600+（350 是嗓音不是强调手段）。
- **-0.025em 负字距全尺寸生效**（品牌保真非协商项：96px→-2.4px、64px→-1.6px、16px→-0.4px、13px→-0.325px）。
- **display 行高塌到 1.0-1.1**（≥64px 让巨标垂直呼吸不留缝）；正文行高 ≤1.4（Don't 超 1.4）。
- 字阶：caption 13 / body-sm 15 / subheading 20 / heading-sm 24 / heading 30 / heading-lg 64 / display 96（见 adapter font-size-display 96 招牌杠杆）。
- **Don't**：正文超 16px weight 400。

## 形状 / 阴影个性 ← Tokens—Spacing & Shapes + Do/Don't + Elevation
- 基准 4px，密度 comfortable；圆角**按元素**：nav/tags/buttons 100px（药丸）、cards 24px、links 32px、input 100px（判断补, 见 adapter ③）、image 24px。
- **药丸几何是招牌**：Do 用 100px 于一切 nav 容器/按钮/tag——"no flat nav bars allowed"；**Don't** 用 <16px 锐角（小元素）、<24px（卡片）——万物皆软胶囊。
- **阴影极克制——系统全扁平**：唯一允许的是主 CTA 上那道 `rgb(226,223,254) 0px 0px 4px 0px` violet glow；**Don't** 用任何超出这道 4px 紫晕的投影，**Don't** 用渐变/纹理/背景图（表面永远是扁平纯色）。
- icon 描边纤细 1.5（airy/anti-bold；见 adapter `--stitch-icon-stroke-width`）。

## 组件规格 ← Components 段（逐组件, verbatim 抄 DESIGN.md）
- **Pill Navigation Bar**：白色药丸容器 #fdfcfe、100px 圆角，内含 nav 链接（15px weight 350 #3c315b），每链接带 4px chevron；与 logo、Download CTA 隔 24-48px。药丸几何定义招牌——不许扁平 nav。
- **Download Button（Header）**：Ghost Lavender #e2dffe 填充 + #3c315b 字、100px 圆角、padding 16px 32px、16px weight 350；带 `rgb(226,223,254) 0 0 4px` glow；居 header 最右。
- **Hero Section（Dark）**：Aubergine #3c315b 满出血背景，白字 #fdfcfe @ 64-80px weight 350、-1.6px 字距；标题居中堆 2-3 行；下方居中药丸 CTA。系统的戏剧/亲密模式。
- **Hero Section（Light）**：Paper White 或 Bone #f4f2f4 背景，Aubergine #3c315b 字 @ 64-80px weight 350；ghost 吉祥物替换标题一处元音（渲染为 Periwinkle #ab9ff2）作品牌签名。
- **Muted Purple Hero Panel**：去饱和紫面板（呈灰紫）+ 白字 + 居中 Download CTA；居亮/暗两 hero 模式间作色调桥。
- **See More Link Button**：Ghost Lavender #e2dffe 填充、#3c315b 字、100px 圆角、padding 12px 24px、15px weight 350、文后带小斜箭头图标。次级动作范式。
- **Ghost Character Accent**：Phantom ghost 吉祥物渲染为 Periwinkle #ab9ff2，行内替换 display 标题中一处元音；在克制排版里制造一刻俏皮与品牌识别。
- **Pastel Accent Button Set**：Buttercream #ffffc4 / Blush Mist #ffdadc / Cornflower Pop #4a87f2 填充；同 100px 圆角与 padding；成组用于多动作糖果节奏。
- **Logo Lockup**：Phantom 字标 + ghost 图标，浅底用 Aubergine #3c315b、深底用 Paper White #fdfcfe；图标外 100px 容器圆角；居 header 最左。
- **Search Icon Button**：32px 方形按钮，Aubergine #3c315b 搜索图标描边；无底无边纯图标；居 nav 与 Download CTA 之间。
- **Success Badge**：Mint Signal #2ec08b 背景、白字、100px 圆角、padding 8px 16px、13px weight 350；克制用于 live 状态/确认/正向态。
- **Card Surface**：Paper White #fdfcfe 背景、24px 圆角、48px padding、1px 边框 #e9e8ea 或 #f4f2f4；**无阴影**——靠边框与慷慨内距分隔；分量轻不厚重。

## 布局与留白 ← Layout
- 页宽 **max 1200px**；区块间距 **64px**；卡片 padding **48px**；元素间距 **8-16px**。
- 亮区块与 Aubergine 暗区块**交替**制造节奏，两模式同等原生。
- nav 为独立白色药丸容器（非贴顶扁条），与 logo/CTA 以 24-48px 间隔分列。

## 意象 / 配图 ← Imagery
- **无摄影、无产品截图、无抽象图形**——视觉语言是纯排版 + 品牌吉祥物。
- ghost 是唯一反复出现的插画元素：扁平渲染为 Periwinkle #ab9ff2，**永远行内嵌在文字中**。
- 无图片密集内容——文字完全主导视觉层级，ghost 只作偶发个性打断。

## Do / Don't ← Do's and Don'ts（原样搬，最硬约束）
**Do**
- nav 容器/按钮/tag 全用 100px 圆角——药丸几何是系统定义性剪影。
- 默认全文 weight 350；weight 400 只留给需额外易读性的正文。
- 全尺寸施加 -0.025em 字距——紧字距是品牌保真非协商项。
- 主 CTA 用 Ghost Lavender #e2dffe + `rgb(226,223,254) 0 0 4px` glow。
- 亮区块与 Aubergine 暗区块交替制造节奏。
- ≥64px display 行高塌到 1.0-1.1，让巨型字垂直呼吸不留缝。
- display 标题一处元音替换为 Periwinkle #ab9ff2 的 ghost 吉祥物。

**Don't**
- 不用超出那道 4px violet glow 的投影——系统保持扁平。
- 不设 weight 600+——350 whisper-weight 是嗓音不是强调选项。
- 不用 <16px 锐角——世界是药丸与软胶囊。
- 不引入糖果 accent 集（#4a87f2 / #ffffc4 / #ffdadc）之外的饱和色——调色刻意窄。
- 正文不超 16px weight 400、行高不超 1.4——易读规则适用但保持克制。
- 不用渐变/纹理/背景图等高对比装饰——表面永远扁平纯色。
- 卡片圆角不低于 24px、小元素不低于 16px——每个容器都该软。

## 示例 Prompt ← Example Component Prompts（给 AI 直接参考）
1. **Hero Section（Dark）**：Aubergine #3c315b 满出血底。Display 标题 80px Phantom weight 350 Paper White #fdfcfe，字距 -2.0px、行高 1.1、居中。下方 Ghost Lavender #e2dffe 药丸按钮，100px 圆角、padding 16px 48px、16px weight 350 #3c315b，带 `rgb(226,223,254) 0 0 4px` 阴影。
2. **Hero Section（Light）**：Paper White #fdfcfe 底。Display 标题 64px Phantom weight 350 Aubergine #3c315b，字距 -1.6px；第二词首元音替换为 Periwinkle #ab9ff2 ghost 吉祥物。下方 See More 药丸链接（#e2dffe 填充、100px 圆角、#3c315b 字 15px）带小箭头图标。
3. **Navigation Bar**：白色 #fdfcfe 药丸容器、100px 圆角、纵向 padding 48px、横向 padding 16px 24px。内含 5 个 nav 项 15px weight 350 #3c315b，各带 4px chevron；居 Phantom logo（左）与 Download 按钮（右）之间。
4. **Content Card**：Paper White #fdfcfe 底、24px 圆角、1px 边框 #e9e8ea、48px padding、无阴影。标题 30px weight 350 #1c1c1c，正文 16px weight 400 #1c1c1c 行高 1.4。
5. **Pastel Accent Button Group**：一排三个药丸按钮，各 100px 圆角、padding 16px 32px、15px weight 350。填充：Buttercream #ffffc4 / Blush Mist #ffdadc / Cornflower Pop #4a87f2，全用 #1c1c1c 字，按钮间距 8px。
