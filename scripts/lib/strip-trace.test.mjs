// node --test — stripTrace behavior (issue #34).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stripTrace } from './strip-trace.mjs';

test('strips a section-heading ← trace trailer, keeps the title', () => {
  const src = [
    '# T',
    '',
    '## 一句话风格 ← DESIGN.md 顶部 tagline + 概览散文',
    'body',
  ].join('\n');
  const out = stripTrace(src);
  assert.match(out, /^## 一句话风格$/m);
  assert.doesNotMatch(out, /←/);
  assert.doesNotMatch(out, /DESIGN\.md/);
  assert.match(out, /^body$/m); // untouched
});

test('strips a <!-- trace … --> container whole (single + multi-line)', () => {
  const src = [
    '# T',
    '',
    '<!-- trace: 从 `sites/x/source/DESIGN.md` 抽取；每节标题 ← 尾注标来源。 -->',
    '',
    '> 值层见同目录 `tokens.css`。',
    '',
    '<!-- trace:',
    '多行追溯容器，提到 DESIGN.md 也无妨',
    '-->',
    'end',
  ].join('\n');
  const out = stripTrace(src);
  assert.doesNotMatch(out, /<!--/);
  assert.doesNotMatch(out, /DESIGN\.md/);
  assert.match(out, /值层见同目录/); // kept guidance survives
  assert.match(out, /^end$/m);
});

test('leaves non-trace HTML comments alone', () => {
  const src = '# T\n<!-- SLOT:default-site -->\nbody';
  assert.match(stripTrace(src), /<!-- SLOT:default-site -->/);
});

test('THROWS on a body-prose DESIGN.md (unstrippable position), naming the line', () => {
  const src = [
    '# T',
    '## 组件规格 ← Components 段（verbatim 抄 DESIGN.md）', // strippable → fine
    '- 其余见 DESIGN.md「Components」原文。', // body prose → must throw
  ].join('\n');
  assert.throws(
    () => stripTrace(src, { label: 'sites/seline/rules.md' }),
    (e) => {
      assert.match(e.message, /DESIGN\.md/);
      assert.match(e.message, /sites\/seline\/rules\.md/); // label
      assert.match(e.message, /源第 3 行/); // source line number of the residual
      assert.match(e.message, /其余见/); // the offending content
      return true;
    },
  );
});

test('idempotent: stripTrace(stripTrace(x)) === stripTrace(x)', () => {
  const src = [
    '# T',
    '<!-- trace: 从 `sites/x/source/DESIGN.md` 抽取。 -->',
    '> 值层见同目录 `tokens.css`。',
    '## 一句话风格 ← DESIGN.md tagline',
    'body ← 正文里的箭头不该被当尾注剥', // non-heading ← must survive
  ].join('\n');
  const once = stripTrace(src);
  assert.equal(stripTrace(once), once);
  assert.match(once, /body ← 正文里的箭头/); // only heading trailers stripped
});
