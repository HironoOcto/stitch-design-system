/// <reference types="node" />
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Switch } from './Switch';

// jsdom 不落 .module.less 规则、也不算 :focus-visible 计算样式 → 读编译前 CSS 契约原文断言。
const less = readFileSync(
  'packages/react/src/components/Switch/switch.module.less',
  'utf8',
);

describe('Switch a11y', () => {
  it('带 aria-label 的开关无 axe 违规', async () => {
    const { container } = render(<Switch aria-label="深色模式" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('选中 + disabled 态无 axe 违规', async () => {
    const { container } = render(
      <Switch aria-label="通知" defaultChecked disabled />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  // 规则 7：checked 轨用 accent 铺底，与派生自 accent 的 focus-ring 同色 → 须叠间隔环。
  // 断言编译前的 CSS 契约文本；真实浏览器 ≥3:1 逐条核在 demo（验收 #3）。
  describe('焦点环可见性（规则 7）', () => {
    it('checked 填充态叠 bg-elevated 间隔环，分离色 ≠ 填充色', () => {
      expect(less).toMatch(
        /\.checked\b[\s\S]*?background:\s*var\(--stitch-accent\)/,
      );
      expect(less).toMatch(
        /box-shadow:\s*0 0 0 2px var\(--stitch-bg-elevated\),\s*0 0 0 4px var\(--stitch-focus-ring\)/,
      );
    });

    it('未选中态沿用现有 outline 焦点环（不回退）', () => {
      expect(less).toMatch(
        /&:focus-visible\s*\{\s*outline:\s*2px solid var\(--stitch-focus-ring\)/,
      );
    });
  });
});
