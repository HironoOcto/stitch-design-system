import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatImage } from './ChatImage';
import styles from './chat-image.module.less';

const SRC =
  'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

describe('ChatImage', () => {
  // 1. 基本渲染：缩略图带 src / alt（复用通用 Image 渲染）
  it('渲染带 src / alt 的缩略图', () => {
    render(<ChatImage src={SRC} alt="设计稿" />);
    const img = screen.getByAltText('设计稿');
    expect(img).toHaveAttribute('src', SRC);
  });

  // 2. 根节点是块级承载（令时间落缩略图下方）
  it('根节点带 frame 基础类', () => {
    const { container } = render(<ChatImage src={SRC} alt="x" />);
    expect(container.firstChild).toHaveClass(styles.frame);
  });

  // 3. 点击缩略图开本组件自带的大图查看器
  it('点击缩略图打开大图查看器（dialog）', async () => {
    const user = userEvent.setup();
    render(<ChatImage src={SRC} alt="设计稿" />);
    // 未开时无 dialog
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '查看大图 设计稿' }));
    expect(
      screen.getByRole('dialog', { name: /查看图片：设计稿/ }),
    ).toBeInTheDocument();
  });

  // 4. 大图框上有下载键（原生 a[download] 指向 src）+ 关闭键
  it('大图框上含下载键（a[download]→src）与关闭键', async () => {
    const user = userEvent.setup();
    render(<ChatImage src={SRC} alt="设计稿" />);
    await user.click(screen.getByRole('button', { name: '查看大图 设计稿' }));
    const dl = screen.getByRole('link', { name: '下载图片 设计稿' });
    expect(dl).toHaveAttribute('href', SRC);
    expect(dl).toHaveAttribute('download');
    expect(
      screen.getByRole('button', { name: '关闭大图' }),
    ).toBeInTheDocument();
  });

  // 5. 键盘：ESC 关闭大图、焦点归还缩略图
  it('ESC 关闭大图并把焦点还给缩略图', async () => {
    const user = userEvent.setup();
    render(<ChatImage src={SRC} alt="设计稿" />);
    const thumb = screen.getByRole('button', { name: '查看大图 设计稿' });
    thumb.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('button', { name: '关闭大图' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(thumb).toHaveFocus();
  });
});
