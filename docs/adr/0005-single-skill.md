# 全系统只有一个 skill

`skills/stitch-design-system/` 是唯一的 skill，任一时刻只呈现**一套**主题。**不做 per-site skill**（不给每个站各生成一个 skill）。

> **[ADR 0010](./0010-consume-time-theme-choice.md) 细化了「哪套」的决定权**：本 ADR 原文假设「嵌入当前生效那套 = 发布时 `build:skill` 烤入的单套，换主题重跑重烤」。0010 起，`build:skill` 为**每个可发布站**各备一套预置（`references/theme-presets/<站>/`），「哪套生效」由**消费项目**的 `stitch.config.json` 指针在 skill **被读时**解析（无指针回落发布默认）。**不变式不破**：仍是唯一 skill、任一时刻仍单套——变的只是「哪套」从发布时定改为消费时定。

## Consequences

`sites/*` 是主题管理库（管理多套候选主题）。skill 里主题相关的值只存在于 `references/`（预置全备后为 `references/theme-presets/<站>/`），散文文件一律引用它、不内联，以保证换主题时骨架散文零改动（0010 起换主题 = 改消费项目指针，skill 文件本身零变化）。
