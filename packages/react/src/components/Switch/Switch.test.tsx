import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Switch, type SwitchProps } from './Switch';
import styles from './switch.module.less';

const setup = (props: Partial<SwitchProps> = {}) => {
  const onChange = vi.fn();
  const utils = render(<Switch onChange={onChange} {...props} />);
  const getSwitch = () => screen.getByRole('switch') as HTMLButtonElement;
  return { onChange, getSwitch, user: userEvent.setup(), ...utils };
};

/** 受控包装：验证组件在父级 state 驱动下的同步行为。 */
const ControlledHost = ({
  initial = false,
  onChange,
  ...rest
}: { initial?: boolean; onChange?: (c: boolean) => void } & Omit<
  SwitchProps,
  'checked' | 'defaultChecked' | 'onChange'
>) => {
  const [val, setVal] = useState(initial);
  return (
    <Switch
      {...rest}
      checked={val}
      onChange={(c) => {
        setVal(c);
        onChange?.(c);
      }}
    />
  );
};

describe('Switch', () => {
  describe('rendering', () => {
    it('挂载为 role="switch" 的 button', () => {
      const { getSwitch } = setup();
      expect(getSwitch()).toBeInTheDocument();
      expect(getSwitch()).toHaveAttribute('aria-checked', 'false');
      // a11y 契约：显式校验 role 属性被正确设置为 switch
      expect(getSwitch()).toHaveRole('switch');
    });

    it('应用 className 与 style 到根节点', () => {
      setup({ className: 'my-sw', style: { marginTop: 8 } });
      const sw = screen.getByRole('switch');
      expect(sw).toHaveClass('my-sw');
      expect(sw).toHaveStyle({ marginTop: '8px' });
    });

    it.each(['small', 'middle', 'large'] as const)('支持 size=%s', (size) => {
      setup({ size });
      expect(screen.getByRole('switch')).toHaveClass(styles[size]);
    });

    it('checkedChildren / unCheckedChildren 按状态显示', () => {
      const { rerender } = render(
        <Switch checked={false} checkedChildren="ON" unCheckedChildren="OFF" />,
      );
      expect(screen.getByText('OFF')).toBeInTheDocument();
      rerender(<Switch checked checkedChildren="ON" unCheckedChildren="OFF" />);
      expect(screen.getByText('ON')).toBeInTheDocument();
    });
  });

  describe('uncontrolled 模式', () => {
    it('defaultChecked=true 初始选中', () => {
      setup({ defaultChecked: true });
      expect(screen.getByRole('switch')).toHaveAttribute(
        'aria-checked',
        'true',
      );
    });

    it('点击切换并触发 onChange', async () => {
      const { user, onChange, getSwitch } = setup();
      await user.click(getSwitch());
      expect(onChange).toHaveBeenCalledWith(true);
      expect(getSwitch()).toHaveAttribute('aria-checked', 'true');
      await user.click(getSwitch());
      expect(onChange).toHaveBeenLastCalledWith(false);
    });
  });

  describe('controlled 模式', () => {
    it('checked 受控时组件不自更新', async () => {
      const onChange = vi.fn();
      render(<Switch checked={false} onChange={onChange} />);
      await userEvent.setup().click(screen.getByRole('switch'));
      expect(onChange).toHaveBeenCalledWith(true);
      // 父级未回写，UI 保持未选中
      expect(screen.getByRole('switch')).toHaveAttribute(
        'aria-checked',
        'false',
      );
    });

    it('父级回写后 UI 同步', async () => {
      const onChange = vi.fn();
      render(<ControlledHost onChange={onChange} />);
      const sw = screen.getByRole('switch');
      await userEvent.setup().click(sw);
      expect(onChange).toHaveBeenLastCalledWith(true);
      expect(sw).toHaveAttribute('aria-checked', 'true');
    });

    it('受控模式下传入 defaultChecked 应被忽略', () => {
      render(<Switch checked={false} defaultChecked />);
      expect(screen.getByRole('switch')).toHaveAttribute(
        'aria-checked',
        'false',
      );
    });
  });

  describe('disabled / loading', () => {
    it('disabled 时点击不触发 onChange', async () => {
      const { user, onChange, getSwitch } = setup({ disabled: true });
      expect(getSwitch()).toBeDisabled();
      await user.click(getSwitch());
      expect(onChange).not.toHaveBeenCalled();
    });

    it('loading 时点击不触发 onChange', () => {
      // loading 态 CSS 设了 pointer-events:none —— 用 fireEvent 绕开 user-event 的拦截
      const { onChange, getSwitch } = setup({ loading: true });
      fireEvent.click(getSwitch());
      expect(onChange).not.toHaveBeenCalled();
      expect(getSwitch()).toHaveClass(styles.loading);
      expect(getSwitch()).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('键盘可访问性', () => {
    it('Space 键 toggle', async () => {
      const { user, onChange, getSwitch } = setup();
      getSwitch().focus();
      await user.keyboard(' ');
      expect(onChange).toHaveBeenLastCalledWith(true);
      await user.keyboard(' ');
      expect(onChange).toHaveBeenLastCalledWith(false);
    });

    it('Enter 键 toggle', async () => {
      const { user, onChange, getSwitch } = setup();
      getSwitch().focus();
      await user.keyboard('{Enter}');
      expect(onChange).toHaveBeenLastCalledWith(true);
    });

    it('disabled 时键盘不响应', async () => {
      const { user, onChange, getSwitch } = setup({ disabled: true });
      getSwitch().focus();
      await user.keyboard(' ');
      expect(onChange).not.toHaveBeenCalled();
    });

    it('aria-label 作为可访问名被读出', () => {
      render(<Switch aria-label="深色模式" />);
      const btn = screen.getByRole('switch');
      expect(btn).toHaveAttribute('aria-label', '深色模式');
      // a11y 契约：aria-label 必须作为可访问名被屏幕阅读器读出
      expect(btn).toHaveAccessibleName('深色模式');
    });
  });
});
