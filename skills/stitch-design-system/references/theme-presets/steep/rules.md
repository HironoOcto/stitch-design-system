# Steep — 风格规则

> 从 `sites/steep/source/DESIGN.md` 抽取。每节标注来源段落。值层见 `sites/steep/adapter.css`；工程纪律见全局 `docs/design-system/design-rules.md`（跨站恒定，不在此复述）。

## 一句话风格 ← DESIGN.md 顶部 tagline + 概览散文
> serif analytics on warm paper —— 把分析工具做成杂志编辑感：near-monochrome 白纸底 + 单一暖桃点缀（#fbe1d1），97% achromatic。
> 超大斜体衬线 display、大量呼吸留白、24px 软边大卡、扁平药丸控件；组件安静轻盈——阴影几近无、边框发丝、色彩配给给功能强调。产品界面（表格/折线/雷达环/AI 输入框）作**浮动碎片**环绕标题，不塞进 dashboard 外壳。

## 调色板用法 ← Tokens—Colors 表(Role 列) + Do/Don't 颜色条 + Quick Color Reference
- **accent（黑填充 #17191c ink-black）**：主 CTA / 填充按钮 / nav logo，是系统里唯一的深色表面；每个 CTA 与正文标题都归到这个近黑。桃色不是 accent，只是稀有 surface。
- **bg-accent（桃 #fbe1d1 blush-peach）**：系统唯一的彩色表面，制造编辑式暖意。**一页最多一次**，当稀有点缀不当背景；须坐在 paper-white / card-mist 面上（**绝不**放非白区块背景）。
- **text-on-accent（sienna #5d2a1a）**：只用在桃色面（字 / 描边 / 图表线），像 kraft 纸上的墨。**绝不**当白底正文。
- 中性梯（steep 4 档灰 → 收敛契约 3 档）：ink-black #17191c（标题/强调）、slate-gray #777b86（链接 / 次要 helper / footer，= muted text）、ash-gray #979799（三级标签 / 分类 tag，取作 text-muted）；smoke-gray #a3a6af 归 placeholder/disabled。
- 表面层级：canvas #ffffff（L0 页底）、card-mist #f2f2f3（L1 嵌套内容）、section-fog #fafafb（L2 交替区块带）、accent-blush #fbe1d1（L3）、elevated-white #ffffff（L4 浮动产品卡）。
- **除桃/棕外不引入任何彩色**（蓝/绿/紫都破坏 97% achromatic 的编辑克制，Don't）。

## 排版规则 ← Tokens—Typography + Do/Don't 字体条
- 标题 **Signifier** 衬线（substitute GT Sectra / Tiempos Headline / Source Serif 4 / ui-serif·Georgia），三档 44 / 64 / 90px，**永远 weight 400**——不许 500/600（serif 低语权威而非加粗喧哗，加粗即破功）。
- 正文/UI/导航 **Sohne**（substitute Inter / system-ui），覆盖 14–26px；用**半步字重 430 / 450 / 480** 做精细层级，别跳到 700。
- 字距随尺寸变紧（**越大越紧**是招牌）：display 90px -2.25px、64px -0.96px、44px -0.66px、heading-sm 26px -0.23px；正文档位 0。
- 行高：Signifier 1.30；Sohne 1.00–1.50（正文 17px/1.35）。
- 招牌尺寸：正文 17px + display 90px（见 adapter font-size）。

## 形状 / 阴影个性 ← Tokens—Spacing & Shapes + Do/Don't + Elevation
- 基准 4px，密度 comfortable；圆角**按元素**：按钮 9999px（药丸）、内容卡 24px、input 16px、image 12px、smallCard 16px、elevatedCard 20px。**卡不低于 16、按钮必 9999**（无锐角、无中等圆角）。
- 阴影**极克制**：内容卡（Neutral / Accent Peach）**一律无阴影无边框**；**只有浮动产品卡片**赢得高度，且仅 ~10% 淡影。三档映射见 adapter（sm=Dropdown / base=Modal / lg=Floating Artifact，verbatim 抄 `variables.css`）。
- 装饰图标一律 **2px 描边**（non-scaling，恒 2px；与 seline 1px 发丝成对比，见 adapter `--stitch-icon-stroke-width`）。

