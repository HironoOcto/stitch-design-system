import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Label } from './Label';
import styles from './label.module.less';

describe('Label', () => {
  // 1. 冒烟（tracer）—— 渲染 children 为标签文字
  it('渲染 children 为标签文字', () => {
    render(<Label>用户名</Label>);
    expect(screen.getByText('用户名')).toBeInTheDocument();
  });

  // 2. 新行为 —— htmlFor 关联控件 + 点标签聚焦控件（原生保证，冒烟一 case）
  it('htmlFor 关联控件：点标签聚焦目标控件', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Label htmlFor="nickname">昵称</Label>
        <input id="nickname" />
      </>,
    );
    const input = screen.getByRole('textbox');
    expect(input).not.toHaveFocus();

    await user.click(screen.getByText('昵称'));
    expect(input).toHaveFocus();
  });

  // 3. 挂 Less 皮类，并透传 className / style
  it('挂 Less 皮类并透传 className / style', () => {
    render(
      <Label className="my-label" style={{ opacity: 0.5 }}>
        标签
      </Label>,
    );
    const label = screen.getByText('标签');
    expect(label).toHaveClass(styles.root);
    expect(label).toHaveClass('my-label');
    expect(label).toHaveStyle({ opacity: '0.5' });
  });
});
