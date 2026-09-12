// 图表图例标签（dataviz 私有原语——不进桶导出/族表/demo）。
//
// recharts `<Legend>` 默认把每一项的**文字也染成系列色**；系列色来自分类槽 `var(--stitch-cat-*)`，
// 本是「色块 / 填充色」——当文字画在白底上时可能不可读（鲜艳/极淡分类色对白底对比可低至约 1:1）。
// 落库原则：分类色是「色块 / 填充色」，永不当「文字色」。
// 故图例文字经本 helper 统一拉成中性墨色 `var(--stitch-text-primary)`（H2：只读角色变量、不落 hex）；
// 颜色仍由色卡（recharts 默认 = 系列色）承载不变——分类靠「色卡 + 文字」双通道（守 WCAG 1.4.1）。
//
// 用法（Pie / Bar）：`<Legend formatter={renderLegendLabel} />`——recharts 逐项调用
// `formatter(value, entry, index)`，此处只用标签文本 `value`，其余参数忽略。
//
// 1. React 及其生态
import React from 'react';

/**
 * recharts `<Legend formatter>` 用的标签渲染器：把图例**文字**裹成中性墨色
 * `var(--stitch-text-primary)`，不吃系列色（色卡色另由 recharts 默认承载，不在此）。
 */
export const renderLegendLabel = (
  value: React.ReactNode,
): React.ReactElement => (
  <span style={{ color: 'var(--stitch-text-primary)' }}>{value}</span>
);
