# steep — 合成层（composition）

<!-- trace: 真站探针实测 https://steep.app/ ，2026-09-17，视口 1440px，覆盖面 = 首页整屏（滚到底触发懒加载）。
     首页是本站唯一被断言的合成层面（source/DESIGN.md 开篇即 "The page…"，为首页 style reference，对子页零合成层断言）→
     首页覆盖 = 覆盖全部断言面；下表结论均由首页正命中支撑（零 UNGROUNDED）。
     探针 counts：imgs 96 / svgs 35。列 = 合成层特征 | 探针实测（桶·值·幅面·位置） | DESIGN.md 现状 | 缺陷 | 判断依据·归宿。

| 合成层特征 | 探针实测 | DESIGN.md 现状 | 缺陷 | 判断依据·归宿 |
|---|---|---|---|---|
| 位图氛围铺底 | backdrop_raster `bg-home.jpg` (1440×1440, top -37) + `bg-ai-section.jpg` (1400×1217, top 7780)；backdrop_gradient `linear-gradient(in oklab, rgb(247,247,248)→rgb(255,255,255))` 1440×1480 top 0；blend `overlay` 1440×1480 top 0 | DESIGN.md:200「No photography, no illustration, **no abstract graphics**」；无氛围铺底章节 | WRONG + MISSING | 多图层+混合，单值不可表达 → 可单值化的铺底基色进契约新槽 `--stitch-backdrop-*`；图层结构进 rules.md 编排 |
| 颗粒叠层 | overlay_texture `data:image/svg+xml … feTurbulence` 1440×1480 top 0 | 无颗粒/纹理记载 | MISSING | 可单值化的噪声底 → 契约新槽 `--stitch-backdrop-texture`；叠法进 rules.md |
| 局部混合装饰 | blend `multiply` 480×480 top 5354 | 无 | MISSING | 构图/图层编排 → rules.md |
| 暗幕（明暗节奏） | dark_region `rgb(18,18,18)` L=0.07, 1440×1517, top 6024（AI 区）；顶部 backdrop_gradient 白→透明渐隐 `rgba(255,255,255,0)→.1` 同幅面 | DESIGN.md:4 头部写死「Theme: light」；无暗幕规格 | WRONG + MISSING | 出现节奏/位置 → rules.md；暗幕底色可单值化 → 契约新槽 |
| 浮动卡毛玻璃 + 内高光辉光 | backdrop_filter `blur(16px)` + shadow_glow `oklab(≈white / 0.3) 0 1px 1px inset`，`div.pointer-events-auto` 384×158 top 718；nav backdrop_filter `blur(2.71px)` 1440×64 top 0 | DESIGN.md:140 Floating Artifact 仅「subtle box-shadow」；:122-125 Nav Link「whisper-quiet — no background, no shadow」 | MISSING（毛玻璃/背景滤镜）+ WRONG（nav 实为磨砂半透明） | 可单值化 → 契约新槽 `--stitch-glow-*` / `--stitch-backdrop-blur` |
| 缩放·错位拼贴 | transform `scale(≈0.86)` (1031×310 top 220 / 1028×754 top 694) + `scale(0.8)` img (384×384 top 5402)；filter `drop-shadow(rgba(0,0,0,.1) 0 9px 7px)` / `drop-shadow(rgba(0,0,0,.15) 0 25px 25px)` 产品图 | DESIGN.md:140 有 10% 影；缩放/旋转/错位拼贴未记 | PARTIAL / MISSING | 构图编排 → rules.md |
| 标题斜体设备 | type_italic `<em>` in H2: "zero chaos" 273×100 top 309 | DESIGN.md:217 示例 prompt 顺带「one italicized phrase」，无 Do / pattern / token | UNDER（未立为设备） | 字形设备 → rules.md（每屏一处斜体短语） |
| 刻意拒绝（留白显式） | 探针无摄影/lifestyle 位图、无 mascot；铺底内容是抽象渐变+颗粒而非实拍照片；桃色不作背景 | DESIGN.md:200 混同「no abstract graphics」把抽象铺底也一并否掉 | 部分 WRONG | Don't 保留 → rules.md（桃色≤1/页·绝不做背景；主体近无彩） |
-->

