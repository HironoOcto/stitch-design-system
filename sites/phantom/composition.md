# Phantom — 合成层（Composition Layer）

<!-- trace: 维护者追溯（build:skill stripTrace 迁移时剥离本容器 + 各 `←` 尾注，不入发货预置）。
探针对真站跑（首页 https://phantom.com/，2026-09-17，视口 1440px；DESIGN.md 是首页 style reference、只断言首页，
故首页全滚覆盖 = 覆盖全部断言面）。全滚触发懒加载后跑 scripts/emergent-probe.js 取并集，另对深色大块直查 backgroundColor
（dark_region 桶阈值 L<0.2 会漏 aubergine L≈0.21，直查补）。列：合成层特征 | 探针实测 | DESIGN.md 现状 | 缺陷 | 判断依据·归宿。
判断依据·归宿参见 emergent-layer-acceptance.md 的「每条信号的归宿」表 + ADR 0013 单槽判据。

| 合成层特征 | 探针实测 | DESIGN.md 现状 | 缺陷 | 判断依据·归宿 |
| --- | --- | --- | --- | --- |
| 平面淡紫画布 | html 背景 rgb(245,242,255)（=#f5f2ff）满 1440×8041；画布上零 backdrop_gradient(mesh)/overlay_texture/backdrop_raster | :19/:178/:195 画布 = Paper White #fdfcfe；:2/:6 开篇「near-white plane / monochromatic violet world」 | WRONG（画布实为 #f5f2ff 淡紫、非 #fdfcfe 中性白）+ 铺底「刻意平」未记 MISSING | 画布色单值 → 值槽 --stitch-bg-canvas；「刻意平·无 mesh/纹理」refuse 归 rules.md/本层 |
| 全宽视频 hero | backdrop_raster …8806bb.mp4（video.vctft23, 1346×731, top 119）——唯一大幅面 media | :190 Imagery「No photography, no product screenshots, no abstract graphics… no image-heavy content… pure typography and brand mascot」 | WRONG + MISSING（首屏就是大视频秀，doc 全盘否认影像/动效） | 内容资产（视频秀）不 tokenable → rules.md 记「用/怎么处理」 |
| 彩色瓦片网格 | a.cic9ch1 427×571 radius 24px ×12，实心填色：periwinkle(171,159,242)、cornflower(74,135,242)、buttercream(255,255,196)、blush(255,218,220)、ash(233,232,234)、cream(255,253,248) + 深色瓦片见下；分三行 top 1881/3552/5223 | :149 Card Surface「Paper White #fdfcfe bg, 1px border in #e9e8ea, No shadow」 | WRONG + MISSING（招牌 feature 瓦片非白底描边卡，是实心彩块拼成 bento 网格） | 单个瓦片色 → 值槽；网格编排 + 每块必配色归 rules.md/本层 |
| 每块环境辉光 | shadow_glow rgb(226,223,254) 0 0 4px 0 ×12（覆盖【全部】瓦片，非仅 CTA） | :160/:166/:186 4px violet glow 限「primary CTAs」；:149 内容卡 No shadow | WRONG（辉光范围：全瓦片 ambient 光晕，非 CTA 专属；卡也带光） | glow 值可入 --stitch-glow-*；「每块都罩一层淡紫光晕」编排归本层 |
| 深色瓦片 obsidian + aubergine | 直查 bg：obsidian rgb(28,28,28) L=0.11、aubergine rgb(60,49,91)=#3c315b L=0.213（dark_region 桶 L<0.2 漏 aubergine，直查大卡 bg 佐证「逐行深色瓦片」） | :12 aubergine「card surfaces in dark sections」、:20 obsidian ink；但框为满幅 dark hero | MISSING（深色作瓦片级设备未记；aubergine 值在但合成角色错） | 瓦片深浅编排归 rules.md；on-dark 文本色入契约 |
| 满幅暗幕（不存在） | fullWidthBg 全站仅 html 淡紫(L=0.955) + 近白 footer 面(L=0.99)；零满宽暗区（首页全滚已扫） | :104 Hero Dark「Full-bleed aubergine background」+ :161 Do「Alternate light/Aubergine dark sections」 | UNGROUNDED（首页已扫遍，无任何满宽 aubergine 幕；暗只活在瓦片里） | 「暗=瓦片级、非整幕」归 rules.md/本层 Don't（别照 doc 造满宽暗幕） |
| 字形无斜体 | type_italic 零命中；全部 h1/h2/h3 fontStyle normal | doc 无斜体断言 | 一致（显式记为「刻意无斜体」，区别 steep 的一句一处 em） | 归本层 Don't |
| 全平面（无 mesh/毛玻璃/滤镜/混合） | 零 backdrop_gradient(mesh)、零 backdrop_filter、零 blend、_imgTreatment 空 | :166 stays flat、:171 Don't gradients/patterns/background images | 一致（忠实） | refuse 归 rules.md Don't（affirm，别引入 steep 式毛玻璃/mesh） |
| ghost mascot 内联 | _counts svgs:34；元音位内联品牌吉祥物 | :6/:112/:124/:163/:190 详述 ghost 换元音、periwinkle 渲染 | 一致（忠实，内容资产） | 纯内容归 rules.md「用/怎么处理」 |
-->
> 本文件记 phantom 那些**单个 token 换不动、需多图层 / 定位 / 编排才成立**的长相——平面氛围铺底、影像与动效、彩色瓦片网格·环境辉光、深浅编排、字形与品牌设备、刻意拒绝。值层见同目录 `tokens.css`；组件规格见同预置 `rules.md`。**复刻 phantom 缺了这层，会把满屏彩色瓦片拼贴退化成一堆白底描边卡，丢掉「黄昏薰衣草糖果铺」的整体气质。**

