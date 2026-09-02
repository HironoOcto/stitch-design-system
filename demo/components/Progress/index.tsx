import { useState, type CSSProperties } from 'react';
import { Progress } from '@octohirono/stitch-design-system';

export const meta = {
  title: 'Progress',
  description:
    'accent 填充进度条 + 斜纹持续滚动的加载指示；size / infoPosition / format / duration 可配，percent 自动 clamp 0–100（对齐 Ant v5 format，源 animal 的 infoFormat 已归一）。源 animal 是写死品牌青双色斜纹 + 药丸 999px + 暖褐 inset 凹槽 + 反白 #fff 文字 + 低占比回退硬编码 #725d42——按 H2 全清：斜纹→accent/accent-hover、track 凹槽→中性 --stitch-bg-disabled（inset 深影丢，扁平靠 border）、圆角→--stitch-radius-input（随站点，不再固定药丸）、fill 内文字→--stitch-accent-text（seline 黑 / steep 白）。填充色随 accent 换肤、圆角随站点、文字字体随站点变化。',
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
const stack: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--stitch-spacing-lg)',
};

export default function ProgressDemo() {
  const [percent, setPercent] = useState(40);

  return (
    <div style={section}>
      <div>
        <p style={rowLabel}>Sizes</p>
        <div style={stack}>
          <Progress percent={30} size="small" aria-label="small 进度" />
          <Progress percent={60} size="middle" aria-label="middle 进度" />
          <Progress percent={90} size="large" aria-label="large 进度" />
        </div>
      </div>

      <div>
        <p style={rowLabel}>文字位置（infoPosition）</p>
        <div style={stack}>
          <Progress percent={70} infoPosition="inside" aria-label="内嵌文字" />
          <Progress
            percent={12}
            infoPosition="inside"
            aria-label="低占比回退到外侧"
          />
          <Progress percent={70} infoPosition="right" aria-label="右侧文字" />
          <Progress percent={70} infoPosition="top" aria-label="顶部文字" />
          <Progress percent={70} showInfo={false} aria-label="隐藏文字" />
        </div>
      </div>

      <div>
        <p style={rowLabel}>自定义格式（format）</p>
        <div style={stack}>
          <Progress
            percent={7}
            format={(p) => `${Math.round((p / 100) * 10)}/10 关`}
            aria-label="关卡进度"
          />
          <Progress percent={100} format={() => '完成'} aria-label="完成态" />
        </div>
      </div>

      <div>
        <p style={rowLabel}>受控切换（percent）</p>
        <div style={stack}>
          <Progress percent={percent} aria-label="受控进度" />
          <div
            style={{
              display: 'flex',
              gap: 'var(--stitch-spacing-sm)',
            }}
          >
            {[0, 25, 50, 75, 100].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setPercent(v)}
                style={{
                  padding: 'var(--stitch-spacing-xs) var(--stitch-spacing-md)',
                  border: '1px solid var(--stitch-border)',
                  borderRadius: 'var(--stitch-radius-button)',
                  background: 'var(--stitch-bg-elevated)',
                  color: 'var(--stitch-text-primary)',
                  cursor: 'pointer',
                }}
              >
                {v}%
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
