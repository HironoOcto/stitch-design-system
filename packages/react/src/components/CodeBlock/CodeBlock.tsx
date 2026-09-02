// 1. React 及其生态
import React from 'react';
import clsx from 'clsx';

// 3. 样式（永远最后）
import styles from './codeblock.module.less';

/** 语法高亮 token 类型（对应 codeblock.module.less 的 .tok-* class） */
type TokenType =
  | 'comment'
  | 'string'
  | 'keyword'
  | 'react'
  | 'component'
  | 'func'
  | 'prop'
  | 'jsx'
  | 'operator'
  | 'number'
  | 'default';

const TOKEN_CLASS: Record<TokenType, string> = {
  comment: styles['tok-comment']!,
  string: styles['tok-string']!,
  keyword: styles['tok-keyword']!,
  react: styles['tok-react']!,
  component: styles['tok-component']!,
  func: styles['tok-func']!,
  prop: styles['tok-prop']!,
  jsx: styles['tok-jsx']!,
  operator: styles['tok-operator']!,
  number: styles['tok-number']!,
  default: styles['tok-default']!,
};

/**
 * 轻量 JSX / TS 语法高亮：正则分词 → 不重叠的高亮片段。
 * 纯前端展示用途，非完整解析器；token 颜色由 .tok-* class 的角色变量决定（随换肤变色）。
 */
const highlightJSX = (code: string): React.ReactNode[] => {
  const tokens: { start: number; end: number; type: TokenType }[] = [];

  const addPattern = (regex: RegExp, type: TokenType) => {
    let match;
    const re = new RegExp(
      regex.source,
      regex.flags.includes('g') ? regex.flags : regex.flags + 'g',
    );
    while ((match = re.exec(code)) !== null) {
      tokens.push({
        start: match.index,
        end: match.index + match[0].length,
        type,
      });
    }
  };

  addPattern(/\/\*[\s\S]*?\*\//g, 'comment');
  addPattern(/\/\/.*$/gm, 'comment');
  addPattern(/`[^`]*`/g, 'string');
  addPattern(/"[^"]*"/g, 'string');
  addPattern(/'[^']*'/g, 'string');
  addPattern(/<\/?[A-Z][\w.$]*/g, 'jsx');
  addPattern(/<\/?[a-z][\w-]*/g, 'jsx');
  addPattern(/\/?>/g, 'jsx');
  addPattern(
    /\b(React|useState|useEffect|useCallback|useMemo|useRef|useContext|useReducer|useLayoutEffect|useImperativeHandle|useDebugValue|createContext|createElement|cloneElement|Fragment|Suspense|lazy|memo|forwardRef|useId|FC|ReactNode|ReactElement|CSSProperties)\b/g,
    'react',
  );
  addPattern(/\b(true|false)\b/g, 'keyword');
  addPattern(/\b(null|undefined|void|NaN|Infinity)\b/gi, 'keyword');
  addPattern(/\b\d+\.?\d*\b/g, 'number');
  addPattern(
    /\b(import|from|as|export|default|const|let|var|function|return|if|else|for|while|switch|case|break|continue|try|catch|throw|finally|new|typeof|instanceof|async|await|type|interface)\b/gi,
    'keyword',
  );
  addPattern(/\b[A-Z][a-zA-Z0-9_$]*\b/g, 'component');
  addPattern(/\b[a-z][a-zA-Z0-9_$]*\s*(?=\()/g, 'func');
  addPattern(/\b[a-zA-Z_$][\w$]*\s*(?==)/g, 'prop');
  addPattern(/>|===|!==|==|!=|<=|>=|&&|\|\||[+\-*/%=<>!&|^~?:]/g, 'operator');
  addPattern(/[{}[\]();,]/g, 'operator');

  tokens.sort((a, b) => a.start - b.start);

  const result: React.ReactNode[] = [];
  let pos = 0;

  for (const token of tokens) {
    if (token.start < pos) continue;

    if (token.start > pos) {
      result.push(
        <span key={`t${pos}`} className={TOKEN_CLASS.default}>
          {code.slice(pos, token.start)}
        </span>,
      );
    }

    result.push(
      <span key={`s${token.start}`} className={TOKEN_CLASS[token.type]}>
        {code.slice(token.start, token.end)}
      </span>,
    );
    pos = token.end;
  }

  if (pos < code.length) {
    result.push(
      <span key={`e${pos}`} className={TOKEN_CLASS.default}>
        {code.slice(pos)}
      </span>,
    );
  }

  return result;
};

export interface CodeBlockProps extends React.HTMLAttributes<HTMLPreElement> {
  /** 要展示 / 高亮的源代码 */
  code: string;
}

/**
 * 只读代码块：暗色表面 + 轻量语法高亮。
 * 可用 Tab 聚焦、方向键滚动（`tabIndex=0` 的可滚动区域）；默认可及名「代码块」，可用 `aria-label` 覆盖。
 */
export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  className,
  ...rest
}) => (
  <pre
    role="group"
    aria-label="代码块"
    tabIndex={0}
    className={clsx(styles.codeBlock, className)}
    {...rest}
  >
    {highlightJSX(code)}
  </pre>
);

CodeBlock.displayName = 'CodeBlock';