## 一句话 ← 概览 + 真站观感

phantom 是**平面拼贴的糖果铺**：整页浮在一层**淡紫近白平面**上（不是中性白），首屏一段**全宽视频秀**领入，主体是一片**实心彩色瓦片拼成的 bento 网格**——薰衣草 / 矢车菊蓝 / 奶油 / 黄油 / 腮红等亮糖色之间，穿插**近黑 obsidian 与深紫 aubergine 的深色瓦片**做对比；每一块瓦片都罩一层**极淡的紫色环境光晕**，让整片糖色像浮在同一层薄光里。全程**刻意平**——无渐变 mesh、无颗粒、无毛玻璃、无满幅暗幕；深色只活在单块瓦片里，绝不铺成整幕。

## 1. 背景氛围 backdrop ← 真站探针实测

- 整页画布是一层**淡紫近白平面**（约 `#f5f2ff`），带极轻的薰衣草偏色——不是纯白、也不是中性纸白。它是所有瓦片浮起的统一底，让「单色紫世界」的气质从画布就开始。
- 画布**刻意平**：无位图 mesh 渐变、无 SVG 颗粒叠层、无噪声纹理——氛围来自**色相**（淡紫）而非图层材质。别为了「高级感」往画布加 mesh / 颗粒 / 毛玻璃，那会破坏 phantom 干净糖果铺的调性。
- 铺底不承载对比戏剧——明暗对比全部下放到瓦片层（见第 3、4 节），画布自身始终保持这一层安静的淡紫。

## 2. 影像与动效 imagery ← 真站探针实测

- 首屏**不是纯排版**：hero 位置是一段**全宽自动播放视频秀**（近满宽、圆入版式），作为进入产品世界的门面。这是 phantom 唯一的大幅面动态影像。
- 复刻要点：视频是**内容资产**，每站 / 每次自备，本层只记「怎么处理」——**满宽、圆角收入、静音自动循环**，坐在淡紫画布上、不叠滤镜不灰化。除这段 hero 视频外，页面其余部分确实回归排版 + 品牌吉祥物为主，不堆图。

