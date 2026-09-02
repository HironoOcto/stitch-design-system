import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { CodeBlock } from './CodeBlock';

describe('CodeBlock a11y', () => {
  it('默认代码块无 axe 违规', async () => {
    const { container } = render(
      <CodeBlock code="const a = 1;" aria-label="示例一" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('多行 JSX 代码块无 axe 违规', async () => {
    const code = `function App() {\n  return <div className="app">hi</div>;\n}`;
    const { container } = render(<CodeBlock code={code} aria-label="示例二" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
