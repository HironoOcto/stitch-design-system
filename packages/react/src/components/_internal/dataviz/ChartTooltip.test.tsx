import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChartTooltip } from './ChartTooltip';
import cardStyles from '../../Card/card.module.less';

describe('ChartTooltip 统一 tooltip（复用 Card 角色变量）', () => {
  it('active 时经 Card 呈现 label + 每个系列的名/值（不用 recharts 默认白框）', () => {
    const { container } = render(
      <ChartTooltip
        active
        label="Q1"
        payload={[{ name: '营收', value: 100, color: 'var(--stitch-cat-1)' }]}
      />,
    );
    expect(screen.getByText('Q1')).toBeInTheDocument();
    expect(screen.getByText('营收')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    // 表面 = Card（边/影/圆角/底全走 Card 的角色变量，非 recharts 默认样式）
    expect(container.querySelector(`.${cardStyles.card}`)).not.toBeNull();
  });

  it('系列色块只吃传入的角色变量色（H2：不落 hex）', () => {
    const { container } = render(
      <ChartTooltip
        active
        label="Q1"
        payload={[{ name: '营收', value: 100, color: 'var(--stitch-cat-2)' }]}
      />,
    );
    const swatch = container.querySelector(
      '[data-chart-swatch]',
    ) as HTMLElement;
    expect(swatch.style.background).toContain('var(--stitch-cat-2)');
  });

  it('非 active / 空数据时不渲染（不挡视线）', () => {
    const { container } = render(<ChartTooltip active={false} payload={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
