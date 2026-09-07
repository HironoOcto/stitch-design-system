import { useState, type CSSProperties } from 'react';
import { Calendar, type DateRange } from '@octohirono/stitch-design-system';

export const meta = {
  title: 'Calendar',
  description:
    '内联日历网格（react-day-picker 引擎）：一次支持单选（mode="single"）与范围（mode="range"）；方向键导航 + ARIA grid 由引擎兜底，翻月箭头走 <Icon>。只读角色变量：选中日 --stitch-accent + --stitch-accent-text，范围中段 --stitch-bg-accent，今天/hover/禁用走 border-strong / bg-card / text-disabled。受控（value/onChange）与非受控（defaultValue）双模式。',
};

const section: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--stitch-spacing-xl)',
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
  alignItems: 'flex-start',
};

const SEP = new Date(2026, 8, 1);

function ControlledRange() {
  const [range, setRange] = useState<DateRange | undefined>({
    from: new Date(2026, 8, 10),
    to: new Date(2026, 8, 16),
  });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Calendar
        mode="range"
        defaultMonth={SEP}
        value={range}
        onChange={(v) => setRange(v as DateRange | undefined)}
        aria-label="受控范围日历"
      />
      <p style={{ ...rowLabel, margin: 0 }}>
        已选：{range?.from?.toLocaleDateString() ?? '—'} →{' '}
        {range?.to?.toLocaleDateString() ?? '—'}
      </p>
    </div>
  );
}

export default function CalendarDemo() {
  return (
    <div style={section}>
      <section>
        <p style={rowLabel}>单选（mode="single"，非受控）</p>
        <div style={row}>
          <Calendar
            defaultMonth={SEP}
            defaultValue={new Date(2026, 8, 12)}
            aria-label="单选日历"
          />
        </div>
      </section>

      <section>
        <p style={rowLabel}>范围（mode="range"，受控）</p>
        <div style={row}>
          <ControlledRange />
        </div>
      </section>

      <section>
        <p style={rowLabel}>逐日禁用（周末不可选）</p>
        <div style={row}>
          <Calendar
            defaultMonth={SEP}
            disabledDate={(d) => d.getDay() === 0 || d.getDay() === 6}
            aria-label="禁用周末"
          />
        </div>
      </section>

      <section>
        <p style={rowLabel}>整块禁用（disabled）</p>
        <div style={row}>
          <Calendar
            defaultMonth={SEP}
            defaultValue={new Date(2026, 8, 12)}
            disabled
            aria-label="整块禁用日历"
          />
        </div>
      </section>

      <section>
        <p style={rowLabel}>静态标题（captionLayout="label"，不可点选年月）</p>
        <div style={row}>
          <Calendar
            defaultMonth={SEP}
            captionLayout="label"
            aria-label="静态标题日历"
          />
        </div>
      </section>
    </div>
  );
}
