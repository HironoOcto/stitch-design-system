// node --test — extractPropsInterfaces: verbatim text + main-interface JSDoc note.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Project } from 'ts-morph';
import { extractPropsInterfaces } from './props.mjs';

/** In-memory source file → interfaces, no tsconfig needed. */
function ifacesOf(code, componentName) {
  const p = new Project({ useInMemoryFileSystem: true });
  const sf = p.createSourceFile(`${componentName}.tsx`, code);
  return extractPropsInterfaces(sf, componentName);
}

test('main-interface top JSDoc → note (cross-prop prose), not in verbatim text', () => {
  const out = ifacesOf(
    [
      '/**',
      ' * 跨-prop 注意事项：文字色与面色分离，保证可读 ≥AA。',
      ' * 可聚焦时焦点环走角色变量。',
      ' */',
      'export interface CardProps {',
      '  /** 表面处理 */',
      '  variant?: string;',
      '}',
    ].join('\n'),
    'Card',
  );
  const main = out.find((i) => i.main);
  assert.ok(main, 'main interface present');
  // note carries the interface-level JSDoc prose, trimmed.
  assert.match(main.note, /文字色与面色分离/);
  assert.match(main.note, /焦点环/);
  // verbatim text keeps per-prop field JSDoc but NOT the top interface JSDoc
  // (so §5 props==source stays byte-stable and the note never duplicates).
  assert.match(main.text, /\/\*\* 表面处理 \*\//);
  assert.doesNotMatch(main.text, /文字色与面色分离/);
});

test('no top JSDoc → note is empty string (never renders a stray note)', () => {
  const out = ifacesOf(
    ['export interface BadgeProps {', '  tone?: string;', '}'].join('\n'),
    'Badge',
  );
  assert.equal(out.find((i) => i.main).note, '');
});

test('imperative faces: *Config / *Static extracted across files; @internal *Props skipped; face carries note', () => {
  const p = new Project({ useInMemoryFileSystem: true });
  // NotificationConfig lives in types.ts, NotificationStatic in the portal file,
  // and the internal view NotificationViewProps is @internal → non-public surface.
  p.createSourceFile(
    'Notification/types.ts',
    'export interface NotificationConfig {\n  /** title */\n  message: string;\n}',
  );
  p.createSourceFile(
    'Notification/Notification.tsx',
    [
      '/** @internal */',
      'export interface NotificationViewProps {',
      '  item: number;',
      '}',
    ].join('\n'),
  );
  p.createSourceFile(
    'Notification/NotificationPortal.tsx',
    [
      '/**',
      ' * Imperative API, not a JSX component — antd-style static methods.',
      ' */',
      'export interface NotificationStatic {',
      '  success(config: NotificationConfig | string): void;',
      '}',
    ].join('\n'),
  );
  const out = extractPropsInterfaces(p.getSourceFiles(), 'Notification');
  const names = out.map((i) => i.name);
  assert.ok(names.includes('NotificationConfig'), 'Config extracted');
  assert.ok(names.includes('NotificationStatic'), 'Static extracted');
  assert.ok(!names.includes('NotificationViewProps'), '@internal view skipped');
  // an imperative face surfaces its leading JSDoc as a note (there is no <X>Props main).
  const stat = out.find((i) => i.name === 'NotificationStatic');
  assert.match(stat.note, /not a JSX component/i);
  // verbatim config text keeps its per-field JSDoc.
  assert.match(
    out.find((i) => i.name === 'NotificationConfig').text,
    /\/\*\* title \*\//,
  );
});
