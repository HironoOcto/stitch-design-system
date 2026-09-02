import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToggleGroup, type ToggleGroupItem } from './ToggleGroup';

// Radix ToggleGroup 的 ARIA 随 type 变（已核准、见 预建笔记.md）：
// single → 根 role="radiogroup"、项 role="radio"（aria-checked）；
// multiple → 根 role="toolbar"、项为普通 <button>（aria-pressed）。
const ALIGN: ToggleGroupItem[] = [
  { value: 'left', label: '左对齐' },
  { value: 'center', label: '居中' },
  { value: 'right', label: '右对齐' },
];

const FORMAT: ToggleGroupItem[] = [
  { value: 'bold', label: '加粗' },
  { value: 'italic', label: '斜体' },
  { value: 'underline', label: '下划线' },
];

describe('ToggleGroup', () => {
  // 1. 基本渲染 —— single：radiogroup + 每项 radio（data-state=off）
  it('single 渲染 role="radiogroup" 与每项 radio，默认全 off', () => {
    render(<ToggleGroup type="single" items={ALIGN} aria-label="对齐" />);
    expect(
      screen.getByRole('radiogroup', { name: '对齐' }),
    ).toBeInTheDocument();
    const left = screen.getByRole('radio', { name: '左对齐' });
    expect(left).toHaveAttribute('data-state', 'off');
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  // 2. 新行为（测试重点）· single：点击选中 → data-state='on' + onChange 回标量
  it('single：点击选中项 → data-state=on 且 onChange 回标量值', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ToggleGroup
        type="single"
        items={ALIGN}
        onChange={onChange}
        aria-label="对齐"
      />,
    );
    const center = screen.getByRole('radio', { name: '居中' });
    await user.click(center);

    expect(center).toHaveAttribute('data-state', 'on');
    // onChange 回**标量**（非数组）
    expect(onChange).toHaveBeenLastCalledWith('center');
    expect(onChange).not.toHaveBeenCalledWith(['center']);
    // 单选互斥：其它项仍 off
    expect(screen.getByRole('radio', { name: '左对齐' })).toHaveAttribute(
      'data-state',
      'off',
    );
  });

  // 3. 新行为（测试重点）· single 互斥 + 取消选中回 ''
  it('single：改选切换互斥，取消选中回空串', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ToggleGroup
        type="single"
        items={ALIGN}
        defaultValue="left"
        onChange={onChange}
        aria-label="对齐"
      />,
    );
    // 改选 center：left off、onChange 回 center
    await user.click(screen.getByRole('radio', { name: '居中' }));
    expect(screen.getByRole('radio', { name: '左对齐' })).toHaveAttribute(
      'data-state',
      'off',
    );
    expect(onChange).toHaveBeenLastCalledWith('center');

    // 再点 center 取消 → 回空串
    await user.click(screen.getByRole('radio', { name: '居中' }));
    expect(onChange).toHaveBeenLastCalledWith('');
  });

  // 4. 新行为（测试重点）· multiple：toolbar + 多项可同时按下 + onChange 回数组
  it('multiple：role=toolbar，多项可同时选中，onChange 回数组值', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ToggleGroup
        type="multiple"
        items={FORMAT}
        onChange={onChange}
        aria-label="格式"
      />,
    );
    expect(screen.getByRole('toolbar', { name: '格式' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '加粗' }));
    expect(onChange).toHaveBeenLastCalledWith(['bold']);

    await user.click(screen.getByRole('button', { name: '斜体' }));
    // 回**数组**、两项并存
    expect(onChange).toHaveBeenLastCalledWith(['bold', 'italic']);
    expect(screen.getByRole('button', { name: '加粗' })).toHaveAttribute(
      'data-state',
      'on',
    );
    expect(screen.getByRole('button', { name: '斜体' })).toHaveAttribute(
      'data-state',
      'on',
    );
  });

  // 5. 受控 —— value 由父管，点击不自变、只回调；父回填后才变
  it('受控：value 由父决定，点击只回调不自变', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(
      <ToggleGroup
        type="single"
        items={ALIGN}
        value="left"
        onChange={onChange}
        aria-label="对齐"
      />,
    );
    expect(screen.getByRole('radio', { name: '左对齐' })).toHaveAttribute(
      'data-state',
      'on',
    );

    await user.click(screen.getByRole('radio', { name: '居中' }));
    // 受控：组件不自持，center 仍 off（等父回填）
    expect(screen.getByRole('radio', { name: '居中' })).toHaveAttribute(
      'data-state',
      'off',
    );
    expect(onChange).toHaveBeenCalledWith('center');

    rerender(
      <ToggleGroup
        type="single"
        items={ALIGN}
        value="center"
        onChange={onChange}
        aria-label="对齐"
      />,
    );
    expect(screen.getByRole('radio', { name: '居中' })).toHaveAttribute(
      'data-state',
      'on',
    );
  });

  // 6. 非受控 —— defaultValue 起始选中，内部自持切换
  it('非受控：defaultValue 起始选中且内部自持切换', async () => {
    const user = userEvent.setup();
    render(
      <ToggleGroup
        type="multiple"
        items={FORMAT}
        defaultValue={['bold']}
        aria-label="格式"
      />,
    );
    expect(screen.getByRole('button', { name: '加粗' })).toHaveAttribute(
      'data-state',
      'on',
    );
    await user.click(screen.getByRole('button', { name: '斜体' }));
    expect(screen.getByRole('button', { name: '斜体' })).toHaveAttribute(
      'data-state',
      'on',
    );
  });

  // 7. 按下态皮 —— 每项挂 item 类，选中态由 data-state='on' 暴露（.less 据此上软 accent 底皮）
  it('按下选中皮靠 data-state=on 生效（软 accent 底，同 Toolbar 分段）', async () => {
    const user = userEvent.setup();
    render(<ToggleGroup type="single" items={ALIGN} aria-label="对齐" />);
    const left = screen.getByRole('radio', { name: '左对齐' });
    // 每项挂我们的 item 类（css module 哈希名含 "item"）
    expect(left.className).toMatch(/item/);
    await user.click(left);
    // 选中态由 data-state 暴露（.less `.item[data-state='on']` 选中皮据此生效）
    expect(left).toHaveAttribute('data-state', 'on');
  });

  // 8. 图标项 —— icon 走 <Icon>，纯图标项以 value 作可访问名
  it('纯图标项经 <Icon> 渲染并以 value 作可访问名', () => {
    render(
      <ToggleGroup
        type="single"
        items={[{ value: 'grid', icon: 'menu' }]}
        aria-label="视图"
      />,
    );
    const btn = screen.getByRole('radio', { name: 'grid' });
    expect(btn.querySelector('svg')).toBeInTheDocument();
  });

  // 9. 禁用 —— 整组禁用点击不回调
  it('整组 disabled：点击不选中、不回调', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ToggleGroup
        type="single"
        items={ALIGN}
        disabled
        onChange={onChange}
        aria-label="对齐"
      />,
    );
    await user.click(screen.getByRole('radio', { name: '左对齐' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  // 10. 键盘冒烟 —— 归 Radix，冒烟证可聚焦 + 键触发选中
  it('键盘：可聚焦，Space 翻转 data-state（冒烟）', async () => {
    const user = userEvent.setup();
    render(<ToggleGroup type="single" items={ALIGN} aria-label="对齐" />);
    const left = screen.getByRole('radio', { name: '左对齐' });
    left.focus();
    expect(left).toHaveFocus();
    await user.keyboard(' ');
    expect(left).toHaveAttribute('data-state', 'on');
  });

  // className 透传（与内部类共存）
  it('className 透传到根', () => {
    render(
      <ToggleGroup
        type="single"
        items={ALIGN}
        className="my-tg"
        aria-label="对齐"
      />,
    );
    expect(screen.getByRole('radiogroup', { name: '对齐' })).toHaveClass(
      'my-tg',
    );
  });
});
