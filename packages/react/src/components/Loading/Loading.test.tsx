import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Loading } from './Loading';
import styles from './loading.module.less';

describe('Loading', () => {
  // 1. 基本渲染
  it('渲染 role="status" 遮罩 + 转圈', () => {
    render(<Loading />);
    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    expect(status.querySelector(`.${styles.spinner}`)).toBeInTheDocument();
  });

  // 2. props → class 映射（size 枚举）
  it.each([
    ['small', styles['spinner-small']],
    ['middle', styles['spinner-middle']],
    ['large', styles['spinner-large']],
  ] as const)('size=%s 映射到对应 spinner class', (size, cls) => {
    render(<Loading size={size} />);
    expect(
      screen.getByRole('status').querySelector(`.${cls}`),
    ).toBeInTheDocument();
  });

  // 3. 原生属性透传（className / style / aria-*）
  it('className / style 透传到遮罩根元素', () => {
    render(<Loading className="my-loading" style={{ zIndex: 9 }} />);
    const status = screen.getByRole('status');
    expect(status).toHaveClass('my-loading');
    expect(status.style.zIndex).toBe('9');
  });

  // 4. 交互（状态切换）：spinning=true 可见、aria-busy
  it('spinning=true 时不带 closing 类且 aria-busy=true', () => {
    render(<Loading spinning />);
    const status = screen.getByRole('status');
    expect(status).not.toHaveClass(styles.closing);
    expect(status).toHaveAttribute('aria-busy', 'true');
  });

  // 5. 边界态：spinning=false 淡出（closing）→ 定时后隐藏（hidden）
  it('spinning=false 加 closing 类，定时后加 hidden 类', () => {
    vi.useFakeTimers();
    render(<Loading spinning={false} />);
    const status = screen.getByRole('status');
    expect(status).toHaveClass(styles.closing);
    expect(status).not.toHaveAttribute('aria-busy');
    act(() => {
      vi.runAllTimers();
    });
    expect(status).toHaveClass(styles.hidden);
    vi.useRealTimers();
  });

  it('卸载时清理定时器（无内存泄漏 / 无卸载后 setState）', () => {
    vi.useFakeTimers();
    const { unmount } = render(<Loading spinning={false} />);
    unmount();
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    vi.useRealTimers();
  });

  // 6. 键盘：状态区无可聚焦控件（不劫持 Tab 焦点）
  it('遮罩内无可聚焦控件（键盘透明，不劫持焦点）', () => {
    render(<Loading tip="加载中" />);
    const status = screen.getByRole('status');
    expect(status.querySelector('button, a, input, [tabindex]')).toBeNull();
  });

  // 7. a11y 契约：可及名（tip 或默认「加载中」）
  it('无 tip 时可及名默认为「加载中」', () => {
    render(<Loading />);
    expect(screen.getByRole('status')).toHaveAccessibleName('加载中');
  });

  it('字符串 tip 作为可及名', () => {
    render(<Loading tip="正在保存" />);
    expect(screen.getByRole('status')).toHaveAccessibleName('正在保存');
    expect(screen.getByText('正在保存')).toBeInTheDocument();
  });
});
