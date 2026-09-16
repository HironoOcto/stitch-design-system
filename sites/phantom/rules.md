# Phantom — 风格规则

<!-- trace: 从 `sites/phantom/source/DESIGN.md` 抽取；每节标题 `←` 尾注标来源段落。build:skill 迁移时 stripTrace 剥离本容器与各 `←` 尾注，不入发货预置。 -->
> 值层见同目录 `tokens.css`；工程纪律（跨站恒定，不在此复述）见全局 `design-rules.md`。

## 一句话风格 ← DESIGN.md 顶部 tagline + 概览散文
> 黄昏时分的薰衣草糖果店：单色紫罗兰世界，一切都是近白平面上的柔软药丸，被一只顽皮的幽灵和粉彩点缀打断。
> 柔和的单色加密钱包世界，浸在茄紫与薰衣草里；近白画布会渗入深紫区块，在通透与私密间摆荡。字体是轻语级 350 字重配激进负字距，80–96px 巨型标题优雅漂浮。招牌是慷慨的药丸几何（导航、按钮、卡片皆化为 24–100px 圆角的胶囊），一只幽灵吉祥物替换标题里的元音打破网格。调色板刻意窄：单一主紫承担全部结构工作，粉彩按钮色（薰衣草、奶油、腮红）在克制底色上营造糖果店节奏。

## 调色板用法 ← DESIGN.md Colors 表(Role 列) + Do/Don't 颜色条 + Quick Color Reference
- 主品牌/结构脊柱 = 茄紫 Aubergine `#3c315b`：导航边框、导航文字、标题文字、暗色区块的卡片表面、图标描边。对应角色 `--stitch-brand` / 暗区 `--stitch-bg-inverted`。
- 主行动填充 = 幽灵薰衣草 Ghost Lavender `#e2dffe`：填充型 CTA 按钮背景，配 4px 紫罗兰光晕；这枚浅上加浅的按钮只靠柔和光晕显形。对应角色 `--stitch-accent`。
- CTA 上文字 = 深色 `#3c315b`（Phantom 的 accent 文字为深色，非白），对应角色 `--stitch-accent-text`。
- 次要行动 = 长春花 Periwinkle `#ab9ff2`：更亮的薰衣草，用于次级 CTA、装饰填充、图标点缀、幽灵吉祥物；给淡紫世界加饱和度。
- 强调/点缀按钮集（粉彩，克制使用，多动作时才成组出现）：矢车菊蓝 Cornflower Pop `#4a87f2`（偶发的鲜明蓝，作高能量打断，少用）、奶油黄 Buttercream `#ffffc4`、腮红雾 Blush Mist `#ffdadc`。
- 成功状态 = 薄荷信号 Mint Signal `#2ec08b`：状态指示、正向确认、实时信号，少用。
- 文字：正文 `#1c1c1c`（Obsidian）；标题/导航 `#3c315b`；暗底之上 `#fdfcfe`（Paper White）；弱化文字/图标 `#86848d`（Fog）。
- 背景/表面（由浅到深）：画布 Paper White `#fdfcfe` → 浅色区块 Bone `#f4f2f4` → 中性按钮面 Ash `#e9e8ea` → 主 CTA 面 Ghost Lavender `#e2dffe` → 暗色区块 Aubergine `#3c315b`。
- 边框：细边 `#e9e8ea`；强边 `#3c315b`。
- 用量：调色板刻意窄——单一主紫做全部结构工作；粉彩仅作糖果节奏的点缀，不当背景。禁止引入粉彩集（`#4a87f2` / `#ffffc4` / `#ffdadc`）之外的饱和色。

## 排版规则 ← DESIGN.md Tokens—Typography + Do/Don't 字体条
- 字体：Phantom 自定义字体用于一切。替代字体 Inter、Söhne 或 DM Sans，取匹配的 300/400 字重并加 -0.025em 字距。
- 字重：默认 350（通体轻语字重，营造通透的反粗体个性）；400 仅保留给需要额外存在感的正文。禁止 600+ 字重——350 轻语是品牌嗓音，不是强调手段。
- 字距：所有尺寸 -0.025em 恒定不可退让（96px 处 -2.4px、64px 处 -1.6px、16px 处 -0.4px、13px 处 -0.325px）。
- 行高：显示级尺寸（64px 及以上）塌缩到 1.0–1.1，让巨型字纵向呼吸不留缝。
- 字阶（Role · 字号 · 行高 · 字距）：caption 13px / 1.35 / —；body-sm 15px / 1.4 / -0.375px；subheading 20px / 1.35 / -0.5px；heading-sm 24px / 1.25 / -0.6px；heading 30px / 1.21 / -0.75px；heading-lg 64px / 1.1 / -1.6px；display 96px / 1.0 / -2.4px。
- 禁忌：正文不得大于 16px 400 字重、行高不得高于 1.4——可读性规则适用但保持克制。

