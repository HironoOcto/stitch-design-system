// demo/registry.ts —— 扫 demo/components/*，与族表 ∩ 合成侧栏导航
//
// 加组件 = 丢一个 demo/components/<X>/index.tsx 即自动上架，导航零改动。
// 文件夹名须与族表成员名对齐（大小写不敏感），不齐则 warn。

import type { ComponentType } from 'react';
import { families, type Family } from './families';

export interface DemoMeta {
  title: string;
  description: string;
}

export interface DemoModule {
  meta: DemoMeta;
  default: ComponentType;
}

// 每个组件页 = default 导出示例组件 + 具名导出 meta（标题/描述）。
const modules = import.meta.glob('/demo/components/*/index.tsx', {
  eager: true,
}) as Record<string, DemoModule>;

export interface DemoEntry {
  /** 路由 key = 文件夹名（如 button），hash 路由 #/<key> */
  key: string;
  meta: DemoMeta;
  Component: ComponentType;
}

// key（文件夹名）→ 已建 demo 条目
export const demos: Record<string, DemoEntry> = {};
for (const [path, mod] of Object.entries(modules)) {
  const key = path.match(/demo\/components\/([^/]+)\/index\.tsx$/)![1];
  demos[key] = { key, meta: mod.meta, Component: mod.default };
}

export interface NavGroup {
  family: string;
  fn: string;
  members: { key: string; label: string }[];
}

/**
 * 侧栏导航 = 族表 ∩ demo/components/* 自动合成：
 * 遍历族表，某族有 ≥1 个已建 demo 成员才显示该组 + 其已建成员；空族不显示。
 * 成员匹配大小写不敏感（族表 PascalCase ↔ 文件夹小写）。
 */
export function deriveNav(
  fams: Family[],
  built: Record<string, DemoEntry>,
): NavGroup[] {
  const byLowerKey = new Map(
    Object.keys(built).map((k) => [k.toLowerCase(), k]),
  );
  const claimed = new Set<string>();
  const groups: NavGroup[] = [];

  for (const fam of fams) {
    const members: { key: string; label: string }[] = [];
    for (const member of fam.members) {
      const key = byLowerKey.get(member.toLowerCase());
      if (key) {
        members.push({ key, label: member });
        claimed.add(key);
      }
    }
    if (members.length > 0) {
      groups.push({ family: fam.name, fn: fam.fn, members });
    }
  }

  // 文件夹名与族表成员名不齐的 demo → warn（不上架，避免静默漏掉）
  for (const key of Object.keys(built)) {
    if (!claimed.has(key)) {
      console.warn(
        `[demo] demo/components/${key}/ 没有匹配的族表成员，不会出现在侧栏。` +
          ` 请让文件夹名与 scripts/component-families.md 的某个成员名对齐（大小写不敏感）。`,
      );
    }
  }

  return groups;
}

export const nav: NavGroup[] = deriveNav(families, demos);
