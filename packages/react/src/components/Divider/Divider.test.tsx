import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Divider } from './Divider';
import styles from './divider.module.less';

describe('Divider', () => {
  it('默认渲染水平实线：role=separator + 基础/水平类', () => {
    render(<Divider />);
    const root = screen.getByRole('separator');
    expect(root).toHaveClass(styles.divider);
    expect(root).toHaveClass(styles['divider-horizontal']);
    // 水平 separator 用 ARIA 默认方向，不显式标注。
    expect(root).not.toHaveAttribute('aria-orientation');
  });

  it('type=vertical：应用垂直类并标注 aria-orientation', () => {
    render(<Divider type="vertical" />);
    const root = screen.getByRole('separator');
    expect(root).toHaveClass(styles['divider-vertical']);
    expect(root).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('variant=dashed：应用虚线类', () => {
    render(<Divider variant="dashed" />);
    expect(screen.getByRole('separator')).toHaveClass(styles['divider-dashed']);
  });

  it('带 children：渲染文字分隔线，文字可作可访问名', () => {
    render(<Divider>章节</Divider>);
    const root = screen.getByRole('separator');
    expect(root).toHaveClass(styles['divider-with-text']);
    expect(root).toHaveAccessibleName('章节');
    expect(screen.getByText('章节')).toHaveClass(styles['divider-text']);
  });

  it('orientation=left：文字分隔线应用左对齐类', () => {
    render(<Divider orientation="left">左</Divider>);
    expect(screen.getByRole('separator')).toHaveClass(styles['divider-left']);
  });

  it('plain：文字分隔线应用常规字重类', () => {
    render(<Divider plain>普通</Divider>);
    expect(screen.getByRole('separator')).toHaveClass(styles['divider-plain']);
  });

  it('垂直分隔线忽略 children（无文字分隔线）', () => {
    render(<Divider type="vertical">忽略</Divider>);
    const root = screen.getByRole('separator');
    expect(root).not.toHaveClass(styles['divider-with-text']);
    expect(screen.queryByText('忽略')).toBeNull();
  });

  it('透传 className 与 style', () => {
    render(<Divider className="x" style={{ marginTop: 8 }} />);
    const root = screen.getByRole('separator');
    expect(root).toHaveClass('x');
    expect(root).toHaveStyle({ marginTop: '8px' });
  });
});
