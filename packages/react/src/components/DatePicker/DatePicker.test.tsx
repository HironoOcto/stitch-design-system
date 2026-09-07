import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { DatePicker } from './DatePicker';
import { type DateRange } from '../Calendar';

const SEP_2026 = new Date(2026, 8, 1);

describe('DatePicker', () => {
  describe('rendering', () => {
    it('渲染字段触发器，未选时显示占位符', () => {
      render(<DatePicker aria-label="日期" placeholder="选个日子" />);
      const trigger = screen.getByRole('button', { name: '日期' });
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveTextContent('选个日子');
    });

    it('闭合态不渲染日历（grid）', () => {
      render(<DatePicker aria-label="日期" />);
      expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    });

    it('已选值按 format 展示', () => {
      render(
        <DatePicker
          aria-label="日期"
          defaultValue={new Date(2026, 8, 15)}
          format="yyyy/MM/dd"
        />,
      );
      expect(screen.getByRole('button', { name: '日期' })).toHaveTextContent(
        '2026/09/15',
      );
    });

    it('触发器 aria-haspopup=dialog', () => {
      render(<DatePicker aria-label="日期" />);
      expect(screen.getByRole('button', { name: '日期' })).toHaveAttribute(
        'aria-haspopup',
        'dialog',
      );
    });
  });

  describe('弹出 · 复用 Popover 装 Calendar', () => {
    it('点击触发器打开浮层，内含 Calendar 网格', async () => {
      const user = userEvent.setup();
      render(
        <DatePicker aria-label="日期" defaultValue={new Date(2026, 8, 1)} />,
      );
      await user.click(screen.getByRole('button', { name: '日期' }));
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });
  });

  describe('single 模式选择', () => {
    it('选一天 → onChange(Date)、回填字段、关闭浮层', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <DatePicker
          aria-label="日期"
          defaultValue={SEP_2026}
          onChange={onChange}
        />,
      );
      await user.click(screen.getByRole('button', { name: '日期' }));
      await user.click(screen.getByRole('button', { name: /September 12th/ }));
      const arg = onChange.mock.calls.at(-1)![0] as Date;
      expect(arg.getDate()).toBe(12);
      expect(screen.getByRole('button', { name: '日期' })).toHaveTextContent(
        '2026-09-12',
      );
      expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    });
  });

  describe('range 模式选择', () => {
    it('选起止两日 → onChange({from,to})、字段显示区间、关闭', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <DatePicker
          mode="range"
          aria-label="区间"
          // defaultPickerValue 把首屏钉在 2026-09（不依赖系统「今天」），
          // 无预选值 → 首点落起点、次点落终点，闭合后关闭。
          defaultPickerValue={SEP_2026}
          onChange={onChange}
        />,
      );
      await user.click(screen.getByRole('button', { name: '区间' }));
      await user.click(screen.getByRole('button', { name: /September 10th/ }));
      await user.click(screen.getByRole('button', { name: /September 20th/ }));
      const last = onChange.mock.calls.at(-1)![0] as DateRange;
      expect(last.from?.getDate()).toBe(10);
      expect(last.to?.getDate()).toBe(20);
      expect(screen.queryByRole('grid')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: '区间' })).toHaveTextContent(
        '2026-09-10 – 2026-09-20',
      );
    });
  });

  describe('allowClear', () => {
    it('有值默认显示清除按钮，点击清空且不打开浮层', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <DatePicker
          aria-label="日期"
          defaultValue={new Date(2026, 8, 15)}
          onChange={onChange}
        />,
      );
      const clear = screen.getByRole('button', { name: '清除' });
      await user.click(clear);
      expect(onChange).toHaveBeenLastCalledWith(undefined);
      expect(screen.queryByRole('grid')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: '日期' })).toHaveTextContent(
        '请选择日期',
      );
    });

    it('allowClear=false 不显示清除按钮', () => {
      render(
        <DatePicker
          aria-label="日期"
          allowClear={false}
          defaultValue={new Date(2026, 8, 15)}
        />,
      );
      expect(
        screen.queryByRole('button', { name: '清除' }),
      ).not.toBeInTheDocument();
    });
  });

  describe('受控 / 非受控', () => {
    it('受控 value：父级不回写则字段不变', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <DatePicker
          aria-label="日期"
          value={new Date(2026, 8, 5)}
          onChange={onChange}
        />,
      );
      await user.click(screen.getByRole('button', { name: '日期' }));
      await user.click(screen.getByRole('button', { name: /September 20th/ }));
      expect(onChange).toHaveBeenCalled();
      expect(screen.getByRole('button', { name: '日期' })).toHaveTextContent(
        '2026-09-05',
      );
    });

    it('受控 value：父级回写后字段同步', async () => {
      const user = userEvent.setup();
      const Host = () => {
        const [v, setV] = useState<Date | undefined>(new Date(2026, 8, 5));
        return (
          <DatePicker
            aria-label="日期"
            value={v}
            onChange={(next) => setV(next as Date | undefined)}
          />
        );
      };
      render(<Host />);
      await user.click(screen.getByRole('button', { name: '日期' }));
      await user.click(screen.getByRole('button', { name: /September 20th/ }));
      expect(screen.getByRole('button', { name: '日期' })).toHaveTextContent(
        '2026-09-20',
      );
    });

    it('受控 open：由父级控制浮层显隐', async () => {
      const onOpenChange = vi.fn();
      render(<DatePicker aria-label="日期" open onOpenChange={onOpenChange} />);
      // open 受控为 true → 一开始就展开
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });
  });

  describe('disabled', () => {
    it('禁用触发器：点击不打开、不显示清除', async () => {
      const user = userEvent.setup();
      render(
        <DatePicker
          aria-label="日期"
          disabled
          defaultValue={new Date(2026, 8, 15)}
        />,
      );
      const trigger = screen.getByRole('button', { name: '日期' });
      expect(trigger).toBeDisabled();
      await user.click(trigger);
      expect(screen.queryByRole('grid')).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: '清除' }),
      ).not.toBeInTheDocument();
    });
  });

  describe('a11y 契约', () => {
    it('触发器有可访问名（aria-label）', () => {
      render(<DatePicker aria-label="预约日期" />);
      expect(
        screen.getByRole('button', { name: '预约日期' }),
      ).toHaveAccessibleName('预约日期');
    });
  });
});
