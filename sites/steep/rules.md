# Steep — 风格规则

<!-- trace: 从 `sites/steep/source/DESIGN.md` 抽取；每节标题 `←` 尾注标来源段落。build:skill 迁移时 stripTrace 剥离本容器与各 `←` 尾注，不入发货预置。 -->
> 值层见同目录 `tokens.css`；工程纪律（跨站恒定，不在此复述）见全局 `design-rules.md`。

## 一句话风格 ← DESIGN.md 顶部 tagline + 概览散文
> serif analytics on warm paper——把分析做成杂志内页：Signifier 衬线大标题浮在近单色白底上，唯一暖桃点缀（#fbe1d1）打断整套 achromatic 系统。
> 超大斜体展示字、大量留白、24px 软边大卡片、扁平药丸控件；组件安静轻盈——阴影几乎不可见、边框发丝级、色彩仅用于功能强调。产品面（区域表、激活图、AI 撰写器）作为浮动 artifact 环绕标题，而非嵌进 dashboard 外壳。

## 调色板用法 ← Tokens—Colors 表(Role 列) + Do/Don't 颜色条 + Quick Color Reference
- 正文/标题主色 (`--stitch-text-primary`)：Ink Black `#17191c`——系统里唯一的深色面，每个 CTA 与正文标题都落到这个近黑。
- 页面底板 (`--stitch-bg-canvas`)：Paper White `#ffffff`——占主导的背景调（约 76 频次点），也用作按钮文字与抬升卡片面。
- 卡片/嵌套内容 (`--stitch-bg-card`)：Mist Gray `#f2f2f3`——paper 之下的安静层，承载嵌套内容与输入填充。
- 交替区块背景 (`--stitch-bg-section`)：Fog White `#fafafb`——比 paper 高一步，做细微区块变化与 hover 面。
- 链接色 (`--stitch-link`)：Slate Gray `#777b86`——介于正文与禁用之间的冷调灰，也用于弱化辅助文字、页脚文案。
- 三级标签/分类标签 (Marketing/Finance/Sales)：Ash Gray `#979799`——比链接色浅一步。
- 占位符/弱化文字 (`--stitch-text-muted`)：Smoke Gray `#a3a6af`——最浅的功能灰，用于文字后退（Ask anything…、禁用标签）。
- 强调面背景 (`--stitch-bg-accent`)：Blush Peach `#fbe1d1`——系统里唯一的彩色面，对单色制造编辑感暖意。**一页最多一次**，当稀有点缀而非背景；且须坐在白/浅灰面上，否则读不出「warm-on-neutral」。
- 强调面上文字/描边 (`--stitch-text-on-accent`)：Sienna Brown `#5d2a1a`——与 Blush Peach 配对如牛皮纸上的墨；也用作图表线描边。**只用于桃色面与图表描边**，绝不当白底上的正文色。
- 系统刻意 97% achromatic：**不要引入桃/棕之外的彩色**（蓝/绿/紫会破坏编辑克制）。
- 边框 (`--stitch-border`)：hairline `#ececec`。

## 排版规则 ← Tokens—Typography + Do/Don't 字体条
- 双字体搭配：Signifier（`--stitch-font-display`，衬线）专用于 H1/H2 展示与标题；Sohne（`--stitch-font-body`，无衬线）覆盖正文、UI、导航一切。
- **Signifier 永远 weight 400**，三档尺寸 44/64/90px 皆不加粗——衬线以「低语式权威」而非粗体呐喊，这是签名式选择。禁止 500/600+，也禁止在这些尺寸用无衬线替代。
- Signifier 行高 1.30；字距：90px 用 -2.25px、64px 用 -0.96px、44px 用 -0.66px（越大越紧）。
- Sohne 半步字重（430/450/480）做正文层级细分，够用再上 500；覆盖 14/15/16/17/18/20/22/26px。字距：26px 用 -0.234px、18px 用 -0.162px、正文尺寸为 0。
- 字距签名（Do 条）：display 90px `-0.025em`、heading 64/44px `-0.015em`、Sohne 26/18px `-0.009em`。
- 字阶表：caption 15px/1.5；body 17px/1.35；body-lg 20px/1.35；subheading 22px/1.5；heading-sm 26px/1.18/-0.23px；heading 44px/1.3/-0.66px；heading-lg 64px/1.3/-0.96px；display 90px/1.3/-2.25px。

