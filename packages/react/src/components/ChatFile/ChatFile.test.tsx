import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatFile } from './ChatFile';
import styles from './chat-file.module.less';

describe('ChatFile', () => {
  // 1. 基本渲染：文件名 + 副文本
  it('渲染文件名与副文本', () => {
    render(<ChatFile name="纪要.pdf" description="PDF" />);
    expect(screen.getByText('纪要.pdf')).toBeInTheDocument();
    expect(screen.getByText('PDF')).toBeInTheDocument();
  });

  // 2. size 字节数格式化为人类可读
  it('size 按字节格式化（B / KB / MB）', () => {
    const { rerender } = render(<ChatFile name="a" size={840} />);
    expect(screen.getByText('840 B')).toBeInTheDocument();
    rerender(<ChatFile name="a" size={51200} />);
    expect(screen.getByText('50.0 KB')).toBeInTheDocument();
    rerender(<ChatFile name="a" size={2_411_724} />);
    expect(screen.getByText('2.3 MB')).toBeInTheDocument();
  });

  // 3. 根节点带基础类（挂在复用的 Card 上）
  it('根节点带 file 基础类', () => {
    const { container } = render(<ChatFile name="a.txt" />);
    expect(container.firstChild).toHaveClass(styles.file);
  });

  // 4. onClick：文件名区升格为可访问按钮，点击触发
  it('给 onClick 时文件名区为按钮，点击触发回调', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<ChatFile name="稿.sketch" onClick={onClick} />);
    const open = screen.getByRole('button', { name: '打开文件 稿.sketch' });
    await user.click(open);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  // 5. 无 onClick 时不产出打开按钮（只读容器）
  it('无 onClick 时不渲染打开按钮', () => {
    render(<ChatFile name="只读.txt" />);
    expect(
      screen.queryByRole('button', { name: /打开文件/ }),
    ).not.toBeInTheDocument();
  });

  // 6a. 下载键常驻：即便不传 onDownload 也渲染（文件默认可下载）
  it('下载键常驻，不传 onDownload 也在位', () => {
    render(<ChatFile name="只读.txt" />);
    expect(
      screen.getByRole('button', { name: '下载 只读.txt' }),
    ).toBeInTheDocument();
  });

  // 6b. onDownload：点击 + 键盘 Enter 均触发（原生 button）
  it('点击 / 键盘 Enter 下载键均触发 onDownload', async () => {
    const user = userEvent.setup();
    const onDownload = vi.fn();
    render(<ChatFile name="包.zip" onDownload={onDownload} />);
    const dl = screen.getByRole('button', { name: '下载 包.zip' });
    await user.click(dl);
    dl.focus();
    await user.keyboard('{Enter}');
    expect(onDownload).toHaveBeenCalledTimes(2);
  });

  // 7. a11y 契约：打开 / 下载按钮均有可访问名
  it('打开与下载按钮都有可访问名', () => {
    render(<ChatFile name="x.pdf" onClick={() => {}} onDownload={() => {}} />);
    expect(
      screen.getByRole('button', { name: '打开文件 x.pdf' }),
    ).toHaveAccessibleName('打开文件 x.pdf');
    expect(
      screen.getByRole('button', { name: '下载 x.pdf' }),
    ).toHaveAccessibleName('下载 x.pdf');
  });
});
