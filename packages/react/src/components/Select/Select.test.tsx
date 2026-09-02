import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Select, type SelectOption, type SelectProps } from './Select';
import styles from './select.module.less';

const baseOptions: SelectOption[] = [
  { label: 'Apple', value: 'a' },
  { label: 'Banana', value: 'b' },
  { label: 'Cherry', value: 'c', disabled: true },
];

const setup = (props: Partial<SelectProps> = {}) => {
  const onChange = vi.fn();
  const utils = render(
    <Select
      options={baseOptions}
      onChange={onChange}
      aria-label="水果"
      {...props}
    />,
  );
  const getTrigger = () => screen.getByRole('combobox');
  return { onChange, getTrigger, user: userEvent.setup(), ...utils };
};

/** 受控包装：验证父级 state 驱动下的同步行为。 */
const ControlledHost = ({
  initial,
  onChange,
}: {
  initial?: string | number;
  onChange?: (v: string | number) => void;
}) => {
  const [val, setVal] = useState<string | number | undefined>(initial);
  return (
    <Select
      options={baseOptions}
      aria-label="水果"
      value={val}
      onChange={(v) => {
        setVal(v);
        onChange?.(v);
      }}
    />
  );
};

describe('Select', () => {
  describe('rendering', () => {
    it('闭合态渲染 combobox trigger，无 listbox', () => {
      setup();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('未选中显示 placeholder', () => {
      setup({ placeholder: '选水果' });
      expect(screen.getByText('选水果')).toBeInTheDocument();
    });

    it('已选中显示对应 label', () => {
      setup({ defaultValue: 'b' });
      expect(screen.getByRole('combobox')).toHaveTextContent('Banana');
    });

    it('应用 className 与 style 到根节点', () => {
      const { container } = setup({
        className: 'my-select',
        style: { marginTop: 8 },
      });
      const root = container.firstElementChild as HTMLElement;
      expect(root).toHaveClass('my-select');
      expect(root).toHaveStyle({ marginTop: '8px' });
    });

    it.each(['small', 'middle', 'large'] as const)('支持 size=%s', (size) => {
      setup({ size });
      expect(screen.getByRole('combobox')).toHaveClass(styles[size]);
    });

    it('trigger 拥有以 stitch-select 开头的稳定 id 前缀（aria-controls 关联 listbox）', async () => {
      const { user } = setup({ defaultValue: 'a' });
      await user.click(screen.getByRole('combobox'));
      const listbox = screen.getByRole('listbox');
      expect(listbox.id).toMatch(/^stitch-select-/);
      expect(screen.getByRole('combobox')).toHaveAttribute(
        'aria-controls',
        listbox.id,
      );
    });
  });

  describe('展开 / 收起', () => {
    it('点击 trigger 打开 listbox 并渲染所有选项', async () => {
      const { user } = setup();
      await user.click(screen.getByRole('combobox'));
      const listbox = screen.getByRole('listbox');
      expect(within(listbox).getAllByRole('option')).toHaveLength(
        baseOptions.length,
      );
      expect(screen.getByRole('combobox')).toHaveAttribute(
        'aria-expanded',
        'true',
      );
    });

    it('再次点击 trigger 收起', async () => {
      const { user } = setup();
      const trigger = screen.getByRole('combobox');
      await user.click(trigger);
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      await user.click(trigger);
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('点击浮层外关闭', async () => {
      const { user } = setup();
      await user.click(screen.getByRole('combobox'));
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      await user.click(document.body);
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('选中项标记 aria-selected=true', async () => {
      const { user } = setup({ defaultValue: 'a' });
      await user.click(screen.getByRole('combobox'));
      expect(screen.getByRole('option', { name: /Apple/ })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      expect(screen.getByRole('option', { name: /Banana/ })).toHaveAttribute(
        'aria-selected',
        'false',
      );
    });
  });

  describe('uncontrolled 模式', () => {
    it('点击选项 → 选中、触发 onChange、收起', async () => {
      const { user, onChange } = setup();
      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: /Banana/ }));
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenLastCalledWith('b');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(screen.getByRole('combobox')).toHaveTextContent('Banana');
    });

    it('defaultValue 设定初始选中', () => {
      setup({ defaultValue: 'b' });
      expect(screen.getByRole('combobox')).toHaveTextContent('Banana');
    });
  });

  describe('controlled 模式', () => {
    it('value 受控，父级不回写则 UI 不变', async () => {
      const onChange = vi.fn();
      render(
        <Select
          options={baseOptions}
          value="a"
          onChange={onChange}
          aria-label="水果"
        />,
      );
      await userEvent.click(screen.getByRole('combobox'));
      await userEvent.click(screen.getByRole('option', { name: /Banana/ }));
      expect(onChange).toHaveBeenLastCalledWith('b');
      // 父级未回写，trigger 仍显示 Apple
      expect(screen.getByRole('combobox')).toHaveTextContent('Apple');
    });

    it('父级回写 value 后 UI 同步', async () => {
      const onChange = vi.fn();
      render(<ControlledHost initial="a" onChange={onChange} />);
      await userEvent.click(screen.getByRole('combobox'));
      await userEvent.click(screen.getByRole('option', { name: /Banana/ }));
      expect(onChange).toHaveBeenLastCalledWith('b');
      expect(screen.getByRole('combobox')).toHaveTextContent('Banana');
    });

    it('受控模式下 defaultValue 被忽略', () => {
      render(
        <Select
          options={baseOptions}
          value="b"
          defaultValue="a"
          aria-label="水果"
        />,
      );
      expect(screen.getByRole('combobox')).toHaveTextContent('Banana');
    });
  });

  describe('disabled 行为', () => {
    it('整体 disabled：点击不展开', async () => {
      const { user, onChange } = setup({ disabled: true });
      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('aria-disabled', 'true');
      await user.click(trigger);
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(onChange).not.toHaveBeenCalled();
    });

    it('单项 disabled：点击不选中、不触发 onChange', async () => {
      const { user, onChange } = setup();
      await user.click(screen.getByRole('combobox'));
      const cherry = screen.getByRole('option', { name: /Cherry/ });
      expect(cherry).toHaveAttribute('aria-disabled', 'true');
      await user.click(cherry);
      expect(onChange).not.toHaveBeenCalled();
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
  });

  describe('键盘可访问性', () => {
    it('Enter 打开、ArrowDown 移动高亮、Enter 选中', async () => {
      const { user, onChange } = setup({ defaultValue: 'a' });
      const trigger = screen.getByRole('combobox');
      trigger.focus();
      await user.keyboard('{Enter}');
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      // active 起点在选中项 a；↓ 到 b（c 禁用被跳过）
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');
      expect(onChange).toHaveBeenLastCalledWith('b');
      expect(trigger).toHaveTextContent('Banana');
    });

    it('ArrowDown 跳过禁用项（wrap 回可用项）', async () => {
      const { user, onChange } = setup({ defaultValue: 'b' });
      const trigger = screen.getByRole('combobox');
      trigger.focus();
      await user.keyboard('{Enter}'); // 打开，active 落在选中项 b
      await user.keyboard('{ArrowDown}'); // b → 绕过禁用 c，wrap 回可用项 a
      await user.keyboard('{Enter}');
      expect(onChange).toHaveBeenLastCalledWith('a');
    });

    it('Escape 关闭并把焦点还给 trigger', async () => {
      const { user } = setup({ defaultValue: 'a' });
      const trigger = screen.getByRole('combobox');
      trigger.focus();
      await user.keyboard('{Enter}');
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      await user.keyboard('{Escape}');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(trigger).toHaveFocus();
    });

    it('disabled 时键盘不打开', async () => {
      const { user } = setup({ disabled: true });
      const trigger = screen.getByRole('combobox');
      trigger.focus();
      await user.keyboard('{Enter}');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('a11y 契约', () => {
    it('trigger 有可访问名（aria-label）', () => {
      setup();
      expect(screen.getByRole('combobox')).toHaveAccessibleName('水果');
    });

    it('number 类型 value 正常工作', async () => {
      const onChange = vi.fn();
      const { user } = setup({
        options: [
          { label: 'One', value: 1 },
          { label: 'Two', value: 2 },
        ],
        defaultValue: 1,
        onChange,
      });
      expect(screen.getByRole('combobox')).toHaveTextContent('One');
      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: /Two/ }));
      expect(onChange).toHaveBeenLastCalledWith(2);
    });
  });
});