## 形状 · 阴影个性 ← DESIGN.md Spacing & Shapes(Radius/Shadows) + Do/Don't
- 基础单位 4px；密度 comfortable。
- 圆角（按元素）：导航 100px、标签 100px、按钮 100px、链接 32px、卡片 24px。100px 药丸几何是系统的定义性轮廓——不许出现扁平导航栏。
- 圆角红线：卡片圆角不得低于 24px、较小元素不得低于 16px；不用低于 16px 的尖角——世界由药丸与柔软胶囊构成，每个容器都该柔软。
- 阴影：唯一阴影 sm = `rgb(226, 223, 254) 0px 0px 4px 0px`，即主 CTA（Ghost Lavender 填充）上的 4px 紫罗兰光晕。除此之外系统保持扁平——不用任何投影。内容卡片无阴影，靠边框与慷慨内距分隔。
- 禁忌：不用渐变、图案、背景图等高对比装饰——表面永远是扁平纯色。

## 组件规格 ← DESIGN.md Components 段
- **药丸导航栏（Primary site navigation）**：白色药丸容器 `#fdfcfe`，满 100px 圆角，内含导航链接（Features、Learn、Explore、Company、Developers、Support）15px 350 字重 `#3c315b`。每个链接带 4px 人字形指示。与 logo 及 Download CTA 间隔 24–48px。药丸几何是招牌——不许扁平导航栏。
- **Download 按钮（导航内主 CTA）**：Ghost Lavender `#e2dffe` 填充配 `#3c315b` 文字，100px 圆角，16px 32px 内距，16px 350 字重。带 `rgb(226,223,254) 0px 0px 4px 0px` 微光晕。位于头部最右。
- **Hero 区（暗）**：Aubergine `#3c315b` 背景，白色 `#fdfcfe` 文字，64–80px 350 字重配 -1.6px 字距。居中标题堆叠 2–3 行，下方居中一枚药丸 CTA。系统的戏剧化、私密模式。
- **Hero 区（亮）**：Paper White 或 Bone `#f4f2f4` 背景，Aubergine `#3c315b` 文字 64–80px 350 字重。幽灵吉祥物替换标题里的一个元音作品牌招牌，幽灵以 Periwinkle `#ab9ff2` 渲染。
- **柔紫 Hero 面板（过渡 hero — 柔和紫罗兰洗）**：去饱和紫罗兰面板（呈现为灰紫）配白字与居中 Download CTA。位于亮暗两种 hero 模式之间作色调桥梁。
- **See More 链接按钮（区块内导航）**：Ghost Lavender `#e2dffe` 填充，`#3c315b` 文字，100px 圆角，12px 24px 内距，15px 350 字重。文字后带一枚小对角箭头图标。次要行动样式。
- **幽灵角色点缀（标题内装饰品牌元素）**：Phantom 幽灵吉祥物以 Periwinkle `#ab9ff2` 渲染，内联替换显示级标题里的一个元音。在肃穆的排印构图中制造玩味与品牌辨识。
- **粉彩点缀按钮集（多变体动作按钮）**：含 Buttercream `#ffffc4`、Blush Mist `#ffdadc`、Cornflower Pop `#4a87f2` 填充。与其他按钮相同的 100px 圆角与内距。成组使用以在多动作时营造糖果调色节奏。
- **Logo 锁形（品牌标记）**：Phantom 文字标配幽灵图标，亮底上 Aubergine `#3c315b`、暗底上 Paper White `#fdfcfe`。图标外 100px 容器圆角。位于头部最左。
- **搜索图标按钮（头部工具动作）**：32px 方形按钮，搜索/放大镜图标描边为 Aubergine `#3c315b`。无背景无边框——纯图标。位于导航与 Download CTA 之间。
- **成功徽章（状态指示）**：Mint Signal `#2ec08b` 背景，白字，100px 圆角，8px 16px 内距，13px 350 字重。少用于实时状态、确认或正向状态。
- **卡片表面（内容容器）**：Paper White `#fdfcfe` 背景，24px 圆角，48px 内距，1px 边框 `#e9e8ea` 或 `#f4f2f4`。无阴影——靠边框与慷慨内距分隔。质感轻，不厚重。

