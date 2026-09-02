# 全系统只有一个 skill

`skills/stitch-design-system/` 是唯一的 skill，嵌入当前生效的那一套主题。换主题 = 重跑 `build:skill` 重新烤入 theme 快照，skill 的结构/骨架不变。**不做 per-site skill**（不给每个站各生成一个 skill）。

## Consequences

`sites/*` 是主题管理库（管理多套候选主题），同一时刻只有 `activeSite` 那套被嵌进 skill。skill 里主题相关的值只存在于 `references/theme/`，散文文件一律引用它、不内联，以保证换主题时散文零改动。
