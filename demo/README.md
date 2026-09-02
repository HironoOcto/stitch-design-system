# demo

组件库 Demo 站（构建阶段产出）。每个组件在 `demo/components/<X>/` 有真实用法，
`build:refs` 从这里挑用例写进 skill 的 references/components。

## 启动

在 **`stitch-design-system/`** 目录下（不是仓库根）：

```bash
npm install       # 首次 / 依赖有变时
npm run demo      # 起 Vite dev server（Demo 站）
```

浏览器打开 **http://localhost:5173**，按 hash 路由进单个组件页，如
**http://localhost:5173/#/icon**。改组件源码 / demo 会热更新，无需重启。

- **换肤**：右上角 `site` 选择器切 seline / steep，整站（含侧栏）实时换肤。
- **加一个组件页**：丢一个 `demo/components/<X>/index.tsx`（导出 `meta` + 默认示例组件）即自动上架，导航零改动；文件夹名须与 `scripts/component-families.md` 的成员名对齐（大小写不敏感）。

主题加载（多站切换器：动态发现 + demo 侧作用域化）与三条构建的对接，见
[docs/contributing/demo-site.md](../docs/contributing/demo-site.md)。
