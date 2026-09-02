import { describe, it, expect, afterEach, beforeAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ScrollArea } from './ScrollArea';
import styles from './scroll-area.module.less';

// 测试重点 = 我们写的那部分：viewport 承接 children（不改语义）+ orientation → 渲哪条滚动条 +
// 内容溢出时渲出「带我们 Less 皮的」自定义滚动条。键盘/焦点/ARIA 归底层（radix），冒烟即可。
//
// jsdom 无真实布局：radix `type="auto"` 靠 ResizeObserver 量 viewport offset/scroll 尺寸判溢出，
// setup 里的 ResizeObserver 是 no-op（不回调）→ 滚动条永不挂。故本文件装一个「observe 即回调」
// 的 ResizeObserver + 把 viewport 的 offset/scroll 高宽 mock 成溢出，honest 地走 auto 溢出路径。
let realRO: typeof globalThis.ResizeObserver;
const geomSpies: Array<() => void> = [];

function mockOverflowGeometry() {
  for (const prop of ['offsetHeight', 'offsetWidth'] as const) {
    const orig = Object.getOwnPropertyDescriptor(HTMLElement.prototype, prop);
    Object.defineProperty(HTMLElement.prototype, prop, {
      configurable: true,
      get() {
        return 100;
      },
    });
    geomSpies.push(() => {
      if (orig) Object.defineProperty(HTMLElement.prototype, prop, orig);
    });
  }
  for (const prop of ['scrollHeight', 'scrollWidth'] as const) {
    const orig = Object.getOwnPropertyDescriptor(HTMLElement.prototype, prop);
    Object.defineProperty(HTMLElement.prototype, prop, {
      configurable: true,
      get() {
        return 1000;
      },
    });
    geomSpies.push(() => {
      if (orig) Object.defineProperty(HTMLElement.prototype, prop, orig);
    });
  }
}

beforeAll(() => {
  realRO = globalThis.ResizeObserver;
});

afterEach(() => {
  globalThis.ResizeObserver = realRO;
  geomSpies.splice(0).forEach((restore) => restore());
});

function installFiringResizeObserver() {
  globalThis.ResizeObserver = class {
    private cb: ResizeObserverCallback;
    constructor(cb: ResizeObserverCallback) {
      this.cb = cb;
    }
    observe(target: Element) {
      // 立即回调一次，驱动 radix 的溢出测量（真实浏览器 mount 后亦会量一次）
      this.cb([{ target } as ResizeObserverEntry], this);
    }
    unobserve() {}
    disconnect() {}
  };
}

describe('ScrollArea', () => {
  it('viewport 承接 children（纯样式增强、不改内容语义）+ 根/视口 Less 皮类', () => {
    render(
      <ScrollArea style={{ height: 120 }}>
        <p>可滚动内容</p>
      </ScrollArea>,
    );
    // children 原样渲进 viewport
    expect(screen.getByText('可滚动内容')).toBeInTheDocument();
    // 换肤靠这些类上色/取圆角
    const root = document.querySelector(`.${styles.root}`);
    const viewport = document.querySelector(`.${styles.viewport}`);
    expect(root).not.toBeNull();
    expect(viewport).not.toBeNull();
    expect(viewport).toContainElement(screen.getByText('可滚动内容'));
  });

  it('className 透传到根 + style（使用者定高度）落在根上', () => {
    render(
      <ScrollArea className="custom-box" style={{ maxHeight: 200 }}>
        <p>x</p>
      </ScrollArea>,
    );
    const root = document.querySelector(`.${styles.root}`) as HTMLElement;
    expect(root).toHaveClass('custom-box');
    expect(root.style.maxHeight).toBe('200px');
  });

  it('新行为：内容溢出时渲出带 Less 皮的自定义滚动条（默认纵向）', async () => {
    installFiringResizeObserver();
    mockOverflowGeometry();
    render(
      <ScrollArea style={{ height: 80 }}>
        <div style={{ height: 800 }}>高内容</div>
      </ScrollArea>,
    );
    await waitFor(() => {
      const bar = document.querySelector(`.${styles.scrollbar}`);
      expect(bar).not.toBeNull();
      // 默认 orientation=vertical → 纵向条（底层挂 data-orientation，.less 靠它选）
      expect(bar).toHaveAttribute('data-orientation', 'vertical');
    });
  });

  it('orientation="both"：溢出时纵横两条滚动条 + 角块都渲出', async () => {
    installFiringResizeObserver();
    mockOverflowGeometry();
    render(
      <ScrollArea orientation="both" style={{ width: 80, height: 80 }}>
        <div style={{ width: 800, height: 800 }}>大内容</div>
      </ScrollArea>,
    );
    await waitFor(() => {
      const bars = document.querySelectorAll(`.${styles.scrollbar}`);
      const orientations = Array.from(bars).map((b) =>
        b.getAttribute('data-orientation'),
      );
      expect(orientations).toContain('vertical');
      expect(orientations).toContain('horizontal');
      expect(document.querySelector(`.${styles.corner}`)).not.toBeNull();
    });
  });
});
