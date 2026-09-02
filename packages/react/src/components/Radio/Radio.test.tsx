import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Radio, type RadioOption, type RadioProps } from './Radio';
import styles from './radio.module.less';

const baseOptions: RadioOption[] = [
  { label: 'Apple', value: 'a' },
  { label: 'Banana', value: 'b' },
  { label: 'Cherry', value: 'c', disabled: true },
];

const setup = (props: Partial<RadioProps> = {}) => {
  const onChange = vi.fn();
  const utils = render(
    <Radio options={baseOptions} onChange={onChange} {...props} />,
  );
  const getInputs = () => screen.getAllByRole('radio') as HTMLInputElement[];
  return { onChange, getInputs, user: userEvent.setup(), ...utils };
};

/** 受控包装：验证组件在父级 state 驱动下的同步行为（单选值）。 */
const ControlledHost = ({
  initial,
  onChange,
  ...rest
}: {
  initial?: string | number;
  onChange?: (v: string | number) => void;
} & Omit<RadioProps, 'value' | 'defaultValue' | 'onChange' | 'options'> &
  Partial<Pick<RadioProps, 'options'>>) => {
  const [val, setVal] = useState<string | number | undefined>(initial);
  return (
    <Radio
      options={baseOptions}
      {...rest}
      value={val}
      onChange={(v) => {
        setVal(v);
        onChange?.(v);
      }}
    />
  );
};

