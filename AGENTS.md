# stitch-design-system

一套 React + TypeScript 组件库，AI 是一等公民。同一套组件、一套角色契约，构建时切换成不同网站的风格（多站换肤）。

## 冲突时的权威顺序

```
源代码 (*.tsx / *.less / *.config.ts)
   ↓ 高于
AGENTS.md（本文件，仓库规则）
   ↓ 高于
docs/ + skills/（衍生文档）
```

文档与源码不一致时，**源码赢** —— 同一次改动 PR 里必须同步更新文档。

## 三个目录，三种读者

| 目录 | 是什么 | 读者 | 粒度 |
|---|---|---|---|
| `packages/react/src/components/` | 源代码（唯一真相） | 维护者 | 完整实现；逐组件像素/state 只在这里（值只读 `--stitch-*` 角色变量，不写死 hex） |
| `docs/design-system/` | 设计语言规范 | 维护者 / 复刻者 / AI | 设计法则 + 换肤架构（非逐组件像素） |
| `skills/stitch-design-system/` | AI 消费规范 | AI Agent + 使用者 | 精简 API + 使用场景，可独立安装 |

**唯一被允许的刻意重复**：`skills/.../references/components/` 复述 `src/components/` 的 props。其他一切单一来源，靠 link 不靠复述。

## 目录全景

```
packages/tokens/contract.css     角色契约（插座）：组件读的 :root --stitch-* 角色变量，稳定不变
packages/react/                  React 组件库（四件套；只读 var(--stitch-*)）
sites/<站>/                       每站一套长相：source/（Refero bundle 存档）+ adapter.css（值·每站）+ rules.md（规则·每站）
docs/design-system/              设计语言：README.md + design-rules.md（全局规则）+ multi-site-theming.md（换肤架构）
docs/contributing/               维护规范：组件编写、手写新增、同步 CI、打包发布、skill 构建流程
docs/adr/                        架构决策记录
skills/stitch-design-system/     唯一的 skill，嵌当前生效主题
templates/ · demo/               HTML 模板 · 组件库 Demo 站
```

## 术语

领域词汇（角色契约 / 插座 / 插头 / 转接头 / adapter / contract / DESIGN.md …）见 [CONTEXT.md](./CONTEXT.md)。

## 硬规则

组件与页面**只读角色变量** `var(--stitch-*)`，禁止读某站长相变量或写死 hex；图标走 `<Icon>`，禁 emoji / 裸 SVG / Unicode 符号。完整全局规则见 [docs/design-system/design-rules.md](./docs/design-system/design-rules.md)。
