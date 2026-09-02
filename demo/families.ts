// demo/families.ts —— 解析 scripts/component-families.md（族的单一真相）
//
// 与 build:refs 同源：都解析这张表。侧栏分组读的就是它，别另搞一套。

import familiesMd from '/scripts/component-families.md?raw';

export interface Family {
  name: string;
  fn: string;
  members: string[];
}

/** 解析 markdown 表：跳表头/分隔行，取第 1 列（族名）+ 第 3 列（成员，逗号分隔）。 */
export function parseFamilies(md: string): Family[] {
  const families: Family[] = [];
  for (const line of md.split('\n')) {
    const t = line.trim();
    if (!t.startsWith('|')) continue;
    const cells = t
      .split('|')
      .slice(1, -1)
      .map((c) => c.trim());
    if (cells.length < 3) continue;
    const [name, fn, members] = cells;
    if (name === '族名') continue; // 表头
    if (/^:?-{2,}:?$/.test(name)) continue; // 分隔行（---、:--- 等）
    families.push({
      name,
      fn,
      members: members
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean),
    });
  }
  return families;
}

export const families: Family[] = parseFamilies(familiesMd);
