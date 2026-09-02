// 全局测试 setup：DOM 断言 + 无障碍断言 matcher。
// - @testing-library/jest-dom：toBeInTheDocument / toHaveFocus 等（test:run + test:a11y 共用）。
// - vitest-axe：toHaveNoViolations（test:a11y 用）。
import '@testing-library/jest-dom/vitest';
import * as axeMatchers from 'vitest-axe/matchers';
import { expect } from 'vitest';

expect.extend(axeMatchers);

// jsdom 缺失、radix 浮层原语（Popover/Dropdown/Select… 的定位与 Arrow）运行时需要的 API。
// 全批 radix 预建组件共用，缺则报 `ResizeObserver is not defined` 等。
if (!('ResizeObserver' in globalThis)) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.setPointerCapture = () => {};
  Element.prototype.releasePointerCapture = () => {};
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
