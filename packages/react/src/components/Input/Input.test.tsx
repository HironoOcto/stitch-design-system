import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input, type InputProps } from './Input';
import styles from './input.module.less';

const makeSetup = (props: Partial<InputProps> = {}) => {
  const onChange = vi.fn();
  const utils = render(<Input onChange={onChange} {...props} />);
  const getInput = () => screen.getByRole('textbox') as HTMLInputElement;
  return { onChange, getInput, user: userEvent.setup(), ...utils };
};

describe('Input', () => {
  // 1. 基本渲染
  describe('rendering', () => {
    it('渲染基础 textbox', () => {
      makeSetup();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('渲染 prefix / suffix', () => {
      makeSetup({
        prefix: <span data-testid="prefix">P</span>,
        suffix: <span data-testid="suffix">S</span>,
      });
      expect(screen.getByTestId('prefix')).toBeInTheDocument();
      expect(screen.getByTestId('suffix')).toBeInTheDocument();
    });
  });

  // 2. props → class 映射（遍历枚举）
  it('size 全部枚举映射到对应类', () => {
    const sizes = ['small', 'middle', 'large'] as const;
    for (const s of sizes) {
      const { unmount } = render(<Input size={s} />);
      expect(screen.getByRole('textbox').parentElement).toHaveClass(
        styles[`wrapper-${s}`],
      );
      unmount();
    }
  });

  it('status 全部枚举映射到对应类', () => {
    const statuses = ['error', 'warning'] as const;
    for (const st of statuses) {
      const { unmount } = render(<Input status={st} />);
      expect(screen.getByRole('textbox').parentElement).toHaveClass(
        styles[`wrapper-${st}`],
      );
      unmount();
    }
  });

  // 3. 原生属性透传
  it('placeholder / type / data-* / className 透传', () => {
    render(
      <Input
        placeholder="搜索"
        type="email"
        data-testid="in"
        className="custom"
      />,
    );
    const input = screen.getByTestId('in');
    expect(input).toHaveAttribute('placeholder', '搜索');
    expect(input).toHaveAttribute('type', 'email');
    // className 透传到最外层 wrapper
    expect(input.parentElement).toHaveClass('custom');
  });

  // 4. 交互事件 + 受控/非受控
  describe('uncontrolled', () => {
    it('defaultValue 设定初始值', () => {
      makeSetup({ defaultValue: 'hello' });
      expect(screen.getByRole('textbox')).toHaveValue('hello');
    });

    it('输入触发 onChange 且更新值', async () => {
      const { user, onChange, getInput } = makeSetup();
      await user.type(getInput(), 'ab');
      expect(onChange).toHaveBeenCalled();
      expect(getInput()).toHaveValue('ab');
    });
  });

  describe('controlled', () => {
    it('value 受控生效', async () => {
      const onChange = vi.fn();
      function Host() {
        const [v, setV] = useState('');
        return (
          <Input
            value={v}
            onChange={(e) => {
              setV(e.target.value);
              onChange(e.target.value);
            }}
          />
        );
      }
      render(<Host />);
      await userEvent.setup().type(screen.getByRole('textbox'), 'x');
      expect(onChange).toHaveBeenLastCalledWith('x');
      expect(screen.getByRole('textbox')).toHaveValue('x');
    });
  });

  // 5. 禁用 / 边界态 / 清除
  describe('disabled / clear', () => {
    it('disabled 时不可输入且 wrapper 加禁用类', async () => {
      const { user, onChange } = makeSetup({
        disabled: true,
        defaultValue: 'a',
      });
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
      await user.type(input, 'b');
      expect(onChange).not.toHaveBeenCalled();
      expect(input.parentElement).toHaveClass(styles['wrapper-disabled']);
    });

    it('allowClear 显示清除按钮，点击后清空并触发 onClear/onChange', async () => {
      const onClear = vi.fn();
      const onChange = vi.fn();
      render(
        <Input
          allowClear
          defaultValue="abc"
          onChange={onChange}
          onClear={onClear}
        />,
      );
      const clear = screen.getByRole('button');
      await userEvent.setup().click(clear);
      expect(onClear).toHaveBeenCalled();
      expect(onChange).toHaveBeenCalled();
      expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('');
    });

    it('allowClear 在空值时不渲染清除按钮', () => {
      render(<Input allowClear />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  // 6. 键盘操作
  it('清除按钮支持键盘聚焦与 Enter 触发', async () => {
    const onClear = vi.fn();
    render(<Input allowClear defaultValue="abc" onClear={onClear} />);
    const clear = screen.getByRole('button', { name: /清除/ });
    // 原生 button：可被 Tab 键聚焦
    clear.focus();
    expect(clear).toHaveFocus();
    await userEvent.setup().keyboard('{Enter}');
    expect(onClear).toHaveBeenCalled();
  });

  // 7. a11y 契约
  it('status=error 置 aria-invalid，可被 toBeInvalid 识别', () => {
    makeSetup({ status: 'error' });
    expect(screen.getByRole('textbox')).toBeInvalid();
  });

  it('清除按钮自定义 clearAriaLabel 可作可访问名', () => {
    render(<Input allowClear defaultValue="abc" clearAriaLabel="Clear" />);
    const btn = screen.getByRole('button', { name: 'Clear' });
    expect(btn).toHaveAccessibleName('Clear');
  });
});

// 真实事件契约：clear 派发的是完整 SyntheticEvent（非手搓假事件）
it('clear 触发的事件带 preventDefault / stopPropagation 方法', async () => {
  const onChange = vi.fn();
  render(
    <Input
      allowClear
      defaultValue="hello"
      name="username"
      onChange={onChange}
    />,
  );
  const clearBtn = screen.getByRole('button');
  await act(async () => {
    clearBtn.click();
    await new Promise((r) => setTimeout(r, 0));
  });
  const eventArg = onChange.mock.calls[0][0];
  expect(typeof eventArg.preventDefault).toBe('function');
  expect(typeof eventArg.stopPropagation).toBe('function');
});

it('clear 触发的事件 target 带真实 input 属性（name / type / id）', async () => {
  const onChange = vi.fn();
  render(
    <Input
      allowClear
      defaultValue="hello"
      name="username"
      type="email"
      id="my-input"
      onChange={onChange}
    />,
  );
  const clearBtn = screen.getByRole('button');
  await act(async () => {
    clearBtn.click();
    await new Promise((r) => setTimeout(r, 0));
  });
  const eventArg = onChange.mock.calls[0][0];
  expect(eventArg.target.name).toBe('username');
  expect(eventArg.target.type).toBe('email');
  expect(eventArg.target.id).toBe('my-input');
});

it('浏览器 autofill：DOM 值被自动填充（不经 onChange）时，animationstart 钩子补发 onChange', () => {
  // 回归：Chrome autofill 直接改 DOM value、不触发 React onChange，
  // 受控表单（如 Form）因此取不到值而误报必填。Input 用 :-webkit-autofill 的
  // 空动画侦测填充瞬间，补发一次真实 change，让受控层同步到自动填充值。
  const onChange = vi.fn();
  render(<Input value="" onChange={onChange} />);
  const input = screen.getByRole('textbox') as HTMLInputElement;

  // 模拟浏览器 autofill：绕过 React 直接写 DOM value
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value',
  )!.set!;
  setter.call(input, 'autofilled@example.com');

  // 命中 :-webkit-autofill 会跑 keyframes stitch-onautofillstart。
  // jsdom 的 fireEvent 不透传 animationName，这里手搓带 animationName 的原生事件
  // （真实 Chrome 会带上）派发，让 React 的 onAnimationStart 读到。
  const evt = new Event('animationstart', { bubbles: true });
  Object.defineProperty(evt, 'animationName', {
    value: 'stitch-onautofillstart',
  });
  act(() => {
    input.dispatchEvent(evt);
  });

  expect(onChange).toHaveBeenCalled();
  expect(onChange.mock.calls[0][0].target.value).toBe('autofilled@example.com');
});

it('非 autofill 的 animationstart 不误触发 onChange', () => {
  const onChange = vi.fn();
  render(<Input value="" onChange={onChange} />);
  const input = screen.getByRole('textbox');
  const evt = new Event('animationstart', { bubbles: true });
  Object.defineProperty(evt, 'animationName', {
    value: 'some-other-animation',
  });
  act(() => {
    input.dispatchEvent(evt);
  });
  expect(onChange).not.toHaveBeenCalled();
});
