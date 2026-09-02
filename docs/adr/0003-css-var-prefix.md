# CSS 变量统一 `--stitch-` 前缀

所有角色变量、组件读取的主题属性一律加 `--stitch-` 前缀（`--stitch-accent`、`--stitch-bg-canvas` …）。目的是命名空间隔离——skill 生成的独立 HTML、被别的项目消费时，不与宿主页面或其它库的 CSS 变量撞名。

## Consequences

角色契约是公开 API：前缀 + 角色名一旦发布，改名即破坏性变更（所有站 adapter 都要跟改）。当稳定接口维护。
