# contributing — 维护规范

维护 stitch 的工程规范（组件怎么写、怎么加、怎么同步、怎么发）。

- [维护 runbook](./maintainer-runbook.md) — 高频操作总入口：加主题站 / 加改组件 / 切生效主题 / 发布 + 命令速查
- [组件源代码规范](./component-authoring.md) — 目录四件套、TSX/Less/测试/桶导出约定
- [手写新增一个组件](./add-new-component.md) — 长期贡献流程 + 每个组件必备清单
- [同步机制与 CI](./sync-and-ci.md) — check:docs、pre-commit、"同步 = 同一 PR"
- [打包发布](./packaging.md) — Vite Library + preserveModules + exports
- [Demo 站](./demo-site.md) — 本地预览 + 多站切换器（动态发现 + 作用域化）+ 用例来源
- [接入新站 playbook](./onboard-site.md) — 可复用流程：`DESIGN.md → adapter.css + rules.md`（每加一站跑一次）
- [skill 构建流程](./skill-build-pipeline.md) — 生成唯一 skill：build:skill / refs / blurb
- [skill 结构验收标准](./skill-acceptance.md) — 结构验收标准：runbook + 9 产物节 + 流程级（check:skill 照此实现）
