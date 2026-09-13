// scripts/lib/publishable-sites.mjs
// 站集合的唯一判据来源。两个动态扫描 helper，零写死站名（延续 resolveSite /
// check-boundary 的动态解析风格）：
//
//   • listAdapterSites —— 「有值的站」：有 adapter.css 的目录。adapter.css 与
//     layout.css 是一个站【同级、成对】的两份「值文件」（ADR 0012 修正）：有
//     adapter 就该有值层，build:layout 正是对每个有 adapter 的站生成成对的
//     layout.css（gated 在 adapter，先于「可发布」）。demo 发现站也以此为基。
//
//   • listPublishableSites —— 「可发布站」：四件套齐全 = 两份值文件
//     {adapter.css, layout.css} + 两份文档 {rules.md, skill-blurb.md} 都在。
//     让两个发布面（A: themes/* emit #8 ／ B1: build:skill presets #9）收录同一
//     集合：能预览的站必定能用 skill 开发，永不劈叉。
//
// 无循环：build:layout 先按 listAdapterSites 生成 layout.css，四件套才可能齐 →
// listPublishableSites 才收该站。故先有 adapter → 有 layout → 才可发布。
import { readdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// 判据只列「文件名」，非站名。站名从磁盘动态解析。
const ADAPTER = ['adapter.css'];
// 四件套 = 可发布判据（值文件 adapter+layout 升为必需，与文档 rules+blurb 并列）。
const QUARTET = ['adapter.css', 'layout.css', 'rules.md', 'skill-blurb.md'];

// 扫 sites/，返回每个 required 文件都齐的站名，稳定（字典序）排序。
function scanSites(root, required) {
  const sitesDir = resolve(root, 'sites');
  return readdirSync(sitesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((site) =>
      required.every((f) => existsSync(resolve(sitesDir, site, f))),
    )
    .sort();
}

/**
 * @param {string} root  项目根（含 sites/ 的目录）
 * @returns {string[]}   有 adapter.css 的站名，稳定（字典序）排序
 */
export function listAdapterSites(root) {
  return scanSites(root, ADAPTER);
}

/**
 * @param {string} root  项目根（含 sites/ 的目录）
 * @returns {string[]}   四件套齐全的站名，稳定（字典序）排序
 */
export function listPublishableSites(root) {
  return scanSites(root, QUARTET);
}
