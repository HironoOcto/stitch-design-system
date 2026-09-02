// 覆盖层（overlays 族）共享行为原语——Modal / Drawer 等 Portal + 焦点管理的浮层
// 都复用这一份，别各写一份（对外仅 hook，非公开组件，不进桶导出、不进 demo 发现）。
//
// 封装四件事（打开时生效、关闭/卸载时收尾）：
//   1. 焦点转移：记录触发元素 → 把焦点送进浮层第一个可聚焦元素
//   2. 焦点陷阱：Tab / Shift+Tab 在浮层内循环
//   3. Esc 关闭：调用 onEscape
//   4. 滚动锁：打开时锁 body 滚动
//   关闭时把焦点归还触发元素。
import { useEffect } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
].join(',');

/** 取容器内所有可聚焦元素（跳过 disabled / aria-hidden）。 */
export const getFocusable = (root: HTMLElement): HTMLElement[] =>
  Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) =>
      !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true',
  );

export interface UseOverlayOptions {
  /** 浮层是否打开 */
  open: boolean;
  /** 浮层根节点 ref（焦点陷阱与初始聚焦的范围） */
  containerRef: React.RefObject<HTMLElement | null>;
  /** 按下 Esc 时触发（通常 = 关闭） */
  onEscape?: () => void;
}

/**
 * 覆盖层通用行为：焦点转移 + 焦点陷阱 + Esc 关闭 + 滚动锁 + 焦点归还。
 * Modal / Drawer 共享，避免在每个浮层组件里重复实现。
 */
export function useOverlay({
  open,
  containerRef,
  onEscape,
}: UseOverlayOptions): void {
  // 打开时记录触发元素 + 把焦点送进浮层；关闭/卸载时归还焦点。
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    // 等下一个 macrotask，让浮层节点已挂载（createPortal 完成）。
    const id = window.setTimeout(() => {
      const container = containerRef.current;
      if (!container) return;
      const focusables = getFocusable(container);
      (focusables[0] ?? container).focus();
    }, 0);
    return () => {
      window.clearTimeout(id);
      previouslyFocused?.focus?.();
    };
  }, [open, containerRef]);

  // Esc 关闭 + Tab/Shift+Tab 焦点陷阱。
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onEscape?.();
        return;
      }
      if (e.key !== 'Tab') return;
      const container = containerRef.current;
      if (!container) return;
      const focusables = getFocusable(container);
      if (focusables.length === 0) {
        e.preventDefault();
        container.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey) {
        if (active === first || !container.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last || !container.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onEscape, containerRef]);

  // 打开时锁 body 滚动。
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);
}
