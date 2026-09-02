import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Slider } from './Slider';

describe('Slider a11y', () => {
  it('单值 + aria-label 无 axe 违规', async () => {
    const { container } = render(
      <Slider defaultValue={40} aria-label="音量" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('区间（双 thumb）+ aria-label 无 axe 违规', async () => {
    const { container } = render(
      <Slider defaultValue={[20, 60]} aria-label="价格区间" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('禁用态无 axe 违规', async () => {
    const { container } = render(
      <Slider defaultValue={40} disabled aria-label="音量" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
