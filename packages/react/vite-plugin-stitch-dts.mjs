// vite-plugin-stitch-dts —— preserveModules 下逐组件出 .d.ts。
//
// 本仓库的 typescript 是原生移植版（TS7 / tsgo，无 JS 编译器 API），vite-plugin-dts
// 依赖经典 `import ts from 'typescript'` 那套编程 API，装不上也跑不起来。故直接调
// 原生 tsc 的 `--emitDeclarationOnly`：一 .ts 源 → 一 .d.ts，天然与 preserveModules
// 的「一组件一文件」对齐。emit 配置在 packages/react/tsconfig.build.json（含
// rootDir=src / outDir=dist / 排除 *.test.*）。
//
// closeBundle 阶段（JS 已写完）跑一次 tsc，把 .d.ts 落进 dist。
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url)); // packages/react/
const tscBin = fileURLToPath(
  new URL('../../node_modules/typescript/bin/tsc', import.meta.url),
);

export function stitchDts() {
  return {
    name: 'stitch-dts',
    closeBundle() {
      execFileSync(
        process.execPath,
        [tscBin, '-p', here + 'tsconfig.build.json'],
        { stdio: 'inherit' },
      );
      // `import 'virtual:stitch-theme'` 是构建期虚拟模块（运行时副作用已在
      // index.js 里落地），但 tsc 会把它原样抄进 index.d.ts。消费者的 TS 解析
      // 类型时无法解析这个虚拟 id（TS2307），故从发布的类型里剔除。
      const dtsEntry = here + 'dist/index.d.ts';
      const cleaned = readFileSync(dtsEntry, 'utf8').replace(
        /^import ['"]virtual:stitch-theme['"];?\n/m,
        '',
      );
      writeFileSync(dtsEntry, cleaned);
    },
  };
}
