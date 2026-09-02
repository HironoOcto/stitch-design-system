# 接入新站 · 复核清单（可复用）

> 给**复核 agent** 的可执行清单：核 `docs/contributing/onboard-site.md` 产出的一个站的两个产物（`sites/<site>/adapter.css` + `sites/<site>/rules.md`）。**每复核一个站跑一次**，把 `<site>` 换成站名。这是 [onboard-site.md 验收段](./onboard-site.md#执行-prompt复制把-site-全部换成站名) 的可执行展开；映射规则不在此复述，链到 [multi-site-theming §9.4.2 / §9.5.2](../design-system/multi-site-theming.md#942-适配-adaptercss) 正本。

## 你的角色

你**不重做抽取**，只判定产物对不对、把「需人拍板」的项挑出来。复核由**内联标记驱动**：adapter 每行的 `①抽取 / ②派生 / ③需确认` 就是你的复核地图——`①` 抽查即可，`②` 认可判断，`③` 必须逐条给结论。

## 输入（全部打开）

- `sites/<site>/adapter.css`、`sites/<site>/rules.md`（被复核产物）
- `sites/<site>/source/DESIGN.md`（真相源：值/组件规格/Do·Don't 从这里核）
- `packages/tokens/contract.css`（角色契约：`【每站】/【每站·可选】/【派生】/【恒定】` 标记。`【每站·可选】` 槽——字阶 / 间距 / `--stitch-icon-stroke-width`——该站可留空继承默认，留空即无行可核、非漏抽）
- 本站 GH issue（站特有验收点，如「与某站的可见差异」）

## 1 · 结构 Hook（确定性，先跑；不绿直接打回）

```bash
cd stitch-design-system && f=sites/<site>/adapter.css
echo "H1a 无外来站变量:"; grep -nE -- '--color-' "$f" && echo FAIL || echo PASS
echo "H1b var() 全 --stitch-*:"; grep -oE 'var\(--[a-z-]+' "$f" | grep -v 'var(--stitch-' && echo FAIL || echo PASS
echo "H1c 声明全 --stitch-*:"; grep -nE '^\s*--' "$f" | grep -vE ':\s*--stitch-' && echo FAIL || echo PASS
echo "H2 hex 只落在 --stitch- 声明行:"; grep -nE '#[0-9a-fA-F]{3,8}' "$f" | grep -vE ':\s*--stitch-' && echo 见上行需查 || echo PASS
echo "单段 :root:"; echo "开 $(grep -c ':root {' "$f") / 闭 $(grep -c '^}' "$f")"
```

- [ ] H1a/H1b/H1c 全 PASS（无 `--color-*` 等长相变量、无外来前缀）
- [ ] H2 PASS（无写死主题 hex；注释里的 hex 只要与声明同行即可，`①` 行注释可含说明性 hex，参照 `sites/steep/adapter.css` 样例）
- [ ] 单段 `:root`（开 1 / 闭 1）；两文件都在

## 2 · 判断项复核（②/③/多选一/缺CTA —— 本清单的重点）

在 adapter.css 里 `grep -nE '②|③|多选一|需确认'`，对**每一条**给结论：

- [ ] **每个 `②`（派生/判断/多选一）**：读注释里的理由，判「认可 / 改」。常见：某槽 DESIGN 无独立值 → 借了近义值（如 image 圆角借 feature-card）；某槽收敛多档到契约档位。理由站得住即认可。
- [ ] **每个 `③`（需确认）**：DESIGN 里根本没有或自相矛盾，**必须人拍板**。逐条写出你的裁决。
- [ ] **颜色类 `③`（尤其 accent-text / CTA 文字）**：按全局硬规则 §5 **算 WCAG 对比度**再裁，别只看 DESIGN 文字：

```bash
# 用法: node -e '<下面这段>' 或任意工具算 前景 on 背景 的对比度
node -e 'const L=h=>{const c=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=.03928?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2]};const R=(a,b)=>{const x=L(a)+.05,y=L(b)+.05;return(Math.max(x,y)/Math.min(x,y)).toFixed(2)};console.log("fg on bg =",R("#0c0a09","#3ba6f1"),":1")'
```

  - 正文需 ≥4.5:1，大字/图标 ≥3:1。不达标即**建议改到达标前景色**并在结论里写清对比度数字。
- [ ] **缺 accent/CTA**：确认是「判断补」（品牌色每站不同，补合理值 OK），不是漏抽。
- [ ] **反馈色**：确认 adapter **没写** danger/success/warning（走契约稳定层）；若某站写了，除非冷暖极明显且标 `③`，否则打回删除。
- [ ] **派生槽没被硬写**：`accent-hover/active`、`focus-ring`、`*-bg` 等 `【派生】` 不应出现在 adapter（它们在契约里是活表达式，写死即打回）。

## 3 · 可追溯性抽查（不用全核，抽 5 处）

- [ ] adapter 挑 **3 个 `①` 行**，值对回 DESIGN.md 的 Colors / Border Radius / Shadows 表——完全一致
- [ ] rules.md「组件规格」挑 **2 个组件**，对回 DESIGN.md「Components」段——像素/hex 没抄错

## 4 · rules.md 完整性

- [ ] 9 节齐全：一句话风格 / 调色板用法 / 排版规则 / 形状·阴影 / 组件规格 / 布局与留白 / 意象·配图 / Do·Don't /（可选）示例 Prompt
- [ ] 每节标了 DESIGN.md 来源段落；Do/Don't 是**原样搬**该站最硬约束，非泛化

## 5 · 站特有验收（读本站 issue）

- [ ] 逐条核 issue 里的站特有验收点（如「与某站有可见差异：accent/focus …」）——`grep 'stitch-accent:' sites/*/adapter.css` 比对是否成立

## 输出（复核结论）

给一段结论，含：

1. **判定**：`通过` / `需改动`。
2. **必改项**（③ 裁决 + 任何打回）：逐条「文件:行 → 现值 → 建议值 → 理由（含对比度数字）」。
3. **已认可的 ②/判断项**：一行带过，让维护者知道你看过。
4. **抽查记录**：核了哪几行/哪几个组件、是否一致。

> 复核是 playbook 闭环的「人复核」环节（[§9.6 步骤 3](../design-system/multi-site-theming.md#96-接入一个新站的流程)）。你产出结论，不直接改产物——除非维护者授权你按必改项落地。
