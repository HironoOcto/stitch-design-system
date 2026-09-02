import type { CSSProperties } from 'react';
import { Table, Tag, type TableColumn } from '@octohirono/stitch-design-system';

export const meta = {
  title: 'Table',
  description:
    '数据表（Ant Table columns/dataSource 语义）：列定义 + 数据源 + rowKey/striped/showHeader/rowClassName/onRow/loading/emptyText/scroll。纯展示件（源 animal 即无排序/选择，不臆造）。源的暖奶油底 + 药丸圆角 + 虚线金分隔 + hover 品牌青斜纹气泡 + 裸 svg 图标全丢；分隔改发丝实线、hover/斑马走中性表面层、圆角与色彩随换肤变化。scroll 给定时容器成可键盘聚焦滚动区。',
};

const rowLabel: CSSProperties = {
  fontSize: 'var(--stitch-font-size-sm)',
  color: 'var(--stitch-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  margin: '0 0 var(--stitch-spacing-md)',
};
const section: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--stitch-spacing-xl)',
  maxWidth: 720,
};

interface User extends Record<string, unknown> {
  key: string;
  name: string;
  role: string;
  status: 'active' | 'invited';
  score: number;
}

const users: User[] = [
  { key: '1', name: 'Alice Chen', role: '设计', status: 'active', score: 92 },
  { key: '2', name: 'Bob Liu', role: '前端', status: 'invited', score: 76 },
  { key: '3', name: 'Carol Wang', role: '产品', status: 'active', score: 88 },
  { key: '4', name: 'David Zhao', role: '后端', status: 'invited', score: 64 },
];

const columns: TableColumn<User>[] = [
  { title: '姓名', dataIndex: 'name' },
  { title: '职能', dataIndex: 'role' },
  {
    title: '状态',
    dataIndex: 'status',
    render: (v) => (
      <Tag color={v === 'active' ? 'success' : 'info'}>
        {v === 'active' ? '在职' : '已邀请'}
      </Tag>
    ),
  },
  { title: '评分', dataIndex: 'score', align: 'right' },
];
// Table 的 columns 类型为非泛型 TableColumn[]
const cols = columns as unknown as TableColumn[];

export default function TableDemo() {
  return (
    <div style={section}>
      <div>
        <p style={rowLabel}>默认 · 斑马纹 + 自定义单元格（Tag）+ 右对齐列</p>
        <Table columns={cols} dataSource={users} />
      </div>

      <div>
        <p style={rowLabel}>可点击行（onRow）· 关闭斑马纹</p>
        <Table
          columns={cols}
          dataSource={users}
          striped={false}
          onRow={(record) => ({
            style: { cursor: 'pointer' },
            onClick: () => alert(`点击了 ${(record as User).name}`),
          })}
        />
      </div>

      <div>
        <p style={rowLabel}>可横向滚动（scroll → 可键盘聚焦滚动区）</p>
        <Table
          columns={cols}
          dataSource={users}
          scroll={{ x: 900 }}
          aria-label="用户表（可滚动）"
        />
      </div>

      <div>
        <p style={rowLabel}>加载态（overlay + spinner）</p>
        <Table columns={cols} dataSource={users} loading />
      </div>

      <div>
        <p style={rowLabel}>空数据（emptyText）</p>
        <Table columns={cols} dataSource={[]} emptyText="暂无用户" />
      </div>
    </div>
  );
}