## 组件规格 ← Components 段（逐组件, verbatim 抄 DESIGN.md）
- **Pill Button — Filled（主 CTA）**：底 #17191c、字 #ffffff、border 1px #ffffff（贴合处不可见）、9999px 药丸、padding 0 20px、Sohne 16/400、**无阴影**。系统招牌行动元素，读作黑色实心药丸。
- **Pill Button — Ghost（次级）**：透明底、字 #17191c、border 1px #17191c、9999px、padding 0 20px、Sohne 16/400。与 filled 同形，成对同基线出现。
- **Text Link with Arrow**：无底无框无圆角、字 #17191c、Sohne 16/400、padding 20px 0；末尾 `→` 是 label 的一部分（**不是独立图标**）；最低强调交互，**静止态不加下划线，hover 才加**。
- **Nav Link**：无底无框、字 #17191c、Sohne 16/400、padding 2px 0；居于透明顶栏（logo 左、CTA 右）；whisper-quiet——无底、无影、无分隔线。
- **Neutral Card（默认卡）**：底 #f2f2f3、24px、**无阴影无边框**、padding 由内容子元素自带；扁平、柔和、安静的主力卡。
- **Accent Peach Card（编辑强调）**：底 #fbe1d1、字/描边 #5d2a1a、24px、无阴影无边框；warm-on-warm 的 kraft 纸效果，**一页最多一个**以保冲击力。
- **Floating Product Artifact（浮动产品卡）**：底 #ffffff、20px、subtle 影 `0 0 0 1px rgba(4,23,43,.05), 0 20px 25px -5px rgba(0,0,0,.1), 0 8px 10px -6px rgba(0,0,0,.1)`、padding 16px 20px 12px 12px。围绕 hero 文字的产品 UI 碎片，**是唯一带可见阴影的元素**，且仅 10% 不透明。
- **Input / Composer**：底 #ffffff、border 1px #ececec 或发丝、16px、padding 16px、placeholder #a3a6af Sohne 16；左侧 @ 与 ⓘ 图标，右侧深色圆形发送键（40px、#17191c 填充、白色箭头）。
- **Stat Card with Chart**：白色浮动卡面，指标 Sohne 20/500 #17191c + delta 行 Sohne 14 #777b86 + #5d2a1a 描边的极简折线/雷达；**无轴无网格**，图是手势线不是仪表盘。
- **Avatar Bubble**：圆形 40px、9999px、淡色底（JB 淡绿 / AF 淡蓝）、双字 monogram Sohne 500、气泡边缘伸出小方向箭头（光标指针）。
- **Tag / Category Label**：无底无框、Sohne 14/400 #979799；刻意 ghost——是排版标签不是徽章，无视觉重量地分组。

## 布局与留白 ← Layout
- 页宽 **max 1200px 居中**；hero 近全出血但留在容器内；区块间距 **80px** 纵向；卡片 padding 20px；元素间距 8px；整体 spacious——区块间会呼吸，内容永不贴边。
- **Hero**：居中超大衬线标题 + 副标 + 药丸按钮对，四周环绕四张浮动产品卡（region table 左上 / registration card 右 / activation chart 左下 / AI composer 中下），以负边距在白 canvas 上错位重叠。
- 区块在 paper-white 与 card-mist 间**交替**制造安静节奏（无强对比）；feature 段用 2 列文字+UI + 慷慨 80px 纵向间距。
- **导航**：单条透明顶栏（无底、无边、无影），logo 左、nav 链接中、两个 CTA（text link + filled pill）右。

## 意象 / 配图 ← Imagery
- **产品优先，非生活方式**：真实 UI 碎片（5 行 region 表、Aug–Nov 折线、雷达进度环、AI 输入框）作裁剪截图环绕编辑式标题。**无摄影、无插画、无抽象图形**。
- 所有产品视觉坐在白色浮动卡上，配发丝边 + 10% 软影；头像圆带小方向光标指针，暗示 live 交互。
- hero 构图是**文字 + UI 拼贴**，不是居中标题配 stock 照。

