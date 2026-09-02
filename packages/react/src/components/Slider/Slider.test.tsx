import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Slider } from './Slider';
import styles from './slider.module.less';

// 测试重点 = 我们写的那部分：标量↔数组归一 + onValueChange→onChange + 受控/非受控 + Less 皮。
// 键盘 / 焦点 / ARIA 归底层（radix），冒烟即可、不重测。
describe('Slider', () => {
  it('单值：默认渲染一个 thumb（role="slider"）+ track/range Less 皮', () => {
    render(<Slider defaultValue={30} aria-label="音量" />);
    const thumbs = screen.getAllByRole('slider');
    expect(thumbs).toHaveLength(1);
    // Less 皮：track / range 类挂上（换肤靠它们上色）
    expect(document.querySelector(`.${styles.track}`)).not.toBeNull();
    expect(document.querySelector(`.${styles.range}`)).not.toBeNull();
    expect(document.querySelector(`.${styles.thumb}`)).not.toBeNull();
  });

  it('单值归一：键盘 ArrowRight 改值，onChange 回标量（arr[0]，非数组）', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Slider
        defaultValue={30}
        min={0}
        max={100}
        step={1}
        onChange={onChange}
        aria-label="音量"
      />,
    );
    screen.getByRole('slider').focus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(31);
    expect(Array.isArray(onChange.mock.calls[0]![0])).toBe(false);
  });

  it('区间归一：数组值渲两个 thumb，键盘改值 onChange 原样回数组', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Slider
        defaultValue={[20, 60]}
        min={0}
        max={100}
        step={1}
        onChange={onChange}
        aria-label="价格区间"
      />,
    );
    const thumbs = screen.getAllByRole('slider');
    expect(thumbs).toHaveLength(2);
    thumbs[0]!.focus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenCalledWith([21, 60]);
  });

  it('非受控：defaultValue 自管，键盘改值后 aria-valuenow 自更新', async () => {
    const user = userEvent.setup();
    render(<Slider defaultValue={30} min={0} max={100} aria-label="音量" />);
    const thumb = screen.getByRole('slider');
    expect(thumb).toHaveAttribute('aria-valuenow', '30');
    thumb.focus();
    await user.keyboard('{ArrowRight}');
    expect(thumb).toHaveAttribute('aria-valuenow', '31');
  });

  it('受控：value 由父管，onChange 后组件自身不改值（aria-valuenow 不动）', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Slider
        value={40}
        min={0}
        max={100}
        onChange={onChange}
        aria-label="音量"
      />,
    );
    const thumb = screen.getByRole('slider');
    thumb.focus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenCalledWith(41);
    // 受控：父未回传新 value → 组件停在 40（不自持 state）
    expect(thumb).toHaveAttribute('aria-valuenow', '40');
  });

  it('Less 皮：禁用态挂 data-disabled、朝向挂 data-orientation（.less 靠它选态）', () => {
    render(
      <Slider
        defaultValue={30}
        disabled
        orientation="vertical"
        aria-label="音量"
      />,
    );
    const root = document.querySelector(`.${styles.root}`)!;
    expect(root).toHaveAttribute('data-disabled');
    expect(root).toHaveAttribute('data-orientation', 'vertical');
    // 禁用时键盘不改值由底层保证（冒烟）：thumb 仍在但无 onChange 通路
    expect(screen.getByRole('slider')).toHaveAttribute('data-disabled');
  });

  it('className 透传到根轨道容器（与 root 基础类共存）', () => {
    render(
      <Slider defaultValue={30} className="custom-rail" aria-label="音量" />,
    );
    const root = document.querySelector(`.${styles.root}`)!;
    expect(root).toHaveClass('custom-rail');
  });
});
