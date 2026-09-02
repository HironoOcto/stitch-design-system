# stitch 设计语言

stitch-design-system 的设计语言文档。组件与页面只读角色变量 `var(--stitch-*)`；
逐组件像素/state 的真相在源码，逐组件 API 在 skill 的 references/components。

- [全局设计规则 design-rules.md](./design-rules.md) — 与皮肤无关的工程纪律（跨站恒定）
- [多站换肤架构 multi-site-theming.md](./multi-site-theming.md) — 角色契约 + 每站 adapter/rules
- 角色契约正本：[../../packages/tokens/contract.css](../../packages/tokens/contract.css)

## 全库导出清单

（构建阶段随组件落地后补：组件族 → 成员，与 skill 的 catalog 同源。）
