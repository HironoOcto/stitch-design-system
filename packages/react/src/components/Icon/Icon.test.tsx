import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Icon, ICON_LIST } from './Icon';
import styles from './icon.module.less';

describe('Icon', () => {
  // 1. 基本渲染：name 模式渲染内联 <svg>，根节点带基础类 + data-icon
  it('name 模式渲染内联 svg，根节点带基础类与 data-icon', () => {
    const { container } = render(<Icon name="check" />);
    const root = container.firstChild as HTMLElement;
    expect(root.tagName).toBe('SPAN');
    expect(root).toHaveClass(styles.icon);
    expect(root).toHaveAttribute('data-icon', 'check');
    expect(root.querySelector('svg')).toBeTruthy();
  });

  // 2. props → 渲染映射：每个具名图标都渲染出对应 data-icon + svg
  it('为每个具名图标渲染对应 svg 与 data-icon', () => {
    ICON_LIST.forEach(({ name }) => {
      const { container } = render(<Icon name={name} />);
      const root = container.firstChild as HTMLElement;
      expect(root).toHaveAttribute('data-icon', name);
      expect(root.querySelector('svg path')).toBeTruthy();
    });
  });

  // 3a. size：数字 → 内联 px 宽高
  it('size 数字应用为内联 width/height（px）', () => {
    const { container } = render(<Icon name="close" size={32} />);
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveStyle({ width: '32px', height: '32px' });
  });

  // 3b. size：字符串原样透传
  it('支持字符串 size（如 100%）', () => {
    const { container } = render(<Icon name="close" size="100%" />);
    expect(container.firstChild).toHaveStyle({ width: '100%' });
  });

  // 3c. 默认 size 24
  it('未传 size 时默认 24px', () => {
    const { container } = render(<Icon name="check" />);
    expect(container.firstChild).toHaveStyle({ width: '24px', height: '24px' });
  });

  // 4. src 模式：设置 backgroundImage，无内联 svg
  it('src 模式设置 backgroundImage 且不渲染 svg', () => {
    const { container } = render(<Icon src="/foo/logo.png" />);
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveStyle({ backgroundImage: 'url(/foo/logo.png)' });
    expect(root.querySelector('svg')).toBeNull();
  });

  // 4b. name 与 src 同时给：name 优先渲染 svg，不设 backgroundImage
  it('同时传 name 与 src：name 优先渲染 svg', () => {
    const { container } = render(<Icon name="search" src="/foo/logo.png" />);
    const root = container.firstChild as HTMLElement;
    expect(root.querySelector('svg')).toBeTruthy();
    expect(root.style.backgroundImage).toBe('');
  });

  // 5. 透传：className / style / data-* 到根节点，style 可覆盖尺寸
  it('应用自定义 className 与 style，并透传 data-*', () => {
    const { container } = render(
      <Icon
        name="check"
        className="extra"
        style={{ opacity: 0.5 }}
        data-testid="my-icon"
      />,
    );
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass(styles.icon);
    expect(root).toHaveClass('extra');
    expect(root).toHaveStyle({ opacity: '0.5' });
    expect(root).toHaveAttribute('data-testid', 'my-icon');
  });

  it('style 可覆盖默认的 width/height', () => {
    const { container } = render(
      <Icon name="check" size={32} style={{ width: 50 }} />,
    );
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveStyle({ width: '50px', height: '32px' });
  });

  // 6. a11y — label 给出：作为可访问名（role=img + aria-label）
  it('label 提供时作为可访问名（role=img）', () => {
    const { container } = render(<Icon name="search" label="搜索" />);
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveAttribute('role', 'img');
    expect(root).toHaveAccessibleName('搜索');
  });

  // 6b. a11y — 无 label：装饰性，aria-hidden，不在可及性树内
  it('未提供 label 时为装饰性（aria-hidden，不在可及性树）', () => {
    const { container } = render(<Icon name="menu" />);
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveAttribute('aria-hidden', 'true');
    expect(root).not.toHaveAttribute('role', 'img');
  });

  // 7. 边界：无 name 无 src → 只有基础类、无 svg、无 backgroundImage、无 data-icon
  it('既无 name 也无 src：只有基础类，无 svg / backgroundImage / data-icon', () => {
    const { container } = render(<Icon />);
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass(styles.icon);
    expect(root.querySelector('svg')).toBeNull();
    expect(root.style.backgroundImage).toBe('');
    expect(root).not.toHaveAttribute('data-icon');
  });

  // ICON_LIST 契约：非空、无重复、每项带非空 label
  it('ICON_LIST 具名图标无重复且每项带非空 label', () => {
    const names = ICON_LIST.map((i) => i.name);
    expect(names.length).toBeGreaterThan(0);
    expect(new Set(names).size).toBe(names.length);
    ICON_LIST.forEach(({ label }) => {
      expect(typeof label).toBe('string');
      expect(label.length).toBeGreaterThan(0);
    });
  });

  // onClick 透传（Icon 是纯呈现件，不内建交互，但透传原生事件）
  it('透传原生事件（onClick）', async () => {
    const onClick = vi.fn();
    const { container } = render(
      <Icon name="check" label="确认" onClick={onClick} />,
    );
    (container.firstChild as HTMLElement).click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  // 描边：默认走角色变量（svg 无内联 stroke-width，仅保留 fallback 属性）
  it('默认不设内联 stroke-width（走角色变量），保留 fallback 属性', () => {
    const { container } = render(<Icon name="check" />);
    const svg = container.querySelector('svg') as SVGElement;
    expect(svg.style.strokeWidth).toBe('');
    expect(svg.getAttribute('stroke-width')).toBe('2');
  });

  // 描边：strokeWidth prop 一次性覆盖（内联 style 于 svg，胜过角色变量）
  it('strokeWidth prop 以内联 style 覆盖描边', () => {
    const { container } = render(<Icon name="check" strokeWidth={1} />);
    const svg = container.querySelector('svg') as SVGElement;
    expect(svg.style.strokeWidth).toBe('1');
  });

  // 趋势箭头：Stat 的涨/跌趋势经 <Icon> 出，两枚方向图标各渲染出对应 path（非内联 svg）。
  it('趋势箭头 arrow-up-right / arrow-down-right 各渲染对应 svg path', () => {
    for (const name of ['arrow-up-right', 'arrow-down-right'] as const) {
      const { container } = render(<Icon name={name} />);
      const root = container.firstChild as HTMLElement;
      expect(root).toHaveAttribute('data-icon', name);
      expect(root.querySelector('svg path')).toBeTruthy();
    }
  });
});