## 布局与留白 ← DESIGN.md Layout
- 页面最大宽度：1200px。
- 区块间距：64px。
- 卡片内距：48px。
- 元素间距：8–16px。
- 间距刻度：4 / 8 / 12 / 16 / 20 / 24 / 32 / 48 / 64 / 96 / 128px。
- 导航形态：药丸容器，靠 100px 圆角与 logo、Download CTA 分列头部两端，非扁平导航栏。
- 交替亮区块与 Aubergine 暗区块营造节奏——两种模式都同等原生。

## 意象 · 配图 ← DESIGN.md Imagery
- 无摄影、无产品截图、无抽象图形。视觉语言是纯排印加品牌吉祥物（幽灵角色）。
- 幽灵是唯一反复出现的插画元素，以 Periwinkle `#ab9ff2` 扁平渲染，且永远内联于文字中。
- 无图片密集内容——文字完全主导视觉层级，幽灵仅作偶发的个性打断。

## Do · Don't ← DESIGN.md Do's and Don'ts
### Do
- 所有导航容器、按钮、标签用 100px 圆角——药丸几何是系统定义性剪影。
- 默认所有文字 350 字重；400 仅留给需额外可读性的正文。
- 每个字号都用 -0.025em 字距——紧字距是品牌保真的不可退让项。
- 用 Ghost Lavender `#e2dffe` 作主 CTA 填充，配 `rgb(226,223,254) 0px 0px 4px 0px` 光晕。
- 亮区块与 Aubergine 暗区块交替营造节奏——两种模式同等原生。
- 显示级尺寸（64px 及以上）行高塌缩到 1.0–1.1，让巨型字纵向无缝呼吸。
- 用 Periwinkle `#ab9ff2` 的幽灵吉祥物替换显示级标题里的一个元音，制造品牌玩味。

### Don't
- 除主 CTA 上那唯一的 4px 紫罗兰光晕外，不用任何投影——系统保持扁平。
- 不用 600+ 字重——350 轻语是品牌嗓音，不是强调选项。
- 不用低于 16px 的尖角——世界由药丸与柔软胶囊构成。
- 不引入粉彩集（`#4a87f2`、`#ffffc4`、`#ffdadc`）之外的饱和色——调色板刻意窄。
- 正文不设大于 16px 400 字重、行高不超过 1.4——可读性规则适用但保持克制。
- 不用渐变、图案、背景图等高对比装饰元素——表面永远是扁平纯色。
- 卡片圆角不低于 24px、较小元素不低于 16px——每个容器都该柔软。

## 示例 Prompt ← DESIGN.md Example Component Prompts
1. **Hero 区（暗）**：Aubergine `#3c315b` 满幅背景。显示级标题 80px Phantom 350 字重 Paper White `#fdfcfe`，字距 -2.0px，行高 1.1，居中。下方一枚 Ghost Lavender `#e2dffe` 药丸按钮，100px 圆角，16px 48px 内距，16px 350 字重 `#3c315b`，配 `rgb(226,223,254) 0px 0px 4px 0px` 阴影。
2. **Hero 区（亮）**：Paper White `#fdfcfe` 背景。显示级标题 64px Phantom 350 字重 Aubergine `#3c315b`，字距 -1.6px。第二个词的首个元音替换为 Periwinkle `#ab9ff2` 幽灵吉祥物。下方一枚 See More 药丸链接（`#e2dffe` 填充，100px 圆角，`#3c315b` 文字 15px）带小箭头图标。
3. **导航栏**：白色 `#fdfcfe` 药丸容器，100px 圆角，48px 纵向内距，16px 24px 横向内距。含 5 个导航项 15px 350 字重 `#3c315b`，各带 4px 人字形。位于 Phantom logo（左）与 Download 按钮（右）之间。
4. **内容卡片**：Paper White `#fdfcfe` 背景，24px 圆角，1px 边框 `#e9e8ea`，48px 内距，无阴影。标题 30px 350 字重 `#1c1c1c`，正文 16px 400 字重 `#1c1c1c` 配 1.4 行高。
5. **粉彩点缀按钮组**：一排三枚药丸按钮，各 100px 圆角，16px 32px 内距，15px 350 字重。填充：Buttercream `#ffffc4`、Blush Mist `#ffdadc`、Cornflower Pop `#4a87f2`，均配 `#1c1c1c` 文字，按钮间 8px 间距。
