import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Table, type TableColumn } from './Table';

interface Row extends Record<string, unknown> {
  key: string;
  name: string;
  age: number;
}

const columns: TableColumn<Row>[] = [
  { title: 'Name', dataIndex: 'name' },
  { title: 'Age', dataIndex: 'age', align: 'right' },
];
const anyColumns = columns as unknown as Parameters<typeof Table>[0]['columns'];

const data: Row[] = [
  { key: '1', name: 'Alice', age: 20 },
  { key: '2', name: 'Bob', age: 30 },
];

describe('Table a11y', () => {
  it('常规表格无 axe 违规', async () => {
    const { container } = render(
      <Table columns={anyColumns} dataSource={data} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('空态无 axe 违规', async () => {
    const { container } = render(
      <Table columns={anyColumns} dataSource={[]} emptyText="暂无数据" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('可滚动命名 region + loading 遮罩无 axe 违规', async () => {
    const { container } = render(
      <Table
        columns={anyColumns}
        dataSource={data}
        scroll={{ x: 800 }}
        aria-label="用户表"
        loading
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
