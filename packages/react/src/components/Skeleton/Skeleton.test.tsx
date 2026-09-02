import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Skeleton } from './Skeleton';
import styles from './skeleton.module.less';

describe('Skeleton', () => {
  // 1. 基本渲染
  it('默认渲染 role="status" 骨架占位', () => {
    render(<Skeleton />);
    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    expect(status).toHaveClass(styles.skeleton);
  });

  // 2. props → class 映射（variant 枚举全测）
  it.each([
    ['text', styles['vt-text']],
    ['circle', styles['vt-circle']],
    ['rect', styles['vt-rect']],
    ['paragraph', styles['vt-paragraph']],
  ] as const)('variant=%s 映射到对应 class', (variant, cls) => {
    render(<Skeleton variant={variant} />);
    expect(screen.getByRole('status')).toHaveClass(cls);
  });

  it('active 默认应用扫光 class，active=false 时不应用', () => {
    const { rerender } = render(<Skeleton active />);
    expect(screen.getByRole('status')).toHaveClass(styles.active);
    rerender(<Skeleton active={false} />);
    expect(screen.getByRole('status')).not.toHaveClass(styles.active);
  });

  it('paragraph 按 rows 渲染对应行数（且行块 aria-hidden 不重复播报）', () => {
    render(<Skeleton variant="paragraph" rows={4} />);
    const status = screen.getByRole('status');
    const lines = status.querySelectorAll(`.${styles.line}`);
    expect(lines).toHaveLength(4);
    lines.forEach((l) => expect(l).toHaveAttribute('aria-hidden'));
  });

  // 3. 原生属性透传（className / style）
  it('className / style 透传到根元素', () => {
    render(<Skeleton className="my-skel" style={{ opacity: 0.5 }} />);
    const status = screen.getByRole('status');
    expect(status).toHaveClass('my-skel');
    expect(status.style.opacity).toBe('0.5');
  });

  it('width / height 落到内联尺寸', () => {
    render(<Skeleton variant="rect" width={200} height={120} />);
    const status = screen.getByRole('status');
    expect(status.style.width).toBe('200px');
    expect(status.style.height).toBe('120px');
  });

  // 4 & 5. 交互/边界态：loading=false 渲染 children（跳过骨架）
  it('loading=false 时渲染 children、不出 status', () => {
    render(<Skeleton loading={false}>真实内容</Skeleton>);
    expect(screen.getByText('真实内容')).toBeInTheDocument();
    expect(screen.queryByRole('status')).toBeNull();
  });

  // 6. 键盘：占位区无可聚焦控件（不劫持焦点）
  it('骨架内无可聚焦控件（键盘透明）', () => {
    render(<Skeleton variant="paragraph" rows={3} />);
    expect(
      screen.getByRole('status').querySelector('button, a, input, [tabindex]'),
    ).toBeNull();
  });

  // 7. a11y 契约：可及名（默认「加载中」，可覆盖）
  it('默认可及名为「加载中」，aria-label 可覆盖', () => {
    const { rerender } = render(<Skeleton />);
    expect(screen.getByRole('status')).toHaveAccessibleName('加载中');
    rerender(<Skeleton aria-label="正在载入头像" />);
    expect(screen.getByRole('status')).toHaveAccessibleName('正在载入头像');
  });
});

describe('Skeleton.Button / Input / Avatar', () => {
  it('Skeleton.Button 渲染并按 size 给尺寸', () => {
    render(<Skeleton.Button size="large" />);
    const status = screen.getByRole('status');
    expect(status).toHaveClass(styles['skeleton-btn']);
    expect(status.style.width).toBe('130px');
  });

  it('Skeleton.Input 渲染并带占位类', () => {
    render(<Skeleton.Input />);
    expect(screen.getByRole('status')).toHaveClass(styles['skeleton-input']);
  });

  it.each([
    ['circle', styles['vt-circle']],
    ['square', styles['skeleton-avatar-square']],
  ] as const)('Skeleton.Avatar shape=%s 映射形状 class', (shape, cls) => {
    render(<Skeleton.Avatar shape={shape} />);
    expect(screen.getByRole('status')).toHaveClass(cls);
  });

  it('子组件默认可及名为「加载中」', () => {
    render(<Skeleton.Button />);
    expect(screen.getByRole('status')).toHaveAccessibleName('加载中');
  });
});
