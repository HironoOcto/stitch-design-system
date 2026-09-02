## Seline Analytics

首页：[https://seline.com/](https://seline.com/)

---

## 映射公差记录

> `source/` 是外部下载的 Refero bundle（主力 `source/DESIGN.md`），**原封不动**。契约角色词表（粗、稳定）容不下 DESIGN 的逐元素 hex（细）；差一档且肉眼无感的地方，采信契约角色、记录在此，**不改 `source/`、不新增 per-element 角色**。

原则：**契约角色优先于逐元素 hex；那个 hex 是「公差目标」不是硬规格。** 仅当差异肉眼可见且承载意义（可读性/语义）时，才回到契约层补救（换全局角色或新增被 ≥2 站证明值得的角色），永不逐站硬凑。

### Input 边框：#d6d3d1 → `--stitch-border` (#e8e6e5)

DESIGN.md 自身对输入框边框给了两个值：

- 调色表段：`Stone Border #e8e6e5 — Hairline borders on cards, nav, inputs`（→ inputs = #e8e6e5）
- 组件规格段（Text Input）：`1px border #d6d3d1`

**采信调色表段**：Input 边框映射到 `--stitch-border`（seline 落值 #e8e6e5），与「主结构发丝线」语义、与 Button default 边一致。代价是比组件规格段写的 #d6d3d1 浅 1 个 stone 档——在契约公差内。

> 备选（未采纳）：给输入框单立 `--stitch-border-input` 角色可两站精确还原（seline #d6d3d1 / steep #ececec，无现成角色能同时命中），但为不可见差异给契约词表增肥，不划算。

### placeholder：#78716c → `--stitch-text-muted` (#a8a29e)

DESIGN.md Text Input 段写 placeholder `#78716c`（= 该站 warm-gray / secondary 档）。契约钦定 placeholder = `--stitch-text-muted`（seline 落值 #a8a29e，ash-gray），故组件读它，比规格浅一档。

这是两站里唯一肉眼会显的一处。**接受为当前决定**；若 seline 页面中占位符实际偏虚，正确的杠杆是回头质疑**契约全局**该不该把 placeholder 定成 `text-muted`（也许该定 `text-secondary`），而非逐站补 seline。

## 相关

- 逐组件裁决与迁移账：仓库根 `迁移笔记.md`
- 换肤架构：[docs/design-system/multi-site-theming.md](../../docs/design-system/multi-site-theming.md)