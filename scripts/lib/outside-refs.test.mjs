// node --test — scanOutsideRefs behavior (issue #34, check:boundary 边界守).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scanOutsideRefs, OUTSIDE_REF_SEEDS } from './outside-refs.mjs';

test('flags每 seed（DESIGN.md/docs//scripts//CONTEXT/source//ADR + 孪生横指 adapter.css/variables.css/见 adapter）', () => {
  const text = [
    '见 sites/x/source/DESIGN.md 原文', // DESIGN.md + source/
    '生成逻辑记在 docs/contributing/foo.md', // docs/
    '跑 scripts/build.mjs', // scripts/
    '决策见 ADR 0003', // ADR
    '根 CONTEXT 词汇表', // CONTEXT
    '见 adapter.css --stitch-accent-text', // adapter.css + 见 adapter（孪生横指）
    'verbatim 抄 variables.css', // variables.css
    '（见 adapter font-size）', // 见 adapter（无 .css 也拦）
    '干净的一行：值层见同目录 tokens.css', // clean
  ].join('\n');
  const hits = scanOutsideRefs(text);
  const labels = new Set(hits.map((h) => h.label));
  for (const [label] of OUTSIDE_REF_SEEDS) assert.ok(labels.has(label), label);
  assert.ok(!hits.some((h) => h.line === 9), 'clean line must not be flagged');
});

test('whitelist masks a permitted reference — even one containing a seed', () => {
  const text = [
    '指针 .agent/stitch.theme.json 的 activeSite', // permitted
    'docs/allowed.md 允许', // whitelisted below (contains seed docs/)
    'docs/other.md 不允许', // still flagged
  ].join('\n');
  const hits = scanOutsideRefs(text, {
    whitelist: ['.agent/stitch.theme.json', 'docs/allowed.md'],
  });
  assert.ok(!hits.some((h) => h.line === 1), '.agent path exempt');
  assert.ok(
    !hits.some((h) => h.line === 2),
    'whitelisted docs/allowed.md exempt',
  );
  assert.ok(
    hits.some((h) => h.line === 3 && h.label === 'docs/'),
    'other docs/ flagged',
  );
});
