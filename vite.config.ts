import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { stitchTheme } from './packages/react/vite-plugin-stitch-theme.mjs';

// 一份配置服务两处：
// 1) Demo 站（`npm run demo` / `vite build`）——root = 仓库根，入口 demo/main.tsx。
// 2) 组件测试（`vitest`）——复用同一 vite 转译管线，分两个 project：
//      · unit（test:run） 跑 *.test.{ts,tsx}
//      · a11y（test:a11y）跑 *.a11y.test.{ts,tsx} + vitest-axe 断言
//    两者 extends 本文件，继承 plugins / alias / jsdom / setup。
// 组件库自身出包用 packages/react/vite.config.ts（`npm run build`）。
//
// `@octohirono/stitch-design-system` 别名指向组件库源码包根：demo 与测试都靠它引「真组件」，
// 与 docs/contributing/component-authoring.md §3.7 一致。
export default defineConfig({
  // stitchTheme：src/index.ts 顶部 import 'virtual:stitch-theme'——demo 与测试都经
  // alias 引 src/index.ts，故这里也须注册这个虚拟模块（否则解析不到）。
  plugins: [react(), stitchTheme()],
  server: {
    open: false,
    // 优先用环境分配的 PORT（demo 预览器 autoPort 会注入），否则回落 vite 默认。
    port: process.env.PORT ? Number(process.env.PORT) : undefined,
  },
  resolve: {
    alias: {
      '@octohirono/stitch-design-system': fileURLToPath(
        new URL('./packages/react/src/index.ts', import.meta.url),
      ),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    passWithNoTests: true, // 空库 0 组件时天然过
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['packages/react/src/**/*.test.{ts,tsx}'],
          exclude: ['**/*.a11y.test.{ts,tsx}', '**/node_modules/**'],
        },
      },
      {
        extends: true,
        test: {
          name: 'a11y',
          include: ['packages/react/src/**/*.a11y.test.{ts,tsx}'],
          exclude: ['**/node_modules/**'],
        },
      },
    ],
  },
});
