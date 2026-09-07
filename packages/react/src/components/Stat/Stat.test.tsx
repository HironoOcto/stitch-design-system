import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Stat } from './Stat';
import { StatGroup } from './StatGroup';
import styles from './stat.module.less';

describe('Stat', () => {
  // 1. 基本渲染：标签 + 值都出
  it('渲染标签与值', () => {
    render(<Stat title="Unique Visitors" value={9600} />);
    expect(screen.getByText('Unique Visitors')).toBeInTheDocument();
    // 默认千分位分隔
    expect(screen.getByText('9,600')).toBeInTheDocument();
  });

  // 2. 数值格式化：precision + groupSeparator + prefix/suffix
  it('number 值按 precision 与 groupSeparator 格式化，并包 prefix/suffix', () => {
    render(
      <Stat
        title="Revenue"
        value={1234567.5}
        precision={2}
        groupSeparator=","
        prefix="$"
        suffix="USD"
      />,
    );
    expect(screen.getByText('1,234,567.50')).toBeInTheDocument();
    expect(screen.getByText('$')).toBeInTheDocument();
    expect(screen.getByText('USD')).toBeInTheDocument();
  });

  // 2b. formatter 优先：接管格式化，precision/groupSeparator 失效
  it('给 formatter 时接管数值格式化', () => {
    render(<Stat value={553} precision={2} formatter={(v) => `${v} online`} />);
    expect(screen.getByText('553 online')).toBeInTheDocument();
    expect(screen.queryByText('553.00')).not.toBeInTheDocument();
  });

  // 2c. string 值原样展示（不套千分位/精度）
  it('string 值原样展示', () => {
    render(<Stat title="Avg. Duration" value="9m 13s" />);
    expect(screen.getByText('9m 13s')).toBeInTheDocument();
  });

  // 3. 趋势 props → class 映射：涨 = 正向语义色类
  it('trend up 走正向语义类（success）且出上升箭头', () => {
    const { container } = render(
      <Stat value={100} trend={{ value: 12, direction: 'up' }} />,
    );
    const trend = container.querySelector(`.${styles['stat-trend']}`)!;
    expect(trend).toHaveClass(styles['stat-trend-positive']);
    expect(trend).not.toHaveClass(styles['stat-trend-negative']);
    expect(trend.querySelector('[data-icon="arrow-up-right"]')).toBeTruthy();
    // 变化量以绝对值展示
    expect(trend).toHaveTextContent('12');
  });

  // 3b. 趋势 props → class 映射：跌 = 负向语义色类
  it('trend down 走负向语义类（danger）且出下降箭头', () => {
    const { container } = render(
      <Stat value={100} trend={{ value: -8, direction: 'down' }} />,
    );
    const trend = container.querySelector(`.${styles['stat-trend']}`)!;
    expect(trend).toHaveClass(styles['stat-trend-negative']);
    expect(trend.querySelector('[data-icon="arrow-down-right"]')).toBeTruthy();
    expect(trend).toHaveTextContent('8');
  });

  // 3c. 反转开关：跌是好事 → down 走正向语义类（方向不变、配色对调）
  it('trendReversed 时 down 走正向语义类（跌是好事）', () => {
    const { container } = render(
      <Stat
        title="Bounce Rate"
        value={42}
        suffix="%"
        trend={{ value: 5, direction: 'down' }}
        trendReversed
      />,
    );
    const trend = container.querySelector(`.${styles['stat-trend']}`)!;
    expect(trend).toHaveClass(styles['stat-trend-positive']);
    // 方向仍是下降 → 下降箭头
    expect(trend.querySelector('[data-icon="arrow-down-right"]')).toBeTruthy();
  });

  // 3d. 方向缺省时按 value 正负推断
  it('trend 未给 direction 时按 value 正负推断方向', () => {
    const { container } = render(<Stat value={1} trend={{ value: -3 }} />);
    const trend = container.querySelector(`.${styles['stat-trend']}`)!;
    expect(trend.querySelector('[data-icon="arrow-down-right"]')).toBeTruthy();
    expect(trend).toHaveClass(styles['stat-trend-negative']);
  });

  // 4. caption 副说明
  it('渲染 caption 副说明', () => {
    render(<Stat value={100} caption="vs previous 30 days" />);
    expect(screen.getByText('vs previous 30 days')).toBeInTheDocument();
  });

  // 5. 状态点：dot 图标 + 文案 + 语义色调类
  it('渲染状态点（dot 图标 + 文案 + 色调类）', () => {
    const { container } = render(
      <Stat value={0} status={{ text: '0 online', tone: 'success' }} />,
    );
    expect(screen.getByText('0 online')).toBeInTheDocument();
    const dot = container.querySelector('[data-icon="dot"]')!;
    expect(dot).toBeTruthy();
    expect(dot).toHaveClass(styles['stat-dot-success']);
  });

  it('状态点缺省 tone 走 neutral 色调类', () => {
    const { container } = render(
      <Stat value={0} status={{ text: '0 online' }} />,
    );
    expect(container.querySelector('[data-icon="dot"]')).toHaveClass(
      styles['stat-dot-neutral'],
    );
  });

  // 6. a11y 可及名：有 title 时整块 role=group + 可访问名 = 标签
  it('有 title 时整块为 role=group，可访问名 = 标签文案', () => {
    render(<Stat title="Unique Visitors" value={9600} />);
    expect(screen.getByRole('group')).toHaveAccessibleName('Unique Visitors');
  });

  // 6b. 无 title 时不强加 group role
  it('无 title 时不加 group role', () => {
    render(<Stat value={9600} />);
    expect(screen.queryByRole('group')).not.toBeInTheDocument();
  });

  // 7. 透传原生属性到根节点
  it('透传 className 与 data-* 到根节点', () => {
    const { container } = render(
      <Stat value={1} className="extra" data-testid="s" />,
    );
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass(styles.stat);
    expect(root).toHaveClass('extra');
    expect(root).toHaveAttribute('data-testid', 's');
  });
});

describe('StatGroup', () => {
  // 一排指标：每个子项裹一格；相邻格靠 CSS 发丝线分隔（结构上每项一格）
  it('把每个子项各裹一格（发丝线分隔靠相邻格 CSS）', () => {
    const { container } = render(
      <StatGroup>
        <Stat title="Total Visits" value={1200} />
        <Stat title="Views per Visit" value={3.4} precision={1} />
        <Stat title="Bounce Rate" value={42} suffix="%" />
      </StatGroup>,
    );
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass(styles.group);
    expect(root.querySelectorAll(`.${styles['group-item']}`).length).toBe(3);
    // 三个指标各自成组
    expect(screen.getAllByRole('group')).toHaveLength(3);
  });
});
