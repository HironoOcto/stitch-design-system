import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Select } from './Select';

const options = [
  { label: '苹果', value: 'a' },
  { label: '香蕉', value: 'b' },
  { label: '樱桃', value: 'c', disabled: true },
];

describe('Select a11y', () => {
  it('闭合态无 axe 违规', async () => {
    const { container } = render(
      <Select options={options} defaultValue="a" aria-label="水果" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('展开态（listbox 打开）无 axe 违规', async () => {
    const { container } = render(
      <Select options={options} defaultValue="a" aria-label="水果" />,
    );
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
