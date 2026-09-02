# 手写新增一个组件

> 长期贡献流程：radix / Ant 都没有的组件，如何从零手写进 stitch。含每个组件的必备清单。

### radix 也没有的（标准件 / 业务件）去哪找结构

这些是连 radix 都没有的件。**外观仍自动来自 `--stitch-*` 契约**,你要解决的只是"结构 + 行为从哪来"。分三种,**别一锅烩**:

| 情况 | 怎么办 | 例 |
|---|---|---|
| **纯 markup 标准件** | **手写**（就是 HTML 标签 + Less，你本来就知道它长啥样；不引依赖）。 | Pagination、Breadcrumb |
| **需要真引擎的** | 一个**依赖决策**:值当就引入那个专用库（`react-day-picker` / `cmdk` / `embla` / `recharts`…，登记为显式例外依赖）;不值当就降级或手写。 | DatePicker、Combobox、Carousel、图表 |
| **业务独有、任何库都没有** | **自己设计**:依据 = 该功能需求 + 站点 `rules.md`（每站规则；模板与说明见 [多站换肤架构](../design-system/multi-site-theming.md)）。 | 你业务专属的面板 |

**「需要真引擎的」→ 用哪个专用库**（都是**运行时依赖**:装了就进依赖清单、下游跟着带;用哪个组件 = 装哪个包,所以每个都是一次"要不要为它破例"的依赖决策。是运行时依赖，不是 Tailwind 那种构建期工具）：

| 专用库 | 是什么引擎 | 哪个组件用 |
|---|---|---|
| `react-day-picker`（+`date-fns`） | 日历:月份网格、选日期 / 范围、键盘导航（`date-fns` 管日期加减 / 格式化） | DatePicker / Calendar |
| `cmdk` | 命令面板:输入即时过滤、上下键选、分组 | Command / Combobox（⌘K 搜索、可搜下拉） |
| `recharts` | 图表:折线 / 柱 / 饼（SVG） | Chart |
| `embla-carousel-react` | 轮播:拖拽、吸附、循环 | Carousel（中后台少用） |
| `react-resizable-panels` | 可拖拽分栏 | Resizable（左右可拉伸面板） |

> **props 从哪来**:Ant 有对应件的(简单如 Pagination、复杂如 DatePicker 都算)都去【参考步骤 · Ant】**借它的 props 清单**(见【六】末，只借 props、不抄码、fetch 便宜别赌记忆);Ant 没有的业务独有件才据功能描述自己设计。(本表讲的是"结构/引擎从哪来",跟"props 从哪来"是两条正交线。)
>
> 注:上表不含"扩已有件"(在 3.2)。

---


---

## 六、新增一个组件的流程（长期 · 纯手写）

**迁移（二）、Radix 预建（四）、扩已有件（五）都是一次性批量，做完即止；本节是长期功能——库上线后每来一个新需求走一次。** 此时前面几批能给的都建好了，新增只剩「手写」：radix 也没有的标准件（Pagination / Breadcrumb…）、需要真引擎的依赖决策件（DatePicker / 图表…，见 3.3）、业务独有件。

**手写手册（每次都读）：**

~~~markdown
# 手写一个组件到 stitch

写法约定统一见 [组件源代码规范](./component-authoring.md)，本手册不重复：
- 写法（四件套 / 实现约定 / 固定骨架 / Less / 测试 / 桶导出）→ [组件源代码规范](./component-authoring.md)
- props 统一约定 + 归一规则 → [组件源代码规范 · props 约定](./component-authoring.md)
- 桶导出 → [组件源代码规范 · 桶导出](./component-authoring.md)
- demo 页 + 注册 → [组件源代码规范 · demo](./component-authoring.md)
- 文档同步 → [同步机制与 CI](./sync-and-ci.md)
- 角色契约（有哪些 `--stitch-*`）→ [contract.css](../../packages/tokens/contract.css)
- 长相规则（交互态 / 圆角 / 阴影 / 动效 / Do-Don't 该长啥样）→ 全局 `design-rules.md`（[design-rules.md](../design-system/design-rules.md)）+ 每站 `sites/<站>/rules.md`（每站规则；模板与说明见 [多站换肤架构](../design-system/multi-site-theming.md)）

## 输入
- 组件名 `X`
- 触发理由：某个真实页面/功能需要它。没页面/功能需要就不建。
- 目标：`packages/react/src/components/X/`

