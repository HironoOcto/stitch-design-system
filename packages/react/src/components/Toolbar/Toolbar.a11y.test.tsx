import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Toolbar } from './Toolbar';
import { Icon } from '../Icon';

describe('Toolbar a11y', () => {
  it('默认混排（按钮 + 链接 + 分隔线 + 分段组）无 axe 违规', async () => {
    const { container } = render(
      <Toolbar aria-label="格式工具栏">
        <Toolbar.Button icon={<Icon name="search" />}>撤销</Toolbar.Button>
        <Toolbar.Button danger>删除</Toolbar.Button>
        <Toolbar.Separator />
        <Toolbar.ToggleGroup
          type="multiple"
          aria-label="文本格式"
          items={[
            { value: 'bold', label: '加粗' },
            { value: 'italic', icon: 'menu' },
          ]}
        />
        <Toolbar.Separator />
        <Toolbar.Link href="/help">帮助</Toolbar.Link>
      </Toolbar>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('分段组有选中项后仍无 axe 违规', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Toolbar aria-label="对齐工具栏">
        <Toolbar.ToggleGroup
          type="single"
          aria-label="文本对齐"
          items={[
            { value: 'left', label: '左对齐' },
            { value: 'center', label: '居中' },
          ]}
        />
      </Toolbar>,
    );
    await user.click(screen.getByRole('radio', { name: '居中' }));
    expect(await axe(container)).toHaveNoViolations();
  });
});
