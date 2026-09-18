# Seline — 合成层（Composition Layer）

<!-- trace: 维护者追溯（build:skill stripTrace 迁移时剥离本容器 + 各 `←` 尾注，不入发货预置）。
探针对真站跑（首页 https://seline.com/，2026-09-17，视口 1440px，滚到底 scrollHeight 10312；
DESIGN.md 是首页 style reference、只断言首页，结论全为 MISSING/UNDER（正命中）或忠实，零 UNGROUNDED，
故首页覆盖 = 覆盖全部断言面）。列：合成层特征 | 探针实测 | DESIGN.md 现状 | 缺陷 | 判断依据·归宿。
判断依据·归宿参见 emergent-layer-acceptance.md 的「每条信号的归宿」表 + ADR 0013 单槽判据。

| 合成层特征 | 探针实测 | DESIGN.md 现状 | 缺陷 | 判断依据·归宿 |
| --- | --- | --- | --- | --- |
| 分层缩放·旋转 UI 拼贴 | transform matrix 缩放 0.8–0.9 多处 + 旋转（matrix b/c≈0.03–0.14 → 约 2–8°）+ 水平错位（tx 8–90px）；div.scale-90 / div.scale-[0.8] / div.max-w-[300px] 拼贴簇 top2082–3431；rotatedCount=20 | Layout:211「floating dashboard preview overlaps slightly」「centered product visuals」；Mascot:145「peeking from behind cards」——缩放+旋转+错位的多片拼贴未立为设备 | MISSING/UNDER（拼贴编排未记） | 构图编排（缩放/旋转/错位/图层）→ rules.md/本层；截图为内容资产不 tokenable |
| 浮起产品预览软影（唯一抬升） | shadow_elevation img.z-1 1024×571 rgba(0,0,0,0.15) 0 4px 80px；div.max-w-[600px] 600×298 rgba(17,12,46,0.12) 0 12px 45px | Floating Dashboard Preview:132 记 shadow xl 0 12px 45px（值） | 忠实（值层已覆盖，无彩色辉光） | 软影值→契约/值层；「唯一被允许抬升」编排→rules.md |
| 图像材质处理（灰化去彩 + 吉祥物贴纸） | filter grayscale(1)、contrast(0.94)；mascot img url(#live-sticker-outline) drop-shadow(rgba(0,0,0,0.25) 0 2px 4px) | Imagery:207 + Floating Preview:132 记 grayscale(1) contrast(0.94)；Mascot:145 记 outline + drop-shadow | 忠实（DESIGN.md 已覆盖） | 图像滤镜可入 --stitch-image-filter；mascot 内容资产→rules.md 记「怎么处理」 |
| 强调设备 = 高亮 wash（非辉光/斜体） | h* em 零命中（无 type_italic）、shadow_glow 零、type_gradient_text 零；强调走 sky-wash pill 背景 + 蓝字（值） | Highlight Span Pattern:238 详记（sky-wash #c1e1f7 pill + cyan 文本，一句一处） | 忠实 | 单值可表达（bg+text 色）→值层；「一句一处」编排→rules.md |
| 刻意无暗幕 | dark_region 仅 transparent；直查任意尺寸不透明深色 bg = 0 处（623 命中全为 rgba(0,0,0,0)） | Theme:4「light」；Inverted Section #1c1917:196「sparingly」仅列面板/tab（真站首页零绘制暗面） | 忠实（刻意无 → Don't） | 明暗幕出现节奏（此处=零）→ rules.md Don't |
| 刻意无铺底/颗粒/彩色辉光/彩色渐变（内容面） | backdrop_raster 0（rasters:[]）；overlay_texture 仅 24×24 导航图标（非全出血纹理）；shadow_glow 0；backdrop_gradient 仅 1 处 760×242 近白→透明功能性淡出（white→rgba(238,238,238,0.2)） | Don't:186「no gradients, glassmorphism, decorative color washes」；「deliberately flat and paper-textured」 | 忠实（唯一渐变=功能性近白淡出，非彩色 mesh 铺底；玻璃仅见于站 chrome，见下行） | 拒绝清单→rules.md Don't；无 tokenable 铺底槽 |
| 站 chrome 轻磨砂玻璃（sticky 顶栏 + 状态徽章） | backdrop_filter 两处（2026-09-17 重跑，自证 origin=seline.com、innerWidth=1440）：nav.hidden.sticky.top-0 blur(12px) + bg rgba(255,255,255,0.6)（1440×53，position:sticky，display:flex）；div.inline-flex.rounded-sm blur(16px) + bg rgba(231,229,228,0.4)（118×18）。该 nav 为 hidden md:flex，<768px display:none，首跑因 innerWidth 未达 md 漏记 | Don't:186 一句「no glassmorphism」被读作全站绝对否定 | WRONG（玻璃确存在于站 chrome，非「全站无玻璃」） | 站 chrome 编排（半透明白 + ~12px 背景模糊）→ rules.md；模糊值可入 --stitch-backdrop-blur 类槽 |
-->
> 本文件记 seline 那些**单个 token 换不动、需多图层 / 定位 / 缩放拼贴 / 图像滤镜才成立**的长相——铺底氛围、分层缩放拼贴、图像材质、强调设备、刻意拒绝。值层见同目录 `tokens.css`；组件规格见同预置 `rules.md`。**seline 是「暖纸上的极简拼贴」——复刻时最容易漏的不是它有什么华丽层，而是它刻意不做暗幕 / 铺底、内容面不上玻璃（玻璃只留给 sticky 顶栏这类悬浮 chrome），以及那组容易被当成「随手居中」的缩放旋转拼贴。**

## 一句话 ← 概览 + 真站观感

seline 是**暖石灰纸面上的极简拼贴**：铺底**纯平**——无全出血位图、无颗粒纹理、无暗幕；产品截图与功能小卡**缩到 0.8–0.9、带几度旋转与小幅错位**层叠成拼贴，一只**灰阶轮廓吉祥物贴纸**从卡后探出；浮起的主产品预览只靠**一道深而柔的软影**赢得高度；强调收敛为**一处柔蓝高亮 wash**（不靠辉光、不靠斜体）。克制本身就是它的身份。

## 1. 背景氛围 backdrop ← 真站探针实测

- 全站铺在**暖石灰画布**上（读作纸、不是屏白），铺底**纯平到底**——不叠全出血位图、不叠 SVG 颗粒纹理、不铺 mesh 渐变。舞台的「高级感」来自留白与克制，不来自铺底材质。
- 全站唯一的渐变是区块底部一道**近白 → 透明的功能性淡出**（把合作方 logo 墙 / 内容边缘柔化收干），achromatic、极淡，**不是**装饰色 wash。复刻这道淡出时保持无彩、别做成彩色或 mesh。
- 铺底色只承载在角色值上（值层见同目录 `tokens.css`）；本层只钉住「铺底恒纯平」这个构图决定。

## 2. 分层缩放拼贴 floating collage ← 真站探针实测

- 产品截图与功能小卡**不是单张居中平铺**：真站把它们**缩到约 0.8–0.9 尺寸、各带几度旋转（约 2–8°）与小幅水平错位**，多片层叠成一组**拼贴**——像随手叠放的贴纸/卡片，在纯平纸面上造出轻盈的立体与随性。这一层是 seline 最易被复刻成「呆板居中」而丢掉的部分。
- 拼贴簇里各片**深浅一致、无重边框**，靠**缩放差 + 旋转差 + 负位移**拉出前后关系，而非等比网格排版。别把它们对齐成规整方阵。
- **吉祥物贴纸**（灰阶轮廓）常从卡片**后面探出**，自身也带轻微旋转，作拼贴的点睛——一区一只、不重复、不加动效。
- 浮起的主产品预览是**唯一被允许明显抬升**的一层：一道**深而柔的软影**（大扩散、低透明度，约 `0 12px 45px` 到 `0 4px 80px` 量级）让它浮在纸上；内容卡一律**不抢**这道影（内容卡靠 1px 发丝边立结构，不靠阴影）。

## 3. 图像材质处理 image treatment ← 真站探针实测

- 产品截图与合作方 logo 走**灰阶去彩 + 轻降对比**（`grayscale(1)` + `contrast(0.94)` 量级），把界面数据色压成近单色——让它们读作「素材」而非彩色噪声，与页面的单色克制一致。**唯一**保留原彩的是它们承载的产品真实界面色本身（当不灰化处理时）。
- 吉祥物是**仅轮廓的 SVG 贴纸**（非填充插画），加一道**柔和 drop-shadow**（约 `rgba(0,0,0,0.25) 0 2px 4px`）做贴纸式浮起。
- 截图 / logo / 吉祥物都是**内容资产**——每处自备、不进主题值；本层只记「怎么处理」（灰化 + 降对比 + 轮廓 + 软影），不记具体图。

## 4. 强调设备 emphasis device ← 真站探针实测

- seline **不用辉光、不用标题斜体**做强调——真站标题里零斜体、零彩色辉光。
- 强调收敛到**一处高亮 wash**：每条标题里挑一个短语套一层**柔蓝 pill 背景**（sky-wash）+ 蓝色文本，**一句一处、点到即止**，这处承载整条标题的全部彩度预算，其余文字保持近黑。它坐在标题里、绝不进正文段落、绝不上导航项。
- **中文注意**：中文标题照样用「一处柔蓝高亮 wash + 蓝字」承载那处强调，别改用加粗或机械斜切的伪斜体。

## 5. 刻意拒绝 refuses（复刻时主动不做）← 真站实测

> 站的身份也由它**拒绝什么**定义。下面是「刻意无」，复刻时必须**主动不做**——它们是 seline「安静克制」观感的直接来源。

- **无暗幕**：全站不设近黑 / 反色的全出血暗区——真站零绘制暗面，永远暖纸浅底到底（深色只可能藏在产品截图内部，不作页面舞台）。别为了「戏剧对比」插一幕暗区。
- **无位图铺底、无颗粒叠层**：铺底纯平，不加全出血位图或 SVG 噪声纹理。
- **玻璃只给站 chrome、不给内容面**：**内容卡从不用玻璃**——要么硬贴 1px 发丝边、要么靠软影浮起；但**站点 sticky 顶栏（及小状态徽章）盖一层轻磨砂玻璃**：半透明白（约 60% 白）+ 约 12px 背景模糊，让顶栏滚动时透出底下内容却不糊成一片。复刻时把这层玻璃**限定在悬浮 chrome 上**，别蔓延到内容卡或铺底。
- **无彩色辉光**：抬升只用中性软影（低透明度黑），绝不用彩色扩散光晕。
- **无彩色 / mesh 渐变铺底**：全站唯一渐变是那道近白功能性淡出；不引入彩色渐变或 mesh 背景。
- **无标题加粗、无多重高亮**：display / heading 恒 weight 400，靠字号与克制立威、绝不 500/600 加粗；一条标题最多一处高亮 wash，克制就是重点。
