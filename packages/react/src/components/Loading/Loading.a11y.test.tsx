import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Loading } from './Loading';

describe('Loading a11y', () => {
  it('加载中（默认可及名）无 axe 违规', async () => {
    const { container } = render(<Loading />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('带提示文案无 axe 违规', async () => {
    const { container } = render(<Loading tip="正在加载数据" size="large" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('spinning=false（收起态）无 axe 违规', async () => {
    const { container } = render(<Loading spinning={false} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
