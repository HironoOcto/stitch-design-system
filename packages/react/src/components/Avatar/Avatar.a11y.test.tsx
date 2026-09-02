import { describe, it, expect, afterEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Avatar } from './Avatar';

// 显图态需真加载出 <img>：替身 window.Image 同步派发 load（详见 Avatar.test.tsx）。
function stubImageLoaded() {
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
        this.complete = true;
        this.naturalWidth = 1;
        this.listeners.load?.forEach((cb) => cb({ currentTarget: this }));
      });
    }
  }
  vi.stubGlobal('Image', MockImage);
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Avatar a11y', () => {
  // 显图态：<img> 带 alt → 无 axe 违规
  it('显图（带 alt）时无 axe 违规', async () => {
    stubImageLoaded();
    const { container, findByRole } = render(
      <Avatar src="/me.png" alt="张三的头像" fallback="张" />,
    );
    await findByRole('img', { name: '张三的头像' });
    expect(await axe(container)).toHaveNoViolations();
  });

  // 兜底态：纯文字 fallback → 无 axe 违规
  it('兜底态（首字母 fallback）无 axe 违规', async () => {
    const { container } = render(<Avatar fallback="张" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
