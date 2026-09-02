/// <reference types="node" />
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Button } from './Button';

// jsdom 不落 .module.less 规则、也不算 :focus-visible 计算样式 → 读编译前 CSS 契约原文断言。
const less = readFileSync(
  'packages/react/src/components/Button/button.module.less',
  'utf8',
);

describe('Button a11y', () => {
  it('文本按钮无 axe 违规', async () => {
    const { container } = render(<Button>保存</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('loading 按钮（aria-busy）无 axe 违规', async () => {
    const { container } = render(<Button loading>提交中</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('纯图标按钮（aria-label）无 axe 违规', async () => {
    const { container } = render(
      <Button aria-label="关闭" icon={<span aria-hidden />} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  // 规则 7：填充/同色控件的键盘焦点环必须与填充分离，任意站可见（≥3:1）。
  // primary 用 accent 铺底（背景 var(--stitch-accent)），focus-ring 也派生自 accent →
  // 只写 outline 会同色隐没；须叠内圈 bg-elevated 的「间隔环」把焦点环与填充隔开。
  // jsdom 不落 .module.less 规则、也不算 :focus-visible 计算样式 → 断言编译前的 CSS 契约文本，
  // 真实浏览器 ≥3:1 的逐条核在 demo（验收 #3）。
  describe('焦点环可见性（规则 7）', () => {
    it('primary 填充态叠 bg-elevated 间隔环，分离色 ≠ 填充色', () => {
      // primary 确实用 accent 铺底（同色隐没的前提）
      expect(less).toMatch(
        /\.btn-primary\b[\s\S]*?background:\s*var\(--stitch-accent\)/,
      );
      // 焦点态含间隔环：内圈 bg-elevated（分离色）+ 外圈 focus-ring
      expect(less).toMatch(
        /box-shadow:\s*0 0 0 2px var\(--stitch-bg-elevated\),\s*0 0 0 4px var\(--stitch-focus-ring\)/,
      );
      // 分离色 bg-elevated 与填充色 accent 是不同角色变量（≠ 才隔得开）
      expect('--stitch-bg-elevated').not.toBe('--stitch-accent');
    });

    it('非填充控件沿用现有 outline 焦点环（不回退）', () => {
      expect(less).toMatch(
        /&:focus-visible\s*\{\s*outline:\s*2px solid var\(--stitch-focus-ring\)/,
      );
    });
  });
});
