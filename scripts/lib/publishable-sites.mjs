// scripts/lib/publishable-sites.mjs
// 「可发布站」的唯一判据来源。动态扫 sites/，只收「三件套齐全」的站
// —— {adapter.css, rules.md, skill-blurb.md} 都在 —— 返回稳定排序的站名数组，
// 零写死站名（延续 resolveSite / check-boundary 的动态解析风格）。
//
// 更严的「三件套齐全」而非「有 adapter.css 就算」，是为了让两个发布面
// （A: themes/* emit，#8 ／ B1: build:skill presets，#9）收录同一集合：
// 能预览的站必定能用 skill 开发，永不劈叉。判据在此单点定义，两面都调它。
import { readdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// 三件套 = 判据。站名从磁盘动态解析，这里只列「文件名」，非站名。
const TRIAD = ['adapter.css', 'rules.md', 'skill-blurb.md'];

/**
 * @param {string} root  项目根（含 sites/ 的目录）
 * @returns {string[]}   三件套齐全的站名，稳定（字典序）排序
 */
export function listPublishableSites(root) {
  const sitesDir = resolve(root, 'sites');
  return readdirSync(sitesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((site) =>
      TRIAD.every((f) => existsSync(resolve(sitesDir, site, f))),
    )
    .sort();
}