## 手写前先定：props 从哪来、要不要引擎（两个独立问题，别搅一起）
- **props 从哪来**（就看 Ant 有没有对应件，两种）：
  - **Ant 有对应件**（几乎所有标准件——简单如 Pagination / Breadcrumb，复杂如 DatePicker / Combobox / Cascader）→ 走【参考步骤 · Ant】拿到 `_spec.md`（一段 Props interface）。Ant ~80 件基本全覆盖、fetch 便宜，简单件也走，别赌记忆。
  - **Ant 没有 = 业务独有** → 没有现成参照。你手上只有需求方的**功能描述**（做什么用），props 由**你据它设计**——命名 / 形态照 [组件源代码规范 · props 约定](./component-authoring.md) 惯例（Ant v5 风格：`value` / `onChange` / `disabled` / `size`…）、跟库里其它组件一致。把功能翻成 API 就是这步的活，需求方只给功能、不给 props。
- **要不要引擎**（和上面正交，不是二选一）：硬交互件（日历 / 图表 / 轮播 / 可拉伸分栏）= **需要真引擎** → 按本文开头「radix 也没有的（标准件/业务件）去哪找结构」引专用库（`react-day-picker` / `recharts`…），结构 / 行为照它。它的 props 若 Ant 也有（如 DatePicker）照样走【参考步骤 · Ant】拿——两件事各走各的。
- **`_spec.md` 怎么用**：那段 Props interface 直接当对外 props（第 5 步、写 `X.tsx` 的 Props）；键盘 / role / aria **不在**里面——照 [组件源代码规范 · a11y 硬约束](./component-authoring.md) 自己补（见下「手写最容易漏的」+ 第 3 步）。

## 手写最容易漏的（都得自己写）
- **行为 / a11y**：非原生控件补 `role` + `aria-*`、手动接 Enter/Space、focus 管理；有状态件自己写受控/非受控状态机（`value` / `defaultValue`）——清单见[组件源代码规范 · props 约定](./component-authoring.md)。
- **测试**：[组件源代码规范 · 测试](./component-authoring.md) 第 6 维（键盘）+ 第 7 维（可及名）必须覆盖——最容易漏。

## 步骤
1. **建目录** `src/components/X/` 四件套：`X.tsx` / `x.module.less` / `X.test.tsx` / `index.ts`。
2. **定结构 + 写 `X.tsx`**：按上面「手写前先定」定好结构（有 `_spec.md` 就据它的 props 拆 JSX），填进 [组件源代码规范](./component-authoring.md) 的固定骨架，几十行、不引依赖。
3. **行为 / a11y**：照[组件源代码规范 · props 约定](./component-authoring.md) 自己实现（见上「手写最容易漏的」）。
4. **上皮** `x.module.less`：长相照两套规则——全局 `design-rules.md`（[design-rules.md](../design-system/design-rules.md)）+ 站点 `sites/<站>/rules.md`（每站规则；模板与说明见 [多站换肤架构](../design-system/multi-site-theming.md)），token 从契约挑、只写 `var(--stitch-*)`，禁硬编码字面值（站点个性由 adapter 灌值）。
5. **props 命名**：对外 props 照 [组件源代码规范 · props 约定](./component-authoring.md)（有 `_spec.md` 就直接用它那段 interface，已是 Ant v5 名 = 约定要的）。
6. **桶导出**：按[组件源代码规范 · 桶导出](./component-authoring.md) 加进 `packages/react/src/index.ts`。
7. **demo**：按[组件源代码规范 · demo](./component-authoring.md) 建 `demo/components/X/index.tsx` 并注册，`npm run demo` 看效果。
8. **写测试**：按[组件源代码规范 · 测试](./component-authoring.md) 的 7 维度，重点第 6（键盘）+ 第 7（可及名）。
9. **同步文档 / skills**：按[同步机制与 CI](./sync-and-ci.md)。
10. **验收**：先对照本文《七、每个组件必备清单》勾一遍，再 `npm run ci` 全绿（测试 + a11y）；最后照 [demo 平台验收清单](./demo-acceptance.md) 在 demo 上逐条核。
~~~

**参考步骤 · Ant（借 props，不借码）：**

**Ant 有对应件就走这步**——简单如 Pagination、复杂如 DatePicker 都走（fetch 便宜，别赌记忆）。**它只解决一件事：从 Ant 抄这个件该有哪些 props。** 别的——写法 / 命名 / 受控非受控 / a11y / 键盘 / 测试——[组件源代码规范](./component-authoring.md) 全给了，不靠 Ant。而 props 命名权威本就是 Ant v5，所以从 Ant 对应件的 API 表抄 props，直接就是 Props Interface 的内容、天生合规。Ant 没有对应件的（要么「需要真引擎」如可拉伸分栏、要么纯业务独有件），本步给不了 props——走引擎库文档或按功能需求自定，不走本步。为什么"不借码"：Ant v5 走 CSS-in-JS + 自己的 token，我们走 `--stitch-*` CSS 变量，代码搬来既不换肤也跑不通。

