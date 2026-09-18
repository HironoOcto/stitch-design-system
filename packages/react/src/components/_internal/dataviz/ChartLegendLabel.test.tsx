import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderLegendLabel } from './ChartLegendLabel';

describe('renderLegendLabel 图例标签（文字走中性墨色、色卡色不碰）', () => {
  it('把图例文字裹成 var(--stitch-text-primary) 墨色，而非系列色（守 WCAG 1.4.1 文字通道）', () => {
    // recharts Legend 默认把每项文字也染成系列色（鲜艳/极淡分类色当白底文字不可读）；
    // formatter 以本 helper 把标签文字拉成可读墨色——色卡色（swatch）另由 recharts 默认承载、不在此。
    render(<>{renderLegendLabel('Chrome')}</>);
    const label = screen.getByText('Chrome');
    expect(label.style.color).toContain('var(--stitch-text-primary)');
    // 文字永不吃分类色（H2：也绝无 hex）
    expect(label.style.color).not.toContain('var(--stitch-cat-');
    expect(label.style.color).not.toMatch(/#[0-9a-fA-F]{3,8}/);
  });
});
