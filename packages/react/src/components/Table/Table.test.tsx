import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Table, type TableColumn } from './Table';
import styles from './table.module.less';

interface Row extends Record<string, unknown> {
  key: string;
  name: string;
  age: number;
}

const columns: TableColumn<Row>[] = [
  { title: 'Name', dataIndex: 'name' },
  { title: 'Age', dataIndex: 'age', align: 'right' },
];
// Table 的 columns 类型为非泛型 `TableColumn[]`，这里 cast 一下
const anyColumns = columns as unknown as Parameters<typeof Table>[0]['columns'];

const data: Row[] = [
  { key: '1', name: 'Alice', age: 20 },
  { key: '2', name: 'Bob', age: 30 },
];

describe('Table', () => {
  // 1. 基本渲染 —— 表头 + 行数据 + table 角色
  it('渲染表头与行数据，暴露 table 角色', () => {
    render(<Table columns={anyColumns} dataSource={data} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('showHeader=false 时不渲染表头', () => {
    render(<Table columns={anyColumns} dataSource={data} showHeader={false} />);
    expect(screen.queryByText('Name')).not.toBeInTheDocument();
    expect(screen.queryAllByRole('columnheader')).toHaveLength(0);
  });

  it('数据为空时显示 emptyText', () => {
    render(<Table columns={anyColumns} dataSource={[]} emptyText="无内容" />);
    expect(screen.getByText('无内容')).toBeInTheDocument();
  });

  // 2. props → class / 结构映射
  it('column.render 自定义单元格优先于 dataIndex', () => {
    const cols = [
      {
        title: 'Name',
        render: (_v: unknown, r: Row) => (
          <span data-testid={`r-${r.key}`}>{r.name}!</span>
        ),
      },
    ] as unknown as Parameters<typeof Table>[0]['columns'];
    render(<Table columns={cols} dataSource={data} />);
    expect(screen.getByTestId('r-1')).toHaveTextContent('Alice!');
  });

  it('striped 默认给偶数行加 striped 类，关闭后不加', () => {
    const { container, rerender } = render(
      <Table columns={anyColumns} dataSource={data} />,
    );
    let rows = container.querySelectorAll('tbody tr');
    expect(rows[0].className).not.toContain(styles.striped);
    expect(rows[1].className).toContain(styles.striped);

    rerender(<Table columns={anyColumns} dataSource={data} striped={false} />);
    rows = container.querySelectorAll('tbody tr');
    expect(rows[1].className).not.toContain(styles.striped);
  });

  it('rowClassName 字符串 / 函数都并入行类名', () => {
    const { container } = render(
      <Table
        columns={anyColumns}
        dataSource={data}
        rowClassName={(r) => `rc-${(r as Row).name}`}
      />,
    );
    const rows = container.querySelectorAll('tbody tr');
    expect(rows[0].className).toContain('rc-Alice');
    expect(rows[1].className).toContain('rc-Bob');
  });

  it('rowKey 为函数时仍渲染全部行', () => {
    const { container } = render(
      <Table
        columns={anyColumns}
        dataSource={data}
        rowKey={(r) => `row-${(r as Row).name}`}
      />,
    );
    expect(container.querySelectorAll('tbody tr')).toHaveLength(2);
  });

  // 3. 原生属性透传（className / style / data-* 经 ...rest 到容器）
  it('透传 className / style / data-* 到根容器', () => {
    const { container } = render(
      <Table
        columns={anyColumns}
        dataSource={data}
        className="my-tb"
        style={{ marginTop: 4 }}
        data-testid="tb-root"
      />,
    );
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass('my-tb');
    expect(root).toHaveClass(styles.wrapper);
    expect(root).toHaveStyle({ marginTop: '4px' });
    expect(root).toHaveAttribute('data-testid', 'tb-root');
  });

  // 4. 交互事件 —— onRow 透传行属性（点击）
  it('onRow 返回的属性透传到 <tr>（含 onClick）', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Table
        columns={anyColumns}
        dataSource={data}
        onRow={(record) => ({ onClick: () => onClick(record) })}
      />,
    );
    await user.click(screen.getByText('Alice'));
    expect(onClick).toHaveBeenCalledWith(data[0]);
  });

  // 5. 边界态 —— loading 叠加 overlay 且屏蔽指针
  it('loading 时叠加 loading 类与 status overlay', () => {
    const { container } = render(
      <Table columns={anyColumns} dataSource={data} loading />,
    );
    expect(container.querySelector('table')).toHaveClass(styles.loading);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAccessibleName('加载中');
  });

  // 6. 键盘操作 —— scroll 给定时容器为可聚焦滚动区（WCAG 2.1.1）
  it('scroll 给定 + aria-label：容器 Tab 可达、成命名 region', async () => {
    const user = userEvent.setup();
    render(
      <Table
        columns={anyColumns}
        dataSource={data}
        scroll={{ x: 800 }}
        aria-label="用户表"
      />,
    );
    const region = screen.getByRole('region', { name: '用户表' });
    expect(region).toHaveAttribute('tabindex', '0');
    await user.tab();
    expect(region).toHaveFocus();
  });

  it('未给 scroll 时容器不可聚焦、不挂 region', () => {
    const { container } = render(
      <Table columns={anyColumns} dataSource={data} aria-label="用户表" />,
    );
    const root = container.firstChild as HTMLElement;
    expect(root).not.toHaveAttribute('tabindex');
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });

  // 7. a11y 契约 —— 列头是 columnheader，可访问名来自 title
  it('表头单元格为 columnheader 且可访问名来自 title', () => {
    render(<Table columns={anyColumns} dataSource={data} />);
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(2);
    expect(headers[0]).toHaveAccessibleName('Name');
    expect(headers[1]).toHaveAccessibleName('Age');
  });
});
