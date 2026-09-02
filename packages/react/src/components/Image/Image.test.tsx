import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Image } from './Image';
import styles from './image.module.less';

describe('Image', () => {
  // 1. 基本渲染 —— 渲染 img 并透传 src / alt
  it('渲染 img 并透传 src / alt', () => {
    render(<Image src="photo.png" alt="岛屿风景" />);
    const img = screen.getByRole('img', { name: '岛屿风景' });
    expect(img).toHaveAttribute('src', 'photo.png');
  });

  it('默认相框类名（圆角/边框/阴影来自样式表）', () => {
    const { container } = render(
      <Image src="photo.png" alt="x" preview={false} />,
    );
    const frame = container.firstChild as HTMLElement;
    expect(frame).toHaveClass(styles.image);
  });

  // 2. props → class 映射（每个语义/分类枚举都测）
  it('color 应用对应 matte 类名（非 default 时）', () => {
    const colors = [
      'accent',
      'danger',
      'success',
      'warning',
      'info',
      'cat-1',
      'cat-2',
      'cat-3',
      'cat-4',
      'cat-5',
      'cat-6',
    ] as const;
    for (const color of colors) {
      const { container } = render(
        <Image src="photo.png" alt="x" color={color} preview={false} />,
      );
      expect(container.firstChild).toHaveClass(styles[`image-${color}`]);
    }
  });

  it('未传 color 或 color=default 时不加 matte 类（走中性基础面）', () => {
    const { container } = render(
      <Image src="photo.png" alt="x" preview={false} />,
    );
    expect(container.firstChild).not.toHaveClass(styles['image-accent']);
    const { container: def } = render(
      <Image src="photo.png" alt="x" color="default" preview={false} />,
    );
    expect(def.firstChild).not.toHaveClass(styles['image-danger']);
  });

  // 3. 原生属性透传（width / height / className / style）
  it('width / height 生效', () => {
    const { container } = render(
      <Image
        src="photo.png"
        alt="x"
        width={200}
        height={120}
        preview={false}
      />,
    );
    const frame = container.firstChild as HTMLElement;
    expect(frame).toHaveStyle({ width: '200px', height: '120px' });
  });

  it('应用 className 与 style', () => {
    const { container } = render(
      <Image
        src="photo.png"
        alt="x"
        className="my-img"
        style={{ margin: 4 }}
        preview={false}
      />,
    );
    expect(container.firstChild).toHaveClass('my-img');
    expect(container.firstChild).toHaveStyle({ margin: '4px' });
  });

  it('lazy 映射为原生 loading="lazy"', () => {
    render(<Image src="photo.png" alt="x" lazy preview={false} />);
    expect(screen.getByRole('img')).toHaveAttribute('loading', 'lazy');
  });

  // 4. 交互 —— 点击预览
  it('preview 默认开启：未传 preview 也可点击预览', async () => {
    const user = userEvent.setup();
    render(<Image src="photo.png" alt="默认预览" />);
    await user.click(screen.getByRole('button', { name: /默认预览/ }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('preview：点击图片打开命名大图预览', async () => {
    const user = userEvent.setup();
    render(<Image src="photo.png" alt="预览图" preview />);
    await user.click(screen.getByRole('button', { name: /预览图/ }));
    expect(
      screen.getByRole('dialog', { name: /查看图片：预览图/ }),
    ).toBeInTheDocument();
  });

  it('preview：点击关闭按钮关闭预览', async () => {
    const user = userEvent.setup();
    render(<Image src="photo.png" alt="预览图" preview />);
    await user.click(screen.getByRole('button', { name: /预览图/ }));
    await user.click(screen.getByRole('button', { name: '关闭预览' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('preview：点击遮罩空白处关闭预览', async () => {
    const user = userEvent.setup();
    render(<Image src="photo.png" alt="预览图" preview />);
    await user.click(screen.getByRole('button', { name: /预览图/ }));
    await user.click(screen.getByRole('dialog').parentElement as HTMLElement);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('onLoad 触发后应用加载完成类', () => {
    const onLoad = vi.fn();
    const { container } = render(
      <Image src="photo.png" alt="x" onLoad={onLoad} preview={false} />,
    );
    fireEvent.load(screen.getByRole('img'));
    expect(onLoad).toHaveBeenCalledTimes(1);
    expect(container.firstChild).toHaveClass(styles.loaded);
  });

  // 5. 边界态 —— 加载失败错误占位
  it('onError：加载失败时显示错误占位', () => {
    const onError = vi.fn();
    const { container } = render(
      <Image src="broken.png" alt="坏图" onError={onError} preview={false} />,
    );
    fireEvent.error(screen.getByRole('img'));
    expect(onError).toHaveBeenCalledTimes(1);
    expect(container.firstChild).toHaveClass(styles.error);
    expect(screen.getByText('图片加载失败')).toBeInTheDocument();
    expect(container.firstChild).toHaveAttribute('aria-label', '坏图');
  });

  it('preview：加载失败时不渲染预览按钮', () => {
    render(<Image src="broken.png" alt="坏图" preview />);
    fireEvent.error(screen.getByRole('img'));
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('图片加载失败')).toBeInTheDocument();
  });

  // 6. 键盘操作 —— 相框是原生 button（Enter/Space 开预览）；ESC 关；焦点归还
  it('键盘 Enter 打开预览', async () => {
    const user = userEvent.setup();
    render(<Image src="photo.png" alt="预览图" preview />);
    screen.getByRole('button', { name: /预览图/ }).focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('preview：按 ESC 关闭预览', async () => {
    const user = userEvent.setup();
    render(<Image src="photo.png" alt="预览图" preview />);
    await user.click(screen.getByRole('button', { name: /预览图/ }));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('preview：打开时焦点落在关闭按钮，关闭后归还触发元素', async () => {
    const user = userEvent.setup();
    render(<Image src="photo.png" alt="预览图" preview />);
    const trigger = screen.getByRole('button', { name: /预览图/ });
    trigger.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('button', { name: '关闭预览' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(trigger).toHaveFocus();
  });

  // 7. a11y 契约 —— 可访问名
  it('a11y：img 有可访问名（来自 alt）', () => {
    render(<Image src="photo.png" alt="岛屿风景" preview={false} />);
    expect(screen.getByRole('img')).toHaveAccessibleName('岛屿风景');
  });

  it('a11y：错误占位有可访问名（alt 缺省兜底文案）', () => {
    // alt="" = 装饰图，从可及性树移除 → 直接取 img 元素触发 error
    const { container } = render(
      <Image src="broken.png" alt="" preview={false} />,
    );
    fireEvent.error(container.querySelector('img') as HTMLImageElement);
    expect(screen.getByRole('img')).toHaveAccessibleName('图片加载失败');
  });
});
