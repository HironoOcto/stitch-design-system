import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AspectRatio } from './AspectRatio';
import styles from './aspect-ratio.module.less';

describe('AspectRatio', () => {
  // 1. 冒烟（tracer）—— 传 ratio 渲染出对应比例容器 + children 落位
  it('传 ratio 约束比例并渲染 children', () => {
    render(
      <AspectRatio ratio={16 / 9}>
        <span>封面</span>
      </AspectRatio>,
    );
    // children 落位
    expect(screen.getByText('封面')).toBeInTheDocument();
    // 比例容器：Radix 用外层 wrapper 的 padding-bottom = 100 / ratio 撑出比例
    // 16/9 → 100 / (16/9) = 56.25%
    const wrapper = screen.getByText('封面').parentElement
      ?.parentElement as HTMLElement;
    expect(wrapper).toHaveStyle({ paddingBottom: '56.25%' });
  });

  // 2. 默认 ratio = 1（正方形）
  it('未传 ratio 时默认 1（padding-bottom 100%）', () => {
    render(
      <AspectRatio>
        <span>方图</span>
      </AspectRatio>,
    );
    const wrapper = screen.getByText('方图').parentElement
      ?.parentElement as HTMLElement;
    expect(wrapper).toHaveStyle({ paddingBottom: '100%' });
  });

  // 3. className / style 透传到内容层 + 挂 Less 根类
  it('挂 Less 根类并透传 className / style', () => {
    render(
      <AspectRatio ratio={1} className="my-ratio" style={{ opacity: 0.5 }}>
        <span>内容</span>
      </AspectRatio>,
    );
    const content = screen.getByText('内容').parentElement as HTMLElement;
    expect(content).toHaveClass(styles.root);
    expect(content).toHaveClass('my-ratio');
    expect(content).toHaveStyle({ opacity: '0.5' });
  });
});