~~~markdown
# 参考步骤：Ant 借 props 清单

## 用途
只解决一件事：这个件该暴露哪些 props。别的（写法 / 受控非受控 / a11y / 键盘 / 测试…）组件源代码规范 已规定，不靠 Ant。

## 输入
- 组件名 `X`（Ant 有对应件的那个，如 Pagination / DatePicker / Combobox）

## 产出
`src/components/X/_spec.md`（临时草案，组件写完可删）：一段填好的 Props interface（组件源代码规范的 props 格式），就是下一步写 `X.tsx` 的 Props 来源。

## 步骤
1. **找 Ant 对应件、记 slug**（X 常叫别的名，如 Combobox = Ant 的 AutoComplete）：查 [Ant 组件总表 · llms.txt](https://ant.design/llms.txt)（约 80 件 + 直达链接）按功能 / 中文名搜到 → 记 slug（kebab-case，如 `auto-complete`）。
2. **拉它的 API 表**：`https://ant.design/components/<slug>.md`（例：[divider.md](https://ant.design/components/divider.md)），看 `## API`。
3. **逐个 prop 判「留还是砍」**（看 API 表的**描述列**判：它描述的是"组件对使用者的能力/契约"还是"Ant 内部怎么实现"）：
   - **留 = 能力/契约**：数据、值与回调、状态、能力开关、提示文本——`options` / `value`·`defaultValue`·`onChange` / `disabled` / `allowClear` / `placeholder` / `notFoundContent` 这类。名保持 Ant 原名（props 命名权威 = Ant v5，天生合规）。
   - **砍 = Ant 内部实现**，三种：① 注入 Ant 内部渲染 / DOM 的钩子（描述带 "customize…" / "parent node…"，如 `popupRender` `getPopupContainer` `classNames` `styles`）；② 性能开关（描述是开关内部渲染优化，如 `virtual`）；③ Ant 视觉皮（`variant` outlined/filled… / `bordered`——长相走 `--stitch-*` + 站点 rules，不由 prop 传；语义态 `status`/`disabled` 仍留）。外加标了 **deprecated** 的。
   - **拿不准的**（某 prop 算能力还是私货、某交互算不算核心）→ 别硬砍，留着标一句交人复核。
4. **写进 `_spec.md`**——就这段 Props interface。键盘 / role / aria 不用记（写 tsx 时照 [组件源代码规范 · a11y](./component-authoring.md) 硬约束补）。

## 红线
- 只借 props 名单，不借它的代码 / CSS-in-JS / 内部子组件 / token 变量——不是一套（它 CSS-in-JS，我们 `--stitch-*` CSS 变量），搬来既不换肤也跑不通。
~~~

**附 · 走一遍真实例子（要建 Combobox）：**

~~~markdown
# 附 · 参考步骤走一遍（Combobox）

## 场景
要建 Combobox（可搜索下拉），不确定它该暴露哪些 props。

## step 1 · 找对应件、记 slug
Combobox 在 Ant 里不叫这名，叫 **AutoComplete**。在 [llms.txt](https://ant.design/llms.txt) 按 "自动完成 / AutoComplete" 搜到它 → slug = `auto-complete`。

## step 2 · 拉文档、看 API 表
fetch `https://ant.design/components/auto-complete.md`，翻到 `## API` 的 props 表（下面是真实节选）：

| Prop | Type | 说明 |
|---|---|---|
| `options` | `{label,value}[]` | 候选项 |
| `value` / `defaultValue` | string | 选中值（受控 / 非受控） |
| `onChange` | `(value)=>void` | 选中或输入变化 |
| `onSelect` | `(value,option)=>void` | 选中某项 |
| `showSearch` | boolean | 输入过滤 |
| `allowClear` | boolean | 显示清除按钮 |
| `onClear` | `()=>void` | 点清除 |
| `disabled` | boolean | 禁用 |
| `placeholder` | string | 占位符 |
| `notFoundContent` | ReactNode | 无匹配时显示 |
| `open` / `defaultOpen` / `onOpenChange` | — | 浮层开合（受控 / 非受控 / 回调） |
| `size` | 'small'\|'middle'\|'large' | 尺寸 |
| `status` | 'error'\|'warning' | 校验态 |

## step 3 · 判「留还是砍」
看描述列逐个判「能力 vs Ant 内部」，砍掉这些：`virtual`（"关虚拟滚动" = 性能开关）、`popupRender` / `getPopupContainer` / `classNames` / `styles`（"customize…" / "parent node…" = 注入 Ant 内部渲染 / DOM 的钩子）、`variant`（Ant 视觉皮，长相走 `--stitch-*`）。拿不准的（如 `backfill` 键盘 UX 开关）留着标一句交人。

## step 4 · 写出 `_spec.md`
文件 `packages/react/src/components/Combobox/_spec.md`，内容就是挑完、砍完的 Props interface：
```ts
interface ComboboxProps {
  options: { label: string; value: string }[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onSelect?: (value: string, option: { label: string; value: string }) => void;
  showSearch?: boolean;
  allowClear?: boolean;
  onClear?: () => void;
  disabled?: boolean;
  placeholder?: string;
  notFoundContent?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  size?: 'small' | 'middle' | 'large';
  status?: 'error' | 'warning';
}
```
（键盘 ↑↓/Enter/Esc、role/aria 不写进这里——写 `X.tsx` 时照 [组件源代码规范 · a11y](./component-authoring.md) 硬约束补，不归本步。）

这个 `_spec.md` 就是本步全部产出。
~~~

---

## 七、每个组件必备清单（各手册的「验收」都对照它）

> 本清单是每个手写组件的验收基线。docs 侧无逐组件义务——token 真相在 `contract.css` + `adapter.css`。

**动手前**：
- [ ] **复用优先**：组件本体、demo、内部 markup 里的每个 UI 元素，都不是「内联 style 手搓 / 从零重造」某个已有组件（要按钮用 `Button`、输入框用 `Input`…）；同角色已有 → 复用，近似 → 扩已有件，确无 → 才建（判定标准见 [组件源代码规范 · §3.0 复用优先](./component-authoring.md)）。

**源码侧**（都在 `packages/react/src/components/X/`）：
- [ ] `X.tsx`（React.FC + Props JSDoc + displayName + 参数解构默认值 + className 用 `clsx` 拼）
- [ ] **源码注释边界硬规则**（interface / JSDoc **及 `.less` 分节注释，整个 `packages/react/src`**）：**只写 stitch 语汇的使用约束**；**主题值、迁移溯源（`animal`/源码由来）、他站长相对比、任一站名（含当下 active）一律不进 → 去仓库根 `迁移笔记.md`**。`build:refs` 抽头顶 JSDoc 当 skill 的 component note（**skill 注意事项即源自这段 JSDoc**），漏进越界痕迹会被 `check:skill` §5 与 `check:boundary` 的 `source` 层拦红（定义正本见 ADR 0003）。详见 [组件源代码规范 · Props Interface](./component-authoring.md)。
- [ ] `x.module.less`（分节注释 **无 `animal`/站名/源 hex 溯源**（同 JSDoc，走 `迁移笔记.md`）+ 只读 `var(--stitch-*)` 无硬编码 + 守两套长相规则：全局 `design-rules.md`（[design-rules.md](../design-system/design-rules.md)）——圆角 / 阴影 / hover / active / `:not(:disabled)` / `focus-visible`；站点 该站 `sites/<站>/rules.md`（每站规则；模板与说明见 [多站换肤架构](../design-system/multi-site-theming.md)）——该站 Do/Don't 与形状个性）
- [ ] `X.test.tsx`（[组件源代码规范 · 测试](./component-authoring.md) 的 7 维度 + 中文 it 名 + `getByRole`）
- [ ] `index.ts`（组件桶文件：`export { X }` + `export type { XProps, ... }`）
- [ ] a11y（role / aria-* / 键盘事件 / focus 管理）
- [ ] 有状态件支持受控/非受控双模式：传受控 prop（`value`/`checked`）由父组件管、只传 `default*` 组件自管（详见[组件源代码规范 · props 约定](./component-authoring.md)）

**demo 侧**：
- [ ] `demo/components/X/index.tsx` 建 demo 页 + 四处注册（[组件源代码规范 · demo](./component-authoring.md)；缺任一处页面不可达）

**skill 侧**（同一 PR 更新）：
- [ ] `skills/stitch-design-system/references/components/<category>.md` 里有 `## <Name>` 条目
- [ ] 内容：ts interface（verbatim）+ tsx 用例 + Notes / Do NOT / Not supported
- [ ] 该文件由 `build:refs` 生成、勿手改；跑 `npm run build:refs` 让新组件进对应 `<族>.md`（一族一文件、无行闸）

**总入口**：
- [ ] `packages/react/src/index.ts` 加一双 `export { X }` + `export type { XProps }`

---

