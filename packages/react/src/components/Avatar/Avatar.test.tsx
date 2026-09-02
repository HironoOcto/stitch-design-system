import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Avatar } from './Avatar';
import styles from './avatar.module.less';

/**
 * jsdom 不真正加载 `<img>`，而 Radix Avatar 靠 `new window.Image()` 预载探测加载状态
 * （成功→显图、失败/无 src→显 fallback）。这里替身 `window.Image`：设 `.src` 后按
 * `mode` 同步派发 `onload` / `onerror`，让「显图 / 显 fallback」两分支在单测里可判定。
 */
function stubImageLoading(mode: 'load' | 'error') {
  class MockImage {
    complete = false;
    naturalWidth = 0;
    referrerPolicy = '';
    crossOrigin: string | null = null;
    private listeners: Record<string, ((e: unknown) => void)[]> = {};
    addEventListener(type: string, cb: (e: unknown) => void) {
      (this.listeners[type] ??= []).push(cb);
    }
    removeEventListener() {}
    set src(_value: string) {
      queueMicrotask(() => {
        if (mode === 'load') {
          this.complete = true;
          this.naturalWidth = 1;
          this.listeners.load?.forEach((cb) => cb({ currentTarget: this }));
        } else {
          this.listeners.error?.forEach((cb) => cb({ currentTarget: this }));
        }
      });
    }
  }
  vi.stubGlobal('Image', MockImage);
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Avatar', () => {
  // 1. 冒烟（tracer）—— src 成功加载显图
  it('src 加载成功时显示图片', async () => {
    stubImageLoading('load');
    render(<Avatar src="/me.png" alt="张三" fallback="张" />);
    const img = await screen.findByRole('img', { name: '张三' });
    expect(img).toHaveAttribute('src', '/me.png');
  });

  // 2. 无 src —— 显示 fallback、不渲图
  it('无 src 时显示 fallback', () => {
    render(<Avatar fallback="张" />);
    expect(screen.getByText('张')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  // 3. src 加载失败 —— 回退到 fallback、不渲图
  it('src 加载失败时回退到 fallback', async () => {
    stubImageLoading('error');
    render(<Avatar src="/broken.png" alt="李四" fallback="李" />);
    // 失败后 fallback 出现、图不渲
    expect(await screen.findByText('李')).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByRole('img')).not.toBeInTheDocument(),
    );
  });

  // 4. shape → class 映射（默认 circle；square 可选）
  it('shape 映射到形状 class（默认 circle）', () => {
    const { rerender } = render(<Avatar fallback="A" />);
    const root = screen.getByText('A').parentElement as HTMLElement;
    expect(root).toHaveClass(styles.circle);
    expect(root).not.toHaveClass(styles.square);

    rerender(<Avatar fallback="A" shape="square" />);
    expect(screen.getByText('A').parentElement).toHaveClass(styles.square);
  });

  // 5. size → class 映射（默认 middle；small / large 可选）
  it('size 映射到尺寸档 class（默认 middle）', () => {
    const { rerender } = render(<Avatar fallback="B" />);
    expect(screen.getByText('B').parentElement).toHaveClass(styles.middle);

    rerender(<Avatar fallback="B" size="small" />);
    expect(screen.getByText('B').parentElement).toHaveClass(styles.small);

    rerender(<Avatar fallback="B" size="large" />);
    expect(screen.getByText('B').parentElement).toHaveClass(styles.large);
  });

  // 6. 挂 Less 根类 + fallback 类，并透传 className / style
  it('挂 Less 皮类并透传 className / style', () => {
    render(
      <Avatar fallback="C" className="my-avatar" style={{ opacity: 0.5 }} />,
    );
    const fallback = screen.getByText('C');
    const root = fallback.parentElement as HTMLElement;
    expect(fallback).toHaveClass(styles.fallback);
    expect(root).toHaveClass(styles.root);
    expect(root).toHaveClass('my-avatar');
    expect(root).toHaveStyle({ opacity: '0.5' });
  });
});
