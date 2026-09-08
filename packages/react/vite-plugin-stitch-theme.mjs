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
import { listPublishableSites } from '../../scripts/lib/publishable-sites.mjs';
import { scopeAdapter } from '../../scripts/lib/scope-theme.mjs';

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
    // themes/* 导出（issue #8 / ADR 0009）——与 style.css 原子产出。让使用方
    // 零重发布就能自选/运行时切主题。每个「可发布站」（#7 listPublishableSites，
    // 三件套齐全）emit 一份 dist/themes/<站>.css：该站 adapter 的每站值作用域化成
    // [data-site="<站>"]。opt-in 覆盖层：不 import themes/*、不设 data-site 的
    // 消费者拿到的仍是 style.css 里烤死的 activeSite 那套（零配置默认单套）。
    // 站名零写死——集合由磁盘动态解析，故永不劈叉、无越界。
    generateBundle() {
      for (const site of listPublishableSites(repoRoot)) {
        this.emitFile({
          type: 'asset',
          fileName: `themes/${site}.css`,
          source: scopeAdapter(repoRoot + `sites/${site}/adapter.css`, site),
        });
      }
    },
  };
}
