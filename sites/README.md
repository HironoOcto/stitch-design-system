# sites

每个站一套长相。一个站的所有产物聚在 `sites/<站>/` 下：

- `source/` —— 该站 Refero bundle 存档（主力 `DESIGN.md`）。**外部下载资源，原封不动**。
- `README.md` —— 站点说明。来源标记（站名/官网）随 bundle 下载、已从 `source/` 挪到站根；映射公差记录等我们写的内容追加在后。
- `adapter.css` —— 把该站值绑到角色变量的静态 `:root`（steep 已有样例，其余构建阶段产出）。
- `rules.md` —— 从 DESIGN.md 抽的 Do/Don't + 组件规格（构建阶段产出）。

> **映射公差记录写哪**：`source/DESIGN.md` 是外部件不能动；当契约角色（粗）与 DESIGN 逐元素 hex（细）差一档、需要留裁决说明时，写站根 `README.md`，别改 `source/`。样例见 [seline/README.md](./seline/README.md#映射公差记录)。

架构与接站流程见 [docs/design-system/multi-site-theming.md](../docs/design-system/multi-site-theming.md)。
