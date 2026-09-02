import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Card } from './Card';

describe('Card a11y', () => {
  it('基础内容卡无 axe 违规', async () => {
    const { container } = render(
      <Card>
        <h3>标题</h3>
        <p>一段说明文字。</p>
      </Card>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('语义色卡片（软底 + 深同色字）无 axe 违规（含对比）', async () => {
    const { container } = render(
      <div>
        <Card color="danger">错误提示卡</Card>
        <Card color="success">成功提示卡</Card>
        <Card color="warning">警告提示卡</Card>
        <Card color="info">信息提示卡</Card>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('强调面卡片（accent）无 axe 违规', async () => {
    const { container } = render(
      <Card variant="filled" color="accent">
        强调编辑卡
      </Card>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('可聚焦区域卡（role=region + 可访问名）无 axe 违规', async () => {
    const { container } = render(
      <Card role="region" aria-label="统计" tabIndex={0}>
        内容
      </Card>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
