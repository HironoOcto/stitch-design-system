# 同步机制与 CI 强制

> 保证源码与 skill 文档不漂移：CI 存在性检查 + pre-commit 钩子 + "同步 = 同一 PR" 硬约定。

### `npm run ci` 八步（#4 立起，结构 Hook **H5**；#33 加 `check:skill`、#59 加 `check:boundary`）

```
format:check → check:docs → check:skill → check:boundary → lint → test:run → test:a11y → build
```

对**空 `packages/react`** 也必须全绿（0 组件 = 天然过），是后续每个组件 issue 的「绿」标尺。各步用的工具：

| 步 | 命令 | 工具 |
|---|---|---|
| `format:check` | `prettier --check .` | Prettier（`.prettierrc.json` / `.prettierignore`；`packages/tokens` 与 `*.md` 不交给它——见 H4 单行 `color-mix`） |
| `check:docs` | `node scripts/check-docs.mjs` | 见下节 |
| `check:skill` | `node scripts/check-skill.mjs` | skill 结构验收（H3），见 [skill 结构验收标准](./skill-acceptance.md) |
| `check:boundary` | `node scripts/check-boundary.mjs` | 自包含边界三层守卫（H1），定义正本见 [ADR 0003](../../docs/adr/0003-knowledge-boundary.md) |
| `lint` | `oxlint && tsc --noEmit`（根 + `packages/react`） | **oxlint**（非 eslint：本仓库用 TS 7，而 typescript-eslint 尚不支持 TS 7.0）+ `tsc` 类型检查 |
| `test:run` | `vitest run --project unit` | Vitest 4（jsdom），跑 `*.test.{ts,tsx}` |
| `test:a11y` | `vitest run --project a11y` | 同一 Vitest 管线 + `vitest-axe`，跑 `*.a11y.test.{ts,tsx}` |
| `build` | `vite build packages/react` | Vite Library + `preserveModules`（见 [打包发布](./packaging.md)） |

组件与测试都经 **`@octohirono/stitch-design-system`** 别名引「真组件」（`vite.config.ts` 的 `resolve.alias` + `tsconfig.json` 的 `paths` 双解析，指向 `packages/react/src/index.ts`）。

### `npm run check:docs` 做什么

自动检查一件事：

1. **组件覆盖**：`src/components/` 里每个组件必须在 `skills/<skill>/references/components/*.md` 有 `## <Name>` 标题（**只查这一处**——`docs/design-system/` 不再维护逐组件文档，见 [AGENTS.md 三个目录](../../AGENTS.md)）

**漂移 → 退出码 1 → CI 失败 → PR 不能合入**。

> **不查行数**：`references/components/*.md` 是**按需读取**的生成物（DO NOT EDIT），一族一文件、不分片（`build:refs` 生成）。行/预算闸只对**常驻入口 SKILL.md** 与**手写文档**有意义——大文件只在 agent 真查那一族时才载入，几百行的 props 参考代价可忽略；强拆一个逻辑族反而把 catalog 的「一族一链」拆坏、让分片够不着。真有族大到该拆，是 [component-families.md](../../scripts/component-families.md) 该拆成两个**逻辑**族的信号（各有正经族名），而非物理切片。SKILL.md 的行/token 预算归 `check:skill`（见 [skill 结构验收标准](./skill-acceptance.md)）。

### 6.2 pre-commit 钩子

`.githooks/pre-commit` 跑完整 `npm run ci`：

```
format:check → check:docs → check:skill → check:boundary → lint → test:run → test:a11y → build
```

**不允许 `--no-verify` 绕过**。

### 6.3 "同步 = 同一 PR" 硬约定

- 改了 Button 的 props → 同一 PR 里改 skill 的 general.md
- 改了 Button 的样式（纯数值） → 只落源码 `.less`（源码即真相，无逐组件 md 要同步）
- 改动触及某条设计法则 → 改 `design-rules.md`；改动触及 token（如新增圆角档位、改主色） → 改 `contract.css` / 该站 `adapter.css`（同一 PR）
- 上述同时发生 → 涉及的都要更新

**没有"先改代码再补文档"这种流程**——该同步的文档漂移就是漂移，CI 拦下。

---

