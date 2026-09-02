# 图标一律走 `<Icon>` 组件

所有图标通过 `<Icon name="…" />` 渲染，**禁止** emoji、裸 `<svg>`、Unicode 符号（`✓ ✕ →` 等）、以及第三方图标库直接内联。纯装饰用 CSS/HTML。

## Consequences

这是全局硬规则之一，写进 `docs/design-system/design-rules.md`，CI/审查会拦。收敛图标来源，保证跨主题一致的图标语义与可替换性。
