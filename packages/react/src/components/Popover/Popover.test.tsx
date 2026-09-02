import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Popover } from './Popover';
import styles from './popover.module.less';

// 测试重点 = 我们写的那部分：props 透传 + Less 皮 + data-state 选态。
// 键盘 / 焦点 / ARIA 归底层（radix），冒烟即可、不重测。
describe('Popover', () => {
  it('trigger 渲染为触发器，浮层默认不在文档中', () => {
    render(<Popover trigger={<button>打开</button>}>浮层内容</Popover>);
    expect(screen.getByRole('button', { name: '打开' })).toBeInTheDocument();
    expect(screen.queryByText('浮层内容')).not.toBeInTheDocument();
  });

  it('点击 trigger 打开浮层，渲染 children（受控/非受控透传底层）', async () => {
    const user = userEvent.setup();
    render(
      <Popover trigger={<button>打开</button>}>
        <a href="#x">可交互链接</a>
      </Popover>,
    );
    await user.click(screen.getByRole('button', { name: '打开' }));
    expect(
      screen.getByRole('link', { name: '可交互链接' }),
    ).toBeInTheDocument();
  });

  it('Less 皮 + data-state 选态：浮层面挂 content 类且 data-state=open', async () => {
    const user = userEvent.setup();
    render(<Popover trigger={<button>打开</button>}>内容</Popover>);
    await user.click(screen.getByRole('button'));
    const surface = document.querySelector(`.${styles.content}`);
    expect(surface).not.toBeNull();
    // data-state 是底层自动挂的（.less 靠它选开合态），核准其确实为 open
    expect(surface).toHaveAttribute('data-state', 'open');
  });

  it('onOpenChange 在开合时透传回调', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Popover trigger={<button>打开</button>} onOpenChange={onOpenChange}>
        内容
      </Popover>,
    );
    await user.click(screen.getByRole('button'));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('className 透传到浮层面（与 content 基础类共存）', async () => {
    const user = userEvent.setup();
    render(
      <Popover trigger={<button>打开</button>} className="custom-surface">
        内容
      </Popover>,
    );
    await user.click(screen.getByRole('button'));
    const surface = document.querySelector(`.${styles.content}`);
    expect(surface).toHaveClass('custom-surface');
  });
});
