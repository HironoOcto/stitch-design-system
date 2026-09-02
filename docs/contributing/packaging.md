# 打包发布（人工一次性配置，不走 agent 流程）

> **状态：已实现**（虚拟主题模块随 #57、打包卫生 `prepublishOnly` + tarball 冒烟随 #60 落地）。本节描述的配置已在 `packages/react/` 就位（`vite.config.ts` / `vite-plugin-stitch-theme.mjs` / `package.json` 发布字段），下面是其**正本记录**，不是待办清单。
>
> 本节是**人工做的一次性配置**（建库时配一次，之后基本不动），**不是给 agent 的组件流程**——组件写作规范见 [组件源代码规范](./component-authoring.md)。发布操作的分步 runbook 见 [根 README「发布新版本包」](../../README.md#发布新版本包)。

组件库以 **Vite Library 模式 + `preserveModules`** 出包。三条**硬要求**（每条都有下游依赖，漏了会连带出问题）：

1. **`exports` 必须声明 `types` 子路径** —— skill 的"从 `package.json` 的 `types`/`exports` 定位 `.d.ts`"（见 [skill 构建流程](./skill-build-pipeline.md) 的 react-project.md、[组件源代码规范](./component-authoring.md) 的 `.d.ts` 权威）才落得了地；漏了 AI 就读不到真实类型。
2. **`preserveModules: true`（一组件一文件）** —— 按组件 tree-shaking，消费者只为用到的组件付体积；对应"只从包根导入"。
3. **`external` 掉 `react`/`react-dom`/`radix-ui`/`clsx`** —— 不打进 dist：react/react-dom 是 **peer**（用宿主唯一那份，避免两份 React 崩）；radix-ui/clsx 是普通 **dependencies**（随包自动装，见 [组件源代码规范](./component-authoring.md) 依赖约定）。

```ts
// packages/react/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig({
    plugins: [
        react(),
        dts({ include: ['src'], rollupTypes: false }), // 出 .d.ts；preserveModules 下别 rollup 成一坨
    ],
    build: {
        lib: { entry: 'src/index.ts', formats: ['es'] }, // 只出 ESM，现代库够用
        rollupOptions: {
            external: ['react', 'react-dom', 'react/jsx-runtime', 'radix-ui', 'clsx'],
            output: {
                preserveModules: true,        // 一组件一文件 → 按组件 tree-shaking
                preserveModulesRoot: 'src',
                entryFileNames: '[name].js',
            },
        },
    },
});
```

```jsonc
// packages/react/package.json（关键字段）
{
    "name": "@octohirono/stitch-design-system",
    "version": "0.1.0",
    "type": "module",
    "scripts": {
        // 发布前自动跑根 CI（格式/边界/lint/测试/build 全绿才放行）；
        // ci 脚本在根 package.json，故 --prefix ../.. 回到根执行。
        "prepublishOnly": "npm --prefix ../.. run ci"
    },
    "files": ["dist"],
    "sideEffects": ["**/*.css"],            // 只有 CSS 有副作用，防 tree-shaking 误删样式 import
    "exports": {
        ".": {
            "types": "./dist/index.d.ts",   // ← 硬要求 1：skill 靠这条定位类型（types 必须排在 import 前）
            "import": "./dist/index.js"
        },
        "./style": "./dist/style.css"       // ← 对应 skill 里的 import '@octohirono/stitch-design-system/style'
    },
    "peerDependencies": { "react": ">=18", "react-dom": ">=18" },
    "dependencies": { "radix-ui": "^1.6.7", "clsx": "^2" }
}
```

- **`./style` 是"当前主题"的产物**：`contract.css` + 当前 `adapter.css` + 各组件编译样式，**主题在构建时烤进这一份**（换主题重新 `build`，与 [多站换肤架构](../design-system/multi-site-theming.md) 的"构建时切"一致）。
- 版本：`radix-ui@^1.6.7`、`clsx@^2`、`react`/`react-dom >=18`（依赖决策见 [组件源代码规范](./component-authoring.md) 依赖约定）。

## `./style` 的主题 `:root` 怎么进来（Vite 虚拟模块）

上面那份 `vite.config.ts` 只编译组件——组件各自 import 自己的 `.less`（内容是 `var(--stitch-*)`），Vite 收集成 `dist/style.css`。但 **`:root{--stitch-*}` 那部分谁都没 import**：组件只引自己的 less，不引 `contract.css`、更不引 `adapter.css`。少了这一步，`style.css` 里只有一堆无值的 `var()`。

补法：**一个虚拟模块插件**，在 `src/index.ts` 顶部被 import，构建时读 `activeSite` + 合并出 `:root`。合并逻辑**复用 skill 那条构建的 `mergeTokens`**（[skill 构建流程](./skill-build-pipeline.md) §6.2）——包与 skill 共用一份，杜绝漂移（见 [ADR 0007](../adr/0007-active-site-single-switch.md)）。

```ts
// src/index.ts —— 顶部一行，让主题 :root 进 bundle（排在组件 css 前，作默认兜底）
import 'virtual:stitch-theme';
export * from './components';
```

```ts
// packages/react/vite-plugin-stitch-theme.ts
import { readFileSync } from 'node:fs';
import { mergeTokens } from '../../scripts/lib/merge-tokens.mjs'; // 与 build:skill 同一份
const VID = 'virtual:stitch-theme';
export function stitchTheme() {
    return {
        name: 'stitch-theme',
        resolveId: (id: string) => (id === VID ? '\0' + VID : null),
        load(id: string) {
            if (id !== '\0' + VID) return null;
            const { activeSite } = JSON.parse(readFileSync('stitch.config.json', 'utf8'));
            // 合并出单份 :root（adapter 覆盖 contract、派生 color-mix 原样保留）
            return mergeTokens(
                'packages/tokens/contract.css',
                `sites/${activeSite}/adapter.css`,
                activeSite,
            );
        },
    };
}
```

把 `stitchTheme()` 加进 `vite.config.ts` 的 `plugins`。换主题 = 改 `stitch.config.json` 的 `activeSite` 重新 `build`；组件产物不变，只 `dist/style.css` 的 `:root` 变。CSS 自定义属性是全局的，`var()` 不受 `:root` 与组件规则的先后影响，故顺序无需纠结——`mergeTokens` 内部已保证 adapter 覆盖 contract 并输出单份 `:root`。

## 发布前的两道闸（打包卫生 + 本地冒烟）

发布到 registry 前，两件事本地先自证——都**不联网、不发布**：

1. **`files` 白名单只发 `dist`**：`files: ["dist"]` 决定 tarball 内容；npm 另外恒含 `package.json` / `README` / `LICENSE`（有则含）。跑 `npm pack --dry-run`（在 `packages/react/`）核对清单——**只应有 `dist/**` + `package.json` + `README.md`**，绝无 `src/`、测试、`.less` 源。白名单漏配会把源码/内部文件一起发出去。
2. **一次性 tarball 冒烟**：`npm pack` 出 `.tgz` → 装进一个一次性 scratch app（`npm i ./stitch.tgz` + `react`/`react-dom`）→ `import { Button } from '@octohirono/stitch-design-system'` 过 `tsc --noEmit`（证 `.d.ts` 经 `exports.types` 解析得到）+ `import '@octohirono/stitch-design-system/style'` 解析到带当前主题 `:root` 的 `dist/style.css`（证 `exports["./style"]` 与主题烤入都成立）。这是**消费者视角**的端到端证据，比在库内跑测试更接近真实安装。

`prepublishOnly` 已把根 `npm run ci` 挂在 `npm publish` 前——`npm publish --dry-run` 会触发它但不上传，可用来在本地验证「CI 全绿才放行」这道闸。

