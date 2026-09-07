# 运行时依赖只有 radix-ui 和 clsx

组件库的 runtime dependencies 就两个：`radix-ui`（最难做对的无障碍/交互行为——焦点陷阱、下拉、对话框等——由它兜底）和 `clsx`（拼 class）。`react` / `react-dom` 是 **peer**（用宿主唯一那份，避免两份 React 崩）；两个 dependencies 随包自动装、不设 peer（纯工具设 peer 只白给用户加负担）。

## Consequences

消费者只需装 `stitch-design-system` + 提供 react/react-dom；`radix-ui`、`clsx` 自动带入。打包时 `external` 掉这四个，不进 dist。

## 显式例外依赖（受控破例，原则不变）

上面「就两个」是**通用件**的地板——radix 兜行为、clsx 拼 class，够绝大多数组件。但少数组件**需要真引擎**（见 [add-new-component §3.3](../contributing/add-new-component.md)）：日历的月份网格/键盘导航、图表的 SVG 几何，手写既不划算也做不对。这类组件按「值当就引那个专用库、登记为显式例外依赖」的判据，逐个做一次依赖决策。

本 ADR 的原则（默认只有 radix + clsx）**不推翻**——只在此登记首批经过决策、受控采纳的例外依赖：

| 依赖 | 供谁 | 为什么需要真引擎 |
|---|---|---|
| `recharts` | 图表族（Line / Bar / Pie） | 图表的坐标系/比例尺/SVG 数据几何是真引擎活，手画不现实 |
| `react-day-picker` | 日历（Calendar / DatePicker，供 #6） | 月份网格、选日期/范围、键盘导航 |
| `date-fns` | 日历（同上） | `react-day-picker` 的日期加减/格式化底座 |

**边界不变**：这些例外依赖与 radix/clsx 同权——普通 `dependencies`（随包自动装、非 peer）、打包时一并 `external` 掉不进 dist（清单见 [packaging.md](../contributing/packaging.md)）。它们只换「结构/行为/几何」，**颜色仍只读 `var(--stitch-*)`、图标仍走 `<Icon>`**（recharts 输出的 SVG 数据几何是 design-rules §3 的受认证例外，见该处）。再要新增例外，同样一件一决策、登记进本表，不是开闸放任第三方库。
