// scripts/sync-plugin-version.mjs —— 让 .claude-plugin/plugin.json 的 version 跟随
// packages/react/package.json 的 version。
//
// 由 npm 的 `version` 生命周期钩子调用（packages/react/package.json 的 "version" 脚本）：
// `npm version <bump>` 会先改 package.json 版本 → 跑本脚本把 plugin.json 同步成同一版本
// → 该脚本再 `git add` plugin.json，于是两个版本在同一个 version commit 里原子更新。
// 杜绝「只 bump 了 npm 包、忘了 skill 插件版本」的漂移。见 docs/contributing/packaging.md。
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pkgPath = resolve(root, 'packages/react/package.json');
const pluginPath = resolve(root, '.claude-plugin/plugin.json');

const version = JSON.parse(readFileSync(pkgPath, 'utf8')).version;
const src = readFileSync(pluginPath, 'utf8');

// 只替换 version 那一处的值，其余字节不动 —— 保持 plugin.json 原有（prettier）格式，
// 避免整文件重新序列化后与 prettier 风格不一致、卡 pre-commit 的 format:check。
const re = /("version"\s*:\s*")([^"]*)(")/;
const m = src.match(re);
if (!m)
  throw new Error('sync-plugin-version: plugin.json 里找不到 "version" 字段');

if (m[2] === version) {
  console.log(`sync-plugin-version: plugin.json 已是 ${version}，无需改`);
} else {
  writeFileSync(pluginPath, src.replace(re, `$1${version}$3`));
  console.log(`sync-plugin-version: plugin.json version ${m[2]} → ${version}`);
}