## Do / Don't ← Do's and Don'ts（原样搬，最硬约束）
**Do**
- 所有 display/heading 用 Signifier 400 @ 44/64/90px；这些尺寸**绝不**换 sans-serif。
- 桃 #fbe1d1 卡面**一页最多一次**，只作编辑强调——当稀有 accent，不当背景。
- 所有按钮 9999px、所有内容卡 24px——系统的两个结构性圆角。
- 每个 filled 药丸（#17191c）配一个 ghost 药丸（#17191c 描边 + 透明底）作同排次级动作。
- 正文层级先用 Sohne 半步字重 430/450/480，再到 500——比标准 400/500/700 更细。
- 字距：90px display -0.025em、64/44px -0.015em、26/18px Sohne -0.009em——越大越紧是招牌。
- 守 4px 基准：组件 padding 用 4/8/12/16/20/24px，区块间距 80px。

**Don't**
- 不用桃/棕之外的彩色——系统刻意 97% achromatic；蓝/绿/紫会破坏编辑克制。
- Signifier 不用 bold(600+) / semibold(500)——衬线全程 400，克制即招牌。
- 内容卡（Neutral / Accent Peach）不加投影——只有浮动产品卡赢得高度。
- 卡圆角不低于 16px、按钮不低于 9999px——锐角与中等圆角不属本系统。
- 内联文字链接静止态不加下划线——`→` 后缀携带链接语义，下划线只在 hover 出现。
- 桃 #fbe1d1 卡不放非白区块背景——需 paper-white / card-mist 垫底才读作 warm-on-neutral。
- #5d2a1a sienna 不用在桃色面之外——它是桃卡与图表线的墨，绝不当白底正文。

## 示例 Prompt ← Example Component Prompts（给 AI 直接参考）
1. **Hero 标题 + 强调卡拼贴**：白 canvas #ffffff。display 90px Signifier/400 #17191c letter-spacing -2.25px，句中一处斜体短语；副标 17px Sohne/400 #777b86。下方 filled 药丸（#17191c 底 / #ffffff 字 / 9999px / padding 0 20px / Sohne 16）+ ghost 药丸（透明 / 1px #17191c 边 / #17191c 字 / 9999px）并排。文字四周三张白色浮动产品卡（表格 / 折线 / stat）：#ffffff 底、20px、影 `0 0 0 1px rgba(4,23,43,.05), 0 20px 25px -5px rgba(0,0,0,.1)`，负边距重叠。
2. **强调编辑卡**：#fbe1d1 底、#5d2a1a 字、24px、无影、padding 40px。标题 26px Sohne/450 #5d2a1a ls -0.23px；引文 18px Sohne/430 #5d2a1a；署名 14px Sohne/400 #5d2a1a。放在 #ffffff 区块上一次，绝不放彩色/深色底。
3. **中性 feature 卡**：#f2f2f3 底、24px、无影、padding 32px 20px。分类标签 14px Sohne/400 #979799（无底无徽章）；标题 20px Sohne/500 #17191c；正文 16px Sohne/400 #17191c/1.5；下方 text link Sohne 16/400 #17191c、无圆角、padding 20px 0、带 → 后缀。
4. **AI composer 输入**：白底 #ffffff、border 1px #ececec、16px、padding 16px、宽 480px。placeholder "Ask anything…" 16px Sohne/400 #a3a6af；左侧两个 ghost 图标键（40px 圆，无填充）；右侧 40px 圆形发送键 #17191c 底 + 白箭头。
5. **交替背景区块**：区块底 #fafafb（Fog White）、纵向 padding 80px。区块标题 64px Signifier/400 #17191c ls -0.96px；副标 18px Sohne/430 #777b86；下方 3 列中性 feature 卡（#f2f2f3、24px、20px padding、无影），列间距 24px。
