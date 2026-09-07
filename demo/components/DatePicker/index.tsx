import { useState, type CSSProperties } from 'react';
import { DatePicker, type DateRange } from '@octohirono/stitch-design-system';

export const meta = {
  title: 'DatePicker',
  description:
    '日期选择器（Ant DatePicker / RangePicker 语义）：字段触发器 + 复用现有 Popover 弹出内联 Calendar（不另造浮层）。mode="single" 单日、mode="range" 范围（Jul 28 – Aug 26 的范围触发器）。allowClear 默认开、走 <Icon name="close">；日历图标与翻月箭头一律经 <Icon>。取值 value/defaultValue/onChange 与浮层 open/onOpenChange 各自受控/非受控双模式；字段结构靠 --stitch-border + --stitch-radius-input，选中/范围底色由内层 Calendar 承载。',
};

const section: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--stitch-spacing-xl)',
  maxWidth: 640,
};
const rowLabel: CSSProperties = {
  fontSize: 'var(--stitch-font-size-sm)',
  color: 'var(--stitch-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  margin: '0 0 var(--stitch-spacing-md)',
};
const row: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--stitch-spacing-xl)',
  alignItems: 'center',
};

const SEP = new Date(2026, 8, 1);

function ControlledSingle() {
  const [value, setValue] = useState<Date | undefined>(new Date(2026, 8, 12));
  return (
    <div style={row}>
      <DatePicker
        value={value}
        onChange={(v) => setValue(v as Date | undefined)}
        defaultPickerValue={SEP}
        aria-label="受控日期"
      />
      <span style={{ ...rowLabel, margin: 0 }}>
        已选：{value?.toLocaleDateString() ?? '—'}
      </span>
    </div>
  );
}

export default function DatePickerDemo() {
  return (
    <div style={section}>
      <section>
        <p style={rowLabel}>单日（非受控 + 占位）</p>
        <div style={row}>
          <DatePicker
            defaultPickerValue={SEP}
            placeholder="选择日期"
            aria-label="单日选择"
          />
        </div>
      </section>

      <section>
        <p style={rowLabel}>范围（RangePicker，起 – 止）</p>
        <div style={row}>
          <DatePicker
            mode="range"
            defaultPickerValue={SEP}
            defaultValue={
              {
                from: new Date(2026, 8, 10),
                to: new Date(2026, 8, 16),
              } as DateRange
            }
            placeholder={['开始日期', '结束日期']}
            aria-label="日期范围"
          />
        </div>
      </section>

      <section>
        <p style={rowLabel}>尺寸（small / middle / large）</p>
        <div style={row}>
          <DatePicker size="small" defaultPickerValue={SEP} aria-label="小号" />
          <DatePicker
            size="middle"
            defaultPickerValue={SEP}
            aria-label="中号"
          />
          <DatePicker size="large" defaultPickerValue={SEP} aria-label="大号" />
        </div>
      </section>

      <section>
        <p style={rowLabel}>校验态 / 禁用 / 不可清除</p>
        <div style={row}>
          <DatePicker
            status="error"
            defaultValue={new Date(2026, 8, 3)}
            defaultPickerValue={SEP}
            aria-label="错误态"
          />
          <DatePicker
            status="warning"
            defaultValue={new Date(2026, 8, 3)}
            defaultPickerValue={SEP}
            aria-label="警告态"
          />
          <DatePicker
            disabled
            defaultValue={new Date(2026, 8, 3)}
            aria-label="禁用"
          />
          <DatePicker
            allowClear={false}
            defaultValue={new Date(2026, 8, 3)}
            defaultPickerValue={SEP}
            aria-label="不可清除"
          />
        </div>
      </section>

      <section>
        <p style={rowLabel}>受控（value / onChange）</p>
        <ControlledSingle />
      </section>
    </div>
  );
}