## 3. 彩色瓦片网格 · 环境辉光 tiles & glow ← 真站探针实测

- 主体是一片 **bento 瓦片网格**：等大的圆角瓦片（约 427×571、圆角 24px）按行铺开，**每一块都是实心填色**——不是白底描边卡。填色在亮糖色之间轮换：薰衣草、矢车菊蓝、奶油、黄油黄、腮红粉、雾灰，与深色瓦片（见第 4 节）混排成糖果货架的节奏。
- **每一块瓦片**都罩同一道**极淡紫色环境光晕**（约 `rgb(226,223,254)` 的 4px 零扩散柔光）——这不是只给主 CTA 的高光，而是**全瓦片统一的 ambient halo**，让整片彩块像浮在同一层薄光里、彼此调性一致。这道光晕是 phantom 唯一的「阴影」，除它之外系统保持全平。
- 复刻时**瓦片必配色**：网格里每块都要给一个明确的实心色（含深色档），并对每块套上那道统一淡紫光晕。留白底描边卡只是次要内容容器，不是这层招牌网格。

## 4. 深浅编排 dark tiles ← 真站探针实测

- phantom 的「暗」是**瓦片级设备，不是整幕**：深色以**单块瓦片**形式嵌进彩色网格——**近黑 obsidian**（约 `#1c1c1c`）与**深紫 aubergine**（约 `#3c315b`）两档，与周围亮糖色瓦片并排，靠单块的明暗跳变制造对比。
- **刻意无满幅暗幕**：真站从头滚到尾没有任何满宽的 aubergine / 近黑通栏区段——深色始终被收在瓦片边界内。复刻**不要**把 aubergine 铺成整屏 dark hero 或「明暗段落交替」，那会改掉 phantom 的体量感；深色只作糖果货架上偶尔的一两块深色格子。
- 深色瓦片上的文本走近白（on-dark），与浅色瓦片共存于同一行网格里——这一半要主动写全，别只给浅色瓦片配色。

## 5. 字形与品牌设备 type & brand device ← 真站探针实测

- 标题走**低语权威**：超大 display（可达 96px）配**紧负字距**，字重**始终不加粗**（永不 600+）——靠尺寸与留白拿气场，不靠加粗喧哗。加粗即破功。
- **刻意无斜体**：标题里没有任何 `<em>` / 斜体强调设备（区别于某些站「一句一处斜体」）；强调交给尺寸跳档、留白与品牌吉祥物，而非字形倾斜。
- **ghost 吉祥物**是招牌品牌设备：一只幽灵吉祥物**内联替换标题里的一个元音**（以淡紫 periwinkle 渲染），在克制的排版里制造一处俏皮识别点。它是**内容资产**——本层只记「换元音位、内联、淡紫渲染」，不记具体图形。

## 6. 刻意拒绝 refuses（复刻时主动不做）← 真站实测

> 站的身份也由它**拒绝什么**定义。这些是「刻意无」，复刻时必须**主动不做**。

- **无渐变 mesh / 颗粒 / 纹理 / 背景图**铺底——画布永远是那层平面淡紫；氛围来自色相，不来自图层材质。
- **无毛玻璃 / 背景模糊 / 混合模式**——系统全平，唯一的「光」是每块瓦片那道 4px 淡紫环境光晕。
- **无满幅暗幕**——深色只作单块瓦片，绝不铺成整屏 dark 段落或明暗交替。
- **无图像滤镜 / 灰化**——除 hero 视频外不堆图；吉祥物永远平涂淡紫、内联于文字。
- **不加粗、不斜体**——字重恒轻、无斜体强调；强调靠尺寸与留白。
- **圆角不收硬**——瓦片 24px、导航 / 按钮 / 标签走 100px 胶囊；世界是柔软的药丸与胶囊，不用尖角。
