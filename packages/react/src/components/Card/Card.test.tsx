import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Card } from './Card';
import type { CardVariant, CardColor } from './Card';
import styles from './card.module.less';

describe('Card', () => {
  // ---------- 1. 基本渲染 ----------
  it('渲染 children', () => {
    render(
      <Card>
        <span data-testid="c">hi</span>
      </Card>,
    );
    expect(screen.getByTestId('c')).toBeInTheDocument();
  });

  it('children 为数字 / 字符串 / 节点均可', () => {
    const { rerender, container } = render(<Card>{42}</Card>);
    expect(container.firstChild?.textContent).toBe('42');
    rerender(<Card>plain text</Card>);
    expect(container.firstChild?.textContent).toBe('plain text');
    rerender(
      <Card>
        <em data-testid="e">em</em>
      </Card>,
    );
    expect(screen.getByTestId('e')).toBeInTheDocument();
  });

  // ---------- 2. props → class 映射（枚举全测）----------
  it('默认 variant=outlined、color=default、非 hoverable', () => {
    const { container } = render(<Card>x</Card>);
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass(styles.card);
    expect(root).toHaveClass(styles['card-outlined']);
    expect(root).not.toHaveClass(styles['card-hoverable']);
  });

  it('variant 全部枚举生成对应 class', () => {
    const variants: CardVariant[] = [
      'outlined',
      'elevated',
      'filled',
      'dashed',
    ];
    for (const v of variants) {
      const { container, unmount } = render(<Card variant={v}>x</Card>);
      expect(container.firstChild).toHaveClass(styles[`card-${v}`]);
      unmount();
    }
  });

  it('color 全部非 default 枚举生成对应 class', () => {
    const colors: CardColor[] = [
      'accent',
      'danger',
      'success',
      'warning',
      'info',
      'cat-1',
      'cat-2',
      'cat-3',
      'cat-4',
      'cat-5',
      'cat-6',
    ];
    for (const c of colors) {
      const { container, unmount } = render(<Card color={c}>x</Card>);
      expect(container.firstChild).toHaveClass(styles[`color-${c}`]);
      unmount();
    }
  });

  it('color=default 不应用任何 color-* 类', () => {
    const { container } = render(<Card color="default">x</Card>);
    const root = container.firstChild as HTMLElement;
    expect(root).not.toHaveClass(styles['color-accent']);
    expect(root).not.toHaveClass(styles['color-danger']);
  });

  it('hoverable={true} 应用 card-hoverable，false / 不传均不应用', () => {
    const { container: on } = render(<Card hoverable>x</Card>);
    expect(on.firstChild).toHaveClass(styles['card-hoverable']);
    const { container: off } = render(<Card hoverable={false}>x</Card>);
    expect(off.firstChild).not.toHaveClass(styles['card-hoverable']);
    const { container: none } = render(<Card>x</Card>);
    expect(none.firstChild).not.toHaveClass(styles['card-hoverable']);
  });

  it('variant + color + hoverable 三者组合同时应用对应 class', () => {
    const { container } = render(
      <Card variant="dashed" color="cat-3" hoverable>
        x
      </Card>,
    );
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass(styles['card-dashed']);
    expect(root).toHaveClass(styles['color-cat-3']);
    expect(root).toHaveClass(styles['card-hoverable']);
  });

  // ---------- 3. 原生属性透传 ----------
  it('透传原生 div 属性（className / style / data-*）', () => {
    const { container } = render(
      <Card className="extra" style={{ marginTop: 5 }} data-testid="root">
        x
      </Card>,
    );
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass('extra');
    expect(root).toHaveClass(styles.card);
    expect(root).toHaveStyle({ marginTop: '5px' });
    expect(root).toHaveAttribute('data-testid', 'root');
  });

  // ---------- 4. 交互事件 ----------
  it('onClick 在 Card 上被点击时触发', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { container } = render(<Card onClick={onClick}>x</Card>);
    await user.click(container.firstChild as HTMLElement);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  // ---------- 6. 键盘（作为容器：onKeyDown / tabIndex 经 rest 透传）----------
  it('可聚焦卡片透传 tabIndex 且键盘事件冒泡', async () => {
    const user = userEvent.setup();
    const onKeyDown = vi.fn();
    render(
      <Card tabIndex={0} onKeyDown={onKeyDown} aria-label="kbd card">
        x
      </Card>,
    );
    const root = screen.getByLabelText('kbd card');
    root.focus();
    expect(root).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onKeyDown).toHaveBeenCalled();
  });

  // ---------- 7. a11y 契约（可访问名）----------
  it('role + aria-label 透传并暴露可访问名', () => {
    const { container } = render(
      <Card role="region" aria-label="card">
        x
      </Card>,
    );
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveRole('region');
    expect(root).toHaveAccessibleName('card');
  });

  // ---------- 边界 ----------
  it('children 为空字符串时正常渲染根 div', () => {
    const { container } = render(<Card>{''}</Card>);
    const root = container.firstChild as HTMLElement;
    expect(root.tagName).toBe('DIV');
    expect(root).toHaveClass(styles.card);
  });
});