## 形状 · 阴影个性 ← Tokens—Spacing & Shapes(Radius/Shadows) + Do/Don't + Elevation
- 两大结构圆角：按钮 (`--stitch-radius-button`) 9999px 全圆药丸、内容卡片 (`--stitch-radius-card`) 24px。inputs 16px、images (`--stitch-radius-image`) 12px、smallCards 16px、elevatedCards 20px。
- 卡片圆角不低于 16px、按钮不低于 9999px——尖角与中等圆角不属于本系统。
- 阴影极度克制：内容卡片（Neutral Card / Accent Peach Card）**不许加阴影**，只有浮动产品 artifact 才有可见阴影，且只到 10% 不透明度。
- 三档阴影映射：`--stitch-shadow-sm` = Dropdown/Popover `oklab(0 0 0 / 0.05) 0px 0px 0px 1px, rgba(0,0,0,0.08) 0px 4px 24px 0px`；`--stitch-shadow-base` = Modal/Overlay `oklab(0 0 0 / 0.05) 0px 0px 0px 1px, rgba(0,0,0,0.1) 0px 8px 40px 0px`；`--stitch-shadow-lg` = Floating Artifact `0 0 0 1px rgba(4,23,43,0.05), 0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)`。
- 图标描边 (`--stitch-icon-stroke-width`)：2。

## 组件规格 ← Components 段(逐组件像素规格，verbatim)
- **Pill Button — Filled**（主 CTA：Get started、Book a demo）：Background #17191c, text #ffffff, border 1px solid #ffffff (invisible against fill), border-radius 9999px (fully rounded), padding 0 20px, height auto with text. Sohne 16px weight 400. No shadow. 药丸形+深填充对白是签名动作元素，读作实心黑色锭。
- **Pill Button — Ghost**（配对次要动作）：Background transparent, text #17191c, border 1px solid #17191c, border-radius 9999px, padding 0 20px. Sohne 16px weight 400. 与 filled 共享药丸几何，同一基线读作一对。
- **Text Link with Arrow**（行内导航/段落过渡：Learn more →）：No background, no border, no border-radius, text #17191c, Sohne 16px weight 400, padding 20px 0。箭头字形（→）是标签的一部分，不是独立图标。最低强调交互元素——仅 hover 出下划线。
- **Nav Link**（顶导项：Product、Resources、Customers、Pricing）：No background or border, text #17191c, Sohne 16px weight 400, padding 2px 0。坐在透明顶栏（logo 左、CTA 右），导航 whisper-quiet——无背景、无阴影、无分隔线。
- **Neutral Card**（特性块/内容容器/基础卡面）：Background #f2f2f3, border-radius 24px, no shadow, no border, padding varies（内部 0，由内容子元素自带内距）。默认主力卡——扁平、柔软、安静。
- **Accent Peach Card**（编辑高亮/callout：客户引言、特性聚焦）：Background #fbe1d1, text and strokes #5d2a1a, border-radius 24px, no shadow, no border。暖上加暖造牛皮纸效果——**一页最多一张**以保冲击力。
- **Floating Product Artifact**（Hero/区块视觉：区域表、激活图、注册卡、AI 撰写器）：Background #ffffff, border-radius 20px, subtle box-shadow: 0 0 0 1px rgba(4,23,43,0.05), 0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1), padding 16px 20px 12px 12px。浮在 hero 文字四周的产品 UI 片段——是唯一带可见阴影的元素，且仅 10% 不透明度。
- **Input / Composer**（AI 提问输入：Ask anything…）：Background #ffffff, border 1px solid #ececec or hairline, border-radius 16px, padding 16px, placeholder text #a3a6af in Sohne 16px。含左侧 @ 与 ⓘ 图标、右侧深色圆形发送按钮（40px 直径，#17191c 填充，白色箭头图标）。
- **Stat Card with Chart**（数据片段：Registrations 2.4k、Activation 46.2%）：白色浮动 artifact 面，粗指标 Sohne 20px weight 500 #17191c，delta 行（↑ 5.5x vs last week）Sohne 14px #777b86，极简线/环形图 #5d2a1a 描边。No axes, no gridlines——图是手势线，不是数据 dashboard。
- **Avatar Bubble**（浮卡上用户在场指示：JB、AF 首字母）：Circular, 40px diameter, border-radius 9999px, background tinted（JB 浅绿、AF 浅蓝），双字 monogram Sohne weight 500，气泡边缘伸出小方向箭头（光标指针）。
- **Tag / Category Label**（区块/内容分类标记：Marketing、Finance、Sales）：No background, no border, text in Sohne 14px weight 400 #979799。刻意 ghost 化——是排版式标签不是徽章，无视觉重量地分组。

## 布局与留白 ← Layout + Tokens—Layout
- 页面模型 max-width 1200px 居中，hero 近全出血但守在容器内。区块间距 (`--stitch-space` 尺度) section gap 80px、card padding 20px、element gap 8px。4px 基准单位：组件内距用 4/8/12/16/20/24px，区块间距用 80px。
- Hero 模式：居中超大衬线标题 + 副标 + 药丸按钮对，四周环绕四张浮动产品 artifact 卡（区域表左上、注册卡右、激活图左下、AI 撰写器下中）以不同偏移叠在白底上。
- 区块在 Paper White 与 Card Mist 背景间交替，制造无强对比的安静节奏。特性区块用 2 栏 text+UI 布局，纵向 80px 大间距。
- 导航是单条透明顶栏（无背景、无边框、无阴影）：logo 左、导航项中、两个 CTA（text link + filled pill）右。整体密度 spacious——区块间会呼吸，内容永不挤到边缘。

