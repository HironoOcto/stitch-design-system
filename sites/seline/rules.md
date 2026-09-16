# Seline — 风格规则

<!-- trace: 从 `sites/seline/source/DESIGN.md` 抽取；每节标题 `←` 尾注标来源段落。build:skill 迁移时 stripTrace 剥离本容器与各 `←` 尾注，不入发货预置。 -->
> 值层见同目录 `tokens.css`；工程纪律（跨站恒定，不在此复述）见全局 `design-rules.md`。

## 一句话风格 ← DESIGN.md 顶部 tagline + 概览散文
> 温石纸面上的安静分析师案头：暖石灰底 (#fafaf9) + 单一鲜青点缀，其余全是石灰中性色。
> 编辑感分析——平静、近单色、克制自信；weight-400 大标题以「低语式」权威取代 SaaS 式喧哗，青色 CTA 靠万物克制成为页面最响的声音。

## 调色板用法 ← Colors 表(Role 列) + Do/Don't 颜色条 + Quick Color Reference
- 页面底板（`--stitch-bg-canvas`）：暖石灰 #fafaf9，读作纸而非屏白；永不用纯白当底板。
- 卡片/浮层/输入填充（`--stitch-bg-card` / `--stitch-bg-elevated`）：纯白 #ffffff，默认扁平无影，比底板高一个层级。
- 暗色反色区块（`--stitch-bg-inverted`）：Soot #1c1917，用于反色面板与暗色 tab pill，克制使用。
- 主文字/标题（`--stitch-text-primary`）：Ink Black #0c0a09，带暖调的近黑。
- 正文/导航/次要文案（`--stitch-text-secondary`）：Warm Gray #78716c，暖调中性软化正文。
- 弱化助手文字/图标描边/禁用态（`--stitch-text-muted`）：Ash Gray #a8a29e，可读但退居其次。
- 主结构线（`--stitch-border`）：Stone Border #e8e6e5，1px 发丝，是卡片/导航/输入的**首要结构装置**，非分隔线。
- 次级边框/淡背景色/装饰分隔（`--stitch-border-strong`）：Stone Muted #d6d3d1。
- 强调/主行动（`--stitch-accent`）：Cyan Signal #3ba6f1，页面唯一的色彩之声，稀用以让操作「像被点亮」。
- 轮廓操作边框/链接标签/轻量交互强调：Cyan Edge #3398e1；**不得**提升为主 CTA 填充色。
- 高亮衬底（`--stitch-bg-accent`）：Sky Wash #c1e1f7，高亮文字 span 背后的柔和青色洗。
- 用量铁律：整套调色板 = 石灰中性 + 一支青；每屏 CTA 青色填充最多一次；不引入绿/紫/红等新强调色。

## 排版规则 ← Tokens — Typography + Do/Don't 字体条
- 显示/标题（`--stitch-font-display`）：Roobert（替代 Inter Tight / Satoshi），几何无衬线，紧负字距。
- 正文/导航/UI/说明（`--stitch-font-body`）：Inter，非显示文案的中性主力。
- 字重策略：Roobert 所有显示与标题尺寸**永远 weight 400**——不为强调升到 600/700，靠尺寸与青色高亮 span 制造层级；Inter 提供 400/500/600。
- 字距：标题走紧负字距——32px 时 -0.025em（-0.8px）、52px 时 -0.021em（-1.092px）、18px 时 -0.017em；小号 UI 走正字距 0.004em 保持密集文字可读。
- 主导正文节奏：14px Inter weight 400、行高 1.64——UI 主旋律，不可打破。
- 字阶：caption 10px/2.3；body-lg 16px/1.69/0.048px；subheading 20px/1.2/-0.1px；heading-sm 32px/1.25/-0.8px；display 52px/1.12/-1.092px。
- 禁忌：标题不得设为 Inter；混字体破坏层级。

## 形状 · 阴影个性 ← Tokens — Spacing & Shapes + Do/Don't
- 基准单位 4px，密度 compact。间距梯：4 / 8 / 12 / 16 / 24 / 32 / 40 / 48 / 64 / 80 / 96 / 160px。
- 圆角按元素分（`--stitch-radius-*`）：按钮与标签药丸 9999px；卡片 10px；输入 6px；图标 4px；feature 卡 16px。
- 阴影克制度：内容卡片主要靠 1px #e8e6e5 边框立结构，边框即结构；阴影只留给产品预览类卡片。
  - 内容卡片轻抬升（`--stitch-shadow-sm`）：rgba(0,0,0,0.05) 0px 4px 16px 0px。
  - 浮动仪表盘预览（`--stitch-shadow-lg`）：rgba(17,12,46,0.12) 0px 12px 45px 0px——全页唯一允许 3D 悬浮感的元素。
  - 小图标/装饰 chip：rgba(0,0,0,0.1) 0px 4px 6px -1px, rgba(0,0,0,0.1) 0px 2px 4px -2px。
  - 导航/按钮发丝：rgba(0,0,0,0.05) 0px 1px 2px 0px。
- 图标描边（`--stitch-icon-stroke-width`）：发丝 1px 轮廓风格，色用 #0c0a09 或 #3ba6f1，从不填充。

## 组件规格 ← Components 段（逐组件像素规格 verbatim）
- **Primary CTA Button（填充青）**：药丸 9999px，填充 #3ba6f1，1px 边框 #3398e1，文字 weight 500，padding 8px 16px。页面唯一色彩填充元素，每视口最多一次。填充青上用 #0c0a09 黑字，7.44:1 达标 AA；白字仅约 2.65:1 不可用。
- **Secondary Ghost Button**：药丸 9999px，透明填充，1px 边框 #e8e6e5，文字 #0c0a09 weight 400，padding 8px 16px。青色 CTA 的安静伴侣。
- **Navigation Link**：无填充无边框，14px Inter weight 400，色 #78716c，padding 0 12px，height 32px，hover 到 #0c0a09；下拉 caret 内联于末尾。
- **Signed-in Avatar Link**：24px 圆形，2px 环偏移，-8px 重叠间距，内联于导航项间作社群佐证；真实照片，无边框。
- **Flat Content Card**：白 #ffffff 填充，10px 圆角，1px 边框 #e8e6e5（不依赖阴影），24px padding；柔和阴影 rgba(0,0,0,0.05) 0px 4px 16px 0px 加抬升不加重量，边框即结构。
- **Floating Dashboard Preview**：16px 圆角，白填充，阴影 rgba(17,12,46,0.12) 0px 12px 45px 0px——唯一允许悬浮/3D 的卡片；内部 8px padding 让仪表盘 UI 落在框内；应用 grayscale(1) contrast(0.94) 滤镜制造静音产品摄影感。
- **Highlighted Text Span**：文字 #3398e1 配柔和 #c1e1f7 药丸背景高亮（词后药丸底），weight 400。唯一内联色彩处理，每条标题各得一个。
- **Text Input**：白填充，6px 圆角，1px 边框 #d6d3d1，占位符 #78716c，padding 4px 12px；聚焦环 2px #3ba6f1；极简，与标签内联。
- **Mascot Sticker Illustration**：灰度插画配 drop-shadow 滤镜（rgba(0,0,0,0.25) 0px 2px 4px），仅轮廓 SVG；每节用一次，作单色数据 UI 的俏皮配重。
- **Logo Wordmark**：小型黑色火花/焰形字符 + 'Seline' 字标，Inter weight 500、14px、#0c0a09；紧凑，居导航左侧。
- **Star Rating Display**：五枚小星字符，#0c0a09（或暖灰），与平台名内联于 14px Inter #78716c；无卡片外壳，内联于文案流。
- **Testimonial Card**：无卡片外壳；星行（★ #0c0a09）、16px 引文 #0c0a09 内含强调短语的内联青色高亮、32px 头像圆 + 姓名（14px weight 500）+ 角色（14px #78716c）；元素间垂直间距 16px。
- **Tab Pill Group**：仪表盘预览底部 4 个药丸 tab 横排。激活：#1c1917 填充、白字、9999px 圆角；未激活：透明、#0c0a09 文字、1px #e8e6e5 边框；切换上方仪表盘视图。

## 布局与留白 ← Layout
- 页面 max-width ~1200px 居中，垂直留白充裕；区块间距宽（section gap 96px）营造编辑式节奏而非密集堆信息。
- 卡片 padding 24px，元素间距 8px。
- Hero：左对齐两行文字块，含单一青色高亮短语（如 'simple & actionable'），下接双 CTA 行（青药丸 + ghost 药丸），再灰度伙伴 logo 行，再星级信任行，再全宽浮动仪表盘预览（略微叠入下一区块）。
- 折叠线下：交替单列证言行以 2 列栅格排布，再全宽特性区（左对齐文字 + 居中产品视觉）。
- 导航：极简顶栏——logo 左、导航链接居中、登录 + 青色 CTA 右，导航中部悬浮头像簇作社群佐证。

## 意象 · 配图 ← Imagery
- 视觉语言以产品 UI 截图为主导——仪表盘预览当作摄影处理，施 grayscale(1) contrast(0.94) 滤镜把数据色静音为单色。
- 唯一人形是轮廓 SVG 线稿吉祥物贴纸（戴兜帽角色），每节放一次作分析内容的俏皮配重，配柔和 drop-shadow 出贴纸质感。
- Logo 与品牌字符是小型黑色火花/焰形标记。
- 无摄影：无生活方式、无团队照、无环境图；对象（仪表盘）本身即主角。
- 所有装饰图标为 1px 描边轮廓风格，色取 #0c0a09 或 #3ba6f1，从不填充。

## Do · Don't ← Do's and Don'ts
### Do
- Roobert 所有显示与标题尺寸用 weight 400——绝不为强调升到 600/700，靠尺寸与青色高亮 span。
- #fafaf9 作页面底板、#ffffff 仅作卡片面——永不反转（白在石灰上，非反之）。
- 每条标题恰好一个青色高亮 span（#3398e1 文字 + #c1e1f7 药丸底），标注价值主张关键词。
- 卡片内以 1px #e8e6e5 边框作主结构分隔——阴影只留给产品预览卡。
- 按钮保持药丸（9999px）配 8px 16px padding——青色填充 CTA 须是任一屏唯一的色彩填充元素。
- 正文设 14px Inter weight 400 行高 1.64——主导 UI 节奏，不打破。
- 吉祥物贴纸每节出现一次作个性节拍——不重复、不做动画。

### Don't
- 不引入新强调色——整套 = 石灰中性 + 一支青；加绿/紫/红破坏编辑式克制。
- 不在内容卡上用重 drop shadow——16px-blur 浮动预览阴影全页仅留给一个元素。
- 不用 Inter 设标题——32px/52px 的 Roobert 才是品牌之声，混字体破坏层级。
- 不用 #ffffff 作页面底板——永远 #fafaf9；纯白只属于抬升的卡片面。
- 主行动按钮不填充暗色/中性色——青色 #3ba6f1 是唯一正确的填充按钮色。
- 不加渐变、玻璃拟态、装饰性色洗——设计刻意扁平、纸质。
- 一条标题里不叠多个青色高亮 span——每条最多一个，克制即要点。

## 示例 Prompt ← Example Component Prompts
1. Hero 标题：52px Roobert weight 400，#0c0a09，行高 1.12，字距 -1.092px；把短语 'simple & actionable' 内联为 span，#3398e1 文字 + #c1e1f7 药丸背景高亮。副标题 16px Inter weight 400，#78716c，行高 1.69。
2. Primary Action Button：#3ba6f1 背景，#0c0a09 文字，9999px 圆角，紧凑药丸 padding；主 CTA 用此填充处理（黑字 7.44:1 达标 AA）。
3. Feature card：白 #ffffff 填充，10px 圆角，1px 边框 #e8e6e5，24px padding，阴影 rgba(0,0,0,0.05) 0px 4px 16px 0px；标题 32px Roobert weight 400 #0c0a09，正文 14px Inter #78716c。
4. Dashboard preview card：白填充，16px 圆角，阴影 rgba(17,12,46,0.12) 0px 12px 45px 0px，内部 8px padding；施 CSS 滤镜 grayscale(1) contrast(0.94) 把仪表盘静音为单色。
5. Testimonial block：5 枚小 ★ 星行 #0c0a09，引文 16px Inter #0c0a09 行高 1.69 含强调短语的内联青色高亮 span，下置 32px 圆形头像配姓名 14px Inter weight 500 #0c0a09 与角色 14px Inter #78716c；无卡片外壳，文案直接流于底板。
