import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CodeBlock } from './CodeBlock';
import styles from './codeblock.module.less';

describe('CodeBlock', () => {
  // 1. 基本渲染
  it('把 code 内容渲染到 pre 元素', () => {
    const code = "const a = 'hello';";
    const { container } = render(<CodeBlock code={code} />);
    const pre = container.querySelector('pre');
    expect(pre).toBeInTheDocument();
    expect(pre).toHaveClass(styles.codeBlock!);
    expect(pre?.textContent).toContain('const');
    expect(pre?.textContent).toContain('hello');
  });

  it('空 code 不挂掉', () => {
    const { container } = render(<CodeBlock code="" />);
    expect(container.querySelector('pre')).toBeInTheDocument();
  });

  // 2. props → 高亮 class 映射（token 类型走 .tok-* 角色 class）
  it('为代码片段产生带 .tok-* class 的高亮 span（非硬编码颜色）', () => {
    const { container } = render(
      <CodeBlock code="function foo() { return 1; }" />,
    );
    const pre = container.querySelector('pre')!;
    const spans = pre.querySelectorAll('span');
    expect(spans.length).toBeGreaterThan(0);
    // 关键字 function/return 命中 .tok-keyword
    expect(
      pre.querySelectorAll(`.${styles['tok-keyword']}`).length,
    ).toBeGreaterThan(0);
    // 数字 1 命中 .tok-number
    expect(
      pre.querySelectorAll(`.${styles['tok-number']}`).length,
    ).toBeGreaterThan(0);
    // 高亮不再用内联颜色（H2：无写死 hex）
    expect(pre.querySelector('span[style*="color"]')).toBeNull();
  });

  it('识别块注释 /* ... */ 为 comment token', () => {
    const { container } = render(<CodeBlock code="/* block */ x" />);
    const pre = container.querySelector('pre')!;
    expect(
      pre.querySelectorAll(`.${styles['tok-comment']}`).length,
    ).toBeGreaterThan(0);
  });

  it('识别 JSX 标签 <MyComp /> 为 jsx token', () => {
    const { container } = render(<CodeBlock code="<MyComp />" />);
    const pre = container.querySelector('pre')!;
    expect(pre.textContent).toContain('MyComp');
    expect(
      pre.querySelectorAll(`.${styles['tok-jsx']}`).length,
    ).toBeGreaterThan(0);
  });

  // 3. 原生属性透传（extends React.HTMLAttributes<HTMLPreElement>）
  it('透传 className / style / data-* 到 pre', () => {
    const { container } = render(
      <CodeBlock
        code="x"
        className="cb"
        style={{ marginTop: 8 }}
        data-testid="blk"
      />,
    );
    const pre = container.querySelector('pre') as HTMLElement;
    expect(pre).toHaveClass('cb');
    expect(pre).toHaveClass(styles.codeBlock!);
    expect(pre).toHaveStyle({ marginTop: '8px' });
    expect(pre).toHaveAttribute('data-testid', 'blk');
  });

  // 6. 键盘可达：可滚动代码区可聚焦（tabIndex=0）
  it('pre 可通过 Tab 聚焦（可滚动区域，tabIndex=0）', async () => {
    const user = userEvent.setup();
    render(<CodeBlock code="const x = 1;" />);
    const pre = screen.getByRole('group');
    expect(pre).toHaveAttribute('tabindex', '0');
    await user.tab();
    expect(pre).toHaveFocus();
  });

  // 7. a11y 契约：可及名
  it('默认有可及名「代码块」', () => {
    render(<CodeBlock code="x" />);
    expect(screen.getByRole('group')).toHaveAccessibleName('代码块');
  });

  it('aria-label 可覆盖默认可及名', () => {
    render(<CodeBlock code="x" aria-label="示例代码" />);
    expect(screen.getByRole('group')).toHaveAccessibleName('示例代码');
  });
});