## 意象 · 配图 ← Imagery
- 产品优先，非 lifestyle：浮动 UI 片段（5 行数据的区域表、Aug–Nov 激活折线、环形进度、AI 输入撰写器）作为裁切截图定位在编辑标题四周。
- **无摄影、无插画、无抽象图形**。所有产品视觉坐在白色浮动 artifact 卡上，带发丝边框与柔和 10% 阴影。
- Avatar 圆圈带小方向光标指针——信号「实时交互」的视觉母题。Hero 构图是文字+UI 拼贴，不是「居中标题配一张 stock 照片」。

## Do · Don't ← Do's and Don'ts(原样搬)
### Do
- 用 Signifier weight 400 在 44/64/90px 做所有展示与标题文案；这些尺寸绝不用无衬线替代。
- 桃色 #fbe1d1 卡面一页最多一次，且只做编辑强调——当稀有点缀，不当背景。
- 所有按钮 border-radius 设 9999px、所有内容卡设 24px；这是系统两大结构圆角。
- 每个 filled 药丸按钮 (#17191c) 都在同一行配一个 ghost 药丸按钮（#17191c 边框、透明填充）作次要动作。
- 正文层级先用 Sohne 半步字重 430/450/480 再够到 500——字重比标准 400/500/700 更细。
- 字距：90px display 设 -0.025em、64/44px 标题 -0.015em、26/18px Sohne -0.009em——越大越紧是排版签名。
- 守 4px 基准单位：组件内距用 4/8/12/16/20/24px，区块间距用 80px。

### Don't
- 别用桃/棕对之外的彩色——系统刻意 97% achromatic，引入蓝/绿/紫会破坏编辑克制。
- 别在 Signifier 用 bold(600+) 或 semibold(500)——衬线跨全尺寸停在 400，这份克制就是签名。
- 别给内容卡（Neutral Card / Accent Peach Card）加投影——只有浮动产品 artifact 配得上抬升。
- 别把卡片圆角设到 16px 以下、按钮设到 9999px 以下——尖角与中等圆角不属于本系统。
- 别给静态行内文字链加下划线——箭头后缀（→）承担链接可供性，下划线只在 hover 出现。
- 别把桃色 #fbe1d1 卡放在非白区块背景上——它需要 Paper White 或 Card Mist 垫底才读作 warm-on-neutral。
- 别把 #5d2a1a Sienna Brown 用在桃色面之外——它是 Blush Peach 卡与图表描边的墨，绝非白底上的正文色。

## 示例 Prompt ← Example Component Prompts
1. **Hero 标题 + 强调卡拼贴**：白底 (#ffffff)。展示标题 90px Signifier weight 400, #17191c, letter-spacing -2.25px，句中一个短语斜体。副标 17px Sohne weight 400, #777b86。下方：filled 药丸按钮（bg #17191c, text #ffffff, radius 9999px, padding 0 20px, Sohne 16px）与 ghost 药丸按钮（透明 bg, border 1px solid #17191c, text #17191c, radius 9999px）并排。文字四周环绕三张白色浮动产品 artifact 卡（数据表卡、折线图卡、stat 卡），各 bg #ffffff, radius 20px, box-shadow 0 0 0 1px rgba(4,23,43,0.05) + 0 20px 25px -5px rgba(0,0,0,0.1)，用负 margin 叠在文字边距上。
2. **强调编辑卡**：bg #fbe1d1, text #5d2a1a, radius 24px, no shadow, padding 40px。标题 26px Sohne weight 450, #5d2a1a, letter-spacing -0.23px。正文引言 18px Sohne weight 430, #5d2a1a。署名 14px Sohne weight 400, #5d2a1a。放在 #ffffff 区块上一次，绝不放彩色或深色背景。
3. **中性特性卡**：bg #f2f2f3, radius 24px, no shadow, padding 32px 20px。分类标签 14px Sohne weight 400, #979799（无背景、非徽章样式）。标题 20px Sohne weight 500, #17191c。正文 16px Sohne weight 400, #17191c, line-height 1.5。下方文字链：Sohne 16px weight 400, #17191c, no radius, padding 20px 0，带 → 箭头后缀。
4. **AI 撰写器输入**：白底 #ffffff, border 1px solid #ececec, radius 16px, padding 16px, width 480px。占位符 Ask anything… 16px Sohne weight 400, #a3a6af。左侧两个 ghost 图标按钮（40px 圆, 无填充）。右侧 40px 圆形发送按钮 bg #17191c, 白色箭头图标居中。
5. **交替背景区块**：区块 bg #fafafb (Fog White), padding 80px 纵向。区块标题 64px Signifier weight 400, #17191c, letter-spacing -0.96px。副标 18px Sohne weight 430, #777b86。下方 3 栏中性特性卡网格（#f2f2f3 底, 24px 圆角, 20px 内距, no shadow），列间距 24px。
