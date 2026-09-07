# Stitch 全局设计规则（与皮肤无关，所有站通用）

> 这些是与皮肤无关的跨主题通用规则。品牌长相（颜色/圆角/字重/阴影）不在这里——那在每站 rules.md。

## 硬规则

1. 只用角色变量，不硬编码主题值
   - ❌ `color:#17191c;` / `border-radius:24px;` / `font-family:'Signifier';`
   - ✅ `color:var(--stitch-text-primary);` / `var(--stitch-radius-card)` / `var(--stitch-font-display)`
   - 例外：非主题的结构值（`z-index`、`1px` 发丝线、布局 `%`）可写字面量。

2. 不读某站的长相变量（换站即失效）
   - ❌ `var(--color-blush-peach)`
   - ✅ `var(--stitch-bg-accent)`

3. 图标用 `<Icon>`；不用 emoji、不内联 `<svg>`、不写 Unicode 符号
   - ❌ `<span>🌊 Beach</span>` / 裸 `✓ ✕ →` / 手写 `<svg>` / 第三方图标库
   - ✅ `<Icon name="..." />`；纯装饰用 CSS/HTML
   - 例外（数据可视化）：图表经 `recharts` 输出的 SVG 数据几何（线/柱/扇/坐标轴）属**受认证例外**——它画的是数据，不是图标；但**图标仍走 `<Icon>`、颜色只读 `var(--stitch-*)`**（系列色接 `--stitch-cat-*`，见 ADR 0002 例外依赖）。

4. 动效缓动统一
   - ❌ `transition:all .3s ease;` / 时长 >0.35s 或 <0.15s
   - ✅ `transition:<prop> var(--stitch-motion-duration-base) var(--stitch-motion-ease);`

5. 无障碍对比达 AA
   - 正文 ≥4.5:1，大字/图标 ≥3:1；反馈色是稳定层已达标，别在某站覆盖成不达标值。

6. 配色比例 60-30-10
   - 一个版面里：主色约 60% + 次色约 30% + 强调/点缀约 10%（点缀永远是点缀，不喧宾夺主）。
   - 这是"怎么用主题的几个色去铺版面"的**比例**规则，跟具体色值无关；用主题的 `--stitch-*` 角色去分配这三档，别引入主题外的新色。

7. 焦点环在**任意主题、任意填充**下都可见
   - `--stitch-focus-ring` 派生自 `--stitch-accent`；填充控件（primary Button、checked 的 Switch/Checkbox/Radio）自身也用 accent 铺底，二者**同色** → 只写 `outline: 2px solid var(--stitch-focus-ring)` 会让环隐没进填充色，看着"聚焦不上去"。
   - ❌ `&:focus-visible { outline:2px solid var(--stitch-focus-ring); outline-offset:2px; }`（同色填充上环隐形）
   - ✅ 再叠一层与填充分离的**间隔环**，保证任意站、任意态对比 ≥3:1：
     `box-shadow: 0 0 0 2px var(--stitch-bg-elevated), 0 0 0 4px var(--stitch-focus-ring);`（内圈用背景色把 accent 环与 accent 填充隔开）。
   - 判定：切到每个站，给 primary 按钮 / checked 控件打键盘焦点，环必须清晰可辨（非填充色控件沿用现有 outline 即可）。

## 提交前检查清单
- [ ] 无硬编码主题色/圆角/字体（全走 `var(--stitch-*)`）
- [ ] 无 `var(--color-*)` 等某站原始变量
- [ ] 图标全 `<Icon>`；无 emoji / 裸 SVG / Unicode 符号
- [ ] 过渡用 `--stitch-motion-*`，时长 0.15–0.35s
- [ ] 关键文字对比 ≥ AA
- [ ] 焦点环在填充/同色控件上仍可见（primary 按钮、checked 控件——每站键盘焦点核一遍）
