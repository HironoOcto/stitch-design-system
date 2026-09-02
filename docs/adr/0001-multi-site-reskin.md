# 多站换肤走"构建时切"，不走"运行时切"

一个网站一套风格、各自独立部署，每次构建只烤进一套主题（B 方案）；不采用同一部署内所有主题共存、靠 `[data-theme]` 运行时切换的 A 方案。架构 = **角色契约（contract.css，插座）+ 每站 adapter.css（转接头，把该站值绑到角色变量）+ 每站 rules.md（规则）**；换站只换 adapter/rules，组件与契约零改动。

## Considered Options

- **A（运行时切）**：需 primitives + 语义两层 + theme×token 矩阵 + 生成器。复杂度高，只有"同部署内用户点开关切换"才需要。
- **B（构建时切）← 采用**：本质是"单套主题 × N 个站"，单套能跑多套就能跑，复杂度低。

## Consequences

当出现"同部署内运行时切风格"或"站数爆炸 / 要接 Figma Token Studio"信号时，再升级到 A 方案（DTCG JSON + Style Dictionary）。在此之前手写 adapter/rules 成本最低。
