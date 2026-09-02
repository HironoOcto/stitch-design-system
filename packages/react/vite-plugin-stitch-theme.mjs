// vite-plugin-stitch-theme —— 主题虚拟模块 `virtual:stitch-theme`。
//
// 组件各自 import 自己的 *.less（内容是 var(--stitch-*)），Vite 收集成一份
// style.css；但 `:root{--stitch-*}` 那份谁都没 import。这个插件补上：src/index.ts
// 顶部 `import 'virtual:stitch-theme'`，构建时读 activeSite + 合并出单份 :root，
// 灌进同一份 style.css（排在组件 css 前，作默认兜底）。
//
// 合并逻辑复用 scripts/lib/merge-tokens.mjs —— 包与 skill 同一份实现（ADR 0007
// 单一实现共用，杜绝漂移）。
//
// resolveId 把裸 id 映射成带 `.css` 的解析 id，Vite 的 CSS 管线才会把 load 返回
// 的 CSS 收进 style.css（否则会被当成 JS 解析而报错）。
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { mergeTokens } from '../../scripts/lib/merge-tokens.mjs';

const VID = 'virtual:stitch-theme';
const RESOLVED = '\0' + VID + '.css'; // 带 .css → 走 Vite CSS 管线

// 相对本插件文件定位仓库根（packages/react/ 上两级），与 process.cwd() 无关。
const repoRoot = fileURLToPath(new URL('../../', import.meta.url));

export function stitchTheme() {
  return {
    name: 'stitch-theme',
    resolveId(id) {
      return id === VID ? RESOLVED : null;
    },
    load(id) {
      if (id !== RESOLVED) return null;
      const { activeSite } = JSON.parse(
        readFileSync(repoRoot + 'stitch.config.json', 'utf8'),
      );
      // 合并出单份 :root（adapter 覆盖 contract、派生 color-mix 原样保留）。
      return mergeTokens(
        repoRoot + 'packages/tokens/contract.css',
        repoRoot + `sites/${activeSite}/adapter.css`,
        activeSite,
      );
    },
  };
}
