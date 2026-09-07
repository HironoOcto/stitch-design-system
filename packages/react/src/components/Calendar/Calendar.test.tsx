import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Calendar, type DateRange } from './Calendar';
import styles from './calendar.module.less';

// 固定月份，日期文案确定（可及名如 "Tuesday, September 1st, 2026"）。
const SEP_2026 = new Date(2026, 8, 1);

describe('Calendar', () => {
  describe('rendering', () => {
    it('渲染月份网格（role=grid），grid 可及名为当月', () => {
      render(<Calendar defaultMonth={SEP_2026} />);
      const grid = screen.getByRole('grid');
      expect(grid).toBeInTheDocument();
      expect(grid).toHaveAccessibleName('September 2026');
    });

    it('captionLayout="label" 显示静态标题「September 2026」', () => {
      render(<Calendar defaultMonth={SEP_2026} captionLayout="label" />);
      expect(screen.getByText('September 2026')).toBeInTheDocument();
      // label 模式无月/年下拉
      expect(
        screen.queryByRole('combobox', { name: /Month/i }),
      ).not.toBeInTheDocument();
    });

    it('captionLayout="dropdown"（默认）月/年复用主题 Select（非原生弹窗），显示当前值', () => {
      render(<Calendar defaultMonth={SEP_2026} />);
      // 复用的 Select trigger 是 role="combobox"，回显所选 label
      expect(
        screen.getByRole('combobox', { name: /Month/i }),
      ).toHaveTextContent('September');
      expect(screen.getByRole('combobox', { name: /Year/i })).toHaveTextContent(
        '2026',
      );
    });

    it('选年份下拉 → 跳到该年（grid 可及名更新）', async () => {
      const user = userEvent.setup();
      render(<Calendar defaultMonth={SEP_2026} />);
      await user.click(screen.getByRole('combobox', { name: /Year/i }));
      await user.click(screen.getByRole('option', { name: '2020' }));
      expect(screen.getByRole('grid')).toHaveAccessibleName('September 2020');
    });

    it('可选到未来年份（年份范围含今年之后）', async () => {
      const user = userEvent.setup();
      render(<Calendar defaultMonth={SEP_2026} />);
      await user.click(screen.getByRole('combobox', { name: /Year/i }));
      const future = String(new Date().getFullYear() + 5);
      expect(screen.getByRole('option', { name: future })).toBeInTheDocument();
    });

    it('渲染当月每一天为可聚焦的日按钮', () => {
      render(<Calendar defaultMonth={SEP_2026} />);
      expect(
        screen.getByRole('button', { name: /September 1st, 2026/ }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /September 30th, 2026/ }),
      ).toBeInTheDocument();
    });

    it('应用 className 到根节点', () => {
      const { container } = render(
        <Calendar defaultMonth={SEP_2026} className="my-cal" />,
      );
      expect(container.querySelector('.my-cal')).toBeInTheDocument();
    });

    it('翻月箭头经 <Icon> 渲染（无库自带 rdp-chevron svg）', () => {
      const { container } = render(<Calendar defaultMonth={SEP_2026} />);
      expect(container.querySelector('.rdp-chevron')).not.toBeInTheDocument();
      // 上一月 / 下一月按钮各有可及名
      expect(
        screen.getByRole('button', { name: /Previous Month/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Next Month/i }),
      ).toBeInTheDocument();
    });
  });

  describe('single 模式 · 非受控', () => {
    it('点击某日 → 选中并触发 onChange(Date)', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Calendar defaultMonth={SEP_2026} onChange={onChange} />);
      await user.click(screen.getByRole('button', { name: /September 10th/ }));
      expect(onChange).toHaveBeenCalledTimes(1);
      const arg = onChange.mock.calls[0][0] as Date;
      expect(arg).toBeInstanceOf(Date);
      expect(arg.getFullYear()).toBe(2026);
      expect(arg.getMonth()).toBe(8);
      expect(arg.getDate()).toBe(10);
    });

    it('defaultValue 设定初始选中日', () => {
      render(
        <Calendar
          defaultMonth={SEP_2026}
          defaultValue={new Date(2026, 8, 15)}
        />,
      );
      const cell = screen
        .getByRole('button', { name: /September 15th/ })
        .closest('td');
      expect(cell).toHaveClass(styles.selected);
    });
  });

  describe('single 模式 · 受控', () => {
    it('受控 value：父级不回写则选中不变', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <Calendar
          defaultMonth={SEP_2026}
          value={new Date(2026, 8, 5)}
          onChange={onChange}
        />,
      );
      await user.click(screen.getByRole('button', { name: /September 20th/ }));
      expect(onChange).toHaveBeenCalledTimes(1);
      // 未回写：仍选中 5 号
      expect(
        screen.getByRole('button', { name: /September 5th/ }).closest('td'),
      ).toHaveClass(styles.selected);
    });

    it('父级回写 value 后选中同步', async () => {
      const user = userEvent.setup();
      const Host = () => {
        const [v, setV] = useState<Date | undefined>(new Date(2026, 8, 5));
        return (
          <Calendar
            defaultMonth={SEP_2026}
            value={v}
            onChange={(next) => setV(next as Date | undefined)}
          />
        );
      };
      render(<Host />);
      await user.click(screen.getByRole('button', { name: /September 20th/ }));
      expect(
        screen.getByRole('button', { name: /September 20th/ }).closest('td'),
      ).toHaveClass(styles.selected);
    });
  });

  describe('range 模式', () => {
    it('依次点两日 → onChange 收到 {from,to} 且中段有 range 底', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <Calendar mode="range" defaultMonth={SEP_2026} onChange={onChange} />,
      );
      await user.click(screen.getByRole('button', { name: /September 10th/ }));
      await user.click(screen.getByRole('button', { name: /September 14th/ }));
      const last = onChange.mock.calls.at(-1)![0] as DateRange;
      expect(last.from?.getDate()).toBe(10);
      expect(last.to?.getDate()).toBe(14);
      // 中段（12 号）落 rangeMiddle
      expect(
        screen.getByRole('button', { name: /September 12th/ }).closest('td'),
      ).toHaveClass(styles.rangeMiddle);
    });
  });

  describe('禁用', () => {
    it('disabledDate 命中的日按钮禁用、点击不触发 onChange', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <Calendar
          defaultMonth={SEP_2026}
          onChange={onChange}
          disabledDate={(d) => d.getDate() === 10}
        />,
      );
      const btn = screen.getByRole('button', { name: /September 10th/ });
      expect(btn).toBeDisabled();
      await user.click(btn);
      expect(onChange).not.toHaveBeenCalled();
    });

    it('整块 disabled：所有日按钮禁用', () => {
      render(<Calendar defaultMonth={SEP_2026} disabled />);
      expect(
        screen.getByRole('button', { name: /September 10th/ }),
      ).toBeDisabled();
    });
  });

  describe('键盘可访问性', () => {
    it('方向键移动焦点、Enter 选中当前焦点日', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <Calendar
          defaultMonth={SEP_2026}
          defaultValue={new Date(2026, 8, 10)}
          onChange={onChange}
        />,
      );
      // 选中日是 roving tabindex 的焦点起点
      const start = screen.getByRole('button', { name: /September 10th/ });
      start.focus();
      await user.keyboard('{ArrowRight}'); // → 11 号
      expect(
        screen.getByRole('button', { name: /September 11th/ }),
      ).toHaveFocus();
      await user.keyboard('{Enter}');
      const arg = onChange.mock.calls.at(-1)![0] as Date;
      expect(arg.getDate()).toBe(11);
    });
  });

  describe('a11y 契约', () => {
    it('日按钮有完整日期可及名，翻月按钮有可及名', () => {
      render(<Calendar defaultMonth={SEP_2026} />);
      expect(
        screen.getByRole('button', { name: /September 1st, 2026/ }),
      ).toHaveAccessibleName(/September 1st, 2026/);
      expect(
        screen.getByRole('button', { name: /Previous Month/i }),
      ).toHaveAccessibleName(/Previous Month/i);
    });
  });
});
