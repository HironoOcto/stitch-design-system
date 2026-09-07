import { describe, it, expect } from 'vitest';
import { CAT_SLOT_COUNT, catColor, seriesColors } from './chartColors';

describe('chartColors 换肤桥', () => {
  it('把系列序号映射成分类色角色变量（只读 --stitch-cat-*，不落 hex）', () => {
    expect(catColor(0)).toBe('var(--stitch-cat-1)');
    expect(catColor(5)).toBe('var(--stitch-cat-6)');
    // 只吐角色变量、绝无 hex（守 H2）
    expect(catColor(0)).not.toMatch(/#[0-9a-fA-F]{3,8}/);
  });

  it('超出 6 个槽位循环复用（recharts 系列数不限，色槽恒 6）', () => {
    expect(catColor(CAT_SLOT_COUNT)).toBe(catColor(0));
    expect(catColor(7)).toBe('var(--stitch-cat-2)');
  });

  it('seriesColors(n) 给 recharts 一次拿一整排系列色', () => {
    expect(seriesColors(3)).toEqual([
      'var(--stitch-cat-1)',
      'var(--stitch-cat-2)',
      'var(--stitch-cat-3)',
    ]);
  });
});
