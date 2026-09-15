# Steep — 合成层补充（Composition Layer）

> **DESIGN.md 的补充,不是替代。** `source/DESIGN.md` 是 Refero 下载存档,只记**值槽**(色/字阶/圆角/阴影/间距),对**合成层**(需多图层/定位/滤镜/混合才成立的长相)系统性漏、甚至写反。本文件按 [涌现层验收协议](../../docs/contributing/emergent-layer-acceptance.md) 用 [emergent-probe](../../scripts/emergent-probe.js) 对**真站 `https://steep.app`** 实测产出,是本站合成层的**唯一真相**。
>
> **勘误优先级**：合成层部分,DESIGN.md 与本文件冲突时**以本文件为准**(存档不改)。术语见 [CONTEXT.md](../../CONTEXT.md)「值槽 vs 合成层」。
>
> 探针实测日期：2026-09-15 · 探针版本 v1（静态绘制态 + 滚动懒加载）

## 一句话（合成层）

steep 的长相不止平涂 token——是**分层合成的编辑排版**：每区块一张全出血 **位图 mesh 渐变铺底 + SVG 颗粒叠层**，浮动**产品截图拼贴**环绕编辑衬线大标题，中途插**一幕暗区**，标题**恒 400 衬线 + 一处斜体**编辑强调。缺了这层,复刻出来只剩"平白纸 + 粗宋体",丢掉全部高级感。

## 1. 背景氛围 backdrop 🔴 DESIGN.md 写反

- **实测**：`backdrop_raster` = `bg-home.jpg`(1440×1440, hero)、`bg-ai-section.jpg`(1400×1217, AI 区)——暖桃中心 → 冷薰衣草/蓝边的 **mesh 渐变位图**(非 CSS 渐变);叠 `backdrop_gradient` 极淡 `#f7f7f8→#fff`。
- **颗粒**：`overlay_texture` = `data:image/svg+xml …feTurbulence` 噪声,`mix-blend-mode: overlay` 铺在渐变上——消除 banding 的高级感来源。
- **DESIGN.md 勘误**：:200「No photography, no illustration, **no abstract graphics**」**与真站相反**;:19 的 "warm highlight wash" 只指桃色卡片,非 hero 铺底。
- **归宿建议**：`--stitch-backdrop-hero` / `--stitch-backdrop-section`(值可为 mesh 渐变或位图)+ `--stitch-grain`(颗粒叠层)。→ 契约新槽,换肤跟随。

## 2. 明暗幕 dark act 🔴 DESIGN.md 漏

- **实测**：`dark_region` = `rgb(18,18,18)` L=0.07,1440×1517(top 6024,"Semantic platform" 区);产品截图在暗底上发光。
- **节奏**：全页**一幕**暗区,夹在浅色区块之间作戏剧对比。
- **DESIGN.md 勘误**：头部 `Theme: light` 漏掉这幕;adapter.css:9 也只"兜底"。
- **归宿建议**：`--stitch-bg-inverted`(已有)+ on-dark 文本 + 暗区上产品卡的发光处理,写进 rules.md 的构图节奏。

## 3. 浮动产品拼贴 floating artifacts（含毛玻璃）

- **实测**：浮动卡 `backdrop-filter: blur(16px)` + inset glow(composer 卡毛玻璃);产品图 `filter: drop-shadow(… 0 25px 25px)` + `transform: scale(0.8)` 错位叠放;全页 96 img / 35 svg。
- **DESIGN.md**：有 "Floating Product Artifact"(白卡 20px + 10% 影),但**漏毛玻璃/背景滤镜、缩放错位**。
- **归宿**：截图=**内容资产**,每页自备,不 tokenable;白卡/影/毛玻璃处理进 rules.md。

## 4. 字形设备 type device

- **实测**：标题内联斜体 `<em> "zero chaos"`——编辑式强调设备(一句里一处斜体)。
- **补 DESIGN.md**：display/heading **恒 weight 400**(DESIGN.md 有说但仅散文;demo 曾误渲染 700)。斜体设备 DESIGN.md 只在示例 prompt :217 顺带提,**未立为 pattern**。
- **中文注意**：Signifier 斜体是拉丁字形,中文标题无对应斜体——需以别的编辑手段(字号/留白/一处彩字)替代,不硬套斜体。
- **归宿**：`--stitch-weight-display`(=400)进契约;斜体作为"设备"记进 rules.md。

## 5. 刻意拒绝 refuses（合成层的负空间）

> 站的身份也由它**拒绝什么**定义。这些是"刻意无",不是"漏"——复刻时必须**主动不做**。

- 桃色 blush 一页**≤1 次**,只作编辑点缀,绝不当背景。
- 内容卡(Neutral/Peach)**无阴影**;只有 floating artifact 才有 10% 软影。
- **无彩虹色**——系统 97% achromatic,禁蓝/绿/紫。
- 衬线**不加粗**(不 500/600),斜体只用于一处强调。

## 附：探针实测节选（可复跑）

```
backdrop_raster    : bg-home.jpg (1440×1440), bg-ai-section.jpg (1400×1217)
backdrop_gradient  : linear-gradient(in oklab, #f7f7f8 → #fff) ×2
overlay_texture    : data:image/svg+xml …feTurbulence + blend: overlay
dark_region        : rgb(18,18,18) L=0.07 (1440×1517)
backdrop_filter    : blur(16px) ；shadow_glow: inset —— composer 毛玻璃
filter/transform   : drop-shadow(…) / scale(0.8) —— 产品拼贴
type_italic        : <em> "zero chaos"
_counts            : { imgs: 96, svgs: 35 }
```

复跑：真站滚到底 → 跑 `scripts/emergent-probe.js` → 按验收协议三类缺陷 diff。
