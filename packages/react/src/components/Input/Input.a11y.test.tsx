import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Input } from './Input';

describe('Input a11y', () => {
  it('带 label 关联的输入无 axe 违规', async () => {
    const { container } = render(
      <>
        <label htmlFor="name">姓名</label>
        <Input id="name" placeholder="请输入" />
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('error 态（aria-invalid）无 axe 违规', async () => {
    const { container } = render(
      <>
        <label htmlFor="email">邮箱</label>
        <Input id="email" status="error" defaultValue="x" />
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('allowClear 清除按钮（aria-label）无 axe 违规', async () => {
    const { container } = render(
      <>
        <label htmlFor="q">搜索</label>
        <Input id="q" allowClear defaultValue="abc" />
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
