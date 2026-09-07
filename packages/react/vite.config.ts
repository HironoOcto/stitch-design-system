import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { stitchTheme } from './vite-plugin-stitch-theme.mjs';
import { stitchDts } from './vite-plugin-stitch-dts.mjs';

// 组件库出包（`npm run build` → `vite build packages/react`，root=packages/react）。
// Vite Library 模式 + preserveModules（一组件一文件，按组件 tree-shaking）。
// 硬要求见 docs/contributing/packaging.md。
//   · stitchTheme() 把当前主题的单份 :root 灌进 style.css（虚拟模块）。
//   · stitchDts()   preserveModules 下逐组件出 .d.ts（原生 tsc emit）。
export default defineConfig({
  plugins: [react(), stitchTheme(), stitchDts()],
  build: {
    // 不压 CSS：style.css 承载主题 :root，需原样保留 mergeTokens 的产物——
    // `DO NOT EDIT` 头（H4）、派生 color-mix() 不被求值、hex 不被改写。
    cssMinify: false,
    lib: {
      entry: 'src/index.ts',
      formats: ['es'], // 只出 ESM
      cssFileName: 'style', // → dist/style.css（对应 exports["./style"]）
    },
    rollupOptions: {
      // react/react-dom 是 peer；radix-ui/clsx/recharts + 日历用的 react-day-picker/date-fns
      // 是显式例外 deps（见 ADR 0002）——连同各自子路径（react-dom/client、react/jsx-runtime、
      // radix-ui/*、recharts/* 等）都 external 掉、不打进 dist（消费者随 dependencies 自动装、去重）。
      external: (id) =>
        /^(react|react-dom|radix-ui|clsx|recharts|react-day-picker|date-fns)(\/|$)/.test(
          id,
        ),
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      },
    },
  },
});
