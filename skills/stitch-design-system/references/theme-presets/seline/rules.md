# Seline — 风格规则

> 从 `sites/seline/source/DESIGN.md` 抽取。每节标注来源段落。值层见 `sites/seline/adapter.css`；工程纪律见全局 `docs/design-system/design-rules.md`（跨站恒定，不在此复述）。

## 一句话风格 ← DESIGN.md 顶部 tagline + 概览散文
> Quiet analyst's desk on warm paper —— 编辑感分析工具：暖石纸底 + 单一鲜青为唯一彩色，其余全为中性 stone。
> 几何无衬线标题 weight 400、负字距，克制到「青色 CTA 是全页最响的东西」；扁平白卡靠 1px 发丝线撑结构，克制用一层软影。

## 调色板用法 ← Colors 表(Role 列) + Do/Don't 颜色条 + Quick Color Reference
- **accent（青 #3ba6f1 cyan-signal）**：主 CTA 填充 + 激活链接 + 品牌图标描边。**全站唯一彩色声音，稀用**——一屏最多一个填充青色元素，靠「其余全克制」把它衬成最响。
- **on-accent / highlight（#3398e1 cyan-edge on #c1e1f7 sky-wash）**：headline 内联 highlight span 的专用配色；每条标题恰好一次，落在 value-prop 关键词上。**绝不**进正文段落、绝不进导航项。
- 中性梯：ink-black #0c0a09（标题/强调）、warm-gray #78716c（正文/导航）、ash-gray #a8a29e（弱化/禁用）；边框 stone-border #e8e6e5（主结构）+ stone-muted #d6d3d1（次级）。
- **不新增任何强调色**：整套 = stone 中性 + 一个青。加绿/紫/红即破编辑克制（Don't）。

## 排版规则 ← Tokens—Typography + Do/Don't 字体条
- 标题 **Roobert**（substitute Inter Tight / Satoshi），32px / 52px，**永远 weight 400**——不许为强调跳 600/700；层级靠字号 + 青色 highlight span，不靠加粗。
- 正文/导航/UI/caption **Inter**：主导节奏 **14px / 400 / line-height 1.64**（freq 最高），不许打破；小字用正字距（0.004em）保密集 UI 可读。
- 负字距是招牌：-0.025em@32px、-0.021em@52px、-0.017em@18px。
- **标题绝不用 Inter**、**正文绝不用 Roobert**——混字体即破层级（Don't）。

## 形状 / 阴影个性 ← Spacing & Shapes(Radius/Shadows) + Do/Don't + Elevation
- 圆角：按钮/标签 9999px（药丸）、cards 10px、feature-card / 浮动预览 16px、inputs 6px、icons 4px。
- 阴影**克制**：内容卡靠 1px `#e8e6e5` 发丝线撑结构，**不依赖阴影**；仅浮动 dashboard 预览允许深影（`rgba(17,12,46,.12) 0 12px 45px`，全页唯一一个）。
- 内容卡片可带极淡升起影（`rgba(0,0,0,.05) 0 4px 16px`）——有升起感不压重；**不许对内容卡加重投影**（Don't）。
- **不做**渐变 / 玻璃拟态 / 装饰色晕——刻意扁平、纸质感（Don't）。

## 组件规格 ← Components 段（逐组件, verbatim 抄 DESIGN.md）
- **Primary CTA（filled cyan）**：药丸 9999px，填充 #3ba6f1，1px 边 #3398e1，**字 #0c0a09 weight 500**，padding 8px 16px。全页唯一彩色填充元素，一屏最多一次。
  - 注：DESIGN「Primary CTA」原写白字，但白字 on #3ba6f1 仅 2.65:1 不达 AA；复核裁决采信 Agent Prompt Guide 示例2 的 #0c0a09 黑字（7.44:1 达标）。见 adapter.css `--stitch-accent-text`。
- **Secondary Ghost**：药丸 9999px，透明填充，1px 边 #e8e6e5，字 #0c0a09 weight 400，padding 8px 16px。青 CTA 的安静陪衬。
- **Navigation Link**：无填充无边框，14px Inter/400，色 #78716c，padding 0 12px，height 32px，hover 到 #0c0a09；末尾下拉 caret 内联。
- **Flat Content Card**：白底 #ffffff，10px 圆角，1px 边 #e8e6e5（**边框即结构**，非阴影依赖），24px padding，配极淡 `rgba(0,0,0,.05) 0 4px 16px` 升起影。
- **Floating Dashboard Preview**：16px 圆角，白底，`rgba(17,12,46,.12) 0 12px 45px` 深影（唯一允许 3D 感的卡），内 8px padding；截图加 `grayscale(1) contrast(0.94)` 滤镜。
- **Highlighted Text Span**：#3398e1 文字 + #c1e1f7 药丸底（padding ~2px 8px、radius 4px）；weight 400；每条标题恰好一个，唯一内联彩色。
- **Text Input**：白底，6px 圆角，1px 边 #d6d3d1，placeholder #78716c，padding 4px 12px，focus ring 2px #3ba6f1。
- **Tab Pill Group**：4 个药丸 tab；激活 #1c1917 填充 + 白字 9999px，未激活透明 + #0c0a09 字 + 1px #e8e6e5 边。
- 其余（Avatar Link / Mascot Sticker / Logo Wordmark / Star Rating / Testimonial Card）见 DESIGN.md「Components」原文。