> 本层记 steep 的**合成层**——单个变量换肤跟不了、要多图层 / 定位 / 滤镜 / 混合才成立的那部分长相：氛围铺底、明暗幕、辉光·毛玻璃、缩放拼贴、字形设备与刻意拒绝。值层见同目录 `tokens.css`；组件规格见同预置 `rules.md`。

## 氛围铺底 ← 真站探针实测

steep 的暖纸画布不是平涂的死白。首页整屏铺着一层**位图氛围底**：一张满出血、绝对定位在内容之后的柔和渐变位图打底（暖白到纯白，在 oklab 空间过渡），其上再叠一层 SVG 湍流噪声（`feTurbulence`）做颗粒，最后用 `mix-blend-mode: overlay` 把颗粒压回画布——于是白纸有细微的颗粒质感与光晕层次，而不是一块纯色。局部还有以 `multiply` 混合叠上的装饰图形，为构图加一枚暖重音。

复刻要点：铺底是**「渐变位图 + 颗粒噪声 + overlay 混合」三层结构**，不是单一背景色。画布基色随 `--stitch-*` 画布角色变量走，但这套图层叠法本身要照搬——去掉它，steep 立刻掉一层高级感。

## 明暗幕 ← 真站探针实测

steep 主体是亮的暖纸，但页面下部有**一整幕近黑暗场**（底色约 `rgb(18,18,18)`）：AI 区被整块反转成暗区，满宽、上千像素高，另配一张专属铺底位图。暗场与其上的亮区之间用一道自上而下的**白→透明渐隐带**衔接，避免硬切。这是页面节奏的一部分——亮场铺陈叙事，落到 AI 区砸下一幕暗场做重音，视线再回到亮场。

复刻要点：重点区（如 AI 区）整块用近黑底 + 顶部白色渐隐过渡带，而不是全程亮场；暗场是**中性近黑**，不是有色暗调。

## 辉光 · 毛玻璃 · 浮动拼贴 ← 真站探针实测

浮在标题四周的产品卡不止「淡阴影」。招牌的浮动输入卡（composer）是**毛玻璃**：`backdrop-filter: blur(16px)` 让其身后的铺底透上来，再叠一道**内高光辉光**（近白、约 0.3 不透明、`0 1px 1px inset`）勾出玻璃上缘。顶部导航条同样磨砂——一层很轻的背景模糊让它半透明浮在滚动内容上，并非「无背景无阴影」的全透明。

产品卡彼此之间做**缩放与轻微错位拼贴**：约 0.8–0.86 的缩放、带极小旋转与位移，配约 10% 不透明的柔和投影（`drop-shadow`），形成杂志式拼贴而非规整网格。

复刻要点：浮动卡 = `backdrop-filter: blur(16px)` + inset 近白高光；导航磨砂半透明；拼贴件用 `transform: scale()/rotate()` 错位叠放、投影控制在 ~10%。

## 字形设备 ← 真站探针实测

大标题里有一处**刻意的斜体强调**：H2 显示级标题中间一个短语（真站是 "zero chaos"）用 `<em>` 切成斜体。衬线在常规字重下靠斜体、而非加粗来制造重音——这是 steep 的招牌字形设备，成体系而非偶发。

复刻要点：每屏显示/标题级文字保留**一处**斜体短语，斜体不加粗，其余保持正体。

## 刻意拒绝（Don't）← 真站探针实测

- **刻意无摄影 / lifestyle 实拍 / mascot 插画**：铺底虽是位图，但内容是抽象渐变 + 颗粒，不是照片或具象插图；产品视觉一律是浮动 UI 片段的裁切拼贴。
- **唯一的桃色暖调 accent 每页至多一次、绝不做背景铺底**：真站铺底是暖白渐变位图，不是桃色；桃色只留给单张编辑性强调卡。
- **主体保持近乎无彩（除桃 / 棕一对）**：暗幕是中性近黑而非有色暗场，浮动卡的辉光是白色内高光而非彩色辉光——不要引入第三种色相。
