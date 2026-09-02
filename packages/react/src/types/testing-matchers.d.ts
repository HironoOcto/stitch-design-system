// 测试 matcher 类型增强，让 tsc 认得运行期 expect.extend 的 matcher，
// 使 *.test.tsx / *.a11y.test.tsx 类型检查通过（lint 步的 tsc）。
// - jest-dom：`@testing-library/jest-dom/vitest` 自带 `declare module 'vitest'` 增强。
// - vitest-axe：其自带增强指向旧 `Vi` 命名空间，vitest 4 不再读 → 这里显式增强 `vitest`。
//   类型参数须与 vitest 的 `Assertion<T = any>` 逐字一致，否则声明合并失败。
import '@testing-library/jest-dom/vitest';
import type { AxeMatchers } from 'vitest-axe/matchers';

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Assertion<T = any> extends AxeMatchers {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
