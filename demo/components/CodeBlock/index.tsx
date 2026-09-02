import type { CSSProperties } from 'react';
import { CodeBlock } from '@octohirono/stitch-design-system';

export const meta = {
  title: 'CodeBlock',
  description:
    '只读代码块：暗色表面 + 轻量 JSX/TS 语法高亮。Tab 可聚焦、方向键滚动，默认可及名「代码块」（aria-label 可覆盖）。源 animal 的品牌写死值已清：暗底 #2b2118 → --stitch-bg-inverted、反白正文 #e8d5bc → --stitch-text-on-dark、药丸 20px 圆角 → --stitch-radius-card、等宽字体 → --stitch-font-mono。语法高亮 11 色装饰盘在契约里对不上任何角色 → interim 复用分类色槽 --stitch-cat-*（token 类型 = 互相区分的分类，刻意避开两站的深值 cat-4/cat-2 以免暗面隐形），换肤 seline↔steep 时 token 颜色随之变化。详见根 迁移笔记.md。',
};

const section: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--stitch-spacing-xl)',
  maxWidth: 760,
};
const rowLabel: CSSProperties = {
  fontSize: 'var(--stitch-font-size-sm)',
  color: 'var(--stitch-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  margin: '0 0 var(--stitch-spacing-md)',
};

const jsxSample = `// 一个计数器组件
import React, { useState } from 'react';

interface Props {
  initial?: number;
}

export const Counter: React.FC<Props> = ({ initial = 0 }) => {
  const [count, setCount] = useState(initial);
  return (
    <button type="button" onClick={() => setCount(count + 1)}>
      点击 {count} 次
    </button>
  );
};`;

const tsSample = `const total = items
  .filter((it) => it.active === true)
  .reduce((sum, it) => sum + it.price, 0);

/* 折扣：满 100 减 20 */
const final = total >= 100 ? total - 20 : total;`;

export default function CodeBlockDemo() {
  return (
    <div style={section}>
      <div>
        <p style={rowLabel}>JSX / TSX 高亮</p>
        <CodeBlock code={jsxSample} aria-label="计数器组件示例" />
      </div>

      <div>
        <p style={rowLabel}>TS 表达式高亮</p>
        <CodeBlock code={tsSample} aria-label="折扣计算示例" />
      </div>

      <div>
        <p style={rowLabel}>单行 / 空内容</p>
        <CodeBlock code="const answer = 42;" aria-label="单行示例" />
      </div>
    </div>
  );
}