describe('Radio', () => {
  describe('rendering', () => {
    it('渲染所有选项 label 与对应 radio 输入', () => {
      const { getInputs } = setup();
      expect(getInputs()).toHaveLength(baseOptions.length);
      const group = screen.getByRole('radiogroup');
      baseOptions.forEach((o) => {
        expect(screen.getByText(String(o.label))).toBeInTheDocument();
        // a11y 契约：label 文本必须绑定到 input（用 within(radiogroup) 限定避免歧义）
        expect(within(group).getByLabelText(o.label as string)).toHaveRole(
          'radio',
        );
      });
    });

    it('挂载在 role="radiogroup" 容器中', () => {
      setup();
      const group = screen.getByRole('radiogroup');
      expect(within(group).getAllByRole('radio')).toHaveLength(
        baseOptions.length,
      );
    });

    it('应用 className 与 style 到根节点', () => {
      setup({ className: 'my-radio', style: { marginTop: 8 } });
      const group = screen.getByRole('radiogroup');
      expect(group).toHaveClass('my-radio');
      expect(group).toHaveStyle({ marginTop: '8px' });
    });

    it.each(['small', 'middle', 'large'] as const)('支持 size=%s', (size) => {
      setup({ size });
      const labels = screen
        .getAllByText(/Apple|Banana|Cherry/)
        .map((n) => n.closest('label')!);
      labels.forEach((l) => expect(l).toHaveClass(styles[size]));
    });

    it.each(['horizontal', 'vertical'] as const)(
      '支持 direction=%s',
      (direction) => {
        setup({ direction });
        expect(screen.getByRole('radiogroup')).toHaveClass(styles[direction]);
      },
    );

    it('所有 input 共享同一 name（单选语义）', () => {
      const { getInputs } = setup();
      const names = getInputs().map((i) => i.name);
      expect(new Set(names).size).toBe(1);
    });

    it('每个 input 拥有稳定且互不冲突的 id', () => {
      const { getInputs } = setup();
      const ids = getInputs().map((i) => i.id);
      expect(new Set(ids).size).toBe(ids.length);
      ids.forEach((id) => expect(id).toMatch(/^stitch-radio-/));
    });
  });

  describe('uncontrolled 模式', () => {
    it('使用 defaultValue 设置初始选中态', () => {
      const { getInputs } = setup({ defaultValue: 'b' });
      const [a, b] = getInputs();
      expect(a).not.toBeChecked();
      expect(b).toBeChecked();
    });

    it('点击选项 → 选中并触发 onChange', async () => {
      const { user, onChange, getInputs } = setup();
      await user.click(getInputs()[0]);
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenLastCalledWith('a');
      expect(getInputs()[0]).toBeChecked();
    });

    it('点击其他项 → 替换上一选中', async () => {
      const { user, onChange, getInputs } = setup({ defaultValue: 'a' });
      await user.click(getInputs()[1]);
      expect(onChange).toHaveBeenLastCalledWith('b');
      expect(getInputs()[1]).toBeChecked();
      expect(getInputs()[0]).not.toBeChecked();
    });
  });

  describe('controlled 模式', () => {
    it('value 受控，组件不会自更新', async () => {
      const onChange = vi.fn();
      render(<Radio options={baseOptions} value="" onChange={onChange} />);
      const inputs = screen.getAllByRole('radio') as HTMLInputElement[];
      await userEvent.click(inputs[0]);
      expect(onChange).toHaveBeenCalledWith('a');
      // 父级未回写 value，UI 必须保持未选中
      expect(inputs[0]).not.toBeChecked();
    });

    it('父级回写 value 后 UI 同步更新', async () => {
      const onChange = vi.fn();
      render(<ControlledHost onChange={onChange} />);
      const inputs = screen.getAllByRole('radio') as HTMLInputElement[];
      await userEvent.click(inputs[1]);
      expect(onChange).toHaveBeenLastCalledWith('b');
      expect(inputs[1]).toBeChecked();

      await userEvent.click(inputs[0]);
      expect(onChange).toHaveBeenLastCalledWith('a');
      expect(inputs[0]).toBeChecked();
      expect(inputs[1]).not.toBeChecked();
    });

    it('受控模式下传入 defaultValue 应被忽略', () => {
      render(<Radio options={baseOptions} value="b" defaultValue="a" />);
      const inputs = screen.getAllByRole('radio') as HTMLInputElement[];
      expect(inputs[0]).not.toBeChecked();
      expect(inputs[1]).toBeChecked();
    });
  });

  describe('disabled 行为', () => {
    it('单选项 disabled：点击不触发 onChange', async () => {
      const { user, onChange, getInputs } = setup();
      const cherry = getInputs()[2];
      expect(cherry).toBeDisabled();
      await user.click(cherry);
      expect(onChange).not.toHaveBeenCalled();
    });

    it('group 级 disabled：所有项都被禁用', async () => {
      const { user, onChange, getInputs } = setup({ disabled: true });
      getInputs().forEach((i) => expect(i).toBeDisabled());
      await user.click(getInputs()[0]);
      expect(onChange).not.toHaveBeenCalled();
      expect(screen.getByRole('radiogroup')).toHaveClass(styles.groupDisabled);
    });
  });

  describe('键盘可访问性', () => {
    it('ArrowRight 切换到下一启用项并触发 onChange', async () => {
      const { user, onChange, getInputs } = setup({ defaultValue: 'a' });
      getInputs()[0].focus();
      await user.keyboard('{ArrowRight}');
      expect(onChange).toHaveBeenLastCalledWith('b');
      expect(getInputs()[1]).toBeChecked();
    });

    it('ArrowLeft 切换到上一启用项', async () => {
      const { user, onChange, getInputs } = setup({ defaultValue: 'b' });
      getInputs()[1].focus();
      await user.keyboard('{ArrowLeft}');
      expect(onChange).toHaveBeenLastCalledWith('a');
    });

    it('Home/End 跳到首尾启用项（禁用项被跳过）', async () => {
      const { user, onChange, getInputs } = setup({ defaultValue: 'a' });
      getInputs()[0].focus();
      await user.keyboard('{End}');
      // 'c' 被禁用，End 走 enabledIndices 的最后一个 = 'b'
      expect(onChange).toHaveBeenLastCalledWith('b');
      await user.keyboard('{Home}');
      expect(onChange).toHaveBeenLastCalledWith('a');
    });

    it('roving tabindex：整组只有一个 Tab 停靠点', async () => {
      const { user, getInputs } = setup({ defaultValue: 'a' });
      await user.tab();
      // 焦点落在选中项，其余 input tabIndex=-1
      expect(getInputs()[0]).toHaveFocus();
      const tabbable = getInputs().filter((i) => i.tabIndex === 0);
      expect(tabbable).toHaveLength(1);
    });
  });

  describe('value 类型兼容', () => {
    it('支持 number 类型 value', async () => {
      const { user, onChange } = setup({
        options: [
          { label: 'One', value: 1 },
          { label: 'Two', value: 2 },
        ],
        defaultValue: 1,
      });
      const inputs = screen.getAllByRole('radio') as HTMLInputElement[];
      expect(inputs[0]).toBeChecked();
      await user.click(inputs[1]);
      expect(onChange).toHaveBeenLastCalledWith(2);
    });
  });
});
