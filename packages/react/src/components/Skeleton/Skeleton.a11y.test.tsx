import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Skeleton } from './Skeleton';

describe('Skeleton a11y', () => {
  it('默认骨架无 axe 违规', async () => {
    const { container } = render(<Skeleton />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('paragraph 多行无 axe 违规', async () => {
    const { container } = render(<Skeleton variant="paragraph" rows={3} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('子组件（Button/Input/Avatar）无 axe 违规', async () => {
    const { container } = render(
      <div>
        <Skeleton.Button />
        <Skeleton.Input />
        <Skeleton.Avatar />
        <Skeleton.Avatar shape="square" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('loading=false 渲染真实内容无 axe 违规', async () => {
    const { container } = render(
      <Skeleton loading={false}>
        <p>真实内容</p>
      </Skeleton>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
