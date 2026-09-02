import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OtpField } from './OtpField';
import styles from './otp-field.module.less';

// 测试重点 = 我们写的那部分：length→格数 + 值聚合→onChange + 受控/非受控 + Less 皮。
// 键盘 / 焦点 / 跳格 / 粘贴分发 / ARIA 归底层（radix），冒烟即可、不重测。
describe('OtpField', () => {
  it('length → 格数：渲染 length 个分格（带 Less 皮）', () => {
    render(<OtpField length={6} aria-label="验证码" />);
    const cells = screen.getAllByRole('textbox');
    expect(cells).toHaveLength(6);
    // Less 皮：每格挂 .input 类（换肤靠它上色）
    expect(document.querySelectorAll(`.${styles.input}`)).toHaveLength(6);
    expect(document.querySelector(`.${styles.root}`)).not.toBeNull();
  });

  it('值聚合 → onChange(整串)：逐格输入，回调回聚合后的整串', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<OtpField length={4} onChange={onChange} aria-label="验证码" />);
    const cells = screen.getAllByRole('textbox');
    cells[0]!.focus();
    await user.keyboard('1234');
    // 底层自动跳格 + 聚合，最后一次回调 = 整串（非单字符/数组）
    expect(onChange).toHaveBeenLastCalledWith('1234');
    expect(typeof onChange.mock.lastCall![0]).toBe('string');
  });

  it('非受控：defaultValue 铺进各格，组件自管', () => {
    render(<OtpField length={4} defaultValue="12" aria-label="验证码" />);
    const cells = screen.getAllByRole('textbox') as HTMLInputElement[];
    expect(cells[0]!.value).toBe('1');
    expect(cells[1]!.value).toBe('2');
    expect(cells[2]!.value).toBe('');
  });

  it('受控：value 由父管，输入后组件自身不改值（父未回传 → 停在原值）', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <OtpField
        length={4}
        value="99"
        onChange={onChange}
        aria-label="验证码"
      />,
    );
    const cells = screen.getAllByRole('textbox') as HTMLInputElement[];
    cells[2]!.focus();
    await user.keyboard('5');
    expect(onChange).toHaveBeenCalledWith('995');
    // 受控：父未回传新 value → 各格停在 "99"（不自持 state）
    expect(cells[0]!.value).toBe('9');
    expect(cells[1]!.value).toBe('9');
    expect(cells[2]!.value).toBe('');
  });

  it('Less 皮：禁用态底层给每格挂原生 disabled（.less 靠 :disabled 选态）', () => {
    render(<OtpField length={4} disabled aria-label="验证码" />);
    const cells = screen.getAllByRole('textbox') as HTMLInputElement[];
    cells.forEach((cell) => expect(cell).toBeDisabled());
  });

  it('className 透传到根分格容器（与 root 基础类共存）', () => {
    render(<OtpField length={4} className="custom-otp" aria-label="验证码" />);
    const root = document.querySelector(`.${styles.root}`)!;
    expect(root).toHaveClass('custom-otp');
  });
});
