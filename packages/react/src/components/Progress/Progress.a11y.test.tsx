import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Progress } from './Progress';

describe('Progress a11y', () => {
  it('带可及名的进度条无 axe 违规', async () => {
    const { container } = render(
      <Progress percent={60} aria-label="任务进度" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('info 在右侧无 axe 违规', async () => {
    const { container } = render(
      <Progress percent={30} infoPosition="right" aria-label="下载进度" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('info 在顶部无 axe 违规', async () => {
    const { container } = render(
      <Progress percent={80} infoPosition="top" aria-label="上传进度" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