## 布局与留白 ← Layout
- 页宽 max **1200px 居中**，纵向节奏宽松；区块间距 **96px**（编辑式呼吸感，不密集堆叠）；卡片 padding 24px；元素间距 8px。
- Hero：左对齐两行文字 + 单个青色 highlight 短语 → 双 CTA 行（青药丸 + 幽灵药丸）→ 灰度伙伴 logo 行 → star-rating 信任行 → 全宽浮动 dashboard 预览（略微压入下一区块）。
- 导航：极简顶栏——左 logo、居中 nav 链接、右 sign-in + 青 CTA，nav 中部悬浮 avatar 群作社交证明。

## 意象 / 配图 ← Imagery
- **产品 UI 截图为主**：dashboard 预览当摄影处理，`grayscale(1) contrast(0.94)` 滤镜压成单色。「对象（dashboard）即主角」。
- 唯一人物 = 线稿 mascot 贴纸（连帽角色），outline-only SVG + 软 drop-shadow，每区块一次作俏皮配重。
- **无摄影、无生活方式图、无团队照、无环境图**；装饰图标一律 1px 描边 outline（#0c0a09 或 #3ba6f1），**绝不填充**。Logo/品牌字为小号黑色火花/flame 标。

## Do / Don't ← Do's and Don'ts（原样搬，最硬约束）
**Do**
- Roobert 一律 weight 400 做所有 display/heading；强调靠字号 + 青 highlight span，不加粗。
- #fafaf9 作页面底、#ffffff 只作卡面——不许反转（白卡在暖底上，不是反过来）。
- 每条标题恰好一个青 highlight span（#3398e1 字 + #c1e1f7 药丸底）标 value-prop 关键词。
- 卡内用 1px #e8e6e5 边作主分隔；阴影只留给产品预览卡。
- 按钮药丸 9999px + padding 8px 16px；青填充 CTA 是任意屏唯一彩色填充元素。
- 正文 14px Inter/400 line-height 1.64——主导节奏，不许打破。
- mascot 贴纸每区块一次作个性节拍——不重复、不做动画。

**Don't**
- 不新增强调色（整套 = stone 中性 + 一青；加绿/紫/红破编辑克制）。
- 不对内容卡加重投影（16px-blur 浮动预览影全页仅一处）。
- 不用 Inter 排标题（32/52 的 Roobert 才是品牌声）。
- 不用 #ffffff 作页面底（永远 #fafaf9；纯白只归卡面）。
- 主行动不用深色/中性填充（青 #3ba6f1 是唯一正确的填充按钮色）。
- 不加渐变 / 玻璃拟态 / 装饰色晕（刻意扁平、纸质）。
- 一条标题不叠多个青 highlight（每标题最多一个，克制即要义）。

## 示例 Prompt ← Example Component Prompts（给 AI 直接参考）
1. Hero 标题：52px Roobert/400，#0c0a09，line-height 1.12，letter-spacing -1.092px；把 'simple & actionable' 做成 span：#3398e1 字 + #c1e1f7 药丸底。副标 16px Inter/400，#78716c，1.69。
2. Primary Action Button：#3ba6f1 底，#0c0a09 字 weight 500，药丸 9999px，紧凑 pill padding。
3. Feature card：白底 #ffffff，10px 圆角，1px 边 #e8e6e5，24px padding，`rgba(0,0,0,.05) 0 4px 16px` 影；标题 32px Roobert/400 #0c0a09，正文 14px Inter #78716c。
4. Dashboard 预览卡：白底，16px 圆角，`rgba(17,12,46,.12) 0 12px 45px` 影，内 8px padding；加 `grayscale(1) contrast(0.94)` 压成单色。
5. Testimonial：5 个小 ★（#0c0a09）→ 引文 16px Inter #0c0a09 line-height 1.69（内联青 highlight）→ 32px 圆头像 + 名 14px Inter/500 #0c0a09 + 角色 14px Inter #78716c；无卡框，文字直接流在 canvas 上。
