import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Tag } from './Tag';

describe('Tag a11y', () => {
  it('基础标签无 axe 违规', async () => {
    const { container } = render(<Tag color="success">已完成</Tag>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('可关闭标签（关闭按钮有可访问名）无 axe 违规', async () => {
    const { container } = render(
      <Tag closable color="danger">
        错误
      </Tag>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('solid 变体（亮填充+深同色字）各语义色无 axe 违规（含对比）', async () => {
    const { container } = render(
      <div>
        <Tag variant="solid" color="danger">
          错误
        </Tag>
        <Tag variant="solid" color="success">
          成功
        </Tag>
        <Tag variant="solid" color="warning">
          警告
        </Tag>
        <Tag variant="solid" color="info">
          提示
        </Tag>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('可点击标签（role=button）无 axe 违规', async () => {
    const { container } = render(<Tag onClick={() => {}}>可点</Tag>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('禁用标签无 axe 违规', async () => {
    const { container } = render(
      <Tag disabled closable>
        禁用
      </Tag>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
