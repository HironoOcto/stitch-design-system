import type { CSSProperties } from 'react';
import { Stat, StatGroup } from '@octohirono/stitch-design-system';

export const meta = {
  title: 'Stat',
  description:
    '主状态 / 指标块（data-viz 族，纯 markup + CSS + Icon，不走 recharts）：借 Ant Statistic 的 title / value / precision / prefix / suffix / formatter / groupSeparator 覆盖 $695、9m 13s、42% 等格式。trend 涨/跌方向经 <Icon> 对角箭头出、好/坏语义色只走 var(--stitch-success) / var(--stitch-danger)，trendReversed 反转开关给「跌是好事」的指标（如 Bounce Rate）翻转配色。caption 副说明 + status 状态点（<Icon name="dot"> 点色走角色变量 + 文案）。StatGroup 把一排指标用发丝线 var(--stitch-border) 分隔。',
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
  maxWidth: 760,
};

export default function StatDemo() {
  return (
    <div style={section}>
      <div>
        <p style={rowLabel}>
          一排指标 · StatGroup 发丝线分隔（仪表盘顶部指标行）
        </p>
        <StatGroup>
          <Stat title="Total Visits" value={124573} />
          <Stat title="Views per Visit" value={3.4} precision={1} />
          <Stat
            title="Bounce Rate"
            value={42}
            suffix="%"
            trend={{ value: 5, direction: 'down' }}
            trendReversed
          />
          <Stat title="Avg. Duration" value="9m 13s" />
        </StatGroup>
      </div>

      <div>
        <p style={rowLabel}>主指标大块 · 趋势（涨=success）+ 副说明 + 状态点</p>
        <Stat
          title="Unique Visitors"
          value={9600}
          trend={{ value: 12, direction: 'up' }}
          caption="vs previous 30 days"
          status={{ text: '128 online', tone: 'success' }}
        />
      </div>

      <div>
        <p style={rowLabel}>
          货币 · prefix $ + 千分位 + 精度 + 趋势下跌（danger）
        </p>
        <Stat
          title="Revenue"
          value={695432.5}
          prefix="$"
          precision={2}
          trend={{ value: 8, direction: 'down' }}
          caption="vs previous 30 days"
        />
      </div>

      <div>
        <p style={rowLabel}>自定义 formatter · status 中性点</p>
        <Stat
          title="Server Status"
          value={0}
          formatter={(v) => `${v} incidents`}
          status={{ text: '0 online' }}
        />
      </div>

      <div>
        <p style={rowLabel}>
          status 全语义色调（点色走角色变量：neutral / success / warning / info
          / danger）
        </p>
        <StatGroup>
          <Stat
            title="Uptime"
            value={99.98}
            precision={2}
            suffix="%"
            status={{ text: 'operational', tone: 'success' }}
          />
          <Stat
            title="Queue"
            value={1280}
            status={{ text: 'elevated', tone: 'warning' }}
          />
          <Stat
            title="Deploy"
            value="v2.4.1"
            status={{ text: 'rolling out', tone: 'info' }}
          />
          <Stat
            title="Errors"
            value={3}
            status={{ text: 'investigating', tone: 'danger' }}
          />
        </StatGroup>
      </div>
    </div>
  );
}
