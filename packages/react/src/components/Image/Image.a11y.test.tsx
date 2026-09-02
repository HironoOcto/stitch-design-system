import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Image } from './Image';

describe('Image a11y', () => {
  it('默认相框（可点击预览）无 axe 违规', async () => {
    const { container } = render(<Image src="photo.png" alt="岛屿风景" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('装饰性图片（alt 缺省）无 axe 违规', async () => {
    const { container } = render(
      <Image src="photo.png" alt="" preview={false} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('错误占位无 axe 违规', async () => {
    const { container } = render(
      <Image src="broken.png" alt="坏图" preview={false} />,
    );
    fireEvent.error(screen.getByRole('img'));
    expect(await axe(container)).toHaveNoViolations();
  });

  it('大图预览弹层（dialog）无 axe 违规', async () => {
    const user = userEvent.setup();
    const { baseElement } = render(
      <Image src="photo.png" alt="预览图" preview />,
    );
    await user.click(screen.getByRole('button', { name: /预览图/ }));
    // 弹层经 Portal 挂到 body → 用 baseElement 覆盖遮罩内容
    expect(await axe(baseElement)).toHaveNoViolations();
  });
});
