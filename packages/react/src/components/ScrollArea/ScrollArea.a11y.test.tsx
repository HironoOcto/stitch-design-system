import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { ScrollArea } from './ScrollArea';

// 纯样式增强件：无浮层、无 role="dialog"，键盘/焦点/ARIA 归底层，冒烟即可。
describe('ScrollArea a11y', () => {
  it('承接内容无 axe 违规', async () => {
    const { container } = render(
      <ScrollArea style={{ height: 120 }}>
        <div>
          <h2>标题</h2>
          <p>一段可滚动的正文内容。</p>
        </div>
      </ScrollArea>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
