# 运行时依赖只有 radix-ui 和 clsx

组件库的 runtime dependencies 就两个：`radix-ui`（最难做对的无障碍/交互行为——焦点陷阱、下拉、对话框等——由它兜底）和 `clsx`（拼 class）。`react` / `react-dom` 是 **peer**（用宿主唯一那份，避免两份 React 崩）；两个 dependencies 随包自动装、不设 peer（纯工具设 peer 只白给用户加负担）。

## Consequences

消费者只需装 `stitch-design-system` + 提供 react/react-dom；`radix-ui`、`clsx` 自动带入。打包时 `external` 掉这四个，不进 dist。
